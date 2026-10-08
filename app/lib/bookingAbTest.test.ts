/**
 * Nur-App-Schalter (07.10.2026). Laeuft mit `npm run test:unit`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readAbBookingConfig, resolveBookingTarget } from "./bookingAbTest.ts";

test("Nur-App ist ohne Env an, nur ausdruecklich aus", () => {
  assert.equal(readAbBookingConfig({}).appOnly, true);
  assert.equal(readAbBookingConfig({ bookingAppOnly: "" }).appOnly, true);
  assert.equal(readAbBookingConfig({ bookingAppOnly: "on" }).appOnly, true);
  assert.equal(readAbBookingConfig({ bookingAppOnly: "o f f" }).appOnly, true);
  for (const aus of ["off", "OFF", "0", "false", "no", "aus", false, 0]) {
    assert.equal(readAbBookingConfig({ bookingAppOnly: aus }).appOnly, false, String(aus));
  }
});

test("App-Arm: App-URL, sonst sichtbar Calendly, sonst Standortsuche", () => {
  const app = "https://app.myhealthandbeauty.com/book-appointment?location=x";
  const cal = "https://calendly.com/x";
  assert.deepEqual(resolveBookingTarget({ calendlyUrl: cal, appBookingUrl: app }, "app"), {
    url: app,
    abVariant: "app",
  });
  assert.deepEqual(resolveBookingTarget({ calendlyUrl: cal }, "app"), {
    url: cal,
    abVariant: "app",
    abFallback: true,
  });
  assert.deepEqual(resolveBookingTarget({}, "app"), { abVariant: "app" });
});
