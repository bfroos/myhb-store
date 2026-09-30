#!/usr/bin/env node
/**
 * Botox-Sonde fuer go.myhealthandbeauty.com (Ads-Modus).
 *
 * Google Ads lehnt Anzeigen mit RESTRICTED_DRUG_TERMS ab, sobald die Zielseite
 * sichtbar "Botox" zeigt. go. sagt deshalb "Muskelrelaxans" (shared/adsTerms.ts,
 * shared/adsMedia.ts). Die Inhalte kommen aber aus Strapi, und dort kann der
 * Begriff jederzeit wieder eingepflegt werden. Diese Sonde laedt alle go.-Seiten
 * und meldet jede Stelle, an der ein Mensch oder der Google-Crawler den Begriff
 * sieht.
 *
 * Geprueft wird die echte Zeichenkette im ausgelieferten HTML, und zwar nur, was
 * sichtbar ist oder als Adresse auf der Seite steht:
 *   - sichtbarer Text (HTML ohne <script>, <style>, Kommentare)
 *   - <title>, <meta content> (description, og:*, twitter:*)
 *   - alt / title / aria-label / placeholder
 *   - src / href / poster / srcset von Bildern, Videos, Links, iframes
 *   - die URL der Seite selbst
 * NICHT gewertet werden <script>-Inhalte (Nuxt-Payload, JSON-LD, JS-Bundles):
 * dort stehen pathKeys wie "muskelrelaxans/baby-botox" als Datenfeld, und
 * Fremdbibliotheken erzeugen Fehlalarme.
 *
 * Begriffe: "Botox" (auch in Komposita und Dateinamen), "Botulinum(toxin)",
 * "BTX" als eigenes Wort (Grenze = kein Buchstabe/Ziffer, "_BTX_" zaehlt).
 *
 * Seitenliste: /sitemap.xml von go., falls vorhanden (im Ads-Modus ist sie
 * abgeschaltet). Sonst aus Strapi: feste Routen, Staedte, Standorte,
 * Standort x Ads-Behandlung (treatment-ads-pages), /behandlungen/..., /p/...,
 * /produkte/...; dazu jeder interne Link, der auf einer geprueften Seite steht.
 *
 * Vor jedem Lauf prueft die Sonde eine Positivkontrolle (www-Seite, auf der
 * "Botox" steht). Findet sie dort nichts, ist die Sonde blind und bricht ab.
 *
 * Aufruf:
 *   node scripts/botox-sonde-go.mjs [--base URL] [--urls a,b] [--json out.json]
 *        [--summary out.md] [--issue] [--concurrency 4] [--no-crawl]
 *        [--control-url URL | --no-control] [--max-pages 3000]
 *
 * --issue legt mit GITHUB_TOKEN/GITHUB_REPOSITORY ein Issue mit Label
 * "botox-sonde" an bzw. kommentiert das offene; ohne Treffer wird es geschlossen.
 *
 * Exit-Code 1: Positivkontrolle ohne Treffer, zu wenige Seiten, mehr als 20 %
 * fehlgeschlagene Abrufe oder GitHub-API-Fehler. Treffer allein -> Exit 0
 * (gemeldet wird ueber das Issue).
 */

import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export const DEFAULT_BASE = "https://go.myhealthandbeauty.com";
export const DEFAULT_STRAPI = "https://striking-bear-e5a15ddc94.strapiapp.com";
export const DEFAULT_CONTROL_URL =
  "https://www.myhealthandbeauty.com/standorte/koeln/koeln-arcaden/botox/zornesfalte";
export const ISSUE_LABEL = "botox-sonde";

const USER_AGENT =
  "Mozilla/5.0 (compatible; myhb-botox-sonde/1.0; +https://github.com/bfroos/myhb-store)";
const LOCALE_PREFIX = /^\/(?:en|tr|ar|fr|nl)(?:\/|$)/;
const SKIP_PATH = /^\/(?:_nuxt|api|_ipx|favicon|__nuxt)(?:\/|$)|\.[a-z0-9]{2,5}$/i;

// ---------------------------------------------------------------------------
// Begriffe
// ---------------------------------------------------------------------------

export const TERM_RE =
  /botox|botulinum|(?<![A-Za-z0-9])btx(?![A-Za-z0-9])/gi;

function termLabel(match) {
  const m = match.toLowerCase();
  if (m.startsWith("botox")) return "Botox";
  if (m.startsWith("botulinum")) return "Botulinum";
  return "BTX";
}

// ---------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------

const NAMED_ENTITIES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", shy: "",
  reg: "®", copy: "©", trade: "™", euro: "€", ndash: "–", mdash: "—",
  hellip: "…", laquo: "«", raquo: "»", bdquo: "„", ldquo: "“", rdquo: "”",
  lsquo: "‘", rsquo: "’", sbquo: "‚", middot: "·", bull: "•", times: "×",
  auml: "ä", ouml: "ö", uuml: "ü", Auml: "Ä", Ouml: "Ö", Uuml: "Ü", szlig: "ß",
  eacute: "é", egrave: "è", agrave: "à", ccedil: "ç", check: "✓",
};

export function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") {
      const cp = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      try {
        return String.fromCodePoint(cp);
      } catch {
        return m;
      }
    }
    return NAMED_ENTITIES[e] ?? NAMED_ENTITIES[e.toLowerCase()] ?? m;
  });
}

function safeDecodeUri(s) {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

const ATTR_RE = /([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
const TAG_RE = /<([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*\/?>/g;

function parseAttrs(raw) {
  const attrs = {};
  if (!raw) return attrs;
  ATTR_RE.lastIndex = 0;
  let m;
  while ((m = ATTR_RE.exec(raw))) {
    const name = m[1].toLowerCase();
    const value = m[2] ?? m[3] ?? m[4] ?? "";
    if (!(name in attrs)) attrs[name] = decodeEntities(value);
  }
  return attrs;
}

/** Entfernt alles, was nicht gerendert wird: Skripte (inkl. Payload/JSON-LD), Styles, Kommentare. */
export function stripInvisible(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, " ")
    .replace(/<template\b[^>]*>[\s\S]*?<\/template\s*>/gi, " ");
}

const TEXT_ATTRS = ["alt", "title", "aria-label", "placeholder"];
const URL_ATTRS = ["src", "href", "poster", "data-src", "action"];
const SRCSET_ATTRS = ["srcset", "data-srcset", "imagesrcset"];
const LINK_REL_SKIP = /\b(?:stylesheet|modulepreload|prefetch|preconnect|dns-prefetch|icon|apple-touch-icon|manifest)\b/i;
const META_KEYS = /^(?:description|keywords|title|og:.*|twitter:.*|subject|abstract)$/i;

/**
 * Liefert alle Stellen einer Seite, die ein Mensch oder Crawler sieht, als
 * { source, value, kind: "text"|"url" }.
 */
export function extractVisible(html) {
  const cleaned = stripInvisible(html);
  const items = [];

  const title = /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(cleaned);
  if (title) items.push({ source: "<title>", value: collapse(decodeEntities(title[1])), kind: "text" });

  TAG_RE.lastIndex = 0;
  let m;
  while ((m = TAG_RE.exec(cleaned))) {
    const tag = m[1].toLowerCase();
    if (tag === "title") continue;
    const attrs = parseAttrs(m[2]);

    if (tag === "meta") {
      const key = attrs.name || attrs.property || attrs.itemprop;
      if (key && META_KEYS.test(key) && attrs.content) {
        const isUrl = /^(?:https?:)?\/\//i.test(attrs.content.trim());
        items.push({ source: `<meta ${key}>`, value: attrs.content, kind: isUrl ? "url" : "text" });
      }
      continue;
    }
    if (tag === "link" && (LINK_REL_SKIP.test(attrs.rel || "") || !attrs.href)) {
      if (!attrs.imagesrcset) continue;
    }
    // hreflang-Verweise auf andere Sprachen sind nicht die Zielseite der Anzeige.
    if (tag === "link" && attrs.hreflang && !/^(?:de|x-default)$/i.test(attrs.hreflang)) continue;

    for (const a of TEXT_ATTRS) {
      if (attrs[a]) items.push({ source: `<${tag} ${a}>`, value: attrs[a], kind: "text" });
    }
    for (const a of URL_ATTRS) {
      if (tag === "link" && a === "href" && LINK_REL_SKIP.test(attrs.rel || "")) continue;
      if (attrs[a]) {
        const rel = tag === "link" && attrs.rel ? ` rel=${attrs.rel}` : "";
        items.push({ source: `<${tag}${rel} ${a}>`, value: attrs[a], kind: "url" });
      }
    }
    for (const a of SRCSET_ATTRS) {
      if (!attrs[a]) continue;
      for (const part of attrs[a].split(/,\s+/)) {
        const u = part.trim().split(/\s+/)[0];
        if (u) items.push({ source: `<${tag} ${a}>`, value: u, kind: "url" });
      }
    }
  }

  // Sichtbarer Text: Tags raus, Entities aufloesen. Block-Elemente trennen
  // Woerter, Inline-Elemente nicht ("Bo<b>tox</b>" bleibt "Botox").
  const body = /<body\b[^>]*>([\s\S]*)<\/body\s*>/i.exec(cleaned)?.[1] ?? cleaned;
  const text = collapse(
    decodeEntities(
      body
        .replace(/<\/?(?:p|div|section|article|header|footer|nav|main|aside|li|ul|ol|h[1-6]|br|tr|td|th|table|button|a|span|label|figure|figcaption|summary|details|dt|dd|option)\b[^>]*>/gi, " ")
        .replace(/<[^>]+>/g, ""),
    ),
  );
  items.push({ source: "sichtbarer Text", value: text, kind: "text" });
  return items;
}

function collapse(s) {
  return s.replace(/\s+/g, " ").trim();
}

// Keine personenbezogenen Daten ins Issue: E-Mail-Adressen und Telefonnummern
// werden geschwaerzt; Mediendateinamen (tragen oft Vornamen, z. B.
// "DI_Christine_Botox_...") werden auf Begriff + Strapi-Hash reduziert.
export function redact(s) {
  return s
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[E-Mail]")
    .replace(/(?:\+|\b0)\d[\d\s/-]{6,}\d/g, "[Telefon]");
}

const MEDIA_FILE = /\/([^/?#]+)\.(mp4|webm|mov|m4v|jpe?g|png|webp|avif|gif|svg)(?:[?#].*)?$/i;

function describeUrl(value, term, pageUrl) {
  const decoded = safeDecodeUri(value);
  const media = MEDIA_FILE.exec(decoded);
  if (media) {
    const hash = /_([0-9a-f]{8,12})$/i.exec(media[1])?.[1];
    return `Mediendatei .${media[2].toLowerCase()} mit „${term}“ im Namen${hash ? ` (Strapi-Hash ${hash})` : ""}`;
  }
  // Adressen ohne Query/Hash und relativ zur Seite, damit "?v=1-zone" … und
  // canonical/og:url/hreflang derselben Adresse zu einer Fundstelle werden.
  let shown = decoded;
  try {
    const u = new URL(decoded, pageUrl || "https://x.invalid");
    const same = pageUrl && u.host === new URL(pageUrl).host;
    const path = u.pathname.replace(LOCALE_PREFIX, "/").replace(/\/+$/, "") || "/";
    shown = same ? path : `${u.host}${path}`;
  } catch {}
  return redact(shown.length > 160 ? shown.slice(0, 157) + "…" : shown);
}

function snippetAround(text, index, length) {
  const start = Math.max(0, index - 40);
  const end = Math.min(text.length, index + length + 40);
  return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
}

/**
 * Alle Fundstellen einer Seite. pageUrl wird mitgeprueft. Dieselbe Stelle aus
 * mehreren Quellen (og:image + img src, canonical + og:url) wird zu einem
 * Eintrag mit mehreren Quellen zusammengefasst.
 */
export function findTerms(html, pageUrl) {
  const byKey = new Map();
  const push = (source, term, snippet) => {
    const key = `${term}|${snippet}`;
    const f = byKey.get(key) || { term, snippet, sources: [] };
    if (!f.sources.includes(source)) f.sources.push(source);
    byKey.set(key, f);
  };

  if (pageUrl) {
    const decoded = safeDecodeUri(new URL(pageUrl).pathname);
    TERM_RE.lastIndex = 0;
    const m = TERM_RE.exec(decoded);
    if (m) push("Seiten-URL", termLabel(m[0]), decoded);
  }

  for (const item of extractVisible(html)) {
    // Text zuerst schwaerzen, dann ausschneiden - sonst bleibt eine
    // angeschnittene Adresse ("info@…") im Ausschnitt stehen.
    const hay = item.kind === "url" ? safeDecodeUri(item.value) : redact(item.value);
    TERM_RE.lastIndex = 0;
    let m;
    while ((m = TERM_RE.exec(hay))) {
      const term = termLabel(m[0]);
      const snippet =
        item.kind === "url" ? describeUrl(item.value, term, pageUrl) : snippetAround(hay, m.index, m[0].length);
      push(item.source, term, snippet);
      if (item.kind === "url") break;
    }
  }
  return [...byKey.values()].map((f) => ({ ...f, source: f.sources.join(", ") }));
}

/** Interne Links (gleicher Host, deutsche Seiten), ohne Query/Hash. */
export function internalLinks(html, pageUrl) {
  const base = new URL(pageUrl);
  const out = new Set();
  const cleaned = stripInvisible(html);
  const re = /<a\b[^>]*?\shref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  let m;
  while ((m = re.exec(cleaned))) {
    const raw = decodeEntities(m[1] ?? m[2] ?? "");
    if (!raw || raw.startsWith("#") || /^(?:mailto|tel|javascript|whatsapp):/i.test(raw)) continue;
    let u;
    try {
      u = new URL(raw, base);
    } catch {
      continue;
    }
    if (u.host !== base.host) continue;
    const path = u.pathname.replace(/\/+$/, "") || "/";
    if (LOCALE_PREFIX.test(path) || SKIP_PATH.test(path)) continue;
    out.add(`${base.origin}${path}`);
  }
  return [...out];
}

// ---------------------------------------------------------------------------
// Netz
// ---------------------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fetchWithRetry(url, { timeoutMs = 30_000, retries = 3, accept = "text/html" } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "user-agent": USER_AGENT, accept, "accept-language": "de-DE,de;q=0.9" },
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
      });
      if ((res.status >= 500 || res.status === 429) && attempt < retries) {
        const retryAfter = Number(res.headers.get("retry-after"));
        await res.body?.cancel();
        await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000 * 3 ** attempt);
        continue;
      }
      const body = await res.text();
      return { status: res.status, finalUrl: res.url || url, body };
    } catch (err) {
      lastError = err;
      if (attempt < retries) await sleep(1000 * 3 ** attempt);
    }
  }
  return {
    status: 0,
    finalUrl: url,
    body: "",
    error: lastError?.name === "TimeoutError" ? "Timeout" : String(lastError?.message || lastError),
  };
}

async function fetchJson(url) {
  const r = await fetchWithRetry(url, { accept: "application/json" });
  if (r.status !== 200) throw new Error(`${url} -> HTTP ${r.status || r.error}`);
  return JSON.parse(r.body);
}

async function strapiCollection(strapi, collection, query) {
  const out = [];
  for (let page = 1; page <= 50; page++) {
    const q = new URLSearchParams({ ...query, "pagination[page]": String(page), "pagination[pageSize]": "100" });
    const json = await fetchJson(`${strapi}/api/${collection}?${q}`);
    out.push(...(json.data || []));
    if (page >= (json.meta?.pagination?.pageCount || 1)) break;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Seitenliste
// ---------------------------------------------------------------------------

export async function discoverUrls(base, strapi, log = console.error) {
  const urls = new Set();
  const problems = [];
  const add = (path) => urls.add(`${base}${path === "/" ? "/" : path.replace(/\/+$/, "")}`);

  // 1) Sitemap von go. (im Ads-Modus derzeit abgeschaltet -> 404)
  const sm = await fetchWithRetry(`${base}/sitemap.xml`, { accept: "application/xml", retries: 1 });
  const locs = sm.status === 200 ? [...sm.body.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]) : [];
  if (locs.length) {
    log(`Seitenliste: ${locs.length} URLs aus ${base}/sitemap.xml`);
    for (const l of locs) {
      const u = new URL(l);
      if (!LOCALE_PREFIX.test(u.pathname)) add(u.pathname);
    }
  } else {
    log(`Seitenliste: ${base}/sitemap.xml -> HTTP ${sm.status || sm.error}, leite aus Strapi ab`);
  }

  // 2) Strapi (immer, damit auch Seiten ausserhalb der Sitemap drin sind)
  for (const p of ["/", "/standorte", "/behandlungen", "/preise", "/ueber-uns", "/aerzte", "/karriere"]) add(p);
  try {
    const [locations, adsPages, pages, products] = await Promise.all([
      strapiCollection(strapi, "locations", {
        locale: "de", "fields[0]": "slug", "fields[1]": "newOpeningDate", "populate[city][fields][0]": "slug",
      }),
      strapiCollection(strapi, "treatment-ads-pages", { locale: "de", "fields[0]": "pathKey" }),
      strapiCollection(strapi, "pages", { locale: "de", "fields[0]": "slug" }),
      strapiCollection(strapi, "products", { locale: "de", "fields[0]": "slug", "populate[category][fields][0]": "slug" }),
    ]);
    const pathKeys = new Set(adsPages.map((p) => p.pathKey).filter(Boolean));
    // Grundseite ohne "-rabatt" zeigt go. per Fallback (useLocationTreatmentPage);
    // Anzeigen zeigen auf beide Formen.
    for (const k of [...pathKeys]) if (k.endsWith("-rabatt")) pathKeys.add(k.slice(0, -"-rabatt".length));
    const open = locations.filter((l) => l.slug && l.city?.slug && l.newOpeningDate);
    const cities = new Set(open.map((l) => l.city.slug));
    for (const c of cities) add(`/standorte/${c}`);
    for (const l of open) {
      add(`/standorte/${l.city.slug}/${l.slug}`);
      for (const k of pathKeys) add(`/standorte/${l.city.slug}/${l.slug}/${k}`);
    }
    for (const k of pathKeys) add(`/behandlungen/${k}`);
    for (const p of pages) if (p.slug) add(`/p/${p.slug}`);
    for (const p of products) if (p.slug && p.category?.slug) add(`/produkte/${p.category.slug}/${p.slug}`);
    log(
      `Seitenliste: ${open.length} Standorte, ${pathKeys.size} Ads-pathKeys, ${pages.length} /p-Seiten, ${products.length} Produkte`,
    );
  } catch (err) {
    problems.push({ url: `${strapi}/api/…`, status: "Strapi", error: `Seitenliste unvollstaendig: ${err.message}` });
    log(`WARNUNG: Strapi nicht lesbar (${err.message}); weiter mit festen Routen + Link-Crawl`);
  }
  return { urls: [...urls], problems };
}

// ---------------------------------------------------------------------------
// Lauf
// ---------------------------------------------------------------------------

export async function scan(startUrls, { concurrency = 4, crawl = true, maxPages = 3000, log = console.error } = {}) {
  const baseHost = new URL(startUrls[0]).host;
  const queue = [...new Set(startUrls)];
  const queued = new Set(queue);
  const seeds = new Set(queue);
  const via = new Map(); // gecrawlte URL -> erste Seite, die darauf verlinkt
  const pages = [];
  let next = 0;
  let active = 0;

  const worker = async () => {
    while (true) {
      if (next >= queue.length) {
        if (active === 0) return;
        await sleep(50);
        continue;
      }
      const url = queue[next++];
      active++;
      try {
        const r = await fetchWithRetry(url);
        const page = { url, status: r.status, finalUrl: r.finalUrl, findings: [], fromList: seeds.has(url) };
        if (via.has(url)) page.via = via.get(url);
        const finalHost = (() => {
          try {
            return new URL(r.finalUrl).host;
          } catch {
            return baseHost;
          }
        })();
        if (r.status !== 200) {
          page.error = r.error || `HTTP ${r.status}`;
        } else if (finalHost !== baseHost) {
          page.error = `Weiterleitung auf ${finalHost}`;
        } else {
          page.findings = findTerms(r.body, r.finalUrl);
          if (crawl) {
            for (const link of internalLinks(r.body, r.finalUrl)) {
              if (!queued.has(link) && queued.size < maxPages) {
                queued.add(link);
                via.set(link, url);
                queue.push(link);
              }
            }
          }
        }
        pages.push(page);
        if (pages.length % 100 === 0) log(`  ${pages.length}/${queue.length} Seiten`);
      } finally {
        active--;
      }
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  return pages;
}

// ---------------------------------------------------------------------------
// Bericht
// ---------------------------------------------------------------------------

export function groupFindings(pages) {
  const groups = new Map();
  for (const p of pages) {
    for (const f of p.findings) {
      const key = `${f.term}|${f.source}|${f.snippet}`;
      const g = groups.get(key) || { ...f, urls: [] };
      g.urls.push(p.finalUrl || p.url);
      groups.set(key, g);
    }
  }
  return [...groups.values()].sort((a, b) => b.urls.length - a.urls.length);
}

function mdEscape(s) {
  return String(s).replace(/\|/g, "\\|").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, " ");
}

export function renderReport({ base, pages, control, problems = [], runUrl }, limit = 60_000) {
  const hitPages = pages.filter((p) => p.findings.length);
  const failed = pages.filter((p) => p.error);
  const groups = groupFindings(pages);
  const lines = [];
  lines.push(`**Botox-Sonde ${base}** – ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC`);
  lines.push("");
  lines.push(
    `Geprüft: ${pages.length} Seiten · mit Treffer: **${hitPages.length}** · Fundstellen: ${groups.length} · Abruf fehlgeschlagen: ${failed.length}`,
  );
  if (control) {
    lines.push(
      `Positivkontrolle ${control.url}: ${control.ok ? `✅ ${control.hits} Fundstellen` : `❌ ${control.error || "0 Fundstellen – Sonde blind"}`}`,
    );
  }
  if (runUrl) lines.push(`Lauf: ${runUrl}`);
  lines.push("");

  if (groups.length) {
    lines.push("Gewertet wird nur Sichtbares (Text, Title, Meta, alt/title, src/href/poster, Seiten-URL) – kein Payload/JS.");
    lines.push("");
    const table = (title, list) => {
      if (!list.length) return;
      lines.push(`### ${title}`);
      lines.push("");
      lines.push("| Begriff | Fundstelle (Quelle) | Ausschnitt | Seiten |");
      lines.push("|---|---|---|---|");
      for (const g of groupFindings(list)) {
        const shown = g.urls.slice(0, 5).map((u) => u.replace(base, "") || "/").join("<br>");
        const more = g.urls.length > 5 ? `<br>… und ${g.urls.length - 5} weitere` : "";
        lines.push(`| ${g.term} | ${mdEscape(g.source)} | ${mdEscape(g.snippet)} | **${g.urls.length}**<br>${shown}${more} |`);
      }
      lines.push("");
    };
    const listed = hitPages.filter((p) => p.fromList !== false);
    const crawled = hitPages.filter((p) => p.fromList === false);
    table(`Treffer auf Seiten der Zielliste (${listed.length})`, listed);
    table(`Treffer auf Seiten, die nur über Links erreichbar sind (${crawled.length})`, crawled);
    lines.push("<details><summary>Alle Seiten mit Treffer</summary>");
    lines.push("");
    for (const p of hitPages) {
      lines.push(`- ${p.finalUrl || p.url} – ${p.findings.map((f) => `${f.term} in ${mdEscape(f.source)}`).join(", ")}`);
    }
    lines.push("");
    lines.push("</details>");
    lines.push("");
  } else {
    lines.push("Keine sichtbaren Treffer für Botox / Botulinum / BTX.");
    lines.push("");
  }

  const allProblems = [
    ...problems,
    ...failed.map((p) => ({ url: p.url, error: p.via ? `${p.error}, verlinkt auf ${p.via.replace(base, "") || "/"}` : p.error })),
  ];
  if (allProblems.length) {
    lines.push(`### Abruf fehlgeschlagen (${allProblems.length}) – kein Botox-Treffer, aber prüfen`);
    lines.push("");
    for (const p of allProblems.slice(0, 200)) lines.push(`- ${p.url} – ${mdEscape(p.error)}`);
    if (allProblems.length > 200) lines.push(`- … und ${allProblems.length - 200} weitere`);
    lines.push("");
  }

  let out = lines.join("\n");
  if (out.length > limit) {
    out = out.slice(0, limit - 200) + "\n\n… gekürzt (vollständige Liste im Artefakt des Laufs).\n";
  }
  return out;
}

// ---------------------------------------------------------------------------
// GitHub-Issue
// ---------------------------------------------------------------------------

async function gh(method, path, body) {
  const token = process.env.GITHUB_TOKEN;
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "user-agent": USER_AGENT,
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok && !(method === "POST" && path.endsWith("/labels") && res.status === 422)) {
    throw new Error(`GitHub ${method} ${path} -> ${res.status}: ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : null;
}

export async function syncIssue({ report, hitCount, pageCount, log = console.error }) {
  const repo = process.env.GITHUB_REPOSITORY;
  if (!repo || !process.env.GITHUB_TOKEN) throw new Error("--issue braucht GITHUB_TOKEN und GITHUB_REPOSITORY");
  const open = await gh("GET", `/repos/${repo}/issues?state=open&labels=${ISSUE_LABEL}&per_page=10`);
  const issue = (open || []).find((i) => !i.pull_request);
  const title = `Botox-Sonde: „Botox“ sichtbar auf go. (${hitCount} von ${pageCount} Seiten)`;

  if (hitCount > 0) {
    if (issue) {
      await gh("POST", `/repos/${repo}/issues/${issue.number}/comments`, { body: report });
      if (issue.title !== title) await gh("PATCH", `/repos/${repo}/issues/${issue.number}`, { title });
      log(`Issue #${issue.number} kommentiert`);
      return { action: "commented", number: issue.number };
    }
    await gh("POST", `/repos/${repo}/labels`, {
      name: ISSUE_LABEL,
      color: "d93f0b",
      description: "Automatische Prüfung: Botox/BTX sichtbar auf go.myhealthandbeauty.com",
    });
    const intro =
      "Google Ads lehnt Anzeigen mit RESTRICTED_DRUG_TERMS ab, wenn die Zielseite sichtbar „Botox“ zeigt. " +
      "Die tägliche Sonde (`.github/workflows/botox-sonde-go.yml`) hat den Begriff wieder auf go. gefunden. " +
      "Meist kommt er aus Strapi – Inhalte dort nur mit Freigabe ändern. " +
      "Dieses Issue wird bei weiteren Treffern kommentiert und schließt sich, sobald ein Lauf sauber ist.\n\n";
    const created = await gh("POST", `/repos/${repo}/issues`, { title, body: intro + report, labels: [ISSUE_LABEL] });
    log(`Issue #${created.number} angelegt`);
    return { action: "created", number: created.number };
  }

  if (issue) {
    await gh("POST", `/repos/${repo}/issues/${issue.number}/comments`, {
      body: `Keine Treffer mehr – Issue wird geschlossen.\n\n${report}`,
    });
    await gh("PATCH", `/repos/${repo}/issues/${issue.number}`, { state: "closed", state_reason: "completed" });
    log(`Issue #${issue.number} geschlossen`);
    return { action: "closed", number: issue.number };
  }
  log("Keine Treffer, kein offenes Issue");
  return { action: "none" };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = {
    base: DEFAULT_BASE,
    strapi: process.env.STRAPI_URL || DEFAULT_STRAPI,
    concurrency: 4,
    crawl: true,
    maxPages: 3000,
    minPages: 100,
    controlUrl: DEFAULT_CONTROL_URL,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const val = () => argv[++i];
    if (a === "--base") args.base = val().replace(/\/+$/, "");
    else if (a === "--strapi") args.strapi = val().replace(/\/+$/, "");
    else if (a === "--urls") args.urls = val().split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--json") args.json = val();
    else if (a === "--summary") args.summary = val();
    else if (a === "--issue") args.issue = true;
    else if (a === "--concurrency") args.concurrency = Math.max(1, Number(val()));
    else if (a === "--no-crawl") args.crawl = false;
    else if (a === "--max-pages") args.maxPages = Number(val());
    else if (a === "--min-pages") args.minPages = Number(val());
    else if (a === "--control-url") args.controlUrl = val();
    else if (a === "--no-control") args.controlUrl = null;
    else throw new Error(`Unbekanntes Argument: ${a}`);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const log = (...m) => console.error(...m);
  let exitCode = 0;

  // Positivkontrolle: Auf dieser www-Seite steht "Botox" sichtbar. Findet die
  // Sonde dort nichts, ist sie blind, und ein "0 Treffer" auf go. waere wertlos.
  let control = null;
  if (args.controlUrl) {
    const r = await fetchWithRetry(args.controlUrl);
    const findings = r.status === 200 ? findTerms(r.body, null).filter((f) => f.source === "sichtbarer Text") : [];
    control = {
      url: args.controlUrl,
      hits: findings.length,
      ok: findings.length > 0,
      error: r.status !== 200 ? r.error || `HTTP ${r.status}` : undefined,
      sample: findings[0]?.snippet,
    };
    log(`Positivkontrolle ${args.controlUrl}: ${control.ok ? `${control.hits} Fundstellen im sichtbaren Text, z. B. "${control.sample}"` : `FEHLGESCHLAGEN (${control.error || "0 Treffer"})`}`);
    if (!control.ok) {
      console.log(`::error::Positivkontrolle ohne Treffer (${args.controlUrl}) – Sonde blind, Lauf abgebrochen`);
      process.exit(1);
    }
  }

  let urls = args.urls;
  let problems = [];
  if (!urls) {
    ({ urls, problems } = await discoverUrls(args.base, args.strapi, log));
  }
  log(`Pruefe ${urls.length} Start-URLs (parallel ${args.concurrency}${args.crawl ? ", plus interne Links" : ""}) …`);
  const t0 = Date.now();
  const pages = await scan(urls, { concurrency: args.concurrency, crawl: args.crawl && !args.urls, maxPages: args.maxPages, log });
  const hitPages = pages.filter((p) => p.findings.length);
  const failed = pages.filter((p) => p.error);
  log(`Fertig in ${Math.round((Date.now() - t0) / 1000)} s: ${pages.length} Seiten, ${hitPages.length} mit Treffer, ${failed.length} fehlgeschlagen`);

  const runUrl = process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : undefined;
  const report = renderReport({ base: args.base, pages, control, problems, runUrl });
  console.log(report);

  if (args.json) {
    await writeFile(args.json, JSON.stringify({ base: args.base, at: new Date().toISOString(), control, problems, pages }, null, 2));
  }
  if (args.summary) await writeFile(args.summary, renderReport({ base: args.base, pages, control, problems, runUrl }, 900_000));

  for (const g of groupFindings(pages).slice(0, 10)) {
    console.log(`::warning::${g.term} in ${g.source} auf ${g.urls.length} Seite(n), z. B. ${g.urls[0]}`);
  }
  for (const p of failed.slice(0, 10)) console.log(`::warning::Abruf fehlgeschlagen: ${p.url} (${p.error})`);

  if (!args.urls && pages.length < args.minPages) {
    console.log(`::error::Nur ${pages.length} Seiten geprueft (< ${args.minPages}) – Seitenliste kaputt?`);
    exitCode = 1;
  }
  const failRate = pages.length ? failed.length / pages.length : 1;
  const unreliable = failRate > 0.2;
  if (unreliable) {
    console.log(`::error::${failed.length} von ${pages.length} Abrufen fehlgeschlagen – Ergebnis nicht belastbar`);
    exitCode = 1;
  }

  if (args.issue) {
    // Ein unvollstaendiger Lauf darf ein offenes Issue nicht schliessen.
    if (unreliable && hitPages.length === 0) {
      log("Issue unveraendert: Lauf nicht belastbar");
    } else {
      try {
        await syncIssue({ report, hitCount: hitPages.length, pageCount: pages.length, log });
      } catch (err) {
        console.log(`::error::${err.message}`);
        exitCode = 1;
      }
    }
  }
  process.exit(exitCode);
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
