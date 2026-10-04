import type { MaybeRefOrGetter } from "vue";
import type { TreatmentDto } from "~/lib/strapi/dto/collections";
import { buildNewCustomerOffer } from "#shared/newCustomerOffer";

/**
 * go.* (Ads-Modus, Deutsch): Neukundenangebot einer Behandlungsseite
 * (shared/newCustomerOffer.ts). Eine Quelle fuer Hero, mitlaufende Leiste und
 * die Fussnotenzeile am Seitenende, damit alle drei denselben Preis nennen.
 * www und andere Sprachen: `null` - ausser `force` (bundesweite v2-Seiten
 * fuer Meta auf www, app/pages/aktion/[slug].vue).
 */
export function useNewCustomerOffer(
  treatment: MaybeRefOrGetter<TreatmentDto | null | undefined>,
  pathKey: MaybeRefOrGetter<string | null | undefined>,
  force: MaybeRefOrGetter<boolean | undefined> = false,
) {
  const { isAdsMode } = useSiteModeFlags();
  const { locale } = useI18n();
  const globals = useGlobals();

  return computed(() => {
    if (!isAdsMode.value && !toValue(force)) return null;
    if (!String(locale.value || "de").startsWith("de")) return null;
    const t = toValue(treatment);
    if (!t) return null;
    const twoZonePriceCent = (t.products ?? [])
      .flatMap((product) => product.variants ?? [])
      .find(
        (variant) => variant.slug === "2-zonen" && variant.isActive !== false,
      )?.priceInEuroCent;
    return buildNewCustomerOffer({
      pathKey: toValue(pathKey),
      priceCent: t.priceInEuroCent || t.cheapestPriceInEuroCent,
      isStartingPrice: t.isStartingPrice,
      twoZonePriceCent,
      discountPct: globals.value?.ecommerce?.newsletterDiscountPercentage,
    });
  });
}
