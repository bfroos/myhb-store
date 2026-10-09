import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  extractPriceMentions,
  findPriceConflicts,
  formatEuroCent,
  resolveTreatmentPrice,
  schemaOfferPrice,
  treatmentPriceText,
  visibleTreatmentPrice,
} from "./treatmentPrice.ts";

const NBSP = " ";
const euro = (s: string) => s.replace(/ €/g, `${NBSP}€`);

// Strapi 09.10.2026 (Auszug): Behandlungen der drei Audit-Faelle.
const PROFHILO = { name: "PROFHILO®", priceInEuroCent: 29999, isStartingPrice: true, cheapestPriceInEuroCent: 29999 };
const BOTOX_3_ZONEN_SEITE = { name: "3-Zonen Botox", priceInEuroCent: 23999, isStartingPrice: true, cheapestPriceInEuroCent: 23999 };
const BOTOX_VARIANTEN = { "1-zone": 14999, "2-zonen": 19999, "3-zonen": 29999, "4-zonen": 39999 };

test("Preis aus Strapi: Festpreis vor guenstigster Variante", () => {
  assert.deepEqual(resolveTreatmentPrice(PROFHILO), { cent: 29999, isStartingPrice: true, source: "priceInEuroCent" });
  assert.deepEqual(
    resolveTreatmentPrice({ priceInEuroCent: null, cheapestPriceInEuroCent: 19999, isStartingPrice: true }),
    { cent: 19999, isStartingPrice: true, source: "cheapestPriceInEuroCent" },
  );
  assert.equal(resolveTreatmentPrice({ priceInEuroCent: "29999" })?.cent, 29999);
});

test("Fehlende oder ungueltige Preise ergeben keinen Standardwert", () => {
  for (const t of [null, undefined, {}, { priceInEuroCent: 0 }, { priceInEuroCent: -5 }, { priceInEuroCent: Number.NaN }, { priceInEuroCent: "" }]) {
    assert.equal(resolveTreatmentPrice(t as any), null);
  }
  assert.equal(treatmentPriceText(null), "");
  assert.equal(schemaOfferPrice(null), null);
  assert.equal(formatEuroCent(0), "");
});

test("Euro-Cent -> deutsches Format", () => {
  assert.equal(formatEuroCent(29999), euro("299,99 €"));
  assert.equal(formatEuroCent(14999), euro("149,99 €"));
  assert.equal(formatEuroCent(129900), euro("1.299,00 €"));
  assert.equal(formatEuroCent(6999), euro("69,99 €"));
});

test("Anzeigetext: 'ab' nur bei isStartingPrice", () => {
  assert.equal(treatmentPriceText(resolveTreatmentPrice(PROFHILO)), euro("ab 299,99 €"));
  assert.equal(treatmentPriceText(resolveTreatmentPrice({ priceInEuroCent: 29999, isStartingPrice: false })), euro("299,99 €"));
  assert.equal(treatmentPriceText(resolveTreatmentPrice(PROFHILO), "from"), euro("from 299,99 €"));
});

test("showPrice aus: weder Hero noch Titel noch Schema zeigen einen Preis", () => {
  const op = { priceInEuroCent: 129900, isStartingPrice: true };
  assert.equal(visibleTreatmentPrice(op, false), null);
  assert.equal(visibleTreatmentPrice(op, undefined), null);
  assert.equal(visibleTreatmentPrice(op, true)?.cent, 129900);
});

test("Meta Title, Hero und Schema Offer nennen denselben Preis", () => {
  for (const treatment of [PROFHILO, BOTOX_3_ZONEN_SEITE]) {
    const visible = visibleTreatmentPrice(treatment, true);
    const hero = treatmentPriceText(visible);
    // Titel-Vorlage aus i18n/locales/de.json (locationTreatment.seo.title)
    const title = `{treatmentName} {city} {priceTag} ✓ {brandName}`
      .replace("{treatmentName}", treatment.name)
      .replace("{city}", "Köln")
      .replace("{priceTag}", treatmentPriceText(visible))
      .replace("{brandName}", "MY HEALTH & BEAUTY");
    assert.ok(title.includes(hero), title);
    assert.equal(Number(schemaOfferPrice(visible)) * 100, visible!.cent);
  }
});

test("Varianten werden nicht verwechselt: 3-Zonen-Seite nutzt ihre eigene Behandlung", () => {
  // Die Seite botox/3-zonen-botox-preise ist mit der Behandlung "3-Zonen
  // Botox" (239,99 €) verknuepft, die Produkt-Variante "3-zonen" kostet
  // 299,99 €. Die Logik waehlt NICHT selbst einen der Werte, sie nimmt die
  // verknuepfte Behandlung - welcher Preis gilt, entscheidet die Fachseite.
  assert.equal(resolveTreatmentPrice(BOTOX_3_ZONEN_SEITE)?.cent, 23999);
  assert.notEqual(resolveTreatmentPrice(BOTOX_3_ZONEN_SEITE)?.cent, BOTOX_VARIANTEN["3-zonen"]);
  assert.equal(resolveTreatmentPrice({ priceInEuroCent: BOTOX_VARIANTEN["1-zone"], isStartingPrice: true })?.cent, 14999);
});

test("Preise in Freitexten erkennen", () => {
  assert.deepEqual(extractPriceMentions("ab 299,99€"), [29999]);
  assert.deepEqual(extractPriceMentions("Profhilo® ab 299,99 € – Effektive Hautverjüngung"), [29999]);
  assert.deepEqual(extractPriceMentions("Fettabsaugung ab 1.499€"), [149900]);
  assert.deepEqual(extractPriceMentions("Hyaluron ab 149€!"), [14900]);
  assert.deepEqual(extractPriceMentions("3 Zonen Botox® ab 299,99 mit 20% Rabatt"), [29999]);
  assert.deepEqual(extractPriceMentions("2 ml, 2026, 20 % Rabatt, 3 Zonen"), []);
  assert.deepEqual(
    extractPriceMentions("für Neukunden bei 239,99€ statt regulär 299,99€"),
    [23999, 29999],
  );
});

test("Audit-Fall Botox 3 Zonen: Freitexte widersprechen dem verknuepften Preis", () => {
  const conflicts = findPriceConflicts(resolveTreatmentPrice(BOTOX_3_ZONEN_SEITE), {
    "seo.metaTitle": "3 Zonen Botox® ab 299,99 mit 20% Rabatt für neue Kunden",
    "hero.subline": "ab 299,99€",
    "treatmentDetails.price": "ab 299,99€",
    "faq[0]": "Der 3 Zonen Botox Preis beginnt ab 299,99€.",
  });
  assert.equal(conflicts.length, 4);
  assert.ok(conflicts.every((c) => c.kind === "abweichung" && c.mentionedCent === 29999 && c.expectedCent === 23999));
});

test("Audit-Fall Profhilo: Titel-Rundung und Neukundenpreis im FAQ werden gemeldet", () => {
  const price = resolveTreatmentPrice(PROFHILO);
  const conflicts = findPriceConflicts(price, {
    "generierter Titel (alt)": "PROFHILO® Köln ab 299€ ✓ MY HEALTH & BEAUTY",
    "hero.headlineSuffix": "ab 299,99 €",
    "faq Düsseldorf": "startet die Profhilo-Behandlung für Neukunden bei 239,99€ statt regulär 299,99€",
  });
  assert.deepEqual(
    conflicts.map((c) => [c.field, c.mentionedCent, c.kind]),
    [
      ["generierter Titel (alt)", 29900, "rundung"],
      ["faq Düsseldorf", 23999, "abweichung"],
    ],
  );
  // Neuer generierter Titel enthaelt den exakten Preis
  assert.deepEqual(findPriceConflicts(price, { titel: `PROFHILO® Köln ${treatmentPriceText(price)} ✓ MY` }), []);
});

test("Variantenpreise im Freitext sind Hinweise, keine Abweichung", () => {
  const lippen = resolveTreatmentPrice({ priceInEuroCent: 14999, isStartingPrice: true });
  const conflicts = findPriceConflicts(
    lippen,
    { "faq Köln": "0,5 ml Hyaluron-Filler starten ab 149,99 €, 1 ml ab199,99 €." },
    [14999, 19999],
  );
  assert.deepEqual(conflicts.map((c) => [c.mentionedCent, c.kind]), [[19999, "variante"]]);
});

test("useLocationTreatmentPage: kein fester Ersatzpreis und kein Abrunden mehr", () => {
  const source = readFileSync(new URL("../app/composables/useLocationTreatmentPage.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /:\s*149;\s*\/\/ Ultimate fallback/);
  assert.doesNotMatch(source, /Math\.floor\(treatmentPrice/);
  assert.match(source, /treatmentPriceText\(/);
});
