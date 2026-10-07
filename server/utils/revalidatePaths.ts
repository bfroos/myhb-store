/**
 * Welche URLs erneuert ein Strapi-Webhook? (TSEO-03)
 *
 * Fuer jeden Inhaltstyp, der eigene Seiten hat, werden alle Sprachfassungen
 * des Dokuments aus Strapi geladen (locale=*) und daraus die Pfade gebaut -
 * mit derselben Pfadlogik wie die Sitemap (server/utils/sitemap.ts). Dazu
 * kommen die Uebersichtsseiten, auf denen der Eintrag erscheint.
 *
 * Bewusst NICHT revalidiert wird alles, was den Eintrag nur am Rand zeigt
 * (z. B. ein Arzt auf einer Filialseite). Das holt das ISR-Fenster nach.
 *
 * Die Seiten-Collection (api::page.page) bleibt in revalidate.post.ts, weil
 * sie feste Routen und den Fallback auf deutsche Slugs kennt.
 */
import qs from "qs";
import {
  DEFAULT_LOCALE,
  LOCALES,
  getLocalizedPath,
  type Locale,
} from "./sitemap";

/** "page" (Strapi v5: model) oder "api::page.page" (uid) -> uid. */
export function normalizeWebhookUid(body: {
  uid?: unknown;
  model?: unknown;
}): string {
  const uid = typeof body.uid === "string" ? body.uid : "";
  if (uid.includes("::")) return uid;
  const model = typeof body.model === "string" ? body.model : "";
  if (model.includes("::")) return model;
  return model ? `api::${model}.${model}` : "";
}

const isLocale = (value: unknown): value is Locale =>
  (LOCALES as readonly string[]).includes(value as string);

/** Pfadsegmente aus Strapi landen in einer URL. */
const SAFE_SEGMENTS = /^[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*)*$/i;
const safe = (value: unknown): value is string =>
  typeof value === "string" && SAFE_SEGMENTS.test(value);

const PRODUCTS_INDEX: Record<Locale, string> = {
  de: "/produkte",
  en: "/en/products",
  tr: "/tr/urunler",
  ar: "/ar/muntajat",
  fr: "/fr/produits",
  nl: "/nl/producten",
};

const allLocales = (routeKey: Parameters<typeof getLocalizedPath>[0]) =>
  LOCALES.map((locale) => getLocalizedPath(routeKey, locale));

type Fetch = <T>(path: string, query: Record<string, any>) => Promise<T>;

/** Alle Sprachfassungen eines Dokuments. */
async function versions<T>(
  fetchJson: Fetch,
  collection: string,
  documentId: string,
  query: Record<string, any>,
): Promise<Array<T & { locale?: string }>> {
  const res = await fetchJson<{ data?: Array<T & { locale?: string }> }>(
    `/api/${collection}`,
    {
      ...query,
      locale: "*",
      filters: { documentId: { $eq: documentId } },
      pagination: { pageSize: 20 },
    },
  );
  return (res.data || []).filter((v) => isLocale(v.locale));
}

/** Offene Filialen (mit Eroeffnungsdatum), nur Deutsch. */
async function openLocations(fetchJson: Fetch) {
  const res = await fetchJson<{
    data?: Array<{
      slug?: string;
      newOpeningDate?: string | null;
      city?: { slug?: string };
    }>;
  }>("/api/locations", {
    locale: DEFAULT_LOCALE,
    fields: ["slug", "newOpeningDate"],
    populate: { city: { fields: ["slug"] } },
    pagination: { pageSize: 100 },
  });
  return (res.data || []).filter(
    (l) => l.newOpeningDate && safe(l.slug) && safe(l.city?.slug),
  ) as Array<{ slug: string; city: { slug: string } }>;
}

type Builder = (documentId: string, fetchJson: Fetch) => Promise<string[]>;

const BUILDERS: Record<string, Builder> = {
  "api::treatment-page.treatment-page": async (documentId, fetchJson) => {
    const pages = await versions<{ pathKey?: string }>(
      fetchJson,
      "treatment-pages",
      documentId,
      { fields: ["pathKey", "locale"] },
    );
    const paths = [...allLocales("treatments"), ...allLocales("prices")];
    for (const page of pages) {
      if (!safe(page.pathKey)) continue;
      paths.push(
        getLocalizedPath("treatment", page.locale as Locale, {
          slugPath: page.pathKey,
        }),
      );
    }
    // Filial-Behandlungsseiten gibt es nur auf Deutsch. Wo die Behandlung
    // nicht angeboten wird, antwortet der Pfad 404; das kostet einen HEAD.
    const dePathKey = pages.find((p) => p.locale === DEFAULT_LOCALE)?.pathKey;
    if (safe(dePathKey)) {
      for (const location of await openLocations(fetchJson)) {
        paths.push(
          getLocalizedPath("locationTreatment", DEFAULT_LOCALE, {
            citySlug: location.city.slug,
            locationSlug: location.slug,
            treatmentSlugPath: dePathKey,
          }),
        );
      }
    }
    return paths;
  },

  "api::location.location": async (documentId, fetchJson) => {
    const [location] = await versions<{
      slug?: string;
      city?: { slug?: string };
    }>(fetchJson, "locations", documentId, {
      fields: ["slug", "locale"],
      populate: { city: { fields: ["slug"] } },
    }).then((all) => all.filter((l) => l.locale === DEFAULT_LOCALE));
    const paths = [getLocalizedPath("locations", DEFAULT_LOCALE)];
    if (!location || !safe(location.slug) || !safe(location.city?.slug)) {
      return paths;
    }
    const citySlug = location.city!.slug!;
    const locationSlug = location.slug!;
    paths.push(
      getLocalizedPath("city", DEFAULT_LOCALE, { citySlug }),
      getLocalizedPath("location", DEFAULT_LOCALE, { citySlug, locationSlug }),
    );
    const res = await fetchJson<{
      data?: { treatmentPages?: Array<{ pathKey?: string }> };
    }>(`/api/locations/${citySlug}/${locationSlug}/with-treatments`, {
      locale: DEFAULT_LOCALE,
    });
    for (const t of res.data?.treatmentPages || []) {
      if (!safe(t.pathKey)) continue;
      paths.push(
        getLocalizedPath("locationTreatment", DEFAULT_LOCALE, {
          citySlug,
          locationSlug,
          treatmentSlugPath: t.pathKey,
        }),
      );
    }
    return paths;
  },

  "api::city.city": async (documentId, fetchJson) => {
    const cities = await versions<{ slug?: string }>(
      fetchJson,
      "cities",
      documentId,
      { fields: ["slug", "locale"] },
    );
    const paths = [getLocalizedPath("locations", DEFAULT_LOCALE)];
    const city = cities.find((c) => c.locale === DEFAULT_LOCALE);
    if (safe(city?.slug)) {
      paths.push(
        getLocalizedPath("city", DEFAULT_LOCALE, { citySlug: city!.slug }),
      );
    }
    return paths;
  },

  "api::employee.employee": async (documentId, fetchJson) => {
    const doctors = await versions<{ slug?: string }>(
      fetchJson,
      "employees",
      documentId,
      { fields: ["slug", "locale"] },
    );
    return [
      ...allLocales("doctors"),
      ...doctors
        .filter((d) => safe(d.slug))
        .map((d) =>
          getLocalizedPath("doctor", d.locale as Locale, { slug: d.slug }),
        ),
    ];
  },

  "api::blog-article.blog-article": async (documentId, fetchJson) => {
    const articles = await versions<{
      slug?: string;
      category?: { slug?: string };
    }>(fetchJson, "blog-articles", documentId, {
      fields: ["slug", "locale"],
      populate: { category: { fields: ["slug"] } },
    });
    const paths = allLocales("blog");
    for (const a of articles) {
      const locale = a.locale as Locale;
      if (safe(a.slug)) {
        paths.push(getLocalizedPath("blogArticle", locale, { slug: a.slug }));
      }
      if (safe(a.category?.slug)) {
        paths.push(
          getLocalizedPath("blogCategory", locale, { slug: a.category!.slug }),
        );
      }
    }
    return paths;
  },

  "api::blog-category.blog-category": async (documentId, fetchJson) => {
    const categories = await versions<{ slug?: string }>(
      fetchJson,
      "blog-categories",
      documentId,
      { fields: ["slug", "locale"] },
    );
    return [
      ...allLocales("blog"),
      ...categories
        .filter((c) => safe(c.slug))
        .map((c) =>
          getLocalizedPath("blogCategory", c.locale as Locale, { slug: c.slug }),
        ),
    ];
  },

  "api::product.product": async (documentId, fetchJson) => {
    const products = await versions<{
      slug?: string;
      category?: { slug?: string };
    }>(fetchJson, "products", documentId, {
      fields: ["slug", "locale"],
      populate: { category: { fields: ["slug"] } },
    });
    const paths = Object.values(PRODUCTS_INDEX);
    for (const p of products) {
      if (!safe(p.slug) || !safe(p.category?.slug)) continue;
      paths.push(
        getLocalizedPath("product", p.locale as Locale, {
          categorySlug: p.category!.slug,
          productSlug: p.slug,
        }),
      );
    }
    return paths;
  },

  // Jobs haengen an der career-page; jede Aenderung erneuert die Uebersicht
  // und alle Jobseiten.
  "api::career-page.career-page": async (_documentId, fetchJson) => {
    const paths = [...allLocales("career"), ...allLocales("careerDoctors")];
    for (const locale of LOCALES) {
      const res = await fetchJson<{
        data?: { jobs?: Array<{ slug?: string }> };
      }>("/api/career-page", {
        locale,
        populate: { jobs: { fields: ["slug"] } },
      });
      for (const job of res.data?.jobs || []) {
        if (safe(job.slug)) {
          paths.push(getLocalizedPath("job", locale, { slug: job.slug }));
        }
      }
    }
    return paths;
  },
};
BUILDERS["api::job.job"] = BUILDERS["api::career-page.career-page"]!;

export const hasRevalidationBuilder = (uid: string) => uid in BUILDERS;

/** Pfade zu einem Webhook; null, wenn der Typ keine eigenen Seiten hat. */
export async function pathsForEntry(
  uid: string,
  documentId: string,
  strapiUrl: string,
): Promise<string[] | null> {
  const builder = BUILDERS[uid];
  if (!builder) return null;
  const base = strapiUrl.replace(/\/+$/, "");
  const fetchJson: Fetch = (path, query) =>
    $fetch(`${base}${path}?${qs.stringify(query, { encodeValuesOnly: true })}`);
  return [...new Set(await builder(documentId, fetchJson))];
}
