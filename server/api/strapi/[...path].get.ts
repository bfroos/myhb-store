// Strapi proxy with server-side caching.
import { sanitizeAdsContent } from "#shared/adsTerms";
import {
  applyNewCustomerPricesDeep,
  isSurgeryPathKey,
} from "#shared/newCustomerOffer";

// CRITICAL: When the __NUXT_PREVIEW cookie is set (via /api/preview route),
// the request skips the cache wrapper entirely and carries status=draft.

const FALLBACK_LOCALE = 'de';

const NO_FALLBACK_PATHS = [/^\/menu(?:\/|$)/];

function isPreviewRequest(event: any): boolean {
  const cookie = getCookie(event, '__NUXT_PREVIEW');
  if (cookie === 'true') return true;
  const raw = getRequestHeader(event, 'cookie') || '';
  return /(?:^|;\s*)__NUXT_PREVIEW=true(?:;|$)/.test(raw);
}

function getPreviewStatus(event: any): 'draft' | 'published' {
  const raw = getRequestHeader(event, 'cookie') || '';
  const status = getCookie(event, '__NUXT_PREVIEW_STATUS') ||
    (/(?:^|;\s*)__NUXT_PREVIEW_STATUS=([^;]+)/.exec(raw)?.[1]);
  return status === 'published'
    ? 'published'
    : 'draft';
}

function withLocale(params: URLSearchParams, locale: string): URLSearchParams {
  const clone = new URLSearchParams(params);
  clone.set('locale', locale);
  return clone;
}

function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function looksLikeMedia(value: any): boolean {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.url === 'string' &&
    typeof value.mime === 'string'
  );
}

const SKIP_MERGE_KEYS = new Set([
  'id',
  'documentId',
  'createdAt',
  'updatedAt',
  'publishedAt',
  'locale',
  'localizations',
]);

function isPlainObject(value: any): boolean {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// Fields that identify an entity or address it in a specific locale. When a
// German value is substituted wholesale these must not travel with it, or a
// translated page ends up carrying German documentIds and German URLs.
// `id` stays: the frontend keys v-for lists on it (faq.id, slide.id, link.id)
// and never fetches by it, so stripping it turned every substituted list into
// undefined keys.
const LOCALE_BOUND_KEYS = new Set([
  'documentId',
  'createdAt',
  'updatedAt',
  'publishedAt',
  'locale',
  'localizations',
  'slug',
  'pathKey',
  'ancestorSlugs',
]);

function stripLocaleBound(value: any): any {
  if (Array.isArray(value)) return value.map(stripLocaleBound);
  if (!isPlainObject(value)) return value;
  const out: Record<string, any> = {};
  for (const [key, item] of Object.entries(value)) {
    if (LOCALE_BOUND_KEYS.has(key)) continue;
    out[key] = stripLocaleBound(item);
  }
  return out;
}

function mergeFallback(target: any, fallback: any): any {
  if (isEmptyValue(target)) {
    return fallback !== undefined ? stripLocaleBound(fallback) : target;
  }
  if (fallback === undefined || fallback === null) return target;

  if (Array.isArray(target)) {
    if (!Array.isArray(fallback) || fallback.length === 0) return target;

    if (target.length === fallback.length) {
      return target.map((item: any, i: number) => {
        const fb = fallback[i];
        if (
          isPlainObject(item) &&
          isPlainObject(fb) &&
          '__component' in item &&
          '__component' in fb &&
          item.__component !== fb.__component
        ) {
          return item; // structural mismatch at this index, don't touch
        }
        return mergeFallback(item, fb);
      });
    }

    // Different lengths mean there is no reliable way to tell which German
    // item a translated item corresponds to. Component type is not an identity:
    // a zone may legitimately hold the same component twice, and pairing the
    // wrong two produces a block with one page's heading and another's body.
    // Keep what the locale actually has rather than inventing an alignment.
    return target;
  }

  if (typeof target === 'object') {
    // Same-length arrays are merged by position, so two entries of the same
    // shape can line up while being different entities. documentId is the only
    // reliable identity here, and it is deliberately not merged, so check it
    // before combining anything.
    if (
      target.documentId &&
      fallback.documentId &&
      target.documentId !== fallback.documentId
    ) {
      return target;
    }
    if (looksLikeMedia(target)) return target; // media present, keep as-is
    if (typeof fallback !== 'object' || Array.isArray(fallback)) return target;
    const result: Record<string, any> = { ...target };
    for (const key of Object.keys(fallback)) {
      if (SKIP_MERGE_KEYS.has(key)) continue;
      result[key] = mergeFallback(target[key], fallback[key]);
    }
    return result;
  }

  return target; // non-empty primitive: a real translated value, keep it
}

// Nitro reicht dem inneren Handler von defineCachedEventHandler ein Event, dem
// die Request-Header fehlen (durchgereicht wird nur, was in opts.varies steht).
// Das Preview-Cookie ist dort also unsichtbar und jede Anfrage sah aus wie eine
// veroeffentlichte. Der Preview-Fall wird deshalb aussen am echten Event
// entschieden: Preview geht ungecacht direkt an Strapi, alles andere weiter
// durch den Cache.
// Ads-Modus (go.*): Google lehnt Anzeigen ab, wenn auf der Zielseite "Botox"
// steht (RESTRICTED_DRUG_TERMS). Die Antwort wird deshalb hier einmal zentral
// bereinigt - so erreicht der Begriff weder Seite, Meta, JSON-LD noch den
// Nuxt-Payload. SEO-Modus (www) bleibt unveraendert.
async function fetchFromStrapi(
  event: any,
  preview: boolean,
  previewStatus: 'draft' | 'published',
) {
  const config = useRuntimeConfig(event);
  const siteMode = config.siteMode || config.public.siteMode;
  const result = await fetchFromStrapiRaw(event, preview, previewStatus);
  if (siteMode !== 'ads') return result;
  const url = getRequestURL(event);
  const locale = url.searchParams.get('locale');
  const sanitized = sanitizeAdsContent(result, locale);
  // go.: Preise in Texten der Behandlungsseite (Preistabellen, FAQ, Teaser,
  // SEO-Title/Description) zeigen den Neukundenpreis mit Sternchen
  // (shared/newCustomerOffer.ts). Nur der Behandlungsteil der Antwort: Die
  // Standortdaten daneben tragen andere Euro-Betraege (Parkgebuehren), und
  // freie Landingpages (/p/…) koennten Rabatte schon selbst ausweisen. Nur
  // Deutsch, weil Fussnote und Hinweis deutsch sind. Zahlenfelder
  // (priceInEuroCent) bleiben unveraendert.
  const restPath = url.pathname.replace(/^\/api\/strapi/, '');
  if ((!locale || locale === 'de') && restPath.startsWith('/treatment-pages/')) {
    const data = (sanitized as any)?.data;
    if (data?.treatmentPage) {
      return {
        ...(sanitized as any),
        data: {
          ...data,
          treatmentPage: applyNewCustomerPricesDeep(data.treatmentPage),
          // SEO-Felder der Seite (Title/Description) liegen daneben.
          ...(data.seo && !isSurgeryPathKey(data.treatmentPage.pathKey)
            ? { seo: applyNewCustomerPricesDeep(data.seo) }
            : {}),
        },
      };
    }
    if (data && typeof data === 'object' && !Array.isArray(data) && data.pathKey) {
      return { ...(sanitized as any), data: applyNewCustomerPricesDeep(data) };
    }
  }
  // go.: Produktseiten (/produkte/…, verlinkt aus /preise) nennen die Preise
  // der Varianten im Beschreibungstext ("… ab 149,99€"). Gleiche Umstellung,
  // Zahlenfelder (priceInEuroCent, cheapestVariantPrice) bleiben.
  if ((!locale || locale === 'de') && restPath.startsWith('/product-pages/')) {
    const data = (sanitized as any)?.data;
    if (data?.product) {
      return {
        ...(sanitized as any),
        data: {
          ...data,
          product: applyNewCustomerPricesDeep(data.product),
          ...(data.productPage
            ? { productPage: applyNewCustomerPricesDeep(data.productPage) }
            : {}),
        },
      };
    }
  }
  return sanitized;
}

async function fetchFromStrapiRaw(
  event: any,
  preview: boolean,
  previewStatus: 'draft' | 'published',
) {
  const config = useRuntimeConfig(event);
  const incoming = getRequestURL(event);
  const siteMode = config.siteMode || config.public.siteMode;

  setHeader(event, 'X-MyHB-Strapi-Proxy', '1');

  if (!config.public.strapiUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Strapi URL missing',
    });
  }

  const restPath = incoming.pathname.replace(/^\/api\/strapi/, '');
  const strapiBase = config.public.strapiUrl.replace(/\/+$/, '');

  const params = new URLSearchParams(incoming.search);
  if (preview) {
    params.set('status', previewStatus);
  }

  const fetchHeaders = {
    ...(siteMode ? { 'x-site-mode': siteMode } : {}),
    ...(preview ? { 'strapi-encode-source-maps': 'true' } : {}),
  };

  const fetchStrapi = (searchParams: URLSearchParams) => {
    const search = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return $fetch(`${strapiBase}/api${restPath}${search}`, {
      headers: fetchHeaders,
    });
  };

  const requestedLocale = params.get('locale');
  // A menu lists what exists in a locale, so German must never pad it.
  const isNavigationIndex = NO_FALLBACK_PATHS.some((re) => re.test(restPath));
  const wantsFallback =
    !preview &&
    !isNavigationIndex &&
    !!requestedLocale &&
    requestedLocale !== FALLBACK_LOCALE;

  try {
    const primary: any = await fetchStrapi(params);
    if (!wantsFallback) return primary;

    const data = primary?.data;
    if (Array.isArray(data)) return primary; // collections: out of scope

    let deResult: any;
    try {
      deResult = await fetchStrapi(withLocale(params, FALLBACK_LOCALE));
    } catch {
      return primary; // German fetch failed too; fail open with what we have
    }

    if (data == null) {
      return deResult;
    }

    // The German lookup replays a locale-specific identifier, so confirm it
    // came back with the same document before merging anything into it.
    const deData = deResult?.data;
    const sameDocument =
      deData &&
      (!data.documentId ||
        !deData.documentId ||
        data.documentId === deData.documentId);
    if (!sameDocument) return primary;

    return { ...primary, data: mergeFallback(data, deData) };
  } catch (error: any) {
    const statusCode = error?.statusCode || error?.status || 500;

    if (wantsFallback && statusCode === 404) {
      try {
        return await fetchStrapi(withLocale(params, FALLBACK_LOCALE));
      } catch {
      }
    }

    throw createError({
      statusCode,
      statusMessage:
        error?.statusMessage || error?.message || 'Strapi API error',
    });
  }
}

// Only published content reaches this handler, so the cache key needs no
// preview dimension.
const cachedProxy = defineCachedEventHandler(
  (event) => fetchFromStrapi(event, false, 'published'),
  {
    maxAge: process.env.NODE_ENV === 'production' ? 60 : 0,
    staleMaxAge: process.env.NODE_ENV === 'production' ? 240 : 0,
    getKey: (event) => {
      const url = getRequestURL(event);
      const path = url.pathname.replace(/^\/api\/strapi/, '');

      const params = new URLSearchParams(url.search);
      params.sort();

      const config = useRuntimeConfig(event);
      const siteMode = config.siteMode || config.public.siteMode || 'default';

      return `strapi:${path}:${params.toString()}:${siteMode}:published`;
    },
    shouldInvalidateCache: () => false,
  },
);

export default defineEventHandler((event) => {
  if (!isPreviewRequest(event)) {
    return cachedProxy(event);
  }

  // Drafts must never end up in a shared or browser cache. Nitro's cache
  // wrapper overwrites Cache-Control with its own max-age, so these headers
  // only survive outside of it.
  setHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate');
  setHeader(event, 'Pragma', 'no-cache');
  setHeader(event, 'Expires', '0');

  return fetchFromStrapi(event, true, getPreviewStatus(event));
});
