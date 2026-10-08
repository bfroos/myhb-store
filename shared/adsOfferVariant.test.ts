import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ADS_OFFER_REDIRECT_SCRIPT,
  ADS_OFFER_AUTO_SPLIT,
  buildAdsOfferScript,
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

function runScript(pathname: string, search: string, opts: { script?: string; cookie?: string; rnd?: number; ua?: string } = {}) {
  let target: string | null = null;
  const location = { pathname, search, hash: "", hostname: "go.myhealthandbeauty.com", replace: (u: string) => { target = u; } };
  const document = { cookie: opts.cookie ?? "" };
  const navigator = { userAgent: opts.ua ?? "Mozilla/5.0 (iPhone)" };
  const math = { random: () => opts.rnd ?? 0.9 };
  new Function("location", "URLSearchParams", "document", "navigator", "Math", opts.script ?? ADS_OFFER_REDIRECT_SCRIPT)(
    location, URLSearchParams, document, navigator, math,
  );
  return { target, cookie: document.cookie };
}

test("Angebots-Test: Kopf-Skript leitet nur mit ?angebot=beratung um, Query bleibt", () => {
  assert.equal(runScript(P, "?angebot=beratung&gclid=abc").target, `/ab-beratung${P}?angebot=beratung&gclid=abc`);
  assert.equal(runScript(`/ab-beratung${P}`, "?angebot=beratung").target, null);
  // ausgeschaltet (Stand bis zum Go): ohne Parameter keine Umleitung, kein Cookie
  assert.equal(ADS_OFFER_AUTO_SPLIT, false);
  assert.deepEqual(runScript(P, "?gclid=abc", { rnd: 0.1 }), { target: null, cookie: "" });
});

test("Angebots-Test: automatische Aufteilung (wenn eingeschaltet)", () => {
  const S = buildAdsOfferScript(true, 0.5);
  const b = runScript(P, "?gclid=abc", { script: S, rnd: 0.1 });
  assert.equal(b.target, `/ab-beratung${P}?gclid=abc`);
  assert.match(b.cookie, /^myhb_offer_ab=b;.*domain=\.myhealthandbeauty\.com/);
  const a = runScript(P, "?gclid=abc", { script: S, rnd: 0.9 });
  assert.equal(a.target, null);
  assert.match(a.cookie, /^myhb_offer_ab=a;/);
  // Wiederkehrer bleiben in ihrer Gruppe, Cookie wird nicht neu gesetzt
  assert.deepEqual(runScript(P, "", { script: S, rnd: 0.1, cookie: "x=1; myhb_offer_ab=a" }), { target: null, cookie: "x=1; myhb_offer_ab=a" });
  assert.equal(runScript(P, "", { script: S, rnd: 0.9, cookie: "myhb_offer_ab=b" }).target, `/ab-beratung${P}`);
  // erzwingen und Crawler
  assert.equal(runScript(P, "?angebot=rabatt", { script: S, rnd: 0.1 }).target, null);
  assert.equal(runScript(P, "", { script: S, rnd: 0.1, ua: "AdsBot-Google (+http://www.google.com/adsbot.html)" }).target, null);
  assert.equal(runScript(P, "", { script: S, rnd: 0.1, ua: "Mozilla/5.0 (compatible; Googlebot/2.1)" }).target, null);
  // B-Seiten und fremde Pfade nie umleiten
  assert.equal(runScript(`/ab-beratung${P}`, "", { script: S, rnd: 0.1 }).target, null);
  assert.equal(runScript("/p/agb", "", { script: S, rnd: 0.1 }).target, null);
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
