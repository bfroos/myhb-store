import type { SchemaOrgContext } from "~/utils/schemaShared";
import { toAbsoluteUrl } from "~/utils/schemaShared";

type WebsiteSchemaContext = SchemaOrgContext & {
  brandName?: string;
  logoUrl?: string;
  description?: string;
};

/**
 * Schema.org WebSite (Site-Name in Google). Nur auf der Startseite.
 */
export function buildWebSiteSchema(
  ctx: WebsiteSchemaContext,
): Record<string, unknown> {
  const homeUrl = toAbsoluteUrl(ctx.publicUrl, "/");

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${homeUrl}#website`,
    name: ctx.brandName ?? "My Health & Beauty",
    // Backup für Googles Site-Name-System: die Domain (klein) als
    // alternativer Name, falls der bevorzugte Name nicht gewählt wird.
    alternateName: "myhealthandbeauty.com",
    url: homeUrl,
    inLanguage: "de-DE",
    // TSEO-12: keine SearchAction - /behandlungen?q= sucht nichts.
    publisher: { "@id": `${homeUrl}#organization` },
  };
}
