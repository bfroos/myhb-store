import type {
  TreatmentPageDto,
  LocationDto,
} from "~/lib/strapi/dto/collections";
import type { SchemaOrgContext } from "~/utils/schemaShared";
import { toAbsoluteUrl } from "~/utils/schemaShared";

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

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: treatmentPage.name,
    url: pageUrl,
    ...(description && { description }),
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

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: treatmentPage.name,
    url: pageUrl,
    ...(description && { description }),
  };

  return schema;
}
