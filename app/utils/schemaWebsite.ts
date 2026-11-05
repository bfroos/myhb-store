import type { SchemaOrgContext } from "~/utils/schemaShared";
import { toAbsoluteUrl } from "~/utils/schemaShared";

/**
 * Site-Name für Google (WebSite-Schema, og:site_name, Organization). Bewusst
 * fest und in Title Case: Strapi liefert die Marke in Großbuchstaben, und
 * Google nimmt Namen in Versalien nicht als Site-Namen, sondern zeigt dann
 * "my health & beauty" klein über den Suchtreffern.
 */
export const SITE_NAME = "My Health & Beauty";

type WebsiteSchemaContext = SchemaOrgContext & {
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
    name: SITE_NAME,
    // Backup für Googles Site-Name-System: die Domain (klein) als
    // alternativer Name, falls der bevorzugte Name nicht gewählt wird.
    alternateName: "myhealthandbeauty.com",
    url: homeUrl,
    inLanguage: "de-DE",
    // TSEO-12: keine SearchAction - /behandlungen?q= sucht nichts.
    publisher: { "@id": `${homeUrl}#organization` },
  };
}
