import { test } from "node:test";
import assert from "node:assert/strict";
import { SEO_CITY_LIPPEN, paragraphText } from "./seoPilotLippen.ts";
import {
  MAX_SIMILARITY_CITY,
  MIN_INTRO_WORDS,
  MIN_LOCAL_FAQS,
  cityOwnText,
  neutralizedWords,
  wordCount,
  wordSequenceSimilarity,
} from "./localContentGate.ts";
import { SEO_CITY_EXTRAS, cityFactsBase, extraFaqsForSchema, extraOwnText, seoCityExtra } from "./seoCityExtras.ts";

const extras = Object.values(SEO_CITY_EXTRAS);

test("Ergaenzung wird je Behandlung und Standort gefunden", () => {
  assert.equal(seoCityExtra("/botox/", "koeln", "koeln-arcaden")?.key, "botox@koeln/koeln-arcaden");
  assert.equal(seoCityExtra("botox", "duesseldorf", "duesseldorf-arcaden")?.key, "botox@duesseldorf/duesseldorf-arcaden");
  assert.equal(seoCityExtra("botox", "duisburg", "forum"), null);
  assert.equal(seoCityExtra("hyaluron", "koeln", "koeln-arcaden")?.key, "hyaluron@koeln/koeln-arcaden");
  assert.equal(seoCityExtra("botox/zornesfalte", "koeln", "koeln-arcaden"), null);
});

test("jede Ergaenzung hat das Mindestpaket: Text, Hub-Link, lokale Fragen, Fakten", () => {
  for (const e of extras) {
    assert.equal(e.key, `${e.pathKey}@${e.citySlug}/${e.locationSlug}`);
    assert.ok(wordCount(e.intro.map(paragraphText).join(" ")) >= MIN_INTRO_WORDS, `${e.key}: Einleitung zu kurz`);
    assert.ok(
      e.intro.some((p) => p.some((x) => typeof x !== "string" && x.href === e.hubPath)),
      `${e.key}: kein Link zum Hub`,
    );
    assert.ok(e.faqs.length >= MIN_LOCAL_FAQS, `${e.key}: zu wenige lokale Fragen`);
    assert.ok(cityFactsBase(e.citySlug, e.locationSlug), `${e.key}: keine Standortfakten`);
    assert.equal(extraFaqsForSchema(e).length, e.faqs.length);
  }
  assert.deepEqual(extraFaqsForSchema(null), []);
});

test("Ergaenzung ist kein Klon der Lippen-Stadtseite desselben Standorts", () => {
  for (const e of extras) {
    const city = SEO_CITY_LIPPEN[`${e.citySlug}/${e.locationSlug}`];
    if (!city) continue;
    const names = [city.city, city.center, city.district];
    const sim = wordSequenceSimilarity(neutralizedWords(extraOwnText(e), names), neutralizedWords(cityOwnText(city), names));
    assert.ok(sim < MAX_SIMILARITY_CITY, `${e.key}: Aehnlichkeit ${sim.toFixed(2)}`);
  }
});

test("Texte halten die Regeln ein (kein Rabatt, keine Heilversprechen, kein ®)", () => {
  for (const e of extras) {
    const t = extraOwnText(e);
    assert.doesNotMatch(t, /rabatt|neukund|garantiert|heilt|®|MYH&B/i, e.key);
  }
});

test("Ergaenzungen derselben Behandlung sind keine Klone voneinander", () => {
  for (const a of extras) {
    for (const b of extras) {
      if (a.key >= b.key || a.pathKey !== b.pathKey) continue;
      const ca = SEO_CITY_LIPPEN[`${a.citySlug}/${a.locationSlug}`];
      const cb = SEO_CITY_LIPPEN[`${b.citySlug}/${b.locationSlug}`];
      const names = [ca?.city, ca?.center, ca?.district, cb?.city, cb?.center, cb?.district].filter(Boolean) as string[];
      const sim = wordSequenceSimilarity(neutralizedWords(extraOwnText(a), names), neutralizedWords(extraOwnText(b), names));
      assert.ok(sim < MAX_SIMILARITY_CITY, `${a.key} vs ${b.key}: Aehnlichkeit ${sim.toFixed(2)}`);
    }
  }
});
