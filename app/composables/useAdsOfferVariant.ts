import { ADS_NO_DISCOUNT, ADS_OFFER_AB_ENABLED, isAdsOfferBPath, type AdsOfferVariant } from "#shared/adsOfferVariant";

/**
 * go.* Vorlage v2: Variante des Angebots-Tests (shared/adsOfferVariant.ts).
 * "b" unter /ab-beratung/standorte/... und, solange ADS_NO_DISCOUNT an ist,
 * auf allen go.*-Seiten; sonst "a" (mit Rabatt, z. B. Meta-Seiten auf www).
 * Aus Pfad und Domain, damit Server und Browser dasselbe rendern.
 */
export function useAdsOfferVariant() {
  const route = useRoute();
  const { isAdsMode } = useSiteModeFlags();
  return computed<AdsOfferVariant>(() =>
    (ADS_NO_DISCOUNT && isAdsMode.value) || (ADS_OFFER_AB_ENABLED && isAdsOfferBPath(route.path)) ? "b" : "a",
  );
}
