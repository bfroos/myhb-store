import { test } from "node:test";
import assert from "node:assert/strict";
import { SEO_CITY_LIPPEN, SEO_HUB_LIPPEN, SEO_PILOT_PATH_KEY } from "./seoPilotLippen.ts";
import { applyLocalFacts, mergeLocalFaqs, richTextParagraph } from "./localFacts.ts";
import { STRAPI_FACTS } from "./localFacts.test.ts";
import {
  LOCAL_GATE_PATH_KEYS,
  MAX_SIMILARITY_CITY,
  MAX_SIMILARITY_HUB,
  cityOwnText,
  hubPathFor,
  isLocalGateActive,
  localContentGate,
  localGateCanonical,
  localGateInSitemap,
  neutralizedWords,
  wordSequenceSimilarity,
} from "./localContentGate.ts";

const HUB = hubPathFor(SEO_PILOT_PATH_KEY);
const GATED = [SEO_PILOT_PATH_KEY];
const koeln = SEO_CITY_LIPPEN["koeln/koeln-arcaden"]!;

test("live aendert sich nichts: Gate fuer keine Behandlung an", () => {
  assert.deepEqual([...LOCAL_GATE_PATH_KEYS], []);
  assert.equal(localGateCanonical(SEO_PILOT_PATH_KEY, "berlin", "alexa", null), null);
  assert.equal(localGateInSitemap(SEO_PILOT_PATH_KEY, "berlin", "alexa"), true);
});

test("Pilotseiten bestehen das Mindestpaket (auch mit Strapi-Fakten)", () => {
  for (const [key, c] of Object.entries(SEO_CITY_LIPPEN)) {
    const withFacts = applyLocalFacts(c, STRAPI_FACTS[key]);
    const r = localContentGate(withFacts, HUB, { hasOpeningHours: true, doctors: 2, reviews: 4 });
    assert.deepEqual(r, { indexable: true, missing: [] }, key);
    assert.equal(localGateCanonical(SEO_PILOT_PATH_KEY, c.citySlug, c.locationSlug, withFacts, {}, GATED), null);
    assert.equal(localGateInSitemap(SEO_PILOT_PATH_KEY, c.citySlug, c.locationSlug, GATED), true);
  }
});

test("ohne eigenen Inhalt: Canonical auf den Hub und raus aus der Sitemap", () => {
  assert.deepEqual(localContentGate(null, HUB), { indexable: false, missing: ["content"] });
  assert.equal(localGateCanonical(SEO_PILOT_PATH_KEY, "berlin", "alexa", null, {}, GATED), HUB);
  assert.equal(localGateInSitemap(SEO_PILOT_PATH_KEY, "berlin", "alexa", GATED), false);
  // Trailing Slash im pathKey aendert nichts.
  assert.equal(localGateCanonical(`/${SEO_PILOT_PATH_KEY}/`, "berlin", "alexa", null, {}, GATED), HUB);
});

test("Kontrollgruppe Leipzig/Aachen bleibt unveraendert", () => {
  for (const [city, loc] of [["leipzig", "hoefe-am-bruehl"], ["aachen", "aquis-plaza"]]) {
    assert.equal(isLocalGateActive(SEO_PILOT_PATH_KEY, city, loc, GATED), false);
    assert.equal(localGateCanonical(SEO_PILOT_PATH_KEY, city, loc, null, {}, GATED), null);
    assert.equal(localGateInSitemap(SEO_PILOT_PATH_KEY, city, loc, GATED), true);
  }
});

test("andere Behandlungen bleiben unberuehrt", () => {
  assert.equal(localGateCanonical("botox/zornesfalte", "koeln", "koeln-arcaden", null, {}, GATED), null);
});

test("einzelne Luecken werden benannt", () => {
  const thin = {
    ...koeln,
    intro: [["Kurzer Text ohne Hub-Link."]],
    profile: [],
    parking: [],
    faqs: koeln.faqs.slice(0, 2),
  };
  const r = localContentGate(thin, HUB, { hasOpeningHours: false, doctors: 0, reviews: 2 });
  assert.equal(r.indexable, false);
  assert.deepEqual(r.missing, ["intro", "hubLink", "profile", "parking", "faqs", "openingHours", "doctors", "reviews"]);
  // Nicht uebergebene Seitendaten werden nicht geprueft.
  assert.deepEqual(localContentGate(koeln, HUB).missing, []);
  // Hub-Link mit Anker zaehlt.
  const plain = koeln.intro.map((p) => p.filter((x) => typeof x === "string"));
  assert.deepEqual(localContentGate({ ...koeln, intro: plain }, HUB).missing, ["hubLink"]);
  const anchored = [...plain, [{ text: "Kosten", href: `${HUB}#kosten` }]];
  assert.deepEqual(localContentGate({ ...koeln, intro: anchored }, HUB).missing, []);
});

test("Wortfolge-Aehnlichkeit: Stadtseiten weit genug vom Hub und voneinander", () => {
  const hubText = JSON.stringify(SEO_HUB_LIPPEN).replace(/"[a-zA-Z]+":|\/[\w/#-]+/g, " ");
  const cities = Object.values(SEO_CITY_LIPPEN);
  const names = cities.flatMap((c) => [c.city, c.district, c.center]);
  const hubWords = neutralizedWords(hubText, names);
  for (const c of cities) {
    const own = neutralizedWords(cityOwnText(c), names);
    const s = wordSequenceSimilarity(own, hubWords);
    assert.ok(s < MAX_SIMILARITY_HUB, `${c.key} ~ Hub ${s.toFixed(2)}`);
    for (const o of cities) {
      if (o === c) continue;
      const t = wordSequenceSimilarity(own, neutralizedWords(cityOwnText(o), names));
      assert.ok(t < MAX_SIMILARITY_CITY, `${c.key} ~ ${o.key} ${t.toFixed(2)}`);
    }
  }
});

test("Aehnlichkeit erkennt Klone mit getauschtem Ortsnamen", () => {
  const a = neutralizedWords("Lippen aufspritzen in Köln: ärztlich, ab 149,99 €, ohne Termin.", ["Köln", "Berlin"]);
  const b = neutralizedWords("Lippen aufspritzen in Berlin: ärztlich, ab 149,99 €, ohne Termin.", ["Köln", "Berlin"]);
  assert.equal(wordSequenceSimilarity(a, b), 1);
  assert.equal(wordSequenceSimilarity([], ["x"]), 0);
});

test("localFaqSet: Standortfragen aus Strapi werden angehaengt, ohne Dubletten", () => {
  const set = {
    faqs: [
      { question: "Gibt es Parkplätze?", answer: [{ type: "paragraph", children: [{ type: "text", text: "Ja, im Parkhaus. " }, { type: "link", url: "/standorte/koeln/koeln-arcaden", children: [{ type: "text", text: "Anfahrt" }] }] }] },
      { question: koeln.faqs[0]!.question.toUpperCase(), answer: "doppelt" },
      { question: "Inaktiv?", answer: "x", isActive: false },
      { question: "Leer?", answer: [] },
    ],
  };
  const merged = mergeLocalFaqs(koeln.faqs, set);
  assert.equal(merged.length, koeln.faqs.length + 1);
  assert.deepEqual(merged.at(-1), {
    question: "Gibt es Parkplätze?",
    answer: ["Ja, im Parkhaus. ", { text: "Anfahrt", href: "/standorte/koeln/koeln-arcaden" }],
  });
  assert.equal(mergeLocalFaqs(koeln.faqs, null), koeln.faqs);
  assert.equal(applyLocalFacts(koeln, { localFaqSet: set }).faqs.length, koeln.faqs.length + 1);
  assert.deepEqual(richTextParagraph([{ type: "paragraph", children: [{ type: "text", text: "A" }] }, { type: "paragraph", children: [{ type: "text", text: "B" }] }]), ["A", " ", "B"]);
});
