// store#422 (E24): Ärzte eines Standorts als Links für die Standortseite.
// Gleiche Strapi-Abfrage wie locationDoctors (server/utils/adsLocationData.ts),
// aber nur Name und Slug, ohne Obergrenze. Test-Einträge fallen über
// sanitizeReviewsDeep raus. 5 Minuten im Speicher, 5 Minuten am CDN.
import { standortAerzteLinks } from "#shared/standortAerzte";
import { sanitizeReviewsDeep } from "#shared/reviewPrivacy";

const cache = new Map<string, { at: number; data: any[] }>();

async function alleAerzte(event: any, locale: string): Promise<any[]> {
  const hit = cache.get(locale);
  if (hit && Date.now() - hit.at < 5 * 60_000) return hit.data;
  const config = useRuntimeConfig(event);
  const base = String(config.public.strapiUrl || "").replace(/\/+$/, "");
  const params = new URLSearchParams({
    locale,
    "filters[employeeType][$eq]": "doctor",
    "pagination[pageSize]": "200",
    "fields[0]": "academicTitle",
    "fields[1]": "firstName",
    "fields[2]": "lastName",
    "fields[3]": "employeeType",
    "fields[4]": "isActive",
    "fields[5]": "hideFromPublic",
    "fields[6]": "slug",
    "populate[locations][fields][0]": "slug",
  });
  const res: any = await $fetch(`${base}/api/employees?${params}`);
  const data = sanitizeReviewsDeep(res?.data ?? []);
  cache.set(locale, { at: Date.now(), data });
  return data;
}

export default defineEventHandler(async (event) => {
  const loc = getRouterParam(event, "loc") ?? "";
  if (!/^[a-z0-9-]{1,80}$/.test(loc)) {
    throw createError({ statusCode: 400, statusMessage: "Bad location" });
  }
  let doctors: ReturnType<typeof standortAerzteLinks> = [];
  try {
    doctors = standortAerzteLinks(await alleAerzte(event, "de"), loc);
  } catch {
    doctors = [];
  }
  setHeader(event, "Cache-Control", "public, max-age=300, s-maxage=300");
  return { doctors };
});
