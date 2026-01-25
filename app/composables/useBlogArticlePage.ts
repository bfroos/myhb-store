import type { SharedSeoDto } from "~/lib/strapi/dto/components";
import type { BlogArticleDto } from "~/lib/strapi/dto/collections";
import type { BreadcrumbItem } from "~/lib/ui/types";

export function useBlogArticlePage() {
  const { locale, fallbackLocale, t } = useI18n();
  const currentLocale = (locale.value || fallbackLocale.value) as string;
  const seo = ref<SharedSeoDto | null>(null);
  const article = ref<BlogArticleDto | null>(null);

  const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
    const headline = article.value?.headline || "";
    const truncatedHeadline =
      headline.length > 15 ? headline.substring(0, 30) + "…" : headline;

    const items: BreadcrumbItem[] = [
      {
        title: t("blog.breadcrumbTitle"),
        to: "/blog",
      },
    ];

    // Only add category breadcrumb if category exists
    if (article.value?.category?.name && article.value?.category?.slug) {
      items.push({
        title: article.value.category.name,
        to: `/blog/c/${article.value.category.slug}`,
      });
    }

    // Add article headline breadcrumb
    items.push({
      title: truncatedHeadline,
    });

    return items;
  });

  async function fetchPage(): Promise<boolean> {
    const route = useRoute();
    const slug = route.params.slug as string;

    const { data, error } = await useStrapiFetch<{
      data: BlogArticleDto;
    }>(`/blog-articles/by-slug/${slug}`, {
      query: {
        locale: currentLocale,
      },
      fetchOptions: {
        key: `blog-article:${currentLocale}:${slug}`,
      },
    });

    if (error.value) {
      throw handleFetchError(error.value, t);
    }

    if (!data.value?.data) {
      throw handleNotFound(t);
    }

    seo.value = data.value.data.seo;
    article.value = data.value.data;

    return true;
  }

  return {
    fetchPage,
    seo,
    article,
    breadcrumbItems,
  };
}
