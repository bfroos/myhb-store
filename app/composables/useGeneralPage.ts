import type { LocalizationDto, StrapiBlock } from "~/lib/strapi/dto/types";
import type { SharedSeoDto } from "~/lib/strapi/dto/components";

export function useGeneralPage() {
  const route = useRoute();
  const { locale, fallbackLocale, t } = useI18n();
  const currentLocale = (locale.value || fallbackLocale.value) as string;
  const localizations = ref<LocalizationDto[]>([]);
  const slug = route.params.slug as string;
  const seo = ref<SharedSeoDto | null>(null);
  const blocks = ref<StrapiBlock[]>([]);

  async function fetchGeneralPage(): Promise<boolean> {
    const { data, error } = await useStrapiFetch<any>(`/pages/by-slug/${slug}`, {
      query: {
        locale: currentLocale,
      },
      fetchOptions: {
        key: `page:${currentLocale}:${slug}`,
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
    localizations.value = data.value.data.localizations;

    return true;
  }
  return { fetchGeneralPage, seo, blocks, localizations };
}
