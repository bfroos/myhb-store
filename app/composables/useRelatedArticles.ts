import type { BlogArticleDto } from "~/lib/strapi/dto/collections";

/**
 * Maps a treatment's top-level category slug (from pathKey, e.g. "botox") to the
 * matching blog category slug. Most match 1:1; two need remapping.
 */
const TREATMENT_TO_BLOG_CATEGORY: Record<string, string> = {
  botox: "botox",
  hyaluron: "hyaluron",
  infusionen: "infusionen",
  fettwegspritze: "fettwegspritze",
  schoenheitsoperationen: "schoenheitsoperationen",
  "anti-haarausfall": "haare",
  // TODO: Der Skinbooster-Blog-Kategorie-Slug ist aktuell "blog-category" (Bug);
  // nach Umbenennung der Kategorie hier auf "skinbooster" anpassen.
  skinbooster: "blog-category",
};

/**
 * Lädt einige Blog-Artikel aus der zur Behandlungs-Kategorie passenden
 * Blog-Kategorie – für den "Ratgeber"-Block auf Behandlungsseiten
 * (interne Verlinkung Money-Page -> Blog).
 */
export function useRelatedArticles() {
  const { locale, fallbackLocale } = useI18n();
  const currentLocale = (locale.value || fallbackLocale.value) as string;
  const articles = ref<BlogArticleDto[]>([]);

  function resolveBlogCategorySlug(
    topCategorySlug?: string,
  ): string | undefined {
    if (!topCategorySlug) return undefined;
    return TREATMENT_TO_BLOG_CATEGORY[topCategorySlug] ?? topCategorySlug;
  }

  async function fetchRelated(
    topCategorySlug?: string,
    limit = 3,
  ): Promise<void> {
    const categorySlug = resolveBlogCategorySlug(topCategorySlug);
    if (!categorySlug) return;

    const { data } = await useStrapiFetch<{
      data?: { articles?: BlogArticleDto[] };
    }>(`/blog-page`, {
      query: { locale: currentLocale, page: 1, categorySlug },
      fetchOptions: {
        key: `related-articles:${currentLocale}:${categorySlug}`,
      },
    });

    articles.value = (data.value?.data?.articles ?? []).slice(0, limit);
  }

  return { articles, fetchRelated };
}
