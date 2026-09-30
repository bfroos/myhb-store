import { test } from "node:test";
import assert from "node:assert/strict";
import { mapAdsLink, rewriteAdsLinksDeep, rewriteAdsLinksInText } from "./adsLinks.ts";

const ctx = {
  locationBase: "/standorte/koeln/koeln-arcaden",
  availablePathKeys: ["hyaluron/lippen-aufspritzen", "hyaluron/jawline", "muskelrelaxans"],
};

test("www-Links werden relativ", () => {
  assert.equal(mapAdsLink("https://www.myhealthandbeauty.com/"), "/");
  assert.equal(mapAdsLink("https://www.myhealthandbeauty.com"), "/");
  assert.equal(
    mapAdsLink("https://www.myhealthandbeauty.com/standorte/koeln/koeln-arcaden/hyaluron/lippen-aufspritzen"),
    "/standorte/koeln/koeln-arcaden/hyaluron/lippen-aufspritzen",
  );
  assert.equal(mapAdsLink("https://myhealthandbeauty.com/preise#x"), "/preise#x");
});

test("Fremde und relative Links bleiben ohne Standortkontext", () => {
  assert.equal(mapAdsLink("https://calendly.com/koeln-arcaden"), "https://calendly.com/koeln-arcaden");
  assert.equal(mapAdsLink("tel:0221"), "tel:0221");
  assert.equal(mapAdsLink("/behandlungen/hyaluron"), "/behandlungen/hyaluron");
  assert.equal(mapAdsLink("https://go.myhealthandbeauty.com/x"), "https://go.myhealthandbeauty.com/x");
});

test("Standortseite: ortlose Querlinks auf denselben Standort, sonst weg", () => {
  assert.equal(
    mapAdsLink("/behandlungen/hyaluron/jawline", ctx),
    "/standorte/koeln/koeln-arcaden/hyaluron/jawline",
  );
  assert.equal(
    mapAdsLink("https://www.myhealthandbeauty.com/behandlungen/hyaluron/lippen-aufspritzen/", ctx),
    "/standorte/koeln/koeln-arcaden/hyaluron/lippen-aufspritzen",
  );
  assert.equal(mapAdsLink("/behandlungen/schoenheitsoperationen/fettabsaugung", ctx), null);
});

test("Markdown und HTML", () => {
  assert.equal(
    rewriteAdsLinksInText("Mehr [hier](https://www.myhealthandbeauty.com/) lesen", ctx),
    "Mehr [hier](/) lesen",
  );
  assert.equal(
    rewriteAdsLinksInText('Siehe <a href="/behandlungen/wangenaufbau" target="_blank">Wangen</a>.', ctx),
    "Siehe Wangen.",
  );
  assert.equal(
    rewriteAdsLinksInText("[Jawline](/behandlungen/hyaluron/jawline)", ctx),
    "[Jawline](/standorte/koeln/koeln-arcaden/hyaluron/jawline)",
  );
});

test("Strapi-Blocks, Buttons, Medien, Canonical", () => {
  const input = {
    content: [
      {
        type: "paragraph",
        children: [
          { type: "text", text: "Zur " },
          { type: "link", url: "https://www.myhealthandbeauty.com/behandlungen/schoenheitsoperationen/fettabsaugung", children: [{ type: "text", text: "Fettabsaugung" }] },
          { type: "link", url: "https://www.myhealthandbeauty.com/", children: [{ type: "text", text: "Start" }] },
        ],
      },
    ],
    button: { label: "x", url: "/behandlungen/infusionen" },
    image: { url: "https://www.myhealthandbeauty.com/a.jpg", mime: "image/jpeg" },
    seo: { canonicalUrl: "https://www.myhealthandbeauty.com/behandlungen/hyaluron" },
  };
  const out = rewriteAdsLinksDeep(input, ctx);
  const children = out.content[0]!.children as any[];
  assert.deepEqual(children[1], { type: "text", text: "Fettabsaugung" });
  assert.equal(children[2].url, "/");
  assert.equal(out.button.url, "/standorte/koeln/koeln-arcaden");
  assert.equal(out.image.url, "https://www.myhealthandbeauty.com/a.jpg");
  assert.equal(out.seo.canonicalUrl, "https://www.myhealthandbeauty.com/behandlungen/hyaluron");
});

test("#199: Blog-Links weg, Botox-Adressen auf Muskelrelaxans, Aachen-Lippenseite ersetzt", () => {
  const adsPathKeys = new Set(["muskelrelaxans", "muskelrelaxans/zornesfalte", "hyaluron", "anti-haarausfall/prp-haartherapie"]);
  assert.equal(mapAdsLink("/blog"), null);
  assert.equal(mapAdsLink("https://www.myhealthandbeauty.com/blog/c/botox"), null);
  assert.equal(mapAdsLink("/produkte/botox/botox"), "/behandlungen/muskelrelaxans");
  assert.equal(mapAdsLink("/p/botox-kosten"), "/preise");
  assert.equal(mapAdsLink("/behandlungen/botox/zornesfalte", { adsPathKeys }), "/behandlungen/muskelrelaxans/zornesfalte");
  assert.equal(mapAdsLink("/behandlungen/botox/3-zonen-botox-preise", { adsPathKeys }), "/behandlungen/muskelrelaxans");
  assert.equal(
    mapAdsLink("/aachen/lip-filler/#booking"),
    "/standorte/aachen/aquis-plaza/hyaluron/lippen-aufspritzen#booking",
  );
  // Standortseite: Botox-Querlink auf dieselbe Muskelrelaxans-Seite am Standort
  assert.equal(
    mapAdsLink("/behandlungen/botox", ctx),
    "/standorte/koeln/koeln-arcaden/muskelrelaxans",
  );
});

test("#199: Links auf Behandlungen, die es auf go. nicht gibt", () => {
  const adsPathKeys = new Set(["hyaluron", "hyaluron/lippen-aufspritzen", "anti-haarausfall/prp-haartherapie"]);
  const c = { adsPathKeys };
  assert.equal(mapAdsLink("/behandlungen/hyaluron", c), "/behandlungen/hyaluron");
  assert.equal(mapAdsLink("/behandlungen/prp-haartherapie", c), "/behandlungen/anti-haarausfall/prp-haartherapie");
  assert.equal(mapAdsLink("/behandlungen/hyaluron/russian-lips", c), null);
  assert.equal(mapAdsLink("/standorte/duesseldorf/duesseldorf-arcaden/hyaluron/russian-lips", c), null);
  assert.equal(
    mapAdsLink("/standorte/duesseldorf/duesseldorf-arcaden/hyaluron/lippen-aufspritzen", c),
    "/standorte/duesseldorf/duesseldorf-arcaden/hyaluron/lippen-aufspritzen",
  );
  assert.equal(mapAdsLink("/standorte/duesseldorf/duesseldorf-arcaden", c), "/standorte/duesseldorf/duesseldorf-arcaden");
  assert.equal(
    rewriteAdsLinksInText('wie <a href="/behandlungen/hyaluron/russian-lips">Russian Lips</a> und [Blog](/blog)', c),
    "wie Russian Lips und Blog",
  );
  const out = rewriteAdsLinksDeep({ button: { url: "/blog" } }, c);
  assert.equal(out.button.url, "/behandlungen");
});
