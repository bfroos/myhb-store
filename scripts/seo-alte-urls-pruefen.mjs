#!/usr/bin/env node
// Prueft die alten URLs von myhealthandbeauty.app (Rankings laut SISTRIX am
// 02.02.2026, vor dem Domainwechsel) gegen die neue Seite: folgt allen
// Weiterleitungen und meldet jede URL, die nicht auf einer Seite mit 200 endet.
// Gewicht = grob geschaetzte Klicks aus den Rankings (Position 1 = 0,3 ...).
//
//   node scripts/seo-alte-urls-pruefen.mjs [docs/seo/alte-urls-app-2026-02.tsv] [--basis https://preview...]
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const basisIdx = args.indexOf("--basis");
const basis = basisIdx >= 0 ? args.splice(basisIdx, 2)[1] : null;
const datei = args[0] ?? "docs/seo/alte-urls-app-2026-02.tsv";
const zeilen = readFileSync(datei, "utf8").trim().split("\n").slice(1).map((z) => z.split("\t"));

async function folge(url) {
  // Mit --basis wird der Pfad direkt gegen diese Seite geprueft (Preview),
  // sonst geht es ueber die alte Domain und deren Weiterleitung.
  let aktuell = basis ? new URL(new URL(url).pathname, basis).href : url;
  for (let i = 0; i < 8; i++) {
    let antwort;
    try {
      antwort = await fetch(aktuell, { redirect: "manual", headers: { "user-agent": "MYHB-SEO-Check" } });
    } catch (e) {
      return { status: "Fehler", ziel: aktuell };
    }
    const ort = antwort.headers.get("location");
    if (antwort.status >= 300 && antwort.status < 400 && ort) {
      aktuell = new URL(ort, aktuell).href;
      continue;
    }
    return { status: antwort.status, ziel: aktuell };
  }
  return { status: "Schleife", ziel: aktuell };
}

const ergebnisse = [];
for (let i = 0; i < zeilen.length; i += 12) {
  const teil = zeilen.slice(i, i + 12);
  ergebnisse.push(...(await Promise.all(teil.map(async ([url, gewicht]) => ({ url, gewicht: Number(gewicht), ...(await folge(url)) })))));
}

const kaputt = ergebnisse.filter((e) => e.status !== 200).sort((a, b) => b.gewicht - a.gewicht);
const summe = (liste) => liste.reduce((s, e) => s + e.gewicht, 0);
console.log(`${ergebnisse.length} alte URLs, ${kaputt.length} ohne Seite (Gewicht ${summe(kaputt).toFixed(1)} von ${summe(ergebnisse).toFixed(1)})`);
for (const e of kaputt) console.log(`${e.status}\t${e.gewicht.toFixed(2)}\t${e.url}\t-> ${e.ziel}`);
process.exit(kaputt.some((e) => e.status !== 410) ? 1 : 0);
