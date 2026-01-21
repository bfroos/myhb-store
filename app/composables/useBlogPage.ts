import type {
  BlogArticleDto,
  BlogCategoryDto,
} from "~/lib/strapi/dto/collections";
import type {
  BlogPageDto,
  BlogPageWithArticlesAndCategoriesDto,
} from "~/lib/strapi/dto/singleTypes";
import type { SharedSeoDto } from "~/lib/strapi/dto/components";
import type { StrapiBlock } from "~/lib/strapi/dto/types";
import type { BreadcrumbItem } from "~/lib/ui/types";

export function useBlogPage() {
  const { locale, fallbackLocale, t } = useI18n();
  const route = useRoute();
  const currentLocale = (locale.value || fallbackLocale.value) as string;
  const seo = ref<SharedSeoDto | null>(null);
  const blogPage = ref<BlogPageDto | null>(null);
  const articles = ref<BlogArticleDto[]>([]);
  const categories = ref<BlogCategoryDto[]>([]);
  const blocks = ref<StrapiBlock[]>([]);
  const pagination = ref<{
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  } | null>(null);

  const breadcrumbItems = computed(() => {
    const items: BreadcrumbItem[] = [];
    const categorySlug = route.params.slug as string | undefined;

    // Add "Blog" breadcrumb - with link only if not on index page
    items.push({
      title: t("blog.breadcrumbTitle"),
      ...(categorySlug && { to: "/blog" }),
    });

    // Add category breadcrumb if on category page
    if (categorySlug) {
      const category = categories.value.find(
        (cat) => cat.slug === categorySlug,
      );
      if (category?.name) {
        items.push({
          title: category.name,
          to: `/blog/c/${category.slug}`,
        });
      }
    }

    return items;
  });

  async function fetchPage(
    page: number = 1,
    categorySlug?: string,
  ): Promise<boolean> {
    const { data, error } = await useStrapiFetch<{
      data: BlogPageWithArticlesAndCategoriesDto;
    }>(`/api/blog-page`, {
      query: {
        locale: currentLocale,
        page,
        ...(categorySlug && { categorySlug }),
      },
    });

    if (error.value) {
      throw handleFetchError(error.value, t);
    }

    if (!data.value?.data || !data.value.data.blogPage) {
      throw handleNotFound(t);
    }

    seo.value = data.value.data.blogPage?.seo;
    blocks.value = data.value.data.blogPage?.blocks;
    blogPage.value = data.value.data.blogPage;
    articles.value = data.value.data.articles;
    categories.value = data.value.data.categories;
    pagination.value = data.value.data.pagination;

    return true;
  }

  return {
    fetchPage,
    seo,
    blocks,
    blogPage,
    articles,
    categories,
    pagination,
    breadcrumbItems,
  };
}
