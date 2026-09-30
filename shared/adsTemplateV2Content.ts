/**
 * go.* Seitenvorlage v2: Inhalte je Behandlung (Glowtox-Punkte 1-8,
 * Benjamin 30.09.2026). Reine Code-Konfiguration ohne Vue, damit sie testbar
 * bleibt und die Seite nur noch darstellt:
 *
 *  1. Steckbrief (Dauer, erste Wirkung, Endergebnis, Haltbarkeit, Betaeubung,
 *     Ausfallzeit) direkt unter der Vertrauenszeile
 *  2. Zonenbild mit Einstichpunkten (public/images/go/zonen/*.svg)
 *  3. Behandlungsbegriff in jeder H2
 *  4. Unterzeile als Gefuehl, ohne Heilversprechen
 *  5. Zeitachse im Ablauf (Tag 0 / 3-7 / 14 / Auffrischen)
 *  6. FAQ mit 7 Fragen (Nebenwirkungen offen) + Nachsorge
 *  7. "Weitere Zonen"-Kacheln (Muskelrelaxans)
 *  8. Platz fuer ein Beratungsfoto (leer = Abschnitt aus)
 *
 * Regeln: kein Markenname des Muskelrelaxans, kein Vorher/Nachher, kein
 * "kostenlos absagen", kein "aerztlich geprueft", keine Pakete.
 */
import { adsV2Category, adsV2ProductNote } from "./adsTemplateV2.ts";

function baseKey(pathKey: string | null | undefined): string {
  return String(pathKey ?? "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/-rabatt$/, "");
}

// ---------------------------------------------------------------- Begriffe

export type AdsV2Terms = {
  /** "Stirnfalten-Behandlung" - fuer "So laeuft deine … ab" */
  treatment: string;
  /** "die Stirnfalte" - fuer "Preise für …" */
  object: string;
  /** "zur Stirnfalte" - fuer "Häufige Fragen …" */
  about: string;
  /** Unterzeile im Hero (Gefuehl, kein Heilversprechen) */
  subline: string;
  /** Kurzname fuer Kacheln/Ueberschriften, z. B. "Stirnfalte" */
  label: string;
  /** Zonenbild (public/images/go/zonen/zone-<zone>.svg) */
  zone?: AdsV2Zone;
  /** Kurztext "So wirkt es" neben dem Zonenbild */
  howItWorks: string;
};

export type AdsV2Zone = "stirn" | "zornesfalte" | "kraehenfuesse" | "browlift" | "lippen";

const MR_HOW =
  "Ein Muskelrelaxans entspannt gezielt den Muskel, der die Falte macht. Die Haut darüber glättet sich, deine Mimik bleibt.";

const TERMS: Record<string, AdsV2Terms> = {
  "muskelrelaxans/stirnfalte": {
    label: "Stirnfalte",
    treatment: "Stirnfalten-Behandlung",
    object: "die Stirnfalte",
    about: "zur Stirnfalte",
    subline: "Entspannter, frischer Blick – ärztlich, ohne Ausfallzeit",
    zone: "stirn",
    howItWorks: `${MR_HOW} Gesetzt wird an wenigen Punkten in einer Reihe über den Augenbrauen.`,
  },
  "muskelrelaxans/zornesfalte": {
    label: "Zornesfalte",
    treatment: "Zornesfalten-Behandlung",
    object: "die Zornesfalte",
    about: "zur Zornesfalte",
    subline: "Entspannter Blick zwischen den Brauen – ärztlich, ohne Ausfallzeit",
    zone: "zornesfalte",
    howItWorks: `${MR_HOW} Gesetzt wird an wenigen Punkten zwischen und über den inneren Augenbrauen.`,
  },
  "muskelrelaxans/kraehenfuesse": {
    label: "Krähenfüße",
    treatment: "Krähenfüße-Behandlung",
    object: "die Krähenfüße",
    about: "zu Krähenfüßen",
    subline: "Wacher, frischer Blick um die Augen – ärztlich, ohne Ausfallzeit",
    zone: "kraehenfuesse",
    howItWorks: `${MR_HOW} Gesetzt wird an je drei Punkten seitlich der Augen.`,
  },
  "muskelrelaxans/browlift": {
    label: "Browlift",
    treatment: "Browlift-Behandlung",
    object: "den Browlift",
    about: "zum Browlift",
    subline: "Offener, wacher Blick – ärztlich, ohne Ausfallzeit",
    zone: "browlift",
    howItWorks: `${MR_HOW} So kann sich die Augenbraue sanft anheben.`,
  },
  "hyaluron/lippen-aufspritzen": {
    label: "Lippen",
    treatment: "Lippenbehandlung",
    object: "Lippen aufspritzen",
    about: "zum Lippen aufspritzen",
    subline: "Weiche, natürlich betonte Lippen – ärztlich und behutsam",
    zone: "lippen",
    howItWorks:
      "Hyaluron ist ein körpereigener Stoff, der Feuchtigkeit bindet. Behutsam an Kontur und Lippenkörper gesetzt, betont es Form und Volumen.",
  },
};

/** Begriffe der Behandlung; null = Seite ohne v2-Inhalte (alte Texte). */
export function adsV2Terms(pathKey: string | null | undefined): AdsV2Terms | null {
  return TERMS[baseKey(pathKey)] ?? null;
}

export function adsV2ZoneImage(zone: AdsV2Zone | undefined): { src: string; alt: string } | null {
  if (!zone) return null;
  const alt: Record<AdsV2Zone, string> = {
    stirn: "Schema: fünf Einstichpunkte in einer Reihe über den Augenbrauen",
    zornesfalte: "Schema: fünf Einstichpunkte zwischen und über den inneren Augenbrauen",
    kraehenfuesse: "Schema: je drei Einstichpunkte fächerförmig seitlich der Augen",
    browlift: "Schema: je zwei Einstichpunkte am äußeren Ende der Augenbrauen",
    lippen: "Schema: Punkte entlang der Lippenkontur und im Lippenkörper",
  };
  return { src: `/images/go/zonen/zone-${zone}.svg`, alt: alt[zone] };
}

/** Ueberschriften (Punkt 3), Standort-Name eingesetzt. */
export function adsV2Headings(terms: AdsV2Terms, locationName: string) {
  const at = locationName ? ` in ${locationName}` : "";
  return {
    facts: `${terms.label} auf einen Blick`,
    how: `So wirkt die ${terms.treatment}`,
    clips: `So sieht die ${terms.treatment} aus`,
    steps: `So läuft deine ${terms.treatment} ab`,
    prices: `Preise für ${terms.object}${at}`,
    zones: `${terms.label} + weitere Zonen`,
    doctors: `Dein Ärzteteam für ${terms.object}${at}`,
    consult: `Deine Beratung ${terms.about}`,
    reviews: `Vor deiner ${terms.treatment}: das sagen Kundinnen und Kunden`,
    faq: `Häufige Fragen ${terms.about}`,
    aftercare: `Nach deiner ${terms.treatment}`,
    location: `Deine ${terms.treatment}${at}: so findest du uns`,
    final: `Bereit für deine ${terms.treatment}?`,
  };
}

// ---------------------------------------------------------------- 1. Steckbrief

export type AdsV2Fact = { key: string; label: string; value: string };

function shortDuration(value: string | null | undefined, fallback: string): string {
  const m = /^\s*(\d+)\s*[-–]\s*(\d+)\s*Minuten\s*$/i.exec(value ?? "");
  return m ? `${m[1]}–${m[2]} Minuten` : fallback;
}

export function adsV2Facts(
  pathKey: string | null | undefined,
  strapiDuration?: string | null,
): AdsV2Fact[] {
  const cat = adsV2Category(pathKey);
  if (!adsV2Terms(pathKey)) return [];
  if (cat === "muskelrelaxans") {
    return [
      { key: "dauer", label: "Dauer", value: shortDuration(strapiDuration, "20–30 Minuten") },
      { key: "wirkung", label: "Erste Wirkung", value: "nach 3–7 Tagen" },
      { key: "ergebnis", label: "Endergebnis", value: "nach 14 Tagen" },
      { key: "haltbarkeit", label: "Haltbarkeit", value: "ca. 3–4 Monate" },
      { key: "betaeubung", label: "Betäubung", value: "Kühlung oder Betäubungscreme auf Wunsch" },
      { key: "ausfall", label: "Ausfallzeit", value: "keine" },
    ];
  }
  if (cat === "hyaluron") {
    return [
      { key: "dauer", label: "Dauer", value: shortDuration(strapiDuration, "30–45 Minuten") },
      { key: "wirkung", label: "Erste Wirkung", value: "sofort sichtbar" },
      { key: "ergebnis", label: "Endergebnis", value: "nach Abklingen der Schwellung, ca. 1–2 Wochen" },
      { key: "haltbarkeit", label: "Haltbarkeit", value: "ca. 6–12 Monate" },
      { key: "betaeubung", label: "Betäubung", value: "Betäubungscreme, auf Wunsch Kühlung" },
      { key: "ausfall", label: "Ausfallzeit", value: "keine (leichte Schwellung möglich)" },
    ];
  }
  return [];
}

// ---------------------------------------------------------------- 5. Zeitachse

export type AdsV2TimelineItem = { when: string; title: string; text: string };

export function adsV2Timeline(pathKey: string | null | undefined): AdsV2TimelineItem[] {
  const cat = adsV2Category(pathKey);
  if (!adsV2Terms(pathKey)) return [];
  const control = {
    when: "Tag 14",
    title: "Kostenlose Nachkontrolle",
    text: "Wir prüfen das Ergebnis und behandeln bei Bedarf kostenlos nach (Zufriedenheitsgarantie).",
  };
  if (cat === "muskelrelaxans") {
    return [
      {
        when: "Tag 0",
        title: "Beratung und Behandlung",
        text: "Ärztliche Beratung zu deiner Mimik, dann wenige feine Pikser – du kannst direkt weitermachen.",
      },
      { when: "Tag 3–7", title: "Erste Wirkung", text: "Die Falte wird nach und nach weicher." },
      control,
      { when: "nach ca. 4 Monaten", title: "Auffrischen", text: "Die Wirkung lässt langsam nach. Wenn du magst, frischen wir auf." },
    ];
  }
  if (cat === "hyaluron") {
    return [
      {
        when: "Tag 0",
        title: "Beratung und Behandlung",
        text: "Ihr besprecht Wunsch und Menge. Nach der Betäubung wird das Hyaluron behutsam gesetzt – das Ergebnis siehst du sofort.",
      },
      { when: "Tag 1–7", title: "Schwellung klingt ab", text: "Leichte Schwellungen sind normal und gehen meist nach wenigen Tagen zurück." },
      control,
      { when: "nach ca. 6–12 Monaten", title: "Auffrischen", text: "Der Körper baut Hyaluron langsam ab. Wenn du magst, frischen wir auf." },
    ];
  }
  return [];
}

// ---------------------------------------------------------------- 6. FAQ + Nachsorge

export type AdsV2FaqItem = { question: string; answer: string };

const WHO =
  "Ausschließlich Ärztinnen und Ärzte. Sie beraten dich vorher und sagen dir ehrlich, wenn eine Behandlung nicht zu dir passt.";
const GUARANTEE =
  "Innerhalb von 14 Tagen gibt es eine kostenlose ärztliche Nachkontrolle, bei Bedarf mit Nachbehandlung.";
const DIFFERENCE =
  "Ein Muskelrelaxans entspannt den Muskel hinter Mimikfalten wie Stirn- oder Zornesfalte. Hyaluron füllt Volumen auf, etwa an den Lippen. Was zu dir passt, klärt die Beratung.";

export function adsV2FaqsV2(pathKey: string | null | undefined): AdsV2FaqItem[] {
  const cat = adsV2Category(pathKey);
  if (!adsV2Terms(pathKey)) return [];
  if (cat === "muskelrelaxans") {
    return [
      {
        question: "Tut das weh?",
        answer: "Die meisten spüren nur kurze Pikser. Es wird mit sehr feinen Nadeln gearbeitet, auf Wunsch wird vorher gekühlt oder betäubt.",
      },
      {
        question: "Sieht das natürlich aus?",
        answer: "Ziel ist ein entspannter Ausdruck, kein starres Gesicht. Die Menge wird an deine Mimik angepasst – lieber behutsam starten und bei der Nachkontrolle ergänzen.",
      },
      {
        question: "Wann wirkt es und wie lange hält es?",
        answer: "Erste Wirkung nach 3–7 Tagen, das Endergebnis nach etwa 14 Tagen. Meist hält es 3–4 Monate.",
      },
      {
        question: "Welche Nebenwirkungen kann es geben?",
        answer: "Möglich sind eine leichte Rötung oder ein kleiner blauer Fleck, meist nach wenigen Tagen weg. Selten wird das Ergebnis ungleichmäßig oder ein Lid hängt leicht – das bildet sich von selbst zurück. Über alle Risiken klärt dich die Ärztin oder der Arzt vorher auf.",
      },
      {
        question: "Lässt sich das rückgängig machen?",
        answer: "Die Wirkung lässt nach einigen Monaten von selbst vollständig nach. Kleine Unterschiede gleichen wir bei der Nachkontrolle aus.",
      },
      { question: "Was, wenn es mir nicht gefällt?", answer: GUARANTEE },
      { question: "Muskelrelaxans oder Hyaluron – was ist der Unterschied?", answer: DIFFERENCE },
    ];
  }
  if (cat === "hyaluron") {
    return [
      {
        question: "Tut das weh?",
        answer: "Vorher wird betäubt. Die meisten spüren nur Druck und kurze Pikser.",
      },
      {
        question: "Sieht das natürlich aus?",
        answer: "Wir arbeiten mit kleinen Mengen und passend zu deinem Gesicht. Lieber behutsam starten – bei der Nachkontrolle kann ergänzt werden.",
      },
      {
        question: "Wann sehe ich das Ergebnis und wie lange hält es?",
        answer: "Sofort. Endgültig nach Abklingen der Schwellung, etwa nach 1–2 Wochen. Meist hält es 6–12 Monate.",
      },
      {
        question: "Welche Nebenwirkungen kann es geben?",
        answer: "In den ersten Tagen sind Schwellung, Rötung oder ein kleiner blauer Fleck normal. Selten entstehen kleine tastbare Knötchen – die behandeln wir bei der Nachkontrolle. Über alle Risiken klärt dich die Ärztin oder der Arzt vorher auf.",
      },
      {
        question: "Lässt sich das rückgängig machen?",
        answer: "Ja. Hyaluron lässt sich mit dem Enzym Hyaluronidase gezielt auflösen. Ohne Zutun baut der Körper es über Monate von selbst ab.",
      },
      { question: "Hyaluron oder Muskelrelaxans – was ist der Unterschied?", answer: DIFFERENCE },
      {
        question: "Welches Produkt wird verwendet – und wer behandelt?",
        answer: [adsV2ProductNote(pathKey), WHO].filter(Boolean).join(" "),
      },
    ];
  }
  return [];
}

export function adsV2Aftercare(pathKey: string | null | undefined): string[] {
  const cat = adsV2Category(pathKey);
  if (!adsV2Terms(pathKey)) return [];
  if (cat === "muskelrelaxans") {
    return [
      "24 Stunden kein Sport, keine Sauna, kein Solarium",
      "Die behandelten Stellen nicht massieren oder reiben",
      "4 Stunden aufrecht bleiben, nicht hinlegen",
      "Make-up frühestens nach einigen Stunden",
      "Leichte Rötungen sind normal und gehen schnell zurück",
    ];
  }
  if (cat === "hyaluron") {
    return [
      "24 Stunden kein Sport, keine Sauna, kein Solarium",
      "Die Lippen nicht massieren oder drücken",
      "Kühlen hilft gegen die Schwellung",
      "Lippenstift und Make-up frühestens nach einigen Stunden",
      "Heißes erst trinken, wenn die Betäubung abgeklungen ist",
      "Schwellung und Rötung sind normal und gehen nach wenigen Tagen zurück",
    ];
  }
  return [];
}

// ---------------------------------------------------------------- 7. Weitere Zonen

export type AdsV2ZoneTile = {
  key: string;
  label: string;
  href: string;
  image: { src: string; alt: string } | null;
};

const MR_ZONES: Array<{ slug: string; label: string; zone?: AdsV2Zone }> = [
  { slug: "stirnfalte", label: "Stirnfalte", zone: "stirn" },
  { slug: "zornesfalte", label: "Zornesfalte", zone: "zornesfalte" },
  { slug: "kraehenfuesse", label: "Krähenfüße", zone: "kraehenfuesse" },
  { slug: "browlift", label: "Browlift", zone: "browlift" },
];

/**
 * Kacheln der anderen Muskelrelaxans-Zonen desselben Standorts. Der Link
 * zeigt immer auf die echte go.-Seite (auch aus der Vorschau).
 */
export function adsV2ZoneTiles(
  pathKey: string | null | undefined,
  citySlug: string,
  locationSlug: string,
): AdsV2ZoneTile[] {
  const key = baseKey(pathKey);
  const [top, slug] = key.split("/");
  if (top !== "muskelrelaxans" || !MR_ZONES.some((z) => z.slug === slug)) return [];
  if (!citySlug || !locationSlug) return [];
  return MR_ZONES.filter((z) => z.slug !== slug).map((z) => ({
    key: z.slug,
    label: z.label,
    href: `/standorte/${citySlug}/${locationSlug}/muskelrelaxans/${z.slug}`,
    image: adsV2ZoneImage(z.zone),
  }));
}

/** "ab 2 Zonen 79,99 € pro Zone*" aus der guenstigsten Zonen-Notiz der Preiskarten. */
export function adsV2ZoneHint(cards: Array<{ note?: string }>): string | null {
  const values = cards
    .map((c) => /^([\d.]+,\d{2})\s€ je Zone$/.exec(c.note ?? "")?.[1])
    .filter((v): v is string => !!v)
    .sort((a, b) => Number(a.replace(/\./g, "").replace(",", ".")) - Number(b.replace(/\./g, "").replace(",", ".")));
  return values[0] ? `ab 2 Zonen ${values[0]} € pro Zone*` : null;
}

// ---------------------------------------------------------------- 8. Beratungsfoto

/**
 * Beratungsfoto je Behandlung (pathKey ohne "-rabatt"), zunaechst leer ->
 * Abschnitt ausgeblendet. Eintrag z. B.
 *   "muskelrelaxans/stirnfalte": { src: "/images/go/beratung-stirn.webp", alt: "…", width: 800, height: 600 }
 * Kein Vorher/Nachher, keine erkennbare Kundin ohne Einwilligung.
 */
export type AdsV2Photo = { src: string; alt: string; width: number; height: number };
export const ADS_V2_CONSULT_PHOTOS: Readonly<Record<string, AdsV2Photo>> = {};

export function adsV2ConsultPhoto(pathKey: string | null | undefined): AdsV2Photo | null {
  return ADS_V2_CONSULT_PHOTOS[baseKey(pathKey)] ?? null;
}
