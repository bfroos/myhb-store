import { toAbsoluteUrl } from "~/utils/schemaShared";

type BreadcrumbItem = {
  title: string;
  to?: string;
};

/**
 * Schema.org BreadcrumbList — zeigt Breadcrumbs in Google Suchergebnissen an.
 * Verbessert CTR durch bessere Darstellung der URL-Struktur.
 */
export function buildBreadcrumbSchema(
  items: BreadcrumbItem[],
  publicUrl: string,
): Record<string, unknown> | null {
  if (!items || items.length === 0) return null;

  const listItems = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.title,
    ...(item.to
      ? { item: toAbsoluteUrl(publicUrl, item.to) }
      : {}),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: listItems,
  };
}
