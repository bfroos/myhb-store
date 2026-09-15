/**
 * A/B-Split Calendly vs. App-Buchung (#100).
 *
 * Ein Standort kann seit #97 beide Buchungswege haben: `calendlyUrl` und
 * `appBookingUrl`. Welchen ein Besucher zu sehen bekommt, entscheidet diese
 * Datei — einmal pro Besucher, gemerkt fuer 30 Tage, damit er ueber
 * Seitenwechsel und Wiederkehr immer denselben Weg sieht (sonst waere die
 * Conversion Rate je Variante nicht auswertbar).
 *
 * Drei Schalter, in dieser Reihenfolge:
 *
 * 1. **`?ab=app` / `?ab=calendly`** erzwingt eine Variante. Fuer den Test vor
 *    dem Rollout — greift auch dann, wenn der Split fuer den Standort noch
 *    nicht freigegeben ist, aber nur wenn der Standort ueberhaupt beide URLs
 *    hat.
 * 2. **Standort-Freigabe** (`NUXT_PUBLIC_AB_BOOKING_LOCATIONS`, Slugs mit
 *    Komma getrennt) plus **Anteil** (`NUXT_PUBLIC_AB_BOOKING_SPLIT`, Prozent
 *    der Besucher, die die App bekommen). Beides leer bzw. 0 = kein Split.
 * 3. Sonst: Calendly. Das ist der Auslieferungszustand.
 *
 * ## Warum der Default Calendly ist
 *
 * Ein in der App gebuchter Termin blockiert den Calendly-Slot nur an
 * Standorten, an denen der Kalender-Write-back (#95) laeuft — Stand 15.09.2026
 * ist das ausschliesslich Kaiserslautern. Nimmt ein Standort gleichzeitig ueber
 * beide Systeme Termine an, sind Doppelbuchungen sicher, nicht nur moeglich
 * (08.09.2026 genau so passiert). Der Split geht deshalb erst auf 50/50, wenn
 * der Write-back am Teststandort nachweislich laeuft — und das ist eine
 * Env-Aenderung, kein Code-Deploy.
 *
 * ## Speicher
 *
 * Bucket im First-Party-Cookie (30 Tage) — nur mit Cookiebot-Einwilligung
 * (Statistik oder Marketing), sonst nur sessionStorage; dann bekommt der
 * Besucher in einer neuen Sitzung eine neue Losung. Dasselbe Muster wie
 * plugins/utm-persist.client.ts.
 *
 * `myhb_ab_booking_active` haelt zusaetzlich fest, welche Variante beim zuletzt
 * geoeffneten Buchungsweg tatsaechlich griff. Daraus liest
 * useGoogleAnalytics.trackEvent den Parameter `ab_variant` fuer die
 * Conversion-Events — auch fuer die, die erst spaeter kommen
 * (`booking_datetime_selected`, `booking_confirmed` auf der Dankesseite, die
 * Calendly im selben Tab aufruft). Bucht derselbe Besucher danach an einem
 * Standort ohne Split, wird der Eintrag geleert: sonst zaehlte diese Buchung
 * faelschlich auf eine Testvariante ein.
 */

export type BookingVariant = "app" | "calendly";

/** Zugeloster Bucket des Besuchers. */
export const AB_BOOKING_COOKIE = "myhb_ab_booking";
/** Variante des zuletzt geoeffneten Buchungswegs (Quelle fuer `ab_variant`). */
export const AB_BOOKING_ACTIVE_KEY = "myhb_ab_booking_active";
const TTL_DAYS = 30;

export type AbBookingConfig = {
  /** Anteil der Besucher in Prozent, die die App-Buchung bekommen (0–100). */
  splitPercent: number;
  /** Standort-Slugs, fuer die der Split freigegeben ist. */
  locations: string[];
};

export type BookingUrls = {
  /** Calendly-URL des Standorts (Strapi `calendlyUrl`). */
  calendlyUrl?: string | null;
  /** App-Buchungs-URL des Standorts (Strapi `appBookingUrl`, #97). */
  appBookingUrl?: string | null;
  /** Standort-Slug — entscheidet ueber die Freigabe. */
  locationSlug?: string | null;
};

export type ResolvedBooking = {
  /** URL, die geoeffnet wird. */
  url?: string;
  /** Gesetzt, wenn der Besucher fuer diesen Standort im Test ist. */
  abVariant?: BookingVariant;
};

function isVariant(value: unknown): value is BookingVariant {
  return value === "app" || value === "calendly";
}

/**
 * Liest die beiden Env-Schalter aus `runtimeConfig.public`. Unsinnige Werte
 * (kein Prozentwert, negativ, > 100) schalten den Split ab statt ihn
 * versehentlich aufzudrehen.
 */
export function readAbBookingConfig(publicConfig: {
  abBookingSplit?: unknown;
  abBookingLocations?: unknown;
}): AbBookingConfig {
  const rawSplit = Number(publicConfig?.abBookingSplit ?? 0);
  const splitPercent =
    Number.isFinite(rawSplit) && rawSplit > 0 && rawSplit <= 100 ? rawSplit : 0;
  const locations = String(publicConfig?.abBookingLocations ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
  return { splitPercent, locations };
}

function hasStorageConsent(): boolean {
  const cb = (window as any).Cookiebot;
  if (!cb || !cb.consent) return true;
  return !!(cb.consent.statistics || cb.consent.marketing);
}

function cookieDomain(): string {
  const parts = window.location.hostname.split(".");
  return parts.length >= 2
    ? "." + parts.slice(-2).join(".")
    : window.location.hostname;
}

function readCookie(name: string): string | null {
  const m = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
  return m ? decodeURIComponent(m.pop() as string) : null;
}

function writeCookie(name: string, value: string, days: number) {
  const d = new Date();
  d.setTime(d.getTime() + days * 864e5);
  document.cookie =
    `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()}` +
    `;path=/;domain=${cookieDomain()};SameSite=Lax;Secure`;
}

function readBucket(): BookingVariant | null {
  try {
    const fromSession = sessionStorage.getItem(AB_BOOKING_COOKIE);
    if (isVariant(fromSession)) return fromSession;
  } catch {}
  const fromCookie = readCookie(AB_BOOKING_COOKIE);
  return isVariant(fromCookie) ? fromCookie : null;
}

function persistBucket(variant: BookingVariant) {
  try {
    sessionStorage.setItem(AB_BOOKING_COOKIE, variant);
  } catch {}
  if (hasStorageConsent()) {
    try {
      writeCookie(AB_BOOKING_COOKIE, variant, TTL_DAYS);
    } catch {}
  }
}

/** Variante des zuletzt geoeffneten Buchungswegs; `null` leert den Eintrag. */
function setActiveVariant(variant: BookingVariant | null) {
  try {
    if (variant) sessionStorage.setItem(AB_BOOKING_ACTIVE_KEY, variant);
    else sessionStorage.removeItem(AB_BOOKING_ACTIVE_KEY);
  } catch {}
}

/**
 * Variante, unter der der aktuelle Buchungsweg geoeffnet wurde. `undefined`,
 * solange der Besucher nicht im Test ist — dann traegt auch kein Event einen
 * `ab_variant`, und GA4 zeigt fuer den Rest sauber „(not set)".
 */
export function readActiveAbVariant(): BookingVariant | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const value = sessionStorage.getItem(AB_BOOKING_ACTIVE_KEY);
    return isVariant(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

/** `?ab=app` / `?ab=calendly` aus der aktuellen URL. */
function forcedVariant(): BookingVariant | null {
  try {
    const raw = new URLSearchParams(window.location.search).get("ab");
    return isVariant(raw) ? raw : null;
  } catch {
    return null;
  }
}

/**
 * Entscheidet, welcher Buchungsweg aufgeht.
 *
 * Ohne beide URLs gibt es nichts zu splitten — dann kommt zurueck, was da ist
 * (in aller Regel die Calendly-URL), und der Besucher bleibt ausserhalb des
 * Tests.
 */
export function resolveBookingTarget(
  urls: BookingUrls,
  config: AbBookingConfig,
): ResolvedBooking {
  const calendlyUrl = urls.calendlyUrl?.trim() || undefined;
  const appBookingUrl = urls.appBookingUrl?.trim() || undefined;

  if (typeof window === "undefined") {
    // Serverseitig faellt keine Entscheidung: Die Seiten liegen 15 Minuten im
    // ISR-Cache, eine hier gewuerfelte Variante waere fuer alle dieselbe.
    return { url: calendlyUrl ?? appBookingUrl };
  }

  if (!calendlyUrl || !appBookingUrl) {
    setActiveVariant(null);
    return { url: calendlyUrl ?? appBookingUrl };
  }

  const forced = forcedVariant();
  const enabled =
    config.splitPercent > 0 &&
    !!urls.locationSlug &&
    config.locations.includes(urls.locationSlug);

  let variant: BookingVariant | null = null;
  if (forced) {
    variant = forced;
    persistBucket(forced);
  } else if (enabled) {
    variant = readBucket();
    if (!variant) {
      variant = Math.random() * 100 < config.splitPercent ? "app" : "calendly";
      persistBucket(variant);
    }
  }

  if (!variant) {
    setActiveVariant(null);
    return { url: calendlyUrl };
  }

  setActiveVariant(variant);
  return {
    url: variant === "app" ? appBookingUrl : calendlyUrl,
    abVariant: variant,
  };
}
