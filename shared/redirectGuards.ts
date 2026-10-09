/**
 * Schutz vor Alt-Weiterleitungen auf Live-Routen (TSEO-Regression 07.10.2026).
 *
 * redirects.json stammt zum grossen Teil aus dem Shopify-Export. Dort stand
 * { "from": "/tr/", "to": null, "code": 410 } - die tuerkische Shop-Startseite.
 * Solange Eintraege ohne "to" verworfen wurden, war das harmlos. Seit TSEO-11
 * (410 wird ausgeliefert) traf der Eintrag die tuerkische Startseite /tr der
 * Nuxt-Seite: 410 statt 200, auch beim Umschalten der Sprache im Browser.
 *
 * Die Startseiten der Sprachversionen duerfen deshalb nie Quelle einer
 * Weiterleitung oder eines 410 sein, egal ob der Eintrag aus redirects.json,
 * redirects-koeln.json oder Strapi kommt.
 *
 * Reine Funktionen ohne Nuxt-Abhaengigkeit (Unit-Tests mit node --test).
 */

/**
 * Sprach-Praefixe der Seite (nuxt.config.ts, i18n.locales, Strategie
 * prefix_except_default mit "de" als Standard). Ein Test gleicht die Liste mit
 * nuxt.config.ts ab, damit eine neue Sprache hier nicht vergessen wird.
 */
export const LOCALE_PREFIXES = ["en", "tr", "ar", "fr", "nl"] as const;

/** Startseiten aller Sprachversionen: "/" (de) und "/en", "/tr", ... */
export const PROTECTED_REDIRECT_PATHS: ReadonlySet<string> = new Set([
  "/",
  ...LOCALE_PREFIXES.map((code) => `/${code}`),
]);

/**
 * Gleiche Normalisierung wie server/utils/redirects.ts (normalizePath):
 * dekodieren, Query weg, fuehrender Schraegstrich, Schraegstrich am Ende weg.
 */
export function normalizeRedirectPath(input: string): string {
  let path = input || "/";
  try {
    path = decodeURI(path);
  } catch {
    // Ungueltige Sequenzen bleiben stehen.
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      path = new URL(path).pathname;
    } catch {
      // Faellt auf die einfache Normalisierung zurueck.
    }
  }
  const queryIndex = path.indexOf("?");
  if (queryIndex >= 0) path = path.slice(0, queryIndex);
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path;
}

/** true, wenn der (normalisierte) Pfad nie umgeleitet oder 410 werden darf. */
export function isProtectedRedirectPath(path: string): boolean {
  return PROTECTED_REDIRECT_PATHS.has(normalizeRedirectPath(path).toLowerCase());
}
