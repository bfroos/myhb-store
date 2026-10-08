/**
 * Vorschau und ISR-Cache (TSEO-03).
 *
 * Vercel umgeht den ISR-Cache einer Seite nur, wenn der Request das Cookie
 * __prerender_bypass mit genau dem bypassToken aus nuxt.config.ts traegt; das
 * Ergebnis wird dann auch nicht gespeichert. Seit die Query nicht mehr im
 * Cache-Key steht, ist das der einzige Weg, wie die Strapi-Vorschau frische
 * Entwuerfe sieht - frueher erzwang ?_preview_refresh=<zeit> einen eigenen
 * Eintrag.
 *
 * Umgekehrt gilt deshalb: Ein Entwurf darf nur gerendert werden, wenn dieses
 * Cookie stimmt. Sonst rendert ein Cache-MISS mit __NUXT_PREVIEW-Cookie den
 * Entwurf und Vercel liefert ihn danach an alle Besucher aus.
 */

export const PRERENDER_BYPASS_COOKIE = "__prerender_bypass";

/** Token, mit dem Vercel den ISR-Cache umgeht; leer = nicht konfiguriert. */
export function getPrerenderBypassToken(): string {
  return process.env.VERCEL_BYPASS_TOKEN || "";
}

/**
 * Darf dieser Request Entwuerfe sehen, ohne dass das Ergebnis im ISR-Cache
 * landet? Ausserhalb von Vercel (nuxt dev/preview) gibt es keinen ISR-Cache,
 * dort reicht das Vorschau-Cookie allein.
 */
export function hasPrerenderBypass(event: any): boolean {
  if (!process.env.VERCEL) return true;
  const token = getPrerenderBypassToken();
  if (!token) return false;
  const raw = getRequestHeader(event, "cookie") || "";
  const value =
    getCookie(event, PRERENDER_BYPASS_COOKIE) ||
    /(?:^|;\s*)__prerender_bypass=([^;]+)/.exec(raw)?.[1];
  return value === token;
}
