import { mapTreatmentPageFixedBlocks } from "~/lib/strapi/mapper/mapTreatmentPageBlocks";
import type { TreatmentPageDto } from "~/lib/strapi/dto/collections";
import type { BreadcrumbItem } from "~/lib/ui/types";
import type { LocalizationDto, StrapiBlock } from "~/lib/strapi/dto/types";
import type { SharedSeoDto } from "~/lib/strapi/dto/components";

export function useTreatmentPage() {
  const { locale, fallbackLocale, t } = useI18n();
  const route = useRoute();
  const currentLocale = (locale.value || fallbackLocale.value) as string;
  const treatmentPage = ref<TreatmentPageDto>();
  const localizations = ref<LocalizationDto[]>([]);
  const seo = ref<SharedSeoDto>();
  const blocks = ref<StrapiBlock[]>([]);

  const treatmentBreadcrumbItems = computed<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [];
    let pathPrefix = "";

    // Build breadcrumb items for each ancestor (always linked)
    if (
      treatmentPage.value?.ancestors &&
      treatmentPage.value.ancestors.length > 0
    ) {
      treatmentPage.value.ancestors.forEach((ancestor) => {
        pathPrefix = pathPrefix
          ? `${pathPrefix}/${ancestor.slug}`
          : ancestor.slug;

        items.push({
          title: ancestor.name,
          to: `/behandlungen/${pathPrefix}`,
        });
      });
    }

    // Add current treatment page as last breadcrumb item (without link)
    if (treatmentPage.value?.name) {
      items.push({
        title: treatmentPage.value.name,
        to: undefined, // Last item has no link
      });
    }

    return items;
  });

  const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
    {
      title: t("treatments.breadcrumbTitle"),
      to: "/behandlungen",
    },
    ...(treatmentBreadcrumbItems.value ?? []),
  ]);

  async function fetchTreatment(): Promise<boolean> {
    const treatmentPathKey = (route.params.slug as string[])
      .filter(Boolean)
      .join("/");

    const { data, error, status } = await useStrapiFetch<any>(
      `/api/treatment-pages/by-path/${treatmentPathKey}`,
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

    treatmentPage.value = data.value.data as any;
    localizations.value = (data.value.data.localizations ??
      []) as LocalizationDto[];
    seo.value = data.value.data.seo as SharedSeoDto;
    blocks.value = (data.value.data.blocks ?? []) as StrapiBlock[];

    return true;
  }

  const fixedBlocks = computed(() =>
    mapTreatmentPageFixedBlocks(treatmentPage.value),
  );

  return {
    fetchTreatment,
    fixedBlocks,
    breadcrumbItems,
    seo,
    localizations,
    blocks,
  };
}
