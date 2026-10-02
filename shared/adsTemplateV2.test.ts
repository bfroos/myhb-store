import { test } from "node:test";
import assert from "node:assert/strict";
import {
  adsV2Faqs,
  adsV2PriceCards,
  adsV2Steps,
  adsV2TrustItems,
  isAdsTemplateV2Page,
  isAdsTemplateV2LivePage,
  isAdsTemplateV2Location,
  isAdsTemplateV2Excluded,
  adsV2PriceMode,
  adsV2ProductNote,
  ADS_TEMPLATE_V2_LOCATIONS,
  ADS_TEMPLATE_V2_EXCLUDE,
  ADS_TEMPLATE_V2_PAGES,
  ADS_TEMPLATE_V2_TREATMENTS,
  isAdsTemplateV2PreviewPath,
  stripAdsTemplateV2Preview,
  openingHoursSummary,
  pickAdsV2Doctors,
  pickAdsV2Reviews,
  shortenText,
  ADS_V2_CTA,
  ADS_V2_PAYMENT_NOTE,
  adsV2VoucherUrl,
  adsV2Design,
  isAdsV2DesktopLayout,
} from "./adsTemplateV2.ts";
import {
  adsClipAllowed,
  adsClipEntries,
  adsClipIsShort,
  adsClipsFor,
  heroObjectPositionY,
} from "./adsClips.ts";
import { adsV2ContentKeys } from "./adsTemplateV2Content.ts";

test("Vorlage v2: 9 Standorte x 39 Behandlungen, live ohne -rabatt", () => {
  assert.equal(ADS_TEMPLATE_V2_LOCATIONS.length, 9);
  assert.equal(ADS_TEMPLATE_V2_TREATMENTS.length, 39);
  assert.equal(ADS_TEMPLATE_V2_PAGES.length, 351);
  assert.equal(isAdsTemplateV2Page("koeln", "koeln-arcaden", "muskelrelaxans/stirnfalte"), true);
  assert.equal(isAdsTemplateV2Page("koeln", "koeln-arcaden", "muskelrelaxans/stirnfalte-rabatt"), true);
  assert.equal(isAdsTemplateV2Page("koeln", "koeln-arcaden", "muskelrelaxans/zornesfalte"), true);
  assert.equal(isAdsTemplateV2Page("berlin", "gesundbrunnencenter", "muskelrelaxans/stirnfalte"), true);
  assert.equal(isAdsTemplateV2Page("duisburg", "forum", "infusionen/vitamin-c-infusion"), true);
  assert.equal(isAdsTemplateV2Page("leipzig", "hoefe-am-bruehl", "anti-haarausfall/prp-haartherapie"), true);
  // nicht beworben bzw. andere Standorte
  assert.equal(isAdsTemplateV2Page("koeln", "mediapark-klinik", "hyaluron/lippen-aufspritzen"), false);
  assert.equal(isAdsTemplateV2Page("koblenz", "loehr-center", "hyaluron/lippen-aufspritzen"), false);
  assert.equal(isAdsTemplateV2Page("koeln", "koeln-arcaden", "fettwegspritze"), false);
  assert.equal(isAdsTemplateV2Page("koeln", "koeln-arcaden", "muskelrelaxans"), false);
  assert.equal(isAdsTemplateV2Page("koeln", "koeln-arcaden", "muskelrelaxans/migraenebehandlung"), false);
  // echte Seiten: ohne -rabatt, mit Notschalter
  assert.equal(isAdsTemplateV2LivePage("koeln", "koeln-arcaden", "muskelrelaxans/stirnfalte"), true);
  assert.equal(isAdsTemplateV2LivePage("koeln", "koeln-arcaden", "muskelrelaxans/lachfalten"), true);
  assert.equal(isAdsTemplateV2LivePage("koeln", "koeln-arcaden", "muskelrelaxans/stirnfalte-rabatt"), false);
  assert.equal(isAdsTemplateV2LivePage("koeln", "koeln-arcaden", "muskelrelaxans/stirnfalte", ADS_TEMPLATE_V2_PAGES, false), false);
});

test("Ausnahme: Profhilo Duesseldorf Arcaden zeigt die Strapi-Fassung", () => {
  assert.deepEqual([...ADS_TEMPLATE_V2_EXCLUDE], ["duesseldorf/duesseldorf-arcaden/skinbooster/profhilo"]);
  // echte Seite: nicht v2 (auch mit Schraegstrichen)
  assert.equal(isAdsTemplateV2LivePage("duesseldorf", "duesseldorf-arcaden", "skinbooster/profhilo"), false);
  assert.equal(isAdsTemplateV2LivePage("duesseldorf", "duesseldorf-arcaden", "/skinbooster/profhilo/"), false);
  // Vorschau behaelt v2 zum Vergleich
  assert.equal(isAdsTemplateV2Page("duesseldorf", "duesseldorf-arcaden", "skinbooster/profhilo"), true);
  // Profhilo an anderen Standorten und andere Duesseldorfer Seiten bleiben v2
  assert.equal(isAdsTemplateV2LivePage("koeln", "koeln-arcaden", "skinbooster/profhilo"), true);
  assert.equal(isAdsTemplateV2LivePage("berlin", "gesundbrunnencenter", "skinbooster/profhilo"), true);
  assert.equal(isAdsTemplateV2LivePage("duesseldorf", "duesseldorf-arcaden", "skinbooster/lumi-eyes-polynukleotide"), true);
  assert.equal(isAdsTemplateV2LivePage("duesseldorf", "duesseldorf-arcaden", "muskelrelaxans/stirnfalte"), true);
  // Standort hat weiter v2-Seiten (Zusatzdaten-Endpunkt)
  assert.equal(isAdsTemplateV2Location("duesseldorf", "duesseldorf-arcaden"), true);
  assert.equal(isAdsTemplateV2Excluded("duesseldorf", "duesseldorf-arcaden", "skinbooster/profhilo"), true);
  assert.equal(isAdsTemplateV2Excluded("koeln", "koeln-arcaden", "skinbooster/profhilo"), false);
  assert.equal(isAdsTemplateV2Excluded("duesseldorf", "duesseldorf-arcaden", "skinbooster/profhilo-rabatt"), false);
  // Ausnahmeliste ist ueberschreibbar
  assert.equal(isAdsTemplateV2LivePage("duesseldorf", "duesseldorf-arcaden", "skinbooster/profhilo", ADS_TEMPLATE_V2_PAGES, true, []), true);
});

test("Jede v2-Behandlung hat Inhalte", () => {
  assert.deepEqual([...ADS_TEMPLATE_V2_TREATMENTS].sort(), adsV2ContentKeys().sort());
});

test("Preiskarten je Behandlung passend zum Hero-Preis", () => {
  const mrProducts = {
    priceInEuroCent: 34999,
    isStartingPrice: true,
    products: [{ variants: [
      { slug: "1-zone", priceInEuroCent: 14999 },
      { slug: "2-zonen", priceInEuroCent: 19999 },
      { slug: "masseter", priceInEuroCent: 34999 },
      { slug: "bruxismus", priceInEuroCent: 34999 },
    ] }],
  };
  assert.deepEqual(adsV2PriceCards("muskelrelaxans/masseter", mrProducts).map((c) => [c.label, c.regular]), [["Behandlung", "regulär 349,99 €"]]);
  // Lippenkorrektur haengt an Muskelrelaxans-Zonen -> nur Grundpreis
  const korr = adsV2PriceCards("hyaluron/lippenkorrektur", { ...mrProducts, priceInEuroCent: 34999 });
  assert.deepEqual(korr.map((c) => [c.label, c.offer]), [["Behandlung", "ab 279,99 €*"]]);
  // Nasolabialfalte: zwei "1,0 ml" mit verschiedenen Preisen -> nur Grundpreis
  const naso = adsV2PriceCards("hyaluron/nasolabialfalte", {
    priceInEuroCent: 19999,
    isStartingPrice: true,
    products: [{ variants: [{ slug: "1-0-ml", priceInEuroCent: 29999 }, { slug: "0-5-ml", priceInEuroCent: 14999 }] }],
  });
  assert.deepEqual(naso.map((c) => c.regular), ["regulär ab 199,99 €"]);
  assert.equal(adsV2PriceMode("muskelrelaxans/lipflip"), "zones");
  assert.equal(adsV2PriceMode("infusionen/relax-infusion"), "base");
});

test("Zufriedenheitsgarantie fuer alle Kategorien, Text je Kategorie; Hersteller nur wo freigegeben", () => {
  const g = (k: string) => adsV2TrustItems(k).find((i) => i.key === "garantie")?.text ?? "";
  // Reihenfolge nach der Google-Bewertung: Garantie, Aerzt:innen, ohne Termin
  assert.deepEqual(adsV2TrustItems("hyaluron/jawline").map((i) => i.key), ["garantie", "aerzte", "walkin"]);
  assert.equal(g("muskelrelaxans/stirnfalte"), "Kostenlose Nachkontrolle nach 14 Tagen inkl. kostenloser Nachbehandlung");
  assert.match(g("hyaluron/lippen-aufspritzen"), /Korrekturen der Form inklusive – zusätzliches Volumen \(weitere ml\) wird nach Preisliste berechnet/);
  for (const k of ["infusionen/vitamin-c-infusion", "skinbooster/profhilo", "skinbooster/vampir-lifting-prp", "anti-haarausfall/mesotherapie-haare", "hyaluron/hylase"]) {
    assert.equal(g(k), "Kostenlose Nachkontrolle und Beratung innerhalb von 14 Tagen", k);
  }
  assert.ok(adsV2TrustItems("infusionen/relax-infusion").some((i) => i.text === "Behandlung nur durch Ärztinnen und Ärzte"));
  assert.match(ADS_V2_PAYMENT_NOTE, /Gutschein.*Klarna oder PayPal in Raten/);
  assert.equal(
    adsV2VoucherUrl("hyaluron/lippen-aufspritzen-rabatt", "berlin"),
    "https://shop.myhealthandbeauty.com/products/myh-b-geschenkgutschein?utm_source=go&utm_medium=landingpage&utm_campaign=gutschein_raten&utm_content=lippen-aufspritzen-berlin",
  );
  // Botox-Sonde: der Shop-Link nennt das Wort nie
  assert.doesNotMatch(adsV2VoucherUrl("botox/3-zonen-botox", "koeln"), /botox|btx|botulinum/i);
  assert.equal(adsV2ProductNote("hyaluron/hylase"), null);
  assert.match(String(adsV2ProductNote("hyaluron/jawline")), /Aliaxin/);
  assert.match(String(adsV2ProductNote("skinbooster/profhilo")), /Profhilo/);
  assert.equal(adsV2ProductNote("skinbooster/polynukleotide-lachssperma"), null);
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
    for (const clip of [...set.heroes, ...set.carousel, ...(set.feedback ?? [])]) {
      assert.equal(adsClipAllowed(clip), true, clip!.url);
    }
  }
  assert.equal(adsClipAllowed({ mediaId: 273, url: "https://m/neutral.mp4" }), false);
  assert.equal(adsClipAllowed({ url: "https://m/Botox_x.mp4" }), false);
  assert.equal(adsClipsFor("muskelrelaxans/stirnfalte").hero?.url, "/videos/go/hero-stirn-zornesfalte-7s.mp4");
  assert.equal(adsClipsFor("hyaluron/lippen-aufspritzen").hero?.url, "/videos/go/hero-lippen-8s.mp4");
  assert.equal(adsClipsFor("hyaluron/lippen-aufspritzen").hero?.posterUrl, "/videos/go/hero-lippen-8s-poster.jpg");
  assert.deepEqual(adsClipsFor("nix/da"), { carousel: [], feedback: [] });
});

test("Hero-Clip nur vermessen und ohne fremden Stadtnamen, fuer jede Behandlung", () => {
  for (const [key, set] of adsClipEntries()) {
    for (const h of set.heroes) assert.equal(typeof h.focusY, "number", `${key}: Hero nicht vermessen`);
  }
  // Jawline-Hero zeigt "KÖLN", Kinn-Hero "KAISERSLAUTERN": dort der Stadtclip,
  // sonst ein neutraler
  assert.equal(adsClipsFor("hyaluron/jawline", "koeln").hero?.url, "/videos/go/hero-jaw-1.mp4");
  assert.equal(adsClipsFor("hyaluron/jawline", "berlin").hero?.url, "/videos/go/fio-jawline-1-hero-6s.mp4");
  assert.equal(adsClipsFor("hyaluron/kinnkorrektur", "kaiserslautern").hero?.url, "/videos/go/hero-kinn-1.mp4");
  assert.equal(adsClipsFor("hyaluron/kinnkorrektur", "koeln").hero?.url, "/videos/go/fio-jawline-2-hero-6s.mp4");
  assert.equal(adsClipsFor("skinbooster/profhilo", "koeln").hero?.url, "/videos/go/hero-profhilo-7s.mp4");
  assert.equal(adsClipsFor("muskelrelaxans/barbie-muskelrelaxans", "berlin").hero?.url, "/videos/go/fio-barbie-1-hero-7s.mp4");
  for (const city of ["aachen", "berlin", "duesseldorf", "duisburg", "kaiserslautern", "koeln", "leipzig", "moenchengladbach", "recklinghausen"]) {
    for (const [key] of adsClipEntries()) assert.ok(adsClipsFor(key, city).hero, `${key} ${city}: kein Hero-Clip`);
  }
});

test("Kundenfeedback: nur passende Stadt, nichts doppelt zum Karussell", () => {
  const fb = (key: string, city: string) => adsClipsFor(key, city).feedback.map((c) => c.source);
  assert.deepEqual(fb("muskelrelaxans/browlift", "koeln"), [801, 874, 266, 862]);
  assert.deepEqual(fb("muskelrelaxans/browlift", "berlin"), [874, 266, 862]);
  // 266 laeuft auf der Stirnfalte schon im Karussell
  assert.deepEqual(fb("muskelrelaxans/stirnfalte", "recklinghausen"), [802, 874, 862]);
  assert.deepEqual(fb("hyaluron/lippen-aufspritzen", "berlin"), ["fio-lippen-2"]);
  assert.deepEqual(fb("skinbooster/vampir-lifting-prp", "leipzig"), [808]);
  assert.deepEqual(fb("skinbooster/vampir-lifting-prp", "berlin"), []);
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
  // Stirnfalte: Clips aus Benjamins Zuordnung (stirn), Koeln-Clip nur in Koeln
  const src = (key: string, city: string) =>
    adsClipsFor(key, city).carousel.map((c) => c.source);
  assert.deepEqual(src("muskelrelaxans/stirnfalte", "koeln"), [209, 831, 839, 843, 1080, 266]);
  assert.deepEqual(src("muskelrelaxans/stirnfalte", "berlin"), [209, 831, 839, 843, 266]);
  const lippenKoeln = adsClipsFor("hyaluron/lippen-aufspritzen", "koeln").carousel;
  assert.deepEqual(lippenKoeln.map((c) => c.source), [857, 854, 1046, 1073]);
  assert.ok(lippenKoeln.every((c) => !/leipzig|kaiserslautern/i.test(`${c.url} ${c.caption}`)));
  // Leipzig-Clip nur auf Leipziger Seiten
  assert.deepEqual(src("hyaluron/lippen-aufspritzen", "leipzig"), [857, 854, 221, 1046, 1073]);
  for (const [key, set] of adsClipEntries()) {
    for (const c of set.carousel) {
      assert.ok(adsClipIsShort(c) || !!c.posterUrl, `${c.url}: volles Video braucht ein Poster`);
      if (!/masseter|bruxismus/.test(key)) {
        assert.ok(!/masseter/i.test(c.url), `${key}: kein Masseter-Clip`);
      }
    }
  }
  assert.equal(adsClipIsShort({ url: "/videos/go/hero-lippen-8s.mp4" }), true);
  assert.equal(adsClipIsShort({ url: "https://media.myhealthandbeauty.app/Lippen_1.mp4" }), false);
});

test("Hero-Ausschnitt: Untertitel ganz drin oder ganz draussen", () => {
  const sizes: Array<[number, number]> = [
    [284, 98], [312, 130], [336, 199], [353, 384], [398, 420], [700, 400], [560, 620],
  ];
  for (const [key, set] of adsClipEntries()) for (const hero of set.heroes) {
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
  assert.equal(isAdsTemplateV2Location("berlin", "gesundbrunnencenter"), true);
  assert.equal(isAdsTemplateV2Location("koblenz", "loehr-center"), false);
});

test("adsV2Design: CI-Gestaltung nur fuer Lippen und Profhilo Koeln Arcaden", () => {
  assert.equal(adsV2Design("koeln", "koeln-arcaden", "hyaluron/lippen-aufspritzen"), "ci-rot");
  assert.equal(adsV2Design("koeln", "koeln-arcaden", "skinbooster/profhilo"), "ci-rot");
  assert.equal(adsV2Design("duesseldorf", "duesseldorf-arcaden", "skinbooster/profhilo"), "v2");
  // "-rabatt"-Variante und fuehrende/abschliessende Schraegstriche: dieselbe Seite
  assert.equal(adsV2Design("koeln", "koeln-arcaden", "/hyaluron/lippen-aufspritzen-rabatt/"), "ci-rot");
  assert.equal(adsV2Design("koeln", "koeln-arcaden", "hyaluron/lippenkorrektur"), "v2");
  assert.equal(adsV2Design("berlin", "gesundbrunnencenter", "hyaluron/lippen-aufspritzen"), "v2");
  assert.equal(adsV2Design(null, "koeln-arcaden", "hyaluron/lippen-aufspritzen"), "v2");
  // Ausrollen per Muster
  const all = [["*/*/*", "ci-hell"]] as const;
  assert.equal(adsV2Design("aachen", "aquis-plaza", "skinbooster/profhilo", all), "ci-hell");
  const first = [["koeln/*/hyaluron/*", "ci"], ["*/*/*", "v2"]] as const;
  assert.equal(adsV2Design("koeln", "koeln-arcaden", "hyaluron/jawline", first), "ci");
  assert.equal(adsV2Design("aachen", "aquis-plaza", "hyaluron/jawline", first), "v2");
});

test("isAdsV2DesktopLayout: zunaechst nur Lippen und Profhilo Koeln Arcaden", () => {
  assert.equal(isAdsV2DesktopLayout("koeln", "koeln-arcaden", "hyaluron/lippen-aufspritzen"), true);
  assert.equal(isAdsV2DesktopLayout("koeln", "koeln-arcaden", "/skinbooster/profhilo/"), true);
  assert.equal(isAdsV2DesktopLayout("duesseldorf", "duesseldorf-arcaden", "skinbooster/profhilo"), false);
  assert.equal(isAdsV2DesktopLayout("koeln", "koeln-arcaden", "hyaluron/lippenkorrektur"), false);
  assert.equal(isAdsV2DesktopLayout("aachen", "aquis-plaza", "hyaluron/jawline", ["*/*/*"]), true);
});

test("ADS_LOUNGE_GALLERY: nur Bilder ohne Sperrbegriff/Sperrdatei, Koeln vorerst unbestaetigt", async () => {
  const { ADS_LOUNGE_GALLERY, adsLoungeGalleryFor } = await import("./adsClips.ts");
  const { isBlockedAdsImageFile } = await import("./adsMedia.ts");
  for (const [loc, g] of Object.entries(ADS_LOUNGE_GALLERY)) {
    assert.ok(g.images.length > 0, loc);
    for (const img of g.images) {
      assert.equal(isBlockedAdsImageFile(img), false, `${loc} ${img.url}`);
      assert.doesNotMatch(img.url, /botox|btx/i);
    }
  }
  // Koeln unbestaetigt: neutrale Galerie (ohne Ortsnamen), 114/79 zuerst
  assert.equal(ADS_LOUNGE_GALLERY["koeln-arcaden"]?.confirmed, false);
  const koeln = adsLoungeGalleryFor("koeln-arcaden");
  assert.equal(koeln.own, false);
  assert.deepEqual(koeln.images.slice(0, 2).map((i) => i.id), [114, 79]);
  assert.equal(koeln.images.length, 7);
  // Duesseldorf: sicher eigene Fotos
  assert.equal(adsLoungeGalleryFor("duesseldorf-arcaden").own, true);
  // Standort ohne Eintrag: nur die allgemeinen, neutral
  const forum = adsLoungeGalleryFor("forum");
  assert.equal(forum.own, false);
  assert.equal(forum.images.length, 5);
});
