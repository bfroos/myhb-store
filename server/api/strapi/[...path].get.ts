// Strapi proxy with server-side caching.
// CRITICAL: When __NUXT_PREVIEW cookie is set (via /api/preview route),
// all requests include status=draft and cache is bypassed.

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

function sameSlot(a: any, b: any): boolean {
  if (!isPlainObject(a) || !isPlainObject(b)) return false;
  if ('__component' in a && '__component' in b) {
    return a.__component === b.__component;
  }
  return true;
}

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

      return { ...primary, data: mergeFallback(data, deResult?.data) };
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
  },
  {
    varies: ['cookie'],
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
