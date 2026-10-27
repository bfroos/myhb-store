/**
 * Newsletter-Anmeldung bekannter Adressen. Laeuft mit `npm run test:unit`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { anmeldungNachholen, subscriberHash } from "./newsletterBestand.ts";

// Fall vom 26.10.2026: um 15:42 Uhr von Shopify angelegt, kurz danach angemeldet.
const jetzt = new Date("2026-10-26T15:50:00Z");
const heute = "2026-10-26T14:42:29+00:00";

test("heute im Laden angelegt: Anmeldung wird nachgeholt", () => {
  assert.equal(anmeldungNachholen({ status: "transactional", timestamp_opt: heute }, jetzt), true);
  assert.equal(anmeldungNachholen({ status: "archived", timestamp_opt: heute }, jetzt), true);
});

test("Bestandskunde von gestern oder frueher: nichts tun, kein Code", () => {
  assert.equal(anmeldungNachholen({ status: "transactional", timestamp_opt: "2026-10-25T21:59:00Z" }, jetzt), false);
  assert.equal(anmeldungNachholen({ status: "transactional", timestamp_opt: "2025-03-16T17:37:44Z" }, jetzt), false);
});

test("Tagesgrenze nach Berliner Zeit, nicht UTC", () => {
  // 22:30 UTC am 25.10. ist 23:30 in Berlin, also nicht heute.
  assert.equal(anmeldungNachholen({ status: "transactional", timestamp_opt: "2026-10-25T22:30:00Z" }, jetzt), false);
  // 23:30 UTC am 25.10. ist 00:30 am 26.10. in Berlin (Winterzeit), also heute.
  assert.equal(anmeldungNachholen({ status: "transactional", timestamp_opt: "2026-10-25T23:30:00Z" }, jetzt), true);
});

test("abgemeldet, angemeldet, wartend, unzustellbar oder ohne Datum: nichts tun", () => {
  for (const status of ["unsubscribed", "subscribed", "pending", "cleaned"]) {
    assert.equal(anmeldungNachholen({ status, timestamp_opt: heute }, jetzt), false, status);
  }
  assert.equal(anmeldungNachholen({ status: "transactional", timestamp_opt: "" }, jetzt), false);
  assert.equal(anmeldungNachholen({ status: "transactional" }, jetzt), false);
  assert.equal(anmeldungNachholen(null, jetzt), false);
});

test("Hash wie Mailchimp: MD5 der kleingeschriebenen Adresse", () => {
  // Wert aus Mailchimp fuer die Kundin vom 26.10.2026.
  assert.equal(subscriberHash(" A.Dabat@GMX.net "), "cb64fae2b1fbdf16677ff5a5e0f3b319");
});
