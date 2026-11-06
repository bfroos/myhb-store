import { test } from "node:test";
import assert from "node:assert/strict";
import { btxToBotox, btxToBotoxDeep } from "./seoTerms.ts";

test("BTX wird zu Botox, nur als eigenes Wort", () => {
  assert.equal(btxToBotox("Browlift mit BTX"), "Browlift mit Botox");
  assert.equal(btxToBotox("1. Mal BTX mit 52 Jahren"), "1. Mal Botox mit 52 Jahren");
  assert.equal(btxToBotox("BTX-Behandlung"), "Botox-Behandlung");
  assert.equal(btxToBotox("Video_BTX_1.mp4"), "Video_BTX_1.mp4");
  assert.equal(btxToBotox("ABTXY"), "ABTXY");
});

test("Adressen und Kennungen bleiben", () => {
  const out = btxToBotoxDeep({
    title: "Lipflip mit BTX",
    video: { url: "/uploads/BTX_clip.mp4", name: "BTX clip" },
    faqs: [{ question: "Wann wirkt BTX?", answer: "/standorte/BTX" }],
  });
  assert.equal(out.title, "Lipflip mit Botox");
  assert.equal(out.video.url, "/uploads/BTX_clip.mp4");
  assert.equal(out.video.name, "BTX clip");
  assert.equal(out.faqs[0].question, "Wann wirkt Botox?");
  assert.equal(out.faqs[0].answer, "/standorte/BTX");
});

test("Promise wird abgewartet statt zu {} zu werden", async () => {
  const out = await btxToBotoxDeep(Promise.resolve({ title: "BTX ohne Termin" }));
  assert.deepEqual(out, { title: "Botox ohne Termin" });
});
