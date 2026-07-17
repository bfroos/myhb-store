import { mapTreatmentPageFixedBlocks } from "~/lib/strapi/mapper/mapTreatmentPageBlocks";
import type { TreatmentPageDto } from "~/lib/strapi/dto/collections";
import type { BreadcrumbItem } from "~/lib/ui/types";
import type { LocalizationDto, StrapiBlock } from "~/lib/strapi/dto/types";
import type { SharedSeoDto } from "~/lib/strapi/dto/components";

export function useTreatmentPage() {
  const { locale, fallbackLocale, locales, t } = useI18n();
  const { isAdsMode } = useSiteModeFlags();
  const route = useRoute();
  const currentLocale = (locale.value || fallbackLocale.value) as string;
  const treatmentPage = ref<TreatmentPageDto>();
  const localizations = ref<LocalizationDto[]>([]);
  const seo = ref<SharedSeoDto>();
  const blocks = ref<StrapiBlock[]>([]);

  /**
   * Resolves the treatment pathKey (e.g. "botox/3-zonen-botox-preise") from the
   * current route.
   *
   * The catch-all param (`route.params.slug`) is reliable on client-side
   * navigation, but for the i18n-translated catch-all routes
   * (e.g. /en/treatments/[...slug]) it is NOT reliably populated during
   * server-side rendering. That caused localized detail pages to 404 on direct
   * load / ISR while working after client navigation.
   *
   * To be robust in both SSR and client we derive the pathKey from the URL path:
   * strip the leading locale prefix (e.g. "/en") and the localized section
   * segment (treatments / traitements / tedaviler / ilajat / behandelingen /
   * behandlungen), the remaining segments form the pathKey.
   */
  function resolveTreatmentPathKey(): string {
    const localeCodes = (locales.value as Array<string | { code: string }>).map(
      (l) => (typeof l === "string" ? l : l.code),
    );

    const segments = (route.path || "")
      .split("/")
      .filter(Boolean)
      .map((s) => decodeURIComponent(s));

    // Drop the locale prefix for non-default locales (e.g. /en, /fr, ...)
    if (segments.length > 0 && localeCodes.includes(segments[0] as string)) {
      segments.shift();
    }

    // Drop the (localized) section segment (treatments / behandlungen / ...)
    segments.shift();

    const fromPath = segments.filter(Boolean).join("/");
    if (fromPath) return fromPath;

    // Fallback: catch-all param (covers any edge case the path parsing misses)
    const slugParam = route.params.slug;
    return (Array.isArray(slugParam) ? slugParam : slugParam ? [slugParam] : [])
      .filter(Boolean)
      .join("/");
  }

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
    const treatmentPathKey = resolveTreatmentPathKey();

    const { data, error, status } = await useStrapiFetch<any>(
      `/treatment-pages/by-path/${treatmentPathKey}`,
      {
        query: {
          locale: currentLocale,
        },
        fetchOptions: {
          key: `treatment-page:${currentLocale}:${treatmentPathKey}`,
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
    mapTreatmentPageFixedBlocks(treatmentPage.value, t, isAdsMode.value),
  );

  const { brandName } = useBrand();

  const seoWithFallback = computed(() => {
    const treatmentName = treatmentPage.value?.name ?? "";
    const price = treatmentPage.value?.treatment?.priceInEuroCent;

    // Format price for SEO (convert cents to EUR).
    // NOTE: The "ab"/"from" prefix comes from the i18n title template
    // ("{treatmentName} ab {priceTag} …"), so priceTag must NOT include it,
    // otherwise the title renders "ab ab 149€".
    const startPrice = price ? Math.floor(price / 100) : 149; // Fallback
    const priceTag = `${startPrice}€`;

    // Prefer the editor-managed SEO from Strapi; only fall back to the
    // generated "{treatmentName} ab {priceTag}" template when no metaTitle /
    // metaDescription is set in the CMS. (Previously the template ALWAYS won,
    // so custom titles like the Schoenheits-OP price range were ignored.)
    const strapiSeo = seo.value;

    return {
      ...(strapiSeo ?? {}),
      metaTitle:
        strapiSeo?.metaTitle ||
        t("treatment.seo.title", {
          treatmentName,
          priceTag,
          brandName: brandName.value,
        }),
      metaDescription:
        strapiSeo?.metaDescription ||
        t("treatment.seo.description", {
          treatmentName,
        }),
    };
  });

  return {
    fetchTreatment,
    fixedBlocks,
    breadcrumbItems,
    seo: seoWithFallback,
    localizations,
    blocks,
    treatmentPage,
  };
}
