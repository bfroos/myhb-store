#!/usr/bin/env node
/**
 * hreflang-Pruefung (TSEO-Regression 07.10.2026).
 *
 * Ruft eine Menge von Seiten ab, liest deren hreflang-Alternates und prueft
 * jedes Ziel. Fehler, die den Lauf rot machen:
 *
 * - Startseite einer Sprache (/, /en, /tr, ...) antwortet nicht mit 200
 * - hreflang-Ziel antwortet nicht mit 200 (404, 410, jede Weiterleitung)
 * - hreflang-Ziel ist noindex (Meta oder X-Robots-Tag)
 * - Canonical des Ziels zeigt nicht auf die hreflang-URL selbst
 * - Reciprocity: das Ziel verweist nicht mit derselben Sprache zurueck
 *
 * Seiten: Sprach-Startseiten, alle URLs der Sitemap (Stichprobe ueber
 * --limit) und alle Blog-Kategorieseiten, die auf den Blog-Uebersichten der
 * sechs Sprachen verlinkt sind (dort lagen die 77 Fehler des Audits).
 *
 *   node scripts/hreflang-pruefen.mjs [--host https://www.myhealthandbeauty.com]
 *     [--concurrency 6] [--limit 400] [--json bericht.json] [--ohne-sitemap]
 *
 * --ohne-sitemap: nur Startseiten und Blog (lokaler Build gegen Test-Strapi).
 */

import { writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const HOST = opt("host", "https://www.myhealthandbeauty.com").replace(/\/+$/, "");
const CONCURRENCY = Number(opt("concurrency", "6")) || 6;
const LIMIT = Number(opt("limit", "400")) || 0;
const JSON_OUT = opt("json", "");
const WITH_SITEMAP = !args.includes("--ohne-sitemap");
const UA = { "user-agent": "myhb-hreflang-pruefung" };
const LOCALE_ROOTS = ["/", "/en", "/tr", "/ar", "/fr", "/nl"];
const BLOG_ROOTS = ["/blog", "/en/blog", "/tr/blog", "/ar/mudawwana", "/fr/blog", "/nl/blog"];

const errors = [];
const fail = (kind, url, detail = "") => errors.push({ kind, url, detail });

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
const attr = (tag, name) => {
  const m = new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i").exec(tag);
  return m ? decode(m[1]) : null;
};
/** Absolute URL -> Pfad auf HOST (Produktions-URLs im HTML auf HOST abbilden). */
const toPath = (href) => {
  try {
    const u = new URL(href, HOST);
    return u.pathname.replace(/\/+$/, "") || "/";
  } catch {
    return href;
  }
};

const cache = new Map();
async function inspect(path) {
  if (cache.has(path)) return cache.get(path);
  const promise = (async () => {
    const res = await fetch(HOST + path, { headers: UA, redirect: "manual" });
    const info = {
      status: res.status,
      location: res.headers.get("location"),
      xRobots: res.headers.get("x-robots-tag") || "",
      canonical: null,
      robots: "",
      alternates: new Map(),
      links: [],
    };
    if (res.status !== 200) return info;
    const html = await res.text();
    for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
      const rel = (attr(tag, "rel") || "").toLowerCase();
      const href = attr(tag, "href");
      if (!href) continue;
      if (rel === "canonical") info.canonical = toPath(href);
      if (rel === "alternate" && attr(tag, "hreflang")) {
        info.alternates.set(attr(tag, "hreflang"), toPath(href));
      }
    }
    for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
      if ((attr(tag, "name") || "").toLowerCase() === "robots") info.robots = attr(tag, "content") || "";
    }
    for (const m of html.matchAll(/<a\b[^>]*href="([^"#]+)"/gi)) info.links.push(decode(m[1]));
    return info;
  })().catch((err) => ({ status: 0, error: String(err), alternates: new Map(), links: [] }));
  cache.set(path, promise);
  return promise;
}

async function pool(items, worker) {
  let next = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < items.length) await worker(items[next++]);
    }),
  );
}

// 1. Seiten sammeln
const pages = new Set(LOCALE_ROOTS);
if (WITH_SITEMAP) try {
  const index = await (await fetch(`${HOST}/sitemap.xml`, { headers: UA })).text();
  const subs = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => toPath(decode(m[1])));
  const urls = [];
  for (const sub of subs) {
    const xml = await (await fetch(HOST + sub, { headers: UA })).text();
    urls.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => toPath(decode(m[1]))));
  }
  const step = LIMIT && urls.length > LIMIT ? urls.length / LIMIT : 1;
  for (let i = 0; i < urls.length; i += step) pages.add(urls[Math.floor(i)]);
} catch (err) {
  fail("sitemap", "/sitemap.xml", String(err));
}
for (const root of BLOG_ROOTS) {
  const info = await inspect(root);
  pages.add(root);
  for (const href of info.links) {
    const path = toPath(href);
    if (/\/(blog|mudawwana)\/c\/[^/]+$/.test(path)) pages.add(path);
  }
}

// 2. Startseiten
for (const root of LOCALE_ROOTS) {
  const info = await inspect(root);
  if (info.status !== 200) fail("startseite", root, `HTTP ${info.status}`);
}

// 3. Alternates jeder Seite pruefen
let checkedAlternates = 0;
await pool([...pages], async (path) => {
  const page = await inspect(path);
  if (page.status !== 200) return; // Status der Seite selbst prueft sitemap-pruefen.mjs
  const ownLang = [...page.alternates].find(([lang, href]) => lang !== "x-default" && href === path)?.[0];
  for (const [lang, href] of page.alternates) {
    checkedAlternates += 1;
    const target = await inspect(href);
    if (target.status !== 200) {
      fail(`hreflang-${target.status || "fehler"}`, path, `${lang} -> ${href}${target.location ? ` (-> ${target.location})` : ""}`);
      continue;
    }
    if (/noindex/i.test(target.robots) || /noindex/i.test(target.xRobots)) {
      fail("hreflang-noindex", path, `${lang} -> ${href}`);
    }
    if (target.canonical && target.canonical !== href) {
      fail("hreflang-canonical", path, `${lang} -> ${href} (canonical ${target.canonical})`);
    }
    if (lang !== "x-default" && ownLang && href !== path) {
      const back = target.alternates.get(ownLang);
      if (back !== path) {
        fail("reciprocity", path, `${lang} -> ${href} verweist mit ${ownLang} auf ${back ?? "nichts"}`);
      }
    }
  }
});

// 4. Bericht
const byKind = errors.reduce((acc, e) => ((acc[e.kind] = (acc[e.kind] || 0) + 1), acc), {});
console.log(`Host: ${HOST}`);
console.log(`Seiten: ${pages.size}, hreflang-Alternates geprueft: ${checkedAlternates}`);
console.log(`Fehler: ${errors.length}`, JSON.stringify(byKind));
for (const e of errors.slice(0, 200)) console.log(`  [${e.kind}] ${e.url}  ${e.detail}`);
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify({ host: HOST, pages: pages.size, checkedAlternates, byKind, errors }, null, 2));
process.exit(errors.length ? 1 : 0);
