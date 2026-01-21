import type { LocationDto } from "~/lib/strapi/dto/collections";
import type { SharedSeoDto } from "~/lib/strapi/dto/components";
import type { LocationsPageWithLocationsDto } from "~/lib/strapi/dto/singleTypes";
import type { StrapiBlock } from "~/lib/strapi/dto/types";

export function useLocationsPage() {
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
  const seo = ref<SharedSeoDto | null>(null);
  const blocks = ref<StrapiBlock[]>([]);
  const currentLocale = (locale.value || fallbackLocale.value) as string;

  const breadcrumbItems = computed(() => [
    {
      title: t("locations.breadcrumbTitle"),
    },
  ]);

  async function fetchWithLocations(): Promise<boolean> {
    const { data, error } = await useStrapiFetch<{
      data: LocationsPageWithLocationsDto;
    }>(`/api/locations-page/with-locations`, {
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

    locations.value = data.value.data.locations as {
      open: LocationDto[];
      openSoon: LocationDto[];
      comingSoon: LocationDto[];
    };

    seo.value = data.value.data.locationsPage?.seo as SharedSeoDto;
    blocks.value = data.value.data.blocks as StrapiBlock[];

    return true;
  }

  return {
    fetchWithLocations,
    locations,
    seo,
    blocks,
    breadcrumbItems,
  };
}
