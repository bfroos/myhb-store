import type {
  TreatmentPageDto,
  LocationDto,
} from "~/lib/strapi/dto/collections";
import { TreatmentType } from "~/lib/strapi/dto/enums";
import type { SchemaOrgContext } from "~/utils/schemaShared";
import { toAbsoluteUrl, formatEuroFromCent, parseEuroCent } from "~/utils/schemaShared";
import { buildAggregateRatingSchema } from "~/utils/schemaRating";

type TreatmentSchemaContext = SchemaOrgContext & {
  brandName?: string;
  currency?: string;
};

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
  const priceInCent = parseEuroCent(treatmentPage.treatment?.priceInEuroCent);

  // AggregateRating (hardcoded für jetzt - später aus Config/CMS)
  const aggregateRating = buildAggregateRatingSchema(5.0, 2737);

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
  const priceInCent = parseEuroCent(treatmentPage.treatment?.priceInEuroCent);

  // AggregateRating (hardcoded für jetzt - später aus Config/CMS)
  const aggregateRating = buildAggregateRatingSchema(5.0, 2737);

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
