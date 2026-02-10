import type { SharedSeoDto } from "~/lib/strapi/dto/components";
import type { StrapiMedia } from "~/lib/strapi/dto/types";

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
  const { locale, fallbackLocale } = useI18n();
  const route = useRoute();
  const currentLocale = (locale.value || fallbackLocale.value) as string;
  const config = useRuntimeConfig();
  const globals = useGlobals();
  const globalsSeo = globals.value?.seo;
  const canonicalUrl = `${config.public.publicUrl}${route.path}`;

  nuxtApp.runWithContext(() => {
    useHead({
      link: [
        {
          rel: "canonical",
          href: canonicalUrl,
        },
      ],
    });

    const title = [
      pageSeo?.metaTitle || globalsSeo?.defaultTitle,
      globalsSeo?.titleSeparator,
      globalsSeo?.titleSuffix,
    ]
      .filter(Boolean)
      .join(" ");

    const ogTitle = pageSeo?.openGraph?.ogTitle
      ? pageSeo.openGraph.ogTitle
      : [
          pageSeo?.metaTitle || globalsSeo?.defaultTitle,
          globalsSeo?.titleSeparator,
          globalsSeo?.titleSuffix,
        ]
          .filter(Boolean)
          .join(" ");

    useSeoMeta({
      title,
      description: pageSeo?.metaDescription || globalsSeo?.defaultDescription,
      robots: pageSeo?.metaRobots,
      ogType: "website",
      ogLocale: mapStrapiLocaleToOpenGraphLocale(currentLocale),
      ogUrl: canonicalUrl,
      ogTitle,
      ogDescription:
        pageSeo?.openGraph?.ogDescription ||
        pageSeo?.metaDescription ||
        globalsSeo?.defaultDescription,
      ogImage:
        toOgImageValue(pageSeo?.openGraph?.ogImage) ??
        toOgImageValue(fallbackOgImage),
    });
  });
}
