import { test } from "node:test";
import assert from "node:assert/strict";
import {
  GESCHLECHT_FRAGE,
  MAENNER_SCHRITTE,
  haarFunnelSchritte,
  korrigiereFrage,
  leadAntworten,
  pruefeTelefon,
} from "./haarFunnel.ts";

const frauen = [
  { question: "Wo wünschst du dir mehr Fülle?", options: [{ label: "Der Scheitel wird breiter", hint: "ca. 1.200–1.800 Grafts" }] },
  korrigiereFrage({ question: "Seit wann beschäftigt dich das?", options: [{ label: "Seit 1–3 Jahren" }] }),
  { question: "Wie trägst du dein Haar meistens?", options: [{ label: "Lang", hint: "gute Voraussetzung für die Behandlung ohne Rasur" }] },
];

test("erst Geschlecht, dann Frauen-Fragen", () => {
  const s = haarFunnelSchritte(frauen, "Frau");
  assert.equal(s[0], GESCHLECHT_FRAGE);
  assert.deepEqual(s.slice(1), frauen);
  // Vor der Wahl zaehlt der Frauen-Weg
  assert.equal(haarFunnelSchritte(frauen, undefined).length, frauen.length + 1);
});

test("Mann: Fragen aus dem Maenner-Funnel, keine Frauen-Fragen und keine Hinweise", () => {
  const s = haarFunnelSchritte(frauen, "Mann");
  assert.deepEqual(s.slice(1), MAENNER_SCHRITTE);
  const texte = s.map((x) => x.question).join(" | ");
  assert.doesNotMatch(texte, /Haar meistens|Fülle|beschäftigt/);
  assert.ok(s.every((x) => (x.options ?? []).every((o) => !o.hint)));
  assert.deepEqual(MAENNER_SCHRITTE[0]!.options!.map((o) => o.label), ["Geheimratsecken", "Tonsur", "Kompletter Oberkopf", "Lichtes Haar"]);
});

test("Anfrage an die App: Geschlecht/Ausgangslage/Alter wie im Maenner-Funnel", () => {
  const s = haarFunnelSchritte(frauen, "Mann");
  assert.deepEqual(leadAntworten(s, ["Mann", "Geheimratsecken", "30–39"]), [
    { frage: "Geschlecht", antwort: "Mann" },
    { frage: "Ausgangslage", antwort: "Geheimratsecken" },
    { frage: "Alter", antwort: "30–39" },
  ]);
});

test("Frau: Fragetexte wie bisher, umbenannte Frage behaelt den alten Schluessel", () => {
  const s = haarFunnelSchritte(frauen, "Frau");
  assert.equal(s[2]!.question, "Seit wann beschäftigt dich das Thema?");
  assert.deepEqual(leadAntworten(s, ["Frau", "Der Scheitel wird breiter", "Seit 1–3 Jahren", "Lang"]), [
    { frage: "Geschlecht", antwort: "Frau" },
    { frage: "Wo wünschst du dir mehr Fülle?", antwort: "Der Scheitel wird breiter" },
    { frage: "Seit wann beschäftigt dich das?", antwort: "Seit 1–3 Jahren" },
    { frage: "Wie trägst du dein Haar meistens?", antwort: "Lang" },
  ]);
});

test("OP-Funnel: Zeitfrage nur sichtbar umbenannt", () => {
  const k = korrigiereFrage({ question: "Wann möchtest du den Eingriff ungefähr?" });
  assert.equal(k.question, "Wann möchtest du den Eingriff ungefähr durchführen?");
  assert.equal(k.leadFrage, "Wann möchtest du den Eingriff ungefähr?");
  const x = { question: "Wie alt bist du?" };
  assert.equal(korrigiereFrage(x), x);
});

test("Telefon ist Pflicht", () => {
  assert.match(pruefeTelefon("")!, /Telefonnummer an/);
  assert.match(pruefeTelefon("  ")!, /Telefonnummer an/);
  assert.match(pruefeTelefon("123")!, /prüf/);
  assert.equal(pruefeTelefon("+49 170 1234567"), null);
});
