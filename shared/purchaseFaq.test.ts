import { test } from "node:test";
import assert from "node:assert/strict";
import { purchaseFaqs } from "./purchaseFaq.ts";

test("Kauf-Fragen mit Preis aus Strapi und Stadt", () => {
  const f = purchaseFaqs({ pathKey: "botox/stirnfalte", priceInEuroCent: 14999, isStartingPrice: true, city: "Köln" });
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

test("Platz-11-Suchbegriff steht woertlich als Frage, auch neben einer Strapi-Kostenfrage", () => {
  const f = purchaseFaqs({
    pathKey: "skinbooster/profhilo",
    priceInEuroCent: 29999,
    city: "Duisburg",
    existingQuestions: ["Was kostet Profhilo®?"],
  });
  const k = f.find((x) => x.topic === "keyword")!;
  assert.equal(k.question, "Was kostet eine Profhilo-Behandlung in Duisburg?");
  assert.match(k.answer, /ab 299,99\s€/);
  assert.ok(!f.some((x) => x.topic === "cost"), "keine zweite eigene Kostenfrage");
});

test("Suchbegriff-Frage auch fuer Seiten ohne go.-Text (Migraene), ohne Preis keine", () => {
  const f = purchaseFaqs({ pathKey: "botox/migraenebehandlung", priceInEuroCent: 34999 });
  assert.deepEqual(f.map((x) => x.topic), ["keyword"]);
  assert.match(f[0].question, /Migräne\?$/);
  assert.deepEqual(purchaseFaqs({ pathKey: "botox/migraenebehandlung" }), []);
});

test("Suchbegriff-Fragen halten die Leitplanken", () => {
  for (const k of ["skinbooster/profhilo", "skinbooster/mesotherapie-nctf-135-ha", "hyaluron/wangenaufbau", "hyaluron/kinnkorrektur", "botox/zornesfalte", "botox/migraenebehandlung"]) {
    const f = purchaseFaqs({ pathKey: k, priceInEuroCent: 14999, city: "Berlin" }).find((x) => x.topic === "keyword");
    assert.ok(f, k);
    assert.doesNotMatch(`${f.question} ${f.answer}`, /botox|vorher[- ]?nachher|rabatt|neukund|garantiert|heilt/i, k);
  }
});
