import type { LocationDto } from "~/lib/strapi/dto/collections";
import type { LocalizationDto, StrapiBlock } from "~/lib/strapi/dto/types";
import { mapJobPageBlocks } from "~/lib/strapi/mapper/mapJobPageBlocks";

export function useJobPage() {
  const { locale, fallbackLocale, t } = useI18n();
  const currentLocale = (locale.value || fallbackLocale.value) as string;
  const jobPage = ref<any | null>(null);
  const jobDetails = ref<any | null>(null);
  const blocks = ref<StrapiBlock[]>([]);
  const localizations = ref<LocalizationDto[]>([]);

  async function fetchJobPage(): Promise<boolean> {
    const route = useRoute();
    const slug = route.params.slug as string;

    const { data, error } = await useStrapiFetch<any>(
      `/api/job-pages/${slug}`,
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
      employmentType: t(
        `career.job.employmentType.${jobDetails.value?.employmentType}`,
      ),
    }),
  );

  const metaDescription = computed(() =>
    t("career.job.seo.description", {
      title: jobDetails.value?.title,
      locations: jobDetails.value?.locations
        ?.map((location: LocationDto) => location.city.name)
        .join(", "),
      contractType: t(
        `career.job.contractType.${jobDetails.value?.contractType}`,
      ),
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
  };
}
