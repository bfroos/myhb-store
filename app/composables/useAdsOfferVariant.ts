import { ADS_OFFER_AB_ENABLED, isAdsOfferBPath, type AdsOfferVariant } from "#shared/adsOfferVariant";

/**
 * go.* Vorlage v2: Variante des Angebots-Tests (shared/adsOfferVariant.ts).
 * "b" nur unter /ab-beratung/standorte/..., sonst "a" (heutiger Stand).
 * Aus dem Pfad, damit Server und Browser dasselbe rendern.
 */
export function useAdsOfferVariant() {
  const route = useRoute();
  return computed<AdsOfferVariant>(() =>
    ADS_OFFER_AB_ENABLED && isAdsOfferBPath(route.path) ? "b" : "a",
  );
}
