/**
 * Buchungsziel im Nur-App-Betrieb. Laeuft mit `npm run test:unit`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { istOnlineBuchbar, resolveAppOnlyTarget } from "./bookingAbTest.ts";

const app = "https://app.myhealthandbeauty.com/book-appointment?location=x";

test("Buchungsziel: App-URL, sonst Standortsuche", () => {
  assert.deepEqual(resolveAppOnlyTarget({ appBookingUrl: app }), {
    url: app,
    abVariant: "app",
  });
  assert.deepEqual(resolveAppOnlyTarget({ appBookingUrl: "  " }), { abVariant: "app" });
  assert.deepEqual(resolveAppOnlyTarget({ appBookingUrl: null }), { abVariant: "app" });
  assert.deepEqual(resolveAppOnlyTarget({}), { abVariant: "app" });
});

test("Buchungsknopf nur mit App-URL", () => {
  assert.equal(istOnlineBuchbar({ appBookingUrl: app }), true);
  assert.equal(istOnlineBuchbar({ appBookingUrl: " " }), false);
  assert.equal(istOnlineBuchbar({}), false);
});
