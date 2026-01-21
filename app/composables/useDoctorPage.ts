import { mapDoctorPageBlocks } from "~/lib/strapi/mapper/mapDoctorPageBlocks";
import type { LocalizationDto } from "~/lib/strapi/dto/types";

export function useDoctorPage(brandName: string) {
  const { locale, fallbackLocale, t } = useI18n();
  const page = ref<any | null>(null);
  const currentLocale = (locale.value || fallbackLocale.value) as string;
  const localizations = ref<LocalizationDto[]>([]);

  const breadcrumbItems = computed(() => [
    {
      title: t("doctors.breadcrumbTitle"),
      to: "/aerzte",
    },
    {
      title: fixedBlocks.value?.hero?.headline,
    },
  ]);

  async function fetchPage(): Promise<boolean> {
    const route = useRoute();
    const slug = route.params.slug as string;

    const { data, error } = await useStrapiFetch<any>(
      `/api/employees/by-slug/${slug}`,
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

    page.value = data.value.data;
    localizations.value = data.value.data.localizations;

    return true;
  }

  const fixedBlocks = computed(() => mapDoctorPageBlocks(page.value));

  const seo = computed(() => ({
    metaTitle: fixedBlocks.value?.hero?.headline,
    metaDescription: t("doctors.doctor.seo.description", {
      role: fixedBlocks.value?.hero?.subline,
      brandName: brandName,
      cities: page.value?.locations
        .map((location: any) => location.city)
        .join(", "),
    }),
  }));

  return {
    fetchPage,
    fixedBlocks,
    seo,
    breadcrumbItems,
    localizations,
  };
}
