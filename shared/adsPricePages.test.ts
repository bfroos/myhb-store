import { test } from "node:test";
import assert from "node:assert/strict";
import { harmonizeDiscountClaims, prepareAdsPricePage } from "./adsPricePages.ts";

test("Rabatt-Saetze klingen nicht nach zweitem Rabatt", () => {
  assert.equal(
    harmonizeDiscountClaims("Kostenlose Beratung. 20% Rabatt für Neukunden."),
    "Kostenlose Beratung. Preise mit * inkl. 20 % Neukundenrabatt.",
  );
  assert.equal(
    harmonizeDiscountClaims("Skinbooster kosten ab 199,99 Euro mit 20% Rabatt für neue Kunden!"),
    "Skinbooster kosten ab 199,99 Euro – Preise mit * inkl. 20 % Neukundenrabatt.",
  );
  assert.equal(
    harmonizeDiscountClaims("erhaltet beide 15% Rabatt auf die nächste Behandlung"),
    "erhaltet beide 15% Rabatt auf die nächste Behandlung",
  );
});

test("Preisseite: Preise, Hero-Angebot, OPs regulaer", () => {
  const out = prepareAdsPricePage({
    slug: "skinbooster-preise",
    seo: { metaTitle: "Skinbooster ab 199,99 € | MY" },
    blocks: [
      {
        __component: "blocks.treatment-hero",
        text: "Beginnt ab 199,99 €. Entdecke unsere Preise.",
        treatment: null,
      },
      {
        __component: "blocks.trust-grid",
        items: [
          { content: [{ type: "paragraph", children: [{ type: "text", text: "ab 299,99€" }] }] },
          { pathKey: "schoenheitsoperationen/facelift", text: "ab 3.999,00 €" },
        ],
      },
    ],
  });
  const hero = out.blocks[0] as any;
  assert.equal(hero.treatment.priceInEuroCent, 19999);
  assert.equal(hero.text, "Beginnt ab 159,99 €*. Entdecke unsere Preise.");
  assert.equal(out.seo.metaTitle, "Skinbooster ab 159,99 €* | MY");
  const grid = out.blocks[1] as any;
  assert.equal(grid.items[0].content[0].children[0].text, "ab 239,99 €*");
  assert.equal(grid.items[1].text, "ab 3.999,00 €");
});

test("botox-kosten: Hero mit Zonenangebot", () => {
  const out = prepareAdsPricePage({
    slug: "botox-kosten",
    blocks: [
      { __component: "blocks.treatment-hero", treatment: { priceInEuroCent: 14999, isStartingPrice: true } },
    ],
  });
  assert.equal((out.blocks[0] as any).treatmentPathKey, "muskelrelaxans");
});

test("andere Seiten bleiben unveraendert", () => {
  const input = { slug: "impressum", blocks: [{ text: "ab 149,99 €" }] };
  assert.equal(prepareAdsPricePage(input), input);
});
