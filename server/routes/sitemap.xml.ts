/**
 * Runtime sitemap with cache (Nuxt server route)
 *
 * Purpose
 * - Generates /sitemap.xml at runtime
 * - Fetches all URLs from Strapi per locale
 * - Caches the response (maxAge/staleMaxAge below)
 * - Adds hreflang alternates and references /sitemap.xsl
 *
 * Base config
 * - NUXT_PUBLIC_STRAPI_URL must be set (runtimeConfig.public.strapiUrl)
 * - Optional: NUXT_PUBLIC_URL for absolute URLs (otherwise request host)
 *
 * Content sources
 * - Static routes from ROUTE_MAP (default locale: de)
 * - Strapi collections:
 *   treatment-pages, cities, locations (plus location treatments),
 *   blog-categories, blog-articles, career-page jobs,
 *   employees (isActive=true, hideFromPublic=false),
 *   products, pages
 *
 * Structure
 * - ROUTE_MAP mirrors Nuxt i18n routes
 * - fetchCollection loads collections via Strapi REST
 * - getLocalizedPath builds locale-specific paths
 * - addUrl de-duplicates and collects <url> entries
 *
 * Extend: add a new collection
 * 1) Extend ROUTE_MAP (if a new URL structure is needed):
 *    - Example: events -> /events/[slug]
 * 2) Load the collection via fetchCollection:
 *    - fetchCollection<{ slug?: string; updatedAt?: string }>("events", {...})
 * 3) Add URLs:
 *    - const path = getLocalizedPath("events", locale, { slug: item.slug })
 *    - addUrl(toAbsoluteUrl(path), item.updatedAt)
 *
 * Localizations note
 * - The loop over LOCALES ensures each locale gets a URL.
 * - Strapi provides locale-specific slugs, used directly.
 */
import qs from "qs";

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

type UrlEntry = {
  loc: string;
  lastmod?: string;
  groupKey: string;
};

const LOCALES = ["de", "en", "tr", "ar"] as const;
const DEFAULT_LOCALE = "de";

const ROUTE_MAP: Record<
  string,
  { base: string; locales?: Partial<Record<(typeof LOCALES)[number], string>> }
> = {
  home: { base: "/" },
  treatments: {
    base: "/behandlungen",
    locales: { en: "/treatments", tr: "/tedaviler", ar: "/ilajat" },
  },
  treatment: {
    base: "/behandlungen/[...slug]",
    locales: {
      en: "/treatments/[...slug]",
      tr: "/tedaviler/[...slug]",
      ar: "/ilajat/[...slug]",
    },
  },
  locations: {
    base: "/standorte",
    locales: { en: "/locations", tr: "/konumlar", ar: "/mawaqea" },
  },
  city: {
    base: "/standorte/[citySlug]",
    locales: {
      en: "/locations/[citySlug]",
      tr: "/konumlar/[citySlug]",
      ar: "/konumlar/[citySlug]",
    },
  },
  location: {
    base: "/standorte/[citySlug]/[locationSlug]",
    locales: {
      en: "/locations/[citySlug]/[locationSlug]",
      tr: "/konumlar/[citySlug]/[locationSlug]",
      ar: "/konumlar/[citySlug]/[locationSlug]",
    },
  },
  locationTreatment: {
    base: "/standorte/[citySlug]/[locationSlug]/[...treatmentSlug]",
    locales: {
      en: "/locations/[citySlug]/[locationSlug]/[...treatmentSlug]",
      tr: "/konumlar/[citySlug]/[locationSlug]/[...treatmentSlug]",
      ar: "/konumlar/[citySlug]/[locationSlug]/[...treatmentSlug]",
    },
  },
  blog: {
    base: "/blog",
    locales: { en: "/blog", tr: "/blog", ar: "/mudawwana" },
  },
  blogArticle: {
    base: "/blog/[slug]",
    locales: {
      en: "/blog/[slug]",
      tr: "/blog/[slug]",
      ar: "/mudawwana/[slug]",
    },
  },
  blogCategory: {
    base: "/blog/c/[slug]",
    locales: {
      en: "/blog/c/[slug]",
      tr: "/blog/c/[slug]",
      ar: "/mudawwana/c/[slug]",
    },
  },
  career: {
    base: "/karriere",
    locales: { en: "/careers", tr: "/kariyer", ar: "/masar-mihani" },
  },
  job: {
    base: "/karriere/jobs/[slug]",
    locales: {
      en: "/careers/[slug]",
      tr: "/kariyer/[slug]",
      ar: "/masar-mihani/[slug]",
    },
  },
  prices: {
    base: "/preise",
    locales: { en: "/prices", tr: "/fiyatlar", ar: "/asaar" },
  },
  about: {
    base: "/ueber-uns",
    locales: { en: "/about-us", tr: "/hakkimizda", ar: "/man-nahnu" },
  },
  doctors: {
    base: "/aerzte",
    locales: { en: "/doctors", tr: "/doktorlar", ar: "/atibba" },
  },
  doctor: {
    base: "/aerzte/[slug]",
    locales: {
      en: "/doctors/[slug]",
      tr: "/doktorlar/[slug]",
      ar: "/atibba/[slug]",
    },
  },
  product: {
    base: "/produkte/[categorySlug]/[productSlug]",
    locales: {
      en: "/products/[categorySlug]/[productSlug]",
      tr: "/urunler/[categorySlug]/[productSlug]",
      ar: "/muntajat/[categorySlug]/[productSlug]",
    },
  },
  general: { base: "/p/[slug]" },
};

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const strapiUrl = config.public.strapiUrl;
    if (!strapiUrl) {
      throw createError({
        statusCode: 500,
        statusMessage: "NUXT_PUBLIC_STRAPI_URL fehlt fuer sitemap.xml",
      });
    }

    const requestUrl = getRequestURL(event);
    const siteUrl =
      config.public.publicUrl || `${requestUrl.protocol}//${requestUrl.host}`;

    const entriesByLoc = new Map<string, UrlEntry>();
    const groups = new Map<string, Map<(typeof LOCALES)[number], string>>();

    const buildGroupKey = (routeKey: string, id: string) => `${routeKey}:${id}`;
    const getGroupId = (
      entity: { id?: number; localizations?: Array<{ id?: number }> },
      fallback?: string,
    ) => {
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

    const addUrl = (
      groupKey: string,
      locale: (typeof LOCALES)[number],
      loc: string,
      lastmod?: string,
    ) => {
      const existing = entriesByLoc.get(loc);
      if (!existing) {
        entriesByLoc.set(loc, { loc, lastmod, groupKey });
      } else if (!existing.lastmod && lastmod) {
        entriesByLoc.set(loc, { ...existing, lastmod });
      }

      const group = groups.get(groupKey) || new Map();
      group.set(locale, loc);
      groups.set(groupKey, group);
    };

    const getRouteTemplate = (
      routeKey: keyof typeof ROUTE_MAP,
      locale: (typeof LOCALES)[number],
    ) => {
      const route = ROUTE_MAP[routeKey];
      return route.locales?.[locale] || route.base;
    };

    const withPrefix = (locale: (typeof LOCALES)[number], path: string) => {
      if (locale === DEFAULT_LOCALE) return path || "/";
      if (path === "/") return `/${locale}`;
      return `/${locale}${path}`;
    };

    const fillPath = (
      template: string,
      params: Partial<{
        slug: string;
        slugPath: string;
        citySlug: string;
        locationSlug: string;
        treatmentSlugPath: string;
        categorySlug: string;
        productSlug: string;
      }>,
    ) => {
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

    const toAbsoluteUrl = (path: string) =>
      `${siteUrl.replace(/\/+$/, "")}${path}`;

    const getLocalizedPath = (
      routeKey: keyof typeof ROUTE_MAP,
      locale: (typeof LOCALES)[number],
      params: Parameters<typeof fillPath>[1] = {},
    ) => {
      const template = getRouteTemplate(routeKey, locale);
      const filled = fillPath(template, params);
      return withPrefix(locale, filled);
    };

    const fetchCollection = async <T>(
      collection: string,
      query: Record<string, any>,
    ): Promise<T[]> => {
      let page = 1;
      const pageSize = 100;
      const results: T[] = [];
      let pageCount = 1;

      do {
        const queryString = qs.stringify(
          {
            ...query,
            locale: query.locale,
            publicationState: "live",
            pagination: {
              page,
              pageSize,
            },
          },
          { encodeValuesOnly: true },
        );

        const headers: Record<string, string> = {};
        if (config.strapiApiToken) {
          headers.Authorization = `Bearer ${config.strapiApiToken}`;
        }

        const response = await $fetch<StrapiListResponse<T>>(
          `${strapiUrl}/api/${collection}?${queryString}`,
          {
            headers: Object.keys(headers).length > 0 ? headers : undefined,
          },
        );

        results.push(...(response.data || []));
        pageCount = response.meta?.pagination?.pageCount || 1;
        page += 1;
      } while (page <= pageCount);

      return results;
    };

    for (const locale of LOCALES) {
      const staticRoutes: Array<{ key: keyof typeof ROUTE_MAP }> = [
        { key: "home" },
        { key: "treatments" },
        { key: "locations" },
        { key: "blog" },
        { key: "career" },
        { key: "prices" },
        { key: "about" },
        { key: "doctors" },
      ];

      for (const route of staticRoutes) {
        const groupKey = buildGroupKey(route.key, "static");
        const path = getLocalizedPath(route.key, locale);
        addUrl(groupKey, locale, toAbsoluteUrl(path));
      }

      const [treatmentPages, cities, locations, blogCategories, blogArticles] =
        await Promise.all([
          fetchCollection<{
            id?: number;
            pathKey?: string;
            updatedAt?: string;
            localizations?: Array<{ id?: number }>;
          }>("treatment-pages", {
            locale,
            fields: ["pathKey", "updatedAt"],
            filters: {
              pathKey: { $notNull: true },
            },
            populate: {
              localizations: {
                fields: ["id"],
              },
            },
          }),
          fetchCollection<{
            id?: number;
            slug?: string;
            updatedAt?: string;
            localizations?: Array<{ id?: number }>;
          }>("cities", {
            locale,
            fields: ["slug", "updatedAt"],
            populate: {
              localizations: {
                fields: ["id"],
              },
            },
          }),
          fetchCollection<{
            id?: number;
            slug?: string;
            updatedAt?: string;
            city?: { slug?: string };
            localizations?: Array<{ id?: number }>;
          }>("locations", {
            locale,
            fields: ["slug", "updatedAt"],
            populate: {
              city: {
                fields: ["slug"],
              },
              localizations: {
                fields: ["id"],
              },
            },
          }),
          fetchCollection<{
            id?: number;
            slug?: string;
            updatedAt?: string;
            localizations?: Array<{ id?: number }>;
          }>("blog-categories", {
            locale,
            fields: ["slug", "updatedAt"],
            populate: {
              localizations: {
                fields: ["id"],
              },
            },
          }),
          fetchCollection<{
            id?: number;
            slug?: string;
            updatedAt?: string;
            localizations?: Array<{ id?: number }>;
          }>("blog-articles", {
            locale,
            fields: ["slug", "updatedAt"],
            populate: {
              localizations: {
                fields: ["id"],
              },
            },
          }),
        ]);

      const treatmentGroupIdByPathKey = new Map<string, string>();
      for (const page of treatmentPages) {
        if (!page.pathKey) continue;
        const groupId = getGroupId(page, page.pathKey);
        if (!groupId) continue;
        treatmentGroupIdByPathKey.set(page.pathKey, groupId);
        const groupKey = buildGroupKey("treatment", groupId);
        const path = getLocalizedPath("treatment", locale, {
          slugPath: page.pathKey,
        });
        addUrl(groupKey, locale, toAbsoluteUrl(path), page.updatedAt);
      }

      for (const city of cities) {
        if (!city.slug) continue;
        const groupId = getGroupId(city, city.slug);
        if (!groupId) continue;
        const groupKey = buildGroupKey("city", groupId);
        const path = getLocalizedPath("city", locale, {
          citySlug: city.slug,
        });
        addUrl(groupKey, locale, toAbsoluteUrl(path), city.updatedAt);
      }

      for (const location of locations) {
        if (!location.slug || !location.city?.slug) continue;
        const groupId = getGroupId(
          location,
          `${location.city.slug}/${location.slug}`,
        );
        if (!groupId) continue;
        const groupKey = buildGroupKey("location", groupId);
        const path = getLocalizedPath("location", locale, {
          citySlug: location.city.slug,
          locationSlug: location.slug,
        });
        addUrl(groupKey, locale, toAbsoluteUrl(path), location.updatedAt);
      }

      const locationTreatmentPages = await Promise.all(
        locations
          .filter((location) => location.slug && location.city?.slug)
          .map(async (location) => {
            try {
              const data = await $fetch<{
                data?: { treatmentPages?: Array<{ pathKey?: string }> };
              }>(
                `${strapiUrl}/api/locations/${location.city?.slug}/${
                  location.slug
                }/with-treatments?${qs.stringify(
                  { locale },
                  { encodeValuesOnly: true },
                )}`,
              );
              return { location, treatments: data.data?.treatmentPages || [] };
            } catch {
              return { location, treatments: [] };
            }
          }),
      );

      for (const entry of locationTreatmentPages) {
        const location = entry.location;
        if (!location?.slug || !location.city?.slug) continue;
        const locationGroupId = getGroupId(
          location,
          `${location.city.slug}/${location.slug}`,
        );
        if (!locationGroupId) continue;
        for (const treatment of entry.treatments) {
          if (!treatment.pathKey) continue;
          const treatmentGroupId =
            treatmentGroupIdByPathKey.get(treatment.pathKey) ||
            treatment.pathKey;
          const groupKey = buildGroupKey(
            "locationTreatment",
            `${locationGroupId}/${treatmentGroupId}`,
          );
          const path = getLocalizedPath("locationTreatment", locale, {
            citySlug: location.city.slug,
            locationSlug: location.slug,
            treatmentSlugPath: treatment.pathKey,
          });
          addUrl(groupKey, locale, toAbsoluteUrl(path));
        }
      }

      for (const category of blogCategories) {
        if (!category.slug) continue;
        const groupId = getGroupId(category, category.slug);
        if (!groupId) continue;
        const groupKey = buildGroupKey("blogCategory", groupId);
        const path = getLocalizedPath("blogCategory", locale, {
          slug: category.slug,
        });
        addUrl(groupKey, locale, toAbsoluteUrl(path), category.updatedAt);
      }

      for (const article of blogArticles) {
        if (!article.slug) continue;
        const groupId = getGroupId(article, article.slug);
        if (!groupId) continue;
        const groupKey = buildGroupKey("blogArticle", groupId);
        const path = getLocalizedPath("blogArticle", locale, {
          slug: article.slug,
        });
        addUrl(groupKey, locale, toAbsoluteUrl(path), article.updatedAt);
      }

      const careerPage = await $fetch<{
        data?: {
          jobs?: Array<{
            id?: number;
            slug?: string;
            updatedAt?: string;
            localizations?: Array<{ id?: number }>;
          }>;
        };
      }>(
        `${strapiUrl}/api/career-page?${qs.stringify(
          {
            locale,
            populate: {
              jobs: {
                fields: ["slug", "updatedAt"],
                populate: {
                  localizations: {
                    fields: ["id"],
                  },
                },
              },
            },
          },
          { encodeValuesOnly: true },
        )}`,
      );

      for (const job of careerPage.data?.jobs || []) {
        if (!job.slug) continue;
        const groupId = getGroupId(job, job.slug);
        if (!groupId) continue;
        const groupKey = buildGroupKey("job", groupId);
        const path = getLocalizedPath("job", locale, { slug: job.slug });
        addUrl(groupKey, locale, toAbsoluteUrl(path), job.updatedAt);
      }

      const doctors = await fetchCollection<{
        id?: number;
        slug?: string;
        updatedAt?: string;
        localizations?: Array<{ id?: number }>;
      }>("employees", {
        locale,
        fields: ["slug", "updatedAt"],
        filters: {
          isActive: { $eq: true },
          hideFromPublic: { $eq: false },
        },
        populate: {
          localizations: {
            fields: ["id"],
          },
        },
      });

      for (const doctor of doctors) {
        if (!doctor.slug) continue;
        const groupId = getGroupId(doctor, doctor.slug);
        if (!groupId) continue;
        const groupKey = buildGroupKey("doctor", groupId);
        const path = getLocalizedPath("doctor", locale, { slug: doctor.slug });
        addUrl(groupKey, locale, toAbsoluteUrl(path), doctor.updatedAt);
      }

      const products = await fetchCollection<{
        id?: number;
        slug?: string;
        updatedAt?: string;
        category?: { slug?: string };
        localizations?: Array<{ id?: number }>;
      }>("products", {
        locale,
        fields: ["slug", "updatedAt"],
        populate: {
          category: { fields: ["slug"] },
          localizations: {
            fields: ["id"],
          },
        },
      });

      for (const product of products) {
        if (!product.slug || !product.category?.slug) continue;
        const groupId = getGroupId(product, product.slug);
        if (!groupId) continue;
        const groupKey = buildGroupKey("product", groupId);
        const path = getLocalizedPath("product", locale, {
          categorySlug: product.category.slug,
          productSlug: product.slug,
        });
        addUrl(groupKey, locale, toAbsoluteUrl(path), product.updatedAt);
      }

      const generalPages = await fetchCollection<{
        id?: number;
        slug?: string;
        updatedAt?: string;
        localizations?: Array<{ id?: number }>;
      }>("pages", {
        locale,
        fields: ["slug", "updatedAt"],
        populate: {
          localizations: {
            fields: ["id"],
          },
        },
      });

      for (const page of generalPages) {
        if (!page.slug) continue;
        const groupId = getGroupId(page, page.slug);
        if (!groupId) continue;
        const groupKey = buildGroupKey("general", groupId);
        const path = getLocalizedPath("general", locale, { slug: page.slug });
        addUrl(groupKey, locale, toAbsoluteUrl(path), page.updatedAt);
      }
    }

    const escapeXml = (value: string) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

    const buildAlternateLinks = (
      group?: Map<(typeof LOCALES)[number], string>,
    ) => {
      if (!group) return [] as string[];

      const alternates = Array.from(group.entries()).map(([locale, href]) => {
        return `    <xhtml:link rel="alternate" hreflang="${escapeXml(
          locale,
        )}" href="${escapeXml(href)}" />`;
      });

      const defaultHref = group.get(DEFAULT_LOCALE);
      if (defaultHref) {
        alternates.push(
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(
            defaultHref,
          )}" />`,
        );
      }

      return alternates;
    };

    const urls = Array.from(entriesByLoc.values())
      .map((entry) => {
        const alternates = buildAlternateLinks(groups.get(entry.groupKey));
        const lines = [
          "  <url>",
          `    <loc>${escapeXml(entry.loc)}</loc>`,
          ...alternates,
        ];

        if (entry.lastmod) {
          lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
        }

        lines.push("  </url>");
        return lines.join("\n");
      })
      .join("\n");

    setHeader(event, "Content-Type", "application/xml");

    return (
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
      `xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
      `${urls}\n` +
      `</urlset>`
    );
  },
  {
    name: "sitemap.xml",
    maxAge: 60 * 60 * 24,
    staleMaxAge: 60 * 60 * 24,
  },
);
