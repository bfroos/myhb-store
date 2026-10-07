/**
 * Eigene Links in Strapi-Inhalten direkt auf das Weiterleitungsziel (TSEO-08).
 *
 * Redakteure verlinken im Fliesstext oft alte Adressen (z. B.
 * /aerzte/dr-iqra, seit der Slug-Bereinigung /aerzte/iqra). Jeder solche Link
 * kostete Besucher und Googlebot einen 301; im Audit vom 06.10.2026 standen
 * sie auf allen Koelner Standort-Behandlungsseiten.
 *
 * Der Strapi-Proxy schickt die Antwort im SEO-Modus hier durch: Jeder String
 * unter einem URL-Feld (url, href, link, to), der auf die eigene Domain zeigt,
 * wird gegen die gemergte Weiterleitungstabelle (server/utils/redirects.ts)
 * geprueft und bei einem Treffer durch das Ziel ersetzt. Absolute Links
 * bleiben absolut, relative relativ. Fremde Links und Ziele ausserhalb der
 * eigenen Domain bleiben unberuehrt.
 */
import { resolveRedirect, splitPathAndSearch } from "./redirects";

const URL_KEY = /^(?:url|href|link|to)$/i;
const OWN_ORIGINS = [
  "https://www.myhealthandbeauty.com",
  "https://myhealthandbeauty.com",
];

/** Pfad eines eigenen Links oder null. */
function ownPath(value: string): { origin: string; path: string } | null {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return { origin: "", path: value };
  }
  const origin = OWN_ORIGINS.find(
    (o) => value === o || value.startsWith(`${o}/`) || value.startsWith(`${o}?`),
  );
  if (!origin) return null;
  return { origin, path: value.slice(origin.length) || "/" };
}

function collect(value: any, out: Set<string>, key?: string): void {
  if (typeof value === "string") {
    if (key && URL_KEY.test(key) && ownPath(value)) out.add(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collect(item, out, key);
    return;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) collect(v, out, k);
  }
}

function replace(value: any, map: Map<string, string>, key?: string): any {
  if (typeof value === "string") {
    return key && URL_KEY.test(key) ? map.get(value) ?? value : value;
  }
  if (Array.isArray(value)) return value.map((item) => replace(item, map, key));
  if (value && typeof value === "object") {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) out[k] = replace(v, map, k);
    return out;
  }
  return value;
}

export async function rewriteRedirectedLinks<T>(input: T): Promise<T> {
  const candidates = new Set<string>();
  collect(input, candidates);
  if (candidates.size === 0) return input;

  const map = new Map<string, string>();
  await Promise.all(
    [...candidates].map(async (value) => {
      const own = ownPath(value)!;
      const { pathname, search } = splitPathAndSearch(own.path);
      const hit = await resolveRedirect(pathname, search);
      // Nur Ziele auf der eigenen Domain; externe Ziele bleiben wie gepflegt.
      if (hit && hit.target.startsWith("/") && !hit.target.startsWith("//")) {
        map.set(value, `${own.origin}${hit.target}`);
      }
    }),
  );
  return map.size ? replace(input, map) : input;
}
