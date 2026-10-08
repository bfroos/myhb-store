import { test } from "node:test";
import assert from "node:assert/strict";
import { isKontoLinkEnabled, kontoLinkUrl } from "./kontoLink.ts";

test("Ziel ist die App-Startseite mit UTM je Ort", () => {
  assert.equal(
    kontoLinkUrl("header"),
    "https://app.myhealthandbeauty.com/?utm_source=website&utm_medium=header&utm_campaign=konto-link",
  );
  assert.equal(
    kontoLinkUrl("footer"),
    "https://app.myhealthandbeauty.com/?utm_source=website&utm_medium=footer&utm_campaign=konto-link",
  );
});

test("Schalter: leer und unbekannt = aus", () => {
  assert.equal(isKontoLinkEnabled(undefined), false);
  assert.equal(isKontoLinkEnabled(""), false);
  assert.equal(isKontoLinkEnabled("off"), false);
  assert.equal(isKontoLinkEnabled("an"), false);
});

test("Schalter: nur ausdrueckliches Ja schaltet ein", () => {
  assert.equal(isKontoLinkEnabled("on"), true);
  assert.equal(isKontoLinkEnabled(" ON "), true);
  assert.equal(isKontoLinkEnabled("1"), true);
  assert.equal(isKontoLinkEnabled("true"), true);
  assert.equal(isKontoLinkEnabled(true), true);
});
