import type {
  TreatmentPageDto,
  LocationDto,
} from "~/lib/strapi/dto/collections";
import { TreatmentType } from "~/lib/strapi/dto/enums";
import type { SchemaOrgContext } from "~/utils/schemaShared";
import { toAbsoluteUrl, formatEuroFromCent, parseEuroCent } from "~/utils/schemaShared";
import { buildAggregateRatingSchema } from "~/utils/schemaRating";
import { locationEntityId } from "~/utils/schemaLocation";

/**
 * #308 (E24): Behandlungen als ["MedicalProcedure", "Service"]. Preis
 * ("offers"), Anbieter ("provider") und Bewertung gibt es laut schema.org nur
 * an Service, nicht an MedicalProcedure - vorher stand dort "offer" (gibt es
 * gar nicht) und "performer" (nur an Event). Google, Bing und KI-Systeme
 * haben den Preis deshalb ignoriert.
 */
const PROCEDURE_TYPES = ["MedicalProcedure", "Service"];

type TreatmentSchemaContext = SchemaOrgContext & {
  brandName?: string;
  currency?: string;
  ratingValue?: number;
  reviewCount?: number;
  priceInEuroCent?: number | null; // Optional external price override
  /**
   * go.*: Kein Offer-Preis. Die Seite zeigt dort den Neukundenpreis; der
   * regulaere Preis als Offer passte nicht zur Seite, der Neukundenpreis als
   * Offer waere falsch ausgezeichnet (gilt nur mit Newsletter-Rabatt). go.*
   * steht ohnehin auf noindex.
   */
  omitOffer?: boolean;
};

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
  const priceInCent = ctx.omitOffer
    ? undefined
    : parseEuroCent(
        ctx.priceInEuroCent ?? treatmentPage.treatment?.priceInEuroCent,
      );

  // AggregateRating from context (passed from component)
  const aggregateRating = buildAggregateRatingSchema(ctx.ratingValue, ctx.reviewCount);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": PROCEDURE_TYPES,
    // Eigene @id, damit die Einrichtung (LocalBusiness/MedicalClinic des
    // Standorts) sie per availableService referenzieren kann.
    "@id": medicalProcedureId(ctx.publicUrl, ctx.path),
    name: treatmentPage.name,
    url: pageUrl,
    ...(description && { description }),
    ...(image && { image }),
    ...(procedureType && { procedureType }),
    ...(ctx.brandName && {
      provider: {
        "@type": "Organization",
        "@id": `${toAbsoluteUrl(ctx.publicUrl, "/")}#organization`,
        name: ctx.brandName,
      },
    }),
    ...(location.city?.name && { areaServed: { "@type": "City", name: location.city.name } }),
    ...(priceInCent != null && {
      offers: buildOffer(priceInCent, treatmentPage, ctx, pageUrl, locationEntityId(ctx.publicUrl, location)),
    }),
    ...(aggregateRating && { aggregateRating }),
  };

  return schema;
}

/** Preis "ab": Offer mit Mindestpreis, am Standort verfuegbar. */
function buildOffer(
  priceInCent: number,
  treatmentPage: TreatmentPageDto,
  ctx: TreatmentSchemaContext,
  pageUrl: string,
  availableAtId: string | null,
): Record<string, unknown> {
  const price = formatEuroFromCent(priceInCent);
  const currency = ctx.currency ?? "EUR";
  return {
    "@type": "Offer",
    price,
    priceCurrency: currency,
    url: pageUrl,
    availability: "https://schema.org/InStock",
    ...((treatmentPage.treatment as any)?.isStartingPrice && {
      priceSpecification: {
        "@type": "PriceSpecification",
        minPrice: price,
        priceCurrency: currency,
      },
    }),
    ...(availableAtId && { availableAtOrFrom: { "@id": availableAtId } }),
  };
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
  const priceInCent = ctx.omitOffer
    ? undefined
    : parseEuroCent(
        ctx.priceInEuroCent ?? treatmentPage.treatment?.priceInEuroCent,
      );

  // AggregateRating from context (passed from component)
  const aggregateRating = buildAggregateRatingSchema(ctx.ratingValue, ctx.reviewCount);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": PROCEDURE_TYPES,
    "@id": medicalProcedureId(ctx.publicUrl, ctx.path),
    name: treatmentPage.name,
    url: pageUrl,
    ...(description && { description }),
    ...(image && { image }),
    ...(procedureType && { procedureType }),
    ...(ctx.brandName && {
      provider: {
        "@type": "Organization",
        "@id": `${toAbsoluteUrl(ctx.publicUrl, "/")}#organization`,
        name: ctx.brandName,
      },
    }),
    ...(priceInCent != null && {
      offers: buildOffer(priceInCent, treatmentPage, ctx, pageUrl, null),
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
