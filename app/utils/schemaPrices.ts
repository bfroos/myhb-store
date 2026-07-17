import { toAbsoluteUrl } from "~/utils/schemaShared";

type PriceTreatment = {
  name?: string;
  priceInEuroCent?: number;
  isStartingPrice?: boolean;
  treatmentPage?: { pathKey?: string } | null;
};

type PriceCategory = {
  name?: string;
  treatments?: PriceTreatment[];
};

/**
 * Schema.org ItemList of Service + Offer for the price overview page.
 * Each treatment with a price becomes a Service with an Offer (price in EUR).
 * Starting prices are represented as-is; Google treats Offer.price as the
 * (lowest) price for the service.
 */
export function buildPriceListSchema(
  categories: PriceCategory[] | null | undefined,
  publicUrl: string,
): Record<string, unknown> | null {
  if (!categories || categories.length === 0) return null;

  const items: Record<string, unknown>[] = [];
  let position = 1;

  for (const cat of categories) {
    for (const treatment of cat.treatments ?? []) {
      if (!treatment?.priceInEuroCent || !treatment?.name) continue;

      const service: Record<string, unknown> = {
        "@type": "Service",
        name: treatment.name,
        ...(cat.name ? { category: cat.name } : {}),
        ...(treatment.treatmentPage?.pathKey
          ? {
              url: toAbsoluteUrl(
                publicUrl,
                `/behandlungen/${treatment.treatmentPage.pathKey}`,
              ),
            }
          : {}),
        offers: {
          "@type": "Offer",
          price: (treatment.priceInEuroCent / 100).toFixed(2),
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
        },
      };

      items.push({
        "@type": "ListItem",
        position: position++,
        item: service,
      });
    }
  }

  if (items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items,
  };
}
