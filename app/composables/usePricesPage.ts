import type { SharedSeoDto } from "~/lib/strapi/dto/components";
import { BlockPageHeaderLayout, ColorTheme } from "~/lib/strapi/dto/enums";
import type { StrapiBlock } from "~/lib/strapi/dto/types";

export function usePricesPage() {
  const { locale, fallbackLocale, t } = useI18n();
  const page = ref<any | null>(null);
  const seo = ref<SharedSeoDto | null>(null);
  const blocks = ref<StrapiBlock[]>([]);
  const productCategories = ref<any | null>(null);
  const currentLocale = (locale.value || fallbackLocale.value) as string;

  async function fetchPage(): Promise<boolean> {
    const { data, error } = await useStrapiFetch<any>(
      `/api/prices-page/with-product-categories`,
      {
        query: {
          locale: currentLocale,
        },
      },
    );

    if (error.value) {
      throw handleFetchError(error.value, t);
    }

    if (!data.value?.data) {
      throw handleNotFound(t);
    }

    page.value = data.value.data.pricesPage || null;
    productCategories.value = data.value.data.productCategories || null;

    return true;
  }

  // Backwards-compatible alias: prices data comes from one endpoint now.
  async function fetchProductCategories(): Promise<boolean> {
    return await fetchPage();
  }

  const fixedBlocks = computed(() => {
    return {
      pageHeader: getPageHeader(),
    };
  });

  function getPageHeader() {
    if (!page.value?.headline) {
      return null;
    }

    return {
      headline: page.value?.headline,
      intro: page.value?.intro,
      layout: BlockPageHeaderLayout.COMPACT,
      cardSettings: {
        colorTheme: ColorTheme.STRONG,
      },
    };
  }

  return {
    fetchProductCategories,
    fetchPage,
    productCategories,
    seo,
    blocks,
    fixedBlocks,
  };
}
