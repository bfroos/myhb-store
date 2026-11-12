import { test } from "node:test";
import assert from "node:assert/strict";
import {
  FUNNEL_FRAGEN,
  MEHRFACH_TRENNER,
  antwortGueltig,
  kurzbewerbungFuerApp,
  pruefeKurzbewerbung,
  stadtAusSlug,
  trackingAusQuery,
} from "./recruitingFunnel.ts";

const alleAntworten = Object.fromEntries(
  FUNNEL_FRAGEN.map((f) => [f.id, f.optionen[0]!]),
);

test("stadtAusSlug kennt Köln und lehnt Unbekanntes ab", () => {
  assert.equal(stadtAusSlug("koeln")?.name, "Köln");
  assert.equal(stadtAusSlug("KOELN")?.name, "Köln");
  assert.equal(stadtAusSlug("berlin"), null);
  assert.equal(stadtAusSlug(undefined), null);
});

test("trackingAusQuery nimmt nur bekannte Parameter", () => {
  const t = trackingAusQuery({
    utm_campaign: "recruiting-koeln",
    fbclid: ["abc", "def"],
    email: "x@y.de",
    utm_source: "",
  });
  assert.deepEqual(t, { utm_campaign: "recruiting-koeln", fbclid: "abc" });
});

test("kurzbewerbungFuerApp setzt Stadt, Quelle und Kampagne", () => {
  const body = kurzbewerbungFuerApp({
    vorname: " Anna ",
    nachname: "Muster",
    email: "Anna@Example.DE",
    telefon: "0221 123456",
    stadt: stadtAusSlug("koeln")!,
    antworten: { ...alleAntworten, fremd: "x" },
    tracking: { utm_campaign: "recruiting-koeln" },
  });
  assert.equal(body.vorname, "Anna");
  assert.equal(body.email, "anna@example.de");
  assert.equal(body.standort, "Köln");
  assert.equal(body.quelle, "funnel");
  assert.equal(body.herkunft.formular, "funnel-koeln");
  assert.equal(body.herkunft.utm_campaign, "recruiting-koeln");
  assert.equal(body.antworten.length, FUNNEL_FRAGEN.length);
  assert.equal(body.nachricht, null);
});

test("ohne Approbation steht ein Hinweis in der Nachricht", () => {
  const body = kurzbewerbungFuerApp({
    vorname: "A", nachname: "B", email: "a@b.de", telefon: "0221 1",
    stadt: stadtAusSlug("aachen")!,
    antworten: { ...alleAntworten, approbation: "Nein, noch nicht" },
    tracking: {},
  });
  assert.match(body.nachricht ?? "", /keine Approbation/);
});

test("pruefeKurzbewerbung verlangt Fragen, Kontakt und Einwilligung", () => {
  const gut = {
    vorname: "A", nachname: "B", email: "a@b.de", telefon: "0221 123456",
    antworten: alleAntworten, datenschutz: true,
  };
  assert.equal(pruefeKurzbewerbung(gut), null);
  assert.match(pruefeKurzbewerbung({ ...gut, antworten: {} })!, /Fragen/);
  assert.match(pruefeKurzbewerbung({ ...gut, email: "kaputt" })!, /E-Mail/);
  assert.match(pruefeKurzbewerbung({ ...gut, telefon: "12" })!, /Telefon/);
  assert.match(pruefeKurzbewerbung({ ...gut, datenschutz: false })!, /Datenschutz/);
});

test("Mehrfachauswahl bei den Zielen", () => {
  const ziele = FUNNEL_FRAGEN.find((f) => f.id === "ziele")!;
  const zwei = [ziele.optionen[0], ziele.optionen[5]].join(MEHRFACH_TRENNER);
  assert.equal(antwortGueltig(ziele, zwei), true);
  assert.equal(antwortGueltig(ziele, `${ziele.optionen[0]}${MEHRFACH_TRENNER}erfunden`), false);
  assert.equal(antwortGueltig(ziele, ""), false);
  const body = kurzbewerbungFuerApp({
    vorname: "A", nachname: "B", email: "a@b.de", telefon: "0221 1", wohnort: "Bonn",
    stadt: stadtAusSlug("koeln")!,
    antworten: { ...alleAntworten, ziele: zwei },
    tracking: {},
  });
  assert.equal(body.wohnort, "Bonn");
  assert.equal(body.antworten.find((a) => a.frage === ziele.frage)?.antwort, zwei);
});
