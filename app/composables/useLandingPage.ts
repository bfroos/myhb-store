import type { LocalizationDto, StrapiBlock } from "~/lib/strapi/dto/types";
import type { SharedSeoDto } from "~/lib/strapi/dto/components";

export function useLandingPage() {
  const route = useRoute();
  const { locale, fallbackLocale, t } = useI18n();
  const currentLocale = (locale.value || fallbackLocale.value) as string;
  const slug = route.params.slug as string;
  const seo = ref<SharedSeoDto | null>(null);
  const blocks = ref<StrapiBlock[]>([]);
  const localizations = ref<LocalizationDto[]>([]);

  async function fetchLandingPage(): Promise<boolean> {
    const { data, error } = await useStrapiFetch<any>(
      `/landing-pages/by-slug/${slug}`,
      {
        query: {
          locale: currentLocale,
        },
        fetchOptions: {
          key: `landing-page:${currentLocale}:${slug}`,
        },
      },
    );

    if (error.value) {
      throw handleFetchError(error.value, t);
    }

    const page = data.value?.data;
    if (!page) {
      throw handleNotFound(t);
    }

    seo.value = page.seo ?? null;
    blocks.value = page.blocks ?? [];
    localizations.value = page.localizations ?? [];

    return true;
  }

  return { fetchLandingPage, seo, blocks, localizations };
}
