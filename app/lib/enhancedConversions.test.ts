/**
 * Erweiterte Conversions (myhb-app/myhb-os#637): dieselben Faelle und
 * Erwartungswerte wie myhb-os src/lib/enhancedConversions.test.ts — die
 * Hashes der Website muessen exakt die des Kauf-Uploads sein.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { hashedUserData, normalizeEmail, normalizePhone, sha256Hex } from "./enhancedConversions.ts";

test("E-Mail: klein, ohne Leerraum, unplausibles faellt weg", () => {
  assert.equal(normalizeEmail("  Kundin@Example.DE "), "kundin@example.de");
  assert.equal(normalizeEmail("kein-at-zeichen"), null);
  assert.equal(normalizeEmail(""), null);
});

test("Telefon: Calendly-Schreibweise, Supabase-Schreibweise, national", () => {
  for (const roh of ["+49 176 55224067", "4917655224067", "+490176 5522 4067", "0176 55224067"]) {
    assert.equal(normalizePhone(roh), "+4917655224067");
  }
  assert.equal(normalizePhone("+1 515 555 0100"), "+15155550100");
});

test("SHA-256 als Hex, klein (bekannter Wert)", async () => {
  assert.equal(await sha256Hex("abc"), "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

test("hashedUserData: nur plausible Felder", async () => {
  const beide = await hashedUserData({ email: "Kundin@Example.de", phone: "+49 176 55224067" });
  assert.equal(beide.sha256_email_address, await sha256Hex("kundin@example.de"));
  assert.equal(beide.sha256_phone_number, await sha256Hex("+4917655224067"));
  assert.deepEqual(await hashedUserData({ email: "quatsch", phone: "" }), {});
});
