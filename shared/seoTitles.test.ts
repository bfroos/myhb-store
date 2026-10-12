import { test } from "node:test";
import assert from "node:assert/strict";
import { SEO_TITLES, cleanSeoText, seoTitleFor } from "./seoTitles.ts";

test("Title mit Preis aus Strapi, ohne Preis ohne Anhang", () => {
  assert.deepEqual(seoTitleFor("hyaluron/lippenkorrektur", { priceInEuroCent: 34999 }), {
    title: "Lippenkorrektur mit Hyaluron: ab 349,99 €",
    h1: "Lippenkorrektur mit Hyaluron",
  });
  assert.equal(seoTitleFor("hyaluron/russian-lips", null)?.title, "Russian Lips: Lippen mit Russian-Lips-Technik");
  assert.equal(seoTitleFor("hyaluron/lippen-aufspritzen", { priceInEuroCent: 14999 }), null);
});

test("Titles kurz genug (mit Preis und Marke ca. 60 Zeichen)", () => {
  for (const [k, t] of Object.entries(SEO_TITLES)) {
    const len = t.title.length + (t.withPrice ? ": ab 999,99 €".length : 0);
    assert.ok(len <= 60, `${k}: ${len}`);
  }
});

test("Leitplanken in Titles und H1", () => {
  for (const [k, t] of Object.entries(SEO_TITLES)) {
    const text = `${t.title} ${t.h1 ?? ""}`;
    assert.doesNotMatch(text, /vorher|nachher|rabatt|neukund|MYH&B|entfernen|garantiert|dauerhaft/i, k);
    assert.doesNotMatch(text, /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u, k);
  }
});

test("Strapi-Titles aufraeumen", () => {
  assert.equal(cleanSeoText("✨ Zornesfalte mit Botox glätten ab 149,99€ 💉"), "Zornesfalte mit Botox glätten ab 149,99€");
  assert.equal(cleanSeoText("3 Zonen Botox® ab 299,99 mit 20% Rabatt für neue Kunden"), "3 Zonen Botox® ab 299,99");
  assert.equal(cleanSeoText("Lippen aufspritzen Düsseldorf ab 149€ ✓"), "Lippen aufspritzen Düsseldorf ab 149€");
  assert.equal(cleanSeoText("Russian Lips Filler ab 149,99€ 💉 - Erfahrene Ärtze"), "Russian Lips Filler ab 149,99€ - Erfahrene Ärzte");
  assert.equal(cleanSeoText("Termin in 24h ✓ Zertifizierte Ärzte ✓"), "Termin in 24h Zertifizierte Ärzte");
});
