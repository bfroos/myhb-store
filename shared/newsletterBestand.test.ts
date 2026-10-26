/**
 * Newsletter-Anmeldung bekannter Adressen. Laeuft mit `npm run test:unit`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { anmeldungNachholen, subscriberHash } from "./newsletterBestand.ts";

test("von Shopify angelegte und abgemeldete Adressen werden angemeldet", () => {
  for (const s of ["transactional", "archived", "unsubscribed"]) assert.equal(anmeldungNachholen(s), true, s);
});

test("schon angemeldet, wartend oder unzustellbar bleibt, wie es ist", () => {
  for (const s of ["subscribed", "pending", "cleaned", "", undefined, null]) assert.equal(anmeldungNachholen(s), false, String(s));
});

test("Hash wie Mailchimp: MD5 der kleingeschriebenen Adresse", () => {
  // Wert aus Mailchimp fuer die Kundin vom 26.10.2026.
  assert.equal(subscriberHash(" A.Dabat@GMX.net "), "cb64fae2b1fbdf16677ff5a5e0f3b319");
});
