import { resolveRedirect, splitPathAndSearch } from "../utils/redirects";
import { resolvePatternRedirect } from "../utils/adsRedirects";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const rawPath = typeof query.path === "string" ? query.path : "";
  if (!rawPath) {
    return { redirect: null };
  }

  const { pathname, search } = splitPathAndSearch(rawPath);
  // Gleiche Muster wie server/middleware/redirects.ts, auch bei Navigation im
  // Browser (go.: /blog, Botox-Pfade; beide: Aachen-Lippenseite).
  const pattern = await resolvePatternRedirect(event, pathname, search);
  if (pattern) return { redirect: pattern };
  const result = await resolveRedirect(pathname, search);
  return { redirect: result };
});
