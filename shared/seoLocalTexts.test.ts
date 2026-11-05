import { test } from "node:test";
import assert from "node:assert/strict";
import texts from "../server/assets/seo-local-texts.json" with { type: "json" };
import {
  SEO_LOCAL_TEXT_FORBIDDEN,
  rich,
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
    faq: {
      headline: "Fragen",
      faqs: [{ question: "s1", answer: [] }, { question: "s2", answer: [] }],
      faqSets: [{ faqs: [{ question: "s3", answer: [] }, { question: "s4", answer: [] }] }],
    },
    treatmentPlan: { headline: "Plan" },
    tableOfContents: {
      intro: "allgemein",
      content: ["x"],
      index: [{ key: "how-it-works", value: "alt" }, { key: "treatment-plan", value: "Plan" }, { key: "faq", value: "Fragen" }],
    },
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
  assert.deepEqual(out.faq.faqs.map((f: any) => f.question), ["Q", "s1", "s2", "s3", "s4"]);
  assert.deepEqual(out.faq.faqSets, []);
  assert.equal(out.tableOfContents.index[0].value, "Neu");
  // ohne Neufassung bleibt der Strapi-Text stehen (nichts wird geloescht)
  assert.deepEqual(out.tableOfContents.content, ["x"]);
  assert.equal(out.treatmentPlan.headline, "Plan");
  assert.equal(applyLocalText(fixed, null), fixed);
  assert.equal(applyLocalText(null, t), null);
});

test("Neufassungen ersetzen Verzeichnis, Aerzteblock, Plan und Strapi-Fragen", () => {
  const fixed = {
    tableOfContents: { headline: "alt", intro: "alt", content: ["x"], index: [{ key: "employee", value: "alt" }] },
    medicalTeamHighlight: { headline: "alt", content: [], employee: { name: "A" } },
    treatmentPlan: { headline: "alt", content: [], steps: [{ description: "d", image: "i" }] },
    faq: { faqs: [{ question: "s1", answer: [] }], faqSets: [{ faqs: [{ question: "s2", answer: [] }] }] },
  };
  const t: SeoLocalText = {
    key: "x@y/z",
    faqs: [{ question: "lokal", answer: "a" }],
    toc: { headline: "Neu", intro: "I", paragraphs: ["Mehr bei [unseren Ärzten](/aerzte)."] },
    team: { headline: "Team neu", paragraphs: ["P"] },
    plan: { headline: "Plan neu", paragraphs: ["P"], steps: [{ description: "neu" }] },
    strapiFaqs: [{ question: "n1", answer: "A\n- eins\n- zwei" }, { question: "n2", answer: "B" }],
  };
  const out = applyLocalText(fixed, t) as any;
  assert.equal(out.tableOfContents.headline, "Neu");
  assert.deepEqual(out.tableOfContents.content[0].children[1], {
    type: "link",
    url: "https://www.myhealthandbeauty.com/aerzte",
    children: [{ type: "text", text: "unseren Ärzten" }],
  });
  assert.equal(out.tableOfContents.index[0].value, "Team neu");
  assert.equal(out.medicalTeamHighlight.employee.name, "A");
  assert.deepEqual(out.treatmentPlan.steps[0], { description: "neu", image: "i" });
  assert.deepEqual(out.faq.faqs.map((f: any) => f.question), ["lokal", "n1", "n2"]);
  assert.equal(out.faq.faqs[1].answer[1].type, "list");
  assert.equal(out.faq.faqs[1].answer[1].children.length, 2);
});

test("rich: Absaetze und Listen", () => {
  assert.deepEqual(rich(["a", "- b\n- c", "d"]).map((b: any) => b.type), ["paragraph", "list", "paragraph"]);
});
