import type { SharedSeoDto } from "~/lib/strapi/dto/components";
import type { StrapiBlock } from "~/lib/strapi/dto/types";

export function usePricesPage() {
  const { locale, fallbackLocale, t } = useI18n();
  const page = ref<any | null>(null);
  const seo = ref<SharedSeoDto | null>(null);
  const topBlocks = ref<StrapiBlock[]>([]);
  const bottomBlocks = ref<StrapiBlock[]>([]);
  const productCategories = ref<any | null>(null);
  const currentLocale = (locale.value || fallbackLocale.value) as string;

  async function fetchPage(): Promise<boolean> {
    const { data, error } = await useStrapiFetch<any>(
      `/prices-page/with-product-categories`,
      {
        query: {
          locale: currentLocale,
        },
        fetchOptions: {
          key: `prices-page:${currentLocale}`,
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
    topBlocks.value = data.value.data.pricesPage.topBlocks || [];
    bottomBlocks.value = data.value.data.pricesPage.bottomBlocks || [];
    seo.value = data.value.data.pricesPage.seo || null;

    return true;
  }

  async function fetchProductCategories(): Promise<boolean> {
    return await fetchPage();
  }

  return {
    fetchProductCategories,
    fetchPage,
    productCategories,
    seo,
    topBlocks,
    bottomBlocks,
  };
}
