import { test } from "node:test";
import assert from "node:assert/strict";

import {
  GUTSCHEIN_BETRAEGE,
  GUTSCHEIN_STANDARD_EURO,
  gutscheinCheckoutUrl,
  gutscheinLink,
} from "./geschenkgutschein.ts";

test("Checkout-Link fuehrt per Cart-Permalink in den Shopify-Checkout", () => {
  assert.equal(
    gutscheinCheckoutUrl(50),
    "https://shop.myhealthandbeauty.com/cart/44148335804696:1?attributes%5Bquelle%5D=website-gutschein",
  );
});

test("Menge wird auf 1 bis 10 begrenzt, unbekannter Betrag ergibt keinen Link", () => {
  assert.match(String(gutscheinCheckoutUrl(100, 3)), /\/cart\/44148335837464:3\?/);
  assert.match(String(gutscheinCheckoutUrl(100, 0)), /:1\?/);
  assert.match(String(gutscheinCheckoutUrl(100, 99)), /:10\?/);
  assert.equal(gutscheinCheckoutUrl(75), null);
});

test("Kampagnenwerte der Seite gehen mit, andere Query-Werte nicht", () => {
  const url = new URL(
    String(
      gutscheinCheckoutUrl(200, 1, {
        utm_source: "go",
        utm_campaign: ["gutschein_raten", "x"],
        gclid: "abc",
      }),
    ),
  );
  assert.equal(url.searchParams.get("utm_source"), "go");
  assert.equal(url.searchParams.get("utm_campaign"), "gutschein_raten");
  assert.equal(url.searchParams.get("gclid"), null);
  assert.equal(url.searchParams.get("attributes[quelle]"), "website-gutschein");
});

test("Standardbetrag ist kaufbar, Varianten sind eindeutig", () => {
  assert.ok(GUTSCHEIN_BETRAEGE.some((b) => b.euro === GUTSCHEIN_STANDARD_EURO));
  assert.equal(new Set(GUTSCHEIN_BETRAEGE.map((b) => b.variantId)).size, GUTSCHEIN_BETRAEGE.length);
  assert.equal(new Set(GUTSCHEIN_BETRAEGE.map((b) => b.euro)).size, GUTSCHEIN_BETRAEGE.length);
});

test("Altlinks auf den Gutschein im Shop zeigen auf die Website", () => {
  assert.equal(gutscheinLink("https://shop.myhealthandbeauty.com/products/myh-b-geschenkgutschein"), "/gutschein");
  assert.equal(gutscheinLink("https://shop.myhealthandbeauty.com/products/my-geschenkgutschein/"), "/gutschein");
  assert.equal(
    gutscheinLink("https://my-hb.myshopify.com/products/myh-b-geschenkgutschein?utm_source=club"),
    "/gutschein?utm_source=club",
  );
  assert.equal(gutscheinLink("https://app.myhealthandbeauty.com"), "https://app.myhealthandbeauty.com");
  assert.equal(gutscheinLink(null), null);
});
