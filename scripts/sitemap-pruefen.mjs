#!/usr/bin/env node
/**
 * Sitemap-Pruefung (TSEO-05).
 *
 * Liest /sitemap.xml (Index) und alle Teil-Sitemaps und ruft jede URL ohne
 * Weiterleitungen zu folgen ab. Fehler, die den Lauf rot machen:
 *
 * - Index oder eine Teil-Sitemap nicht erreichbar / kein gueltiges XML
 * - URL antwortet nicht mit 200 (also auch jede Weiterleitung)
 * - <meta name="robots"> oder X-Robots-Tag enthaelt noindex
 * - Canonical fehlt oder zeigt nicht auf die URL selbst
 * - URL steht mehrfach (in einer oder mehreren Teil-Sitemaps)
 * - hreflang-Alternate in der Sitemap zeigt auf eine Weiterleitung oder 404
 *   (nur Stichprobe, siehe --alternates)
 *
 * Bewusst nicht im PR-Check, sondern naechtlich gegen Produktion: 1.700 URLs
 * dauern Minuten, und ein Inhaltsfehler in Strapi soll keinen fremden PR rot
 * machen.
 *
 *   node scripts/sitemap-pruefen.mjs [--host https://www.myhealthandbeauty.com]
 *     [--concurrency 6] [--alternates 200]
 */

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const HOST = opt("host", "https://www.myhealthandbeauty.com").replace(/\/+$/, "");
const CONCURRENCY = Number(opt("concurrency", "6")) || 6;
const ALTERNATE_SAMPLE = Number(opt("alternates", "200")) || 0;
const UA = { "user-agent": "myhb-sitemap-pruefung" };

const errors = [];
const fail = (kind, url, detail = "") => errors.push({ kind, url, detail });

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const tags = (xml, tag) =>
  [...xml.matchAll(new RegExp(`<${tag}>([^<]+)</${tag}>`, "g"))].map((m) => decode(m[1]));

async function fetchXml(url) {
  const res = await fetch(url, { headers: UA, redirect: "manual" });
  if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  if (!text.trimStart().startsWith("<?xml")) throw new Error("kein XML");
  return text;
}

async function pool(items, worker) {
  let next = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < items.length) await worker(items[next++]);
    }),
  );
}

// 1. Index und Teil-Sitemaps
let index;
try {
  index = await fetchXml(`${HOST}/sitemap.xml`);
} catch (err) {
  console.error(`Sitemap-Index nicht lesbar: ${err.message}`);
  process.exit(1);
}
if (!index.includes("<sitemapindex")) fail("index", `${HOST}/sitemap.xml`, "kein <sitemapindex>");

const seen = new Map(); // url -> sitemap
const alternates = new Set();
for (const sitemap of tags(index, "loc")) {
  let xml;
  try {
    xml = await fetchXml(sitemap);
  } catch (err) {
    fail("teil-sitemap", sitemap, err.message);
    continue;
  }
  if (!xml.includes("<urlset")) fail("teil-sitemap", sitemap, "kein <urlset>");
  for (const loc of tags(xml, "loc")) {
    if (seen.has(loc)) fail("doppelt", loc, `auch in ${seen.get(loc)}`);
    else seen.set(loc, sitemap);
  }
  for (const m of xml.matchAll(/hreflang="[^"]+" href="([^"]+)"/g)) alternates.add(decode(m[1]));
}

// 2. Jede URL
const urls = [...seen.keys()];
console.log(`${urls.length} URLs aus ${new Set(seen.values()).size} Teil-Sitemaps`);
await pool(urls, async (url) => {
  try {
    const res = await fetch(url, { headers: UA, redirect: "manual" });
    if (res.status !== 200) {
      fail("status", url, `${res.status} ${res.headers.get("location") || ""}`.trim());
      return;
    }
    const header = res.headers.get("x-robots-tag") || "";
    const html = await res.text();
    const robots =
      /<meta[^>]+name="robots"[^>]+content="([^"]*)"/i.exec(html)?.[1] || "";
    if (/noindex/i.test(`${header} ${robots}`)) fail("noindex", url, `${header} ${robots}`.trim());
    const canonical = /<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i.exec(html)?.[1];
    if (!canonical) fail("canonical", url, "fehlt");
    else if (canonical !== url) fail("canonical", url, `zeigt auf ${canonical}`);
  } catch (err) {
    fail("abruf", url, String(err));
  }
});

// 3. Stichprobe der hreflang-Alternates, die nicht selbst in der Sitemap stehen
const extra = [...alternates].filter((u) => !seen.has(u)).slice(0, ALTERNATE_SAMPLE);
await pool(extra, async (url) => {
  const res = await fetch(url, { headers: UA, redirect: "manual" }).catch(() => null);
  if (!res || res.status !== 200) fail("alternate", url, String(res?.status ?? "Fehler"));
});

// Bericht
const byKind = errors.reduce((acc, e) => ((acc[e.kind] = (acc[e.kind] || 0) + 1), acc), {});
if (!errors.length) {
  console.log(`OK: ${urls.length} URLs, ${extra.length} Alternates geprueft, keine Fehler.`);
  process.exit(0);
}
console.log(`FEHLER: ${JSON.stringify(byKind)}`);
for (const e of errors.slice(0, 100)) console.log(`  [${e.kind}] ${e.url} ${e.detail}`);
if (errors.length > 100) console.log(`  ... und ${errors.length - 100} weitere`);
process.exit(1);
