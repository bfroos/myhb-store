import {
  isSurgeryPathKey,
  newCustomerPriceCent,
  newCustomerPriceLabel,
} from "#shared/newCustomerOffer";
import {
  formatPriceInEuro,
  type FormatPriceInEuroOptions,
} from "~/utils/formatPriceInEuro";

/**
 * Preisanzeige fuer Behandlungen.
 *
 * go.* (Ads-Modus, Deutsch): Neukundenpreis mit Sternchen ("ab 119,99 €*",
 * shared/newCustomerOffer.ts), sonst wie bisher formatPriceInEuro. Nur fuer
 * die Anzeige — Tracking, JSON-LD und Buchungsdaten nutzen weiter die
 * regulaeren Preise.
 */
export function useDisplayPrice() {
  const { isAdsMode } = useSiteModeFlags();
  const { locale } = useI18n();
  const globals = useGlobals();

  const showsNewCustomerPrice = computed(
    () => isAdsMode.value && String(locale.value || "de").startsWith("de"),
  );

  function formatDisplayPrice(
    priceInEuroCent?: number | null,
    options: FormatPriceInEuroOptions = {},
  ): string {
    if (showsNewCustomerPrice.value && priceInEuroCent) {
      const label = newCustomerPriceLabel(
        priceInEuroCent,
        options.prefix,
        globals.value?.ecommerce?.newsletterDiscountPercentage ?? undefined,
      );
      if (label) return label;
    }
    return formatPriceInEuro(priceInEuroCent ?? 0, options);
  }

  const discountPct = computed(
    () => globals.value?.ecommerce?.newsletterDiscountPercentage ?? undefined,
  );

  /**
   * Neukundenpreis in Cent fuer Preislisten (/preise), oder `null`: auf www,
   * bei Schoenheits-OPs (bewusst ausgenommen) und wenn die ",99"-Regel nicht
   * passt. Dann bleibt der regulaere Preis die einzige Angabe.
   */
  function newCustomerCent(
    priceInEuroCent?: number | null,
    pathKey?: string | null,
  ): number | null {
    if (!showsNewCustomerPrice.value || !priceInEuroCent) return null;
    if (isSurgeryPathKey(pathKey)) return null;
    return newCustomerPriceCent(priceInEuroCent, discountPct.value);
  }

  return {
    formatDisplayPrice,
    showsNewCustomerPrice,
    newCustomerCent,
    discountPct,
  };
}
