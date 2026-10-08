#!/usr/bin/env node
/**
 * ISR-Cache nach einem Produktions-Deploy aufwaermen (TSEO-03).
 *
 * Jeder Vercel-Deploy startet mit leerem ISR-Cache. Gemessen am 07.10.2026:
 * jede Seite war juenger als der letzte Deploy, auch /karriere mit 12 h
 * Laufzeit. Seiten mit wenig Besuch waren dadurch fast immer kalt, wenn
 * Googlebot kam (Audit 06.10.: 86 % MISS, TTFB-Median 2,2 s).
 *
 * Das Skript liest die Sitemap (Index -> Teil-Sitemaps) und ruft jede URL
 * einmal ab, mit wenigen parallelen Requests, damit Strapi nicht unter Last
 * geraet. Danach steht jede Seite im Cache.
 *
 *   node scripts/cache-aufwaermen.mjs                 # www, alle Sitemap-URLs
 *   node scripts/cache-aufwaermen.mjs --host https://go.myhealthandbeauty.com \
 *     --segments locations                            # go.: Standortseiten
 *
 * Optionen: --host, --sitemap-host (woher die URL-Liste kommt; Standard www),
 * --segments a,b (nur diese Teil-Sitemaps), --concurrency n (Standard 6).
 *
 * Exit-Code 1 nur, wenn die Sitemap selbst nicht lesbar ist. Einzelne
 * Fehlseiten stehen im Bericht, brechen den Lauf aber nicht ab: Aufwaermen
 * ist eine Beschleunigung, keine Pruefung.
 */

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const SITEMAP_HOST = opt("sitemap-host", "https://www.myhealthandbeauty.com");
const HOST = opt("host", SITEMAP_HOST).replace(/\/+$/, "");
const SEGMENTS = opt("segments", "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const CONCURRENCY = Number(opt("concurrency", "6")) || 6;

const locs = (xml) =>
  [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1].replace(/&amp;/g, "&"),
  );

async function getText(url) {
  const res = await fetch(url, { headers: { "user-agent": "myhb-cache-warmer" } });
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return res.text();
}

async function collectPaths() {
  const index = await getText(`${SITEMAP_HOST}/sitemap.xml`);
  let sitemaps = locs(index);
  if (SEGMENTS.length) {
    sitemaps = sitemaps.filter((u) =>
      SEGMENTS.some((s) => u.endsWith(`/sitemaps/${s}.xml`)),
    );
  }
  const paths = new Set();
  for (const sitemap of sitemaps) {
    try {
      for (const loc of locs(await getText(sitemap))) {
        paths.add(new URL(loc).pathname);
      }
    } catch (err) {
      // Eine fehlende Teil-Sitemap (503) soll die anderen nicht aufhalten.
      console.warn(`Teil-Sitemap uebersprungen: ${err.message}`);
    }
  }
  return [...paths];
}

async function warm(path) {
  const started = performance.now();
  try {
    const res = await fetch(`${HOST}${path}`, {
      redirect: "manual",
      headers: { "user-agent": "myhb-cache-warmer" },
    });
    await res.arrayBuffer();
    // Auf go. leiten viele Standortpfade um (z. B. botox -> muskelrelaxans).
    // Das Ziel ist die Seite, die Besucher wirklich sehen; sie mit aufwaermen.
    const location = res.headers.get("location");
    if (res.status >= 301 && res.status <= 308 && location) {
      const target = new URL(location, `${HOST}${path}`);
      if (target.origin === HOST) {
        await fetch(target, {
          redirect: "manual",
          headers: { "user-agent": "myhb-cache-warmer" },
        }).then((r) => r.arrayBuffer()).catch(() => {});
      }
    }
    return {
      path,
      status: res.status,
      cache: res.headers.get("x-vercel-cache") || "-",
      ms: Math.round(performance.now() - started),
    };
  } catch (err) {
    return { path, status: 0, cache: "ERROR", ms: 0, error: String(err) };
  }
}

const paths = await collectPaths().catch((err) => {
  console.error(`Sitemap nicht lesbar: ${err.message}`);
  process.exit(1);
});

console.log(`${paths.length} Pfade auf ${HOST}, ${CONCURRENCY} parallel`);
const results = [];
let next = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < paths.length) {
      results.push(await warm(paths[next++]));
    }
  }),
);

const count = (key) =>
  results.reduce((acc, r) => ((acc[r[key]] = (acc[r[key]] || 0) + 1), acc), {});
const times = results.map((r) => r.ms).sort((a, b) => a - b);
const pct = (p) => times[Math.min(times.length - 1, Math.floor(times.length * p))];

console.log("Status:", JSON.stringify(count("status")));
console.log("Cache vorher:", JSON.stringify(count("cache")));
console.log(`Antwortzeit Median ${pct(0.5)} ms, p90 ${pct(0.9)} ms`);
const bad = results.filter((r) => r.status !== 200);
if (bad.length) {
  console.log(`Nicht 200 (${bad.length}, erste 20):`);
  for (const r of bad.slice(0, 20)) console.log(`  ${r.status} ${r.path}`);
}
