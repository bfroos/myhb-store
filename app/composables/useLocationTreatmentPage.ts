import { mapLocationTreatmentPageFixedBlocks } from "~/lib/strapi/mapper/mapLocationTreatmentPageBlocks";
import type {
  LocationDto,
  TreatmentPageDto,
} from "~/lib/strapi/dto/collections";
import type { BreadcrumbItem } from "~/lib/ui/types";
import type { LocationOpenStatus } from "~/lib/strapi/dto/enums";
import type { LocalizationDto } from "~/lib/strapi/dto/types";

export function useLocationTreatmentPage() {
  const { locale, fallbackLocale, localeProperties, t } = useI18n();
  const { isAdsMode } = useSiteModeFlags();
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
      t,
      (locale.value || fallbackLocale.value) as string,
      localeProperties.value?.iso as string | undefined,
      isAdsMode.value,
    ),
  );

  const { brandName, brandNameShort } = useBrand();
  
  // Price fallback: fetch from general treatment page if location treatment has no price
  const treatmentPrice = ref<number | null>(null);
  
  async function fetchTreatmentPrice() {
    // 1. Try location treatment price (usually null)
    let price = treatmentPage.value?.treatment?.priceInEuroCent 
      ?? treatmentPage.value?.treatment?.cheapestPriceInEuroCent;
    
    // 2. Fallback: Fetch from general treatment page
    if (!price && treatmentPage.value?.pathKey) {
      try {
        const { data } = await useStrapiFetch<any>(
          `/treatment-pages/by-path/${treatmentPage.value.pathKey}`,
          {
            query: { locale: currentLocale },
            fetchOptions: {
              key: `general-treatment-price:${currentLocale}:${treatmentPage.value.pathKey}`,
            },
          }
        );
        
        price = data.value?.data?.treatment?.priceInEuroCent 
          ?? data.value?.data?.treatment?.cheapestPriceInEuroCent;
      } catch (e) {
        // Silently fail, use ultimate fallback
      }
    }
    
    treatmentPrice.value = price;
  }
  
  const seo = computed(() => {
    const loc = location.value;
    const treatmentName = treatmentPage.value?.name ?? "";
    
    // Only optimize SEO for www. (seo mode), not go. (ads mode)
    if (isAdsMode.value) {
      // Ads mode: Keep original SEO structure
      return {
        metaTitle: t("locations.location.locationTreatment.seo.title", {
          treatmentName,
          city: loc?.city?.name ?? "",
          priceTag: "", // No price in ads mode
          brandName: brandName.value,
        }),
        metaDescription: t(
          "locations.location.locationTreatment.seo.description",
          {
            treatmentName,
            city: loc?.city?.name ?? "",
            locationName: loc?.name ?? "",
          },
        ),
      };
    }
    
    // SEO mode (www.): Optimized with price
    const startPrice = treatmentPrice.value 
      ? Math.floor(treatmentPrice.value / 100) 
      : 149; // Ultimate fallback
    
    const priceTag = `ab ${startPrice}€`;
    
    return {
      metaTitle: t("locations.location.locationTreatment.seo.title", {
        treatmentName,
        city: loc?.city?.name ?? "",
        priceTag,
        brandName: brandName.value, // Use full brand name (MY HEALTH & BEAUTY)
      }),
      metaDescription: t(
        "locations.location.locationTreatment.seo.description",
        {
          treatmentName,
          city: loc?.city?.name ?? "",
          locationName: loc?.name ?? "",
        },
      ),
    };
  });

  return {
    fetchPage,
    fetchTreatmentPrice,
    fixedBlocks,
    breadcrumbItems,
    locationLocalizations,
    cityLocalizations,
    treatmentPageLocalizations,
    treatmentPage,
    location,
    seo,
    treatmentPrice, // Expose for schema
  };
}
