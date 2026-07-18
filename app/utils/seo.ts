import type { SharedSeoDto } from "~/lib/strapi/dto/components";
import type { StrapiMedia } from "~/lib/strapi/dto/types";

/**
 * Fallback share image (Open Graph / Twitter) used when a page has neither a
 * page-level ogImage (Strapi) nor a content image (e.g. article cover).
 * Prevents pages like the homepage, category, doctors and blog index from
 * shipping without a social preview image. Landscape JPEG (~1100x643).
 */
const DEFAULT_OG_IMAGE =
  "https://media.myhb.app/MY_Mediapark_Klinik_ab8eb15667.jpg";

function toOgImageValue(
  media: StrapiMedia | null | undefined,
): string | undefined {
  return media?.url ?? undefined;
}

/**
 * Map i18n locale codes to Open Graph locale format.
 * Open Graph expects "ll_CC" (e.g. "de_DE"), while i18n uses "ll" codes.
 * Defaults to "de_DE" when the locale is unknown.
 */
export function mapStrapiLocaleToOpenGraphLocale(locale: string): string {
  const map = {
    de: "de_DE",
    en: "en_US",
    tr: "tr_TR",
    ar: "ar_SA",
    fr: "fr_FR",
    nl: "nl_NL",
  };
  return map[locale as keyof typeof map] || "de_DE";
}

/**
 * Apply SEO metadata for the current route.
 * Uses page-level SEO when provided and falls back to global defaults.
 * Also sets canonical URL, favicon, html lang, and Open Graph tags.
 * @param pageSeo - SEO data from the page
 * @param fallbackOgImage - Fallback image (e.g. article.cover) when ogImage is not set
 */
export async function setPageSeo(
  pageSeo?: SharedSeoDto | null,
  fallbackOgImage?: StrapiMedia | null,
): Promise<void> {
  const nuxtApp = useNuxtApp();
  const { locale, fallbackLocale, locales } = useI18n();
  const route = useRoute();
  const switchLocalePath = useSwitchLocalePath();
  const currentLocale = (locale.value || fallbackLocale.value) as string;
  const config = useRuntimeConfig();
  const globals = useGlobals();
  const globalsSeo = globals.value?.seo;
  const { brandName } = useBrand();
  const canonicalUrl = `${config.public.publicUrl}${route.path}`;

  const robots = computed(() => {
    if (pageSeo?.metaRobots) return pageSeo.metaRobots;
    const { isAdsMode } = useSiteModeFlags();
    return isAdsMode.value ? "noindex, nofollow" : "index, follow";
  });

  nuxtApp.runWithContext(() => {
    // Hreflang für multilinguale SEO
    const hreflangLinks = [
      {
        rel: "alternate",
        hreflang: "x-default",
        href: canonicalUrl,
      },
    ];

    // Füge hreflang für alle verfügbaren Sprachen hinzu
    const localesList = Array.isArray(locales.value) ? locales.value : [];
    localesList.forEach((loc: any) => {
      const localeCode = typeof loc === "string" ? loc : loc.code;
      const localePath = switchLocalePath(localeCode);
      if (localePath) {
        hreflangLinks.push({
          rel: "alternate",
          hreflang: localeCode,
          href: `${config.public.publicUrl}${localePath}`,
        });
      }
    });

    useHead({
      link: [
        {
          rel: "canonical",
          href: canonicalUrl,
        },
        ...hreflangLinks,
      ],
    });


    // Only append titleSuffix if it's not already in the metaTitle
    const metaTitle = pageSeo?.metaTitle || globalsSeo?.defaultTitle || "";
    const titleSuffix = globalsSeo?.titleSuffix || "";
    const titleSeparator = globalsSeo?.titleSeparator || "";
    
    const title = metaTitle.includes(titleSuffix)
      ? metaTitle // Already contains brand name, don't append
      : [metaTitle, titleSeparator, titleSuffix]
          .filter(Boolean)
          .join(" ");

    const ogTitle = pageSeo?.openGraph?.ogTitle
      ? pageSeo.openGraph.ogTitle
      : metaTitle.includes(titleSuffix)
      ? metaTitle // Already contains brand name, don't append
      : [
          metaTitle,
          titleSeparator,
          titleSuffix,
        ]
          .filter(Boolean)
          .join(" ");

    const ogImage =
      toOgImageValue(pageSeo?.openGraph?.ogImage) ??
      toOgImageValue(fallbackOgImage) ??
      DEFAULT_OG_IMAGE;

    useSeoMeta({
      title,
      description: pageSeo?.metaDescription || globalsSeo?.defaultDescription,
      robots: robots.value,
      ogType: "website",
      ogLocale: mapStrapiLocaleToOpenGraphLocale(currentLocale),
      ogUrl: canonicalUrl,
      ogSiteName: brandName.value,
      ogTitle,
      ogDescription:
        pageSeo?.openGraph?.ogDescription ||
        pageSeo?.metaDescription ||
        globalsSeo?.defaultDescription,
      ogImage,
      twitterCard: "summary_large_image",
      twitterSite: "@myhealthbeauty",
      twitterTitle: title,
      twitterDescription: pageSeo?.metaDescription || globalsSeo?.defaultDescription,
      twitterImage: ogImage,
    });
  });
}
