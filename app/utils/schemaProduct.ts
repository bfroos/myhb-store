import type { ProductDto } from "~/lib/strapi/dto/collections";
import type { ProductVariantDto } from "~/lib/strapi/dto/components";
import type { SchemaOrgContext } from "~/utils/schemaShared";
import {
  formatEuroFromCent,
  parseEuroCent,
  strapiRichTextToPlainText,
  toAbsoluteUrl,
} from "~/utils/schemaShared";

type ProductSchemaContext = SchemaOrgContext & { currency?: string };

/**
 * Schema.org Product for product detail pages.
 *
 * We use active variants preferentially for price/availability.
 */
export function buildProductSchema(
  product: ProductDto | null | undefined,
  ctx: ProductSchemaContext,
): Record<string, unknown> | null {
  if (!product) return null;

  const pageUrl = toAbsoluteUrl(ctx.publicUrl, ctx.path);
  const currency = ctx.currency ?? "EUR";

  const imageUrls = getImageUrls(product);
  const { variantsForOffers, activeVariants } = getVariantsForOffers(product);
  const availability =
    activeVariants.length > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url: pageUrl,
    ...(product.slug && { sku: product.slug }),
    ...(product.category?.name && { category: product.category.name }),
    ...(imageUrls.length > 0 && { image: imageUrls }),
    ...(strapiRichTextToPlainText(product.description) && {
      description: strapiRichTextToPlainText(product.description),
    }),
  };

  if (product.manufacturer?.name) {
    schema.brand = product.manufacturer.name;
    schema.manufacturer = {
      "@type": "Organization",
      name: product.manufacturer.name,
    };
  }

  const offers = variantsForOffers
    .map((v) => buildOffer(v, { currency, pageUrl }))
    .filter(Boolean);

  if (offers.length > 0) {
    // Many validators render offers more reliably when it's an array of Offer.
    schema.offers = offers;
  } else {
    // Fallback: still provide an Offer block (some tools mark it incomplete without a price).
    schema.offers = [
      {
        "@type": "Offer",
        "@id": pageUrl,
        priceCurrency: currency,
        availability,
        itemCondition: "https://schema.org/NewCondition",
      },
    ];
  }

  return schema;
}

function getImageUrls(product: ProductDto): string[] {
  return (
    product.images
      ?.map((img) => img?.url)
      .filter((u): u is string => typeof u === "string" && u.length > 0) ?? []
  );
}

function getVariantsForOffers(product: ProductDto): {
  variantsForOffers: ProductVariantDto[];
  activeVariants: ProductVariantDto[];
} {
  const allVariants = product.variants ?? [];
  const activeVariants = allVariants.filter((v) => v?.isActive !== false);

  // Prefer active variants; if none have a usable price, fallback to all variants.
  const activeHasPrice = activeVariants.some(
    (v) => parseEuroCent(v?.priceInEuroCent) !== undefined,
  );

  return {
    variantsForOffers: activeHasPrice ? activeVariants : allVariants,
    activeVariants,
  };
}

function buildOffer(
  variant: ProductVariantDto,
  ctx: { currency: string; pageUrl: string },
): Record<string, unknown> | null {
  const priceInEuroCent = parseEuroCent(variant?.priceInEuroCent);
  if (priceInEuroCent === undefined) return null;

  const vAvailability =
    variant?.isActive === false
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock";
  const vSlug = typeof variant?.slug === "string" ? variant.slug : "";
  const offerUrl = vSlug ? `${ctx.pageUrl}#${vSlug}` : ctx.pageUrl;

  return {
    "@type": "Offer",
    "@id": offerUrl,
    priceCurrency: ctx.currency,
    price: formatEuroFromCent(priceInEuroCent),
    availability: vAvailability,
    itemCondition: "https://schema.org/NewCondition",
  };
}
