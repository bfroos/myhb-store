/**
 * E24 SEO-Pilot "Lippen aufspritzen" (bfroos/myhb-store#311, #312):
 * Hub /behandlungen/hyaluron/lippen-aufspritzen plus die Stadtseiten
 * Köln Arcaden und Düsseldorf Arcaden nach dem freigegebenen Konzept
 * (myhb-app/myhb-os docs/seo-konzept-hub-stadtseiten-lippen-2026-10-12.md)
 * und Benjamins Entscheidungen vom 12.10.2026 (Kommentar in #311).
 *
 * Warum die Texte im Code stehen und nicht in Strapi: Die Live-Seiten
 * duerfen sich bis zur Abnahme nicht aendern. Ein Strapi-Feld waere sofort
 * live (und "veroeffentlichen" nimmt fremde Entwuerfe mit). Erst mit dem
 * Merge des Pilot-PR schalten die drei Seiten um. Fuer den Ausbau auf alle
 * Staedte wandern Standortfakten (Parken, Einzugsgebiet, Sprachen,
 * Lage) nach Strapi (#312, Abschnitt 3.2 des Konzepts).
 *
 * Regeln fuer alle Texte: du-Form, kein Vorher-Nachher (auch nicht als
 * Text), keine Heilversprechen ("kann", "meist"), Aerzt:innen nur mit
 * Vornamen, kein "Dr." ausser Dr. Gero Ruppert, nie "MYH&B", kein
 * Markenname des Muskelrelaxans, kein Neukundenrabatt auf www, Preise
 * immer "149,99 €". Jede Stadtseite lebt von Fakten, die es nur dort gibt.
 */

/** Text mit Links: Strings und {text, href}. */
export type SeoTextPart = string | { text: string; href: string };
export type SeoParagraph = SeoTextPart[];
export type SeoFaq = { question: string; answer: SeoParagraph };

export const SEO_PILOT_HUB_PATH = "/behandlungen/hyaluron/lippen-aufspritzen";
export const SEO_PILOT_PATH_KEY = "hyaluron/lippen-aufspritzen";
const HUB = SEO_PILOT_HUB_PATH;
const KOSTEN = `${HUB}#kosten`;

/**
 * Notschalter: false = alle drei Seiten zeigen wieder die Strapi-Fassung.
 * Auf der PR-Vorschau und nach dem Merge an.
 */
export const SEO_PILOT_ENABLED = true;

// ---------------------------------------------------------------- Hub

export type SeoHubContent = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  subline: string;
  /** Kurzantwort oben (KI-zitierfaehig, speakable). */
  answer: string;
  costIntro: string;
  costInclusive: string[];
  costMarket: SeoParagraph;
  mlHeadline: string;
  ml: SeoParagraph[];
  howHeadline: string;
  how: SeoParagraph[];
  compareHeadline: string;
  compareIntro: string;
  naturalHeadline: string;
  natural: SeoParagraph[];
  riskHeadline: string;
  riskNotFor: string[];
  riskSide: SeoParagraph[];
  whoHeadline: string;
  who: SeoParagraph[];
  faqs: SeoFaq[];
};

export const SEO_HUB_LIPPEN: SeoHubContent = {
  metaTitle: "Lippen aufspritzen mit Hyaluron: Kosten ab 149,99 €",
  metaDescription:
    "Lippen aufspritzen beim Arzt: 0,5 ml 149,99 €, 1 ml 199,99 €. Ablauf, Haltbarkeit, Risiken – und freie Termine an 9 Standorten, auch ohne Termin.",
  h1: "Lippen aufspritzen mit Hyaluron",
  subline: "Ärztlich geplant, ab 149,99 € – an 9 Standorten in Deutschland",
  answer:
    "Beim Lippen aufspritzen setzt eine Ärztin oder ein Arzt Hyaluronsäure gezielt in Kontur und Lippenkörper, um Form und Volumen zu betonen. Bei MY HEALTH & BEAUTY kostet die Behandlung 149,99 € für 0,5 ml und 199,99 € für 1 ml, Beratung und Nachkontrolle nach 14 Tagen inklusive. Sie dauert 30–45 Minuten, das Ergebnis hält meist 6–12 Monate.",
  costIntro:
    "Der Preis richtet sich nach der Menge Hyaluron. Für einen ersten, natürlichen Effekt reichen oft 0,5 ml; für mehr Volumen oder eine deutlichere Kontur wird häufiger 1 ml verwendet. Die Menge legt ihr im Beratungsgespräch gemeinsam fest – du zahlst nur, was tatsächlich gespritzt wird.",
  costInclusive: [
    "Ärztliches Beratungsgespräch vor der Behandlung",
    "Betäubungscreme, auf Wunsch Kühlung",
    "Kostenlose Nachkontrolle nach 14 Tagen; Korrekturen der Form inklusive",
    "Hyaluron von Aliaxin® (IBSA)",
  ],
  costMarket: [
    "Warum die Preise am Markt so unterschiedlich sind: Entscheidend sind die Menge (0,5 oder 1 ml), das verwendete Präparat und ob eine Ärztin oder ein Arzt behandelt. Lippen aufspritzen ist eine ärztliche Behandlung – bei uns behandeln ausschließlich approbierte Ärztinnen und Ärzte. Lieber in Raten zahlen? Das geht über einen ",
    { text: "Gutschein", href: "/gutschein" },
    ", den du beim Kauf mit Klarna oder PayPal in Raten bezahlst.",
  ],
  mlHeadline: "Wie viel Hyaluron brauche ich – 0,5 oder 1 ml?",
  ml: [
    [
      "Das hängt von deinen Lippen und deinem Wunsch ab, nicht von einer festen Regel. Bei der ersten Behandlung starten viele mit 0,5 ml: Die Lippen wirken danach meist gepflegter und etwas voller, ohne dass man es auf den ersten Blick sieht. 1 ml kommt eher infrage, wenn die Lippen sehr schmal sind oder Kontur und Volumen deutlicher werden sollen.",
    ],
    [
      "Unser Rat: lieber schrittweise aufbauen. Nach etwa zwei Wochen ist die Schwellung abgeklungen und das Ergebnis gut zu beurteilen. Bei der Nachkontrolle kann ergänzt werden – zusätzliche Menge wird dann nach Preisliste berechnet.",
    ],
  ],
  howHeadline: "Wie wirkt Hyaluron in den Lippen?",
  how: [
    [
      "Hyaluronsäure ist ein Stoff, den der Körper selbst bildet und der Feuchtigkeit bindet. Als Gel in die Lippen gesetzt, betont es die Kontur (das Lippenrot), gleicht kleine Unregelmäßigkeiten aus und gibt dem Lippenkörper mehr Volumen. Das Ergebnis siehst du sofort; endgültig beurteilen lässt es sich, wenn die Schwellung nach etwa ein bis zwei Wochen abgeklungen ist.",
    ],
    [
      "Der Körper baut das Hyaluron über Monate langsam ab. Meist hält das Ergebnis 6–12 Monate – wie lange genau, hängt von Präparat, Stoffwechsel und Menge ab. Wenn du magst, wird danach aufgefrischt.",
    ],
  ],
  compareHeadline: "Welche Lippenbehandlung passt zu dir?",
  compareIntro:
    "„Lippen aufspritzen“ ist der Klassiker. Je nach Wunsch gibt es Alternativen – welche zu dir passt, klärt die Beratung.",
  naturalHeadline: "Natürlich statt „mehr ist mehr“",
  natural: [
    [
      "Uns ist wichtig, dass deine Lippen zu deinem Gesicht passen. Deshalb arbeiten wir mit kleinen Mengen, achten auf Proportionen von Ober- und Unterlippe und sagen dir ehrlich, wenn mehr Volumen nicht sinnvoll ist. Das Ziel ist ein frischer, gepflegter Effekt – kein Look, der nach Behandlung aussieht.",
    ],
  ],
  riskHeadline: "Für wen ist es nicht geeignet – und welche Risiken gibt es?",
  riskNotFor: [
    "in der Schwangerschaft und Stillzeit",
    "bei einem akuten Lippenherpes oder einer Entzündung im Mundbereich",
    "bei bestimmten Gerinnungsstörungen oder blutverdünnenden Medikamenten (vorher ärztlich klären)",
    "bei einer Allergie gegen Bestandteile des Präparats",
  ],
  riskSide: [
    [
      "In den ersten Tagen sind Schwellung, Rötung und kleine blaue Flecken normal. Selten entstehen tastbare Knötchen, die sich bei der Nachkontrolle behandeln lassen. Sehr selten kann Hyaluron ein Blutgefäß beeinträchtigen – deshalb gehört die Behandlung in ärztliche Hände. Über alle Risiken klärt dich die Ärztin oder der Arzt vorher auf.",
    ],
    [
      "Und wenn dir das Ergebnis nicht gefällt? Hyaluron lässt sich mit dem Enzym Hyaluronidase gezielt wieder auflösen – mehr dazu unter ",
      { text: "Hyaluron auflösen", href: "/behandlungen/hyaluron/hylase" },
      ".",
    ],
  ],
  whoHeadline: "Wer behandelt dich?",
  who: [
    [
      "Bei MY HEALTH & BEAUTY behandeln ausschließlich approbierte Ärztinnen und Ärzte – von der Beratung bis zur Nachkontrolle. Medizinisch verantwortlich ist unser Chefarzt Dr. Gero Ruppert. Wer an deinem Standort behandelt, siehst du auf der Seite deiner Stadt.",
    ],
  ],
  faqs: [
    {
      question: "Was kostet Lippen aufspritzen bei MY HEALTH & BEAUTY?",
      answer: [
        "0,5 ml Hyaluron kosten 149,99 €, 1 ml kostet 199,99 €. Beratung, Betäubungscreme und die Nachkontrolle nach 14 Tagen sind inklusive. Alle Preise: ",
        { text: "Kosten im Überblick", href: KOSTEN },
        ".",
      ],
    },
    {
      question: "Wie viel Hyaluron brauche ich für natürliche Lippen?",
      answer: [
        "Beim ersten Mal reichen oft 0,5 ml. Lieber schrittweise aufbauen: Nach etwa zwei Wochen ist die Schwellung weg, dann kann bei der Nachkontrolle ergänzt werden.",
      ],
    },
    {
      question: "Wie lange hält das Ergebnis?",
      answer: ["Meist 6–12 Monate. Wie lange genau, hängt von Präparat, Menge und deinem Stoffwechsel ab."],
    },
    {
      question: "Tut Lippen aufspritzen weh, und wie lange bin ich geschwollen?",
      answer: [
        "Vorher wird mit einer Creme betäubt, die meisten spüren nur Druck und kurze Pikser. Eine Schwellung ist in den ersten zwei bis fünf Tagen normal; zur Arbeit gehen kannst du meist direkt danach.",
      ],
    },
    {
      question: "Kann man Hyaluron in den Lippen wieder auflösen?",
      answer: [
        "Ja. Mit dem Enzym Hyaluronidase lässt sich Hyaluron gezielt auflösen, auch wenn du woanders behandelt wurdest. Die Ärztin oder der Arzt schaut sich das vorher genau an. Mehr unter ",
        { text: "Hyaluron auflösen", href: "/behandlungen/hyaluron/hylase" },
        ".",
      ],
    },
    {
      question: "Lip Flip oder Hyaluron – was ist der Unterschied?",
      answer: [
        "Beim ",
        { text: "Lip Flip", href: "/behandlungen/botox/lipflip" },
        " entspannt ein Muskelrelaxans den Ringmuskel um den Mund, die Oberlippe zeigt sich etwas mehr – ohne zusätzliches Volumen. Hyaluron gibt Volumen und Kontur. Beides lässt sich kombinieren.",
      ],
    },
    {
      question: "Was muss ich nach der Behandlung beachten?",
      answer: [
        "24 Stunden kein Sport, keine Sauna und kein Solarium, die Lippen nicht massieren und Make-up erst nach einigen Stunden. Kühlen hilft gegen die Schwellung.",
      ],
    },
    {
      question: "Ich wurde woanders behandelt und bin unzufrieden – könnt ihr korrigieren?",
      answer: [
        "Oft ja. Je nach Befund wird das vorhandene Hyaluron aufgelöst oder die Form neu aufgebaut. Mehr dazu unter ",
        { text: "Lippenkorrektur", href: "/behandlungen/hyaluron/lippenkorrektur" },
        ".",
      ],
    },
    {
      question: "Bekomme ich auch ohne Termin eine Behandlung?",
      answer: [
        "An allen Standorten nach Verfügbarkeit ja. Sicherer ist ein Termin – den nächsten freien siehst du oben in der Standorttabelle.",
      ],
    },
  ],
};

/** Vergleich "Welche Lippenbehandlung passt zu dir?" (Preise aus Strapi). */
export type SeoCompareRow = {
  pathKey: string;
  href: string;
  name: string;
  what: string;
  /** Fester Preistext, wenn es in Strapi keinen gibt. */
  fallbackPrice?: string;
};

export const SEO_LIPPEN_COMPARE: SeoCompareRow[] = [
  {
    pathKey: "hyaluron/lippen-aufspritzen",
    href: `${HUB}#kosten`,
    name: "Lippen aufspritzen",
    what: "Mehr Volumen und eine betonte Kontur mit Hyaluron",
  },
  {
    pathKey: "hyaluron/russian-lips",
    href: "/behandlungen/hyaluron/russian-lips",
    name: "Russian Lips",
    what: "Spezielle Technik: die Lippen wirken flacher und höher, das Lippenherz wird betont",
    fallbackPrice: "Preis in der Beratung",
  },
  {
    pathKey: "botox/lipflip",
    href: "/behandlungen/botox/lipflip",
    name: "Lip Flip",
    what: "Ein Muskelrelaxans lässt die Oberlippe etwas mehr zeigen – ohne Volumen",
  },
  {
    pathKey: "hyaluron/lippenkorrektur",
    href: "/behandlungen/hyaluron/lippenkorrektur",
    name: "Lippenkorrektur",
    what: "Ungleichmäßige oder zu volle Lippen nach einer früheren Behandlung neu formen",
  },
  {
    pathKey: "hyaluron/hylase",
    href: "/behandlungen/hyaluron/hylase",
    name: "Hyaluron auflösen",
    what: "Vorhandenes Hyaluron mit dem Enzym Hyaluronidase gezielt abbauen",
  },
];

// ---------------------------------------------------------------- Stadtseiten

export type SeoCityContent = {
  /** "stadt/standort" */
  key: string;
  citySlug: string;
  locationSlug: string;
  city: string;
  district: string;
  center: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  subline: string;
  intro: SeoParagraph[];
  costLocal: string;
  /** Lage im Center: Ueberschrift + Schritte. */
  whereHeadline: string;
  whereSteps: string[];
  transit: string[];
  car: string[];
  parking: string[];
  /** Barrierefreiheit laut Center. */
  accessibility: string;
  /** Quelle und Stand der Center-Angaben (Parken, Linien). */
  factsSource: string;
  /** Einzugsgebiet: Satz + Orte (areaServed). */
  serviceAreaText: string;
  serviceArea: string[];
  /** Sprachen im Team (nur Belegtes). */
  languages: string;
  /** Lokaler Satz im Ablauf. */
  processLocal: string;
  /** Profilthema: unterscheidet die Stadtseiten (Konzept 2.3). */
  profileHeadline: string;
  profile: SeoParagraph[];
  faqs: SeoFaq[];
};

const BOOK_TODAY =
  "Den nächsten freien Termin siehst du oben auf dieser Seite, er kommt live aus unserem Buchungssystem. Spontan vorbeikommen geht nach Verfügbarkeit.";

export const SEO_CITY_LIPPEN: Record<string, SeoCityContent> = {
  "koeln/koeln-arcaden": {
    key: "koeln/koeln-arcaden",
    citySlug: "koeln",
    locationSlug: "koeln-arcaden",
    city: "Köln",
    district: "Kalk",
    center: "Köln Arcaden",
    metaTitle: "Lippen aufspritzen Köln-Kalk: ab 149,99 €",
    metaDescription:
      "Lippen aufspritzen in den Köln Arcaden (Kalk): ärztlich, 0,5 ml 149,99 €. Mo–Sa geöffnet, Fr und Sa bis 21 Uhr, auch ohne Termin. Freie Termine live.",
    h1: "Lippen aufspritzen in Köln – Köln Arcaden, Kalk",
    subline: "Ärztlich geplant · Ebene −1 zwischen dm und Apollo Optik · Stadtbahn 1 und 9 bis Kalk Post",
    intro: [
      [
        "Du möchtest deine Lippen in Köln aufspritzen lassen, ärztlich und ohne lange Wartezeit? Unsere Lounge liegt auf Ebene −1 der Köln Arcaden in Kalk, zwischen dm und Apollo Optik. Von der Stadtbahn-Haltestelle Kalk Post (Linien 1 und 9) gehst du direkt über den Haupteingang ins Center, mit dem Auto parkst du im Parkhaus der Arcaden – die ersten beiden Stunden kosten dort je 1 €.",
      ],
      [
        "Vor jeder Behandlung steht das Gespräch mit deiner Ärztin oder deinem Arzt: Ihr schaut euch Lippenform und Proportionen an und legt fest, ob 0,5 ml oder 1 ml sinnvoll sind. Oft ist weniger der bessere Start, denn bei der Nachkontrolle nach etwa zwei Wochen kann ergänzt werden. Freitags und samstags haben wir bis 21 Uhr geöffnet – gut, wenn du nach der Arbeit kommen möchtest. Alles Grundsätzliche zu Wirkung, Risiken und Kosten findest du auf unserer Seite ",
        { text: "Lippen aufspritzen mit Hyaluron", href: HUB },
        ".",
      ],
    ],
    costLocal: "Inklusive Beratung und kostenloser Nachkontrolle nach 14 Tagen – hier in den Köln Arcaden.",
    whereHeadline: "Ebene −1, zwischen dm und Apollo Optik",
    whereSteps: [
      "Im Center auf Ebene −1 (Untergeschoss) fahren – per Rolltreppe oder Aufzug.",
      "Unsere Lounge liegt zwischen dm und Apollo Optik. Du erkennst uns am hellen Empfang mit dem MY-Logo.",
    ],
    transit: [
      "Stadtbahn 1 (Richtung Bensberg) und 9 (Richtung Königsforst): Haltestelle Kalk Post, direkter Zugang über den Haupteingang",
      "S-Bahn S12 und S19 sowie RB 25: Köln-Trimbornstraße, rund 200 Meter entfernt",
      "Bus 159: Haltestelle Kalk Post",
    ],
    car: [
      "Parkhaus-Einfahrten über die Barcelona-Allee und die Vietorstraße (Einfahrthöhe höchstens 2,10 m)",
      "Navi: Kalker Hauptstraße 55, 51103 Köln",
    ],
    parking: [
      "1.800 Parkplätze, rund um die Uhr geöffnet, ohne Ticket (Kennzeichenerkennung)",
      "1. und 2. Stunde je 1,00 €, ab der 3. Stunde 1,50 € (bei hoher Auslastung 1,50 € je Stunde), höchstens 10,00 € am Tag",
      "Ladestationen für E-Autos neben der Einfahrt P2",
    ],
    accessibility: "Vom Parkhaus kommst du barrierefrei ins Center, Aufzüge fahren auf jede Ebene. Die Haltestelle Kalk Post ist barrierefrei.",
    factsSource: "Parken und Linien laut Köln Arcaden, Stand Oktober 2026. Angaben ohne Gewähr.",
    serviceAreaText:
      "Zu uns kommen Kundinnen aus ganz Köln und dem rechtsrheinischen Umland – viele ohne Umsteigen:",
    serviceArea: [
      "Kalk",
      "Deutz (Linie 1 und 9)",
      "Vingst und Höhenberg",
      "Bergisch Gladbach-Refrath und Bensberg (Linie 1)",
      "Porz (S12)",
      "Rösrath (RB 25)",
      "Troisdorf und Siegburg (S12, S19)",
    ],
    languages: "Im Team sprechen wir Deutsch und Englisch.",
    processLocal:
      "Spontan nach Feierabend? Ohne Termin geht es nach Verfügbarkeit, freitags und samstags sind wir bis 21 Uhr für dich da.",
    profileHeadline: "Nach Feierabend: freitags und samstags bis 21 Uhr",
    profile: [
      [
        "Die Köln Arcaden haben freitags und samstags bis 21 Uhr geöffnet – und wir auch. Das ist praktisch, wenn du tagsüber arbeitest oder die Behandlung mit einem Einkauf verbinden möchtest. Plane insgesamt etwa eine Stunde ein: Beratung, Betäubung und Behandlung dauern zusammen meist 30–45 Minuten, danach kannst du direkt nach Hause.",
      ],
      [
        "Du bist dir noch unsicher, ob klassisches Lippen aufspritzen, ",
        { text: "Russian Lips", href: "/standorte/koeln/koeln-arcaden/hyaluron/russian-lips" },
        " oder ein ",
        { text: "Lip Flip", href: "/standorte/koeln/koeln-arcaden/botox/lipflip" },
        " besser passt? Alles bieten wir hier in den Köln Arcaden an – die Entscheidung trefft ihr gemeinsam in der Beratung.",
      ],
    ],
    faqs: [
      {
        question: "Wo genau ist eure Lounge in den Köln Arcaden?",
        answer: [
          "Auf Ebene −1 (Untergeschoss), zwischen dm und Apollo Optik. Vom Eingang fährst du mit der Rolltreppe oder dem Aufzug ein Stockwerk nach unten.",
        ],
      },
      {
        question: "Gibt es Parkplätze an den Köln Arcaden?",
        answer: [
          "Ja, die Köln Arcaden haben ein Parkhaus mit 1.800 Plätzen, Einfahrt über die Barcelona-Allee oder die Vietorstraße. Laut Center kosten die 1. und 2. Stunde je 1,00 €, jede weitere 1,50 €, höchstens 10,00 € am Tag. Bezahlt wird ohne Ticket über die Kennzeichenerkennung.",
        ],
      },
      {
        question: "Wie komme ich mit Bus und Bahn zu euch?",
        answer: [
          "Mit den Stadtbahnlinien 1 und 9 bis Kalk Post – von dort gehst du direkt über den Haupteingang ins Center. Mit S12, S19 oder RB 25 bis Köln-Trimbornstraße, die Station liegt rund 200 Meter entfernt.",
        ],
      },
      { question: "Bekomme ich heute noch einen Termin für die Lippen?", answer: [BOOK_TODAY] },
      {
        question: "Wer behandelt in Köln?",
        answer: [
          "Ausschließlich approbierte Ärztinnen und Ärzte. Wer hier in den Köln Arcaden behandelt, siehst du weiter oben auf dieser Seite.",
        ],
      },
      {
        question: "Wie lange habt ihr samstags geöffnet?",
        answer: ["Samstags wie freitags bis 21 Uhr, montags bis donnerstags bis 20 Uhr. Sonntags ist geschlossen."],
      },
      {
        question: "Was kostet Lippen aufspritzen in Köln?",
        answer: [
          "0,5 ml kosten 149,99 €, 1 ml 199,99 € – derselbe Preis wie an allen unseren Standorten. Was im Preis enthalten ist, steht unter ",
          { text: "Lippen aufspritzen Kosten", href: KOSTEN },
          ".",
        ],
      },
    ],
  },
  "duesseldorf/duesseldorf-arcaden": {
    key: "duesseldorf/duesseldorf-arcaden",
    citySlug: "duesseldorf",
    locationSlug: "duesseldorf-arcaden",
    city: "Düsseldorf",
    district: "Bilk",
    center: "Düsseldorf Arcaden",
    metaTitle: "Lippen aufspritzen Düsseldorf-Bilk: ab 149,99 €",
    metaDescription:
      "Lippen aufspritzen in den Düsseldorf Arcaden (Bilk): ärztlich, 0,5 ml 149,99 €. Direkt am S-Bahnhof Bilk, Mo–Sa 10–20 Uhr, auch ohne Termin.",
    h1: "Lippen aufspritzen in Düsseldorf – Düsseldorf Arcaden, Bilk",
    subline: "Ärztlich geplant · Ebene −1 gegenüber ALDI · direkt am S-Bahnhof Düsseldorf-Bilk",
    intro: [
      [
        "Du willst deine Lippen in Düsseldorf aufspritzen lassen, ärztlich und gut erreichbar? Unsere Lounge findest du in den Düsseldorf Arcaden in Bilk, auf Ebene −1 direkt gegenüber von ALDI. S-Bahn, Stadtbahn, Busse und Regionalzüge halten am Bahnhof Düsseldorf-Bilk direkt vor dem Center, mit dem Auto fährst du über die Bachstraße ins Parkhaus der Arcaden.",
      ],
      [
        "Bei uns behandeln ausschließlich approbierte Ärztinnen und Ärzte. Im Beratungsgespräch klärt ihr, ob eine klassische Lippenunterspritzung, Russian Lips oder ein Lip Flip zu deinem Wunsch passt und wie viel Hyaluron sinnvoll ist. Und falls eine frühere Behandlung nicht so geworden ist wie gewünscht: Ob sich das Hyaluron auflösen oder die Form korrigieren lässt, wird hier vorher ärztlich untersucht. Alles Grundsätzliche zu Ablauf, Risiken und Kosten findest du auf unserer Seite ",
        { text: "Lippen aufspritzen mit Hyaluron", href: HUB },
        ".",
      ],
    ],
    costLocal: "Inklusive Beratung und kostenloser Nachkontrolle nach 14 Tagen – hier in den Düsseldorf Arcaden.",
    whereHeadline: "Ebene −1, gegenüber von ALDI",
    whereSteps: [
      "Im Center auf Ebene −1 (Untergeschoss) – Rolltreppen und Aufzüge sind vorhanden.",
      "Unsere Lounge liegt direkt gegenüber von ALDI.",
    ],
    transit: [
      "S-Bahn S8, S11 und S28: Düsseldorf-Bilk S, Zugang über den Vorplatz",
      "Regionalzüge RE 4, RE 6, RE 10 und RE 13: Bahnhof Düsseldorf-Bilk",
      "Stadtbahn U71, U72, U73 und U83: Haltestelle Bilk S",
      "Busse SB56, 835 und 836: Haltestelle Bilk S; Stadtbahn 707 und Bus 736: Bilker Allee/Friedrichstraße",
    ],
    car: [
      "A46, Ausfahrt 23 Düsseldorf-Bilk, weiter auf der L52",
      "A57, Ausfahrt 22 Neuss-Hafen, weiter auf der B1 Richtung Bilk",
      "Navi für das Parkhaus: Bachstraße 141, 40217 Düsseldorf",
    ],
    parking: [
      "Über 800 Parkplätze, davon 18 für Menschen mit Behinderung, Einfahrthöhe höchstens 2 m",
      "Jede angefangene Stunde 1,60 €, höchstens 13,00 € am Tag",
      "Einfahrt montags bis samstags 5:30–22 Uhr, Ausfahrt jederzeit",
    ],
    accessibility: "Das Center ist barrierefrei, Aufzüge verbinden alle Ebenen. Am Bahnhof Bilk gibt es Aufzüge zu den Gleisen.",
    factsSource: "Parken und Linien laut Düsseldorf Arcaden, Stand Oktober 2026. Angaben ohne Gewähr.",
    serviceAreaText: "Zu uns kommen Kundinnen aus ganz Düsseldorf und vom linken Niederrhein – viele ohne Umsteigen:",
    serviceArea: [
      "Bilk, Unterbilk und Friedrichstadt",
      "Oberbilk und Medienhafen",
      "Volmerswerth und Flehe (U71, U83)",
      "Holthausen und Benrath (U72)",
      "Oberkassel (Bus 835, 836)",
      "Neuss (S8, S11, S28)",
      "Kaarst (S28) und Dormagen (S11)",
    ],
    languages: "Im Team sprechen wir Deutsch und Englisch.",
    processLocal: "Spontan vorbeikommen geht nach Verfügbarkeit – montags bis samstags von 10 bis 20 Uhr.",
    profileHeadline: "Lässt sich Hyaluron in den Lippen wieder auflösen?",
    profile: [
      [
        "Ja. Hyaluron lässt sich mit dem Enzym Hyaluronidase gezielt abbauen. Das kann sinnvoll sein, wenn ein früheres Ergebnis ungleichmäßig ist, verrutscht wirkt oder dir einfach zu viel ist – egal, wo du behandelt wurdest. Die Ärztin oder der Arzt schaut sich die Lippen vorher genau an und bespricht mit dir, ob Auflösen, eine Korrektur oder beides sinnvoll ist.",
      ],
      [
        "Das Enzym wirkt meist innerhalb von ein bis zwei Tagen. Ist alles abgeklungen, kann nach etwa zwei Wochen neu aufgebaut werden. Mehr dazu unter ",
        { text: "Hyaluron auflösen in Düsseldorf", href: "/standorte/duesseldorf/duesseldorf-arcaden/hyaluron/hylase" },
        " und ",
        { text: "Lippenkorrektur in Düsseldorf", href: "/standorte/duesseldorf/duesseldorf-arcaden/hyaluron/lippenkorrektur" },
        ".",
      ],
    ],
    faqs: [
      {
        question: "Wo finde ich euch in den Düsseldorf Arcaden?",
        answer: ["Auf Ebene −1 (Untergeschoss), direkt gegenüber von ALDI. Rolltreppen und Aufzüge sind vorhanden."],
      },
      {
        question: "Gibt es Parkplätze an den Düsseldorf Arcaden?",
        answer: [
          "Ja, die Düsseldorf Arcaden haben ein Parkhaus mit über 800 Plätzen, Einfahrt über die Bachstraße (Navi: Bachstraße 141). Laut Center kostet jede angefangene Stunde 1,60 €, höchstens 13,00 € am Tag.",
        ],
      },
      {
        question: "Welche Bahn hält direkt am Center?",
        answer: [
          "Am Bahnhof Düsseldorf-Bilk direkt am Center halten die S-Bahnen S8, S11 und S28, die Regionalzüge RE 4, RE 6, RE 10 und RE 13 und die Stadtbahnen U71, U72, U73 und U83.",
        ],
      },
      {
        question: "Kann ich eine Lippenbehandlung von woanders bei euch korrigieren oder auflösen lassen?",
        answer: [
          "Ja, nach ärztlicher Untersuchung. Je nach Befund wird das Hyaluron aufgelöst, die Form korrigiert oder beides. Siehe ",
          { text: "Lippenkorrektur", href: "/standorte/duesseldorf/duesseldorf-arcaden/hyaluron/lippenkorrektur" },
          ".",
        ],
      },
      { question: "Bekomme ich heute noch einen Termin?", answer: [BOOK_TODAY] },
      {
        question: "Wer behandelt in Düsseldorf?",
        answer: [
          "Ausschließlich approbierte Ärztinnen und Ärzte. Wer hier in den Düsseldorf Arcaden behandelt, siehst du weiter oben auf dieser Seite.",
        ],
      },
      {
        question: "Was kostet Lippen aufspritzen in Düsseldorf?",
        answer: [
          "0,5 ml kosten 149,99 €, 1 ml 199,99 € – derselbe Preis wie an allen unseren Standorten. Was im Preis enthalten ist, steht unter ",
          { text: "Lippen aufspritzen Kosten", href: KOSTEN },
          ".",
        ],
      },
    ],
  },
};

/** Stadtseite des Pilots oder null. */
export function seoPilotCity(
  citySlug: string | null | undefined,
  locationSlug: string | null | undefined,
  pathKey: string | null | undefined,
): SeoCityContent | null {
  if (!SEO_PILOT_ENABLED) return null;
  const key = String(pathKey ?? "").replace(/^\/+|\/+$/g, "");
  if (key !== SEO_PILOT_PATH_KEY) return null;
  return SEO_CITY_LIPPEN[`${citySlug}/${locationSlug}`] ?? null;
}

/** Hub des Pilots? */
export function isSeoPilotHub(pathKey: string | null | undefined): boolean {
  if (!SEO_PILOT_ENABLED) return false;
  return String(pathKey ?? "").replace(/^\/+|\/+$/g, "") === SEO_PILOT_PATH_KEY;
}

/** Link auf die Stadtseite eines Standorts (fuer die Standorttabelle). */
export function seoCityLippenPath(citySlug: string, locationSlug: string): string {
  return `/standorte/${citySlug}/${locationSlug}/${SEO_PILOT_PATH_KEY}`;
}

/** Hat der Standort eine ausgebaute Pilot-Stadtseite (Linktext mit Begriff)? */
export function hasSeoCityPage(citySlug: string, locationSlug: string): boolean {
  return !!SEO_CITY_LIPPEN[`${citySlug}/${locationSlug}`];
}

/** Absatz als reinen Text (Schema, Meta). */
export function paragraphText(p: SeoParagraph): string {
  return p.map((x) => (typeof x === "string" ? x : x.text)).join("");
}
