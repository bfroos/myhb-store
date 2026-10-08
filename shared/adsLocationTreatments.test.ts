import { test } from "node:test";
import assert from "node:assert/strict";
import {
  adsLocationPathKeys,
  adsPathKeyForSeo,
  buildAdsLocationTreatmentPages,
  reviewsWithoutRestrictedTerms,
} from "./adsLocationTreatments.ts";

const ads = [
  { pathKey: "muskelrelaxans", name: "Muskelrelaxans" },
  { pathKey: "muskelrelaxans/stirnfalte", name: "Stirnfalte", teaser: { image: { url: "https://m/a.webp", name: "a.webp" } } },
  { pathKey: "muskelrelaxans/baby-muskelrelaxans", name: "Baby Muskelrelaxans", teaser: { image: { url: "https://m/woman_botox_1.webp", name: "woman_botox_1.webp" } }, hero: { cover: { url: "https://m/c.webp", name: "c.webp" } } },
  { pathKey: "muskelrelaxans/lachfalten-rabatt", name: "Lachfalten" },
  { pathKey: "hyaluron", name: "Hyaluron" },
  { pathKey: "hyaluron/jawline", name: "Jawline", teaser: { image: { url: "https://m/btx.webp", name: "btx.webp" } } },
  { pathKey: "schoenheitsoperationen/facelift", name: "Facelift" },
];
const keys = new Set(ads.map((p) => p.pathKey));

test("SEO-pathKey -> Ads-pathKey", () => {
  assert.equal(adsPathKeyForSeo("botox/stirnfalte", keys), "muskelrelaxans/stirnfalte");
  assert.equal(adsPathKeyForSeo("botox/baby-botox", keys), "muskelrelaxans/baby-muskelrelaxans");
  assert.equal(adsPathKeyForSeo("botox/lachfalten", keys), "muskelrelaxans/lachfalten-rabatt");
  assert.equal(adsPathKeyForSeo("hyaluron/jawline", keys), "hyaluron/jawline");
  assert.equal(adsPathKeyForSeo("botox/3-zonen-botox-preise", keys), null);
  assert.equal(adsPathKeyForSeo("schoenheitsoperationen/facelift", keys), null);
  assert.equal(adsPathKeyForSeo(undefined, keys), null);
});

test("Kacheln: Reihenfolge, Dubletten, OPs, Bilder ohne Markennamen", () => {
  const pages = buildAdsLocationTreatmentPages(
    [
      { pathKey: "botox/stirnfalte" },
      { pathKey: "schoenheitsoperationen/facelift" },
      { pathKey: "botox/baby-botox" },
      { pathKey: "botox/stirnfalte" },
      { pathKey: "hyaluron/jawline" },
      { pathKey: "botox/lachfalten" },
    ],
    ads,
  );
  assert.deepEqual(
    pages.map((p) => p.pathKey),
    [
      "muskelrelaxans/stirnfalte",
      "muskelrelaxans/baby-muskelrelaxans",
      "hyaluron/jawline",
      "muskelrelaxans/lachfalten-rabatt",
    ],
  );
  assert.deepEqual(pages[0]!.topCategory, { slug: "muskelrelaxans", name: "Muskelrelaxans" });
  assert.equal(pages[0]!.teaser.image.url, "https://m/a.webp");
  // Teaserbild mit "botox" im Dateinamen -> Hero-Bild
  assert.equal(pages[1]!.teaser.image.url, "https://m/c.webp");
  // "btx" im Dateinamen, kein Ersatz -> kein Bild
  assert.equal(pages[2]!.teaser.image, null);
});

test("Standort-pathKeys fuers Menue", () => {
  const pages = buildAdsLocationTreatmentPages(
    [{ pathKey: "botox/lachfalten" }, { pathKey: "hyaluron/jawline" }],
    ads,
  );
  assert.deepEqual(adsLocationPathKeys(pages).sort(), [
    "hyaluron",
    "hyaluron/jawline",
    "muskelrelaxans",
    "muskelrelaxans/lachfalten",
    "muskelrelaxans/lachfalten-rabatt",
  ]);
});

test("Bewertungen mit Markennamen fallen weg, andere bleiben unveraendert", () => {
  const reviews = [
    { id: 1, text: "Botox an der Stirn, super", author: "A" },
    { id: 2, text: "Sehr nette Aerztin", author: "B" },
    { id: 3, text: "BTX war schnell gemacht", author: "C" },
    { id: 4, text: "Ergebnis natuerlich", author: "D" },
  ];
  assert.deepEqual(
    reviewsWithoutRestrictedTerms(reviews).map((r) => r.id),
    [2, 4],
  );
  assert.equal(reviewsWithoutRestrictedTerms(reviews)[0]!.text, "Sehr nette Aerztin");
  assert.deepEqual(reviewsWithoutRestrictedTerms(null), []);
});
