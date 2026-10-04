import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ADS_OFFER_REDIRECT_SCRIPT,
  adsOfferBPath,
  adsOfferRegularCards,
  adsOfferRegularPriceLine,
  adsOfferRegularText,
  isAdsOfferBPath,
  stripAdsOfferB,
  wantsAdsOfferB,
} from "./adsOfferVariant.ts";
import { formatEuroCent } from "./newCustomerOffer.ts";
import { adsV2PriceCards } from "./adsTemplateV2.ts";

const P = "/standorte/koeln/koeln-arcaden/hyaluron/lippen-aufspritzen";

test("Angebots-Test: Pfade und Parameter", () => {
  assert.equal(adsOfferBPath(P), `/ab-beratung${P}`);
  assert.equal(adsOfferBPath(`/ab-beratung${P}`), `/ab-beratung${P}`);
  assert.equal(isAdsOfferBPath(`/ab-beratung${P}`), true);
  assert.equal(isAdsOfferBPath(P), false);
  assert.equal(stripAdsOfferB(`/ab-beratung${P}`), P);
  assert.equal(wantsAdsOfferB({ angebot: "beratung" }), true);
  assert.equal(wantsAdsOfferB(new URLSearchParams("gclid=x&angebot=beratung")), true);
  assert.equal(wantsAdsOfferB({ angebot: "rabatt" }), false);
  assert.equal(wantsAdsOfferB({}), false);
});

function runScript(pathname: string, search: string) {
  let target: string | null = null;
  const location = { pathname, search, hash: "", replace: (u: string) => { target = u; } };
  new Function("location", "URLSearchParams", ADS_OFFER_REDIRECT_SCRIPT)(location, URLSearchParams);
  return target;
}

test("Angebots-Test: Kopf-Skript leitet nur mit ?angebot=beratung um, Query bleibt", () => {
  assert.equal(runScript(P, "?angebot=beratung&gclid=abc"), `/ab-beratung${P}?angebot=beratung&gclid=abc`);
  assert.equal(runScript(P, "?gclid=abc"), null);
  assert.equal(runScript(P, ""), null);
  assert.equal(runScript(`/ab-beratung${P}`, "?angebot=beratung"), null);
});

test("Angebots-Test: regulaere Preise aus Strapi, kein Sternchen, keine Zonen-Rechnung", () => {
  assert.equal(adsOfferRegularPriceLine({ priceInEuroCent: 14999, isStartingPrice: true }, formatEuroCent), "ab 149,99 €");
  assert.equal(adsOfferRegularPriceLine({ cheapestPriceInEuroCent: 6999 }, formatEuroCent), "69,99 €");
  assert.equal(adsOfferRegularPriceLine({}, formatEuroCent), null);
  const cards = adsOfferRegularCards(
    adsV2PriceCards("muskelrelaxans/stirnfalte", {
      products: [{ variants: [
        { slug: "1-zone", name: "1 Zone", priceInEuroCent: 14999 },
        { slug: "2-zonen", name: "2 Zonen", priceInEuroCent: 19999 },
        { slug: "3-zonen", name: "3 Zonen", priceInEuroCent: 29999 },
      ] }],
    }),
  );
  assert.deepEqual(cards.map((c) => [c.label, c.offer, c.regular, c.note]), [
    ["1 Zone", "149,99 €", "", undefined],
    ["2 Zonen", "199,99 €", "", undefined],
    ["3 Zonen", "299,99 €", "", undefined],
  ]);
  assert.equal(
    adsOfferRegularText("Stirnfalte glätten in Köln ab 79,99 € pro Zone* ✓ MY", "ab 149,99 €"),
    "Stirnfalte glätten in Köln ab 149,99 € ✓ MY",
  );
  assert.equal(adsOfferRegularText("Lippen in Köln ab 119,99 €* ✓", "ab 149,99 €"), "Lippen in Köln ab 149,99 € ✓");
});
