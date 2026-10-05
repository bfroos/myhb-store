import {
  isAdsTemplateV2LivePage,
  isAdsTemplateV2Page,
  isAdsTemplateV2PreviewPath,
} from "#shared/adsTemplateV2";
import { ADS_OFFER_AB_ENABLED, isAdsOfferBPath } from "#shared/adsOfferVariant";
import { isAdsPremiumPreviewPath } from "#shared/adsPremium";

/**
 * go.* (Ads-Modus): Laeuft die aktuelle Standort-Behandlungsseite mit der
 * Seitenvorlage v2 (shared/adsTemplateV2.ts)?
 *
 * - Vorschau /vorschau-v2/standorte/...: alle Seiten aus
 *   ADS_TEMPLATE_V2_PAGES (auch "-rabatt").
 * - Echte Seite /standorte/... (seit 01.10.2026, Benjamin: "heute schon die
 *   Seiten auf die neue Vorlage umstellen"): dieselben Seiten ohne
 *   "-rabatt", solange ADS_TEMPLATE_V2_LIVE an ist.
 * Aus der Route, damit Seite und Fusszeile dieselbe Antwort geben.
 * www: immer false.
 */
export function useAdsTemplateV2() {
  const { isAdsMode } = useSiteModeFlags();
  const route = useRoute();
  return computed(() => {
    if (!isAdsMode.value) return false;
    const p = route.params as Record<string, unknown>;
    const slug = p.treatmentSlug;
    const pathKey = Array.isArray(slug)
      ? slug.filter(Boolean).join("/")
      : typeof slug === "string"
        ? slug
        : "";
    const city = typeof p.citySlug === "string" ? p.citySlug : "";
    const loc = typeof p.locationSlug === "string" ? p.locationSlug : "";
    // Premium-Vorschau /vorschau-premium/... (shared/adsPremium.ts): dieselben
    // Seiten wie die v2-Vorschau.
    if (isAdsTemplateV2PreviewPath(route.path) || isAdsPremiumPreviewPath(route.path)) {
      return isAdsTemplateV2Page(city, loc, pathKey);
    }
    // A/B-Variante B des Angebots (shared/adsOfferVariant.ts): dieselben
    // Seiten wie live, unter /ab-beratung/standorte/...
    if (isAdsOfferBPath(route.path)) {
      return ADS_OFFER_AB_ENABLED && isAdsTemplateV2LivePage(city, loc, pathKey);
    }
    // Nur die deutsche Standort-Behandlungsseite (go. ist deutsch).
    if (!/^\/standorte\/[^/]+\/[^/]+\/.+/.test(route.path)) return false;
    return isAdsTemplateV2LivePage(city, loc, pathKey);
  });
}
