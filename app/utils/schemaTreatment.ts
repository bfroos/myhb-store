import type {
  TreatmentPageDto,
  LocationDto,
} from "~/lib/strapi/dto/collections";
import { TreatmentType } from "~/lib/strapi/dto/enums";
import type { SchemaOrgContext } from "~/utils/schemaShared";
import { toAbsoluteUrl, formatEuroFromCent } from "~/utils/schemaShared";
import {
  visibleTreatmentPrice,
} from "#shared/treatmentPrice";
import { buildAggregateRatingSchema } from "~/utils/schemaRating";

type TreatmentSchemaContext = SchemaOrgContext & {
  brandName?: string;
  currency?: string;
  ratingValue?: number;
  reviewCount?: number;
  priceInEuroCent?: number | null; // Optional external price override
  /**
   * Zeigt die Seite den Preis? Standard: `treatmentPage.hero.showPrice`. Ohne
   * sichtbaren Preis kein Offer (Schema = sichtbarer Inhalt, TSEO Preise).
   */
  showPrice?: boolean | null;
  /**
   * go.*: Kein Offer-Preis. Die Seite zeigt dort den Neukundenpreis; der
   * regulaere Preis als Offer passte nicht zur Seite, der Neukundenpreis als
   * Offer waere falsch ausgezeichnet (gilt nur mit Newsletter-Rabatt). go.*
   * steht ohnehin auf noindex.
   */
  omitOffer?: boolean;
};

/**
 * Offer-Preis in Cent: dieselbe Regel wie Hero und generierter Titel
 * (shared/treatmentPrice.ts). Vorher nur `priceInEuroCent` und auch bei
 * `showPrice = false` (Schoenheits-OPs zeigten keinen Preis, das Schema schon).
 */
function offerPriceCent(
  treatmentPage: TreatmentPageDto,
  ctx: TreatmentSchemaContext,
): number | undefined {
  if (ctx.omitOffer) return undefined;
  const showPrice = ctx.showPrice ?? (treatmentPage as any).hero?.showPrice;
  const source =
    ctx.priceInEuroCent != null
      ? {
          priceInEuroCent: ctx.priceInEuroCent,
          isStartingPrice: treatmentPage.treatment?.isStartingPrice,
        }
      : treatmentPage.treatment;
  const price = visibleTreatmentPrice(source, showPrice);
  return price?.cent;
}

/** @id der MedicalProcedure einer Seite. */
export function medicalProcedureId(publicUrl: string, path: string): string {
  return `${toAbsoluteUrl(publicUrl, path)}#procedure`;
}

/**
 * Schema.org MedicalProcedure für Behandlungsseiten.
 * Kombiniert Behandlung mit Location-Informationen.
 */
export function buildMedicalProcedureSchema(
  treatmentPage: TreatmentPageDto | null | undefined,
  location: LocationDto | null | undefined,
  ctx: TreatmentSchemaContext,
): Record<string, unknown> | null {
  if (!treatmentPage || !location) return null;

  const pageUrl = toAbsoluteUrl(ctx.publicUrl, ctx.path);

  const description = treatmentPage.hero?.text;
  const image = treatmentPage.hero?.cover?.url;

  const procedureType = mapTreatmentTypeToProcedureType(treatmentPage.treatment?.type);
  // Use external price override if provided, otherwise fallback to treatment price
  const priceInCent = offerPriceCent(treatmentPage, ctx);

  // AggregateRating from context (passed from component)
  const aggregateRating = buildAggregateRatingSchema(ctx.ratingValue, ctx.reviewCount);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    // Eigene @id, damit die Einrichtung (LocalBusiness/MedicalClinic des
    // Standorts) sie per availableService referenzieren kann.
    "@id": medicalProcedureId(ctx.publicUrl, ctx.path),
    name: treatmentPage.name,
    url: pageUrl,
    ...(description && { description }),
    ...(image && { image }),
    ...(procedureType && { procedureType }),
    ...(ctx.brandName && {
      performer: {
        "@type": "Organization",
        "@id": `${toAbsoluteUrl(ctx.publicUrl, "/")}#organization`,
        name: ctx.brandName,
      },
    }),
    ...(priceInCent != null && {
      offer: {
        "@type": "Offer",
        price: formatEuroFromCent(priceInCent),
        priceCurrency: ctx.currency ?? "EUR",
        availability: "https://schema.org/InStock",
      },
    }),
    ...(aggregateRating && { aggregateRating }),
  };

  return schema;
}

/**
 * Schema.org MedicalProcedure für allgemeine Behandlungsseiten (ohne Location).
 */
export function buildGeneralMedicalProcedureSchema(
  treatmentPage: TreatmentPageDto | null | undefined,
  ctx: TreatmentSchemaContext,
): Record<string, unknown> | null {
  if (!treatmentPage) return null;

  const pageUrl = toAbsoluteUrl(ctx.publicUrl, ctx.path);
  const description = treatmentPage.hero?.text;
  const image = treatmentPage.hero?.cover?.url;
  const procedureType = mapTreatmentTypeToProcedureType(treatmentPage.treatment?.type);
  // Use external price override if provided, otherwise fallback to treatment price
  const priceInCent = offerPriceCent(treatmentPage, ctx);

  // AggregateRating from context (passed from component)
  const aggregateRating = buildAggregateRatingSchema(ctx.ratingValue, ctx.reviewCount);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: treatmentPage.name,
    url: pageUrl,
    ...(description && { description }),
    ...(image && { image }),
    ...(procedureType && { procedureType }),
    ...(ctx.brandName && {
      performer: {
        "@type": "Organization",
        "@id": `${toAbsoluteUrl(ctx.publicUrl, "/")}#organization`,
        name: ctx.brandName,
      },
    }),
    ...(priceInCent != null && {
      offer: {
        "@type": "Offer",
        price: formatEuroFromCent(priceInCent),
        priceCurrency: ctx.currency ?? "EUR",
        availability: "https://schema.org/InStock",
      },
    }),
    ...(aggregateRating && { aggregateRating }),
  };

  return schema;
}

/**
 * Mapped TreatmentType Enum zu Schema.org procedureType.
 */
function mapTreatmentTypeToProcedureType(type?: string): string | undefined {
  switch (type) {
    case TreatmentType.MINIMALLY_INVASIVE:
      return "https://schema.org/TherapeuticProcedure";
    case TreatmentType.ABULLATORY:
      return "https://schema.org/TherapeuticProcedure";
    case TreatmentType.OPERATIONAL:
      return "https://schema.org/SurgicalProcedure";
    default:
      return undefined;
  }
}
