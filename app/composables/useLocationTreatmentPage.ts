import { mapLocationTreatmentPageFixedBlocks } from "~/lib/strapi/mapper/mapLocationTreatmentPageBlocks";
import type {
  LocationDto,
  TreatmentPageDto,
} from "~/lib/strapi/dto/collections";
import type { BreadcrumbItem } from "~/lib/ui/types";
import type { SharedSeoDto } from "~/lib/strapi/dto/components";
import type { LocationOpenStatus } from "~/lib/strapi/dto/enums";
import type { LocalizationDto } from "~/lib/strapi/dto/types";
import {
  buildNewCustomerOffer,
  isSurgeryPathKey,
  newCustomerPriceLabel,
} from "#shared/newCustomerOffer";
import { adsTreatmentHeadline } from "~/lib/strapi/mapper/adsTreatmentHeadline";

export function useLocationTreatmentPage() {
  const { locale, fallbackLocale, localeProperties, t } = useI18n();
  const { isAdsMode } = useSiteModeFlags();
  const route = useRoute();
  const currentLocale = locale.value || fallbackLocale.value;
  const treatmentPage = ref<TreatmentPageDto>();
  const location = ref<LocationDto | null>(null);
  const { setzeSeitenStandort } = useSeitenStandort();
  const { setzeSeitenBehandlung } = useSeitenBehandlung();
  const citySlug = route.params.citySlug as string;
  const locationSlug = route.params.locationSlug as string;
  const locationLocalizations = ref<LocalizationDto[]>([]);
  const cityLocalizations = ref<LocalizationDto[]>([]);
  const treatmentPageLocalizations = ref<LocalizationDto[]>([]);
  const locationOpenStatus = ref<LocationOpenStatus>();
  const availableTreatmentPathKeys = ref<string[] | undefined>();
  const strapiSeo = ref<SharedSeoDto | null>(null);

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
    const pagePath = `/treatment-pages/${citySlug}/${locationSlug}/${treatmentPathKey}`;
    const pageQuery = { locale: currentLocale };
    const pageKey = `location-treatment-page:${currentLocale}:${citySlug}:${locationSlug}:${treatmentPathKey}`;

    // Ads-Modus: Einige Behandlungen gibt es im Ads-Baum nur als "-rabatt"-
    // Variante (z. B. muskelrelaxans/lachfalten). Anzeigen auf die Grundseite
    // liefen dann auf 404. Fehlt die Grundseite, wird die "-rabatt"-Seite
    // geladen und wie eine Grundseite gezeigt. (Die Knoepfe im Hero setzt der
    // Ads-Modus inzwischen ohnehin fest: Termin buchen + Rabatt, TreatmentHero.)
    const rabattFallbackPathKey =
      isAdsMode.value && !treatmentPathKey.endsWith("-rabatt")
        ? `${treatmentPathKey}-rabatt`
        : null;

    const { data, error } = rabattFallbackPathKey
      ? await useAsyncData<any>(pageKey, async () => {
          try {
            return await strapiFetch<any>(pagePath, { query: pageQuery });
          } catch (err: any) {
            if ((err?.statusCode ?? err?.status) !== 404) throw err;
            const fallback = await strapiFetch<any>(
              `/treatment-pages/${citySlug}/${locationSlug}/${rabattFallbackPathKey}`,
              { query: pageQuery },
            );
            const page = fallback?.data?.treatmentPage;
            if (page) {
              page.hero = {
                ...(page.hero ?? {}),
                showDiscount: false,
                showBookingButton: true,
              };
            }
            return fallback;
          }
        })
      : await useStrapiFetch<any>(pagePath, {
          query: pageQuery,
          fetchOptions: { key: pageKey },
        });

    if (error.value) {
      throw handleFetchError(error.value, t);
    }

    if (!data.value?.data) {
      throw handleNotFound(t);
    }

    treatmentPage.value = data.value.data.treatmentPage;
    location.value = data.value.data.location;
    // #78: siehe useLocationPage — der Standort der Seite traegt alle
    // Buchungsknoepfe darauf.
    setzeSeitenStandort(data.value.data.location);
    // #78: ... und die Behandlung der Seite ebenso (Kontextzeile im Dialog).
    setzeSeitenBehandlung(data.value.data.treatmentPage);
    locationLocalizations.value = data.value.data.location?.localizations ?? [];
    cityLocalizations.value =
      data.value.data.location?.city?.localizations ?? [];
    treatmentPageLocalizations.value =
      data.value.data.treatmentPage?.localizations ?? [];
    locationOpenStatus.value = data.value.data.locationOpenStatus;
    availableTreatmentPathKeys.value =
      data.value.data.availableTreatmentPathKeys ?? undefined;
    strapiSeo.value = (data.value.data.seo ?? null) as SharedSeoDto | null;

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
      availableTreatmentPathKeys.value,
    ),
  );

  const { brandName, brandNameShort } = useBrand();
  const globals = useGlobals();
  
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
  
  const generatedSeo = computed(() => {
    const loc = location.value;
    const treatmentName = treatmentPage.value?.name ?? "";
    
    // Only optimize SEO for www. (seo mode), not go. (ads mode)
    if (isAdsMode.value) {
      // Ads mode: Neukundenpreis wie auf der Seite ("ab 119,99 €*"), sonst
      // ohne Preis. Leerzeichen zusammenziehen: ein leerer {priceTag}
      // hinterliess ein doppeltes Leerzeichen im <title> (#186).
      const treatment = treatmentPage.value?.treatment;
      const price =
        treatment?.priceInEuroCent || treatment?.cheapestPriceInEuroCent;
      // Titel nennt denselben Preis wie der Hero: bei Muskelrelaxans-Zonen
      // "ab 79,99 € pro Zone*" statt des 1-Zonen-Preises (30.09.2026).
      const offer =
        currentLocale === "de"
          ? buildNewCustomerOffer({
              pathKey: treatmentPage.value?.pathKey,
              priceCent: price,
              isStartingPrice: treatment?.isStartingPrice,
              twoZonePriceCent: (treatment?.products ?? [])
                .flatMap((product: any) => product.variants ?? [])
                .find(
                  (variant: any) =>
                    variant.slug === "2-zonen" && variant.isActive !== false,
                )?.priceInEuroCent,
              discountPct:
                globals.value?.ecommerce?.newsletterDiscountPercentage,
            })
          : null;
      const priceTag =
        (currentLocale === "de" &&
          !isSurgeryPathKey(treatmentPage.value?.pathKey) &&
          (offer?.heroLine.replace(/^Neukunden\s+/, "") ||
            newCustomerPriceLabel(
              price,
              treatment?.isStartingPrice ? "ab" : "",
            ))) ||
        "";
      // go.: Titel und Beschreibung mit der H1 in Suchsprache ("Stirnfalte
      // glätten in Köln"), shared/adsHeadlines.ts. Die Stadt steckt dann
      // schon in der Ueberschrift.
      const searchHeadline = adsTreatmentHeadline(
        treatmentPage.value?.pathKey,
        loc?.city?.name ?? "",
        currentLocale,
      );
      const titleName = searchHeadline ?? treatmentName;
      const titleCity = searchHeadline ? "" : loc?.city?.name ?? "";
      return {
        metaTitle: t("locations.location.locationTreatment.seo.title", {
          treatmentName: titleName,
          city: titleCity,
          priceTag,
          brandName: brandName.value,
        })
          .replace(/\s+/g, " ")
          .trim(),
        metaDescription: t(
          "locations.location.locationTreatment.seo.description",
          {
            treatmentName: titleName,
            city: titleCity,
            locationName: loc?.name ?? "",
          },
        )
          .replace(/\s+:/g, ":")
          .replace(/\s+/g, " ")
          .trim(),
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

  // Gepflegtes CMS-SEO gewinnt feldweise, sonst bleibt es beim generierten Text.
  const seoWithFallback = computed(() => ({
    ...(strapiSeo.value ?? {}),
    metaTitle: strapiSeo.value?.metaTitle || generatedSeo.value.metaTitle,
    metaDescription:
      strapiSeo.value?.metaDescription || generatedSeo.value.metaDescription,
  }));

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
    seo: seoWithFallback,
    treatmentPrice, // Expose for schema
  };
}
