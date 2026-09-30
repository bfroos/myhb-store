import { test } from "node:test";
import assert from "node:assert/strict";
import {
  adsV2Faqs,
  adsV2PriceCards,
  adsV2Steps,
  adsV2TrustItems,
  isAdsTemplateV2Page,
  isAdsTemplateV2Location,
  isAdsTemplateV2PreviewPath,
  stripAdsTemplateV2Preview,
  openingHoursSummary,
  pickAdsV2Doctors,
  pickAdsV2Reviews,
  shortenText,
  ADS_V2_CTA,
  ADS_V2_PAYMENT_NOTE,
} from "./adsTemplateV2.ts";
import {
  adsClipAllowed,
  adsClipEntries,
  adsClipIsShort,
  adsClipsFor,
  heroObjectPositionY,
} from "./adsClips.ts";

test("Vorlage v2 nur auf den zwei Musterseiten", () => {
  assert.equal(isAdsTemplateV2Page("koeln", "koeln-arcaden", "muskelrelaxans/stirnfalte"), true);
  assert.equal(isAdsTemplateV2Page("koeln", "koeln-arcaden", "muskelrelaxans/stirnfalte-rabatt"), true);
  assert.equal(isAdsTemplateV2Page("koeln", "koeln-arcaden", "hyaluron/lippen-aufspritzen"), true);
  assert.equal(isAdsTemplateV2Page("koeln", "koeln-arcaden", "muskelrelaxans/zornesfalte"), false);
  assert.equal(isAdsTemplateV2Page("berlin", "gesundbrunnencenter", "muskelrelaxans/stirnfalte"), false);
  assert.equal(isAdsTemplateV2Page("koeln", "mediapark-klinik", "hyaluron/lippen-aufspritzen"), false);
});

test("Platzhalter fuer die spaetere Erweiterung, OPs nie", () => {
  const all = ["*/*/*"];
  assert.equal(isAdsTemplateV2Page("berlin", "x", "hyaluron/lippen-aufspritzen", all), true);
  assert.equal(isAdsTemplateV2Page("berlin", "x", "schoenheitsoperationen/facelift", all), false);
  const hy = ["*/*/hyaluron/*"];
  assert.equal(isAdsTemplateV2Page("a", "b", "hyaluron/nasolabialfalte", hy), true);
  assert.equal(isAdsTemplateV2Page("a", "b", "muskelrelaxans/stirnfalte", hy), false);
});

const RESTRICTED = /botox|btx|botulinum|ärztlich geprüft|kostenlos absagen|stornier/i;

test("Code-Texte ohne Markennamen und ohne gesperrte Aussagen", () => {
  const texts = [
    ADS_V2_CTA.primary,
    ADS_V2_CTA.sticky,
    ADS_V2_PAYMENT_NOTE,
    ...adsV2TrustItems().flatMap((t) => [t.title, t.text ?? ""]),
    ...["muskelrelaxans/stirnfalte", "hyaluron/lippen-aufspritzen", "skinbooster/profhilo", "x/y"].flatMap(
      (k) => [
        ...adsV2Steps(k).flatMap((s) => [s.title, s.text]),
        ...adsV2Faqs(k).flatMap((f) => [f.question, f.answer]),
      ],
    ),
  ];
  for (const t of texts) assert.doesNotMatch(t, RESTRICTED, t);
  assert.equal(adsV2Faqs("hyaluron/lippen-aufspritzen").length, 5);
  assert.match(adsV2Faqs("hyaluron/lippen-aufspritzen")[4]!.answer, /Aliaxin® \(IBSA\)/);
  assert.doesNotMatch(adsV2Faqs("muskelrelaxans/stirnfalte").map((f) => f.answer).join(" "), /®/);
});

test("Ablauf nimmt kurze Strapi-Dauer, sonst die der Kategorie", () => {
  assert.equal(adsV2Steps("muskelrelaxans/stirnfalte", "20-30 Minuten")[1]!.title, "Behandlung in 20–30 Minuten");
  assert.equal(
    adsV2Steps("hyaluron/lippen-aufspritzen", "Die Behandlung dauert etwa 30-45 Minuten, inklusive Beratung.")[1]!.title,
    "Behandlung in 30–45 Minuten",
  );
});

test("Preiskarten: Zonen 1-3 mit Neukundenpreis, Lippen in ml", () => {
  const zones = adsV2PriceCards("muskelrelaxans/stirnfalte", {
    products: [
      {
        variants: [
          { slug: "1-zone", priceInEuroCent: 14999 },
          { slug: "2-zonen", priceInEuroCent: 19999 },
          { slug: "3-zonen", priceInEuroCent: 29999 },
          { slug: "4-zonen", priceInEuroCent: 39999 },
          { slug: "masseter", priceInEuroCent: 34999 },
        ],
      },
    ],
  });
  assert.deepEqual(zones.map((c) => [c.label, c.offer, c.regular]), [
    ["1 Zone", "119,99 €*", "regulär 149,99 €"],
    ["2 Zonen", "159,99 €*", "regulär 199,99 €"],
    ["3 Zonen", "239,99 €*", "regulär 299,99 €"],
  ]);
  assert.equal(zones[1]!.note, "79,99 € je Zone");
  const lips = adsV2PriceCards("hyaluron/lippen-aufspritzen", {
    products: [{ variants: [{ slug: "1-0-ml", priceInEuroCent: 19999 }, { slug: "0-5-ml", priceInEuroCent: 14999 }] }],
  });
  assert.deepEqual(lips.map((c) => c.label), ["0,5 ml", "1,0 ml"]);
  assert.equal(lips.some((c) => c.isPackage), false);
});

test("Bewertungen: kein Markenname, keine andere Stadt, Behandlung zuerst", () => {
  const long = " Alles war sehr freundlich und professionell, ich komme gerne wieder.";
  const picked = pickAdsV2Reviews(
    [
      { id: 1, rating: 5, text: "Botox war super." + long },
      { id: 2, rating: 5, text: "Ich war in Aachen." + long },
      { id: 3, rating: 5, text: "Tolles Team." + long },
      { id: 4, rating: 5, text: "Meine Stirnfalte ist weg." + long },
      { id: 5, rating: 4, text: "Gut." + long },
    ],
    "Köln",
    "muskelrelaxans/stirnfalte",
  );
  assert.deepEqual(picked.map((r) => r.id), [4, 3]);
  assert.ok(shortenText("a ".repeat(200), 50).length <= 52);
});

test("Aerzt:innen des Centers, Chefarzt aller Center nach hinten", () => {
  const loc = (n: number) => Array.from({ length: n }, (_, i) => ({ slug: i === 0 ? "koeln-arcaden" : `x${i}` }));
  const picked = pickAdsV2Doctors(
    [
      { firstName: "A", lastName: "Chef", employeeType: "doctor", photo: {}, locations: loc(15) },
      { firstName: "B", lastName: "Hidden", employeeType: "doctor", photo: {}, hideFromPublic: true, locations: loc(1) },
      { firstName: "C", lastName: "Lokal", employeeType: "doctor", photo: {}, locations: loc(1) },
      { firstName: "D", lastName: "Ohne Foto", employeeType: "doctor", locations: loc(1) },
    ],
    "koeln-arcaden",
  );
  assert.deepEqual(picked.map((e) => e.lastName), ["Lokal", "Chef"]);
});

test("Oeffnungszeiten zusammengefasst", () => {
  const d = (day: string, closes: string | null) => ({
    day,
    closed: closes === null,
    intervals: closes ? [{ opens: "10:00", closes }] : [],
  });
  assert.equal(
    openingHoursSummary([
      d("monday", "20:00"), d("tuesday", "20:00"), d("wednesday", "20:00"), d("thursday", "20:00"),
      d("friday", "21:00"), d("saturday", "21:00"), d("sunday", null),
    ]),
    "Mo–Do 10–20 Uhr · Fr–Sa 10–21 Uhr · So geschlossen",
  );
});

test("Clips: nur ungesperrte, Hero-Clip nur wo tauglich", () => {
  for (const [, set] of adsClipEntries()) {
    for (const clip of [set.hero, ...set.carousel].filter(Boolean)) {
      assert.equal(adsClipAllowed(clip), true, clip!.url);
    }
  }
  assert.equal(adsClipAllowed({ mediaId: 273, url: "https://m/neutral.mp4" }), false);
  assert.equal(adsClipAllowed({ url: "https://m/Botox_x.mp4" }), false);
  assert.equal(adsClipsFor("muskelrelaxans/stirnfalte").hero?.url, "/videos/go/hero-stirn-zornesfalte-7s.mp4");
  assert.equal(adsClipsFor("hyaluron/lippen-aufspritzen").hero?.url, "/videos/go/hero-lippen-8s.mp4");
  assert.equal(adsClipsFor("hyaluron/lippen-aufspritzen").hero?.posterUrl, "/videos/go/hero-lippen-8s-poster.jpg");
  assert.deepEqual(adsClipsFor("nix/da"), { carousel: [] });
});

test("Bewertungen: doppelte Eintraege nur einmal", () => {
  const t = "Alle Mitarbeiter sowie besonders die Aerztin waren aeusserst freundlich, Behandlung mit Hyaluron.";
  const picked = pickAdsV2Reviews(
    [
      { author: "Heike S.", text: t, rating: 5 },
      { author: "Heike S.", text: `${t} `, rating: 5 },
      { author: "Anna", text: "Sehr angenehme Atmosphaere, kompetente Aerztin, Lippen mit Hyaluron top.", rating: 5 },
    ] as any,
    "Köln",
    "hyaluron/lippen-aufspritzen",
  );
  assert.equal(picked.length, 2);
});

test("Karussell: nur passende Clips ohne fremden Stadtnamen, volle Videos nur mit Poster", () => {
  // Stirnfalte: kein passender Clip (807 = Masseter, Leipzig) -> Abschnitt aus
  assert.deepEqual(adsClipsFor("muskelrelaxans/stirnfalte", "koeln").carousel, []);
  const lippenKoeln = adsClipsFor("hyaluron/lippen-aufspritzen", "koeln").carousel;
  assert.deepEqual(lippenKoeln.map((c) => c.mediaId), [547, 546]);
  assert.ok(lippenKoeln.every((c) => !/leipzig|kaiserslautern/i.test(`${c.url} ${c.caption}`)));
  // Kaiserslautern-Clip nur auf Kaiserslauterer Seiten
  assert.deepEqual(
    adsClipsFor("hyaluron/lippen-aufspritzen", "kaiserslautern").carousel.map((c) => c.mediaId),
    [547, 806, 546],
  );
  for (const [, set] of adsClipEntries()) {
    for (const c of set.carousel) {
      assert.ok(adsClipIsShort(c) || !!c.posterUrl, `${c.url}: volles Video braucht ein Poster`);
      assert.ok(!/807|masseter/i.test(c.url), "kein Masseter-Clip im Karussell");
    }
  }
  assert.equal(adsClipIsShort({ url: "/videos/go/hero-lippen-8s.mp4" }), true);
  assert.equal(adsClipIsShort({ url: "https://media.myhealthandbeauty.app/Lippen_1.mp4" }), false);
});

test("Hero-Ausschnitt: Untertitel ganz drin oder ganz draussen", () => {
  const sizes: Array<[number, number]> = [
    [284, 98], [312, 130], [336, 199], [353, 384], [398, 420], [700, 400], [560, 620],
  ];
  for (const key of ["hyaluron/lippen-aufspritzen", "muskelrelaxans/stirnfalte"]) {
    const hero = adsClipsFor(key, "koeln").hero!;
    assert.ok(hero.captionZones?.length, key);
    for (const [w, h] of sizes) {
      const p = heroObjectPositionY(w, h, hero) / 100;
      const r = h / (w / (hero.aspect ?? 9 / 16));
      if (r >= 1) continue;
      const top = p * (1 - r);
      const bottom = top + r;
      for (const [a, z] of hero.captionZones!) {
        const outside = bottom <= a + 0.002 || top >= z - 0.002;
        const inside = top <= a + 0.002 && bottom >= z - 0.002;
        assert.ok(outside || inside, `${key} ${w}x${h}: Zone ${a}-${z} angeschnitten (${top.toFixed(3)}-${bottom.toFixed(3)})`);
      }
    }
  }
  // iPhone SE (Karte 336 x 199): Lippen-Ausschnitt endet ueber den Untertiteln
  // und zeigt die Lippen (53-66 %).
  const lippen = adsClipsFor("hyaluron/lippen-aufspritzen").hero!;
  const r = 199 / (336 * 16 / 9);
  const top = (heroObjectPositionY(336, 199, lippen) / 100) * (1 - r);
  assert.ok(top + r <= 0.685 && top + r >= 0.64, `Ende ${(top + r).toFixed(3)}`);
  // ohne Zonen: Fokus mittig
  assert.equal(heroObjectPositionY(336, 199, { focusY: 0.5 }), 50);
  assert.equal(heroObjectPositionY(0, 0, { focusY: 0.3 }), 30);
});

test("Vorschau nur unter /vorschau-v2, Canonical auf die echte Seite", () => {
  const real = "/standorte/koeln/koeln-arcaden/hyaluron/lippen-aufspritzen";
  assert.equal(isAdsTemplateV2PreviewPath(real), false);
  assert.equal(isAdsTemplateV2PreviewPath(`/vorschau-v2${real}`), true);
  assert.equal(isAdsTemplateV2PreviewPath(`/en/vorschau-v2${real}`), true);
  assert.equal(stripAdsTemplateV2Preview(`/vorschau-v2${real}`), real);
  assert.equal(stripAdsTemplateV2Preview(`/en/vorschau-v2${real}`), `/en${real}`);
  assert.equal(stripAdsTemplateV2Preview(real), real);
  assert.equal(stripAdsTemplateV2Preview("/p/vorschau-v2-x"), "/p/vorschau-v2-x");
  assert.equal(isAdsTemplateV2Location("koeln", "koeln-arcaden"), true);
  assert.equal(isAdsTemplateV2Location("berlin", "gesundbrunnencenter"), false);
});
