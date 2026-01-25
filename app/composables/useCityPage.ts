import type { LocationDto } from "~/lib/strapi/dto/collections";
import type { LocalizationDto, StrapiBlock } from "~/lib/strapi/dto/types";
import type { SharedSeoDto } from "~/lib/strapi/dto/components";
import { ColorTheme } from "~/lib/strapi/dto/enums";
import type { CityPageWithLocationsDto } from "~/lib/strapi/dto/singleTypes";

export function useCityPage() {
  const { locale, fallbackLocale, t } = useI18n();
  const locations = ref<{
    open: LocationDto[];
    openSoon: LocationDto[];
    comingSoon: LocationDto[];
  }>({
    open: [],
    openSoon: [],
    comingSoon: [],
  });
  const citySlug = useRoute().params.citySlug as string;
  const cityName = ref<string>("");
  const headline = ref<string>("");
  const seo = ref<SharedSeoDto | null>(null);
  const topBlocks = ref<StrapiBlock[]>([]);
  const bottomBlocks = ref<StrapiBlock[]>([]);
  const localizations = ref<LocalizationDto[]>([]);
  const currentLocale = (locale.value || fallbackLocale.value) as string;

  const breadcrumbItems = computed(() => [
    {
      title: t("locations.breadcrumbTitle"),
      to: "/standorte",
    },
    {
      title: cityName.value,
    },
  ]);

  async function fetchWithLocations(): Promise<boolean> {
    const { data, error } = await useStrapiFetch<{
      data: CityPageWithLocationsDto;
    }>(`/city-page/${citySlug}/with-locations`, {
      query: {
        locale: currentLocale,
      },
      fetchOptions: {
        key: `city-page:${currentLocale}:${citySlug}`,
      },
    });

    if (error.value) {
      throw handleFetchError(error.value, t);
    }

    if (!data.value?.data) {
      throw handleNotFound(t);
    }

    locations.value = data.value.data.locations as {
      open: LocationDto[];
      openSoon: LocationDto[];
      comingSoon: LocationDto[];
    };

    cityName.value = data.value.data.city?.name ?? "";
    localizations.value = data.value.data.city
      ?.localizations as LocalizationDto[];
    seo.value = data.value.data.cityPage?.seo as SharedSeoDto;
    topBlocks.value = data.value.data.cityPage?.topBlocks as StrapiBlock[];
    bottomBlocks.value = data.value.data.cityPage
      ?.bottomBlocks as StrapiBlock[];

    return true;
  }

  const fixedBlocks = computed(() => {
    return {
      pageHeader: getPageHeader(),
    };
  });

  function getPageHeader() {
    if (!headline.value) {
      return null;
    }

    return {
      headline: headline.value,
      cardSettings: {
        colorTheme: ColorTheme.STRONG,
      },
    };
  }

  return {
    fetchWithLocations,
    locations,
    cityName,
    localizations,
    breadcrumbItems,
    fixedBlocks,
    seo,
    topBlocks,
    bottomBlocks,
  };
}
