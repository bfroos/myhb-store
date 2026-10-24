import { test } from "node:test";
import assert from "node:assert/strict";
import { pruefeLeadEingabe, teileName } from "./leadAnfrage.ts";

const gueltig = {
  behandlung: "Haartransplantation",
  name: "Anna Maria Muster",
  telefon: "+49 170 1234567",
  email: "Anna@Example.de",
  kontaktweg: "whatsapp",
  einwilligung: true,
  antworten: [
    { frage: "Wo wünschst du dir mehr Fülle?", antwort: "Der Scheitel wird breiter" },
    { frage: "", antwort: "leer" },
  ],
  rechner: { grafts: 1500, methode: "ohne-rasur", preisEuro: 2250 },
  seite: "/lp/haartransplantation",
  attribution: { last: { utm_source: "facebook", fbclid: "abc" } },
};

test("gültige Anfrage wird ins Format von lead-anfrage umgebaut", () => {
  const r = pruefeLeadEingabe(gueltig, new Date("2026-10-20T10:00:00Z"));
  assert.equal(r.ok, true);
  if (!r.ok || r.bot) throw new Error("erwartet gültig");
  assert.equal(r.anfrage.quelle, "landingpage");
  assert.equal(r.anfrage.vorname, "Anna Maria");
  assert.equal(r.anfrage.nachname, "Muster");
  assert.equal(r.anfrage.email, "anna@example.de");
  assert.deepEqual(r.anfrage.antworten, [
    { frage: "Wo wünschst du dir mehr Fülle?", antwort: "Der Scheitel wird breiter" },
    { frage: "Wie sollen wir uns melden?", antwort: "whatsapp" },
  ]);
  assert.deepEqual(r.anfrage.herkunft.rechner, gueltig.rechner);
  assert.equal(r.anfrage.herkunft.seite, "/lp/haartransplantation");
  assert.equal(r.anfrage.herkunft.eingang, "2026-10-20T10:00:00.000Z");
});

test("Honeypot ausgefüllt: als Bot erkannt, nichts weiterleiten", () => {
  const r = pruefeLeadEingabe({ ...gueltig, website: "spam.example" });
  assert.deepEqual(r, { ok: true, bot: true });
});

test("Pflichtfelder: Name, Telefon oder E-Mail, Einwilligung", () => {
  assert.equal(pruefeLeadEingabe({ ...gueltig, name: " " }).ok, false);
  assert.equal(pruefeLeadEingabe({ ...gueltig, email: "", telefon: "" }).ok, false);
  assert.equal(pruefeLeadEingabe({ ...gueltig, einwilligung: "true" }).ok, false);
  assert.equal(pruefeLeadEingabe({ ...gueltig, email: "kein-at" }).ok, false);
  assert.equal(pruefeLeadEingabe({ ...gueltig, telefon: "123" }).ok, false);
  assert.equal(pruefeLeadEingabe({ ...gueltig, behandlung: "" }).ok, false);
  assert.equal(pruefeLeadEingabe({ ...gueltig, email: null }).ok, true);
});

test("zu große Rechner-Daten werden verworfen, unbekannter Kontaktweg ignoriert", () => {
  const r = pruefeLeadEingabe({
    ...gueltig,
    kontaktweg: "brieftaube",
    rechner: { x: "a".repeat(5000) },
  });
  if (!r.ok || r.bot) throw new Error("erwartet gültig");
  assert.equal(r.anfrage.herkunft.rechner, null);
  assert.equal(r.anfrage.herkunft.kontaktweg, null);
  assert.equal(r.anfrage.antworten.length, 1);
});

test("Name teilen", () => {
  assert.deepEqual(teileName("Cher"), { vorname: "Cher", nachname: null });
  assert.deepEqual(teileName(null), { vorname: null, nachname: null });
});
