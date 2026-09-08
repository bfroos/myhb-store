type Localization = {
  locale: string;
  [key: string]: string;
};

export type I18nParamSource = {
  /**
   * Route-Param-Name in Nuxt (z.B. "slug", "citySlug", "locationSlug")
   */
  paramName: string;
  /**
   * Lokalisierungen aus Strapi (müssen mindestens "locale" + das Feld aus "key" enthalten)
   */
  localizations: Localization[];
  /**
   * Feldname in der Localization (z.B. "slug" oder "pathKey")
   */
  key: keyof Localization;
};

/**
 * Sprachen, für die die aktuelle Seite einen VOLLSTÄNDIGEN Satz Route-Params
 * hat - also für jeden dynamischen Param eine eigene Übersetzung. Nur diese
 * Sprachen dürfen als hreflang-Alternate ausgegeben werden: fehlt ein Param,
 * setzt switchLocalePath() stillschweigend den Wert der aktuellen Sprache ein
 * und baut eine Mischform (z.B. /ar/konumlar/kuluniya/... mit deutschem
 * pathKey), die es nicht gibt - Google bekommt 404.
 *
 * Der Pfad wird mitgespeichert, damit ein Wert aus der vorher besuchten Seite
 * (Client-Navigation) nicht fälschlich für die aktuelle gilt.
 */
export type PageI18nCoverage = {
  path: string;
  locales: string[];
};

const PAGE_I18N_COVERAGE_STATE = "page-i18n-coverage";

export function usePageI18nCoverage() {
  return useState<PageI18nCoverage | null>(
    PAGE_I18N_COVERAGE_STATE,
    () => null,
  );
}

/**
 *
 * @param localizations - The localizations to process
 * @param key - The key to use for the localizations (e.g. 'slug' or 'pathKey')
 * @param paramName - The Nuxt route param name to set (default: 'slug')
 */
export function usePageI18nParams(
  localizations?: Localization[],
  key?: keyof Localization,
  paramName: string = "slug"
): void {
  if (!localizations || !key) return;

  usePageI18nParamsFromSources([{ localizations, key, paramName }]);
}

/**
 * Setzt i18n-Params für mehrere Route-Parameter gleichzeitig (z.B. citySlug + locationSlug).
 */
export function usePageI18nParamsFromSources(sources: I18nParamSource[]): void {
  const setI18nParams = useSetI18nParams();
  const route = useRoute();
  const coverage = usePageI18nCoverage();

  const params = sources.reduce<Record<string, Record<string, string>>>(
    (acc, source) => {
      for (const l of source.localizations ?? []) {
        const value = (l[source.key] as string) ?? "";
        acc[l.locale] = acc[l.locale] ?? {};
        acc[l.locale]![source.paramName] = value;
      }
      return acc;
    },
    {}
  );

  setI18nParams(params);

  // Vollständig ist eine Sprache nur, wenn JEDER Param einen nicht-leeren Wert
  // hat. Die Params selbst bleiben unverändert (der Sprachumschalter soll sich
  // weiter wie bisher verhalten) - gefiltert wird nur der hreflang-Block.
  const paramNames = Array.from(new Set(sources.map((s) => s.paramName)));
  const completeLocales = Object.keys(params).filter((locale) =>
    paramNames.every((paramName) => !!params[locale]?.[paramName])
  );

  coverage.value = { path: route.path, locales: completeLocales };
}
