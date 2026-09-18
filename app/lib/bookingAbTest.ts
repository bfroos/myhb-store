/**
 * A/B-Split Calendly vs. App-Buchung (#100, Zuschnitt aus elanagency/myhb-os#87).
 *
 * ## Zuweisung und Anwendung sind zwei Zeitpunkte
 *
 * **Zugewiesen** wird beim ersten Seitenaufruf im Ads-Deployment
 * (`NUXT_PUBLIC_SITE_MODE=ads`) — siehe plugins/ab-split.client.ts. Der Bucket
 * liegt damit *vor* der Standortwahl und ist von ihr unabhaengig zufaellig; der
 * Nenner bleibt sauber, auch wenn die Standortwahl selbst eine Funnel-Stufe ist.
 *
 * **Angewendet** wird er erst, wenn der Buchungsdialog aufgeht und der Standort
 * feststeht: dann entscheidet er zwischen `calendlyUrl` und `appBookingUrl` der
 * Location (#97).
 *
 * Diese Trennung ist kein Umweg fuer die Meta-Landingpages (die keinen festen
 * Standort haben, sondern die Standortsuche oeffnen) — derselbe Mechanismus
 * traegt ohne Aenderung auch die Google-Seiten mit festem Standort
 * (`go.myhealthandbeauty.com/standorte/...`).
 *
 * ## Regeln
 *
 * - **Je Deployment ein Schalter.** Zugewiesen und angewendet wird nur dort, wo
 *   `NUXT_PUBLIC_AB_BOOKING_SPLIT` gesetzt ist — getrennt fuer Ads
 *   (go.myhealthandbeauty.com) und SEO (www). Wer im einen Deployment einen
 *   Bucket bekommen hat, behaelt ihn; angewendet wird er im anderen erst, wenn
 *   dort ebenfalls ein Anteil gesetzt ist. So aendert kein Deployment sein
 *   Buchungsverhalten ungefragt.
 * - **Die Quelle haengt am Ereignis.** Bezahlter und organischer Verkehr haben
 *   verschiedene Grundkonversionsraten; wirft man beide Toepfe zusammen, kann
 *   eine echte Wirkung verschwinden oder eine erfundene entstehen. Deshalb
 *   merkt sich die Zuweisung, in welchem Deployment sie fiel (`ab_source`), und
 *   traegt das an jedes Ereignis mit. Der Hostname reicht dafuer nicht: Die
 *   Dankesseite nach einer Calendly-Buchung liegt immer auf www, auch wenn der
 *   Besucher aus der Anzeige kam.
 * - **Nur mit Marketing-Einwilligung.** Ohne Einwilligung kein Cookie, kein
 *   Bucket, Default Calendly — diese Besucher stehen ausserhalb des Tests. Sie
 *   sind mangels GA4-Ereignissen ohnehin unsichtbar, aber ohne die Regel
 *   passten die Nenner nicht. Ausnahme: `?ab=` (siehe unten) ist eine bewusste
 *   Testhandlung und schreibt den Bucket auch ohne Banner-Antwort.
 * - **`?ab=app` / `?ab=calendly`** erzwingt eine Variante und merkt sie.
 * - **Fehlt `appBookingUrl`** an der gewaehlten Location, faellt der App-Arm auf
 *   Calendly zurueck — aber sichtbar, mit `ab_fallback: true` am Ereignis.
 *   Solche Sitzungen muessen aus der Auswertung fliegen, sonst verwaessern sie
 *   den App-Arm mit Calendly-Buchungen.
 *
 * Bekannte Einschraenkung: Der Bucket haengt am Cookie; ein Geraetewechsel kann
 * dieselbe Person in beide Arme bringen. Akzeptiert, gehoert in die
 * Auswertungs-Fussnote.
 */

export type BookingVariant = "app" | "calendly";
/** Deployment, in dem der Bucket zugewiesen wurde. */
export type AbSource = "ads" | "seo";

/** Zugeloster Bucket des Besuchers. */
export const AB_BOOKING_COOKIE = "myhb_ab_booking";
/** Deployment der Zuweisung — bleibt beim Besucher, auch auf der Dankesseite. */
export const AB_SOURCE_COOKIE = "myhb_ab_source";
const TTL_DAYS = 30;

export type AbBookingConfig = {
  /** Anteil der Besucher in Prozent, die die App-Buchung bekommen (0–100). */
  splitPercent: number;
};

export type BookingUrls = {
  /** Calendly-URL des Standorts (Strapi `calendlyUrl`). */
  calendlyUrl?: string | null;
  /** App-Buchungs-URL des Standorts (Strapi `appBookingUrl`, #97). */
  appBookingUrl?: string | null;
};

export type ResolvedBooking = {
  /** URL, die geoeffnet wird. */
  url?: string;
  /** Gesetzt, wenn der Besucher im Test ist. */
  abVariant?: BookingVariant;
  /**
   * App-Arm ohne `appBookingUrl` am Standort: Es oeffnet Calendly, obwohl die
   * Variante `app` lautet. Geht als `ab_fallback: true` mit ins Ereignis.
   */
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

/**
 * Liest den Env-Schalter aus `runtimeConfig.public`. Unsinnige Werte (kein
 * Prozentwert, negativ, > 100) schalten den Split ab statt ihn versehentlich
 * aufzudrehen.
 */
export function readAbBookingConfig(publicConfig: {
  abBookingSplit?: unknown;
}): AbBookingConfig {
  const raw = Number(publicConfig?.abBookingSplit ?? 0);
  return {
    splitPercent: Number.isFinite(raw) && raw > 0 && raw <= 100 ? raw : 0,
  };
}

/**
 * Marketing-Einwilligung laut Cookiebot.
 *
 * Bewusst anders als in plugins/utm-persist.client.ts: Dort entscheidet die
 * Antwort nur ueber die Speicherdauer, ein fehlendes Cookiebot ist harmlos und
 * defaultet auf `true`. Hier entscheidet sie ueber die Teilnahme am Test —
 * ohne klare Zustimmung bleibt der Besucher draussen.
 */
function hasMarketingConsent(): boolean {
  const cb = (window as any).Cookiebot;
  return !!cb?.consent?.marketing;
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

/**
 * Bucket des Besuchers, sofern zugewiesen. Das Cookie liegt auf
 * `.myhealthandbeauty.com` und ist damit auch auf der Dankesseite lesbar, auf
 * die Calendly nach der Buchung weiterleitet.
 */
export function readAbBucket(): BookingVariant | undefined {
  const value = readCookie(AB_BOOKING_COOKIE);
  return isVariant(value) ? value : undefined;
}

/** In welchem Deployment wurde der Bucket zugewiesen? */
export function readAbSource(): AbSource | undefined {
  const value = readCookie(AB_SOURCE_COOKIE);
  return isSource(value) ? value : undefined;
}

/** `?ab=app` / `?ab=calendly` aus der aktuellen URL. */
export function forcedAbVariant(): BookingVariant | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = new URLSearchParams(window.location.search).get("ab");
    return isVariant(raw) ? raw : undefined;
  } catch {
    return undefined;
  }
}

export type AssignResult = {
  variant?: BookingVariant;
  /** true, wenn der Bucket in diesem Aufruf neu gezogen wurde. */
  assigned: boolean;
  /** Deployment, in dem die Zuweisung faellt bzw. fiel. */
  source?: AbSource;
};

/**
 * Seiten, die einen Buchungsabschluss bestaetigen. Gemessen am 18.09.2026 fiel
 * auf `/p/danke-fuer-deine-terminbuchung` der Bucket fuer 39 Besucher in drei
 * Tagen — Leute, die gerade ueber Calendly gebucht hatten und erst danach dem
 * Test zugelost wurden. Dieselbe Seite feuert `booking_confirmed`, und so
 * erschienen zehn von ihnen als App-Arm-Nutzer, die ueber Calendly buchten.
 * Die Auswertung las das als Leckage im Buchungsweg (elanagency/myhb-os#272).
 *
 * Ein bereits gezogener Bucket bleibt gueltig: wer VOR der Buchung zugeteilt
 * wurde, soll auf der Dankesseite weiter seinem Arm zugerechnet werden. Diese
 * Sperre greift nur fuer NEUE Zuweisungen — siehe assignAbBucket().
 */
const NACH_BUCHUNG_PFADE = ["/p/danke-fuer-deine-terminbuchung"];

export function istNachBuchungsSeite(
  pathname: string | undefined = typeof window === "undefined"
    ? undefined
    : window.location?.pathname,
): boolean {
  if (!pathname) return false;
  const rein = pathname.replace(/\/+$/, "").toLowerCase() || "/";
  return NACH_BUCHUNG_PFADE.some((p) => rein === p || rein.startsWith(p + "/"));
}

/**
 * Zuweisung beim Seitenaufruf (siehe Plugin).
 *
 * Gibt den bestehenden Bucket zurueck, wenn es einen gibt, sonst wuerfelt er —
 * aber nur mit Marketing-Einwilligung und nur, wenn der Split in **diesem**
 * Deployment an ist. `?ab=` schlaegt beides.
 *
 * `siteMode` wird beim Ziehen als Quelle mitgeschrieben und spaeter an jedes
 * Ereignis gehaengt; ein bestehender Bucket behaelt seine urspruengliche
 * Quelle, auch wenn der Besucher das Deployment wechselt.
 */
export function assignAbBucket(
  config: AbBookingConfig,
  siteMode: AbSource,
): AssignResult {
  if (typeof window === "undefined") return { assigned: false };

  const forced = forcedAbVariant();
  const current = readAbBucket();
  const currentSource = readAbSource();

  const merke = (variant: BookingVariant, source: AbSource) => {
    try {
      writeCookie(AB_BOOKING_COOKIE, variant, TTL_DAYS);
      writeCookie(AB_SOURCE_COOKIE, source, TTL_DAYS);
    } catch {}
  };

  if (forced) {
    if (forced === current) {
      return { variant: forced, assigned: false, source: currentSource ?? siteMode };
    }
    merke(forced, siteMode);
    return { variant: forced, assigned: true, source: siteMode };
  }

  if (current) {
    return { variant: current, assigned: false, source: currentSource ?? siteMode };
  }
  // Wer hier ankommt, hat noch keinen Bucket. Auf einer Bestaetigungsseite ist
  // das kein Testteilnehmer, sondern jemand, der gerade fertig gebucht hat.
  if (istNachBuchungsSeite()) return { assigned: false };
  if (config.splitPercent <= 0) return { assigned: false };
  if (!hasMarketingConsent()) return { assigned: false };

  const variant: BookingVariant =
    Math.random() * 100 < config.splitPercent ? "app" : "calendly";
  merke(variant, siteMode);
  return { variant, assigned: true, source: siteMode };
}

/**
 * Anwendung beim Oeffnen des Buchungsdialogs, wenn der Standort feststeht.
 *
 * `bucket` ist der zugewiesene Bucket — `undefined` heisst: nicht im Test, es
 * bleibt bei Calendly. Ausserhalb des Ads-Deployments wird gar nicht erst
 * gefragt (siehe useBookingAbTest).
 */
export function resolveBookingTarget(
  urls: BookingUrls,
  bucket?: BookingVariant,
): ResolvedBooking {
  const calendlyUrl = urls.calendlyUrl?.trim() || undefined;
  const appBookingUrl = urls.appBookingUrl?.trim() || undefined;

  if (!bucket) return { url: calendlyUrl ?? appBookingUrl };

  if (bucket === "calendly") {
    return { url: calendlyUrl ?? appBookingUrl, abVariant: "calendly" };
  }

  if (!appBookingUrl) {
    // Ohne beide URLs steht der Standort noch gar nicht fest (der Button
    // oeffnet die Standortsuche) — da gibt es nichts anzuwenden und nichts
    // zurueckzufallen. Der Rueckfall zaehlt erst, wenn eine konkrete Location
    // keine App-URL hat.
    if (!calendlyUrl) return { abVariant: "app" };
    // Sichtbar zurueckfallen, nicht verschlucken: Ohne dieses Flag zaehlten
    // Calendly-Buchungen in den App-Arm.
    return { url: calendlyUrl, abVariant: "app", abFallback: true };
  }

  return { url: appBookingUrl, abVariant: "app" };
}
