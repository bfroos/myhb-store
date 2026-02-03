import type { BlogArticleDto } from "~/lib/strapi/dto/collections";

export type SchemaOrgContext = {
  publicUrl: string;
  path: string;
  brandName?: string;
};

function normalizeSchemaDateTime(
  value: string | null | undefined,
): string | undefined {
  if (!value) return undefined;

  // If it's a plain date (YYYY-MM-DD), convert to a full ISO date-time in UTC.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00.000Z`;
  }

  // If it already contains an explicit timezone (Z or +/-HH:MM or +/-HHMM), keep it.
  if (/(Z|[+-]\d{2}:\d{2}|[+-]\d{4})$/.test(value)) {
    return value;
  }

  // Otherwise, try to parse and normalize to ISO with timezone.
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

/**
 * Schema.org BlogPosting für Blog-Artikel.
 */
export function buildBlogPostingSchema(
  article: BlogArticleDto | null | undefined,
  ctx: SchemaOrgContext,
): Record<string, unknown> | null {
  if (!article) return null;

  const pageUrl = `${ctx.publicUrl.replace(/\/+$/, "")}${ctx.path}`;
  const imageUrl = article.cover?.url;
  const datePublished = normalizeSchemaDateTime(article.displayDate);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.headline,
    description: article.intro,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    ...(datePublished && { datePublished }),
    ...(imageUrl && {
      image: {
        "@type": "ImageObject",
        url: imageUrl,
      },
    }),
  };

  if (ctx.brandName) {
    schema.publisher = {
      "@type": "Organization",
      name: ctx.brandName,
    };
    schema.author = {
      "@type": "Organization",
      name: ctx.brandName,
    };
  }

  return schema;
}

export type WebSiteSchemaContext = SchemaOrgContext & {
  name?: string;
  description?: string;
  logoUrl?: string;
  inLanguage?: string;
};
