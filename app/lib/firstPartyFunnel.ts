/**
 * Eigenes Trichter-Tracking neben GA4 (elanagency/myhb-os#521, aus #271).
 *
 * Die Trichter-Ereignisse gehen zusaetzlich an die Edge Function `track-funnel`
 * der App-Datenbank und landen minutenaktuell in `public.funnel_events`. GA4
 * liefert den laufenden Tag erst am naechsten Morgen vollstaendig und verliert
 * Besucher mit Werbeblocker.
 *
 * Der Arm kommt beim Senden aus dem Cookie `myhb_ab_booking`, nicht aus der
 * Datenschicht — damit misst diese Kette nicht den Fehler aus #161 mit, bei
 * dem A/B-Werte eines frueheren Ereignisses am naechsten kleben.
 *
 * Die Sitzungskennung ist zufaellig und haengt an keiner Person. Sie geht als
 * `fp_sid` an das App-Buchungsfenster (useAppBookingDialog), damit Klick hier
 * und Schritte dort zur selben Sitzung gehoeren. Fire-and-forget.
 */
import { readAbBucket, readAbSource, type AbSource, type BookingVariant } from "~/lib/bookingAbTest";

const ENDPUNKT = "https://forgsirmbzkxbblepscr.supabase.co/functions/v1/track-funnel";
const SID_KEY = "mhb_fp_sid";

/**
 * Seit Calendly abgeschaltet ist (13.11.2026) meldet der Store nur noch Klick
 * und Standortwahl; Uhrzeit und Buchung meldet die App selbst an
 * `funnel_events` (`slot_selected`, `booking_confirmed`).
 */
const GESPIEGELT = new Set(["click_booking", "booking_location_selected"]);

let sidImSpeicher: string | undefined;

/**
 * Arm und Quelle, wenn kein Cookie da ist. Seit dem Ende des A/B-Tests
 * (07.10.2026, #281) bucht jeder ueber die App, auch ohne
 * Marketing-Einwilligung — dann gibt es aber kein Cookie, und Klicks liefen
 * ohne `ab_source` ein: ads (go.) und seo (www) waren nicht mehr zu trennen.
 * Das Deployment ist keine Angabe ueber die Person; plugins/ab-split setzt es.
 */
let standard: { variant?: BookingVariant; source?: AbSource } = {};

export function setFunnelDefaults(werte: { variant?: BookingVariant; source?: AbSource }): void {
  standard = werte;
}

const neueSid = (): string => {
  try {
    return crypto.randomUUID().replace(/-/g, "");
  } catch {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
  }
};

export function getFunnelSessionId(): string {
  if (sidImSpeicher) return sidImSpeicher;
  try {
    const gespeichert = sessionStorage.getItem(SID_KEY);
    if (gespeichert) return (sidImSpeicher = gespeichert);
    const neu = neueSid();
    sessionStorage.setItem(SID_KEY, neu);
    return (sidImSpeicher = neu);
  } catch {
    return (sidImSpeicher = neueSid());
  }
}

const text = (v: unknown): string | undefined =>
  typeof v === "string" && v ? v : undefined;

/** Spiegelt ein Datenschicht-Ereignis, wenn es zum Trichter gehoert. */
export function mirrorFunnelEvent(payload: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const dlEvent = text(payload.event);
  if (!dlEvent) return;
  const event = dlEvent;
  if (!GESPIEGELT.has(event)) return;
  try {
    const body = JSON.stringify({
      event,
      surface: "store",
      session_id: getFunnelSessionId(),
      client_at: new Date().toISOString(),
      page_path: window.location.pathname,
      ab_variant: readAbBucket() ?? standard.variant,
      ab_source: readAbSource() ?? standard.source,
      booking_type: text(payload.booking_type),
      ab_fallback: payload.ab_fallback === true,
      ab_bypass: payload.ab_bypass === true,
      event_id: text(payload.event_id),
      location: text(payload.location_slug) ?? text(payload.location),
      embedded: typeof payload.embedded === "boolean" ? payload.embedded : undefined,
      cta_location: text(payload.cta_location),
      treatment_category: text(payload.treatment_type),
    });
    // text/plain: kein CORS-Preflight; keepalive: kommt auch beim Verlassen an.
    void fetch(ENDPUNKT, {
      method: "POST",
      body,
      keepalive: true,
      headers: { "Content-Type": "text/plain" },
    }).catch(() => undefined);
  } catch {
    // Tracking darf nie werfen.
  }
}
