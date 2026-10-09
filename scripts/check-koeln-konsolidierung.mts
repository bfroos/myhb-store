/**
 * Abnahme-Crawl Standort-Konsolidierung Köln (Ticket Punkt 12).
 *
 * Prueft gegen eine laufende Umgebung (Staging/Preview oder Produktion):
 *   1. Jede Behandlung existiert in Köln genau einmal mit 200:
 *      nichtoperativ nur unter /koeln-arcaden, OP nur unter /mediapark-klinik.
 *      Die jeweils andere URL antwortet mit GENAU EINEM 301/308 auf die finale.
 *   2. Alle Alt-URLs aus docs/koeln-konsolidierung/url-mapping.csv fuehren mit
 *      genau einem permanenten Redirect zur finalen URL (keine Ketten/Loops).
 *   3. Finale URLs: 200, Self-Canonical, kein noindex.
 *   4. Sitemap: nur finale Köln-URLs, keine Redirect-/404-URLs.
 *   5. Interne Links im Hauptinhalt der Köln-Seiten: kein Link auf eine
 *      Redirect-URL, kein /behandlungen/-Link, wenn es die lokale Seite gibt.
 *
 * Aufruf:
 *   BASE_URL=https://<preview>.vercel.app npx tsx scripts/check-koeln-konsolidierung.mts
 *   (ohne BASE_URL: https://www.myhealthandbeauty.com)
 * Ergebnis: Konsole + docs/koeln-konsolidierung/crawl-nachher.json; Exit 1 bei Fehlern.
 */

import { readFileSync, writeFileSync } from "node:fs";

const BASE = (process.env.BASE_URL ?? "https://www.myhealthandbeauty.com").replace(/\/+$/, "");
const STRAPI_URL = (
  process.env.NUXT_PUBLIC_STRAPI_URL ?? "https://striking-bear-e5a15ddc94.strapiapp.com"
).replace(/\/+$/, "");
const A = "/standorte/koeln/koeln-arcaden";
const M = "/standorte/koeln/mediapark-klinik";

type Mapping = { existingUrl: string; finalTargetUrl: string; action: string };
// url-mapping.csv: Semikolon-getrennt, Spalten
// Existing URL;Status;Seitentyp;Richtiger Standort;Final Target URL;Maßnahme;...
const mapping: Mapping[] = readFileSync(
  new URL("../docs/koeln-konsolidierung/url-mapping.csv", import.meta.url),
  "utf8",
)
  .split(/\r?\n/)
  .slice(1)
  .filter(Boolean)
  .map((line) => line.split(";"))
  .map((cols) => ({ existingUrl: cols[0], finalTargetUrl: cols[4], action: cols[5] }));

const errors: string[] = [];
const results: Record<string, unknown>[] = [];

async function head(path: string) {
  const res = await fetch(BASE + encodeURI(path), { redirect: "manual" });
  const location = res.headers.get("location");
  return {
    status: res.status,
    location: location ? new URL(location, BASE).pathname : null,
  };
}

async function page(path: string) {
  const res = await fetch(BASE + encodeURI(path), { redirect: "manual" });
  const html = res.status === 200 ? await res.text() : "";
  const canonical = /<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i.exec(html)?.[1] ?? null;
  const robots = /<meta[^>]*name="robots"[^>]*content="([^"]+)"/i.exec(html)?.[1] ?? null;
  const main = /<main[\s\S]*?<\/main>/i.exec(html)?.[0] ?? html;
  const links = Array.from(main.matchAll(/href="(\/[^"#?]*)"/g)).map((m) => m[1]);
  return { status: res.status, canonical, robots, links };
}

async function followOnce(path: string) {
  const first = await head(path);
  if (first.status !== 301 && first.status !== 308) return { ...first, hops: 0, final: path };
  const second = await head(first.location!);
  return { ...first, hops: second.status === 301 || second.status === 308 ? 2 : 1, final: first.location, finalStatus: second.status };
}

async function main() {
  console.log(`Abnahme Köln gegen ${BASE}\n`);

  // 1. Behandlungen x Standorte
  const tp = await fetch(
    `${STRAPI_URL}/api/treatment-pages?locale=de&fields[0]=pathKey&pagination[pageSize]=200`,
  ).then((r) => r.json());
  const pages: { pathKey: string }[] = tp.data.map((p: any) => ({ pathKey: p.pathKey }));
  const finals = new Set<string>();
  for (const { pathKey } of pages) {
    const [a, m] = await Promise.all([followOnce(`${A}/${pathKey}`), followOnce(`${M}/${pathKey}`)]);
    const ok200 = [a.status === 200 ? `${A}/${pathKey}` : null, m.status === 200 ? `${M}/${pathKey}` : null].filter(Boolean) as string[];
    if (ok200.length !== 1) errors.push(`[1] ${pathKey}: ${ok200.length} indexierbare Köln-URLs (${ok200.join(", ") || "keine"})`);
    const other = a.status === 200 ? m : a;
    if (ok200.length === 1) {
      finals.add(ok200[0]);
      if (other.hops !== 1 || other.final !== ok200[0])
        errors.push(`[1] ${pathKey}: Gegenstueck ${other.status} -> ${other.final} (${other.hops} Hops), erwartet 1 Hop auf ${ok200[0]}`);
    }
    results.push({ pathKey, arcaden: a, mediapark: m });
  }

  // 2. Alt-URLs aus dem Mapping
  for (const row of mapping) {
    if (row.existingUrl === row.finalTargetUrl) continue;
    if (!/^301/.test(row.action)) continue;
    const r = await followOnce(row.existingUrl);
    if (r.hops !== 1 || r.final !== row.finalTargetUrl || r.finalStatus !== 200)
      errors.push(`[2] ${row.existingUrl}: ${r.status} -> ${r.final} (${r.hops} Hops, Ziel ${r.finalStatus}); erwartet ${row.finalTargetUrl}`);
    results.push({ url: row.existingUrl, ...r });
  }

  // 3. + 5. Finale Köln-Seiten
  finals.add(A);
  finals.add(M);
  const redirectCache = new Map<string, number>();
  for (const url of finals) {
    const p = await page(url);
    if (p.status !== 200) errors.push(`[3] ${url}: Status ${p.status}`);
    if (p.canonical && new URL(p.canonical, BASE).pathname !== url) errors.push(`[3] ${url}: Canonical ${p.canonical}`);
    if (p.robots && /noindex/i.test(p.robots)) errors.push(`[3] ${url}: robots ${p.robots}`);
    for (const link of new Set(p.links)) {
      if (link.startsWith("/behandlungen/")) {
        const key = link.slice("/behandlungen/".length);
        if (finals.has(`${A}/${key}`) || finals.has(`${M}/${key}`))
          errors.push(`[5] ${url}: nationaler Link ${link}, lokale Seite existiert`);
        continue;
      }
      if (!link.startsWith("/standorte/koeln/")) continue;
      if (!redirectCache.has(link)) redirectCache.set(link, (await head(link)).status);
      const status = redirectCache.get(link)!;
      if (status !== 200) errors.push(`[5] ${url}: Link ${link} antwortet ${status}`);
    }
  }

  // 4. Sitemap
  // /sitemap.xml ist ein Sitemap-Index: die <loc> der Teil-Sitemaps einsammeln.
  const readLocs = (xml: string) =>
    Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1].trim());
  const sitemap = await fetch(`${BASE}/sitemap.xml`).then((r) => r.text());
  const sitemapUrls = /<sitemapindex[\s>]/.test(sitemap)
    ? (
        await Promise.all(
          readLocs(sitemap).map((sub) =>
            // Teil-Sitemaps relativ zu BASE holen (lokal/Preview statt Prod-Host).
            fetch(BASE + new URL(sub).pathname).then((r) => r.text()).then(readLocs),
          ),
        )
      ).flat()
    : readLocs(sitemap);
  const locs = sitemapUrls
    .map((u) => decodeURI(new URL(u).pathname))
    .filter((p) => p.startsWith("/standorte/koeln"));
  for (const loc of locs) {
    if (loc.split("/").length > 4 && !finals.has(loc)) errors.push(`[4] Sitemap enthaelt ${loc} (nicht final)`);
  }
  for (const f of finals) if (!locs.includes(f)) errors.push(`[4] Sitemap fehlt ${f}`);

  writeFileSync(
    new URL("../docs/koeln-konsolidierung/crawl-nachher.json", import.meta.url),
    JSON.stringify({ base: BASE, at: new Date().toISOString(), errors, results, sitemapKoeln: locs }, null, 2),
  );
  console.log(errors.length ? errors.join("\n") : "Alle Pruefungen bestanden.");
  console.log(`\n${finals.size} finale Köln-URLs, ${mapping.length} Mapping-Zeilen, ${locs.length} Sitemap-URLs Köln.`);
  process.exit(errors.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
