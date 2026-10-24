import { test } from "node:test";
import assert from "node:assert/strict";
import {
  begrenze,
  formatEuro,
  laufzeiten,
  monatsrateCent,
  preisCent,
  vorschlagEinheiten,
} from "./preisRechner.ts";

const grenzen = { min: 300, max: 3000, step: 50, standard: 1500 };

test("Vorschlag: Summe der Bereiche, sonst Standard; immer in den Grenzen", () => {
  assert.equal(vorschlagEinheiten([], grenzen), 1500);
  assert.equal(vorschlagEinheiten([{ label: "Scheitel", grafts: 1500 }], grenzen), 1500);
  assert.equal(
    vorschlagEinheiten(
      [
        { label: "Scheitel", grafts: 1500 },
        { label: "Haaransatz", grafts: 1400 },
        { label: "Schläfen", grafts: 800 },
      ],
      grenzen,
    ),
    3000,
  );
  assert.equal(vorschlagEinheiten([{ label: "Augenbrauen", grafts: 120 }], grenzen), 300);
  assert.equal(begrenze(1523, grenzen), 1500);
  assert.equal(begrenze(1530, grenzen), 1550);
});

test("Preis: Einheiten × Preis je Graft + Zusätze", () => {
  const ohneRasur = { label: "Ohne Rasur", pricePerGraftCent: 150 };
  assert.equal(preisCent(1500, ohneRasur), 225000);
  assert.equal(preisCent(1500, ohneRasur, [{ label: "PRP", priceCent: 59900 }]), 284900);
  assert.equal(preisCent(1500, null), 0);
});

test("Mindestpreis wie in Michaels Entwurf: 1.500 Grafts x 1,50 € = 2.250 €, angezeigt 2.900 €", () => {
  const ohneRasur = { label: "Ohne Rasur", pricePerGraftCent: 150 };
  assert.equal(preisCent(1500, ohneRasur, [], 290000), 290000);
  assert.equal(preisCent(2500, ohneRasur, [], 290000), 375000);
  assert.equal(preisCent(1500, ohneRasur, [{ label: "PRP", priceCent: 59900 }], 290000), 349900);
});

test("Raten: ohne Zinsen, aufgerundet auf volle Euro", () => {
  assert.equal(monatsrateCent(290000, 100000, 12), 15900);
  assert.equal(monatsrateCent(225000, 0, 24), 9400);
  assert.equal(monatsrateCent(50000, 100000, 12), 0);
  assert.equal(monatsrateCent(225000, 0, 0), 0);
  assert.deepEqual(laufzeiten("6,12, 24;36"), [6, 12, 24, 36]);
  assert.deepEqual(laufzeiten(""), []);
});

test("Euro-Format", () => {
  assert.equal(formatEuro(290000), "2.900 €");
  assert.equal(formatEuro(15950), "159,50 €");
});
