import type { SchemaOrgContext } from "~/utils/schemaShared";
import { toAbsoluteUrl } from "~/utils/schemaShared";

type WebsiteSchemaContext = SchemaOrgContext & {
  brandName?: string;
  logoUrl?: string;
  description?: string;
};

/**
 * Schema.org WebSite — aktiviert Google Sitelinks Searchbox.
 * Sollte auf der Homepage eingebunden werden.
 */
export function buildWebSiteSchema(
  ctx: WebsiteSchemaContext,
): Record<string, unknown> {
  const homeUrl = toAbsoluteUrl(ctx.publicUrl, "/");

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${homeUrl}#website`,
    name: ctx.brandName ?? "MY HEALTH & BEAUTY",
    url: homeUrl,
    inLanguage: "de-DE",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${homeUrl}behandlungen?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Schema.org Organization — verbessert Knowledge Graph und Brand-Erkennung.
 */
export function buildOrganizationSchema(
  ctx: WebsiteSchemaContext,
): Record<string, unknown> {
  const homeUrl = toAbsoluteUrl(ctx.publicUrl, "/");

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${homeUrl}#organization`,
    name: ctx.brandName ?? "MY HEALTH & BEAUTY",
    url: homeUrl,
    logo: ctx.logoUrl
      ? {
          "@type": "ImageObject",
          url: ctx.logoUrl,
        }
      : undefined,
    description:
      ctx.description ??
      "Botox®, Hyaluron & ästhetische Behandlungen zu fairen Preisen – ohne Termin. 10 Standorte deutschlandweit.",
    sameAs: [
      "https://www.instagram.com/myhealthandbeauty/",
      "https://www.facebook.com/myhealthbeautylounge",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      areaServed: "DE",
      availableLanguage: ["German", "English"],
    },
  };
}
