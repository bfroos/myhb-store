/**
 * Calendly-Vorbefuellung nach dem Rabatt-Dialog. Laeuft mit `npm run test:unit`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { calendlyPhone, withBookingPrefill } from "./bookingPrefill.ts";

test("Handynummer: deutsche Schreibweisen werden +49 <Rest>", () => {
  const cases: [string, string][] = [
    ["0171 1234567", "+49 1711234567"],
    ["0171/123 45-67", "+49 1711234567"],
    ["+49 171 1234567", "+49 1711234567"],
    ["+49 (0) 171 1234567", "+49 1711234567"],
    ["0049 171 1234567", "+49 1711234567"],
    ["491711234567", "+49 1711234567"],
    ["171 1234567", "+49 1711234567"],
  ];
  for (const [ein, aus] of cases) assert.equal(calendlyPhone(ein), aus, ein);
});

test("Handynummer: andere Laendervorwahl bleibt, leer bleibt leer", () => {
  assert.equal(calendlyPhone("+90 532 123 45 67"), "+905321234567");
  assert.equal(calendlyPhone("0031 6 12345678"), "+31612345678");
  assert.equal(calendlyPhone(""), undefined);
  assert.equal(calendlyPhone("  "), undefined);
  assert.equal(calendlyPhone(undefined), undefined);
});

test("Calendly-URL bekommt email und a1", () => {
  const url = withBookingPrefill(
    "https://calendly.com/koeln-arcaden/behandlungstermin?utm_source=google",
    { email: " anna+test@example.com ", phone: "0171 1234567" },
  );
  const u = new URL(url);
  assert.equal(u.searchParams.get("utm_source"), "google");
  assert.equal(u.searchParams.get("email"), "anna+test@example.com");
  assert.equal(u.searchParams.get("a1"), "+49 1711234567");
});

test("Nur Calendly; vorhandene Werte bleiben; ohne Daten unveraendert", () => {
  const app = "https://app.myhealthandbeauty.com/book-appointment?location=x";
  assert.equal(withBookingPrefill(app, { email: "a@b.de" }), app);
  const cal = "https://calendly.com/x?email=alt%40b.de";
  assert.equal(
    new URL(withBookingPrefill(cal, { email: "neu@b.de" })).searchParams.get(
      "email",
    ),
    "alt@b.de",
  );
  assert.equal(withBookingPrefill(cal, undefined), cal);
  assert.equal(withBookingPrefill("kaputt", { email: "a@b.de" }), "kaputt");
});
