import { test } from "node:test";
import assert from "node:assert/strict";
import { purchaseFaqs } from "./purchaseFaq.ts";

test("Kauf-Fragen mit Preis aus Strapi und Stadt", () => {
  const f = purchaseFaqs({ pathKey: "botox/zornesfalte", priceInEuroCent: 14999, isStartingPrice: true, city: "Köln" });
  const cost = f.find((x) => x.topic === "cost")!;
  assert.match(cost.question, /in Köln\?$/);
  assert.match(cost.answer, /ab 149,99 €/);
  assert.ok(f.some((x) => x.topic === "walkin"));
  assert.ok(f.some((x) => x.topic === "consult"));
});

test("Themen, die Strapi schon beantwortet, fallen weg", () => {
  const f = purchaseFaqs({
    pathKey: "skinbooster/profhilo",
    priceInEuroCent: 29999,
    existingQuestions: ["Was kostet Profhilo®?", "Tut Profhilo weh?", "Welche Nebenwirkungen gibt es?"],
  });
  assert.ok(!f.some((x) => ["cost", "pain", "side"].includes(x.topic)));
  assert.ok(f.some((x) => x.topic === "included"));
});

test("Lippen-Pilot, OPs und Seiten ohne geprueften Text: keine Fragen", () => {
  assert.deepEqual(purchaseFaqs({ pathKey: "hyaluron/lippen-aufspritzen", priceInEuroCent: 14999 }), []);
  assert.deepEqual(purchaseFaqs({ pathKey: "schoenheitsoperationen/facelift", priceInEuroCent: 399900 }), []);
  assert.deepEqual(purchaseFaqs({ pathKey: "fettwegspritze/lemon-bottle-bauch", priceInEuroCent: 29999 }), []);
});

test("Leitplanken in allen Antworten", () => {
  for (const k of ["botox/stirnfalte", "botox/masseter", "hyaluron/nasolabialfalte", "skinbooster/profhilo", "skinbooster/mesotherapie-nctf-135-ha", "skinbooster/polynukleotide-lachssperma", "infusionen/vitamin-c-infusion"]) {
    const text = purchaseFaqs({ pathKey: k, priceInEuroCent: 14999 }).map((f) => `${f.question} ${f.answer}`).join(" ");
    assert.doesNotMatch(text, /botox|vorher[- ]?nachher|rabatt|neukund|garantiert|heilt/i, k);
  }
});
