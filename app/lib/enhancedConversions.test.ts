/**
 * Erweiterte Conversions (myhb-app/myhb-os#637): dieselben Faelle und
 * Erwartungswerte wie myhb-os src/lib/enhancedConversions.test.ts — die
 * Hashes der Website muessen exakt die des Kauf-Uploads sein.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { hashedUserData, normalizeEmail, normalizePhone, pushErweiterteConversions, sha256Hex } from "./enhancedConversions.ts";

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

const KONTAKT = { email: " Kundin@Example.DE ", phone: "+49 176 55224067" };

test("Dankesseite mit Einwilligung: nur Hashes in der Datenschicht", async () => {
  const w = { dataLayer: [] as unknown[], Cookiebot: { hasResponse: true, consent: { marketing: true } } };
  await pushErweiterteConversions(w, KONTAKT, 0);
  assert.deepEqual(w.dataLayer, [{ ec_user_data: await hashedUserData(KONTAKT) }]);
  const roh = JSON.stringify(w.dataLayer).toLowerCase();
  assert.ok(!roh.includes("kundin@example") && !roh.includes("55224067"), "keine Klardaten");
});

test("Dankesseite ohne Einwilligung: ec_user_data wird geleert", async () => {
  const w = { dataLayer: [] as unknown[], Cookiebot: { hasResponse: true, consent: { marketing: false } } };
  await pushErweiterteConversions(w, KONTAKT, 0);
  assert.deepEqual(w.dataLayer, [{ ec_user_data: undefined }]);
});

test("Dankesseite: wartet auf eine spaete Cookiebot-Antwort", async () => {
  const w: { dataLayer: unknown[]; Cookiebot?: { hasResponse?: boolean; consent?: { marketing?: boolean } } } = { dataLayer: [] };
  setTimeout(() => { w.Cookiebot = { hasResponse: true, consent: { marketing: true } }; }, 250);
  const ec = await pushErweiterteConversions(w, KONTAKT, 1500);
  assert.ok(ec?.sha256_email_address && ec?.sha256_phone_number);
});
