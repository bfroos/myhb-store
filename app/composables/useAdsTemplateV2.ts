import {
  isAdsTemplateV2Page,
  isAdsTemplateV2PreviewPath,
} from "#shared/adsTemplateV2";

/**
 * go.* (Ads-Modus): Laeuft die aktuelle Standort-Behandlungsseite mit der
 * Seitenvorlage v2 (shared/adsTemplateV2.ts)?
 *
 * Nur in der Vorschau /vorschau-v2/standorte/... und nur fuer Seiten aus
 * ADS_TEMPLATE_V2_PAGES (Benjamin, 30.09.2026: erst ansehen, dann
 * aktivieren). Die echten Anzeigen-Ziel-URLs bleiben immer bei der
 * bisherigen Seite. Aus der Route, damit Seite und Fusszeile dieselbe
 * Antwort geben. www: immer false.
 */
export function useAdsTemplateV2() {
  const { isAdsMode } = useSiteModeFlags();
  const route = useRoute();
  return computed(() => {
    if (!isAdsMode.value) return false;
    if (!isAdsTemplateV2PreviewPath(route.path)) return false;
    const p = route.params as Record<string, unknown>;
    const slug = p.treatmentSlug;
    const pathKey = Array.isArray(slug)
      ? slug.filter(Boolean).join("/")
      : typeof slug === "string"
        ? slug
        : "";
    return isAdsTemplateV2Page(
      typeof p.citySlug === "string" ? p.citySlug : "",
      typeof p.locationSlug === "string" ? p.locationSlug : "",
      pathKey,
    );
  });
}
