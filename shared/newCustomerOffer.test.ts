/**
 * Neukundenpreis fuer go.* (Ads-Modus). Laeuft mit `npm run test:unit`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyNewCustomerPricesDeep,
  applyNewCustomerPricesToText,
  buildNewCustomerOffer,
  discountedExactCent,
  isZoneOfferPath,
  newCustomerPriceCent,
  newCustomerPriceLabel,
} from "./newCustomerOffer.ts";

test("Regel: x 0,8, auf ,99 abrunden (Beispiele von Benjamin)", () => {
  const cases: [number, number][] = [
    [14999, 11999],
    [19999, 15999],
    [29999, 23999],
    [22999, 18399],
    [34999, 27999],
    [49999, 39999],
    [5999, 4799],
    [6999, 5599],
    [7999, 6399],
    [8999, 7199],
    [39999, 31999],
    [84999, 67999],
  ];
  for (const [regular, expected] of cases) {
    assert.equal(newCustomerPriceCent(regular), expected, `${regular}`);
  }
});

test("Rundung liegt nie ueber dem exakten Rabattpreis und hoechstens 1 Cent darunter", () => {
  // Alle realen Preise enden auf 4,99 oder 9,99 (x 0,8 -> ...3,992 / ...7,992).
  for (let euros = 14; euros <= 1000; euros += 5) {
    const cent = euros * 100 + 99;
    const nk = newCustomerPriceCent(cent)!;
    const exact = discountedExactCent(cent, 20);
    assert.ok(nk <= exact, `${cent}`);
    assert.ok(exact - nk < 1, `${cent}: ${exact - nk}`);
    assert.equal(nk % 100, 99);
  }
});

test("Preise, bei denen ,99 nicht passt, bekommen keinen Neukundenpreis", () => {
  assert.equal(newCustomerPriceCent(1099), null); // 8,792 -> 7,99 waere 80 ct daneben
});

test("Preise auf ,00 (Schoenheits-OPs) bekommen keinen Neukundenpreis", () => {
  assert.equal(newCustomerPriceCent(129900), null); // 1.039,20 -> 1.038,99 waere 21 ct daneben
  assert.equal(newCustomerPriceCent(499900), null);
  assert.equal(
    buildNewCustomerOffer({
      pathKey: "schoenheitsoperationen/fettabsaugung",
      priceCent: 129900,
      isStartingPrice: true,
    }),
    null,
  );
});

test("Ohne Preis kein Angebot", () => {
  assert.equal(newCustomerPriceCent(undefined), null);
  assert.equal(newCustomerPriceCent(0), null);
  assert.equal(buildNewCustomerOffer({ pathKey: "hyaluron", priceCent: null }), null);
});

test("Zonenangebot Muskelrelaxans: 2 Zonen 199,99 - 20 % = 159,99 -> 79,99 je Zone", () => {
  const offer = buildNewCustomerOffer({
    pathKey: "muskelrelaxans/stirnfalte",
    priceCent: 14999,
    isStartingPrice: true,
    twoZonePriceCent: 19999,
  })!;
  assert.equal(offer.kind, "zone");
  assert.equal(offer.priceCent, 7999);
  assert.equal(offer.headline, "Neukunden: ab 79,99 € pro Zone*");
  assert.equal(offer.regular, "regulär ab 149,99 € (1 Zone)");
  assert.equal(
    offer.footnote2,
    "Alle anderen mit * markierten Preise auf dieser Seite inkl. 20 % Neukundenrabatt.",
  );
  assert.equal(
    offer.calculation,
    "2 Zonen 199,99 € − 20 % Neukundenrabatt = 159,99 € (79,99 € je Zone)",
  );
  assert.equal(offer.heroLine, "ab 79,99 € pro Zone*");
  assert.equal(
    offer.pageFootnote,
    "*Neukundenpreise inkl. 20 % Neukundenrabatt. „ab 79,99 € pro Zone“ gilt ab zwei Zonen (2 Zonen 159,99 € statt 199,99 €), regulär ab 149,99 € (1 Zone).",
  );
  assert.doesNotMatch(Object.values(offer).join(" "), /genau|79,995/);
  assert.equal(
    offer.footnote,
    "*Gilt ab zwei Zonen Muskelrelaxans in Kombination mit dem 20-%-Neukundenrabatt.",
  );
});

test("Zonenangebot auch auf -rabatt-Seiten und der Grundseite (ohne Variante)", () => {
  for (const pathKey of [
    "muskelrelaxans",
    "muskelrelaxans/zornesfalte",
    "muskelrelaxans/lachfalten-rabatt",
    "muskelrelaxans/kraehenfuesse-rabatt",
  ]) {
    const offer = buildNewCustomerOffer({
      pathKey,
      priceCent: 14999,
      isStartingPrice: true,
    })!;
    assert.equal(offer.kind, "zone", pathKey);
    assert.equal(offer.priceCent, 7999, pathKey);
  }
});

test("Masseter/Bruxismus/Hyperhidrose/Migraene: normaler Neukundenpreis, kein Zonenangebot", () => {
  for (const pathKey of [
    "muskelrelaxans/masseter",
    "muskelrelaxans/masseter-rabatt",
    "muskelrelaxans/zaehneknirschen-bruxismus-rabatt",
    "muskelrelaxans/hyperhidrose-starkes-schwitzen",
    "muskelrelaxans/migraenebehandlung",
    "muskelrelaxans/migraenebehandlung-rabatt",
  ]) {
    assert.equal(isZoneOfferPath(pathKey), false, pathKey);
  }
  const migraene = buildNewCustomerOffer({
    pathKey: "muskelrelaxans/migraenebehandlung",
    priceCent: 14999,
    isStartingPrice: true,
  })!;
  assert.equal(migraene.kind, "price");
  assert.equal(migraene.headline, "Neukunden ab 119,99 €*");
});

test("Muskelrelaxans mit anderem ab-Preis (Barbie 199,99): normaler Neukundenpreis", () => {
  const offer = buildNewCustomerOffer({
    pathKey: "muskelrelaxans/barbie-muskelrelaxans",
    priceCent: 19999,
    isStartingPrice: true,
    twoZonePriceCent: 19999,
  })!;
  assert.equal(offer.kind, "price");
  assert.equal(offer.headline, "Neukunden ab 159,99 €*");
});

test("Allgemeiner Neukundenpreis mit regulaerem Preis und Fussnote", () => {
  const offer = buildNewCustomerOffer({
    pathKey: "hyaluron/lippen-aufspritzen",
    priceCent: 14999,
    isStartingPrice: true,
  })!;
  assert.deepEqual(offer, {
    kind: "price",
    regular: "regulär ab 149,99 €",
    headline: "Neukunden ab 119,99 €*",
    heroLine: "Neukunden ab 119,99 €*",
    footnote: "*inkl. 20 % Neukundenrabatt",
    pageFootnote: "*Neukundenpreise inkl. 20 % Neukundenrabatt, regulär ab 149,99 €.",
    priceCent: 11999,
  });
  const fix = buildNewCustomerOffer({ pathKey: "x", priceCent: 22999, isStartingPrice: false })!;
  assert.equal(fix.headline, "Neukunden 183,99 €*");
});

test("Kein 'Botox' in irgendeinem Angebotstext", () => {
  const offer = buildNewCustomerOffer({ pathKey: "muskelrelaxans", priceCent: 14999, isStartingPrice: true })!;
  assert.doesNotMatch(Object.values(offer).join(" "), /botox|botulinum/i);
});

test("Fliesstext: Preise werden zum Neukundenpreis mit Sternchen", () => {
  const cases: [string, string][] = [
    ["1-Zone     149,99 €", "1-Zone     119,99 €*"],
    ["2-Zonen  199,99 €", "2-Zonen  159,99 €*"],
    ["Stirnfalten glätten ab 149,99€", "Stirnfalten glätten ab 119,99 €*"],
    ["0,5 ml ab 149,99 €", "0,5 ml ab 119,99 €*"],
    ["Polynukleotide ab 229,99 €", "Polynukleotide ab 183,99 €*"],
    ["Hyaluron ab 149€ ✨", "Hyaluron ab 119,99 €* ✨"],
    ["Full Face schon 849€ 💎", "Full Face schon 679,99 €* 💎"],
    ["Vitamin C ab 69€", "Vitamin C ab 55,99 €*"],
  ];
  for (const [input, expected] of cases) {
    assert.equal(applyNewCustomerPricesToText(input), expected, input);
  }
});

test("Fliesstext: bleibt unveraendert, wo die Regel nicht passt", () => {
  for (const input of [
    "ab 1.299,00 €", // ,00-Preis: 21 ct daneben
    "Spare 30 €",
    "bereits 119,99 €* umgestellt",
    "0,5 ml Hyaluron",
    "Ab 1.500 €",
  ]) {
    assert.equal(applyNewCustomerPricesToText(input), input, input);
  }
});

test("Strapi-Antwort: Texte umgestellt, URLs/Zahlen/OPs unberuehrt", () => {
  const input = {
    data: {
      treatmentPage: {
        pathKey: "muskelrelaxans/stirnfalte",
        seo: {
          metaTitle: "Stirnfalte ab 149,99€",
          canonicalUrl: "https://x/149,99€",
        },
        treatment: { priceInEuroCent: 14999 },
        about: {
          content: [
            { type: "paragraph", children: [{ type: "text", text: "2-Zonen  199,99 €" }] },
          ],
        },
        relatedTreatments: {
          treatmentAdsPages: [
            { pathKey: "hyaluron/jawline", hero: { headlineSuffix: "ab 199,99 €" } },
            {
              pathKey: "schoenheitsoperationen/facelift",
              hero: { headlineSuffix: "ab 3.999€" },
            },
          ],
        },
      },
    },
  };
  const out = applyNewCustomerPricesDeep(input);
  const tp = out.data.treatmentPage;
  assert.equal(tp.seo.metaTitle, "Stirnfalte ab 119,99 €*");
  assert.equal(tp.seo.canonicalUrl, "https://x/149,99€");
  assert.equal(tp.treatment.priceInEuroCent, 14999);
  assert.equal(tp.about.content[0].children[0].text, "2-Zonen  159,99 €*");
  assert.equal(
    tp.relatedTreatments.treatmentAdsPages[0].hero.headlineSuffix,
    "ab 159,99 €*",
  );
  assert.equal(
    tp.relatedTreatments.treatmentAdsPages[1].hero.headlineSuffix,
    "ab 3.999€",
  );
});

test("Label fuer Zahlenpreise", () => {
  assert.equal(newCustomerPriceLabel(14999, "ab"), "ab 119,99 €*");
  assert.equal(newCustomerPriceLabel(22999), "183,99 €*");
  assert.equal(newCustomerPriceLabel(129900, "ab"), null);
});

test("Strapi-Fassung fuer go.: Saetze mit Neukunden-Preis bleiben (kein doppelter Rabatt)", () => {
  const opts = { keepNewCustomerSentences: true };
  assert.equal(
    applyNewCustomerPricesToText("Neukunden ab 239,99 € ·inkl. 20 % Neukundenrabatt", 20, opts),
    "Neukunden ab 239,99 € ·inkl. 20 % Neukundenrabatt",
  );
  assert.equal(
    applyNewCustomerPricesToText(
      "Bei MY startet Profhilo für Neukunden bei 239,99 € statt regulär 299,99 €. Ein Termin kostet ab 299,99 €.",
      20,
      opts,
    ),
    "Bei MY startet Profhilo für Neukunden bei 239,99 € statt regulär 299,99 €. Ein Termin kostet ab 239,99 €*.",
  );
  // Hero-Zusatz der Duesseldorfer Profhilo-Seite: "inkl." beendet keinen Satz
  assert.equal(
    applyNewCustomerPricesToText("ab 239,99 € ·inkl. 20 % Neukundenrabatt", 20, opts),
    "ab 239,99 € ·inkl. 20 % Neukundenrabatt",
  );
  assert.equal(
    applyNewCustomerPricesToText("*Neukundenpreise inkl. 20 % Neukundenrabatt, regulär ab 1.299,99 €.", 20, opts),
    "*Neukundenpreise inkl. 20 % Neukundenrabatt, regulär ab 1.299,99 €.",
  );
  // ohne Neukunden-Bezug wie bisher; ohne Option wie bisher
  assert.equal(applyNewCustomerPricesToText("Browlift ab 99,99 € pro Zone", 20, opts), "Browlift ab 79,99 €* pro Zone");
  assert.equal(applyNewCustomerPricesToText("Neukunden ab 239,99 €"), "Neukunden ab 191,99 €*");
  const deep = applyNewCustomerPricesDeep({ a: "Neukunden ab 239,99 €", b: "ab 299,99 €", url: "/x-299,99 €" }, 20, opts);
  assert.deepEqual(deep, { a: "Neukunden ab 239,99 €", b: "ab 239,99 €*", url: "/x-299,99 €" });
});
