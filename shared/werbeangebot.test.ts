import { test } from "node:test";
import assert from "node:assert/strict";
import { angebotAusSuche, mitAngebot, normalAngebot } from "./werbeangebot.ts";

const APP = "https://app.myhealthandbeauty.com/book-appointment";

test("liest ?angebot= und schreibt klein", () => {
  assert.equal(angebotAusSuche("?angebot=Zone100"), "zone100");
  assert.equal(angebotAusSuche("utm_source=taboola&angebot=meta-zone-50"), "meta-zone-50");
  assert.equal(angebotAusSuche("https://myhealthandbeauty.com/x?angebot=gh50"), "gh50");
});

test("ungueltige Werte werden verworfen", () => {
  assert.equal(angebotAusSuche(""), null);
  assert.equal(angebotAusSuche("?angebot="), null);
  assert.equal(angebotAusSuche("?angebot=a"), null);
  assert.equal(angebotAusSuche("?angebot=-zone"), null);
  assert.equal(angebotAusSuche("?angebot=zone%20100"), null);
  assert.equal(angebotAusSuche("?angebot=" + "a".repeat(41)), null);
  assert.equal(normalAngebot("<script>"), null);
});

test("haengt angebot an die Buchungs-URL und behaelt die anderen Parameter", () => {
  const u = new URL(mitAngebot(`${APP}?location=koeln&treatment=lipfiller`, "zone100"));
  assert.equal(u.searchParams.get("angebot"), "zone100");
  assert.equal(u.searchParams.get("location"), "koeln");
  assert.equal(u.searchParams.get("treatment"), "lipfiller");
});

test("ohne Angebot bleibt die URL unveraendert", () => {
  assert.equal(mitAngebot(APP, null), APP);
  assert.equal(mitAngebot(APP, "kaputt wert"), APP);
});

test("ein schon gesetzter Wert an der URL bleibt", () => {
  const u = new URL(mitAngebot(`${APP}?angebot=zone50`, "zone100"));
  assert.equal(u.searchParams.get("angebot"), "zone50");
});
