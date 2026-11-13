/**
 * Buchungsziel und Arm-Cookie (frueher A/B-Split Calendly vs. App, #100).
 *
 * Der Split ist seit 07.10.2026 beendet, Calendly seit 13.11.2026
 * abgeschaltet: Gebucht wird nur noch ueber die App. Was hier bleibt:
 *
 * - `resolveAppOnlyTarget`: Ziel eines Buchungsknopfs — die `appBookingUrl`
 *   des Standorts, sonst die Standortsuche.
 * - `istOnlineBuchbar`: bekommt ein Standort einen Buchungsknopf?
 * - Das Cookie `myhb_ab_booking`/`myhb_ab_source` aus der Testzeit. Die
 *   eigenen Trichter-Ereignisse (lib/firstPartyFunnel) lesen es weiter, damit
 *   `funnel_events` dieselben Spalten behaelt; ein alter Wert `calendly` wird
 *   auf `app` umgeschrieben (`alignAbBucketToApp`).
 *
 * `ab_variant`, `ab_source` und `ab_fallback` bleiben an den Ereignissen,
 * weil GTM und die Wochenauswertungen sie lesen.
 */

/** "calendly" kann nur noch aus einem alten Cookie kommen. */
export type BookingVariant = "app" | "calendly";
/** Deployment, in dem der Bucket zugewiesen wurde. */
export type AbSource = "ads" | "seo";

/** Bucket des Besuchers aus der Testzeit. */
export const AB_BOOKING_COOKIE = "myhb_ab_booking";
/** Deployment der Zuweisung. */
export const AB_SOURCE_COOKIE = "myhb_ab_source";
const TTL_DAYS = 30;

export type BookingUrls = {
  /** App-Buchungs-URL des Standorts (Strapi `appBookingUrl`, #97). */
  appBookingUrl?: string | null;
};

export type ResolvedBooking = {
  /** URL, die geoeffnet wird; leer = Standortsuche. */
  url?: string;
  abVariant?: BookingVariant;
  /** Am Ereignis als `ab_fallback: true`, wenn gesetzt. */
  abFallback?: boolean;
};

function isVariant(value: unknown): value is BookingVariant {
  return value === "app" || value === "calendly";
}

function isSource(value: unknown): value is AbSource {
  return value === "ads" || value === "seo";
}

function readCookie(name: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const m = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
    return m ? decodeURIComponent(m.pop() as string) : null;
  } catch {
    return null;
  }
}

function cookieDomain(): string {
  const parts = window.location.hostname.split(".");
  return parts.length >= 2
    ? "." + parts.slice(-2).join(".")
    : window.location.hostname;
}

function writeCookie(name: string, value: string, days: number) {
  const d = new Date();
  d.setTime(d.getTime() + days * 864e5);
  document.cookie =
    `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()}` +
    `;path=/;domain=${cookieDomain()};SameSite=Lax;Secure`;
}

/** Bucket des Besuchers, sofern aus der Testzeit vorhanden. */
export function readAbBucket(): BookingVariant | undefined {
  const value = readCookie(AB_BOOKING_COOKIE);
  return isVariant(value) ? value : undefined;
}

/** In welchem Deployment wurde der Bucket zugewiesen? */
export function readAbSource(): AbSource | undefined {
  const value = readCookie(AB_SOURCE_COOKIE);
  return isSource(value) ? value : undefined;
}

/**
 * Ziel eines Buchungsknopfs: die App-URL des Standorts, sonst die
 * Standortsuche (13.10.2026). Seit Leipzig 09.–12.10.2026 drei Tage ohne
 * App-URL still ueber Calendly buchte, gibt es keinen Rueckfall mehr.
 */
export function resolveAppOnlyTarget(urls: BookingUrls): ResolvedBooking {
  const appBookingUrl = urls.appBookingUrl?.trim() || undefined;
  if (appBookingUrl) return { url: appBookingUrl, abVariant: "app" };
  return { abVariant: "app" };
}

/** Bekommt dieser Standort einen Buchungsknopf? Nur mit App-URL. */
export function istOnlineBuchbar(urls: BookingUrls): boolean {
  return !!urls.appBookingUrl?.trim();
}

/**
 * Ein noch liegender Bucket `calendly` aus der Testzeit wird auf `app`
 * umgeschrieben. Sonst trugen die eigenen Trichter-Ereignisse
 * (lib/firstPartyFunnel liest das Cookie) bis zu 30 Tage lang
 * `ab_variant: calendly`, obwohl der Besucher die App bekommt. Neu
 * geschrieben wird nur, was schon da ist — das Cookie entstand mit
 * Einwilligung; ohne Cookie bleibt es dabei.
 */
export function alignAbBucketToApp(): void {
  if (typeof window === "undefined") return;
  if (readAbBucket() !== "calendly") return;
  try {
    writeCookie(AB_BOOKING_COOKIE, "app", TTL_DAYS);
  } catch {}
}
