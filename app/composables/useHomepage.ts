import type { SharedSeoDto } from "~/lib/strapi/dto/components";
import type { StrapiBlock } from "~/lib/strapi/dto/types";

export function useHomepage() {
  const { locale, fallbackLocale, t } = useI18n();
  const currentLocale = (locale.value || fallbackLocale.value) as string;
  const seo = ref<SharedSeoDto | null>(null);
  const blocks = ref<StrapiBlock[]>([]);

  async function fetchHomepage(): Promise<boolean> {
    const { data, error } = await useStrapiFetch<any>(`/api/homepage`, {
      query: {
        locale: currentLocale,
      },
    });

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
    fetchHomepage,
    seo,
    blocks,
  };
}
