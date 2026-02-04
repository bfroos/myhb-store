import type { JobDto } from "~/lib/strapi/dto/collections";
import type { StrapiRichText } from "~/lib/strapi/dto/types";
import type { SchemaOrgContext } from "~/utils/schemaShared";
import {
  normalizeSchemaDateTime,
  strapiRichTextToPlainText,
  toAbsoluteUrl,
} from "~/utils/schemaShared";

/**
 * Schema.org JobPosting for job advertisements.
 * Supports Google Jobs and other search engines.
 */
type JobSchemaContext = SchemaOrgContext & { path: string; logoUrl?: string };

export function buildJobPostingSchema(
  job: JobDto | null | undefined,
  ctx: JobSchemaContext,
): Record<string, unknown> | null {
  if (!job) return null;

  const pageUrl = toAbsoluteUrl(ctx.publicUrl, ctx.path);
  const description =
    strapiRichTextToPlainText(job.content as unknown as StrapiRichText) ||
    [job.title, job.genderHint].filter(Boolean).join(" – ");

  const title = job.genderHint ? `${job.title} (${job.genderHint})` : job.title;

  const baseUrl = ctx.publicUrl?.replace(/\/+$/, "") ?? "";
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description,
    datePosted: job.updatedAt
      ? normalizeSchemaDateTime(job.updatedAt)
      : undefined,
    hiringOrganization: ctx.brandName
      ? {
          "@type": "Organization",
          name: ctx.brandName,
          sameAs: baseUrl,
          ...(ctx.logoUrl && { logo: ctx.logoUrl }),
        }
      : { "@type": "Organization", name: "Unbekannt" },
    jobLocation: buildJobLocations(job),
    applicantLocationRequirements: { "@type": "Country", name: "DE" },
    identifier: job.slug || String(job.id),
    url: pageUrl,
    directApply: !!(job.url || job.email),
  };

  const employmentTypes = mapEmploymentTypes(job);
  if (employmentTypes.length) {
    schema.employmentType =
      employmentTypes.length === 1 ? employmentTypes[0]! : employmentTypes;
  }

  if (job.startDate) {
    schema.jobStartDate = normalizeSchemaDateTime(job.startDate);
  }

  if (job.hourlyRateMinInEuroCent != null) {
    const hasRange = job.hourlyRateMaxInEuroCent != null;
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "EUR",
      value: {
        "@type": "QuantitativeValue",
        unitText: "HOUR",
        ...(hasRange
          ? {
              minValue: job.hourlyRateMinInEuroCent / 100,
              maxValue: job.hourlyRateMaxInEuroCent! / 100,
            }
          : { value: job.hourlyRateMinInEuroCent / 100 }),
      },
    };
  }

  if (job.cover?.url) {
    schema.image = job.cover.url;
  }

  return schema;
}

function mapEmploymentTypes(job: JobDto): string[] {
  const schemaValues: Record<string, string> = {
    "full-time": "FULL_TIME",
    "part-time": "PART_TIME",
    permanent: "FULL_TIME",
    "fixed-term": "TEMPORARY",
    freelance: "CONTRACTOR",
  };
  const raw = [
    ...(job.employmentTypes ?? []),
    ...(job.contractTypes ?? []),
  ].map((t) => String(t).toLowerCase());
  return [
    ...new Set(
      raw.map((t) => schemaValues[t]).filter((v): v is string => Boolean(v)),
    ),
  ];
}

function buildJobLocations(job: JobDto): unknown[] {
  const locations = job.locations ?? [];
  if (locations.length === 0) return [];

  return locations
    .map((loc) => {
      const cityName = loc.city?.name ?? "";
      const addr = loc.address;
      const streetAddress = addr?.street
        ? [addr.street, addr.houseNumber].filter(Boolean).join(" ")
        : "";
      const postalCode = addr?.postalCode ?? "";
      const addressLocality = addr?.city ?? cityName ?? loc.name ?? "";

      if (!addressLocality) return null;

      const address: Record<string, string> = {
        "@type": "PostalAddress",
        streetAddress,
        postalCode,
        addressLocality,
        addressCountry: "DE",
      };
      const cleanAddress = Object.fromEntries(
        Object.entries(address).filter(([, v]) => v != null && v !== ""),
      );

      return {
        "@type": "Place",
        address: cleanAddress,
      };
    })
    .filter((loc): loc is NonNullable<typeof loc> => loc != null);
}
