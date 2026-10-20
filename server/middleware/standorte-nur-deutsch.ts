/**
 * Standortseiten gibt es nur auf Deutsch (TSEO-01).
 *
 * Stadt-, Filial- und Filial-Behandlungsseiten waren unter /en/locations,
 * /tr/konumlar, /ar/konumlar, /fr/lieux und /nl/locaties als indexierbare
 * Duplikate erreichbar (Audit 06.10.2026: ~2.740 URLs, alle 200 + index,
 * teils mit leeren Platzhaltern im Titel), obwohl die Sitemap sie nie fuehrte.
 * Entscheidung Benjamin 07.10.2026: 301 auf die deutsche Seite.
 *
 * Lokalisierte Slugs werden ueber die Strapi-Lokalisierungen auf Deutsch
 * zurueckgefuehrt (Stadt "cologne"/"kuluniya" -> "koeln", englischer pathKey ->
 * deutscher). Unbekannte Slugs bleiben unveraendert. Die Uebersicht
 * (/en/locations ohne weiteres Segment) bleibt bestehen.
 *
 * Filial-Behandlungsseiten landen in einem Hop auf der finalen Seite: Gehoert
 * die Behandlung in der Stadt zu einem anderen Standort (Konsolidierung Koeln,
 * myhb-cms locationTreatmentRouting), liefert der CMS-Endpunkt der Seite
 * `data.redirect`, und die Middleware leitet direkt dorthin statt erst auf die
 * deutsche Seite, die dann ein zweites Mal umleiten wuerde.
 *
 * Ausnahme seit 16.10.2026: Filialseiten mit dem Strapi-Haken
 * "showFrenchPage" bleiben unter /fr/lieux/<stadt>/<filiale> stehen.
 *
 * Faellt Strapi aus, leitet die Middleware mit unveraenderten Slugs um; das
 * trifft fuer alle Slugs ausser Koeln ohnehin die richtige Seite.
 */
import qs from "qs";

const PREFIX = /^\/(en|tr|ar|fr|nl)\/(locations|konumlar|lieux|locaties)\/(.+)$/;
const TTL_MS = 10 * 60 * 1000;

type SlugMaps = {
  city: Map<string, string>;
  location: Map<string, string>;
  pathKey: Map<string, string>;
  /** Deutsche Filial-Slugs mit Strapi-Haken "showFrenchPage". */
  french: Set<string>;
};

let cache: { at: number; maps: SlugMaps } | null = null;

/**
 * documentId -> de-Wert; danach jeder lokalisierte Wert -> de-Wert.
 * Mit `flagField` zusaetzlich die de-Werte, bei denen dieser Haken gesetzt ist.
 */
async function loadMap(
  strapiUrl: string,
  collection: string,
  field: string,
  flagField?: string,
): Promise<{ map: Map<string, string>; flagged: Set<string> }> {
  type Row = { documentId?: string; locale?: string } & Record<string, any>;
  const rows: Row[] = [];
  // Strapi deckelt pageSize (Standard 100), also seitenweise.
  for (let page = 1, pageCount = 1; page <= pageCount; page++) {
    const res = await $fetch<{
      data?: Row[];
      meta?: { pagination?: { pageCount?: number } };
    }>(
      `${strapiUrl}/api/${collection}?${qs.stringify(
        {
          locale: "*",
          fields: [field, "locale", ...(flagField ? [flagField] : [])],
          pagination: { page, pageSize: 100 },
        },
        { encodeValuesOnly: true },
      )}`,
    );
    rows.push(...(res.data || []));
    pageCount = res.meta?.pagination?.pageCount || 1;
  }
  const german = new Map<string, string>();
  const flagged = new Set<string>();
  for (const row of rows) {
    if (row.locale === "de" && row.documentId && row[field]) {
      german.set(row.documentId, row[field]);
      if (flagField && row[flagField] === true) flagged.add(row[field]);
    }
  }
  const map = new Map<string, string>();
  for (const row of rows) {
    const de = row.documentId ? german.get(row.documentId) : undefined;
    if (de && row[field] && !map.has(row[field])) map.set(row[field], de);
  }
  return { map, flagged };
}

// Konsolidierungsziel je deutscher Filial-Behandlungsseite (null = keins).
const targetCache = new Map<string, { at: number; target: string | null }>();

/** Finale deutsche URL, wenn der Standort die Behandlung abgibt (sonst null). */
async function consolidatedTarget(path: string): Promise<string | null> {
  const hit = targetCache.get(path);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.target;
  const strapiUrl = useRuntimeConfig().public.strapiUrl?.replace(/\/+$/, "");
  if (!strapiUrl) return null;
  try {
    const res = await $fetch<{
      data?: {
        redirect?: {
          citySlug?: string;
          locationSlug?: string;
          treatmentPathKey?: string;
        };
      };
    }>(`${strapiUrl}/api/treatment-pages/${encodeURI(path)}`, {
      query: { locale: "de" },
      timeout: 5000,
    });
    const r = res.data?.redirect;
    const target =
      r?.citySlug && r.locationSlug && r.treatmentPathKey
        ? `/standorte/${r.citySlug}/${r.locationSlug}/${r.treatmentPathKey}`
        : null;
    if (targetCache.size > 2000) targetCache.clear();
    targetCache.set(path, { at: Date.now(), target });
    return target;
  } catch {
    // 404 oder Strapi-Ausfall: auf die deutsche Seite, die entscheidet selbst.
    return null;
  }
}

async function getMaps(): Promise<SlugMaps | null> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.maps;
  const strapiUrl = useRuntimeConfig().public.strapiUrl?.replace(/\/+$/, "");
  if (!strapiUrl) return null;
  try {
    // showFrenchPage kommt mit der ohnehin geladenen Slug-Liste: Eine eigene
    // Abfrage je Aufruf lief bei langsamem Strapi (20.10.2026: 9 s) in den
    // Timeout, leitete die franzoesische Seite um, und der ISR-Cache hielt
    // die Umleitung fest. So gilt bei einem Ausfall der letzte bekannte Stand.
    const [city, location, pathKey] = await Promise.all([
      loadMap(strapiUrl, "cities", "slug"),
      loadMap(strapiUrl, "locations", "slug", "showFrenchPage"),
      loadMap(strapiUrl, "treatment-pages", "pathKey"),
    ]);
    cache = {
      at: Date.now(),
      maps: {
        city: city.map,
        location: location.map,
        pathKey: pathKey.map,
        french: location.flagged,
      },
    };
    return cache.maps;
  } catch (err) {
    console.warn("[standorte-nur-deutsch] Slug-Lookup fehlgeschlagen:", err);
    return cache?.maps ?? null;
  }
}

export default defineEventHandler(async (event) => {
  const method = event.method || "GET";
  if (method !== "GET" && method !== "HEAD") return;
  if (useRuntimeConfig().public.siteMode === "ads") return;

  const { pathname, search } = getRequestURL(event);
  const match = PREFIX.exec(pathname);
  if (!match) return;

  const [citySlug, locationSlug, ...rest] = match[3]!.split("/");
  const maps = await getMaps();

  // Ausnahme: Filialseite mit Strapi-Haken "showFrenchPage" bleibt auf
  // Franzoesisch stehen (Saarbruecken, Benjamin 16.10.2026). Nur die
  // Filialseite selbst, nicht Stadt- oder Behandlungsseiten.
  if (
    match[1] === "fr" &&
    match[2] === "lieux" &&
    locationSlug &&
    !rest.length &&
    maps?.french.has(maps.location.get(locationSlug) ?? locationSlug)
  ) {
    return;
  }
  const segments = [maps?.city.get(citySlug!) ?? citySlug!];
  if (locationSlug) {
    segments.push(maps?.location.get(locationSlug) ?? locationSlug);
  }
  if (rest.length) {
    const pathKey = rest.join("/");
    segments.push(maps?.pathKey.get(pathKey) ?? pathKey);
  }

  const target =
    (rest.length && (await consolidatedTarget(segments.join("/")))) ||
    `/standorte/${segments.join("/")}`;

  return sendRedirect(event, `${target}${search || ""}`, 301);
});
