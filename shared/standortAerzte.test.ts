import { test } from "node:test";
import assert from "node:assert/strict";
import { standortAerzteLinks } from "./standortAerzte.ts";

const arzt = (vorname: string, slug: string | null, orte: string[], extra: Record<string, unknown> = {}) => ({
  academicTitle: "Dr.",
  firstName: vorname,
  lastName: "Muster",
  employeeType: "doctor",
  isActive: true,
  hideFromPublic: false,
  slug,
  locations: orte.map((o) => ({ slug: o })),
  ...extra,
});

test("nur Ärzte dieses Standorts mit eigener Seite, alphabetisch", () => {
  const liste = [
    arzt("Zoe", "zoe", ["koeln-arcaden"]),
    arzt("Anna", "anna", ["koeln-arcaden", "leipzig"]),
    arzt("Ohne", null, ["koeln-arcaden"]),
    arzt("Fremd", "fremd", ["leipzig"]),
    arzt("Weg", "weg", ["koeln-arcaden"], { isActive: false }),
    arzt("Versteckt", "versteckt", ["koeln-arcaden"], { hideFromPublic: true }),
    { ...arzt("Berater", "berater", ["koeln-arcaden"]), employeeType: "consultant" },
  ];
  assert.deepEqual(standortAerzteLinks(liste, "koeln-arcaden"), [
    { name: "Dr. Anna Muster", slug: "anna" },
    { name: "Dr. Zoe Muster", slug: "zoe" },
  ]);
});

test("keine Obergrenze wie bei der go.-Vorlage (dort 3)", () => {
  const liste = ["a", "b", "c", "d", "e"].map((s) => arzt(s.toUpperCase(), s, ["x"]));
  assert.equal(standortAerzteLinks(liste, "x").length, 5);
});

test("ohne Standort oder Daten: leer", () => {
  assert.deepEqual(standortAerzteLinks(null, "x"), []);
  assert.deepEqual(standortAerzteLinks([arzt("A", "a", ["x"])], null), []);
});

test("doppelter Slug nur einmal", () => {
  assert.equal(standortAerzteLinks([arzt("A", "a", ["x"]), arzt("A", "a", ["x"])], "x").length, 1);
});
