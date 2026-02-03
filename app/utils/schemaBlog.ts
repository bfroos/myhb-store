import type { BlogArticleDto } from "~/lib/strapi/dto/collections";
import type { SchemaOrgContext } from "~/utils/schemaShared";
import { normalizeSchemaDateTime } from "~/utils/schemaShared";

/**
 * Schema.org BlogPosting for blog articles.
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
