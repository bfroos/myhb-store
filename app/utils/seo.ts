import type { SharedSeoDto } from "~/lib/strapi/dto/components";
import type { StrapiMedia } from "~/lib/strapi/dto/types";
import { replaceRestrictedDrugTerms } from "#shared/adsTerms";
import { stripAdsTemplateV2Preview } from "#shared/adsTemplateV2";
import { stripAdsOfferB } from "#shared/adsOfferVariant";
import { isBlockedAdsImageFile } from "#shared/adsMedia";
import { isIndexableLocale, selectAlternateLocales } from "#shared/hreflang";

/**
 * Fallback share image (Open Graph / Twitter) used when a page has neither a
 * page-level ogImage (Strapi) nor a content image (e.g. article cover).
 * Prevents pages like the homepage, category, doctors and blog index from
 * shipping without a social preview image. Landscape JPEG (~1100x643).
 */
// Benjamin 05.10.2026: vorher das Aussenfoto der Mediapark-Klinik - stand
// beim Teilen jeder Seite (auch Duesseldorf, Berlin ...). Jetzt neutral: der
// weisse Empfang mit Logo (Strapi 1022), zugeschnitten auf 1200 x 630.
const DEFAULT_OG_IMAGE =
  "https://media.myhealthandbeauty.app/cdn-cgi/image/width=1200,height=630,fit=cover,quality=85,format=jpeg/2026_MYHB_Tag3_34_ebf7060f7d.webp";

function toOgImageValue(
  media: StrapiMedia | null | undefined,
): string | undefined {
  return media?.url ?? undefined;
}

/**
 * Inhaltsbild als Vorschaubild: nur Bilder, auf go. ohne Sperrbegriff/
 * Sperrdatei; vom MY-Medienserver auf 1200 x 630 zugeschnitten (Teilen-
 * Format von WhatsApp, Facebook & Co.).
 */
/** Titelbilder, die nicht als Vorschau taugen (05.10.2026 angesehen: Spritze im Bild). */
const SHARE_IMAGE_BLOCKED = ["Zornesfalte_Behandlung_2d84ae9f35"];

function toShareImage(media: StrapiMedia | null | undefined, adsMode: boolean): string | undefined {
  const url = media?.url;
  if (!url) return undefined;
  if (!String((media as any)?.mime ?? "image/").startsWith("image/")) return undefined;
  if (adsMode && (isBlockedAdsImageFile(media) || /botox|btx/i.test(url))) return undefined;
  if (SHARE_IMAGE_BLOCKED.some((name) => url.includes(name))) return undefined;
  const m = /^https:\/\/media\.myhealthandbeauty\.app\/(?!cdn-cgi\/)(.+)$/.exec(url);
  return m
    ? `https://media.myhealthandbeauty.app/cdn-cgi/image/width=1200,height=630,fit=cover,quality=85,format=jpeg/${m[1]}`
    : url;
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
 *
 * Muss NACH usePageI18nParams* aufgerufen werden: nur dann weiss der
 * hreflang-Block, welche Sprachen fuer diese Seite echte Route-Params haben.
 * Ohne diese Info werden (wie bisher) alle Sprachen ausgegeben.
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
  const coverage = usePageI18nCoverage();
  // go.-Vorschau /vorschau-v2/... (Seitenvorlage v2): Canonical bleibt die
  // echte Seite. Alle anderen Pfade unveraendert.
  // Ebenso Variante B des Angebots-Tests /ab-beratung/... (adsOfferVariant).
  const canonicalUrl = `${config.public.publicUrl}${stripAdsOfferB(stripAdsTemplateV2Preview(route.path))}`;

  const robots = computed(() => {
    const { isAdsMode } = useSiteModeFlags();
    // TSEO-10: auf go. gewinnt nie der Strapi-Wert. /lp/lippen-aachen stand
    // dort per metaRobots auf index (Audit 06.10.2026).
    if (isAdsMode.value) return "noindex, nofollow";
    if (!isIndexableLocale(currentLocale) && !/noindex/i.test(pageSeo?.metaRobots || "")) {
      return "noindex, follow";
    }
    return pageSeo?.metaRobots || "index, follow";
  });

  nuxtApp.runWithContext(() => {
    // Alternates nur fuer Sprachen, in denen es die Seite wirklich gibt.
    // usePageI18nParams* meldet pro Seite, welche Sprachen einen vollstaendigen
    // Satz Route-Params haben. Fehlt ein Param, ersetzt switchLocalePath() ihn
    // stillschweigend durch den Wert der aktuellen Sprache - die Alternate
    // zeigt dann auf eine Mischform, die nicht existiert (404). Meldet keine
    // Seite eine Abdeckung (statische Route ohne dynamische Params), bleiben
    // alle Sprachen erlaubt.
    const localesList = Array.isArray(locales.value) ? locales.value : [];
    const localeCodes = localesList
      .map((loc: any) => (typeof loc === "string" ? loc : loc.code))
      .filter(Boolean) as string[];
    const coveredLocales =
      coverage.value?.path === route.path ? coverage.value.locales : null;
    // Regel unveraendert, nur nach shared/hreflang.ts verschoben (Unit-Tests).
    const alternateLocales = selectAlternateLocales(
      localeCodes,
      currentLocale,
      coveredLocales,
    ).filter(isIndexableLocale);

    const defaultLocale = fallbackLocale.value as string;
    const defaultLocalePath = alternateLocales.includes(defaultLocale)
      ? switchLocalePath(defaultLocale)
      : undefined;

    const hreflangLinks = [
      {
        rel: "alternate",
        hreflang: "x-default",
        href: defaultLocalePath
          ? `${config.public.publicUrl}${defaultLocalePath}`
          : canonicalUrl,
      },
    ];

    // Füge hreflang für alle Sprachen hinzu, die diese Seite wirklich hat
    alternateLocales.forEach((localeCode) => {
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
        ...(isIndexableLocale(currentLocale) ? hreflangLinks : []),
      ],
    });

    // Only append titleSuffix if it's not already in the metaTitle
    // go. (#186): Strapi-Titel enden teils auf "| MY"; mit dem angehaengten
    // "| MY HEALTH & BEAUTY" stand die Marke doppelt im Tab.
    const rawMetaTitle = pageSeo?.metaTitle || globalsSeo?.defaultTitle || "";
    // TSEO-14: auf www genauso - 90 indexierte Titel endeten auf
    // "| MY | MY HEALTH & BEAUTY" (Audit 06.10.2026).
    const metaTitle = rawMetaTitle.replace(/\s*[|–-]\s*MY\s*$/, "");
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

    // Ads-Modus (go.*): Meta-Texte stammen teils aus i18n (z. B. Standortseite
    // "Botox & Hyaluron") und laufen nicht durch den Strapi-Proxy. Google
    // prueft sie wie sichtbaren Text (RESTRICTED_DRUG_TERMS).
    const { isAdsMode } = useSiteModeFlags();

    const ogImage =
      toOgImageValue(pageSeo?.openGraph?.ogImage) ??
      toShareImage(fallbackOgImage, isAdsMode.value) ??
      DEFAULT_OG_IMAGE;
    const clean = (value?: string | null) =>
      value && isAdsMode.value
        ? replaceRestrictedDrugTerms(value, currentLocale)
        : value ?? undefined;

    useSeoMeta({
      title: clean(title),
      description: clean(pageSeo?.metaDescription || globalsSeo?.defaultDescription),
      robots: robots.value,
      ogType: "website",
      ogLocale: mapStrapiLocaleToOpenGraphLocale(currentLocale),
      ogUrl: canonicalUrl,
      ogSiteName: brandName.value,
      ogTitle: clean(ogTitle),
      ogDescription: clean(
        pageSeo?.openGraph?.ogDescription ||
          pageSeo?.metaDescription ||
          globalsSeo?.defaultDescription,
      ),
      ogImage,
      twitterCard: "summary_large_image",
      twitterSite: "@myhealthbeauty",
      twitterTitle: clean(title),
      twitterDescription: clean(
        pageSeo?.metaDescription || globalsSeo?.defaultDescription,
      ),
      twitterImage: ogImage,
    });
  });
}
