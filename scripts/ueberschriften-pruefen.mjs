#!/usr/bin/env node
/**
 * Ueberschriften-Pruefung (D-01, 08.10.2026).
 *
 * Liest H1-H6 aus dem gerenderten HTML (ohne <script>) und meldet:
 * - nicht genau eine H1
 * - doppelte H1/H2 mit identischem Text
 *
 *   node scripts/ueberschriften-pruefen.mjs [--host https://www.myhealthandbeauty.com]
 *     [--alle] /behandlungen/hyaluron/lippen-aufspritzen /behandlungen/botox ...
 *
 * --alle: zusaetzlich die vollstaendige Gliederung je Seite ausgeben.
 * Exit 1, wenn eine Seite einen Fehler hat.
 */

import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const hostIndex = args.indexOf("--host");
const HOST = (hostIndex >= 0 ? args[hostIndex + 1] : "https://www.myhealthandbeauty.com").replace(/\/+$/, "");
const SHOW_ALL = args.includes("--alle");
const paths = args.filter((arg, i) => !arg.startsWith("--") && !(hostIndex >= 0 && i === hostIndex + 1));

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");

export function extractHeadings(html) {
  const body = html.slice(Math.max(0, html.indexOf("<body"))).replace(/<script\b[\s\S]*?<\/script>/gi, "");
  return [...body.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => ({
    level: Number(m[1][1]),
    text: decode(m[2].replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim(),
  }));
}

export function findProblems(headings) {
  const problems = [];
  const h1 = headings.filter((h) => h.level === 1).length;
  if (h1 !== 1) problems.push(`${h1} H1`);
  const seen = new Map();
  for (const h of headings.filter((h) => h.level <= 2)) {
    const key = `H${h.level} ${h.text.toLowerCase()}`;
    seen.set(key, (seen.get(key) || 0) + 1);
  }
  for (const [key, count] of seen) if (count > 1) problems.push(`${count}x ${key}`);
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let failed = 0;
  for (const path of paths) {
    const res = await fetch(HOST + path, { headers: { "user-agent": "myhb-ueberschriften-pruefung" } });
    const headings = extractHeadings(await res.text());
    const problems = findProblems(headings);
    if (problems.length) failed += 1;
    console.log(`${problems.length ? "FEHLER" : "ok    "} ${res.status} ${path}  H2: ${headings.filter((h) => h.level === 2).length}${problems.length ? `  -> ${problems.join("; ")}` : ""}`);
    if (SHOW_ALL) for (const h of headings) console.log(`        ${"  ".repeat(h.level - 1)}H${h.level} ${h.text}`);
  }
  process.exit(failed ? 1 : 0);
}
