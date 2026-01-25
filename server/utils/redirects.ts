import { readFile } from "node:fs/promises";
import { isAbsolute, resolve as resolvePath } from "node:path";
import qs from "qs";

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

const CACHE_TTL_MS = 5 * 60 * 1000;
const PAGE_SIZE = 200;
const SKIP_PATHS = new Set(["/favicon.ico", "/robots.txt", "/sitemap.xml"]);
const SKIP_PREFIXES = ["/_nuxt", "/__nuxt", "/api"];
const MAX_REDIRECT_HOPS = 5;
const DEFAULT_REDIRECTS_FILE = "server/assets/redirects.json";

let cached: { timestamp: number; map: Map<string, RedirectAttributes> } | null =
  null;
let inFlight: Promise<Map<string, RedirectAttributes>> | null = null;

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

const loadLocalRedirects = async (): Promise<
  Map<string, RedirectAttributes>
> => {
  const config = useRuntimeConfig();
  const filePath =
    (config.redirectsFile as string | undefined) || DEFAULT_REDIRECTS_FILE;
  if (!filePath) return new Map();

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

  if (!Array.isArray(parsed)) return new Map();

  const map = new Map<string, RedirectAttributes>();
  for (const item of parsed) {
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

const fetchRedirects = async (): Promise<Map<string, RedirectAttributes>> => {
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl;
  const map = await loadLocalRedirects();
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
    } catch {
      // Fail-open: don't block site if redirects API is down.
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

const getRedirectMap = async () => {
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.map;
  }
  if (!inFlight) {
    inFlight = fetchRedirects()
      .then((map) => {
        cached = { timestamp: Date.now(), map };
        return map;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
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
