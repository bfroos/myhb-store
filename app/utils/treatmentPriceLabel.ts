import type { TreatmentDto } from "~/lib/strapi/dto/collections";
import { formatPriceInEuro } from "~/utils/formatPriceInEuro";

type PriceFields = Pick<
  TreatmentDto,
  "priceInEuroCent" | "cheapestPriceInEuroCent" | "isStartingPrice"
>;

/**
 * Der Preis einer Behandlung, wie ihn die Behandlungsseite zeigt (#78).
 *
 * Eine Quelle fuer den Hero, den schwebenden CTA und die Kontextzeile im
 * Buchungsdialog: Redaktionsschalter `showPrice`, Festpreis vor guenstigstem
 * Preis, Praefix „ab" nur bei `isStartingPrice`. Leer, wenn die Seite keinen
 * Preis zeigt — dann zeigt auch der Dialog keinen.
 */
export function treatmentPriceLabel(
  treatment: PriceFields | null | undefined,
  showPrice: boolean | undefined,
  t: (key: string) => string,
): string {
  if (!showPrice || !treatment) return "";
  const price =
    treatment.priceInEuroCent || treatment.cheapestPriceInEuroCent;
  return formatPriceInEuro(price as number, {
    prefix: treatment.isStartingPrice
      ? t("common.price.startingPrefix")
      : undefined,
  });
}
