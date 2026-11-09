import { test } from "node:test";
import assert from "node:assert/strict";
import { replacePlaceholderRichtext } from "./placeholder.ts";

const leer = [{ placeholder: "{{ cityPhrase }}", replacement: "" }];
const koeln = [{ placeholder: "{{ cityPhrase }}", replacement: "in Köln" }];
const heading = (text: string) => [{ type: "heading", level: 2, children: [{ type: "text", text }] }] as any;
const textOf = (r: any) => r[0].children[0].text;

test("Hub: leerer Platzhalter hinterlässt kein Leerzeichen vor dem Fragezeichen", () => {
  assert.equal(textOf(replacePlaceholderRichtext(heading("Was kostet Botox {{ cityPhrase }}?"), leer)), "Was kostet Botox?");
});

test("Standort: Platzhalter wird normal ersetzt", () => {
  assert.equal(textOf(replacePlaceholderRichtext(heading("Was kostet Botox {{ cityPhrase }}?"), koeln)), "Was kostet Botox in Köln?");
});

test("Leerzeichen am Rand eines Knotens bleiben (Anschluss an fett/Link)", () => {
  assert.equal(textOf(replacePlaceholderRichtext(heading("Augenringe {{ cityPhrase }} "), leer)), "Augenringe ");
});

test("Knoten ohne Platzhalter bleiben unverändert", () => {
  assert.equal(textOf(replacePlaceholderRichtext(heading("Preis ab 149,99 € ."), leer)), "Preis ab 149,99 € .");
});
