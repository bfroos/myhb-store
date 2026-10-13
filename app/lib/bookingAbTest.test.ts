/**
 * Nur-App-Schalter (07.10.2026). Laeuft mit `npm run test:unit`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  istOnlineBuchbar,
  readAbBookingConfig,
  resolveAppOnlyTarget,
  resolveBookingTarget,
} from "./bookingAbTest.ts";

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

test("Nur-App: ohne App-URL Standortsuche statt Calendly (13.10.2026)", () => {
  const app = "https://app.myhealthandbeauty.com/book-appointment?location=x";
  const cal = "https://calendly.com/x";
  assert.deepEqual(resolveAppOnlyTarget({ calendlyUrl: cal, appBookingUrl: app }), {
    url: app,
    abVariant: "app",
  });
  // Leipzig 09.–12.10.: nur noch die Calendly-URL in Strapi.
  assert.deepEqual(resolveAppOnlyTarget({ calendlyUrl: cal }), {
    abVariant: "app",
    abFallback: true,
  });
  assert.deepEqual(resolveAppOnlyTarget({ calendlyUrl: cal, appBookingUrl: "  " }), {
    abVariant: "app",
    abFallback: true,
  });
  assert.deepEqual(resolveAppOnlyTarget({}), { abVariant: "app" });
});

test("Buchungsknopf: im Nur-App-Betrieb nur mit App-URL", () => {
  const app = "https://app.myhealthandbeauty.com/book-appointment?location=x";
  const cal = "https://calendly.com/x";
  assert.equal(istOnlineBuchbar({ calendlyUrl: cal }, true), false);
  assert.equal(istOnlineBuchbar({ appBookingUrl: app }, true), true);
  assert.equal(istOnlineBuchbar({ calendlyUrl: cal }, false), true);
  assert.equal(istOnlineBuchbar({}, false), false);
});
