import { resolveRedirect } from "../utils/redirects";
import { resolvePatternRedirect } from "../utils/adsRedirects";
import { hautanalysePrototypZiel } from "#shared/hautanalyseCta";

export default defineEventHandler(async (event) => {
  const method = event.method || "GET";
  if (method !== "GET" && method !== "HEAD") return;

  const { pathname, search } = getRequestURL(event);

  // myhb-os#643: alter Hautanalyse-Prototyp -> Analyse in der App.
  const hautanalyse = hautanalysePrototypZiel(pathname, search);
  if (hautanalyse) return sendRedirect(event, hautanalyse, 301);

  // Muster-Weiterleitungen (beide: Aachen-Lippenseite; go.: Blog, Botox-Pfade).
  const pattern = await resolvePatternRedirect(event, pathname, search);
  if (pattern) return sendRedirect(event, pattern.target, pattern.code);

  const config = useRuntimeConfig();
  if (config.public.siteMode === "ads") return;

  const result = await resolveRedirect(pathname, search);
  if (!result) return;
  // TSEO-11: entfernte Seiten mit 410 statt 404, damit Google sie schneller
  // aus dem Index nimmt.
  if (result.code === 410) {
    throw createError({ statusCode: 410, statusMessage: "Gone" });
  }
  return sendRedirect(event, result.target, result.code);
});
