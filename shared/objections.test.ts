import { test } from "node:test";
import assert from "node:assert/strict";
import { fillObjectionPlaceholders, resolveObjectionCard, resolveObjectionCards } from "./objections.ts";

const A = { price: "ab 79,99 € pro Zone*", discountPct: 20 };
const B = { price: "ab 149,99 €", discountPct: null };

test("Variante A: {preis} und {rabatt} werden ersetzt", () => {
  assert.equal(
    fillObjectionPlaceholders("Du bekommst {rabatt} Rabatt – {preis} ist schon der Preis mit Rabatt.", A),
    "Du bekommst 20\u00a0% Rabatt – ab 79,99 € pro Zone* ist schon der Preis mit Rabatt.",
  );
});

test("Variante B: Karte mit {rabatt} entfällt, {preis} bleibt nutzbar", () => {
  assert.equal(resolveObjectionCard({ title: "Zu teuer?", text: "{rabatt} Rabatt – {preis}" }, B), null);
  assert.equal(resolveObjectionCard({ title: "Zu teuer?", text: "Den Preis kennst du vorher: {preis}." }, B)?.text, "Den Preis kennst du vorher: ab 149,99 €.");
});

test("Rabatt 0 zählt als kein Rabatt", () => {
  assert.equal(fillObjectionPlaceholders("{rabatt}", { discountPct: 0 }), null);
});

test("ohne Preiszeile entfällt eine Karte mit {preis}", () => {
  assert.equal(resolveObjectionCard({ title: "Zu teuer?", text: "Ab {preis}." }, { discountPct: 20 }), null);
});

test("Platzhalter auch im Titel, Groß-/Kleinschreibung und Leerzeichen egal", () => {
  const c = resolveObjectionCard({ title: "Lohnt sich {Rabatt}?", text: "Ja, ab { PREIS }." }, A);
  assert.equal(c?.title, "Lohnt sich 20\u00a0%?");
  assert.equal(c?.text, "Ja, ab ab 79,99 € pro Zone*.");
});

test("unbekannte Platzhalter bleiben sichtbar", () => {
  assert.equal(fillObjectionPlaceholders("Dauer {dauer}", A), "Dauer {dauer}");
});

test("Texte ohne Platzhalter unverändert, auch ohne Kontext", () => {
  assert.equal(resolveObjectionCard({ title: "Angst vor Schmerzen?", text: "Kurze Pikser." })?.text, "Kurze Pikser.");
});

test("Karte ohne Titel entfällt; Text darf leer sein", () => {
  assert.equal(resolveObjectionCard({ title: "  ", text: "x" }), null);
  assert.equal(resolveObjectionCard({ title: "Nur Titel" })?.text, "");
});

test("Icon nur mit iconData, Link nur mit Label", () => {
  const c = resolveObjectionCard({ title: "T", icon: { iconName: "x", iconData: "" }, link: { label: " ", url: "/" } });
  assert.equal(c?.icon, null);
  assert.equal(c?.link, null);
  const icon = { iconName: "tabler:snowflake", iconData: "<path/>" };
  const link = { label: "Gutschein kaufen", method: "external-link", url: "https://example.com" };
  const d = resolveObjectionCard({ title: "T", icon, link });
  assert.equal(d?.icon, icon);
  assert.equal(d?.link, link);
});

test("beliebig viele Karten, Reihenfolge bleibt, eindeutige Keys", () => {
  const list = resolveObjectionCards([{ title: "1" }, null, { title: "" }, { title: "2" }, { title: "3" }, { title: "4" }, { title: "5" }, { title: "6" }], A);
  assert.deepEqual(list.map((c) => c.title), ["1", "2", "3", "4", "5", "6"]);
  assert.equal(new Set(list.map((c) => c.key)).size, 6);
});

test("Link-Text mit Platzhalter: in A ersetzt, in B nur der Link weg", () => {
  const card = { title: "Zu teuer?", text: "Den Preis kennst du vorher: {preis}.", link: { label: "{rabatt} sichern", method: "action" } };
  const a = resolveObjectionCard<unknown, { label: string; method: string }>(card, A);
  assert.equal(a?.link?.label, "20\u00a0% sichern");
  assert.equal(a?.link?.method, "action");
  assert.equal(card.link.label, "{rabatt} sichern", "Original bleibt unveraendert");
  const b = resolveObjectionCard(card, B);
  assert.ok(b, "Karte bleibt");
  assert.equal(b?.link, null);
});
