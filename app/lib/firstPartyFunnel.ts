/**
 * Eigenes Trichter-Tracking neben GA4 (elanagency/myhb-os#521, aus #271).
 *
 * Die Ereignisse, die der A/B-Vergleich App gegen Calendly braucht, gehen
 * zusaetzlich an die Edge Function `track-funnel` der App-Datenbank und landen
 * minutenaktuell in `public.funnel_events`. GA4 liefert den laufenden Tag erst
 * am naechsten Morgen vollstaendig, verliert Calendly-Buchungen (#131) und
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
import { readAbBucket, readAbSource } from "~/lib/bookingAbTest";

const ENDPUNKT = "https://forgsirmbzkxbblepscr.supabase.co/functions/v1/track-funnel";
const SID_KEY = "mhb_fp_sid";

const GESPIEGELT = new Set([
  "ab_assigned",
  "click_booking",
  "booking_location_selected",
  "booking_confirmed",
]);

let sidImSpeicher: string | undefined;

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
  const event = text(payload.event);
  if (!event || !GESPIEGELT.has(event)) return;
  try {
    const body = JSON.stringify({
      event,
      surface: "store",
      session_id: getFunnelSessionId(),
      client_at: new Date().toISOString(),
      page_path: window.location.pathname,
      // ab_assigned traegt den frisch gezogenen Arm selbst; sonst gilt das Cookie.
      ab_variant: event === "ab_assigned" ? text(payload.ab_variant) : readAbBucket(),
      ab_source: event === "ab_assigned" ? text(payload.ab_source) : readAbSource(),
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
