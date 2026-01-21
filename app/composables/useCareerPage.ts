import { mapCareerPageBlocks } from "~/lib/strapi/mapper/mapCareerPageBlocks";
import type { SharedSeoDto } from "~/lib/strapi/dto/components";
import type { JobDto } from "~/lib/strapi/dto/collections";
import type { StrapiBlock } from "~/lib/strapi/dto/types";
import type {
  CareerPageDto,
  CareerPageWithJobsDto,
} from "~/lib/strapi/dto/singleTypes";

export function useCareerPage() {
  const { locale, fallbackLocale, t } = useI18n();
  const currentLocale = (locale.value || fallbackLocale.value) as string;
  const seo = ref<SharedSeoDto | null>(null);
  const topBlocks = ref<StrapiBlock[]>([]);
  const bottomBlocks = ref<StrapiBlock[]>([]);
  const jobs = ref<JobDto[]>([]);
  const careerPage = ref<CareerPageDto | null>(null);

  async function fetchPage(): Promise<boolean> {
    const { data, error } = await useStrapiFetch<{
      data: CareerPageWithJobsDto;
    }>(`/api/career-page`, {
      query: {
        locale: currentLocale,
      },
    });

    if (error.value) {
      throw handleFetchError(error.value, t);
    }

    if (!data.value?.data || !data.value.data.careerPage) {
      throw handleNotFound(t);
    }

    careerPage.value = data.value.data.careerPage;
    seo.value = data.value.data.careerPage.seo;
    topBlocks.value = data.value.data.careerPage.topBlocks;
    bottomBlocks.value = data.value.data.careerPage.bottomBlocks;
    jobs.value = data.value.data.jobs;

    return true;
  }

  const fixedBlocks = computed(() =>
    mapCareerPageBlocks(careerPage.value, jobs.value),
  );

  return {
    fetchPage,
    seo,
    topBlocks,
    bottomBlocks,
    jobs,
    fixedBlocks,
  };
}
