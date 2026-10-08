/**
 * Weiterleitungen, die nicht in der Redirect-Tabelle (server/assets/
 * redirects.json, Strapi) stehen, weil sie Muster sind (bfroos/myhb-store#199).
 *
 * 1. Alte Aachen-Lippenseite (/aachen/lip-filler, /lip-filler,
 *    /standorte/aachen[/<standort>]/lip-filler) - beide Domains, Seite ist
 *    entfernt (Benjamin, 30.09.2026).
 * 2. go.* (Ads-Modus): Blog ganz aus. /blog und /blog/** (alle Sprachen) auf
 *    /behandlungen.
 * 3. go.* (Ads-Modus): keine Adresse mit "botox"/"btx" im Pfad (Google-Policy
 *    RESTRICTED_DRUG_TERMS: die URL zaehlt wie sichtbarer Text). Ziel ist die
 *    passende Muskelrelaxans-Seite, wenn es sie gibt, sonst die Uebersicht.
 *
 * www behaelt Blog und Botox-Seiten (dort laufen /p/botox-meta-rabatt und
 * /p/lippen-meta-rabatt als Meta-Anzeigenziel).
 */

import { adsPathKeyForSeo } from "./adsLocationTreatments.ts";

export const AACHEN_LIPS_TARGET = "/standorte/aachen/aquis-plaza/hyaluron/lippen-aufspritzen";
export const ADS_BLOG_TARGET = "/behandlungen";
export const ADS_MR_OVERVIEW = "/behandlungen/muskelrelaxans";

/** Wie die Sonde: Botox, Botulinum, BTX als eigenes Wort ("_btx_" zaehlt). */
export const RESTRICTED_PATH = /botox|botulinum|(?<![a-z0-9])btx(?![a-z0-9])/i;

const SKIP = /^\/(?:_nuxt|__nuxt|_ipx|_fonts|_vercel|api|favicon)(?:\/|$)|\.[a-z0-9]{2,5}$/i;
const LIP_FILLER = /^\/(?:aachen\/lip-filler|lip-filler|standorte\/aachen(?:\/[^/]+)?\/lip-filler)$/i;
const BLOG = /^\/(?:(?:en|tr|fr|nl)\/)?blog(?:\/|$)|^\/ar\/mudawwana(?:\/|$)/i;
const LOCALE_PREFIX = /^\/(?:en|tr|ar|fr|nl)(?=\/|$)/i;

/** Feste Ziele fuer bekannte Seiten mit dem Begriff (go.). */
const ADS_FIXED: Record<string, string> = {
  "/p/botox-kosten": "/preise",
  "/p/botox-meta-rabatt": ADS_MR_OVERVIEW,
  "/lp/botox-zornesfalte-koeln": "/standorte/koeln/koeln-arcaden/muskelrelaxans/zornesfalte",
};

export function normalizeRedirectPath(input: string): string {
  let path = input || "/";
  try {
    path = decodeURI(path);
  } catch {
    // ungueltige Sequenz: roh weiter
  }
  const q = path.search(/[?#]/);
  if (q >= 0) path = path.slice(0, q);
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1) path = path.replace(/\/+$/, "") || "/";
  return path;
}

/** Beide Domains: entfernte Aachen-Lippenseite. */
/**
 * Geloeschte Einzel-Landingpages (TSEO-04): Platzhalter-Testimonials bzw.
 * Platzhalter-og:image, auf www indexierbar. Statt 404 auf die echte Seite,
 * falls alte Anzeigen oder Links darauf zeigen. Auf go. gilt fuer die
 * Botox-Seite vorher ADS_FIXED (Muskelrelaxans).
 */
const REMOVED_LANDING_PAGES: Record<string, string> = {
  "/lp/lippen-aachen": AACHEN_LIPS_TARGET,
  "/lp/botox-zornesfalte-koeln": "/standorte/koeln/koeln-arcaden/botox/zornesfalte",
};

export function legacyPageRedirect(pathname: string): string | null {
  const path = normalizeRedirectPath(pathname);
  if (LIP_FILLER.test(path)) return AACHEN_LIPS_TARGET;
  return REMOVED_LANDING_PAGES[path.toLowerCase()] ?? null;
}

export type AdsRedirectData = {
  /** pathKeys des Ads-Baums (treatment-ads-pages), fuer /behandlungen/... */
  adsPathKeys?: ReadonlySet<string> | null;
  /** pathKeys am Standort (locationPathKeys), fuer /standorte/<stadt>/<ort>/... */
  locationPathKeys?: ReadonlySet<string> | null;
};

/** Standort-Adresse mit Behandlung: [stadt, ort, pathKey]. */
export function locationTreatmentParts(path: string): [string, string, string] | null {
  const m = /^\/standorte\/([^/]+)\/([^/]+)\/(.+)$/.exec(path);
  return m ? [m[1]!, m[2]!, m[3]!] : null;
}

/** Braucht die Adresse eine Ads-Weiterleitung? (billig, ohne Strapi) */
export function needsAdsRedirect(pathname: string): boolean {
  const path = normalizeRedirectPath(pathname);
  if (SKIP.test(path)) return false;
  return (
    LIP_FILLER.test(path) ||
    path.toLowerCase() in REMOVED_LANDING_PAGES ||
    BLOG.test(path) ||
    RESTRICTED_PATH.test(path)
  );
}

function clean(target: string): string {
  return RESTRICTED_PATH.test(target) ? ADS_MR_OVERVIEW : target;
}

/**
 * Ziel der Ads-Weiterleitung oder `null`. Ohne `data` (Strapi nicht lesbar)
 * geht es auf die Uebersicht statt auf eine Seite, die es vielleicht nicht gibt.
 */
export function adsRedirectTarget(pathname: string, data: AdsRedirectData = {}): string | null {
  const path = normalizeRedirectPath(pathname);
  if (SKIP.test(path)) return null;
  // Feste go.-Ziele zuerst: sonst fuehrte die geloeschte Botox-Landingpage
  // ueber legacyPageRedirect auf eine .../botox/...-Adresse und von dort in
  // eine zweite Weiterleitung.
  const fixed = ADS_FIXED[path.toLowerCase()];
  if (fixed) return fixed;
  const legacy = legacyPageRedirect(path);
  if (legacy) return legacy;
  if (BLOG.test(path)) return ADS_BLOG_TARGET;
  if (!RESTRICTED_PATH.test(path)) return null;

  const unprefixed = path.replace(LOCALE_PREFIX, "") || "/";
  if (unprefixed !== path) return ADS_MR_OVERVIEW;

  // /behandlungen/botox/<x> -> /behandlungen/muskelrelaxans/<x>, wenn es sie gibt
  const treatment = /^\/behandlungen\/(.+)$/.exec(path);
  if (treatment) {
    const key = data.adsPathKeys ? adsPathKeyForSeo(treatment[1]!, data.adsPathKeys) : null;
    return clean(key ? `/behandlungen/${key}` : ADS_MR_OVERVIEW);
  }

  // /standorte/<stadt>/<ort>/botox/<x> -> .../muskelrelaxans/<x>, sonst
  // .../muskelrelaxans, sonst die Standortseite
  const loc = locationTreatmentParts(path);
  if (loc && !RESTRICTED_PATH.test(`${loc[0]}/${loc[1]}`)) {
    const [city, ort, rest] = loc;
    const base = `/standorte/${city}/${ort}`;
    const keys = data.locationPathKeys;
    if (!keys) return base;
    const key = adsPathKeyForSeo(rest, keys);
    if (key) return clean(`${base}/${key}`);
    return keys.has("muskelrelaxans") ? `${base}/muskelrelaxans` : base;
  }

  // /produkte/botox/**, /p/<...botox...> und alles andere
  return ADS_MR_OVERVIEW;
}
