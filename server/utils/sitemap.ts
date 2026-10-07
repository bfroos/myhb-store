/**
 * Sitemap-Bausteine (TSEO-05).
 *
 * /sitemap.xml ist ein Sitemap-Index, der auf eine Teil-Sitemap je Seitentyp
 * zeigt (/sitemaps/<segment>.xml, siehe SITEMAP_SEGMENTS). Jede Teil-Sitemap
 * wird unabhaengig gebaut:
 *
 * - Faellt eine Strapi-Collection aus, antwortet nur ihre Teil-Sitemap mit
 *   503 (Google versucht es spaeter erneut, der ISR-Cache liefert bis dahin
 *   den letzten guten Stand). Index und uebrige Teil-Sitemaps bleiben heil.
 *   Frueher riss ein einziger Fehler die ganze Sitemap auf 500.
 * - Fehler werden nicht mehr verschluckt. Vorher lieferte ein fehlgeschlagener
 *   with-treatments-Abruf still eine leere Liste, und die Sitemap sah ohne bis
 *   zu 550 Standort-Behandlungs-URLs gueltig aus. Eine Teil-Sitemap ohne einen
 *   einzigen Eintrag gilt deshalb ebenfalls als Fehler.
 *
 * Filter, die fuer jeden Eintrag gelten:
 * - keine Quelle einer Weiterleitung (redirects.json, redirects-koeln.json und
 *   Strapi-Redirects, gemergt in server/utils/redirects.ts),
 * - kein metaRobots mit noindex (treatment-pages, pages),
 * - excludeFromSitemap, Coming-soon-Filialen wie bisher.
 *
 * lastmod wird bewusst nicht mehr ausgegeben: updatedAt springt bei jedem
 * Massen-Republish (932 URLs trugen den 19.09.2026), und ein falsches Datum
 * ist schlechter als keins. Ein verlaessliches Feld ist TSEO-15.
 *
 * Neue Collection: Segment in SITEMAP_SEGMENTS anlegen, Builder in
 * SEGMENT_BUILDERS ergaenzen, ggf. ROUTE_MAP erweitern.
 */
import qs from "qs";
import { resolveRedirect } from "./redirects";

type StrapiPagination = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

type StrapiListResponse<T> = {
  data: T[];
  meta?: {
    pagination?: StrapiPagination;
  };
};

const LOCALES = ["de", "en", "tr", "ar", "fr", "nl"] as const;
const DEFAULT_LOCALE = "de";

const ROUTE_MAP: Record<
  string,
  { base: string; locales?: Partial<Record<(typeof LOCALES)[number], string>> }
> = {
  home: { base: "/" },
  treatments: {
    base: "/behandlungen",
    locales: { en: "/treatments", tr: "/tedaviler", ar: "/ilajat", fr: "/traitements", nl: "/behandelingen" },
  },
  treatment: {
    base: "/behandlungen/[...slug]",
    locales: {
      en: "/treatments/[...slug]",
      tr: "/tedaviler/[...slug]",
      ar: "/ilajat/[...slug]",
      fr: "/traitements/[...slug]",
      nl: "/behandelingen/[...slug]",
    },
  },
  locations: {
    base: "/standorte",
    locales: { en: "/locations", tr: "/konumlar", ar: "/mawaqea", fr: "/lieux", nl: "/locaties" },
  },
  city: {
    base: "/standorte/[citySlug]",
    locales: {
      en: "/locations/[citySlug]",
      tr: "/konumlar/[citySlug]",
      ar: "/konumlar/[citySlug]",
      fr: "/lieux/[citySlug]",
      nl: "/locaties/[citySlug]",
    },
  },
  location: {
    base: "/standorte/[citySlug]/[locationSlug]",
    locales: {
      en: "/locations/[citySlug]/[locationSlug]",
      tr: "/konumlar/[citySlug]/[locationSlug]",
      ar: "/konumlar/[citySlug]/[locationSlug]",
      fr: "/lieux/[citySlug]/[locationSlug]",
      nl: "/locaties/[citySlug]/[locationSlug]",
    },
  },
  locationTreatment: {
    base: "/standorte/[citySlug]/[locationSlug]/[...treatmentSlug]",
    locales: {
      en: "/locations/[citySlug]/[locationSlug]/[...treatmentSlug]",
      tr: "/konumlar/[citySlug]/[locationSlug]/[...treatmentSlug]",
      ar: "/konumlar/[citySlug]/[locationSlug]/[...treatmentSlug]",
      fr: "/lieux/[citySlug]/[locationSlug]/[...treatmentSlug]",
      nl: "/locaties/[citySlug]/[locationSlug]/[...treatmentSlug]",
    },
  },
  blog: {
    base: "/blog",
    locales: { en: "/blog", tr: "/blog", ar: "/mudawwana", fr: "/blog", nl: "/blog" },
  },
  blogArticle: {
    base: "/blog/[slug]",
    locales: {
      en: "/blog/[slug]",
      tr: "/blog/[slug]",
      ar: "/mudawwana/[slug]",
      fr: "/blog/[slug]",
      nl: "/blog/[slug]",
    },
  },
  blogCategory: {
    base: "/blog/c/[slug]",
    locales: {
      en: "/blog/c/[slug]",
      tr: "/blog/c/[slug]",
      ar: "/mudawwana/c/[slug]",
      fr: "/blog/c/[slug]",
      nl: "/blog/c/[slug]",
    },
  },
  career: {
    base: "/karriere",
    locales: { en: "/careers", tr: "/kariyer", ar: "/masar-mihani", fr: "/carrieres", nl: "/carriere" },
  },
  careerDoctors: {
    base: "/karriere/aerzte",
    locales: {
      en: "/careers/doctors",
      tr: "/kariyer/doktorlar",
      ar: "/masar-mihani/atibba",
      fr: "/carrieres/medecins",
      nl: "/carriere/artsen",
    },
  },
  job: {
    base: "/karriere/jobs/[slug]",
    locales: {
      en: "/careers/[slug]",
      tr: "/kariyer/[slug]",
      ar: "/masar-mihani/[slug]",
      fr: "/carrieres/[slug]",
      nl: "/carriere/[slug]",
    },
  },
  prices: {
    base: "/preise",
    locales: { en: "/prices", tr: "/fiyatlar", ar: "/asaar", fr: "/prix", nl: "/prijzen" },
  },
  about: {
    base: "/ueber-uns",
    locales: { en: "/about-us", tr: "/hakkimizda", ar: "/man-nahnu", fr: "/a-propos", nl: "/over-ons" },
  },
  doctors: {
    base: "/aerzte",
    locales: { en: "/doctors", tr: "/doktorlar", ar: "/atibba", fr: "/medecins", nl: "/artsen" },
  },
  doctor: {
    base: "/aerzte/[slug]",
    locales: {
      en: "/doctors/[slug]",
      tr: "/doktorlar/[slug]",
      ar: "/atibba/[slug]",
      fr: "/medecins/[slug]",
      nl: "/artsen/[slug]",
    },
  },
  product: {
    base: "/produkte/[categorySlug]/[productSlug]",
    locales: {
      en: "/products/[categorySlug]/[productSlug]",
      tr: "/urunler/[categorySlug]/[productSlug]",
      ar: "/muntajat/[categorySlug]/[productSlug]",
      fr: "/produits/[categorySlug]/[productSlug]",
      nl: "/producten/[categorySlug]/[productSlug]",
    },
  },
  general: { base: "/p/[slug]" },
};

type Locale = (typeof LOCALES)[number];

type PathParams = Partial<{
  slug: string;
  slugPath: string;
  citySlug: string;
  locationSlug: string;
  treatmentSlugPath: string;
  categorySlug: string;
  productSlug: string;
}>;

type Localized = { id?: number; localizations?: Array<{ id?: number }> };

type SeoFields = { excludeFromSitemap?: boolean; metaRobots?: string | null };

/** Reihenfolge = Reihenfolge im Index. */
export const SITEMAP_SEGMENTS = [
  "pages",
  "treatments",
  "locations",
  "blog",
  "doctors",
  "careers",
  "products",
] as const;

export type SitemapSegment = (typeof SITEMAP_SEGMENTS)[number];

export const isSitemapSegment = (value: string): value is SitemapSegment =>
  (SITEMAP_SEGMENTS as readonly string[]).includes(value);

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const isNoindex = (seo?: SeoFields | null) =>
  /noindex/i.test(seo?.metaRobots || "");

const withPrefix = (locale: Locale, path: string) => {
  if (locale === DEFAULT_LOCALE) return path || "/";
  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
};

const fillPath = (template: string, params: PathParams) => {
  const replacements: Record<string, string | undefined> = {
    "[...slug]": params.slugPath,
    "[slug]": params.slug,
    "[citySlug]": params.citySlug,
    "[locationSlug]": params.locationSlug,
    "[...treatmentSlug]": params.treatmentSlugPath,
    "[categorySlug]": params.categorySlug,
    "[productSlug]": params.productSlug,
  };

  let filled = template;
  for (const [token, value] of Object.entries(replacements)) {
    if (value !== undefined && value !== null) {
      filled = filled.split(token).join(value);
    }
  }

  if (!filled.startsWith("/")) {
    filled = `/${filled}`;
  }

  return filled.replace(/\/+/g, "/");
};

const getLocalizedPath = (
  routeKey: keyof typeof ROUTE_MAP,
  locale: Locale,
  params: PathParams = {},
) => {
  const route = ROUTE_MAP[routeKey];
  const template = route.locales?.[locale] || route.base;
  return withPrefix(locale, fillPath(template, params));
};

const getGroupId = (entity: Localized, fallback?: string) => {
  const localizationIds = [
    entity.id,
    ...(entity.localizations || []).map((item) => item.id),
  ].filter((value): value is number => typeof value === "number");
  if (localizationIds.length > 0) {
    return String(Math.min(...localizationIds));
  }
  if (typeof entity.id === "number") return String(entity.id);
  return fallback;
};

/**
 * Sammelt die Pfade eines Segments samt Hreflang-Gruppen. Gruppen reichen nie
 * ueber ein Segment hinaus: jede Gruppe ist ein Seitentyp in mehreren Sprachen.
 */
class SegmentCollector {
  readonly paths: string[] = [];
  private readonly seen = new Set<string>();
  readonly groupByPath = new Map<string, string>();
  readonly groups = new Map<string, Map<Locale, string>>();

  add(routeKey: string, groupId: string, locale: Locale, path: string) {
    const groupKey = `${routeKey}:${groupId}`;
    if (!this.seen.has(path)) {
      this.seen.add(path);
      this.paths.push(path);
      this.groupByPath.set(path, groupKey);
    }
    const group = this.groups.get(groupKey) || new Map<Locale, string>();
    group.set(locale, path);
    this.groups.set(groupKey, group);
  }
}

type SegmentContext = {
  strapiUrl: string;
  fetchCollection: <T>(
    collection: string,
    query: Record<string, any>,
  ) => Promise<T[]>;
  fetchJson: <T>(path: string, query: Record<string, any>) => Promise<T>;
  out: SegmentCollector;
};

/** Ein Strapi-Abruf; ein zweiter Versuch faengt kurze Aussetzer ab. */
async function fetchWithRetry<T>(url: string): Promise<T> {
  try {
    return await $fetch<T>(url);
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return await $fetch<T>(url);
  }
}

const createContext = (strapiUrl: string): SegmentContext => {
  const base = strapiUrl.replace(/\/+$/, "");
  const fetchJson = <T>(path: string, query: Record<string, any>) =>
    fetchWithRetry<T>(
      `${base}${path}?${qs.stringify(query, { encodeValuesOnly: true })}`,
    );

  const fetchCollection = async <T>(
    collection: string,
    query: Record<string, any>,
  ): Promise<T[]> => {
    let page = 1;
    const pageSize = 100;
    const results: T[] = [];
    let pageCount = 1;

    do {
      const response = await fetchJson<StrapiListResponse<T>>(
        `/api/${collection}`,
        {
          ...query,
          locale: query.locale,
          publicationState: "live",
          pagination: { page, pageSize },
        },
      );
      results.push(...(response.data || []));
      pageCount = response.meta?.pagination?.pageCount || 1;
      page += 1;
    } while (page <= pageCount);

    return results;
  };

  return { strapiUrl: base, fetchCollection, fetchJson, out: new SegmentCollector() };
};

const localizationsPopulate = { localizations: { fields: ["id"] } };

const SEGMENT_BUILDERS: Record<
  SitemapSegment,
  (ctx: SegmentContext) => Promise<void>
> = {
  /** Feste Routen und /p/<slug>. */
  async pages({ fetchCollection, out }) {
    const staticRoutes: Array<keyof typeof ROUTE_MAP> = [
      "home",
      "treatments",
      "locations",
      "blog",
      "career",
      // Feste Route mit Inhalt aus dem pages-Eintrag "karriere-aerzte" (#101).
      // Sie kann nicht aus der pages-Schleife kommen: die baut /p/[slug], und
      // genau diese Zwillings-URL leitet per 301 hierher. Der Eintrag behaelt
      // deshalb excludeFromSitemap: true.
      "careerDoctors",
      "prices",
      "about",
      "doctors",
    ];

    for (const locale of LOCALES) {
      for (const key of staticRoutes) {
        out.add(key, "static", locale, getLocalizedPath(key, locale));
      }

      const generalPages = await fetchCollection<
        Localized & { slug?: string; seo?: SeoFields }
      >("pages", {
        locale,
        fields: ["slug"],
        populate: {
          seo: { fields: ["excludeFromSitemap", "metaRobots"] },
          ...localizationsPopulate,
        },
      });

      for (const page of generalPages) {
        if (!page.slug) continue;
        if (page.seo?.excludeFromSitemap || isNoindex(page.seo)) continue;
        const groupId = getGroupId(page, page.slug);
        if (!groupId) continue;
        out.add(
          "general",
          groupId,
          locale,
          getLocalizedPath("general", locale, { slug: page.slug }),
        );
      }
    }
  },

  async treatments({ fetchCollection, out }) {
    for (const locale of LOCALES) {
      const treatmentPages = await fetchCollection<
        Localized & { pathKey?: string; seo?: SeoFields }
      >("treatment-pages", {
        locale,
        fields: ["pathKey"],
        filters: { pathKey: { $notNull: true } },
        populate: {
          seo: { fields: ["excludeFromSitemap", "metaRobots"] },
          ...localizationsPopulate,
        },
      });

      for (const page of treatmentPages) {
        if (!page.pathKey) continue;
        // Anzeigen-Landingpages wie /behandlungen/lippen-aufspritzen-rabatt
        // sind noindex und haben excludeFromSitemap gesetzt.
        if (page.seo?.excludeFromSitemap || isNoindex(page.seo)) continue;
        const groupId = getGroupId(page, page.pathKey);
        if (!groupId) continue;
        out.add(
          "treatment",
          groupId,
          locale,
          getLocalizedPath("treatment", locale, { slugPath: page.pathKey }),
        );
      }
    }
  },

  /**
   * Stadt-, Filial- und Filial-Behandlungsseiten. Nur Deutsch: die Templates
   * gibt es in den anderen Sprachen nur als Duplikate (TSEO-01).
   */
  async locations({ fetchCollection, fetchJson, out }) {
    const locale = DEFAULT_LOCALE;
    const [cities, locations] = await Promise.all([
      fetchCollection<Localized & { slug?: string }>("cities", {
        locale,
        fields: ["slug"],
        populate: localizationsPopulate,
      }),
      fetchCollection<
        Localized & {
          slug?: string;
          newOpeningDate?: string | null;
          city?: { slug?: string };
        }
      >("locations", {
        locale,
        fields: ["slug", "newOpeningDate"],
        populate: { city: { fields: ["slug"] }, ...localizationsPopulate },
      }),
    ]);

    // Coming-soon-Filialen (ohne Eroeffnungsdatum) bleiben draussen, ebenso
    // Staedte, deren Filialen alle noch nicht eroeffnet sind.
    const openLocations = locations.filter(
      (location) =>
        location.slug && location.city?.slug && location.newOpeningDate,
    );
    const citySlugsWithOpenLocations = new Set(
      openLocations.map((location) => location.city!.slug!),
    );

    for (const city of cities) {
      if (!city.slug || !citySlugsWithOpenLocations.has(city.slug)) continue;
      const groupId = getGroupId(city, city.slug);
      if (!groupId) continue;
      out.add(
        "city",
        groupId,
        locale,
        getLocalizedPath("city", locale, { citySlug: city.slug }),
      );
    }

    for (const location of openLocations) {
      const citySlug = location.city!.slug!;
      const locationSlug = location.slug!;
      const groupId = getGroupId(location, `${citySlug}/${locationSlug}`);
      if (!groupId) continue;
      out.add(
        "location",
        groupId,
        locale,
        getLocalizedPath("location", locale, { citySlug, locationSlug }),
      );
    }

    // Kein catch: faellt eine Filiale aus, faellt das Segment aus, statt still
    // ohne ihre Behandlungsseiten auszuliefern.
    const withTreatments = await Promise.all(
      openLocations.map(async (location) => {
        const data = await fetchJson<{
          data?: { treatmentPages?: Array<{ pathKey?: string }> };
        }>(
          `/api/locations/${location.city!.slug}/${location.slug}/with-treatments`,
          { locale },
        );
        return { location, treatments: data.data?.treatmentPages || [] };
      }),
    );

    for (const { location, treatments } of withTreatments) {
      const citySlug = location.city!.slug!;
      const locationSlug = location.slug!;
      const locationGroupId = getGroupId(location, `${citySlug}/${locationSlug}`);
      if (!locationGroupId) continue;
      for (const treatment of treatments) {
        if (!treatment.pathKey) continue;
        out.add(
          "locationTreatment",
          `${locationGroupId}/${treatment.pathKey}`,
          locale,
          getLocalizedPath("locationTreatment", locale, {
            citySlug,
            locationSlug,
            treatmentSlugPath: treatment.pathKey,
          }),
        );
      }
    }
  },

  async blog({ fetchCollection, out }) {
    for (const locale of LOCALES) {
      const [categories, articles] = await Promise.all([
        fetchCollection<Localized & { slug?: string }>("blog-categories", {
          locale,
          fields: ["slug"],
          populate: localizationsPopulate,
        }),
        fetchCollection<Localized & { slug?: string }>("blog-articles", {
          locale,
          fields: ["slug"],
          populate: localizationsPopulate,
        }),
      ]);

      for (const category of categories) {
        if (!category.slug) continue;
        const groupId = getGroupId(category, category.slug);
        if (!groupId) continue;
        out.add(
          "blogCategory",
          groupId,
          locale,
          getLocalizedPath("blogCategory", locale, { slug: category.slug }),
        );
      }

      for (const article of articles) {
        if (!article.slug) continue;
        const groupId = getGroupId(article, article.slug);
        if (!groupId) continue;
        out.add(
          "blogArticle",
          groupId,
          locale,
          getLocalizedPath("blogArticle", locale, { slug: article.slug }),
        );
      }
    }
  },

  async doctors({ fetchCollection, out }) {
    for (const locale of LOCALES) {
      const doctors = await fetchCollection<Localized & { slug?: string }>(
        "employees",
        {
          locale,
          fields: ["slug"],
          filters: {
            isActive: { $eq: true },
            hideFromPublic: { $eq: false },
          },
          populate: localizationsPopulate,
        },
      );

      for (const doctor of doctors) {
        if (!doctor.slug) continue;
        const groupId = getGroupId(doctor, doctor.slug);
        if (!groupId) continue;
        out.add(
          "doctor",
          groupId,
          locale,
          getLocalizedPath("doctor", locale, { slug: doctor.slug }),
        );
      }
    }
  },

  async careers({ fetchJson, out }) {
    for (const locale of LOCALES) {
      const careerPage = await fetchJson<{
        data?: { jobs?: Array<Localized & { slug?: string }> };
      }>("/api/career-page", {
        locale,
        populate: {
          jobs: { fields: ["slug"], populate: localizationsPopulate },
        },
      });

      for (const job of careerPage.data?.jobs || []) {
        if (!job.slug) continue;
        const groupId = getGroupId(job, job.slug);
        if (!groupId) continue;
        out.add(
          "job",
          groupId,
          locale,
          getLocalizedPath("job", locale, { slug: job.slug }),
        );
      }
    }
  },

  async products({ fetchCollection, out }) {
    for (const locale of LOCALES) {
      const products = await fetchCollection<
        Localized & { slug?: string; category?: { slug?: string } }
      >("products", {
        locale,
        fields: ["slug"],
        populate: { category: { fields: ["slug"] }, ...localizationsPopulate },
      });

      for (const product of products) {
        if (!product.slug || !product.category?.slug) continue;
        const groupId = getGroupId(product, product.slug);
        if (!groupId) continue;
        out.add(
          "product",
          groupId,
          locale,
          getLocalizedPath("product", locale, {
            categorySlug: product.category.slug,
            productSlug: product.slug,
          }),
        );
      }
    }
  },
};

/**
 * Segmente, die leer sein duerfen, ohne dass das ein Fehler ist. Alle anderen
 * haben heute Eintraege; ein leeres Ergebnis heisst dort, dass Strapi etwas
 * Unerwartetes geliefert hat.
 */
const MAY_BE_EMPTY = new Set<SitemapSegment>(["careers", "products"]);

export class SitemapSegmentError extends Error {}

/** Baut eine Teil-Sitemap als XML. Wirft bei jedem Fehler. */
export async function buildSegmentSitemap(
  segment: SitemapSegment,
  strapiUrl: string,
  siteUrl: string,
): Promise<{ xml: string; count: number; droppedRedirects: number }> {
  const ctx = createContext(strapiUrl);
  await SEGMENT_BUILDERS[segment](ctx);
  const { out } = ctx;

  // Weiterleitungs-Quellen raus. resolveRedirect arbeitet auf einer gecachten
  // Map, die Pruefung kostet keine zusaetzlichen Strapi-Abrufe je URL.
  const redirected = new Set<string>();
  await Promise.all(
    out.paths.map(async (path) => {
      if (await resolveRedirect(path, "")) redirected.add(path);
    }),
  );
  const paths = out.paths.filter((path) => !redirected.has(path));

  if (paths.length === 0 && !MAY_BE_EMPTY.has(segment)) {
    throw new SitemapSegmentError(
      `Segment ${segment} ist leer (${out.paths.length} vor dem Filter)`,
    );
  }

  const origin = siteUrl.replace(/\/+$/, "");
  const abs = (path: string) => `${origin}${path}`;

  const alternateLines = (path: string) => {
    const group = out.groups.get(out.groupByPath.get(path) || "");
    if (!group) return [] as string[];
    // Auch Alternates duerfen nicht auf eine Weiterleitung zeigen.
    const entries = [...group.entries()].filter(([, p]) => !redirected.has(p));
    const lines = entries.map(
      ([locale, p]) =>
        `    <xhtml:link rel="alternate" hreflang="${escapeXml(locale)}" href="${escapeXml(abs(p))}" />`,
    );
    const defaultPath = group.get(DEFAULT_LOCALE);
    if (defaultPath && !redirected.has(defaultPath)) {
      lines.push(
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(abs(defaultPath))}" />`,
      );
    }
    return lines;
  };

  const body = paths
    .map((path) =>
      [
        "  <url>",
        `    <loc>${escapeXml(abs(path))}</loc>`,
        ...alternateLines(path),
        "  </url>",
      ].join("\n"),
    )
    .join("\n");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
    `xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    `${body}\n` +
    `</urlset>`;

  return { xml, count: paths.length, droppedRedirects: redirected.size };
}

export function buildSitemapIndex(siteUrl: string): string {
  const origin = siteUrl.replace(/\/+$/, "");
  const entries = SITEMAP_SEGMENTS.map(
    (segment) =>
      `  <sitemap>\n    <loc>${escapeXml(`${origin}/sitemaps/${segment}.xml`)}</loc>\n  </sitemap>`,
  ).join("\n");
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${entries}\n` +
    `</sitemapindex>`
  );
}

/** Basis-URL fuer absolute Links, wie bisher in sitemap.xml.ts. */
export function resolveSiteUrl(event: any): string {
  const config = useRuntimeConfig();
  const requestUrl = getRequestURL(event);
  return (
    config.public.publicUrl || `${requestUrl.protocol}//${requestUrl.host}`
  );
}
