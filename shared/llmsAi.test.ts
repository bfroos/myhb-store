import { test } from "node:test";
import assert from "node:assert/strict";
import { aiSource } from "./aiReferrer.ts";
import { buildLlmsText, isOpenLocation } from "./llmsText.ts";

test("KI-Quellen aus Referrer und utm_source", () => {
  assert.equal(aiSource("chatgpt.com"), "chatgpt");
  assert.equal(aiSource("www.perplexity.ai"), "perplexity");
  assert.equal(aiSource("copilot.microsoft.com"), "copilot");
  assert.equal(aiSource("gemini.google.com"), "gemini");
  assert.equal(aiSource(null, "chatgpt.com"), "chatgpt");
  assert.equal(aiSource("google.com"), null);
  assert.equal(aiSource(null, "newsletter"), null);
});

test("llms.txt: nur eroeffnete Standorte, Preise aus Strapi, kein Markenname", () => {
  const now = new Date("2026-10-13T00:00:00Z");
  const locs = [
    { name: "Köln Arcaden", slug: "koeln-arcaden", type: "lounge", newOpeningDate: "2024-01-01", appBookingUrl: "https://app.x/book?location=koeln-arcaden", city: { name: "Köln", slug: "koeln" }, address: { street: "Kalker Hauptstraße", houseNumber: "55", postalCode: "51103", city: "Köln" }, contact: { phoneNumber: "0221 80142399" }, openingHours: { week: [{ day: "monday", intervals: [{ opens: "10:00", closes: "20:00" }] }] } },
    { name: "Loom", slug: "loom", type: "lounge", newOpeningDate: null, city: { name: "Bielefeld", slug: "bielefeld" } },
  ];
  const cats = [{ slug: "botox", treatments: [{ name: "Zornesfalte glätten", priceInEuroCent: 14999, isStartingPrice: true, treatmentPage: { pathKey: "botox/zornesfalte" } }, { name: "1-Zone Botox®", priceInEuroCent: 14999, treatmentPage: { pathKey: "botox" } }] }];
  const t = buildLlmsText("https://www.x.com", locs as any, cats as any, now);
  assert.match(t, /Köln – Köln Arcaden.*Kalker Hauptstraße 55, 51103 Köln · Tel\. \+49 221 80142399/);
  assert.match(t, /Online-Termin: https:\/\/app\.x/);
  assert.doesNotMatch(t, /Bielefeld|Essen/);
  assert.match(t, /\[Zornesfalte glätten\]\(https:\/\/www\.x\.com\/behandlungen\/botox\/zornesfalte\): ab 149,99 €/);
  assert.doesNotMatch(t, /Botox/);
  assert.equal(isOpenLocation({ newOpeningDate: "2027-01-01" } as any, now), false);
  const berlin = buildLlmsText("https://www.x.com", [{ name: "G", slug: "g", newOpeningDate: "2024-01-01", city: { name: "Berlin", slug: "berlin" }, contact: { phoneNumber: "030 / 98 60 73 80" } }] as any, [], now);
  assert.match(berlin, /Tel\. \+49 30 98607380/);
});
