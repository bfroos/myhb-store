import { newCustomerPriceLabel } from "#shared/newCustomerOffer";
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

  return { formatDisplayPrice, showsNewCustomerPrice };
}
