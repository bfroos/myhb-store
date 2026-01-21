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
}
