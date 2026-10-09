#!/usr/bin/env node
/**
 * Preis-Pruefung (TSEO Preise, 09.10.2026).
 *
 * Liest alle nationalen Behandlungsseiten aus Strapi und vergleicht die
 * Preise in Freitexten (SEO-Titel/-Beschreibung, Hero-Suffix/-Subline,
 * Details-Preis) mit dem gueltigen Preis der verknuepften Behandlung
 * (shared/treatmentPrice.ts). Optional zusaetzlich Standortseiten.
 * Aendert nichts - nur Bericht fuer die Redaktion.
 *
 *   node --experimental-strip-types scripts/preise-pruefen.mjs \
 *     [--strapi https://striking-bear-e5a15ddc94.strapiapp.com] \
 *     [--standorte koeln/koeln-arcaden,duesseldorf/duesseldorf-arcaden] \
 *     [--csv preise.csv]
 *
 * Exit 1, wenn eine echte Abweichung ("abweichung") gefunden wurde;
 * Rundungen ("ab 299€" bei 299,99 €) und Preise aktiver Varianten derselben
 * Behandlung ("variante") machen den Lauf nicht rot.
 */
import { writeFileSync } from "node:fs";
import {
  findPriceConflicts,
  resolveTreatmentPrice,
  treatmentPriceText,
} from "../shared/treatmentPrice.ts";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const STRAPI = opt("strapi", process.env.NUXT_PUBLIC_STRAPI_URL || "https://striking-bear-e5a15ddc94.strapiapp.com").replace(/\/+$/, "");
const LOCATIONS = opt("standorte", "").split(",").map((s) => s.trim()).filter(Boolean);
const CSV = opt("csv", "");

const plain = (blocks) =>
  JSON.stringify(blocks ?? "")
    .match(/"text":"((?:[^"\\]|\\.)*)"/g)
    ?.map((m) => JSON.parse(m.slice(7)))
    .join(" ") ?? "";

function textsOf(page) {
  const faqs = [...(page.faq?.faqs ?? []), ...(page.faq?.faqSets ?? []).flatMap((s) => s.faqs ?? [])];
  return {
    "seo.metaTitle": page.seo?.metaTitle,
    "seo.metaDescription": page.seo?.metaDescription,
    "hero.headlineSuffix": page.hero?.headlineSuffix,
    "hero.subline": page.hero?.subline,
    "treatmentDetails.price": page.treatmentDetails?.price,
    ...Object.fromEntries(faqs.map((f, i) => [`faq[${i}] ${f.question ?? ""}`.trim(), plain(f.answer)])),
  };
}

async function get(path) {
  const res = await fetch(`${STRAPI}/api${path}`);
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}

const rows = [];
const list = await get(
  "/treatment-pages?locale=de&pagination[pageSize]=200&fields[0]=pathKey&fields[1]=name" +
    "&populate[seo][fields][0]=metaTitle&populate[seo][fields][1]=metaDescription" +
    "&populate[hero][fields][0]=headlineSuffix&populate[hero][fields][1]=subline&populate[hero][fields][2]=showPrice" +
    "&populate[treatmentDetails][fields][0]=price" +
    "&populate[treatment][fields][0]=priceInEuroCent&populate[treatment][fields][1]=isStartingPrice" +
    "&populate[treatment][populate][products][populate][variants][fields][0]=priceInEuroCent" +
    "&populate[treatment][populate][products][populate][variants][fields][1]=isActive",
);
const pages = list.data ?? [];

const variantCents = (treatment) =>
  (treatment?.products ?? [])
    .flatMap((p) => p.variants ?? [])
    .filter((v) => v.isActive !== false && v.priceInEuroCent)
    .map((v) => Math.round(Number(v.priceInEuroCent)));

async function check(url, page, variantsFrom = page) {
  const price = resolveTreatmentPrice(page.treatment);
  for (const c of findPriceConflicts(price, textsOf(page), variantCents(variantsFrom.treatment))) {
    rows.push({ url, expected: treatmentPriceText(price), ...c });
  }
}

for (const page of pages) await check(`/behandlungen/${page.pathKey}`, page);
for (const loc of LOCATIONS) {
  for (const page of pages) {
    try {
      const data = (await get(`/treatment-pages/${loc}/${page.pathKey}?locale=de`)).data;
      if (!data || data.redirect) continue;
      // Standort-SEO gewinnt, sonst generiert das Frontend den Titel.
      await check(`/standorte/${loc}/${page.pathKey}`, { ...data.treatmentPage, seo: data.seo ?? {} }, data.treatmentPage);
    } catch {
      // 404: Behandlung am Standort nicht angeboten
    }
  }
}

const real = rows.filter((r) => r.kind === "abweichung");
const count = (kind) => rows.filter((r) => r.kind === kind).length;
console.log(`Strapi: ${STRAPI}`);
console.log(`Seiten: ${pages.length}${LOCATIONS.length ? ` + ${LOCATIONS.length} Standorte` : ""}, Abweichungen: ${real.length}, Rundungen: ${count("rundung")}, Varianten-Hinweise: ${count("variante")}`);
for (const r of rows) {
  console.log(`  [${r.kind}] ${r.url}  ${r.field}: ${(r.mentionedCent / 100).toFixed(2)} statt ${r.expected}`);
}
if (CSV) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  writeFileSync(
    CSV,
    ["url;feld;art;genannt_cent;gueltig_cent;text", ...rows.map((r) => [r.url, r.field, r.kind, r.mentionedCent, r.expectedCent, r.text].map(esc).join(";"))].join("\n"),
  );
}
process.exit(real.length ? 1 : 0);
