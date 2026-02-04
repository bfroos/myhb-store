import { mapLocationTreatmentPageFixedBlocks } from "~/lib/strapi/mapper/mapLocationTreatmentPageBlocks";
import type {
  LocationDto,
  TreatmentPageDto,
} from "~/lib/strapi/dto/collections";
import type { BreadcrumbItem } from "~/lib/ui/types";
import type { LocationOpenStatus } from "~/lib/strapi/dto/enums";
import type { LocalizationDto } from "~/lib/strapi/dto/types";

export function useLocationTreatmentPage() {
  const { locale, fallbackLocale, t } = useI18n();
  const route = useRoute();
  const currentLocale = locale.value || fallbackLocale.value;
  const treatmentPage = ref<TreatmentPageDto>();
  const location = ref<LocationDto | null>(null);
  const citySlug = route.params.citySlug as string;
  const locationSlug = route.params.locationSlug as string;
  const locationLocalizations = ref<LocalizationDto[]>([]);
  const cityLocalizations = ref<LocalizationDto[]>([]);
  const treatmentPageLocalizations = ref<LocalizationDto[]>([]);
  const locationOpenStatus = ref<LocationOpenStatus>();

  const treatmentPathKey = (route.params.treatmentSlug as string[])
    .filter(Boolean)
    .join("/");

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
          to: `/standorte/${citySlug}/${locationSlug}/${pathPrefix}`,
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
      title: t("locations.breadcrumbTitle"),
      to: "/standorte",
    },
    {
      title: location.value?.city?.name ?? "",
      to: `/standorte/${citySlug}`,
    },
    {
      title: location.value?.name ?? "",
      to: `/standorte/${citySlug}/${locationSlug}`,
    },
    ...(treatmentBreadcrumbItems.value ?? []),
  ]);

  async function fetchPage(): Promise<boolean> {
    const { data, error } = await useStrapiFetch<any>(
      `/treatment-pages/${citySlug}/${locationSlug}/${treatmentPathKey}`,
      {
        query: {
          locale: currentLocale,
        },
        fetchOptions: {
          key: `location-treatment-page:${currentLocale}:${citySlug}:${locationSlug}:${treatmentPathKey}`,
        },
      },
    );

    if (error.value) {
      throw handleFetchError(error.value, t);
    }

    if (!data.value?.data) {
      throw handleNotFound(t);
    }

    treatmentPage.value = data.value.data.treatmentPage;
    location.value = data.value.data.location;
    locationLocalizations.value = data.value.data.location?.localizations ?? [];
    cityLocalizations.value =
      data.value.data.location?.city?.localizations ?? [];
    treatmentPageLocalizations.value =
      data.value.data.treatmentPage?.localizations ?? [];
    locationOpenStatus.value = data.value.data.locationOpenStatus;

    return true;
  }

  const fixedBlocks = computed(() =>
    mapLocationTreatmentPageFixedBlocks(
      treatmentPage.value as TreatmentPageDto,
      location.value as LocationDto,
      location.value?.openingStatus as LocationOpenStatus,
    ),
  );

  const { brandName, brandNameShort } = useBrand();
  const seo = computed(() => {
    const loc = location.value;
    const treatmentName = treatmentPage.value?.name ?? "";
    const locationType = loc?.type
      ? t(`locations.location.locationType.${loc.type}`)
      : "";
    return {
      metaTitle: t("locations.location.locationTreatment.seo.title", {
        treatmentName,
        brandNameShort: brandNameShort.value,
        locationName: loc?.name ?? "",
        city: loc?.city?.name ?? "",
      }),
      metaDescription: t(
        "locations.location.locationTreatment.seo.description",
        {
          brandName: brandName.value,
          city: loc?.city?.name ?? "",
          locationName: loc?.name ?? "",
          treatmentName,
        },
      ),
    };
  });

  return {
    fetchPage,
    fixedBlocks,
    breadcrumbItems,
    locationLocalizations,
    cityLocalizations,
    treatmentPageLocalizations,
    seo,
  };
}
