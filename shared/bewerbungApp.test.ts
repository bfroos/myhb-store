import { test } from "node:test";
import assert from "node:assert/strict";
import { bewerbungFuerApp, bewerbungUrl } from "./bewerbungApp.ts";

test("Adresse wird aus lead-anfrage abgeleitet", () => {
  assert.equal(
    bewerbungUrl("https://abc.supabase.co/functions/v1/lead-anfrage"),
    "https://abc.supabase.co/functions/v1/bewerbung-eingang",
  );
  assert.equal(bewerbungUrl(" https://abc.supabase.co/functions/v1/lead-anfrage/ "), "https://abc.supabase.co/functions/v1/bewerbung-eingang");
  assert.equal(bewerbungUrl(""), null);
  assert.equal(bewerbungUrl("https://example.com/irgendwas"), null);
});

test("Formular wird ins eigene Format von bewerbung-eingang umgebaut", () => {
  const body = bewerbungFuerApp({
    vorname: "Anna",
    nachname: "Muster",
    email: "anna@example.com",
    telefon: "0170 1234567",
    ausbildungsstandLabel: "Facharzt",
    wunschstandort: "Köln",
    nachricht: "",
    quelle: "karriere-aerzte",
    cv: { data: new TextEncoder().encode("%PDF-1.4"), filename: "Lebenslauf.PDF" },
  });
  assert.equal(body.stelle, "Arzt (m/w/d)");
  assert.equal(body.standort, "Köln");
  assert.equal(body.nachricht, null);
  assert.equal(body.quelle, "website");
  assert.equal(body.datenschutz, true);
  assert.deepEqual(body.herkunft, { formular: "karriere-aerzte" });
  assert.equal(body.lebenslauf_datei?.typ, "application/pdf");
  assert.equal(atob(body.lebenslauf_datei!.base64), "%PDF-1.4");
});

test("ohne Lebenslauf bleibt die Datei leer", () => {
  const body = bewerbungFuerApp({
    vorname: "A", nachname: "B", email: "a@b.de", telefon: "1",
    ausbildungsstandLabel: "", wunschstandort: "", nachricht: "x", quelle: "q", cv: null,
  });
  assert.equal(body.lebenslauf_datei, null);
  assert.equal(body.ausbildungsstand, null);
});
