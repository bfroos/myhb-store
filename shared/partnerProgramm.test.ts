/**
 * Partnerprogramm (E32, #403): Formularpruefung, Ziel-URL, Schema und Wortwahl.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FRAGEN,
  FUNDAMENT,
  PAKETE,
  PARTNER_SEO,
  SCHRITTE,
  STANDORT_WEGE,
  WEN_WIR_SUCHEN,
  AUTOMATISIERUNG,
  AUSBILDUNG,
  QUALITAET,
  BILDER,
  partnerAnfrageUrl,
  partnerFaqSchema,
  pruefePartnerEingabe,
} from "./partnerProgramm.ts";

const gut = {
  vorname: "Lena",
  nachname: "Graf",
  email: "lena@praxis.de",
  telefon: "0171 1234567",
  stadt: "Hamburg",
  datenschutz: true,
};

test("gueltige Eingabe geht durch, unbekannte Auswahlwerte fallen weg", () => {
  const r = pruefePartnerEingabe({ ...gut, fachrichtung: "Dermatologie", start: "erfunden", pakete: ["Marketing", "Hack"] });
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.bot, false);
  assert.equal(r.anfrage.fachrichtung, "Dermatologie");
  assert.equal(r.anfrage.start, "");
  assert.deepEqual(r.anfrage.pakete, ["Marketing"]);
});

test("Pflichtfelder und Einwilligung", () => {
  assert.equal(pruefePartnerEingabe({ ...gut, nachname: "" }).ok, false);
  assert.equal(pruefePartnerEingabe({ ...gut, email: "x@y" }).ok, false);
  assert.equal(pruefePartnerEingabe({ ...gut, telefon: "12" }).ok, false);
  assert.equal(pruefePartnerEingabe({ ...gut, stadt: " " }).ok, false);
  assert.equal(pruefePartnerEingabe({ ...gut, datenschutz: false }).ok, false);
});

test("Honeypot markiert Bots", () => {
  const r = pruefePartnerEingabe({ ...gut, website: "spam.example" });
  assert.equal(r.ok && r.bot, true);
});

test("Herkunft: nur bekannte Felder", () => {
  const r = pruefePartnerEingabe({ ...gut, herkunft: { utm_source: "google", boese: "x" } });
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(r.anfrage.herkunft, { utm_source: "google" });
});

test("Ziel-URL wird aus lead-anfrage abgeleitet", () => {
  assert.equal(
    partnerAnfrageUrl("https://abc.supabase.co/functions/v1/lead-anfrage"),
    "https://abc.supabase.co/functions/v1/partner-anfrage",
  );
  assert.equal(partnerAnfrageUrl("https://example.com/x"), null);
  assert.equal(partnerAnfrageUrl(undefined), null);
});

test("FAQ-Schema enthaelt jede sichtbare Frage", () => {
  const s = partnerFaqSchema();
  assert.equal(s.mainEntity.length, FRAGEN.length);
  assert.equal(s.mainEntity[0]!.name, FRAGEN[0]!.frage);
});

test("Wortwahl: keine riskanten Begriffe, keine weiblichen Formen, Titel kurz genug", () => {
  const texte = [
    PARTNER_SEO.title,
    PARTNER_SEO.description,
    ...[FUNDAMENT, PAKETE, SCHRITTE, STANDORT_WEGE, AUTOMATISIERUNG].flat().flatMap((k) => [k.titel, k.text]),
    ...WEN_WIR_SUCHEN,
    AUSBILDUNG.titel,
    AUSBILDUNG.text,
    ...AUSBILDUNG.punkte,
    QUALITAET.titel,
    QUALITAET.text,
    ...Object.values(BILDER).map((b) => b.alt),
    ...FRAGEN.flatMap((f) => [f.frage, f.antwort]),
  ].join("\n");
  // "Franchise" nur in der Frage, die den Unterschied erklaert.
  assert.equal((texte.match(/Franchise/g) ?? []).length, 1);
  assert.doesNotMatch(texte, /Botox/i);
  assert.doesNotMatch(texte, /garant/i);
  assert.doesNotMatch(texte, /Ärztinnen|Kundinnen|Beraterinnen|Patientinnen/);
  assert.doesNotMatch(texte, /MYH&B/);
  assert.ok(PARTNER_SEO.description.length <= 170, `Beschreibung ${PARTNER_SEO.description.length} Zeichen`);
});

test("Ausbildungswunsch wird übernommen, Bilder kommen aus der eigenen Mediathek", () => {
  const r = pruefePartnerEingabe({ ...gut, ausbildung: "Ja, ich möchte erst bei euch lernen" });
  assert.ok(r.ok && r.anfrage.ausbildung === "Ja, ich möchte erst bei euch lernen");
  for (const b of Object.values(BILDER)) assert.match(b.src, /^https:\/\/media\.myhealthandbeauty\.app\/large_/);
});
