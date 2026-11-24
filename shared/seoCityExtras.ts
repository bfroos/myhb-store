/**
 * E24 #346: lokale Ergaenzung fuer bestehende Stadtseiten (Benjamin,
 * 23.10.2026: "Seite behalten, ergaenzen").
 *
 * Anders als beim Lippen-Pilot (shared/seoPilotLippen.ts) bleibt die
 * Strapi-Seite unveraendert stehen - sie rankt schon und ist kein duenner
 * Klon (Botox Köln vs. Düsseldorf: Wortfolge-Aehnlichkeit 0,41). Unter
 * den Strapi-Bloecken kommt ein Abschnitt dazu, den es nur an diesem
 * Standort gibt: eigener Text mit Link zum Hub, naechster freier Termin
 * live, Parken/Barrierefreiheit/Einzugsgebiet aus den Standortfakten
 * (Strapi localFacts, sonst Code) und lokale Fragen. Die Fragen gehen ins
 * selbe FAQPage-Schema wie die Strapi-Fragen (nur eins je Seite).
 *
 * Regeln wie im Pilot: du-Form, keine Heilversprechen ("kann", "meist"),
 * keine Aerztenamen im Text, kein Neukundenrabatt, Preise nur ueber Links
 * (die Preise stehen in Strapi). Jeder Satz soll nur hier stimmen.
 */
import { SEO_CITY_LIPPEN, paragraphText, type SeoFaq, type SeoParagraph } from "./seoPilotLippen.ts";

export type SeoCityExtra = {
  /** "pathKey@stadt/standort" */
  key: string;
  pathKey: string;
  citySlug: string;
  locationSlug: string;
  /** Hub der Behandlung (bundesweite Seite). */
  hubPath: string;
  headline: string;
  intro: SeoParagraph[];
  /** Ueberschrift ueber Parken, Barrierefreiheit, Einzugsgebiet. */
  factsHeadline: string;
  faqHeadline: string;
  faqs: SeoFaq[];
};

const BOTOX_HUB = "/behandlungen/botox";
const BOTOX_KOSTEN = "/p/botox-kosten";

export const SEO_CITY_EXTRAS: Record<string, SeoCityExtra> = {
  "botox@koeln/koeln-arcaden": {
    key: "botox@koeln/koeln-arcaden",
    pathKey: "botox",
    citySlug: "koeln",
    locationSlug: "koeln-arcaden",
    hubPath: BOTOX_HUB,
    headline: "Botox in Köln-Kalk: kurz behandelt, abends geöffnet",
    intro: [
      [
        "Eine Faltenbehandlung mit Muskelrelaxans dauert bei uns meist nur 10 bis 20 Minuten. Deshalb passt sie gut in einen Besuch in den Köln Arcaden: Unsere Lounge liegt auf Ebene −1 zwischen dm und Apollo Optik, montags bis donnerstags haben wir bis 20 Uhr geöffnet, freitags und samstags wie das Center bis 21 Uhr. Praktisch, wenn du nach der Arbeit kommen möchtest: mit der Stadtbahn 1 oder 9 bis Kalk Post oder mit dem Auto ins Parkhaus der Arcaden.",
      ],
      [
        "Plane etwas Vorlauf ein, wenn du zu einem bestimmten Termin frisch aussehen möchtest, etwa zum Sessionsauftakt am 11.11., zu Weiberfastnacht oder zu einer Hochzeit: Die Wirkung setzt nach einigen Tagen ein und lässt sich nach etwa 10 bis 14 Tagen beurteilen. Komm deshalb lieber zwei bis drei Wochen vorher, dann bleibt Zeit für die ärztliche Kontrolle und, falls nötig, eine kleine Anpassung.",
      ],
      [
        "Was die Zonen kosten, steht unter ",
        { text: "Botox Kosten: Preise pro Zone", href: BOTOX_KOSTEN },
        ". Wie das Muskelrelaxans wirkt, für wen es nicht geeignet ist und welche Nebenwirkungen möglich sind, erklären wir ausführlich auf unserer Seite ",
        { text: "Botox-Behandlung beim Arzt", href: BOTOX_HUB },
        ".",
      ],
    ],
    factsHeadline: "Parken, Barrierefreiheit und Anreise aus dem Umland",
    faqHeadline: "Botox in den Köln Arcaden: Fragen zu Zeit und Anfahrt",
    faqs: [
      {
        question: "Kann ich mir in Köln nach Feierabend Botox spritzen lassen?",
        answer: [
          "Ja. Montags bis donnerstags haben wir in den Köln Arcaden bis 20 Uhr geöffnet, freitags und samstags bis 21 Uhr. Die Behandlung selbst dauert meist 10 bis 20 Minuten, für das ärztliche Gespräch vorher plane etwas zusätzliche Zeit ein. Ohne Termin geht es nach Verfügbarkeit.",
        ],
      },
      {
        question: "Wie lange vor Karneval oder einer Hochzeit sollte ich zur Botox-Behandlung kommen?",
        answer: [
          "Am besten zwei bis drei Wochen vorher. Die Wirkung setzt nach einigen Tagen ein und lässt sich nach etwa 10 bis 14 Tagen beurteilen. So bleibt Zeit für die ärztliche Kontrolle und eine eventuelle Anpassung vor dem großen Tag.",
        ],
      },
      {
        question: "Wo parke ich an den Köln Arcaden und was kostet das?",
        answer: [
          "Im Parkhaus der Köln Arcaden mit rund 1.800 Plätzen, Einfahrt über die Barcelona-Allee oder die Vietorstraße. Laut Center kosten die 1. und 2. Stunde je 1,00 €, jede weitere 1,50 €, höchstens 10,00 € am Tag. Bezahlt wird ohne Ticket über die Kennzeichenerkennung.",
        ],
      },
      {
        question: "Komme ich barrierefrei zu eurer Lounge in Kalk?",
        answer: [
          "Ja. Vom Parkhaus kommst du barrierefrei ins Center, Aufzüge fahren auf jede Ebene, auch auf Ebene −1 zu uns. Die Stadtbahn-Haltestelle Kalk Post ist ebenfalls barrierefrei.",
        ],
      },
    ],
  },
  "botox@duesseldorf/duesseldorf-arcaden": {
    key: "botox@duesseldorf/duesseldorf-arcaden",
    pathKey: "botox",
    citySlug: "duesseldorf",
    locationSlug: "duesseldorf-arcaden",
    hubPath: BOTOX_HUB,
    headline: "Botox in Düsseldorf-Bilk: direkt am S-Bahnhof, ohne langen Vorlauf",
    intro: [
      [
        "Unsere Lounge in den Düsseldorf Arcaden liegt in Bilk auf Ebene −1, gegenüber von ALDI. Der Bahnhof Düsseldorf-Bilk ist direkt vor dem Center: S8, S11 und S28, die Regionalzüge und die Stadtbahnen U71, U72, U73 und U83 halten dort. Aus dem Medienhafen, aus Unterbilk oder von der Uni bist du in wenigen Minuten da, aus Neuss oder Kaarst ohne Umsteigen. Mit dem Auto fährst du über die Bachstraße ins Parkhaus der Arcaden.",
      ],
      [
        "Montags bis samstags haben wir von 10 bis 20 Uhr geöffnet. Die Behandlung mit dem Muskelrelaxans selbst ist meist nach 10 bis 20 Minuten vorbei, dazu kommt das ärztliche Gespräch. Wenn du in der Mittagspause oder nach der Arbeit kommen willst, buch dir am besten vorher einen Termin; spontan geht es nach Verfügbarkeit.",
      ],
      [
        "Du willst zu Altweiber, zum Rosenmontagszug oder zu einer Hochzeit glatter aussehen? Dann komm zwei bis drei Wochen vorher. Die Wirkung baut sich über einige Tage auf, nach etwa 10 bis 14 Tagen siehst du das Ergebnis, und bis zum Termin bleibt Zeit für die Kontrolle. Die Preise pro Zone findest du unter ",
        { text: "Botox Kosten: Preise pro Zone", href: BOTOX_KOSTEN },
        ". Wirkung, Gegenanzeigen und mögliche Nebenwirkungen erklären wir auf der Seite ",
        { text: "Botox-Behandlung beim Arzt", href: BOTOX_HUB },
        ".",
      ],
    ],
    factsHeadline: "Parkhaus, Bahn und Anreise vom Niederrhein",
    faqHeadline: "Botox in den Düsseldorf Arcaden: Fragen zu Zeit und Anfahrt",
    faqs: [
      {
        question: "Wann habt ihr in den Düsseldorf Arcaden geöffnet?",
        answer: [
          "Montags bis samstags von 10 bis 20 Uhr, sonntags ist geschlossen. Für die Behandlung selbst rechne mit 10 bis 20 Minuten, das ärztliche Gespräch kommt dazu.",
        ],
      },
      {
        question: "Welche Bahn hält direkt bei euch in Bilk?",
        answer: [
          "Am Bahnhof Düsseldorf-Bilk direkt am Center halten die S-Bahnen S8, S11 und S28, die Regionalzüge RE 4, RE 6, RE 10 und RE 13 und die Stadtbahnen U71, U72, U73 und U83. Von dort sind es nur wenige Schritte bis zu uns auf Ebene −1.",
        ],
      },
      {
        question: "Was kostet das Parken an den Düsseldorf Arcaden?",
        answer: [
          "Das Parkhaus hat über 800 Plätze, die Einfahrt liegt an der Bachstraße (Navi: Bachstraße 141). Laut Center kostet jede angefangene Stunde 1,60 €, höchstens 13,00 € am Tag. Die Einfahrt ist höchstens 2 m hoch.",
        ],
      },
      {
        question: "Wie lange vor Altweiber oder einer Hochzeit sollte ich kommen?",
        answer: [
          "Zwei bis drei Wochen vorher ist ideal. Nach etwa 10 bis 14 Tagen lässt sich das Ergebnis beurteilen, und falls nötig, bleibt Zeit für eine kleine Anpassung.",
        ],
      },
    ],
  },
};

function normKey(pathKey: string | null | undefined): string {
  return String(pathKey ?? "").replace(/^\/+|\/+$/g, "");
}

/** Lokale Ergaenzung fuer diese Stadtseite oder null. */
export function seoCityExtra(
  pathKey: string | null | undefined,
  citySlug: string | null | undefined,
  locationSlug: string | null | undefined,
): SeoCityExtra | null {
  return SEO_CITY_EXTRAS[`${normKey(pathKey)}@${citySlug}/${locationSlug}`] ?? null;
}

/**
 * Standortfakten aus dem Code (Lippen-Pilot), die fuer alle Behandlungen
 * gelten: Parken, Barrierefreiheit, Einzugsgebiet, Quelle. Die Seite legt
 * Strapi-localFacts darueber (applyLocalFacts).
 */
export function cityFactsBase(citySlug: string, locationSlug: string) {
  return SEO_CITY_LIPPEN[`${citySlug}/${locationSlug}`] ?? null;
}

/** Fragen als Strapi-Rich-Text fuer das gemeinsame FAQPage-Schema. */
export function extraFaqsForSchema(extra: SeoCityExtra | null) {
  return (extra?.faqs ?? []).map((f) => ({
    question: f.question,
    answer: [{ type: "paragraph", children: [{ type: "text", text: paragraphText(f.answer) }] }],
  }));
}

/** Eigener Text des Abschnitts (Einleitung + Fragen), fuer den Aehnlichkeitstest. */
export function extraOwnText(extra: SeoCityExtra): string {
  return [
    extra.headline,
    ...extra.intro.map(paragraphText),
    ...extra.faqs.flatMap((f) => [f.question, paragraphText(f.answer)]),
  ].join(" ");
}
