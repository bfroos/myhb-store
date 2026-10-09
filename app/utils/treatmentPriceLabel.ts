import type { TreatmentDto } from "~/lib/strapi/dto/collections";
import {
  treatmentPriceText,
  visibleTreatmentPrice,
} from "#shared/treatmentPrice";

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
 *
 * TSEO Preise (09.10.2026): Regel liegt in shared/treatmentPrice.ts, dieselbe
 * wie fuer generierten Meta Title und Schema.org Offer.
 */
export function treatmentPriceLabel(
  treatment: PriceFields | null | undefined,
  showPrice: boolean | undefined,
  t: (key: string) => string,
): string {
  return treatmentPriceText(
    visibleTreatmentPrice(treatment, showPrice),
    t("common.price.startingPrefix"),
  );
}
