/**
 * Botox-Bereinigung fuer go.* (Google Ads RESTRICTED_DRUG_TERMS).
 * Laeuft mit `npm run test:unit`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  hasRestrictedDrugTerm,
  replaceRestrictedDrugTerms,
  sanitizeAdsContent,
} from "./adsTerms.ts";

test("Fliesstext: Botox®, Botox, botox, Botulinumtoxin", () => {
  assert.equal(
    replaceRestrictedDrugTerms("Sind Polynukleotide besser als Botox®?"),
    "Sind Polynukleotide besser als Muskelrelaxans?",
  );
  assert.equal(
    replaceRestrictedDrugTerms("Baby Botox Behandlung und botox-Kur"),
    "Baby Muskelrelaxans Behandlung und Muskelrelaxans-Kur",
  );
  assert.equal(
    replaceRestrictedDrugTerms("Allergie gegen Botulinumtoxin Typ A"),
    "Allergie gegen Muskelrelaxans",
  );
  assert.equal(replaceRestrictedDrugTerms("✓ Botox & Hyaluron ✓"), "✓ Muskelrelaxans & Hyaluron ✓");
  assert.equal(replaceRestrictedDrugTerms("Hyaluron"), "Hyaluron");
});

test("Markdown- und HTML-Links auf botox-URLs werden zu Text", () => {
  assert.equal(
    replaceRestrictedDrugTerms("Siehe [Stirnfalte](https://www.x.com/behandlungen/botox/stirnfalte)."),
    "Siehe Stirnfalte.",
  );
  assert.equal(
    replaceRestrictedDrugTerms('<a href="/botox/x">Baby Botox®</a> ok'),
    "Baby Muskelrelaxans ok",
  );
  assert.equal(
    replaceRestrictedDrugTerms("[Botox](/hyaluron)"),
    "[Muskelrelaxans](/hyaluron)",
  );
});

test("Strapi-Antwort: Text ersetzt, URLs/Slugs/Dateinamen unangetastet, Links entpackt", () => {
  const input = {
    data: {
      pathKey: "botox/zornesfalte",
      slug: "baby-botox",
      calendlyUrl: "https://calendly.com/x/botox",
      question: "Sind Polynukleotide besser als Botox®?",
      variants: [{ label: "1-Zone Botox®", slug: "1-zone" }],
      video: {
        url: "https://media.example/Botox_Zornesfalte.mp4",
        mime: "video/mp4",
        name: "Botox_Zornesfalte.mp4",
        alternativeText: "Botox Zornesfalte",
      },
      answer: [
        {
          type: "paragraph",
          children: [
            { type: "text", text: "Botox wird eingesetzt, um " },
            {
              type: "link",
              url: "https://www.myhealthandbeauty.com/behandlungen/botox/stirnfalte",
              children: [{ type: "text", text: "Stirnfalten" }],
            },
            {
              type: "link",
              url: "https://www.myhealthandbeauty.com/behandlungen/hyaluron",
              children: [{ type: "text", text: "Hyaluron" }],
            },
          ],
        },
      ],
    },
  };
  const out = sanitizeAdsContent(input, "de");
  assert.equal(out.data.pathKey, "botox/zornesfalte");
  assert.equal(out.data.slug, "baby-botox");
  assert.equal(out.data.calendlyUrl, "https://calendly.com/x/botox");
  assert.equal(out.data.question, "Sind Polynukleotide besser als Muskelrelaxans?");
  assert.equal(out.data.variants[0].label, "1-Zone Muskelrelaxans");
  assert.equal(out.data.variants[0].slug, "1-zone");
  assert.equal(out.data.video.url, input.data.video.url);
  assert.equal(out.data.video.name, "Botox_Zornesfalte.mp4");
  assert.equal(out.data.video.alternativeText, "Muskelrelaxans Zornesfalte");
  assert.deepEqual(out.data.answer[0].children, [
    { type: "text", text: "Muskelrelaxans wird eingesetzt, um " },
    { type: "text", text: "Stirnfalten" },
    {
      type: "link",
      url: "https://www.myhealthandbeauty.com/behandlungen/hyaluron",
      children: [{ type: "text", text: "Hyaluron" }],
    },
  ]);
  // Eingabe bleibt unveraendert (Cache-Objekte werden nicht mutiert).
  assert.equal(input.data.question, "Sind Polynukleotide besser als Botox®?");
  assert.equal(hasRestrictedDrugTerm(JSON.stringify(out.data.answer)), false);
});

test("andere Sprache bekommt den eigenen Begriff", () => {
  assert.equal(replaceRestrictedDrugTerms("Botox®", "en"), "muscle relaxant");
});
