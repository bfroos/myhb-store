import type {
  LocationDto,
  TreatmentPageDto,
} from "~/lib/strapi/dto/collections";
import type { BreadcrumbItem } from "~/lib/ui/types";
import { mapLocationFixedBlocks } from "~/lib/strapi/mapper/mapLocationPageBlocks";
import type { LocalizationDto } from "~/lib/strapi/dto/types";
import type { LocationOpenStatus } from "~/lib/strapi/dto/enums";

export function useLocationPage() {
  const { locale, fallbackLocale, t } = useI18n();
  const { isAdsMode } = useSiteModeFlags();
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
    const endpoint = isAdsMode.value
      ? `/locations/${citySlug}/${locationSlug}/with-treatments-ads`
      : `/locations/${citySlug}/${locationSlug}/with-treatments`;

    const { data, error } = await useStrapiFetch<any>(
      endpoint,
      {
        query: {
          locale: currentLocale,
        },
        fetchOptions: {
          key: `location-page:${currentLocale}:${citySlug}:${locationSlug}:${isAdsMode.value ? "ads" : "seo"}`,
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

  const { brandName, brandNameShort } = useBrand();
  const fixedBlocks = computed(() =>
    mapLocationFixedBlocks(
      location.value as LocationDto,
      locationOpenStatus.value as LocationOpenStatus,
      brandName.value,
      treatmentPages.value,
    ),
  );

  const seo = computed(() => {
    const loc = location.value;
    const locationType = loc?.type
      ? t(`locations.location.locationType.${loc.type}`)
      : "";
    return {
      metaTitle: t("locations.location.seo.title", {
        brandNameShort: brandNameShort.value,
        locationType,
        street: loc?.address?.street ?? "",
        houseNumber: loc?.address?.houseNumber ?? "",
        postalCode: loc?.address?.postalCode ?? "",
        city: loc?.city?.name ?? "",
        locationName: loc?.name ?? "",
      }),
      metaDescription: t("locations.location.seo.description", {
        brandName: brandName.value,
        city: loc?.city?.name ?? "",
        location: loc?.name ?? "",
        locationName: loc?.name ?? "",
      }),
    };
  });

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
