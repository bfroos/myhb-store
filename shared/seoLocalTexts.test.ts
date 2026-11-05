import { test } from "node:test";
import assert from "node:assert/strict";
import texts from "../server/assets/seo-local-texts.json" with { type: "json" };
import {
  SEO_LOCAL_TEXT_FORBIDDEN,
  applyLocalText,
  localTextKey,
  localTextOwn,
  type SeoLocalText,
} from "./seoLocalTexts.ts";
import { neutralizedWords, wordCount } from "./localContentGate.ts";
import { SEO_CITY_EXTRAS } from "./seoCityExtras.ts";

const all = Object.entries(texts as Record<string, SeoLocalText>);

const CITY_WORDS = [
  "aachen", "aquis plaza", "berlin", "gesundbrunnencenter", "gesundbrunnen", "düsseldorf", "düsseldorf arcaden",
  "duisburg", "forum duisburg", "forum", "kaiserslautern", "k in lautern", "köln", "köln arcaden", "kalk",
  "leipzig", "höfe am brühl", "mönchengladbach", "minto", "recklinghausen", "palais vest",
];

/** Anteil der 6-Wort-Folgen von a, die auch in b vorkommen (Ortsnamen neutral). */
function shingles(text: string): Set<string> {
  const w = neutralizedWords(text, CITY_WORDS);
  const s = new Set<string>();
  for (let i = 0; i + 6 <= w.length; i++) s.add(w.slice(i, i + 6).join(" "));
  return s;
}

test("Schluessel passt zu Behandlung und Standort", () => {
  assert.equal(localTextKey("/botox/lipflip/", "kaiserslautern", "k-in-lautern"), "botox/lipflip@kaiserslautern/k-in-lautern");
  for (const [key, t] of all) assert.equal(t.key, key);
});

test("keine Seite mit Pilot- oder Ergaenzungstext doppelt belegt", () => {
  for (const [key] of all) assert.ok(!SEO_CITY_EXTRAS[key], `${key} hat schon eine Ergaenzung`);
});

test("jede Seite hat genug eigenen Text und drei Standortfragen", () => {
  for (const [key, t] of all) {
    assert.ok(wordCount(localTextOwn(t)) >= 350, `${key}: zu wenig Text`);
    assert.equal(t.faqs?.length, 3, `${key}: nicht genau drei Fragen`);
  }
});

test("Texte halten die Regeln ein", () => {
  for (const [key, t] of all) {
    const m = localTextOwn(t).match(SEO_LOCAL_TEXT_FORBIDDEN);
    assert.equal(m, null, `${key}: "${m?.[0]}"`);
  }
});

test("dieselbe Behandlung liest sich an jedem Standort anders", () => {
  const byPath = new Map<string, [string, Set<string>][]>();
  for (const [key, t] of all) {
    const p = key.split("@")[0]!;
    byPath.set(p, [...(byPath.get(p) ?? []), [key, shingles(localTextOwn(t))]]);
  }
  for (const list of byPath.values()) {
    for (const [ka, a] of list) {
      for (const [kb, b] of list) {
        if (ka >= kb) continue;
        let same = 0;
        for (const s of a) if (b.has(s)) same++;
        const share = same / Math.max(1, Math.min(a.size, b.size));
        assert.ok(share < 0.15, `${ka} ~ ${kb}: ${(share * 100).toFixed(0)} % gleiche Wortfolgen`);
      }
    }
  }
});

test("applyLocalText ersetzt Texte, behaelt Bilder und 'nicht geeignet'", () => {
  const fixed = {
    about: { headline: "alt", intro: "alt", content: [], mediaItems: ["video"] },
    benefits: { headline: "alt", items: [{ heading: "a", content: [], media: "bild" }] },
    suitability: { firstItem: { heading: "a", content: [] }, secondItem: { heading: "nicht", content: ["x"] } },
    treatmentProcess: { headline: "alt", content: [], steps: [{ heading: "a", text: "a", image: "i" }] },
    faq: { headline: "Fragen", faqs: [{ question: "strapi", answer: [] }] },
    tableOfContents: { index: [{ key: "how-it-works", value: "alt" }, { key: "faq", value: "Fragen" }] },
  };
  const t: SeoLocalText = {
    key: "x@y/z",
    about: { headline: "Neu", intro: "Satz", paragraphs: ["A", "B"] },
    benefits: { headline: "Vorteile", items: [{ heading: "H", text: "T" }, { heading: "H2", text: "T2" }] },
    suitableFor: { heading: "Für wen", paragraphs: ["P"] },
    process: { headline: "Ablauf", intro: "I", steps: [{ heading: "S", text: "T" }] },
    faqs: [{ question: "Q", answer: "A" }],
  };
  const out = applyLocalText(fixed, t) as any;
  assert.equal(out.about.headline, "Neu");
  assert.deepEqual(out.about.mediaItems, ["video"]);
  assert.equal(out.about.content.length, 2);
  assert.equal(out.benefits.items[0].media, "bild");
  assert.equal(out.benefits.items.length, 2);
  assert.equal(out.suitability.secondItem.heading, "nicht");
  assert.equal(out.treatmentProcess.steps[0].image, "i");
  assert.deepEqual(out.faq.faqs.map((f: any) => f.question), ["Q", "strapi"]);
  assert.equal(out.tableOfContents.index[0].value, "Neu");
  assert.equal(applyLocalText(fixed, null), fixed);
  assert.equal(applyLocalText(null, t), null);
});
