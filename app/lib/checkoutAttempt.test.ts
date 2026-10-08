/**
 * Buchungsversuch und Seitenpreis fuer Meta (elanagency/myhb-os#400).
 * Laeuft mit `npm run test:unit`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkoutEventId,
  currentCheckoutId,
  leadEventId,
  NEUKUNDEN_OFFER,
  offerValue,
  priceFromLabel,
  startCheckoutAttempt,
} from "./checkoutAttempt.ts";

test("jeder Klick ist ein neuer Versuch mit gueltiger Kennung", () => {
  const a = startCheckoutAttempt();
  assert.equal(currentCheckoutId(), a);
  const b = startCheckoutAttempt();
  assert.notEqual(a, b);
  assert.equal(currentCheckoutId(), b);
  // Dasselbe Muster prueft die App, bevor sie ?checkout_id= uebernimmt.
  assert.match(b, /^[A-Za-z0-9_-]{8,64}$/);
});

test("event_id fuer InitiateCheckout", () => {
  assert.equal(checkoutEventId("a1b2c3d4"), "checkout_a1b2c3d4");
});

test("Preis aus der Kontextzeile", () => {
  assert.equal(priceFromLabel("ab 149,99 €"), 149.99);
  assert.equal(priceFromLabel("ab 89 €"), 89);
  assert.equal(priceFromLabel("89€"), 89);
  assert.equal(priceFromLabel("1.299 €"), 1299);
  assert.equal(priceFromLabel("ab 1.299,50 €"), 1299.5);
  assert.equal(priceFromLabel("€ 149.99"), 149.99);
});

test("ohne Preis kein Wert, auch nicht 0", () => {
  assert.equal(priceFromLabel(undefined), undefined);
  assert.equal(priceFromLabel(""), undefined);
  assert.equal(priceFromLabel("auf Anfrage"), undefined);
  assert.equal(priceFromLabel("0 €"), undefined);
});

test("offerValue zieht im Rabattweg 20 % ab", () => {
  assert.equal(offerValue(149.99, NEUKUNDEN_OFFER), 119.99);
  assert.equal(offerValue(299, NEUKUNDEN_OFFER), 239.2);
});

test("offerValue laesst den Wert ohne Angebot stehen und erfindet keinen", () => {
  assert.equal(offerValue(149.99, undefined), 149.99);
  assert.equal(offerValue(149.99, "anderes"), 149.99);
  assert.equal(offerValue(undefined, NEUKUNDEN_OFFER), undefined);
});

test("leadEventId ist je Anmeldung neu", () => {
  const a = leadEventId();
  assert.match(a, /^lead_[a-z0-9]+$/);
  assert.notEqual(leadEventId(), a);
});
