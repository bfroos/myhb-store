/**
 * go.* Seitenvorlage v2: Inhalte je Behandlung (Glowtox-Punkte 1-8,
 * Benjamin 30.09.2026; ausgebaut auf alle beworbenen Behandlungen am
 * 01.10.2026). Reine Code-Konfiguration ohne Vue, damit sie testbar bleibt
 * und die Seite nur noch darstellt:
 *
 *  1. Steckbrief (Dauer, erste Wirkung, Endergebnis, Haltbarkeit, Betaeubung,
 *     Ausfallzeit) direkt unter der Vertrauenszeile
 *  2. Zonenbild mit Einstichpunkten (public/images/go/zonen/*.svg)
 *  3. Behandlungsbegriff in jeder H2
 *  4. Unterzeile als Gefuehl, ohne Heilversprechen
 *  5. Zeitachse im Ablauf (Tag 0 / erste Wirkung / Tag 14 / Auffrischen)
 *  6. FAQ mit 7 Fragen (Nebenwirkungen offen) + Nachsorge
 *  7. "Weitere Zonen/Behandlungen"-Kacheln
 *  8. Platz fuer ein Beratungsfoto (leer = Abschnitt aus)
 *
 * Aufbau: je Behandlungsart (`kind`) Standardtexte, je Behandlung ein
 * Eintrag in SPECS mit den Abweichungen (Dauer, Haltbarkeit, Wirkungseintritt,
 * besondere Nebenwirkungen, Nachsorge). Die Dauer kommt bevorzugt aus Strapi
 * ("20-30 Minuten"), sonst aus dem Eintrag.
 *
 * Regeln: kein Markenname des Muskelrelaxans, kein Vorher/Nachher, kein
 * "kostenlos absagen", kein "aerztlich geprueft", keine Pakete, keine
 * Heilversprechen (bei Infusionen keine Wirkversprechen, nur Ablauf).
 * Hersteller nur, wo Benjamin sie freigegeben hat (adsV2ProductNote).
 */
import { adsV2Guarantee, adsV2ProductNote } from "./adsTemplateV2.ts";
import { adsClipPostersFor } from "./adsClips.ts";

function baseKey(pathKey: string | null | undefined): string {
  return String(pathKey ?? "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/-rabatt$/, "");
}

// ---------------------------------------------------------------- Begriffe

/** Behandlungsart: bestimmt Standardtexte, Steckbrief und Zeitachse. */
export type AdsV2Kind =
  | "mr" // Muskelrelaxans
  | "hyaluron" // Hyaluron-Filler
  | "hylase" // Hyaluron aufloesen
  | "skinbooster" // Profhilo, Polynukleotide, Lumi Eyes
  | "meso" // Mesotherapie (Gesicht, Haare)
  | "prp" // Eigenblut (Gesicht, Haare)
  | "infusion";

export type AdsV2Zone =
  | "stirn"
  | "zornesfalte"
  | "kraehenfuesse"
  | "browlift"
  | "lippen"
  | "nasolabial"
  | "marionette"
  | "kinn"
  | "jawline"
  | "wangen"
  | "traenenrinne"
  | "masseter"
  | "lipflip"
  | "lachfalten";

export type AdsV2Terms = {
  kind: AdsV2Kind;
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
  /** Zonenbild (public/images/go/zonen/zone-<zone>.svg); fehlt = kein Bild */
  zone?: AdsV2Zone;
  /** Kurztext "So wirkt es" neben dem Zonenbild (2-3 Saetze) */
  howItWorks: string;
};

type Facts = {
  dauer: string;
  wirkung?: string;
  ergebnis?: string;
  haltbarkeit?: string;
  sitzungen?: string;
  betaeubung: string;
  ausfall: string;
};

type Spec = AdsV2Terms & {
  facts: Facts;
  /** Zeitachse: Zeitpunkt der ersten Wirkung, z. B. "Tag 3–7" */
  firstWhen?: string;
  firstText?: string;
  /** Zeitachse: Auffrischen, z. B. "nach ca. 4 Monaten" */
  refreshWhen?: string;
  /**
   * Skinbooster ohne "Quaddeln" in Zeitachse, Nebenwirkungen und Nachsorge
   * (Michael, 03.10.2026, Profhilo: "kleinere Roetungen").
   */
  noQuaddeln?: boolean;
  refreshText?: string;
  /** FAQ-Antworten, die vom Standard der Art abweichen */
  faq?: Partial<Record<FaqSlot, { question?: string; answer: string }>>;
  /** Nachsorge: ersetzt (`aftercare`) oder ergaenzt (`aftercareExtra`) */
  aftercare?: string[];
  aftercareExtra?: string[];
  /** Kacheln "Weitere Zonen/Behandlungen" (pathKeys, Reihenfolge = Anzeige) */
  related: string[];
  /** Zusaetzliche fette Begriffe in "So wirkt es" (adsV2Emphasize) */
  bold?: string[];
};

type FaqSlot = "pain" | "natural" | "timing" | "side" | "undo" | "guarantee" | "last";

const RISK = "Über alle Risiken klärt dich die Ärztin oder der Arzt vorher auf.";

// Muskelrelaxans --------------------------------------------------------

const MR_HOW =
  "Ein Muskelrelaxans entspannt gezielt den Muskel, der die Falte macht. Die Haut darüber glättet sich, deine Mimik bleibt.";
const MR_FACTS: Facts = {
  dauer: "20–30 Minuten",
  wirkung: "nach 3–7 Tagen",
  ergebnis: "nach 14 Tagen",
  haltbarkeit: "ca. 3–4 Monate",
  betaeubung: "Kühlung oder Betäubungscreme auf Wunsch",
  ausfall: "keine",
};
const MR_FACE = ["muskelrelaxans/stirnfalte", "muskelrelaxans/zornesfalte", "muskelrelaxans/kraehenfuesse", "muskelrelaxans/browlift"];
const others = (self: string, list: string[]) => list.filter((k) => k !== self);

// Hyaluron ----------------------------------------------------------------

const HA_HOW =
  "Hyaluron ist ein körpereigener Stoff, der Feuchtigkeit bindet.";
const HA_FACTS: Facts = {
  dauer: "30–45 Minuten",
  wirkung: "sofort sichtbar",
  ergebnis: "nach Abklingen der Schwellung, ca. 1–2 Wochen",
  haltbarkeit: "ca. 6–12 Monate",
  betaeubung: "Betäubungscreme, auf Wunsch Kühlung",
  ausfall: "keine (leichte Schwellung möglich)",
};

// Skinbooster / Mesotherapie / PRP -----------------------------------------

const SB_FACTS: Facts = {
  dauer: "20–30 Minuten",
  wirkung: "Haut wirkt nach wenigen Tagen frischer",
  ergebnis: "nach einigen Wochen",
  haltbarkeit: "mehrere Monate, je nach Haut",
  sitzungen: "meist mehrere im Abstand von einigen Wochen",
  betaeubung: "meist nicht nötig, auf Wunsch Betäubungscreme",
  ausfall: "keine (kleine Quaddeln für 1–2 Tage)",
};

const INFUSIONS = [
  "infusionen/vitamin-c-infusion",
  "infusionen/b-komplex-infusion",
  "infusionen/immun-infusion",
  "infusionen/power-infusion-glutathion",
  "infusionen/regenerations-infusion",
  "infusionen/relax-infusion",
  "infusionen/anti-aging-infusion",
];
const INF_FACTS: Facts = {
  dauer: "30–45 Minuten",
  betaeubung: "nicht nötig, nur ein kleiner Pikser für den Zugang",
  ausfall: "keine",
  sitzungen: "nach Absprache mit der Ärztin oder dem Arzt",
};
function infusion(key: string, label: string, treatment: string, content: string, subline: string): Spec {
  return {
    kind: "infusion",
    label,
    treatment,
    object: `die ${treatment}`,
    about: `zur ${treatment}`,
    subline,
    howItWorks: `Bei einer Infusion läuft eine Lösung ${content} langsam über einen dünnen Zugang in eine Vene am Arm. Welche Zusammensetzung und Menge zu dir passt, bespricht die Ärztin oder der Arzt vorher mit dir.`,
    facts: INF_FACTS,
    faq: {
      natural: {
        answer: `Eine Lösung ${content}. Die genaue Zusammensetzung und Menge erklärt dir die Ärztin oder der Arzt vor dem Termin.`,
      },
    },
    related: others(key, INFUSIONS).slice(0, 4),
    bold: [`Lösung ${content}`],
  };
}

const SPECS: Record<string, Spec> = {
  // ---------------------------------------------------------- Muskelrelaxans
  "muskelrelaxans/stirnfalte": {
    kind: "mr",
    label: "Stirnfalte",
    treatment: "Stirnfalten-Behandlung",
    object: "die Stirnfalte",
    about: "zur Stirnfalte",
    subline: "Entspannter, frischer Blick – Behandlung durch Ärzte, ohne Ausfallzeit",
    zone: "stirn",
    howItWorks: `${MR_HOW} Gesetzt wird an wenigen Punkten in einer Reihe über den Augenbrauen.`,
    facts: MR_FACTS,
    related: others("muskelrelaxans/stirnfalte", MR_FACE),
  },
  "muskelrelaxans/zornesfalte": {
    kind: "mr",
    label: "Zornesfalte",
    treatment: "Zornesfalten-Behandlung",
    object: "die Zornesfalte",
    about: "zur Zornesfalte",
    subline: "Entspannter Blick zwischen den Brauen – Behandlung durch Ärzte, ohne Ausfallzeit",
    zone: "zornesfalte",
    howItWorks: `${MR_HOW} Gesetzt wird an wenigen Punkten zwischen und über den inneren Augenbrauen.`,
    facts: MR_FACTS,
    related: others("muskelrelaxans/zornesfalte", MR_FACE),
  },
  "muskelrelaxans/kraehenfuesse": {
    kind: "mr",
    label: "Krähenfüße",
    treatment: "Krähenfüße-Behandlung",
    object: "die Krähenfüße",
    about: "zu Krähenfüßen",
    subline: "Wacher, frischer Blick um die Augen – Behandlung durch Ärzte, ohne Ausfallzeit",
    zone: "kraehenfuesse",
    howItWorks: `${MR_HOW} Gesetzt wird an je drei Punkten seitlich der Augen.`,
    facts: MR_FACTS,
    related: others("muskelrelaxans/kraehenfuesse", MR_FACE),
  },
  "muskelrelaxans/browlift": {
    kind: "mr",
    label: "Browlift",
    treatment: "Browlift-Behandlung",
    object: "den Browlift",
    about: "zum Browlift",
    subline: "Offener, wacher Blick – Behandlung durch Ärzte, ohne Ausfallzeit",
    zone: "browlift",
    howItWorks: `${MR_HOW} Gesetzt wird an je zwei Punkten am äußeren Ende der Augenbrauen, so kann sich die Braue leicht anheben.`,
    facts: MR_FACTS,
    related: others("muskelrelaxans/browlift", MR_FACE),
  },
  "muskelrelaxans/lachfalten": {
    kind: "mr",
    label: "Lachfalten",
    treatment: "Lachfalten-Behandlung",
    object: "die Lachfalten",
    about: "zu Lachfalten",
    subline: "Feine Linien um die Augen entspannen – Behandlung durch Ärzte, ohne Ausfallzeit",
    zone: "lachfalten",
    howItWorks: `${MR_HOW} Gesetzt wird an wenigen Punkten seitlich und unterhalb der äußeren Augenwinkel.`,
    facts: MR_FACTS,
    firstText: "Die feinen Linien um die Augen werden nach und nach weicher.",
    related: ["muskelrelaxans/kraehenfuesse", "muskelrelaxans/stirnfalte", "muskelrelaxans/zornesfalte", "muskelrelaxans/browlift"],
  },
  "muskelrelaxans/lipflip": {
    bold: ["Oberlippe dreht sich leicht nach außen"],
    kind: "mr",
    label: "Lip Flip",
    treatment: "Lip-Flip-Behandlung",
    object: "den Lip Flip",
    about: "zum Lip Flip",
    subline: "Oberlippe wirkt voller, ohne Filler – Behandlung durch Ärzte",
    zone: "lipflip",
    howItWorks:
      "Beim Lip Flip wird eine sehr kleine Menge Muskelrelaxans knapp über der Oberlippe gesetzt. Der Ringmuskel um den Mund entspannt sich etwas, die Oberlippe dreht sich leicht nach außen und wirkt voller. Es wird kein Volumen aufgefüllt.",
    facts: { ...MR_FACTS, dauer: "15–20 Minuten", haltbarkeit: "ca. 2–3 Monate" },
    firstText: "Die Oberlippe wirkt nach und nach etwas voller.",
    refreshWhen: "nach ca. 2–3 Monaten",
    faq: {
      timing: { answer: "Erste Wirkung nach 3–7 Tagen, das Endergebnis nach etwa 14 Tagen. Weil nur sehr wenig gesetzt wird, hält ein Lip Flip meist 2–3 Monate." },
      side: { answer: `Möglich sind eine leichte Rötung oder ein kleiner blauer Fleck. In den ersten Tagen können Trinken mit dem Strohhalm, Pfeifen oder ein deutliches „P“ ungewohnt sein – das gibt sich. Selten wirkt die Oberlippe ungleichmäßig, das gleichen wir bei der Nachkontrolle aus. ${RISK}` },
      last: { question: "Lip Flip oder Hyaluron – was ist der Unterschied?", answer: "Der Lip Flip entspannt den Muskel, die Oberlippe zeigt sich etwas mehr. Hyaluron füllt Volumen auf und hält länger. Beides lässt sich kombinieren – was zu dir passt, klärt die Beratung." },
    },
    aftercareExtra: ["In den ersten Tagen möglichst nicht mit dem Strohhalm trinken"],
    related: ["hyaluron/lippen-aufspritzen", "muskelrelaxans/bunny-lines", "muskelrelaxans/stirnfalte", "muskelrelaxans/zornesfalte"],
  },
  "muskelrelaxans/bunny-lines": {
    kind: "mr",
    label: "Nasenfältchen",
    treatment: "Nasenfältchen-Behandlung",
    object: "die Nasenfältchen",
    about: "zu Nasenfältchen (Bunny Lines)",
    subline: "Weniger Knitterfältchen am Nasenrücken – Behandlung durch Ärzte, ohne Ausfallzeit",
    howItWorks: `${MR_HOW} Gesetzt wird an je einem bis zwei Punkten seitlich am oberen Nasenrücken.`,
    facts: { ...MR_FACTS, dauer: "10–20 Minuten" },
    firstText: "Die Knitterfältchen an der Nase werden nach und nach weicher.",
    faq: {
      side: { answer: `Möglich sind eine leichte Rötung oder ein kleiner blauer Fleck, meist nach wenigen Tagen weg. Selten fühlt sich die Oberlippe kurz etwas schwächer an – das bildet sich von selbst zurück. ${RISK}` },
    },
    related: ["muskelrelaxans/zornesfalte", "muskelrelaxans/stirnfalte", "muskelrelaxans/kraehenfuesse", "muskelrelaxans/lipflip"],
  },
  "muskelrelaxans/erdbeerkinn": {
    kind: "mr",
    label: "Erdbeerkinn",
    treatment: "Erdbeerkinn-Behandlung",
    object: "das Erdbeerkinn",
    about: "zum Erdbeerkinn",
    subline: "Ruhigeres, glatteres Kinn – Behandlung durch Ärzte, ohne Ausfallzeit",
    zone: "kinn",
    howItWorks: `${MR_HOW} Gesetzt wird an wenigen Punkten am Kinn, wo der Kinnmuskel die Haut zu kleinen Grübchen zieht.`,
    facts: MR_FACTS,
    firstText: "Die Haut am Kinn wird nach und nach ruhiger und glatter.",
    faq: {
      side: { answer: `Möglich sind eine leichte Rötung oder ein kleiner blauer Fleck, meist nach wenigen Tagen weg. Selten fühlt sich die Unterlippe kurz etwas schwächer an, etwa beim Trinken – das bildet sich von selbst zurück. ${RISK}` },
    },
    related: ["muskelrelaxans/lipflip", "muskelrelaxans/bunny-lines", "hyaluron/kinnkorrektur", "muskelrelaxans/stirnfalte"],
  },
  "muskelrelaxans/full-face-muskelrelaxans": {
    kind: "mr",
    label: "Full Face",
    treatment: "Full-Face-Behandlung",
    object: "die Full-Face-Behandlung",
    about: "zur Full-Face-Behandlung",
    subline: "Stirn, Zornesfalte und Krähenfüße in einem Termin – Behandlung durch Ärzte",
    howItWorks: `${MR_HOW} Bei Full Face werden mehrere Zonen in einer Sitzung behandelt, meist Stirn, Zornesfalte und Krähenfüße – die Menge je Zone passend zu deiner Mimik.`,
    facts: { ...MR_FACTS, dauer: "40–60 Minuten", wirkung: "nach 3–5 Tagen", ergebnis: "nach 10–14 Tagen" },
    firstWhen: "Tag 3–5",
    firstText: "Die behandelten Falten werden nach und nach weicher.",
    faq: {
      timing: { answer: "Erste Wirkung nach 3–5 Tagen, das Endergebnis nach 10–14 Tagen. Meist hält es 3–4 Monate." },
    },
    related: MR_FACE,
  },
  "muskelrelaxans/masseter": {
    bold: ["großen Kaumuskel (Masseter)", "schmaler wirken"],
    kind: "mr",
    label: "Masseter",
    treatment: "Masseter-Behandlung",
    object: "die Masseter-Behandlung",
    about: "zur Masseter-Behandlung",
    subline: "Kaumuskel entspannen, Gesicht wirkt schmaler – Behandlung durch Ärzte, ohne OP",
    zone: "masseter",
    howItWorks:
      "Ein Muskelrelaxans entspannt den großen Kaumuskel (Masseter) am seitlichen Unterkiefer. Mit der Zeit wird der Muskel schlanker, das Gesicht kann dadurch schmaler wirken. Gesetzt wird an wenigen Punkten je Seite.",
    facts: { ...MR_FACTS, wirkung: "Entspannung nach wenigen Tagen", ergebnis: "schmaler nach ca. 6–8 Wochen", haltbarkeit: "ca. 4–6 Monate" },
    firstWhen: "nach wenigen Tagen",
    firstText: "Der Kaumuskel entspannt sich. Schmaler wirkt das Gesicht erst nach einigen Wochen.",
    refreshWhen: "nach ca. 4–6 Monaten",
    faq: {
      natural: { question: "Verändert sich mein Gesicht stark?", answer: "Nein, die Veränderung kommt langsam über einige Wochen. Der Unterkiefer wirkt weicher und schmaler, deine Mimik bleibt. Lieber mit weniger starten und bei Bedarf ergänzen." },
      timing: { answer: "Die Entspannung spürst du nach wenigen Tagen. Sichtbar schmaler wird das Gesicht nach etwa 6–8 Wochen. Meist hält es 4–6 Monate." },
      side: { answer: `Möglich sind eine leichte Rötung oder ein kleiner blauer Fleck. In den ersten Wochen kann sich Kauen etwas schwächer anfühlen, etwa bei zähem Essen. Selten wirkt das Lächeln kurz ungleichmäßig – das bildet sich von selbst zurück. ${RISK}` },
      last: { question: "Hilft das auch beim Zähneknirschen?", answer: "Die Behandlung entspannt den Kaumuskel. Ob sie bei deinem Knirschen sinnvoll ist, klärt die Ärztin oder der Arzt in der Beratung – bei Beschwerden am Kiefer gehört auch die Zahnärztin oder der Zahnarzt dazu." },
    },
    aftercareExtra: ["In den ersten Tagen kein Kaugummi und kein sehr zähes Essen"],
    related: ["muskelrelaxans/zaehneknirschen-bruxismus", "hyaluron/jawline", "muskelrelaxans/barbie-muskelrelaxans", "muskelrelaxans/full-face-muskelrelaxans"],
  },
  "muskelrelaxans/zaehneknirschen-bruxismus": {
    bold: ["Kaumuskel (Masseter)", "weniger fest zubeißen"],
    kind: "mr",
    label: "Zähneknirschen",
    treatment: "Behandlung gegen Zähneknirschen",
    object: "die Behandlung gegen Zähneknirschen",
    about: "zum Zähneknirschen",
    subline: "Kaumuskel gezielt entspannen – Behandlung durch Ärzte, in einem kurzen Termin",
    zone: "masseter",
    howItWorks:
      "Ein Muskelrelaxans entspannt den Kaumuskel (Masseter), der beim Knirschen und Pressen arbeitet. Der Muskel kann dann weniger fest zubeißen. Gesetzt wird an wenigen Punkten je Seite.",
    facts: { ...MR_FACTS, wirkung: "nach wenigen Tagen", ergebnis: "nach ca. 2 Wochen", haltbarkeit: "ca. 4–6 Monate" },
    firstWhen: "nach wenigen Tagen",
    firstText: "Der Kaumuskel entspannt sich spürbar.",
    refreshWhen: "nach ca. 4–6 Monaten",
    faq: {
      natural: { question: "Verändert sich mein Gesicht?", answer: "Der Kaumuskel wird mit der Zeit etwas schlanker, das Gesicht kann dadurch leicht schmaler wirken. Deine Mimik bleibt." },
      timing: { answer: "Die Entspannung spürst du nach wenigen Tagen, die volle Wirkung nach etwa 2 Wochen. Meist hält es 4–6 Monate." },
      side: { answer: `Möglich sind eine leichte Rötung oder ein kleiner blauer Fleck. In den ersten Wochen kann sich Kauen etwas schwächer anfühlen. Selten wirkt das Lächeln kurz ungleichmäßig – das bildet sich von selbst zurück. ${RISK}` },
      last: { question: "Ersetzt das die Zahnärztin oder den Zahnarzt?", answer: "Nein. Die Behandlung entspannt den Muskel. Ursachen und Schäden an den Zähnen gehören zur Zahnärztin oder zum Zahnarzt, eine Aufbissschiene kann zusätzlich sinnvoll sein." },
    },
    aftercareExtra: ["In den ersten Tagen kein Kaugummi und kein sehr zähes Essen"],
    related: ["muskelrelaxans/masseter", "muskelrelaxans/stirnfalte", "muskelrelaxans/zornesfalte"],
  },
  "muskelrelaxans/barbie-muskelrelaxans": {
    bold: ["oberen Teil des Trapezmuskels", "gestreckter"],
    kind: "mr",
    label: "Barbie-Behandlung",
    treatment: "Barbie-Behandlung",
    object: "die Barbie-Behandlung",
    about: "zur Barbie-Behandlung",
    subline: "Schultern wirken schlanker, der Nacken länger – Behandlung durch Ärzte, ohne OP",
    howItWorks:
      "Ein Muskelrelaxans entspannt den oberen Teil des Trapezmuskels zwischen Nacken und Schulter. Wird der Muskel schlanker, wirken Schultern und Nacken gestreckter. Gesetzt wird an mehreren Punkten je Seite.",
    facts: { ...MR_FACTS, wirkung: "nach wenigen Tagen", ergebnis: "nach ca. 2–3 Wochen", haltbarkeit: "ca. 4–6 Monate", betaeubung: "auf Wunsch Betäubungscreme" },
    firstWhen: "nach wenigen Tagen",
    firstText: "Der Muskel entspannt sich, die Schulterlinie wird nach und nach weicher.",
    refreshWhen: "nach ca. 4–6 Monaten",
    faq: {
      natural: { question: "Sieht das natürlich aus?", answer: "Ja, die Veränderung kommt langsam über einige Wochen. Ziel ist eine weichere Schulterlinie, keine schwache Schulter. Die Menge wird an deinen Muskel angepasst." },
      timing: { answer: "Erste Wirkung nach wenigen Tagen, das Endergebnis nach etwa 2–3 Wochen. Meist hält es 4–6 Monate." },
      side: { answer: `Möglich sind eine leichte Rötung, ein kleiner blauer Fleck oder ein Gefühl wie Muskelkater. Selten fühlen sich Schultern oder Arme beim Heben schwerer Dinge kurz schwächer an – das bildet sich von selbst zurück. ${RISK}` },
      last: { question: "Für wen ist die Behandlung geeignet?", answer: "Für alle, die einen ausgeprägten oberen Trapezmuskel haben und sich eine schlankere Schulterlinie wünschen. Ob das bei dir passt, prüft die Ärztin oder der Arzt in der Beratung." },
    },
    aftercareExtra: ["In den ersten Tagen kein schweres Heben und kein intensives Schulter-Training"],
    related: ["muskelrelaxans/masseter", "muskelrelaxans/halsfalten-platysma", "muskelrelaxans/hyperhidrose-starkes-schwitzen"],
  },
  "muskelrelaxans/halsfalten-platysma": {
    bold: ["flachen Halsmuskel (Platysma)", "Haut darüber kann sich glätten"],
    kind: "mr",
    label: "Halsfalten",
    treatment: "Halsfalten-Behandlung",
    object: "die Halsfalten",
    about: "zu Halsfalten",
    subline: "Hals wirkt glatter und entspannter – Behandlung durch Ärzte, ohne OP",
    howItWorks:
      "Ein Muskelrelaxans entspannt den flachen Halsmuskel (Platysma), der beim Anspannen Bänder und Falten am Hals zieht. Die Haut darüber kann sich glätten. Gesetzt wird an mehreren Punkten entlang der Muskelstränge.",
    facts: { ...MR_FACTS, wirkung: "nach ca. 4–7 Tagen" },
    firstWhen: "Tag 4–7",
    firstText: "Die Bänder am Hals werden nach und nach weicher.",
    faq: {
      timing: { answer: "Erste Wirkung nach etwa 4–7 Tagen, das Endergebnis nach etwa 14 Tagen. Meist hält es 3–4 Monate." },
      side: { answer: `Möglich sind eine leichte Rötung oder ein kleiner blauer Fleck. Selten fühlt sich das Schlucken oder Kopfheben kurz ungewohnt an – das bildet sich von selbst zurück. ${RISK}` },
    },
    related: ["muskelrelaxans/full-face-muskelrelaxans", "muskelrelaxans/barbie-muskelrelaxans", "muskelrelaxans/masseter"],
  },
  "muskelrelaxans/hyperhidrose-starkes-schwitzen": {
    bold: ["hemmt die Nervensignale an den Schweißdrüsen", "weniger Schweiß"],
    kind: "mr",
    label: "Starkes Schwitzen",
    treatment: "Behandlung gegen starkes Schwitzen",
    object: "die Behandlung gegen starkes Schwitzen",
    about: "zum starken Schwitzen",
    subline: "Mehr Trockenheit unter den Achseln – Behandlung durch Ärzte, in einem Termin",
    howItWorks:
      "Ein Muskelrelaxans hemmt die Nervensignale an den Schweißdrüsen. Die Drüsen in der behandelten Haut bilden dann weniger Schweiß. Gesetzt wird mit sehr feinen Nadeln an vielen kleinen Punkten in der Achsel.",
    facts: { ...MR_FACTS, wirkung: "nach 2–4 Tagen", ergebnis: "nach ca. 2 Wochen", haltbarkeit: "ca. 4–6 Monate" },
    firstWhen: "Tag 2–4",
    firstText: "Die Achseln werden spürbar trockener.",
    refreshWhen: "nach ca. 4–6 Monaten",
    faq: {
      natural: { question: "Kann ich danach normal leben?", answer: "Ja. Du kannst direkt weitermachen. Die übrigen Schweißdrüsen am Körper arbeiten normal weiter." },
      timing: { answer: "Erste Wirkung nach 2–4 Tagen, die volle Wirkung nach etwa 2 Wochen. Meist hält es 4–6 Monate." },
      side: { answer: `Möglich sind kleine Rötungen oder blaue Flecken in der Achsel. Manche bemerken, dass sie an anderen Stellen etwas mehr schwitzen. ${RISK}` },
      undo: { question: "Lässt sich das rückgängig machen?", answer: "Die Wirkung lässt nach einigen Monaten von selbst vollständig nach. Dann kannst du entscheiden, ob du auffrischen möchtest." },
      last: { question: "Für wen ist die Behandlung geeignet?", answer: "Für alle, die unter den Achseln deutlich mehr schwitzen, als ihnen lieb ist. Ob eine andere Ursache dahinterstecken könnte, klärt die Ärztin oder der Arzt in der Beratung." },
    },
    aftercare: [
      "24 Stunden kein Sport, keine Sauna, kein Solarium",
      "Deo erst am nächsten Tag wieder benutzen",
      "Die Achseln nicht massieren oder reiben",
      "Am Behandlungstag keine Haarentfernung in der Achsel",
      "Kleine Rötungen sind normal und gehen schnell zurück",
    ],
    related: ["muskelrelaxans/barbie-muskelrelaxans", "muskelrelaxans/masseter", "muskelrelaxans/halsfalten-platysma"],
  },

  // ---------------------------------------------------------- Hyaluron
  "hyaluron/lippen-aufspritzen": {
    kind: "hyaluron",
    label: "Lippen",
    treatment: "Lippenbehandlung",
    object: "Lippen aufspritzen",
    about: "zum Lippen aufspritzen",
    subline: "Weiche, natürlich betonte Lippen – von Ärztinnen und Ärzten behandelt",
    zone: "lippen",
    howItWorks: `${HA_HOW} An Kontur und Lippenkörper gesetzt, betont es Form und Volumen.`,
    facts: HA_FACTS,
    aftercare: [
      "24 Stunden kein Sport, keine Sauna, kein Solarium",
      "Die Lippen nicht massieren oder drücken",
      "Kühlen hilft gegen die Schwellung",
      "Lippenstift und Make-up frühestens nach einigen Stunden",
      "Heißes erst trinken, wenn die Betäubung abgeklungen ist",
      "Schwellung und Rötung sind normal und gehen nach wenigen Tagen zurück",
    ],
    related: ["hyaluron/lippenkorrektur", "muskelrelaxans/lipflip", "hyaluron/nasolabialfalte", "hyaluron/kinnkorrektur"],
  },
  "hyaluron/lippenkorrektur": {
    bold: ["mit einem Enzym aufgelöst", "neu geformt"],
    kind: "hyaluron",
    label: "Lippenkorrektur",
    treatment: "Lippenkorrektur",
    object: "die Lippenkorrektur",
    about: "zur Lippenkorrektur",
    subline: "Früheres Ergebnis korrigieren – Behandlung durch Ärzte",
    zone: "lippen",
    howItWorks:
      "Bei einer Lippenkorrektur wird ein unschönes Ergebnis einer früheren Behandlung verbessert. Oft wird altes Hyaluron zuerst mit einem Enzym aufgelöst, dann werden die Lippen nach einer Pause neu geformt.",
    facts: {
      ...HA_FACTS,
      dauer: "20–30 Minuten je Schritt",
      wirkung: "Auflösen wirkt innerhalb von 1–2 Tagen",
      ergebnis: "ca. 2 Wochen nach der neuen Behandlung",
    },
    firstWhen: "Tag 1–14",
    firstText: "Wird zuerst aufgelöst, baut sich das alte Hyaluron in wenigen Tagen ab. Nach etwa zwei Wochen Pause werden die Lippen neu geformt.",
    faq: {
      timing: { question: "Wie lange dauert die Korrektur?", answer: "Muss altes Hyaluron aufgelöst werden, sind es meist zwei Termine mit etwa zwei Wochen Abstand. Das neue Ergebnis siehst du sofort, endgültig nach etwa 1–2 Wochen. Meist hält es 6–12 Monate." },
      natural: { question: "Muss immer zuerst aufgelöst werden?", answer: "Nein. Manchmal reicht es, gezielt zu ergänzen. Ob aufgelöst werden sollte, entscheidet die Ärztin oder der Arzt nach dem Blick auf deine Lippen." },
      side: { answer: `In den ersten Tagen sind Schwellung, Rötung oder ein kleiner blauer Fleck normal. Selten reagiert jemand allergisch auf das Enzym zum Auflösen, selten entstehen kleine tastbare Knötchen. ${RISK}` },
    },
    aftercare: [
      "24 Stunden kein Sport, keine Sauna, kein Solarium",
      "Die Lippen nicht massieren oder drücken",
      "Kühlen hilft gegen die Schwellung",
      "Lippenstift und Make-up frühestens nach einigen Stunden",
      "Schwellung und Rötung sind normal und gehen nach wenigen Tagen zurück",
    ],
    related: ["hyaluron/lippen-aufspritzen", "hyaluron/hylase", "muskelrelaxans/lipflip", "hyaluron/plisseefalten"],
  },
  "hyaluron/nasolabialfalte": {
    kind: "hyaluron",
    label: "Nasolabialfalte",
    treatment: "Nasolabialfalten-Behandlung",
    object: "die Nasolabialfalte",
    about: "zur Nasolabialfalte",
    subline: "Weichere Falte zwischen Nase und Mund – Behandlung durch Ärzte",
    zone: "nasolabial",
    howItWorks: `${HA_HOW} Entlang der Falte von der Nase zum Mundwinkel gesetzt, polstert es sie auf. Oft hilft auch etwas Volumen an der Wange.`,
    facts: { ...HA_FACTS, dauer: "20–30 Minuten", ergebnis: "nach ca. 1–2 Wochen" },
    related: ["hyaluron/marionettenfalten", "hyaluron/wangenaufbau", "hyaluron/lippen-aufspritzen", "hyaluron/full-face-hyaluron"],
  },
  "hyaluron/marionettenfalten": {
    kind: "hyaluron",
    label: "Marionettenfalten",
    treatment: "Marionettenfalten-Behandlung",
    object: "die Marionettenfalten",
    about: "zu Marionettenfalten",
    subline: "Mundwinkel wirken weniger nach unten gezogen – Behandlung durch Ärzte",
    zone: "marionette",
    howItWorks: `${HA_HOW} Unter den Mundwinkeln gesetzt, füllt es die Falten zum Kinn hin auf. Die Mundwinkel wirken dadurch weniger nach unten gezogen.`,
    facts: { ...HA_FACTS, dauer: "30–40 Minuten" },
    related: ["hyaluron/nasolabialfalte", "hyaluron/kinnkorrektur", "hyaluron/jawline", "hyaluron/lippen-aufspritzen"],
  },
  "hyaluron/plisseefalten": {
    kind: "hyaluron",
    label: "Plisseefalten",
    treatment: "Plisseefalten-Behandlung",
    object: "die Plisseefalten",
    about: "zu Plisseefalten",
    subline: "Feine Linien über der Oberlippe mildern – Behandlung durch Ärzte",
    howItWorks: `${HA_HOW} Ein feines, weiches Hyaluron wird in kleinen Mengen in die senkrechten Fältchen über der Oberlippe gesetzt. Die Haut wirkt glatter, die Lippe bleibt beweglich.`,
    facts: { ...HA_FACTS, dauer: "30–40 Minuten" },
    related: ["hyaluron/lippen-aufspritzen", "muskelrelaxans/lipflip", "hyaluron/nasolabialfalte", "hyaluron/marionettenfalten"],
  },
  "hyaluron/kinnkorrektur": {
    kind: "hyaluron",
    label: "Kinn",
    treatment: "Kinnbehandlung",
    object: "das Kinn",
    about: "zur Kinnbehandlung",
    subline: "Mehr Balance im Profil – Behandlung durch Ärzte, ohne OP",
    zone: "kinn",
    howItWorks: `${HA_HOW} Am Kinn gesetzt, gibt es mehr Form und Länge. Das Profil kann ausgewogener wirken, kleine Asymmetrien lassen sich ausgleichen.`,
    facts: { ...HA_FACTS, dauer: "20–30 Minuten", ergebnis: "nach wenigen Tagen", haltbarkeit: "ca. 6–9 Monate" },
    refreshWhen: "nach ca. 6–9 Monaten",
    faq: {
      timing: { answer: "Sofort. Endgültig nach Abklingen der Schwellung, meist nach wenigen Tagen. Meist hält es 6–9 Monate." },
    },
    related: ["hyaluron/jawline", "hyaluron/marionettenfalten", "hyaluron/wangenaufbau", "hyaluron/full-face-hyaluron"],
  },
  "hyaluron/jawline": {
    kind: "hyaluron",
    label: "Jawline",
    treatment: "Jawline-Behandlung",
    object: "die Jawline",
    about: "zur Jawline",
    subline: "Klarere Kieferlinie – Behandlung durch Ärzte, ohne OP",
    zone: "jawline",
    howItWorks: `${HA_HOW} Entlang der Kieferlinie vom Kieferwinkel bis zum Kinn gesetzt, betont es die Kontur. Der Übergang von Gesicht zu Hals wirkt klarer.`,
    facts: { ...HA_FACTS, dauer: "30–40 Minuten", haltbarkeit: "ca. 9–12 Monate" },
    refreshWhen: "nach ca. 9–12 Monaten",
    faq: {
      timing: { answer: "Sofort. Endgültig nach Abklingen der Schwellung, etwa nach 1–2 Wochen. Meist hält es 9–12 Monate." },
    },
    related: ["hyaluron/kinnkorrektur", "hyaluron/wangenaufbau", "muskelrelaxans/masseter", "hyaluron/full-face-hyaluron"],
  },
  "hyaluron/wangenaufbau": {
    kind: "hyaluron",
    label: "Wangen",
    treatment: "Wangenbehandlung",
    object: "den Wangenaufbau",
    about: "zum Wangenaufbau",
    subline: "Mehr Volumen auf dem Wangenknochen – Behandlung durch Ärzte",
    zone: "wangen",
    howItWorks: `${HA_HOW} Auf dem Wangenknochen gesetzt, gibt es Volumen und Halt zurück. Das Gesicht kann frischer wirken, oft werden auch die Falten darunter weicher.`,
    facts: { ...HA_FACTS, dauer: "20–30 Minuten", ergebnis: "nach wenigen Tagen", haltbarkeit: "ca. 6–9 Monate" },
    refreshWhen: "nach ca. 6–9 Monaten",
    faq: {
      timing: { answer: "Sofort. Endgültig nach Abklingen der Schwellung, meist nach wenigen Tagen. Meist hält es 6–9 Monate." },
    },
    related: ["hyaluron/nasolabialfalte", "hyaluron/augenringe-unterspritzen", "hyaluron/jawline", "hyaluron/full-face-hyaluron"],
  },
  "hyaluron/full-face-hyaluron": {
    kind: "hyaluron",
    label: "Full Face",
    treatment: "Full-Face-Behandlung",
    object: "Full Face Hyaluron",
    about: "zu Full Face Hyaluron",
    subline: "Wangen, Kinn und Kieferlinie abgestimmt – Behandlung durch Ärzte",
    howItWorks: `${HA_HOW} Bei Full Face werden mehrere Bereiche in einer Sitzung aufeinander abgestimmt, etwa Wangen, Kinn, Kieferlinie und Falten um den Mund. Ziel ist ein ausgewogenes Gesicht, nicht ein einzelner Punkt.`,
    facts: { ...HA_FACTS, dauer: "60–90 Minuten", haltbarkeit: "ca. 6–9 Monate" },
    refreshWhen: "nach ca. 6–9 Monaten",
    faq: {
      timing: { answer: "Sofort. Endgültig nach Abklingen der Schwellung, etwa nach 1–2 Wochen. Meist hält es 6–9 Monate." },
      natural: { question: "Sieht das nicht schnell zu viel aus?", answer: "Nicht, wenn mit kleinen Mengen gearbeitet wird. Die Ärztin oder der Arzt plant mit dir, welche Bereiche wirklich etwas brauchen, und setzt lieber weniger. Bei der Nachkontrolle kann ergänzt werden." },
    },
    related: ["hyaluron/wangenaufbau", "hyaluron/jawline", "hyaluron/kinnkorrektur", "hyaluron/nasolabialfalte"],
  },
  "hyaluron/augenringe-unterspritzen": {
    kind: "hyaluron",
    label: "Augenringe",
    treatment: "Augenringe-Behandlung",
    object: "die Augenringe",
    about: "zu Augenringen",
    subline: "Weniger Schatten unter den Augen – Behandlung durch Ärzte",
    zone: "traenenrinne",
    howItWorks: `${HA_HOW} Ein sehr weiches Hyaluron wird in kleinen Mengen in die Tränenrinne unter dem Auge gesetzt. Die Vertiefung wird flacher, der Schatten darüber weniger.`,
    facts: { ...HA_FACTS, dauer: "20–30 Minuten", ergebnis: "nach ca. 1–2 Wochen", haltbarkeit: "ca. 9–12 Monate, oft länger" },
    refreshWhen: "nach ca. 9–12 Monaten",
    faq: {
      timing: { answer: "Ein Teil ist sofort sichtbar. Endgültig nach Abklingen der Schwellung, etwa nach 1–2 Wochen. Meist hält es 9–12 Monate, oft länger." },
      side: { answer: `Unter den Augen ist die Haut dünn: Schwellung und blaue Flecken können etwas länger dauern als anderswo. Selten schimmert Hyaluron leicht bläulich durch oder es bleibt eine kleine Schwellung – beides lässt sich behandeln. ${RISK}` },
      last: { question: "Hyaluron oder Lumi Eyes – was passt zu mir?", answer: "Hyaluron gleicht eine Vertiefung unter dem Auge aus. Lumi Eyes ist ein Skinbooster für die dünne Haut dort und füllt kein Volumen auf. Was zu dir passt, klärt die Beratung." },
    },
    related: ["skinbooster/lumi-eyes-polynukleotide", "hyaluron/wangenaufbau", "muskelrelaxans/kraehenfuesse", "hyaluron/full-face-hyaluron"],
  },
  "hyaluron/hylase": {
    bold: ["Hyaluronidase", "zurücknehmen"],
    kind: "hylase",
    label: "Hyaluron auflösen",
    treatment: "Hyaluron-Auflösung",
    object: "das Auflösen von Hyaluron",
    about: "zum Auflösen von Hyaluron",
    subline: "Altes Hyaluron gezielt auflösen – Behandlung durch Ärzte, in einem kurzen Termin",
    howItWorks:
      "Ein Enzym (Hyaluronidase) spaltet Hyaluron gezielt auf, der Körper baut es dann ab. So lassen sich ungleichmäßige oder verrutschte Ergebnisse früherer Behandlungen zurücknehmen.",
    facts: {
      dauer: "20–30 Minuten",
      wirkung: "innerhalb von 1–2 Tagen",
      ergebnis: "nach wenigen Tagen",
      haltbarkeit: "dauerhaft – das aufgelöste Hyaluron ist weg",
      betaeubung: "Kühlung, auf Wunsch Betäubungscreme",
      ausfall: "keine (leichte Schwellung möglich)",
    },
    related: ["hyaluron/lippenkorrektur", "hyaluron/lippen-aufspritzen", "hyaluron/full-face-hyaluron"],
  },

  // ---------------------------------------------------------- Skinbooster
  "skinbooster/profhilo": {
    bold: ["sich in der Haut verteilt"],
    kind: "skinbooster",
    label: "Profhilo",
    treatment: "Profhilo-Behandlung",
    object: "Profhilo",
    about: "zu Profhilo",
    subline: "Frischere, straffer wirkende Haut – Behandlung durch Ärzte, ohne Ausfallzeit",
    howItWorks:
      "Profhilo ist ein Skinbooster aus Hyaluron, der sich in der Haut verteilt, statt Volumen aufzubauen. Er versorgt die Haut mit Feuchtigkeit, sie kann straffer und frischer wirken. Injiziert wird an 5 speziellen Profhilo-Punkten je Gesichtshälfte.",
    noQuaddeln: true,
    facts: {
      ...SB_FACTS,
      ausfall: "keine",
      ergebnis: "ca. 4 Wochen nach der zweiten Sitzung",
      haltbarkeit: "ca. 6 Monate, je nach Haut",
      sitzungen: "meist 2 im Abstand von ca. 4 Wochen",
    },
    related: ["skinbooster/polynukleotide-lachssperma", "skinbooster/mesotherapie-nctf-135-ha", "skinbooster/vampir-lifting-prp", "skinbooster/lumi-eyes-polynukleotide"],
  },
  "skinbooster/lumi-eyes-polynukleotide": {
    kind: "skinbooster",
    label: "Lumi Eyes",
    treatment: "Lumi-Eyes-Behandlung",
    object: "Lumi Eyes",
    about: "zu Lumi Eyes",
    subline: "Erholter wirkende Augenpartie – Behandlung durch Ärzte, ohne Ausfallzeit",
    zone: "traenenrinne",
    howItWorks:
      "Lumi Eyes ist ein Skinbooster mit Polynukleotiden für die dünne Haut unter den Augen. Er wird in kleinen Mengen gesetzt und soll die Haut dort unterstützen. Er füllt kein Volumen auf.",
    facts: { ...SB_FACTS, haltbarkeit: "mehrere Monate, Auffrischen nach Absprache" },
    faq: {
      side: { answer: `Unter den Augen ist die Haut dünn: kleine Quaddeln, Rötungen oder blaue Flecken sind möglich und gehen meist nach wenigen Tagen zurück. ${RISK}` },
      last: { question: "Lumi Eyes oder Hyaluron – was passt zu mir?", answer: "Lumi Eyes ist für die dünne Haut unter dem Auge gedacht. Ist dort eine deutliche Vertiefung, kann Hyaluron besser passen. Was zu dir passt, klärt die Beratung." },
    },
    related: ["hyaluron/augenringe-unterspritzen", "skinbooster/polynukleotide-lachssperma", "skinbooster/profhilo", "muskelrelaxans/kraehenfuesse"],
  },
  "skinbooster/polynukleotide-lachssperma": {
    kind: "skinbooster",
    label: "Polynukleotide",
    treatment: "Polynukleotide-Behandlung",
    object: "die Polynukleotide-Behandlung",
    about: "zu Polynukleotiden",
    subline: "Erholter wirkende Haut – Behandlung durch Ärzte, ohne Ausfallzeit",
    howItWorks:
      "Polynukleotide sind ein Skinbooster aus aufbereiteten DNA-Bausteinen aus Lachs. Sie werden in kleinen Mengen in die Haut gesetzt und sollen sie unterstützen. Volumen füllen sie nicht auf.",
    facts: { ...SB_FACTS, ergebnis: "nach ca. 4–6 Wochen", haltbarkeit: "mehrere Monate, Auffrischen nach Absprache" },
    faq: {
      last: { question: "Ist das für mich geeignet, wenn ich Fisch nicht vertrage?", answer: "Sag es bitte in der Beratung. Bei einer Fisch- oder Eiweißallergie ist die Behandlung nicht geeignet – die Ärztin oder der Arzt findet dann eine andere Lösung mit dir." },
    },
    related: ["skinbooster/lumi-eyes-polynukleotide", "skinbooster/profhilo", "skinbooster/mesotherapie-nctf-135-ha", "skinbooster/vampir-lifting-prp"],
  },
  "skinbooster/mesotherapie-nctf-135-ha": {
    kind: "meso",
    label: "Mesotherapie",
    treatment: "Mesotherapie",
    object: "die Mesotherapie",
    about: "zur Mesotherapie",
    subline: "Frischeres Hautbild mit Vitaminen und Hyaluron – Behandlung durch Ärzte",
    howItWorks:
      "Bei der Mesotherapie wird eine Mischung aus Vitaminen, Aminosäuren und Hyaluron mit sehr feinen Nadeln in die obere Hautschicht gesetzt. Die Haut bekommt Feuchtigkeit und kann frischer wirken. Sie baut kein Volumen auf.",
    facts: {
      ...SB_FACTS,
      dauer: "30–45 Minuten",
      wirkung: "Haut wirkt nach der ersten Sitzung frischer",
      ergebnis: "nach einer Kur über mehrere Wochen",
      haltbarkeit: "bis zu ca. 6 Monate",
      sitzungen: "meist eine Kur aus mehreren Sitzungen",
    },
    related: ["skinbooster/profhilo", "skinbooster/polynukleotide-lachssperma", "skinbooster/vampir-lifting-prp", "anti-haarausfall/mesotherapie-haare"],
  },
  "skinbooster/vampir-lifting-prp": {
    bold: ["etwas Blut abgenommen"],
    kind: "prp",
    label: "Vampir-Lifting",
    treatment: "Vampir-Lifting-Behandlung",
    object: "das Vampir-Lifting",
    about: "zum Vampir-Lifting",
    subline: "Frischeres Hautbild mit Eigenblut (PRP) – Behandlung durch Ärzte",
    howItWorks:
      "Beim Vampir-Lifting wird dir etwas Blut abgenommen und aufbereitet. Das gewonnene Plasma (PRP) wird mit feinen Nadeln in die Haut gesetzt. Die Haut kann frischer und ebenmäßiger wirken.",
    facts: {
      ...SB_FACTS,
      dauer: "20–30 Minuten plus Blutabnahme",
      wirkung: "Haut wirkt nach der ersten Sitzung frischer",
      ergebnis: "über mehrere Wochen",
      haltbarkeit: "mehrere Monate, je nach Haut",
    },
    related: ["skinbooster/profhilo", "skinbooster/mesotherapie-nctf-135-ha", "skinbooster/polynukleotide-lachssperma", "anti-haarausfall/prp-haartherapie"],
  },

  // ---------------------------------------------------------- Haare
  "anti-haarausfall/mesotherapie-haare": {
    bold: ["Nährstoffmischung", "von Mensch zu Mensch verschieden"],
    kind: "meso",
    label: "Mesotherapie Haare",
    treatment: "Mesotherapie für die Haare",
    object: "die Mesotherapie für die Haare",
    about: "zur Mesotherapie für die Haare",
    subline: "Pflege direkt an die Kopfhaut – Behandlung durch Ärzte, in kurzen Terminen",
    howItWorks:
      "Bei der Mesotherapie für die Haare wird eine Nährstoffmischung mit sehr feinen Nadeln in die Kopfhaut gesetzt, dorthin, wo die Haarwurzeln sitzen. Sie soll Kopfhaut und Haarwurzeln unterstützen. Wie gut das wirkt, ist von Mensch zu Mensch verschieden.",
    facts: {
      ...SB_FACTS,
      dauer: "20–40 Minuten",
      wirkung: "erste Veränderungen oft nach 4–8 Wochen",
      ergebnis: "nach einer Kur aus 4–6 Sitzungen",
      haltbarkeit: "Auffrischen nach ca. 6 Monaten",
      sitzungen: "4–6 im Abstand von 2–4 Wochen",
      ausfall: "keine",
    },
    firstWhen: "nach 4–8 Wochen",
    firstText: "Viele bemerken erste Veränderungen am Haar. Geduld gehört dazu.",
    refreshWhen: "nach ca. 6 Monaten",
    faq: {
      last: { question: "Hilft das bei jedem Haarausfall?", answer: "Nein. Haarausfall hat viele Ursachen. Die Ärztin oder der Arzt schaut sich das vorher an und sagt dir ehrlich, ob die Behandlung bei dir sinnvoll ist oder ob erst etwas anderes abgeklärt werden sollte." },
    },
    related: ["anti-haarausfall/prp-haartherapie", "skinbooster/mesotherapie-nctf-135-ha"],
  },
  "anti-haarausfall/prp-haartherapie": {
    bold: ["etwas Blut abgenommen", "von Mensch zu Mensch verschieden"],
    kind: "prp",
    label: "PRP-Haartherapie",
    treatment: "PRP-Haartherapie",
    object: "die PRP-Haartherapie",
    about: "zur PRP-Haartherapie",
    subline: "Eigenblut (PRP) für die Kopfhaut – Behandlung durch Ärzte, in kurzen Terminen",
    howItWorks:
      "Bei der PRP-Haartherapie wird dir etwas Blut abgenommen und aufbereitet. Das gewonnene Plasma (PRP) wird mit feinen Nadeln in die Kopfhaut gesetzt. Es soll die Haarwurzeln unterstützen – wie gut das wirkt, ist von Mensch zu Mensch verschieden.",
    facts: {
      ...SB_FACTS,
      dauer: "ca. 30 Minuten plus Blutabnahme",
      wirkung: "erste Veränderungen oft nach 2–3 Monaten",
      ergebnis: "nach mehreren Sitzungen, meist ca. 4",
      haltbarkeit: "Auffrischen nach Absprache",
      sitzungen: "meist ca. 4 im Abstand von einigen Wochen",
      ausfall: "keine",
    },
    firstWhen: "nach 2–3 Monaten",
    firstText: "Viele bemerken erste Veränderungen am Haar. Geduld gehört dazu.",
    refreshWhen: "nach Absprache",
    faq: {
      last: { question: "Hilft das bei jedem Haarausfall?", answer: "Nein. Haarausfall hat viele Ursachen. Die Ärztin oder der Arzt schaut sich das vorher an und sagt dir ehrlich, ob die Behandlung bei dir sinnvoll ist oder ob erst etwas anderes abgeklärt werden sollte." },
    },
    related: ["anti-haarausfall/mesotherapie-haare", "skinbooster/vampir-lifting-prp"],
  },

  // ---------------------------------------------------------- Infusionen
  "infusionen/vitamin-c-infusion": infusion(
    "infusionen/vitamin-c-infusion", "Vitamin-C-Infusion", "Vitamin-C-Infusion", "mit Vitamin C",
    "Vitamin C als Infusion – Behandlung durch Ärzte, in 30–45 Minuten",
  ),
  "infusionen/b-komplex-infusion": infusion(
    "infusionen/b-komplex-infusion", "Vitamin-B-Infusion", "Vitamin-B-Infusion", "mit B-Vitaminen",
    "B-Vitamine als Infusion – Behandlung durch Ärzte, in 30–45 Minuten",
  ),
  "infusionen/immun-infusion": infusion(
    "infusionen/immun-infusion", "Immun-Infusion", "Immun-Infusion", "mit Vitaminen und Mineralstoffen",
    "Vitamine und Mineralstoffe als Infusion – Behandlung durch Ärzte",
  ),
  "infusionen/power-infusion-glutathion": infusion(
    "infusionen/power-infusion-glutathion", "Power-Infusion", "Power-Infusion", "mit Vitaminen, Mineralstoffen und Glutathion",
    "Vitamine, Mineralstoffe und Glutathion als Infusion – Behandlung durch Ärzte",
  ),
  "infusionen/regenerations-infusion": infusion(
    "infusionen/regenerations-infusion", "Regenerations-Infusion", "Regenerations-Infusion", "mit Vitaminen und Mineralstoffen",
    "Vitamine und Mineralstoffe als Infusion – Behandlung durch Ärzte",
  ),
  "infusionen/relax-infusion": infusion(
    "infusionen/relax-infusion", "Relax-Infusion", "Relax-Infusion", "mit Mineralstoffen und Vitaminen",
    "Mineralstoffe und Vitamine als Infusion – Behandlung durch Ärzte",
  ),
  "infusionen/anti-aging-infusion": infusion(
    "infusionen/anti-aging-infusion", "Anti-Aging-Infusion", "Anti-Aging-Infusion", "mit Vitaminen und Antioxidantien",
    "Vitamine und Antioxidantien als Infusion – Behandlung durch Ärzte",
  ),
};

/** Begriffe der Behandlung; null = Seite ohne v2-Inhalte (alte Texte). */
export function adsV2Terms(pathKey: string | null | undefined): AdsV2Terms | null {
  const s = SPECS[baseKey(pathKey)];
  if (!s) return null;
  const { kind, label, treatment, object, about, subline, zone, howItWorks } = s;
  return { kind, label, treatment, object, about, subline, zone, howItWorks };
}

/** Alle pathKeys mit v2-Inhalten (Umschaltung, Tests). */
export function adsV2ContentKeys(): string[] {
  return Object.keys(SPECS);
}

export function adsV2Kind(pathKey: string | null | undefined): AdsV2Kind | null {
  return SPECS[baseKey(pathKey)]?.kind ?? null;
}

/**
 * Zufriedenheitsgarantie gilt fuer alle Behandlungen (Benjamin, 01.10.2026),
 * auch fuer Infusionen; der Umfang steht je Kategorie in adsV2Guarantee
 * (shared/adsTemplateV2.ts).
 */
export function adsV2HasGuarantee(pathKey: string | null | undefined): boolean {
  return !!SPECS[baseKey(pathKey)];
}

/** Zeile unter den Preiskarten. */
export function adsV2PriceInclusion(pathKey: string | null | undefined): string {
  return adsV2Kind(pathKey) === "infusion"
    ? "Inklusive ärztlichem Vorgespräch und Nachkontrolle."
    : "Inklusive Beratung und Nachkontrolle.";
}

const ZONE_ALT: Record<AdsV2Zone, string> = {
  stirn: "Schema: fünf Einstichpunkte in einer Reihe über den Augenbrauen",
  zornesfalte: "Schema: fünf Einstichpunkte zwischen und über den inneren Augenbrauen",
  kraehenfuesse: "Schema: je drei Einstichpunkte fächerförmig seitlich der Augen",
  browlift: "Schema: je zwei Einstichpunkte am äußeren Ende der Augenbrauen",
  lippen: "Schema: Punkte entlang der Lippenkontur und im Lippenkörper",
  nasolabial: "Schema: je drei Punkte entlang der Falte von der Nase zum Mundwinkel",
  marionette: "Schema: je zwei Punkte unterhalb der Mundwinkel",
  kinn: "Schema: drei Punkte am Kinn",
  jawline: "Schema: je vier Punkte entlang der Kieferlinie",
  wangen: "Schema: je drei Punkte auf dem Wangenknochen",
  traenenrinne: "Schema: je zwei Punkte unter den Augen",
  masseter: "Schema: je drei Punkte über dem Kaumuskel am Unterkiefer",
  lipflip: "Schema: vier Punkte knapp über der Oberlippe",
  lachfalten: "Schema: je zwei Punkte unterhalb der äußeren Augenwinkel",
};

export function adsV2ZoneImage(zone: AdsV2Zone | undefined): { src: string; alt: string } | null {
  if (!zone) return null;
  return { src: `/images/go/zonen/zone-${zone}.svg`, alt: ZONE_ALT[zone] };
}

/** Alle Zonen mit Bild (Tests). */
export function adsV2Zones(): AdsV2Zone[] {
  return Object.keys(ZONE_ALT) as AdsV2Zone[];
}

/**
 * "in den Köln Arcaden", "im Minto": Praeposition mit Artikel je Standort
 * (Benjamin, 01.10.2026: korrekter Satz statt "in Köln Arcaden"). Der Name
 * bricht nicht um (geschuetzte Leerzeichen, geschuetzter Bindestrich).
 * Unbekannte Standorte: "am Standort <Name>" - nie ein falscher Artikel.
 */
const AT_LOCATION: Readonly<Record<string, string>> = {
  "Aquis Plaza": "im",
  "Gesundbrunnen-Center": "im",
  "Düsseldorf Arcaden": "in den",
  "Forum Duisburg": "im",
  "K in Lautern": "im",
  "Köln Arcaden": "in den",
  "Höfe am Brühl": "in den Höfen am Brühl",
  Minto: "im",
  "Palais Vest": "im",
  "Europa Galerie": "in der",
  "Löhr Center": "im",
  Loom: "im",
  "City Arkaden Wuppertal": "in den",
  "Allee Center Magdeburg": "im",
  "MediaPark Klinik": "in der",
};

/**
 * Standortname ohne Umbruch an Leerzeichen. Am Bindestrich darf er brechen:
 * "Gesundbrunnen-Center" war geschuetzt und passte auf schmalen Handys nicht
 * in die Zeile, dann brach der Browser mitten im Wort ("Cente|r",
 * Benjamin 07.10.2026).
 */
export function adsV2NoBreak(text: string): string {
  return text.replace(/ /g, "\u00a0");
}

export function adsV2AtLocation(locationName: string | null | undefined): string {
  const name = String(locationName ?? "").trim();
  if (!name) return "";
  const p = AT_LOCATION[name];
  if (!p) return `am Standort ${adsV2NoBreak(name)}`;
  // eigene Beugung ("in den Höfen am Brühl") steht komplett in der Tabelle
  if (p.includes(" ") && p.split(" ").length > 2) return adsV2NoBreak(p).replace(/^in\u00a0den/, "in den");
  return `${p} ${adsV2NoBreak(name)}`;
}

/** Ueberschriften (Punkt 3), Standort-Name eingesetzt. */
export function adsV2Headings(terms: AdsV2Terms, locationName: string) {
  const where = adsV2AtLocation(locationName);
  const at = where ? ` ${where}` : "";
  const zonal = terms.kind === "mr" || terms.kind === "hyaluron";
  return {
    facts: `${terms.label} auf einen Blick`,
    how:
      terms.kind === "infusion"
        ? `So funktioniert die ${terms.treatment}`
        : `So wirkt die ${terms.treatment}`,
    clips: `So sieht die ${terms.treatment} aus`,
    steps: `So läuft deine ${terms.treatment} ab`,
    prices: `Preise für ${terms.object}${at}`,
    zones: `${terms.label} + weitere ${zonal ? "Zonen" : "Behandlungen"}`,
    doctors: `Dein Ärzteteam für ${terms.object}${at}`,
    consult: `Deine Beratung ${terms.about}`,
    reviews: `Vor deiner ${terms.treatment}: das sagen Kundinnen und Kunden`,
    faq: `Häufige Fragen ${terms.about}`,
    aftercare: `Nach deiner ${terms.treatment}`,
    location: `So findest du uns – deine ${terms.treatment}${at}`,
    final: `Bereit für deine ${terms.treatment}?`,
  };
}

// ---------------------------------------------------------------- 1. Steckbrief

export type AdsV2Fact = { key: string; label: string; value: string };

/** "20-30 Minuten" aus Strapi, sonst die Angabe der Behandlung. */
function shortDuration(value: string | null | undefined, fallback: string): string {
  const m = /^\s*(\d+)\s*[-–]\s*(\d+)\s*Minuten\s*$/i.exec(value ?? "");
  return m ? `${m[1]}–${m[2]} Minuten` : fallback;
}

export function adsV2Facts(
  pathKey: string | null | undefined,
  strapiDuration?: string | null,
): AdsV2Fact[] {
  const s = SPECS[baseKey(pathKey)];
  if (!s) return [];
  const f = s.facts;
  if (s.kind === "infusion") {
    return [
      { key: "dauer", label: "Dauer", value: shortDuration(strapiDuration, f.dauer) },
      { key: "vorab", label: "Vorab", value: "kurzes ärztliches Gespräch zu Gesundheit und Medikamenten" },
      { key: "ablauf", label: "Ablauf", value: "entspannt im Sessel, über einen dünnen Zugang am Arm" },
      { key: "betaeubung", label: "Betäubung", value: f.betaeubung },
      { key: "ausfall", label: "Ausfallzeit", value: f.ausfall },
      { key: "sitzungen", label: "Wie oft", value: f.sitzungen ?? "nach Absprache" },
    ];
  }
  const rows: AdsV2Fact[] = [
    { key: "dauer", label: "Dauer", value: shortDuration(strapiDuration, f.dauer) },
  ];
  if (f.wirkung) rows.push({ key: "wirkung", label: "Erste Wirkung", value: f.wirkung });
  if (f.ergebnis) rows.push({ key: "ergebnis", label: "Endergebnis", value: f.ergebnis });
  if (f.haltbarkeit) rows.push({ key: "haltbarkeit", label: "Haltbarkeit", value: f.haltbarkeit });
  if (f.sitzungen) rows.push({ key: "sitzungen", label: "Sitzungen", value: f.sitzungen });
  rows.push({ key: "betaeubung", label: "Betäubung", value: f.betaeubung });
  rows.push({ key: "ausfall", label: "Ausfallzeit", value: f.ausfall });
  return rows;
}

// ---------------------------------------------------------------- 5. Zeitachse

export type AdsV2TimelineItem = { when: string; title: string; text: string };

function control(pathKey: string | null | undefined): AdsV2TimelineItem {
  return { when: "Tag 14", title: "Kostenlose Nachkontrolle", text: adsV2Guarantee(pathKey).timeline };
}

export function adsV2Timeline(pathKey: string | null | undefined): AdsV2TimelineItem[] {
  const s = SPECS[baseKey(pathKey)];
  if (!s) return [];
  if (s.kind === "mr") {
    return [
      {
        when: "Tag 0",
        title: "Beratung und Behandlung",
        text:
          baseKey(pathKey) === "muskelrelaxans/hyperhidrose-starkes-schwitzen" || baseKey(pathKey) === "muskelrelaxans/barbie-muskelrelaxans"
            ? "Ärztliche Beratung, dann mehrere feine Pikser – du kannst direkt weitermachen."
            : "Ärztliche Beratung zu deiner Mimik, dann wenige feine Pikser – du kannst direkt weitermachen.",
      },
      { when: s.firstWhen ?? "Tag 3–7", title: "Erste Wirkung", text: s.firstText ?? "Die Falte wird nach und nach weicher." },
      control(pathKey),
      {
        when: s.refreshWhen ?? "nach ca. 4 Monaten",
        title: "Auffrischen",
        text: s.refreshText ?? "Die Wirkung lässt langsam nach. Wenn du magst, frischen wir auf.",
      },
    ];
  }
  if (s.kind === "hyaluron") {
    const first = s.firstText
      ? { when: s.firstWhen ?? "Tag 1–7", title: "Zwischenschritt", text: s.firstText }
      : { when: "Tag 1–7", title: "Schwellung klingt ab", text: "Leichte Schwellungen sind normal und gehen meist nach wenigen Tagen zurück." };
    return [
      {
        when: "Tag 0",
        title: "Beratung und Behandlung",
        text: "Ihr besprecht Wunsch und Menge. Nach der Betäubung wird das Hyaluron an den besprochenen Stellen gesetzt – das Ergebnis siehst du sofort.",
      },
      first,
      control(pathKey),
      {
        when: s.refreshWhen ?? "nach ca. 6–12 Monaten",
        title: "Auffrischen",
        text: "Der Körper baut Hyaluron langsam ab. Wenn du magst, frischen wir auf.",
      },
    ];
  }
  if (s.kind === "hylase") {
    return [
      {
        when: "Tag 0",
        title: "Beratung und Behandlung",
        text: "Die Ärztin oder der Arzt schaut sich das alte Hyaluron an und setzt das Enzym gezielt an diese Stelle.",
      },
      { when: "Tag 1–2", title: "Hyaluron löst sich", text: "Das Enzym wirkt meist innerhalb von ein bis zwei Tagen. Eine leichte Schwellung ist normal." },
      control(pathKey),
      {
        when: "ab ca. 2 Wochen",
        title: "Neu behandeln, wenn du magst",
        text: "Ist alles abgeklungen, kann auf Wunsch neu unterspritzt werden.",
      },
    ];
  }
  if (s.kind === "infusion") {
    return [
      {
        when: "Vorab",
        title: "Ärztliches Gespräch",
        text: "Ihr sprecht über Gesundheit, Medikamente und Allergien. Passt die Infusion nicht zu dir, sagen wir dir das ehrlich.",
      },
      {
        when: "Termin",
        title: "Infusion",
        text: `Du sitzt entspannt, die Infusion läuft etwa ${shortDuration(null, s.facts.dauer)} lang über einen dünnen Zugang am Arm.`,
      },
      {
        when: "Danach",
        title: "Weitermachen",
        text: "Nach einer kurzen Pause kannst du direkt in deinen Tag zurück. Innerhalb von 14 Tagen gibt es auf Wunsch eine kostenlose Nachkontrolle und Beratung (Zufriedenheitsgarantie).",
      },
      { when: "Später", title: "Wiederholen nach Absprache", text: "Ob und wann eine weitere Infusion sinnvoll ist, besprecht ihr gemeinsam." },
    ];
  }
  // Skinbooster, Mesotherapie, PRP: Kur aus Sitzungen
  const blood = s.kind === "prp";
  const start: AdsV2TimelineItem = {
    when: "Tag 0",
    title: "Beratung und erste Sitzung",
    text: blood
      ? "Nach der Beratung wird etwas Blut abgenommen und aufbereitet, dann mit feinen Nadeln gesetzt."
      : "Nach der Beratung wird mit feinen Nadeln an mehreren kleinen Punkten gesetzt.",
  };
  const sessions: AdsV2TimelineItem = {
    when: "nach einigen Wochen",
    title: "Weitere Sitzungen",
    text: s.facts.sitzungen
      ? `${s.facts.sitzungen[0]!.toUpperCase()}${s.facts.sitzungen.slice(1)}. Innerhalb von 14 Tagen gibt es eine kostenlose Nachkontrolle und Beratung (Zufriedenheitsgarantie).`
      : "Innerhalb von 14 Tagen gibt es eine kostenlose Nachkontrolle und Beratung (Zufriedenheitsgarantie).",
  };
  const refresh: AdsV2TimelineItem = {
    when: s.refreshWhen ?? "nach einigen Monaten",
    title: "Auffrischen",
    text: "Die Wirkung lässt langsam nach. Wenn du magst, frischen wir auf.",
  };
  // Haare: erste Veraenderungen erst nach Monaten, also nach den Sitzungen.
  if (s.firstText) {
    return [start, sessions, { when: s.firstWhen ?? "nach einigen Wochen", title: "Erste Veränderungen", text: s.firstText }, refresh];
  }
  return [
    start,
    s.noQuaddeln
      ? { when: "Tag 1–3", title: "Kleinere Rötungen klingen ab", text: "Kleine Rötungen sind normal und gehen meist nach ein bis zwei Tagen zurück." }
      : { when: "Tag 1–3", title: "Quaddeln klingen ab", text: "Kleine Erhebungen und Rötungen sind normal und gehen meist nach ein bis zwei Tagen zurück." },
    sessions,
    refresh,
  ];
}

// ---------------------------------------------------------------- 6. FAQ + Nachsorge

export type AdsV2FaqItem = { question: string; answer: string };

const WHO =
  "Ausschließlich Ärztinnen und Ärzte. Sie beraten dich vorher und sagen dir ehrlich, wenn eine Behandlung nicht zu dir passt.";
const DIFFERENCE =
  "Ein Muskelrelaxans entspannt den Muskel hinter Mimikfalten wie Stirn- oder Zornesfalte. Hyaluron füllt Volumen auf, etwa an den Lippen. Was zu dir passt, klärt die Beratung.";

function stripCa(v: string | undefined): string {
  return String(v ?? "").replace(/^ca\.\s*/, "");
}

function defaultFaqs(s: Spec, pathKey: string): Record<FaqSlot, AdsV2FaqItem> {
  const f = s.facts;
  const GUARANTEE = adsV2Guarantee(pathKey).faq;
  if (s.kind === "mr") {
    return {
      pain: { question: "Tut das weh?", answer: "Die meisten spüren nur kurze Pikser. Es wird mit sehr feinen Nadeln gearbeitet, auf Wunsch wird vorher gekühlt oder betäubt." },
      natural: { question: "Sieht das natürlich aus?", answer: "Ziel ist ein entspannter Ausdruck, kein starres Gesicht. Die Menge wird an deine Mimik angepasst – lieber mit weniger starten und bei der Nachkontrolle ergänzen." },
      timing: { question: "Wann wirkt es und wie lange hält es?", answer: `Erste Wirkung ${f.wirkung}, das Endergebnis ${f.ergebnis === "nach 14 Tagen" ? "nach etwa 14 Tagen" : f.ergebnis}. Meist hält es ${stripCa(f.haltbarkeit)}.` },
      side: { question: "Welche Nebenwirkungen kann es geben?", answer: `Möglich sind eine leichte Rötung oder ein kleiner blauer Fleck, meist nach wenigen Tagen weg. Selten wird das Ergebnis ungleichmäßig oder ein Lid hängt leicht – das bildet sich von selbst zurück. ${RISK}` },
      undo: { question: "Lässt sich das rückgängig machen?", answer: "Die Wirkung lässt nach einigen Monaten von selbst vollständig nach. Kleine Unterschiede gleichen wir bei der Nachkontrolle aus." },
      guarantee: { question: "Was, wenn es mir nicht gefällt?", answer: GUARANTEE },
      last: { question: "Muskelrelaxans oder Hyaluron – was ist der Unterschied?", answer: DIFFERENCE },
    };
  }
  if (s.kind === "hyaluron") {
    const lips = pathKey === "hyaluron/lippen-aufspritzen";
    return {
      pain: { question: "Tut das weh?", answer: "Vorher wird betäubt. Die meisten spüren nur Druck und kurze Pikser." },
      natural: { question: "Sieht das natürlich aus?", answer: "Wir arbeiten mit kleinen Mengen und passend zu deinem Gesicht. Lieber mit weniger starten – bei der Nachkontrolle kann ergänzt werden." },
      timing: {
        question: "Wann sehe ich das Ergebnis und wie lange hält es?",
        answer: lips
          ? "Sofort. Endgültig nach Abklingen der Schwellung, etwa nach 1–2 Wochen. Meist hält es 6–12 Monate."
          : `Sofort. Endgültig nach Abklingen der Schwellung, etwa nach 1–2 Wochen. Meist hält es ${stripCa(f.haltbarkeit)}.`,
      },
      side: { question: "Welche Nebenwirkungen kann es geben?", answer: `In den ersten Tagen sind Schwellung, Rötung oder ein kleiner blauer Fleck normal. Selten entstehen kleine tastbare Knötchen – die behandeln wir bei der Nachkontrolle. ${RISK}` },
      undo: { question: "Lässt sich das rückgängig machen?", answer: "Ja. Hyaluron lässt sich mit dem Enzym Hyaluronidase gezielt auflösen. Ohne Zutun baut der Körper es über Monate von selbst ab." },
      guarantee: { question: "Was, wenn mir das Ergebnis nicht gefällt?", answer: GUARANTEE },
      last: { question: "Welches Produkt wird verwendet – und wer behandelt?", answer: [adsV2ProductNote(pathKey), WHO].filter(Boolean).join(" ") },
    };
  }
  if (s.kind === "hylase") {
    return {
      pain: { question: "Tut das weh?", answer: "Die meisten spüren nur kurze Pikser und ein leichtes Brennen. Auf Wunsch wird vorher gekühlt oder betäubt." },
      natural: { question: "Wann ist das Auflösen sinnvoll?", answer: "Wenn ein früheres Ergebnis ungleichmäßig ist, verrutscht wirkt oder dir einfach zu viel ist. Die Ärztin oder der Arzt schaut sich das vorher genau an – egal, wo du behandelt wurdest." },
      timing: { question: "Wie schnell wirkt es?", answer: "Das Enzym wirkt meist innerhalb von ein bis zwei Tagen. Manchmal braucht es eine zweite Sitzung, wenn viel Hyaluron vorhanden ist." },
      side: { question: "Welche Nebenwirkungen kann es geben?", answer: `Schwellung, Rötung oder ein kleiner blauer Fleck sind in den ersten Tagen normal. Selten reagiert jemand allergisch auf das Enzym. Es kann auch etwas körpereigenes Hyaluron abbauen – das bildet der Körper wieder nach. ${RISK}` },
      undo: { question: "Wann kann ich neu unterspritzen lassen?", answer: "Meist nach etwa zwei Wochen, wenn alles abgeklungen ist. Das besprecht ihr bei der Nachkontrolle." },
      guarantee: { question: "Was, wenn noch Reste da sind?", answer: GUARANTEE },
      last: { question: "Wer behandelt mich?", answer: WHO },
    };
  }
  if (s.kind === "infusion") {
    return {
      pain: { question: "Tut das weh?", answer: "Du spürst einen kleinen Pikser, wenn der dünne Zugang gelegt wird. Danach merkst du von der Infusion meist nichts mehr." },
      natural: { question: "Was ist in der Infusion?", answer: "Die genaue Zusammensetzung und Menge erklärt dir die Ärztin oder der Arzt vor dem Termin." },
      timing: { question: "Wie lange dauert es?", answer: `Die Infusion selbst dauert etwa ${shortDuration(null, f.dauer)}. Plane mit Vorgespräch und kurzer Pause danach etwas mehr Zeit ein.` },
      side: { question: "Welche Nebenwirkungen kann es geben?", answer: `An der Einstichstelle kann ein kleiner blauer Fleck entstehen. Manche spüren ein kühles Gefühl im Arm, selten wird einem kurz schwindelig. Allergische Reaktionen sind selten. ${RISK}` },
      undo: { question: "Für wen ist eine Infusion nicht geeignet?", answer: "Zum Beispiel in der Schwangerschaft oder bei bestimmten Erkrankungen von Herz oder Nieren. Darum gibt es vorher das ärztliche Gespräch – sag dort bitte auch, welche Medikamente du nimmst." },
      guarantee: { question: "Ersetzt eine Infusion eine ärztliche Behandlung?", answer: "Nein. Eine Infusion ersetzt weder eine ausgewogene Ernährung noch die Behandlung einer Krankheit. Bei Beschwerden geh bitte zu deiner Hausärztin oder deinem Hausarzt." },
      last: {
        question: "Wer betreut mich – und was, wenn ich danach Fragen habe?",
        answer: `Behandlung nur durch Ärztinnen und Ärzte: Sie führen das Vorgespräch und sagen dir ehrlich, wenn eine Infusion nicht zu dir passt. ${GUARANTEE}`,
      },
    };
  }
  // Skinbooster, Mesotherapie, PRP
  const blood = s.kind === "prp";
  return {
    pain: {
      question: "Tut das weh?",
      answer: blood
        ? "Die Blutabnahme ist ein kurzer Pikser. Bei der Behandlung spürst du feine Pikser, auf Wunsch wird vorher betäubt."
        : "Die meisten spüren nur feine Pikser. Auf Wunsch wird vorher betäubt.",
    },
    natural: {
      question: blood ? "Was ist PRP?" : "Füllt das Volumen auf?",
      answer: blood
        ? "PRP heißt plättchenreiches Plasma. Es wird aus deinem eigenen Blut gewonnen – es kommt also nichts Fremdes hinein."
        : "Nein. Ein Skinbooster verteilt sich in der Haut und versorgt sie mit Feuchtigkeit. Für Volumen, etwa an Lippen oder Wangen, ist Hyaluron als Filler gedacht.",
    },
    timing: {
      question: "Wann sehe ich etwas und wie oft brauche ich es?",
      answer: [
        f.wirkung ? `${f.wirkung[0]!.toUpperCase()}${f.wirkung.slice(1)}.` : "",
        f.sitzungen ? `Sitzungen: ${f.sitzungen}.` : "",
        f.haltbarkeit ? `Haltbarkeit: ${f.haltbarkeit}.` : "",
      ].filter(Boolean).join(" "),
    },
    side: {
      question: "Welche Nebenwirkungen kann es geben?",
      answer: blood
        ? `Möglich sind ein blauer Fleck an der Blutabnahme, Rötungen, kleine Schwellungen oder eine empfindliche Haut für ein bis zwei Tage. ${RISK}`
        : s.noQuaddeln
          ? `Kleinere Rötungen oder blaue Flecken sind möglich und gehen meist nach ein bis zwei Tagen zurück. ${RISK}`
          : `Kleine Quaddeln, Rötungen oder blaue Flecken sind möglich und gehen meist nach ein bis zwei Tagen zurück. ${RISK}`,
    },
    undo: {
      question: "Für wen ist das nicht geeignet?",
      answer: blood
        ? "Zum Beispiel bei Störungen der Blutgerinnung, mit blutverdünnenden Medikamenten, in der Schwangerschaft oder bei einer Entzündung an der Stelle. Das klärt die Ärztin oder der Arzt vorher mit dir."
        : "Zum Beispiel in der Schwangerschaft, bei einer Entzündung an der Stelle oder bei Allergien gegen Inhaltsstoffe. Das klärt die Ärztin oder der Arzt vorher mit dir.",
    },
    guarantee: { question: "Was, wenn ich Fragen zum Ergebnis habe?", answer: GUARANTEE },
    last: {
      question: adsV2ProductNote(pathKey) ? "Welches Produkt wird verwendet – und wer behandelt?" : "Wer behandelt mich?",
      answer: [adsV2ProductNote(pathKey), WHO].filter(Boolean).join(" "),
    },
  };
}

const SLOTS: FaqSlot[] = ["pain", "natural", "timing", "side", "undo", "guarantee", "last"];

export function adsV2FaqsV2(pathKey: string | null | undefined): AdsV2FaqItem[] {
  const key = baseKey(pathKey);
  const s = SPECS[key];
  if (!s) return [];
  const base = defaultFaqs(s, key);
  return SLOTS.map((slot) => {
    const o = s.faq?.[slot];
    return o ? { question: o.question ?? base[slot].question, answer: o.answer } : base[slot];
  });
}

export function adsV2Aftercare(pathKey: string | null | undefined): string[] {
  const s = SPECS[baseKey(pathKey)];
  if (!s) return [];
  if (s.aftercare) return [...s.aftercare, ...(s.aftercareExtra ?? [])];
  let list: string[];
  switch (s.kind) {
    case "mr":
      list = [
        "24 Stunden kein Sport, keine Sauna, kein Solarium",
        "Die behandelten Stellen nicht massieren oder reiben",
        "4 Stunden aufrecht bleiben, nicht hinlegen",
        "Make-up frühestens nach einigen Stunden",
        "Leichte Rötungen sind normal und gehen schnell zurück",
      ];
      break;
    case "hyaluron":
      list = [
        "24 Stunden kein Sport, keine Sauna, kein Solarium",
        "Die behandelte Stelle nicht massieren oder drücken",
        "Kühlen hilft gegen die Schwellung",
        "Make-up frühestens nach einigen Stunden",
        "Die erste Nacht möglichst auf dem Rücken schlafen",
        "Schwellung und Rötung sind normal und gehen nach wenigen Tagen zurück",
      ];
      break;
    case "hylase":
      list = [
        "24 Stunden kein Sport, keine Sauna, kein Solarium",
        "Kühlen hilft gegen die Schwellung",
        "Make-up frühestens nach einigen Stunden",
        "Neu unterspritzen frühestens nach etwa zwei Wochen",
        "Bei starker Rötung, Juckreiz oder Atemnot sofort melden",
      ];
      break;
    case "infusion":
      list = [
        "Bleib nach der Infusion noch kurz sitzen, wenn du dich wackelig fühlst",
        "Drück die Einstichstelle ein paar Minuten, das Pflaster kann nach einigen Stunden ab",
        "Trink über den Tag genug Wasser",
        "Am selben Tag besser keinen sehr anstrengenden Sport",
        "Wenn dir etwas ungewöhnlich vorkommt, melde dich bei uns",
      ];
      break;
    default: {
      const scalp = baseKey(pathKey).startsWith("anti-haarausfall/");
      list = scalp
        ? [
            "Haare frühestens am nächsten Tag waschen",
            "24 Stunden kein Sport, keine Sauna, kein Solarium",
            "Ein paar Tage keine Haarfarbe und keine scharfen Stylingprodukte",
            "Die Kopfhaut nicht kratzen oder massieren",
            "Eine empfindliche Kopfhaut ist normal und gibt sich schnell",
          ]
        : [
            "24 Stunden kein Sport, keine Sauna, kein Solarium",
            s.noQuaddeln ? "Die Einstichstellen nicht massieren oder drücken" : "Die kleinen Quaddeln nicht massieren oder drücken",
            "Make-up frühestens am nächsten Tag",
            "In den Tagen danach gut vor Sonne schützen",
            s.noQuaddeln ? "Kleinere Rötungen sind normal und gehen schnell zurück" : "Rötungen und Quaddeln sind normal und gehen schnell zurück",
          ];
    }
  }
  return [...list, ...(s.aftercareExtra ?? [])];
}

// ---------------------------------------------------------------- 7. Weitere Zonen

export type AdsV2ZoneTile = {
  key: string;
  label: string;
  href: string;
  image: { src: string; alt: string } | null;
  /**
   * Vorschaubild der Behandlung (Poster ihres Hero-Clips aus
   * public/videos/go/), damit jede Kachel ein Bild hat (Benjamin,
   * 01.10.2026: sonst "aermlich"). Fehlt es, zeigt die Kachel das Zonenbild.
   */
  photo: string | null;
};

/**
 * Kacheln verwandter Behandlungen desselben Standorts (Zonen bei
 * Muskelrelaxans und Hyaluron, sonst Behandlungen). Der Link zeigt immer auf
 * die echte go.-Seite (auch aus der Vorschau). Nur Behandlungen mit v2-Eintrag:
 * die gibt es an allen v2-Standorten (geprueft gegen Strapi, 01.10.2026).
 */
export function adsV2ZoneTiles(
  pathKey: string | null | undefined,
  citySlug: string,
  locationSlug: string,
): AdsV2ZoneTile[] {
  const key = baseKey(pathKey);
  const s = SPECS[key];
  if (!s || !citySlug || !locationSlug) return [];
  const used = new Set<string>();
  return s.related
    .filter((k) => k !== key && SPECS[k])
    // hoechstens 3: eine volle Reihe im 3er-Raster
    .slice(0, 3)
    .map((k) => {
      const posters = adsClipPostersFor(k, citySlug);
      const photo = posters.find((u) => !used.has(u)) ?? posters[0] ?? null;
      if (photo) used.add(photo);
      return {
        key: k.split("/").pop()!,
        label: SPECS[k]!.label,
        href: `/standorte/${citySlug}/${locationSlug}/${k}`,
        image: adsV2ZoneImage(SPECS[k]!.zone),
        photo,
      };
    });
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

// ---------------------------------------------------------------- Hervorhebung

/**
 * Agentur-Feedback (Beispielseite Lippen, 01.10.2026): Fliesstexte ueber drei
 * Zeilen bekommen fett gesetzte Schluesselwoerter, damit man sie ueberfliegen
 * kann. Die Texte stehen im Code (nicht in Strapi), die Hervorhebung auch:
 * feste Begriffe, die auf allen Seiten dasselbe bedeuten, plus Zeitangaben
 * ("3–7 Tagen", "20–30 Minuten"). Kein v-html - die Seite rendert Teile.
 */
export type AdsV2TextPart = { text: string; strong: boolean };

/** Ab dieser Laenge (ca. drei Zeilen auf 375 px) wird hervorgehoben. */
export const ADS_V2_EMPHASIS_MIN_CHARS = 130;

/** Hoechstens so viele fette Stellen je Text, sonst hebt sich nichts mehr ab. */
const MAX_STRONG = 4;

const KEY_TERMS: readonly string[] = [
  "Zufriedenheitsgarantie",
  "kostenlose Nachkontrolle",
  "kostenlose Nachbehandlung",
  "kostenloser Nachbehandlung",
  "kostenlos",
  "Ärztinnen und Ärzte",
  "nach Preisliste berechnet",
  "körpereigener Stoff",
  "bindet Feuchtigkeit",
  "Feuchtigkeit",
  "entspannt gezielt den Muskel",
  "deine Mimik bleibt",
  "Form und Volumen",
  "kein Volumen",
  "füllt kein Volumen auf",
  "Volumen füllen sie nicht auf",
  "Betäubungscreme",
  "sehr feinen Nadeln",
  "direkt weitermachen",
  "sofort",
  "eigenen Blut",
  "Plasma (PRP)",
  "ohne Termin",
  "in Raten",
  "dünnen Zugang",
  "unverbindlich",
];

// "3–7 Tagen", "20–30 Minuten", "6–12 Monate", "14 Tagen", "2 Wochen"
const DURATION = String.raw`\d+(?:[–-]\d+)?\s(?:Minuten|Stunden|Tagen|Tage|Wochen|Monaten|Monate)`;

function escapeRe(v: string): string {
  return v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function emphasisRe(extra: readonly string[] = []): RegExp {
  const terms = [...extra, ...KEY_TERMS].sort((a, b) => b.length - a.length).map(escapeRe);
  return new RegExp([...terms, DURATION].join("|"), "g");
}

const EMPHASIS_RE = emphasisRe();

/**
 * Teilt einen Text in normale und fette Teile. Kurze Texte (unter
 * ADS_V2_EMPHASIS_MIN_CHARS) bleiben ein Teil. Jeder Begriff nur einmal fett.
 */
export function adsV2Emphasize(
  text: string | null | undefined,
  opts: { minChars?: number; extra?: readonly string[] } = {},
): AdsV2TextPart[] {
  const value = String(text ?? "");
  if (!value) return [];
  if (value.length < (opts.minChars ?? ADS_V2_EMPHASIS_MIN_CHARS)) return [{ text: value, strong: false }];
  const re = opts.extra?.length ? emphasisRe(opts.extra) : EMPHASIS_RE;
  const parts: AdsV2TextPart[] = [];
  const seen = new Set<string>();
  let last = 0;
  let count = 0;
  for (const m of value.matchAll(re)) {
    if (count >= MAX_STRONG) break;
    const word = m[0];
    const at = m.index ?? 0;
    // nur ganze Woerter ("sofort" nicht in "Sofortbild")
    const before = value[at - 1] ?? " ";
    const after = value[at + word.length] ?? " ";
    if (/[\p{L}\d]/u.test(before) || /[\p{L}]/u.test(after)) continue;
    const key = word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (at > last) parts.push({ text: value.slice(last, at), strong: false });
    parts.push({ text: word, strong: true });
    last = at + word.length;
    count++;
  }
  if (last < value.length) parts.push({ text: value.slice(last), strong: false });
  return parts;
}

/** "So wirkt es" mit Hervorhebung, unabhaengig von der Laenge (die Spalte
 * neben dem Zonenbild ist schmal: 130 Zeichen sind dort sechs Zeilen). */
export function adsV2HowParts(pathKey: string | null | undefined): AdsV2TextPart[] {
  const s = SPECS[baseKey(pathKey)];
  if (!s) return [];
  return adsV2Emphasize(s.howItWorks, { minChars: 0, extra: s.bold });
}

// ---------------------------------------------------------------- Einwaende

/**
 * "Noch unsicher?" (Agentur-Feedback 01.10.2026): typische Einwaende mit
 * Antwort. Nur Aussagen, die schon auf der Seite stehen (Garantie je Art,
 * Betaeubung aus der FAQ, Dauer aus dem Steckbrief, Raten ueber Gutschein,
 * auch ohne Termin, kostenlose Beratung). Keine Heilversprechen, keine neuen
 * Zahlen. Hyaluron: kein "kostenlos nachspritzen" - weitere ml kosten.
 *
 * `price`: die Preiszeile der Seite, z. B. "ab 119,99 €*" (Variante A, mit
 * Neukundenrabatt) oder "ab 149,99 €" (Variante B, regulaer); fehlt sie,
 * entfaellt der Betrag. `discountPct` nur in Variante A.
 */
export type AdsV2Objection = {
  key: "result" | "pain" | "price" | "time" | "info";
  question: string;
  answer: string;
  /** Knopf unter der Antwort: Gutschein (Raten) oder Beratung buchen. */
  action?: "voucher" | "booking";
};

export function adsV2Objections(
  pathKey: string | null | undefined,
  opts: { price?: string | null; discountPct?: number | null; strapiDuration?: string | null } = {},
): AdsV2Objection[] {
  const key = baseKey(pathKey);
  const s = SPECS[key];
  if (!s) return [];
  const g = adsV2Guarantee(key);
  const faqs = defaultFaqs(s, key);
  const pain = s.faq?.pain?.answer ?? faqs.pain.answer;
  const dauer = adsV2Facts(key, opts.strapiDuration).find((f) => f.key === "dauer")?.value ?? s.facts.dauer;
  const noDowntime = /^keine/.test(s.facts.ausfall);

  const result: AdsV2Objection =
    s.kind === "infusion"
      ? {
          key: "result",
          question: "Ist eine Infusion überhaupt das Richtige für mich?",
          answer:
            "Vorher gibt es ein ärztliches Gespräch zu Gesundheit und Medikamenten. Passt die Infusion nicht zu dir, sagen wir dir das ehrlich. Behandlung nur durch Ärztinnen und Ärzte.",
        }
      : {
          key: "result",
          question:
            s.kind === "mr" || s.kind === "hyaluron"
              ? "Ich habe Angst vor einem unnatürlichen Ergebnis."
              : "Ich bin unsicher, ob mir das Ergebnis gefällt.",
          answer: `Behandelt wird nur von Ärztinnen und Ärzten. ${
            s.kind === "mr"
              ? "Die Menge wird an deine Mimik angepasst – lieber mit weniger starten."
              : s.kind === "hyaluron"
                ? "Ihr besprecht vorher Wunsch und Menge, gearbeitet wird mit kleinen Mengen."
                : "Sie besprechen vorher mit dir, was sinnvoll ist."
          } Dazu gilt unsere Zufriedenheitsgarantie: ${g.short}.`,
        };

  const price = (opts.price ?? "").trim();
  const pct = opts.discountPct ?? null;
  const priceAnswer = [
    price
      ? pct
        ? // Zelgai, 05.10.2026: "reibungsloser" - Preis zuerst, Rabatt als Nebensatz
          `Als Neukundin oder Neukunde zahlst du ${price} – die ${pct} % Rabatt sind darin schon abgezogen.`
        : `Den Preis kennst du vorher: ${price}. In der kostenlosen Beratung besprecht ihr, was bei dir sinnvoll ist.`
      : null,
    "Lieber in Raten zahlen? Das geht über einen Gutschein.",
  ]
    .filter(Boolean)
    .join(" ");

  return [
    result,
    { key: "pain", question: "Ich habe Angst vor Schmerzen.", answer: pain },
    { key: "price", question: "Das ist mir zu teuer.", answer: priceAnswer, action: "voucher" },
    {
      key: "time",
      question: "Ich habe keine Zeit.",
      answer: `${s.kind === "infusion" ? "Die Infusion" : "Die Behandlung"} dauert ${dauer}${noDowntime ? ", danach kannst du meist direkt weitermachen" : ""}. Du kannst auch ohne Termin vorbeikommen.`,
    },
    {
      key: "info",
      question: "Ich möchte mich erst mal nur informieren.",
      answer:
        "Gern. Die Beratung ist kostenlos und unverbindlich: Deine Ärztin oder dein Arzt beantwortet deine Fragen, du entscheidest danach in Ruhe.",
      action: "booking",
    },
  ];
}
