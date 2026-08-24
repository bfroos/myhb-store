// Strapi proxy with server-side caching.
// CRITICAL: When __NUXT_PREVIEW cookie is set (via /api/preview route),
// all requests include status=draft and cache is bypassed.
//
// German fallback: content is translated unevenly across locales (some
// entries don't exist yet in a locale at all, others exist but are missing
// individual fields or media). For any request with a non-German locale, we
// also fetch the German counterpart and use it to fill gaps, so a page never
// renders half-empty or loses its structure just because a translation is
// incomplete. This only applies to single-entity responses (`data` is an
// object, not an array) — list/collection endpoints are left untouched,
// since pulling German-only entries into a locale's listing could link to
// pages whose own detail view wouldn't otherwise resolve in that locale.

const FALLBACK_LOCALE = 'de';

function isPreviewRequest(event: any): boolean {
  const cookie = getCookie(event, '__NUXT_PREVIEW');
  return cookie === 'true';
}

function getPreviewStatus(event: any): 'draft' | 'published' {
  return getCookie(event, '__NUXT_PREVIEW_STATUS') === 'published'
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

// Entity metadata that must always come from the requested locale's own row,
// never borrowed from the German fallback.
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

/**
 * True when two array items look like the same slot: for dynamic-zone entries
 * that means the same component; for plain repeatable components there is
 * nothing to compare, so any two objects are considered alignable.
 */
function sameSlot(a: any, b: any): boolean {
  if (!isPlainObject(a) || !isPlainObject(b)) return false;
  if ('__component' in a && '__component' in b) {
    return a.__component === b.__component;
  }
  return true;
}

/**
 * Fills gaps in `target` (the requested locale's data) using `fallback` (the
 * German data). Anything present and non-empty in `target` is kept as-is;
 * only null/empty/missing values are replaced.
 *
 * Arrays (dynamic-zone blocks, repeatable components) are handled by length:
 *
 *   - Equal length: merged item by item, so a translated block keeps its
 *     translation while an untranslated sibling still renders in German
 *     instead of the whole zone emptying out.
 *   - Target shorter: the locale was only partially filled in, which is what
 *     made pages render with sections missing (e.g. 8 sections in German, 1
 *     in Arabic). The German array becomes the skeleton and the locale's
 *     items are overlaid onto it, matched greedily on component type, so
 *     translated sections keep their translation and the untranslated ones
 *     appear in German rather than vanishing.
 *   - Target longer: the locale has extra content of its own. Left untouched
 *     -- we must not drop locale-specific entries.
 */
function mergeFallback(target: any, fallback: any): any {
  if (isEmptyValue(target)) {
    return fallback !== undefined ? fallback : target;
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

    if (target.length < fallback.length) {
      // Only rebuild structures we can reason about. Arrays of primitives
      // (ids, slugs, plain strings) carry no slot identity, so a shorter
      // target there is taken at face value.
      if (!fallback.every(isPlainObject) || !target.every(isPlainObject)) {
        return target;
      }
      let cursor = 0;
      return fallback.map((fb: any) => {
        const candidate = target[cursor];
        if (candidate !== undefined && sameSlot(candidate, fb)) {
          cursor += 1;
          return mergeFallback(candidate, fb);
        }
        return fb;
      });
    }

    return target; // target longer: locale-specific extras, keep them
  }

  if (typeof target === 'object') {
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

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig(event);
    const incoming = getRequestURL(event);
    const siteMode = config.siteMode || config.public.siteMode;
    const preview = isPreviewRequest(event);
    const previewStatus = getPreviewStatus(event);

    setHeader(event, 'X-MyHB-Strapi-Proxy', '1');
    if (preview) {
      setHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate');
      setHeader(event, 'Pragma', 'no-cache');
      setHeader(event, 'Expires', '0');
    }

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
    const wantsFallback =
      !!requestedLocale && requestedLocale !== FALLBACK_LOCALE;

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
        // Whole entity missing in the requested locale — use German wholesale.
        return deResult;
      }

      return { ...primary, data: mergeFallback(data, deResult?.data) };
    } catch (error: any) {
      const statusCode = error?.statusCode || error?.status || 500;

      // The requested locale's entity doesn't exist at all (e.g. a custom
      // by-path controller returning 404 rather than {data: null}). Retry
      // once against German before giving up, so the page still resolves.
      if (wantsFallback && statusCode === 404) {
        try {
          return await fetchStrapi(withLocale(params, FALLBACK_LOCALE));
        } catch {
          // fall through to the original error below
        }
      }

      throw createError({
        statusCode,
        statusMessage:
          error?.statusMessage || error?.message || 'Strapi API error',
      });
    }
  },
  {
    maxAge: process.env.NODE_ENV === 'production' ? 60 : 0,
    staleMaxAge: process.env.NODE_ENV === 'production' ? 240 : 0,
    getKey: (event) => {
      const url = getRequestURL(event);
      const path = url.pathname.replace(/^\/api\/strapi/, '');

      // Include preview status in cache key so draft/published are cached separately
      const isPreview = isPreviewRequest(event);
      const previewStatus = getPreviewStatus(event);
      const previewFlag = isPreview ? `:preview:${previewStatus}` : ':published';

      // Build query string
      let params = new URLSearchParams(url.search);
      if (isPreview) {
        params.set('status', previewStatus);
      }
      params.sort();

      const config = useRuntimeConfig(event);
      const siteMode = config.siteMode || config.public.siteMode || 'default';

      return `strapi:${path}:${params.toString()}:${siteMode}${previewFlag}`;
    },
    // Bypass cache entirely when in preview mode (get latest draft data)
    shouldBypassCache: (event) => isPreviewRequest(event),
    shouldInvalidateCache: (event) => false,
  },
);
