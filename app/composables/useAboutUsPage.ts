import type { SharedSeoDto } from "~/lib/strapi/dto/components";
import type { StrapiBlock } from "~/lib/strapi/dto/types";
import type { AboutUsPageDto } from "~/lib/strapi/dto/singleTypes";

export function useAboutUsPage() {
  const { locale, fallbackLocale, t } = useI18n();
  const currentLocale = (locale.value || fallbackLocale.value) as string;
  const seo = ref<SharedSeoDto | null>(null);
  const blocks = ref<StrapiBlock[]>([]);

  async function fetchPage(): Promise<boolean> {
    const { data, error } = await useStrapiFetch<{ data: AboutUsPageDto }>(
      `/api/about-us-page`,
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

    seo.value = data.value.data.seo;
    blocks.value = data.value.data.blocks;

    return true;
  }

  return {
    fetchPage,
    seo,
    blocks,
  };
}
