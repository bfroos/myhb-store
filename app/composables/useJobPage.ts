import type { LocationDto } from "~/lib/strapi/dto/collections";
import type { LocalizationDto, StrapiBlock } from "~/lib/strapi/dto/types";
import { mapJobPageBlocks } from "~/lib/strapi/mapper/mapJobPageBlocks";
import type { BreadcrumbItem } from "~/lib/ui/types";

export function useJobPage() {
  const { locale, fallbackLocale, t } = useI18n();
  const currentLocale = (locale.value || fallbackLocale.value) as string;
  const jobPage = ref<any | null>(null);
  const jobDetails = ref<any | null>(null);
  const blocks = ref<StrapiBlock[]>([]);
  const localizations = ref<LocalizationDto[]>([]);

  const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
    {
      title: t("career.breadcrumbTitle"),
      to: "/karriere",
    },
    {
      title: jobDetails.value?.title,
    },
  ]);

  function normalizeEnumArray(value: unknown): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    return [String(value)];
  }

  async function fetchJobPage(): Promise<boolean> {
    const route = useRoute();
    const slug = route.params.slug as string;

    const { data, error } = await useStrapiFetch<any>(`/job-pages/${slug}`, {
      query: {
        locale: currentLocale,
      },
      fetchOptions: {
        key: `job-page:${currentLocale}:${slug}`,
      },
    });

    if (error.value) {
      throw handleFetchError(error.value, t);
    }

    if (!data.value?.data) {
      throw handleNotFound(t);
    }

    jobPage.value = data.value.data.jobPage;
    jobDetails.value = data.value.data.jobDetails;
    blocks.value = data.value.data.jobPage?.blocks;
    localizations.value = (data.value.data.jobPage?.localizations ??
      []) as LocalizationDto[];

    return true;
  }

  const metaTitle = computed(() =>
    t("career.job.seo.title", {
      title: jobDetails.value?.title,
      genderHint: jobDetails.value?.genderHint,
      employmentType: normalizeEnumArray(
        jobDetails.value?.employmentTypes ?? jobDetails.value?.employmentType,
      )
        .map((type) => t(`career.job.employmentType.${type}`))
        .join(", "),
    }),
  );

  const metaDescription = computed(() =>
    t("career.job.seo.description", {
      title: jobDetails.value?.title,
      locations: jobDetails.value?.locations
        ?.map((location: LocationDto) => location.city?.name)
        .filter((name: any): name is string => Boolean(name))
        .join(", "),
      contractType: normalizeEnumArray(
        jobDetails.value?.contractTypes ?? jobDetails.value?.contractType,
      )
        .map((type) => t(`career.job.contractType.${type}`))
        .join(", "),
    }),
  );

  const seo = computed(() => ({
    metaTitle: metaTitle.value,
    metaDescription: metaDescription.value,
  }));

  const fixedBlocks = computed(() => mapJobPageBlocks(jobDetails.value));

  return {
    fetchJobPage,
    jobPage,
    fixedBlocks,
    blocks,
    localizations,
    seo,
    breadcrumbItems,
  };
}
