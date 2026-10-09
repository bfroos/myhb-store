/**
 * hreflang-Regeln als reine Funktionen (TSEO-Regression 07.10.2026).
 *
 * app/utils/seo.ts (setPageSeo) gibt Alternates fuer die Sprachen aus, die
 * eine Seite ueber usePageI18nParams* als "vorhanden" meldet. Meldet eine
 * Seite nichts, gelten alle Sprachen - das ist fuer statische Seiten richtig
 * (/preise, /ueber-uns, ...), fuer Seiten mit sprachabhaengigen Slugs aber
 * falsch: Die Blog-Kategorien setzten so /en/blog/c/haare statt
 * /en/blog/c/hair. Seit TSEO-09 sind unbekannte Kategorien 404 - im Audit
 * vom 07.10.2026 77 hreflang-Ziele mit 404.
 */

export type I18nLocalization = { locale: string; slug?: string | null };

/**
 * Sprachen, fuer die setPageSeo ein Alternate ausgibt. Verhalten wie bisher
 * in seo.ts: ohne Abdeckung alle Sprachen, sonst die abgedeckten plus die
 * aktuelle Sprache (die Seite selbst gibt es immer).
 */
export function selectAlternateLocales(
  localeCodes: string[],
  currentLocale: string,
  coveredLocales: string[] | null,
): string[] {
  if (!coveredLocales) return [...localeCodes];
  return localeCodes.filter(
    (code) => code === currentLocale || coveredLocales.includes(code),
  );
}

/**
 * Route-Params je Sprache fuer eine Blog-Kategorie: { de: "haare",
 * en: "hair", ... }. Grundlage sind die Strapi-Lokalisierungen der Kategorie
 * (gleiche documentId); die aktuelle Sprache kommt immer mit ihrem eigenen
 * Slug hinein. Fehlen die Lokalisierungen (z. B. aelteres CMS ohne populate),
 * gibt es null - die Seite meldet dann nur sich selbst (keine geratenen
 * Fremdsprachen-URLs).
 */
export function blogCategoryLocaleSlugs(
  currentLocale: string,
  currentSlug: string,
  localizations: I18nLocalization[] | null | undefined,
): Record<string, string> | null {
  if (!Array.isArray(localizations)) return null;
  const result: Record<string, string> = {};
  for (const localization of localizations) {
    const slug = (localization?.slug ?? "").trim();
    if (!localization?.locale || !slug) continue;
    result[localization.locale] = slug;
  }
  result[currentLocale] = currentSlug;
  return result;
}

/**
 * hreflang-Ziel einer Blog-Kategorie in einer Sprache, wie es Nuxt i18n baut
 * (prefix_except_default, ar: /mudawwana). Nur fuer Tests und Pruefskripte.
 */
export function blogCategoryPath(locale: string, slug: string): string {
  const base = locale === "ar" ? "/mudawwana" : "/blog";
  const prefix = locale === "de" ? "" : `/${locale}`;
  return `${prefix}${base}/c/${slug}`;
}
