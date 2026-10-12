/**
 * IndexNow: meldet neue Seiten der Website an Bing (und darüber an ChatGPT-Suche,
 * Copilot, Yandex, Seznam), statt Wochen auf den Crawler zu warten.
 *
 * Ablauf
 * - liest /sitemap.xml (Sitemap-Index) und alle Teil-Sitemaps unter /sitemaps/*.xml
 * - vergleicht die URLs mit data/indexnow-urls.txt (zuletzt gemeldeter Stand)
 * - meldet nur neue URLs; mit --all alle URLs (z. B. beim ersten Lauf)
 * - schreibt den neuen Stand zurück nach data/indexnow-urls.txt
 *
 * Der Schlüssel liegt öffentlich unter /<key>.txt (public/), so verlangt es IndexNow.
 * Die Teil-Sitemaps haben kein <lastmod>, deshalb erkennt das Skript nur neue Seiten,
 * keine geänderten. Geänderte Seiten bei Bedarf mit --all nachreichen.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";

const SITE = process.env.INDEXNOW_SITE || "https://www.myhealthandbeauty.com";
const KEY = "e8917cf2c75a83fbb9d7004f60488a46";
const STATE_FILE = new URL("../data/indexnow-urls.txt", import.meta.url);
const ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH = 10000;
const all = process.argv.includes("--all");
const dryRun = process.argv.includes("--dry-run");

const host = new URL(SITE).host;

async function fetchText(url) {
  const res = await fetch(url, { headers: { "user-agent": "myhb-indexnow/1.0" } });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.text();
}

function locs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].replace(/&amp;/g, "&"));
}

async function collectUrls() {
  const index = await fetchText(`${SITE}/sitemap.xml`);
  const isIndex = index.includes("<sitemapindex");
  const children = isIndex ? locs(index) : [];
  const urls = new Set(isIndex ? [] : locs(index));
  for (const child of children) {
    for (const u of locs(await fetchText(child))) urls.add(u);
  }
  return [...urls].filter((u) => new URL(u).host === host).sort();
}

async function readState() {
  try {
    return new Set((await readFile(STATE_FILE, "utf8")).split("\n").filter(Boolean));
  } catch {
    return new Set();
  }
}

async function submit(urlList) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
  });
  // 200 = angenommen, 202 = angenommen, Schlüsselprüfung läuft noch
  if (res.status !== 200 && res.status !== 202) {
    throw new Error(`IndexNow HTTP ${res.status}: ${await res.text()}`);
  }
  return res.status;
}

const current = await collectUrls();
if (current.length === 0) throw new Error("Sitemap lieferte keine URLs – Abbruch, Stand bleibt unverändert.");
const known = await readState();
const fresh = all ? current : current.filter((u) => !known.has(u));
console.log(`Sitemap: ${current.length} URLs, bekannt: ${known.size}, zu melden: ${fresh.length}${all ? " (--all)" : ""}`);

if (fresh.length > 0 && !dryRun) {
  for (let i = 0; i < fresh.length; i += BATCH) {
    const status = await submit(fresh.slice(i, i + BATCH));
    console.log(`Gemeldet: ${Math.min(i + BATCH, fresh.length)}/${fresh.length} (HTTP ${status})`);
  }
}
if (!dryRun) {
  await mkdir(new URL(".", STATE_FILE), { recursive: true });
  await writeFile(STATE_FILE, current.join("\n") + "\n");
}
