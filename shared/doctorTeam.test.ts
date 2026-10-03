import { test } from "node:test";
import assert from "node:assert/strict";
import { doctorLines, resolveDoctorCard, resolveDoctorCards, safeProfileLink } from "./doctorTeam.ts";

const photo = { id: 1, url: "/iqra.jpg", mime: "image/jpeg" };

test("Employee-Karte: Titel und Name aus dem Employee", () => {
  const c = resolveDoctorCard({ id: 7, employee: { id: 5, academicTitle: "Ärztin", firstName: "Iqra", photo } });
  assert.deepEqual(c, { key: "7", title: "Ärztin", name: "Iqra", photo, alt: "Porträt: Ärztin Iqra", profileLink: null });
});

test("Overrides schlagen Employee-Daten", () => {
  const img = { id: 2, url: "/neu.jpg" };
  const c = resolveDoctorCard({ employee: { academicTitle: "Dr. med.", firstName: "A", lastName: "B", photo }, name: "Anna B.", role: "Fachärztin", image: img, imageAlt: "Anna" });
  assert.equal(c?.name, "Anna B.");
  assert.equal(c?.title, "Fachärztin");
  assert.equal(c?.photo, img);
  assert.equal(c?.alt, "Anna");
});

test("Leere Override-Strings zählen nicht", () => {
  const c = resolveDoctorCard({ employee: { academicTitle: "Arzt", firstName: "Mamdoh", photo }, name: "  ", role: "" });
  assert.equal(c?.name, "Mamdoh");
  assert.equal(c?.title, "Arzt");
});

test("Versteckter oder inaktiver Employee wird ignoriert", () => {
  assert.equal(resolveDoctorCard({ employee: { firstName: "X", hideFromPublic: true, photo } }), null);
  assert.equal(resolveDoctorCard({ employee: { firstName: "X", isActive: false, photo } }), null);
  const c = resolveDoctorCard({ employee: { firstName: "X", isActive: false, photo }, name: "Manuell" });
  assert.equal(c?.name, "Manuell");
  assert.equal(c?.photo, null, "Foto des inaktiven Employees nicht übernehmen");
});

test("Karte ohne Namen entfällt, Reihenfolge bleibt", () => {
  const list = resolveDoctorCards([{ name: "A" }, {}, null, { employee: null }, { name: "B" }]);
  assert.deepEqual(list.map((d) => d.name), ["A", "B"]);
});

test("beliebig viele Ärzt:innen (keine Begrenzung)", () => {
  const list = resolveDoctorCards(Array.from({ length: 7 }, (_, i) => ({ name: `D${i}` })));
  assert.equal(list.length, 7);
  assert.equal(new Set(list.map((d) => d.key)).size, 7, "eindeutige Keys");
});

test("doctorLines wie bisher in der v2-Vorlage", () => {
  assert.deepEqual(doctorLines("Dr. med. Max Muster"), { title: "Dr. med.", fullName: "Max Muster" });
  assert.deepEqual(doctorLines("Arzt Masoud"), { title: "Arzt", fullName: "Masoud" });
  assert.deepEqual(doctorLines("Masoud"), { title: "", fullName: "Masoud" });
});

test("profileLink: nur relative Pfade und http(s)", () => {
  assert.equal(safeProfileLink("/aerzte/iqra"), "/aerzte/iqra");
  assert.equal(safeProfileLink("https://example.com"), "https://example.com");
  assert.equal(safeProfileLink("javascript:alert(1)"), null);
  assert.equal(safeProfileLink("//evil.com"), null);
  assert.equal(safeProfileLink(""), null);
});
