import { readFile } from "node:fs/promises";
import { isAbsolute, resolve as resolvePath } from "node:path";
import qs from "qs";

import bundledRedirects from "../assets/redirects.json";

type StrapiPagination = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

type StrapiListResponse<T> = {
  data: { id: number; attributes: T }[] | T[];
  meta?: {
    pagination?: StrapiPagination;
  };
};

export type RedirectAttributes = {
  from: string;
  to: string;
  code?: number | null;
};

export type RedirectResult = {
  target: string;
  code: number;
};

// Cache TTLs
// - Local redirects file changes only on deploy, so a long TTL is fine.
// - Strapi redirects should refresh frequently so editors see changes quickly.
// - If Strapi fails (or returns empty), retry soon to avoid caching an outage for too long.
const LOCAL_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const STRAPI_CACHE_TTL_MS = 5 * 60 * 1000; // 5 min
const STRAPI_EMPTY_CACHE_TTL_MS = 30 * 1000; // 30s

const readTtlOverride = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0)
    return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return undefined;
};

const getRedirectTtls = () => {
  const config = useRuntimeConfig();
  const localOverride = readTtlOverride(
    (config as any).redirectsLocalCacheTtlMs,
  );
  const strapiOverride = readTtlOverride(
    (config as any).redirectsStrapiCacheTtlMs,
  );
  const strapiEmptyOverride = readTtlOverride(
    (config as any).redirectsStrapiEmptyCacheTtlMs,
  );

  return {
    local: localOverride ?? LOCAL_CACHE_TTL_MS,
    strapi: strapiOverride ?? STRAPI_CACHE_TTL_MS,
    strapiEmpty: strapiEmptyOverride ?? STRAPI_EMPTY_CACHE_TTL_MS,
  };
};

const PAGE_SIZE = 200;
const SKIP_PATHS = new Set(["/favicon.ico", "/robots.txt", "/sitemap.xml"]);
const SKIP_PREFIXES = ["/_nuxt", "/__nuxt", "/api"];
const MAX_REDIRECT_HOPS = 5;
const DEFAULT_REDIRECTS_FILE = "server/assets/redirects.json";

let localCached: {
  timestamp: number;
  ttlMs: number;
  map: Map<string, RedirectAttributes>;
} | null = null;
let localInFlight: Promise<Map<string, RedirectAttributes>> | null = null;

let strapiCached: {
  timestamp: number;
  ttlMs: number;
  map: Map<string, RedirectAttributes>;
} | null = null;
let strapiInFlight: Promise<Map<string, RedirectAttributes>> | null = null;

const normalizePath = (input: string) => {
  let path = input || "/";
  try {
    path = decodeURI(path);
  } catch {
    // Ignore invalid URI sequences.
  }
  const queryIndex = path.indexOf("?");
  if (queryIndex >= 0) path = path.slice(0, queryIndex);
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path;
};

const normalizeFrom = (value: string) => {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";
  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const parsed = new URL(trimmed);
      return normalizePath(parsed.pathname);
    }
  } catch {
    // Fallback to plain normalization below.
  }
  return normalizePath(trimmed);
};

const normalizeTo = (value: string) => {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) return trimmed;
  return `/${trimmed}`;
};

const sanitizeStatusCode = (code?: number | null) => {
  if (code === 302 || code === 307 || code === 308) return code;
  return 301;
};

const isAbsoluteUrl = (value: string) =>
  value.startsWith("http://") || value.startsWith("https://");

const shouldSkipPath = (path: string) => {
  if (SKIP_PATHS.has(path)) return true;
  return SKIP_PREFIXES.some((prefix) => path.startsWith(prefix));
};

const resolveRedirectsFilePath = (filePath: string) =>
  isAbsolute(filePath) ? filePath : resolvePath(process.cwd(), filePath);

const parseRedirectItems = (
  items: unknown,
): Map<string, RedirectAttributes> => {
  const map = new Map<string, RedirectAttributes>();
  if (!Array.isArray(items)) return map;
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const from =
      "from" in item && typeof item.from === "string" ? item.from : "";
    const to = "to" in item && typeof item.to === "string" ? item.to : "";
    if (!from || !to) continue;
    const key = normalizeFrom(from);
    if (!key) continue;
    map.set(key, {
      from,
      to,
      code: "code" in item ? (item as { code?: number }).code : undefined,
    });
  }
  return map;
};

const loadLocalRedirects = async (): Promise<
  Map<string, RedirectAttributes>
> => {
  const config = useRuntimeConfig();
  const filePath =
    (config.redirectsFile as string | undefined) || DEFAULT_REDIRECTS_FILE;
  if (!filePath) return new Map();

  const useBundled =
    !isAbsolute(filePath) && filePath.endsWith("redirects.json");

  if (useBundled) {
    return parseRedirectItems(bundledRedirects);
  }

  let raw = "";
  try {
    raw = await readFile(resolveRedirectsFilePath(filePath), "utf8");
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
      return new Map();
    }
    return new Map();
  }

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return new Map();
  }
  return parseRedirectItems(parsed);
};

const fetchStrapiRedirects = async (): Promise<
  Map<string, RedirectAttributes>
> => {
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl;
  const map = new Map<string, RedirectAttributes>();
  if (!strapiUrl) return map;
  let page = 1;
  let pageCount = 1;

  do {
    const query = qs.stringify(
      {
        fields: ["from", "to", "code"],
        pagination: { page, pageSize: PAGE_SIZE },
      },
      { encodeValuesOnly: true },
    );
    const url = `${strapiUrl.replace(/\/+$/, "")}/api/redirects?${query}`;
    let response: StrapiListResponse<RedirectAttributes>;
    try {
      response = await $fetch<StrapiListResponse<RedirectAttributes>>(url);
    } catch (err) {
      // Fail-open: don't block site if redirects API is down.
      // Check Strapi permissions: Redirects → find/findMany for Public.
      if (process.env.NODE_ENV === "development") {
        console.warn("[redirects] Strapi API fehlgeschlagen:", err);
      }
      return map;
    }

    const items = Array.isArray(response.data) ? response.data : [];
    for (const item of items) {
      const attributes =
        (item && "attributes" in item ? item.attributes : item) || null;
      if (!attributes || typeof attributes !== "object") continue;
      const key = normalizeFrom((attributes as RedirectAttributes).from);
      if (!key) continue;
      map.set(key, attributes as RedirectAttributes);
    }

    pageCount = response.meta?.pagination?.pageCount || 1;
    page += 1;
  } while (page <= pageCount);

  return map;
};

const getLocalRedirectMap = async () => {
  const now = Date.now();
  const ttls = getRedirectTtls();
  if (localCached && now - localCached.timestamp < localCached.ttlMs) {
    return localCached.map;
  }
  if (!localInFlight) {
    localInFlight = loadLocalRedirects()
      .then((map) => {
        localCached = { timestamp: Date.now(), ttlMs: ttls.local, map };
        return map;
      })
      .finally(() => {
        localInFlight = null;
      });
  }
  return localInFlight;
};

const getStrapiRedirectMap = async () => {
  const now = Date.now();
  const ttls = getRedirectTtls();
  if (strapiCached && now - strapiCached.timestamp < strapiCached.ttlMs) {
    return strapiCached.map;
  }
  if (!strapiInFlight) {
    strapiInFlight = fetchStrapiRedirects()
      .then((map) => {
        // If Strapi returns empty (including during an outage), retry soon.
        const ttlMs = map.size === 0 ? ttls.strapiEmpty : ttls.strapi;
        strapiCached = { timestamp: Date.now(), ttlMs, map };
        return map;
      })
      .finally(() => {
        strapiInFlight = null;
      });
  }
  return strapiInFlight;
};

const getRedirectMap = async () => {
  const [localMap, strapiMap] = await Promise.all([
    getLocalRedirectMap(),
    getStrapiRedirectMap(),
  ]);

  if (strapiMap.size === 0) {
    return localMap;
  }

  const merged = new Map(localMap);
  for (const [key, value] of strapiMap) {
    merged.set(key, value);
  }
  return merged;
};

export const splitPathAndSearch = (value: string) => {
  const trimmed = (value || "").trim();
  if (!trimmed) return { pathname: "/", search: "" };
  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const parsed = new URL(trimmed);
      return { pathname: parsed.pathname, search: parsed.search };
    }
  } catch {
    // Fall through to manual parsing below.
  }
  const queryIndex = trimmed.indexOf("?");
  if (queryIndex >= 0) {
    return {
      pathname: trimmed.slice(0, queryIndex) || "/",
      search: trimmed.slice(queryIndex),
    };
  }
  return { pathname: trimmed, search: "" };
};

export const resolveRedirect = async (
  pathname: string,
  search: string,
): Promise<RedirectResult | null> => {
  try {
    const normalizedPath = normalizePath(pathname);
    if (shouldSkipPath(normalizedPath)) return null;

    const redirectMap = await getRedirectMap();
    const match = redirectMap.get(normalizedPath);
    if (!match) return null;

    const target = normalizeTo(match.to);
    if (!target) return null;
    if (normalizePath(target) === normalizedPath) return null;
    if (
      !isAbsoluteUrl(target) &&
      hasRedirectLoop(normalizedPath, redirectMap)
    ) {
      return null;
    }

    const statusCode = sanitizeStatusCode(match.code ?? undefined);
    return { target: `${target}${search || ""}`, code: statusCode };
  } catch {
    // Fail-open: don't block site if redirects lookup fails.
    return null;
  }
};

const hasRedirectLoop = (
  startPath: string,
  redirectMap: Map<string, RedirectAttributes>,
) => {
  const seen = new Set<string>();
  let current = startPath;

  for (let hop = 0; hop < MAX_REDIRECT_HOPS; hop += 1) {
    if (seen.has(current)) return true;
    seen.add(current);

    const nextRedirect = redirectMap.get(current);
    if (!nextRedirect) return false;

    const nextTarget = normalizeTo(nextRedirect.to);
    if (!nextTarget || isAbsoluteUrl(nextTarget)) return false;

    current = normalizePath(nextTarget);
  }

  return true;
};
