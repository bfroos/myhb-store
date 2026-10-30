#!/usr/bin/env node
/**
 * Holt die Seitenliste fuer den Hautanalyse-Block aus myhb-os (myhb-app/myhb-os#1445).
 * Quelle: src/lib/hautanalyse/ctaSeiten.json, abgeleitet aus den Empfehlungsregeln.
 * Aufruf: node scripts/sync-hautanalyse-cta-seiten.mjs [pfad-zu-myhb-os]
 * (Standard: ../myhb-os neben diesem Repo oder $MYHB_OS).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(fileURLToPath(new URL("..", import.meta.url)));
const os = resolve(process.argv[2] ?? process.env.MYHB_OS ?? resolve(repo, "../myhb-os"));
const quelle = resolve(os, "src/lib/hautanalyse/ctaSeiten.json");
const daten = JSON.parse(readFileSync(quelle, "utf8"));
if (!Array.isArray(daten) || !daten.every((s) => typeof s?.slug === "string")) {
  throw new Error(`Unerwartetes Format in ${quelle}`);
}
writeFileSync(resolve(repo, "shared/hautanalyseCtaSeiten.json"), `${JSON.stringify(daten, null, 2)}\n`);
console.log(`${daten.length} Seiten aus ${quelle}`);
