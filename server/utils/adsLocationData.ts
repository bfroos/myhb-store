// go.* (Ads-Modus): Standortdaten fuer Kacheln, Bewertungen und Menue
// (Strapi-Proxy und /api/ads-location-nav). Siehe shared/adsLocationTreatments.ts.
import {
  adsLocationPathKeys,
  buildAdsLocationTreatmentPages,
  reviewsWithoutRestrictedTerms,
  type AdsTreePage,
} from "#shared/adsLocationTreatments";

// #184: pathKeys, die es an einem Standort gibt (5 min im Speicher). Die
// Antwort der Behandlungsseite traegt sie nicht mit; "with-treatments" nennt
// sie im SEO-Baum ("botox/..."), der Ads-Baum heisst dort "muskelrelaxans/...".
const locationPathKeyCache = new Map<string, { at: number; keys: string[] }>();

export async function locationPathKeys(
  event: any,
  city: string,
  loc: string,
): Promise<string[] | null> {
  const key = `${city}/${loc}`;
  const hit = locationPathKeyCache.get(key);
  if (hit && Date.now() - hit.at < 5 * 60_000) return hit.keys;
  const seo = await seoLocationWithTreatments(event, city, loc, 'de');
  if (!seo) return null;
  const legacy = (seo.treatmentPages ?? [])
    .map((p: any) => p?.pathKey)
    .filter((k: unknown): k is string => typeof k === 'string')
    .map((k: string) => k.replace(/^botox(?=\/|$)/, 'muskelrelaxans'));
  // Dazu die tatsaechlichen Ads-pathKeys (baby-botox heisst dort
  // baby-muskelrelaxans, lachfalten gibt es nur als -rabatt).
  const adsPages = await adsTreePages(event, 'de');
  const mapped = adsPages
    ? adsLocationPathKeys(buildAdsLocationTreatmentPages(seo.treatmentPages ?? [], adsPages))
    : [];
  // Alt-Keys mit dem Markennamen ("muskelrelaxans/baby-botox") gibt es im
  // Ads-Baum nicht; sie landeten nur im Seiten-Payload.
  const keys = [...new Set([...legacy, ...mapped])].filter(
    (k) => !/botox|botulinum|btx/i.test(k),
  );
  locationPathKeyCache.set(key, { at: Date.now(), keys });
  return keys;
}

// SEO-Standortdaten (Behandlungsliste, Bewertungen), 5 min im Speicher.
const seoLocationCache = new Map<string, { at: number; data: any }>();

async function seoLocationWithTreatments(
  event: any,
  city: string,
  loc: string,
  locale: string,
): Promise<any | null> {
  const key = `${locale}:${city}/${loc}`;
  const hit = seoLocationCache.get(key);
  if (hit && Date.now() - hit.at < 5 * 60_000) return hit.data;
  try {
    const config = useRuntimeConfig(event);
    const base = String(config.public.strapiUrl || '').replace(/\/+$/, '');
    const res: any = await $fetch(
      `${base}/api/locations/${encodeURIComponent(city)}/${encodeURIComponent(loc)}/with-treatments?locale=${encodeURIComponent(locale)}`,
    );
    const data = res?.data ?? null;
    seoLocationCache.set(key, { at: Date.now(), data });
    return data;
  } catch {
    return null;
  }
}

// Alle Seiten des Ads-Baums mit Kacheldaten (Teaser, Preis), 5 min im Speicher.
const adsTreeCache = new Map<string, { at: number; pages: AdsTreePage[] }>();

async function adsTreePages(event: any, locale: string): Promise<AdsTreePage[] | null> {
  const hit = adsTreeCache.get(locale);
  if (hit && Date.now() - hit.at < 5 * 60_000) return hit.pages;
  try {
    const config = useRuntimeConfig(event);
    const base = String(config.public.strapiUrl || '').replace(/\/+$/, '');
    const pages: AdsTreePage[] = [];
    for (let page = 1; page <= 10; page++) {
      const params = new URLSearchParams({
        locale,
        'pagination[page]': String(page),
        'pagination[pageSize]': '100',
        'populate[teaser][populate]': 'image',
        'populate[treatment]': 'true',
        'populate[hero][populate]': 'cover',
      });
      const res: any = await $fetch(`${base}/api/treatment-ads-pages?${params}`);
      pages.push(...(res?.data ?? []));
      if (page >= (res?.meta?.pagination?.pageCount ?? 1)) break;
    }
    adsTreeCache.set(locale, { at: Date.now(), pages });
    return pages;
  } catch {
    return null;
  }
}

/**
 * pathKeys, unter denen go. eine /behandlungen/-Seite hat: alle Seiten des
 * Ads-Baums, bei "-rabatt"-Seiten auch die Grundadresse (useTreatmentPage
 * faellt dort auf "-rabatt" zurueck). `null`, wenn Strapi nicht lesbar ist.
 */
export async function adsTreePathKeys(event: any): Promise<Set<string> | null> {
  const pages = await adsTreePages(event, 'de');
  if (!pages) return null;
  const keys = new Set<string>();
  for (const page of pages) {
    const key = page?.pathKey;
    if (typeof key !== 'string' || !key) continue;
    keys.add(key);
    if (key.endsWith('-rabatt')) keys.add(key.slice(0, -'-rabatt'.length));
  }
  return keys;
}

export const ADS_LOCATION_PAGE = /^\/locations\/([^/]+)\/([^/]+)\/with-treatments-ads$/;

/**
 * go.-Standortseite: Der Ads-Endpunkt liefert weder Behandlungen noch
 * Bewertungen. Behandlungen kommen aus der SEO-Liste des Standorts,
 * abgebildet auf Seiten, die es im Ads-Baum gibt (Kacheln verlinken nur
 * go.-Seiten, die laden). Bewertungen mit dem Markennamen fallen weg -
 * Kundenzitate werden nicht umgeschrieben.
 */
export async function withAdsLocationExtras(
  event: any,
  pathname: string,
  result: any,
  locale: string | null,
) {
  const m = ADS_LOCATION_PAGE.exec(pathname.replace(/^\/api\/strapi/, ''));
  const data = result?.data;
  if (!m || !data?.location) return result;
  const lang = locale || 'de';
  const [seo, adsPages] = await Promise.all([
    seoLocationWithTreatments(event, m[1]!, m[2]!, lang),
    adsTreePages(event, lang),
  ]);
  if (!seo) return result;
  const treatmentPages =
    Array.isArray(data.treatmentPages) && data.treatmentPages.length > 0
      ? data.treatmentPages
      : adsPages
        ? buildAdsLocationTreatmentPages(seo.treatmentPages ?? [], adsPages)
        : [];
  const reviews = reviewsWithoutRestrictedTerms(
    data.location.reviews?.length ? data.location.reviews : seo.location?.reviews,
  );
  return {
    ...result,
    data: {
      ...data,
      treatmentPages,
      location: { ...data.location, reviews },
    },
  };
}

