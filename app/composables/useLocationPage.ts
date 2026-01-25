import type {
  LocationDto,
  TreatmentPageDto,
} from "~/lib/strapi/dto/collections";
import type { BreadcrumbItem } from "~/lib/ui/types";
import { mapLocationFixedBlocks } from "~/lib/strapi/mapper/mapLocationPageBlocks";
import type { LocalizationDto } from "~/lib/strapi/dto/types";
import type { LocationOpenStatus } from "~/lib/strapi/dto/enums";

export function useLocationPage(brandName: string) {
  const { locale, fallbackLocale, t } = useI18n();
  const route = useRoute();
  const currentLocale = (locale.value || fallbackLocale.value) as string;
  const location = ref<LocationDto | null>(null);
  const citySlug = route.params.citySlug as string;
  const locationSlug = route.params.locationSlug as string;
  const locationLocalizations = ref<LocalizationDto[]>([]);
  const cityLocalizations = ref<LocalizationDto[]>([]);
  const locationOpenStatus = ref<LocationOpenStatus>();
  const treatmentPages = ref<TreatmentPageDto[]>([]);

  const breadcrumbItems = computed<BreadcrumbItem[]>(() => [
    {
      title: t("locations.breadcrumbTitle"),
      to: "/standorte",
    },
    {
      title: location.value?.city?.name ?? "",
      to: `/standorte/${citySlug}`,
    },
    {
      title: location.value?.name ?? "",
    },
  ]);

  async function fetchWithTreatments(): Promise<boolean> {
    const { data, error } = await useStrapiFetch<any>(
      `/locations/${citySlug}/${locationSlug}/with-treatments`,
      {
        query: {
          locale: currentLocale,
        },
        fetchOptions: {
          key: `location-page:${currentLocale}:${citySlug}:${locationSlug}`,
        },
      },
    );

    if (error.value) {
      throw handleFetchError(error.value, t);
    }

    if (!data.value?.data) {
      throw handleNotFound(t);
    }

    location.value = data.value.data.location;
    treatmentPages.value = data.value.data.treatmentPages;
    locationLocalizations.value = data.value.data.location?.localizations ?? [];
    cityLocalizations.value =
      data.value.data.location?.city?.localizations ?? [];
    locationOpenStatus.value = data.value.data.locationOpenStatus;

    return true;
  }

  const fixedBlocks = computed(() =>
    mapLocationFixedBlocks(
      location.value as LocationDto,
      locationOpenStatus.value as LocationOpenStatus,
      brandName,
      treatmentPages.value,
    ),
  );

  const seo = computed(() => ({
    metaTitle: t("locations.location.seo.title", {
      locationName: location.value?.name ?? "",
    }),
    metaDescription: t("locations.location.seo.description", {
      locationName: location.value?.name ?? "",
      city: location.value?.city?.name ?? "",
    }),
  }));

  return {
    fetchWithTreatments,
    location,
    fixedBlocks,
    breadcrumbItems,
    locationLocalizations,
    cityLocalizations,
    seo,
  };
}
