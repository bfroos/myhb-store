/**
 * Rabatt-Fenster Schritt 2 (myhb-app/myhb-os#1030). Laeuft mit `npm run test:unit`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { freieTermine, terminText } from "./rabattTermine.ts";

test("nur gueltige Termine, ohne Doppelte, hoechstens drei", () => {
  const antwort = {
    date: "2026-10-21",
    time: "09:00",
    termine: [
      { date: "2026-10-21", time: "09:00" },
      { date: "2026-10-21", time: "09:00" },
      { date: "2026-10-21", time: "9 Uhr" },
      { date: "2026-10-21", time: "09:15" },
      { date: "2026-10-22", time: "10:00" },
      { date: "2026-10-23", time: "11:00" },
    ],
  };
  assert.deepEqual(freieTermine(antwort), [
    { date: "2026-10-21", time: "09:00" },
    { date: "2026-10-21", time: "09:15" },
    { date: "2026-10-22", time: "10:00" },
  ]);
  assert.deepEqual(freieTermine({ none: true }), []);
  assert.deepEqual(freieTermine(null), []);
});

test("Beschriftung: heute, morgen, sonst Wochentag mit Datum", () => {
  const jetzt = Date.parse("2026-10-20T08:00:00Z"); // Di., 20.10. in Berlin
  assert.equal(terminText({ date: "2026-10-20", time: "14:30" }, "de", jetzt), "Heute, 14:30 Uhr");
  assert.equal(terminText({ date: "2026-10-21", time: "09:00" }, "de", jetzt), "Morgen, 09:00 Uhr");
  assert.equal(terminText({ date: "2026-10-22", time: "10:15" }, "de", jetzt), "Do., 22.10., 10:15 Uhr");
  assert.equal(terminText({ date: "2026-10-21", time: "09:00" }, "en", jetzt), "Tomorrow, 09:00");
});
