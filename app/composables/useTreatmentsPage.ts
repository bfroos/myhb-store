import type { TreatmentPageGroupDto } from "~/lib/strapi/dto/responses";
export function useTreatmentsPage() {
  const { locale, fallbackLocale, t } = useI18n();
  const treatmentPageGroups = ref<TreatmentPageGroupDto[]>([]);
  const currentLocale = (locale.value || fallbackLocale.value) as string;
  const seoCategories = computed(() =>
    treatmentPageGroups.value
      .map((group) => group.groupName)
      .filter((name): name is string => Boolean(name))
      .join(", "),
  );

  async function fetchTreatmentPageGroups() {
    const { data, error } = await useStrapiFetch<any>(
      `/api/treatment-pages/listed-grouped`,
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

    treatmentPageGroups.value = data.value.data;

    return true;
  }

  const seo = computed(() => ({
    metaTitle: t("treatments.seo.title"),
    metaDescription: t("treatments.seo.description", {
      categories: seoCategories.value,
    }),
  }));

  return {
    fetchTreatmentPageGroups,
    treatmentPageGroups,
    seo,
  };
}
