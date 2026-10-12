import { test } from "node:test";
import assert from "node:assert/strict";
import {
  anonymizeDoctorNames,
  isTestEmployeeSlug,
  sanitizeReviewsDeep,
  shortenReviewAuthor,
} from "./reviewPrivacy.ts";

test("Arztnamen mit Titel werden auf den Vornamen gekuerzt", () => {
  assert.equal(anonymizeDoctorNames("Danke an Frau Dr. Noura Ahmad!"), "Danke an Noura!");
  assert.equal(anonymizeDoctorNames("bei Fr.Dr.Noura Ahmad die Lippen"), "bei Noura die Lippen");
  assert.equal(anonymizeDoctorNames("Lob an Dr Noura Ahmed"), "Lob an Noura");
  assert.equal(anonymizeDoctorNames("Dr. Wahbeh hat sich Zeit genommen"), "Bachar hat sich Zeit genommen");
  assert.equal(anonymizeDoctorNames("Arzt Dr.masmoudi sehr gut"), "Arzt Khaled sehr gut");
  assert.equal(anonymizeDoctorNames("Dr. Masmondi Hat Mir Traumlippen"), "Khaled Hat Mir Traumlippen");
  assert.equal(anonymizeDoctorNames("Dr Omar hat sich Zeit gelassen"), "Omar hat sich Zeit gelassen");
  assert.equal(anonymizeDoctorNames("Behandlung von Fr Dr Laura"), "Behandlung von Laura");
});

test("Nachname ohne Titel faellt weg", () => {
  assert.equal(anonymizeDoctorNames("Wurde von Frau Noura Ahmad beraten"), "Wurde von Noura beraten");
  assert.equal(anonymizeDoctorNames("Frau Nura Ahmad hat"), "Noura hat");
});

test("Dr. Gero Ruppert bleibt, andere Woerter mit Dr bleiben unberuehrt", () => {
  assert.equal(anonymizeDoctorNames("Dr. Gero Ruppert war kompetent"), "Dr. Gero Ruppert war kompetent");
  assert.equal(anonymizeDoctorNames("Drinks und Drogerie"), "Drinks und Drogerie");
});

test("Nachname ohne bekannten Vornamen: Rezension nicht ausliefern", () => {
  assert.equal(anonymizeDoctorNames("Herr Dr. Kleber beraet gut"), null);
  assert.equal(anonymizeDoctorNames("Dr. Zouria und ihre Assistentin"), null);
});

test("Rezensionen mit Wettbewerbernamen werden nicht ausgeliefert", () => {
  const out = sanitizeReviewsDeep([
    { author: "Coco M.", rating: 5, text: "Ihr habt geschafft, was M1 Beauty nicht geschafft hat" },
    { author: "Anna B.", rating: 5, text: "Toll, 1 ml war genau richtig" },
  ]) as any[];
  assert.deepEqual(out.map((r) => r.author), ["Anna B."]);
});

test("Autor:innen nur mit Vorname und Initiale", () => {
  assert.equal(shortenReviewAuthor("Julia Karaus"), "Julia K.");
  assert.equal(shortenReviewAuthor("Laura G. A."), "Laura A.");
  assert.equal(shortenReviewAuthor("Paula"), "Paula");
  assert.equal(shortenReviewAuthor("Robert von caju"), "Robert C.");
});

test("Test-Aerzt:innen und Rezensionen in einer Strapi-Antwort", () => {
  assert.equal(isTestEmployeeSlug("employee"), true);
  assert.equal(isTestEmployeeSlug("employee-7"), true);
  assert.equal(isTestEmployeeSlug("noura"), false);
  const out = sanitizeReviewsDeep({
    data: {
      employees: [
        { slug: "employee", firstName: "Ärztin", lastName: "Weber" },
        { slug: "noura", firstName: "Ärztin", lastName: "Noura" },
      ],
      reviews: [
        { author: "Julia Karaus", rating: 5, text: "Danke Dr. Noura Ahmad" },
        { author: "X Y", rating: 5, text: "Herr Dr. Kleber" },
        { author: "Anna", rating: 5, text: null },
      ],
    },
  }) as any;
  assert.deepEqual(out.data.employees.map((e: any) => e.slug), ["noura"]);
  assert.deepEqual(out.data.reviews, [
    { author: "Julia K.", rating: 5, text: "Danke Noura" },
    { author: "Anna", rating: 5, text: null },
  ]);
});
