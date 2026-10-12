import { test } from "node:test";
import assert from "node:assert/strict";
import { COST_PAGES, costPagePrices, fillPrices } from "./costPages.ts";

const CATS = [
  {
    slug: "botox",
    treatments: [{ name: "Zornesfalte", priceInEuroCent: 14999, isStartingPrice: true, treatmentPage: { pathKey: "botox/zornesfalte" } }],
    products: [{ name: "Botox®", variants: [{ slug: "1-zone", priceInEuroCent: 14999 }, { slug: "2-zonen", priceInEuroCent: 19999 }, { slug: "3-zonen", priceInEuroCent: 29999 }] }],
  },
  {
    slug: "hyaluron-und-filler",
    treatments: [{ name: "Nasolabialfalte", priceInEuroCent: 19999, isStartingPrice: true, treatmentPage: { pathKey: "hyaluron/nasolabialfalte" } }],
    products: [{ name: "Aliaxin® SR", variants: [{ slug: "0-5-ml", priceInEuroCent: 14999 }, { slug: "1-0-ml", priceInEuroCent: 19999 }] }],
  },
];

test("Preise kommen aus Strapi", () => {
  const p = costPagePrices(CATS);
  assert.equal(p.z1, "149,99 €");
  assert.equal(p.z3, "299,99 €");
  assert.equal(p.zornes, "ab 149,99 €");
  assert.equal(p.lips05, "149,99 €");
  assert.equal(p.naso, "ab 199,99 €");
});

test("Fehlender Preis: ganzer Satz faellt weg, nie ein leerer Platzhalter", () => {
  const out = fillPrices("Eins kostet {z1}. Zwei kosten {fehlt}. Ende.", { z1: "149,99 €" });
  assert.equal(out, "Eins kostet 149,99 €. Ende.");
});

test("kein doppeltes ab", () => {
  assert.equal(fillPrices("die Nasolabialfalte ab {naso}.", { naso: "ab 199,99 €" }), "die Nasolabialfalte ab 199,99 €.");
});

test("Leitplanken in den Kostentexten", () => {
  for (const c of Object.values(COST_PAGES)) {
    const text = [c.subline, c.answer, ...c.inclusive, ...c.factors, ...c.faqs.flatMap((f) => [f.question, f.answer])].join(" ");
    assert.doesNotMatch(text, /vorher[- ]?nachher/i, c.slug);
    assert.doesNotMatch(text, /neukund|rabatt|\d+\s*%/i, c.slug);
    assert.doesNotMatch(text, /MYH&B/, c.slug);
    // "Botox" nur als Erklaerung des Wirkstoffs, nicht in Fragen und Faktoren
    assert.doesNotMatch([...c.faqs.map((f) => f.question), ...c.factors].join(" "), /botox/i, c.slug);
  }
});
