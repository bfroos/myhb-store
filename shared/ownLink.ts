/**
 * Eigene Links aus Strapi-Fliesstext ohne Schraegstrich am Ende (TSEO-08).
 *
 * Redakteure fuegen Links oft als https://www.myhealthandbeauty.com/pfad/
 * ein. Jeder davon lief ueber einen 301 (server/middleware/1.trailing-slash.ts);
 * im Audit vom 06.10.2026 stand so ein Kategorie-Link auf jeder Standortseite.
 *
 * Fremde Links und die Startseite bleiben unveraendert, Query und Anker
 * bleiben erhalten.
 */
const OWN_HOSTS = new Set([
  "www.myhealthandbeauty.com",
  "myhealthandbeauty.com",
]);

const stripSlash = (path: string) =>
  path.length > 1 ? path.replace(/\/+$/, "") || "/" : path;

export function normalizeOwnLink(url: string): string {
  if (!url) return url;

  if (url.startsWith("/") && !url.startsWith("//")) {
    const match = /^([^?#]*)(.*)$/.exec(url)!;
    return `${stripSlash(match[1]!)}${match[2]}`;
  }

  if (!/^https?:\/\//i.test(url)) return url;
  try {
    const parsed = new URL(url);
    if (!OWN_HOSTS.has(parsed.hostname.toLowerCase())) return url;
    const path = stripSlash(parsed.pathname);
    if (path === parsed.pathname) return url;
    return `${parsed.origin}${path}${parsed.search}${parsed.hash}`;
  } catch {
    return url;
  }
}
