/**
 * Partnerprogramm fuer Aerzte (E32, myhb-app/myhb-os#2194, Seite bfroos/myhb-store#403).
 *
 * Inhalte und Formularpruefung der Seite /partnerpraxis. Nicht /partner: dort
 * liegen seit #835 die Adcell-Banner (public/partner/adcell/), und die Nuxt-
 * Route kollidierte mit dem Ordner (Weiterleitungsschleife im Dev-Server) an einem Ort, damit Seite,
 * Server-Route und Test dieselben Werte nutzen.
 *
 * Wortwahl (Recherche 05.11.2026, docs/partnerprogramm-e32.md in myhb-os):
 * - "Partnerprogramm" und "Partnerpraxis", nicht "Franchise": Das Wort klingt
 *   nach Weisungsrecht und Umsatzbeteiligung, genau den Angriffspunkten der
 *   Berufsordnung (§§ 30-32 MBO-Ae). Koerperformen nennt sich "Lizenz statt
 *   Franchise".
 * - Keine Umsatz- oder Patientenversprechen, keine Gebuehr in Prozent vom
 *   Honorar, keine Preise (Benjamin: Gebuehren nicht auf die Seite).
 * - Ausdruecklich: medizinische Entscheidungen trifft nur der Arzt.
 * - "Kunden", "Aerzte", "Kundenberater", nie die weibliche Form.
 */

export const PARTNER_PATH = "/partnerpraxis";
export const PARTNER_SUBDOMAIN = "partner.myhealthandbeauty.com";

export const PARTNER_SEO = {
  title: "Ästhetische Praxis gründen: Partnerprogramm für Ärzte | MY HEALTH & BEAUTY",
  description:
    "Als Arzt in der ästhetischen Medizin selbstständig machen: eigene Praxis unter der Marke MY HEALTH & BEAUTY, mit Website, Software, Einkauf und Service aus einer Hand.",
};

export type Kachel = { titel: string; text: string };

/** Was jede Partnerpraxis bekommt (und nutzt): Marke, Website, Software, Einkauf. */
export const FUNDAMENT: Kachel[] = [
  {
    titel: "Die Marke MY HEALTH & BEAUTY",
    text: "Deine Praxis eröffnet als Standort einer bekannten Marke für ästhetische Medizin, mit Auftritt, Einrichtungskonzept und Qualitätsstandards, die an unseren eigenen Standorten funktionieren.",
  },
  {
    titel: "Deine Standortseite mit allen Unterseiten",
    text: "Dein Standort erscheint auf myhealthandbeauty.com, mit eigenen Seiten je Behandlung, Öffnungszeiten, Ärzteprofilen und Online-Termin. Gebaut für Google und für KI-Suchen wie ChatGPT.",
  },
  {
    titel: "Unsere Software für den ganzen Ablauf",
    text: "Online-Buchung, Kunden-App, Kundenakte und Behandlungsdokumentation, automatische Terminbestätigung und Erinnerung, Kasse, Warenwirtschaft und Inventur. Alles in einem System, das wir selbst entwickeln und täglich nutzen.",
  },
  {
    titel: "Einkauf zu unseren Konditionen",
    text: "Produkte und Material bestellst du über uns. Du bekommst dieselben Einkaufskonditionen wie unsere eigenen Standorte und musst keine Lieferanten verhandeln.",
  },
];

/** Automatisierung, die zur Software gehoert. */
export const AUTOMATISIERUNG: Kachel[] = [
  { titel: "KI am Telefon", text: "Nimmt Anrufe an, beantwortet Fragen und bucht Termine, auch wenn am Empfang gerade niemand frei ist." },
  { titel: "KI im Chat", text: "Beantwortet Kundennachrichten, etwa auf WhatsApp, rund um die Uhr." },
  { titel: "Terminbestätigung und Erinnerung", text: "Kunden bekommen Bestätigung und Erinnerung automatisch, das senkt Ausfälle." },
  { titel: "Kunden-App und CRM", text: "Kunden buchen in der App und sehen ihr Guthaben. Du siehst jede frühere Behandlung auf einen Blick." },
];

/** Was man zusaetzlich buchen kann. */
export const PAKETE: Kachel[] = [
  { titel: "Marketing", text: "Anzeigen bei Google und Meta, lokale Sichtbarkeit und Auswertung, gesteuert von unserem Team." },
  { titel: "Social Media mit Videodreh", text: "Wir kommen in deine Praxis, drehen die ersten Videos für Instagram und Facebook und betreuen deine Kanäle." },
  { titel: "Recruiting", text: "Wir suchen Kundenberater und Ärzte für dich, mit Stellenanzeigen, Vorauswahl und Bewerbermanagement in der App." },
  { titel: "Lohnabrechnung", text: "Monatliche Lohnabrechnung deiner Mitarbeiter, ohne dass du Stunden und Belege zusammensuchst." },
  { titel: "Vorbereitende Buchhaltung", text: "Belege, Kasse und Zahlungen aufbereitet für deinen Steuerberater, jeden Monat." },
  { titel: "Standortsuche und Mietvertrag", text: "Wir suchen mit dir den passenden Standort und verhandeln den Mietvertrag. Das machen wir für unsere eigenen Standorte genauso." },
];

export const PAKETE_HINWEIS =
  "Leistungen, die nach Nutzung anfallen, etwa Gesprächsminuten der Telefon-KI oder WhatsApp-Nachrichten, weisen wir einzeln und nachvollziehbar aus.";

/** Drei Wege zum eigenen Standort. */
export const STANDORT_WEGE: Kachel[] = [
  { titel: "Du hast schon einen Standort", text: "Du schlägst uns eine Fläche oder deine bestehende Praxis vor. Wir prüfen Lage, Größe und Umfeld mit dir." },
  { titel: "Wir suchen gemeinsam", text: "Du nennst uns deine Wunschregion. Wir suchen passende Flächen, oft in Einkaufszentren, und verhandeln den Mietvertrag." },
  { titel: "Du übernimmst einen MYHB-Standort", text: "Auf Anfrage prüfen wir, ob einer unserer bestehenden Standorte an dich übergehen kann, damit du ihn selbstständig weiterführst." },
];

export const SCHRITTE: Kachel[] = [
  { titel: "Bewerbung", text: "Du füllst das kurze Formular unten aus. Das dauert drei Minuten." },
  { titel: "Kennenlernen", text: "Wir melden uns innerhalb von fünf Werktagen und sprechen über dich, deine Pläne und deine Region." },
  { titel: "Standort und Rechnung", text: "Wir klären den Standort und rechnen gemeinsam durch, was deine Praxis kostet und was sie braucht." },
  { titel: "Vertrag und Aufbau", text: "Nach dem Vertrag richten wir Website, Software und Einkauf ein, du stellst dein Team zusammen." },
  { titel: "Eröffnung", text: "Deine Praxis geht online und öffnet. Wir bleiben im Alltag an deiner Seite." },
];

export const WEN_WIR_SUCHEN = [
  "Du bist approbierter Arzt in Deutschland.",
  "Du hast Erfahrung mit ästhetischen Behandlungen wie Hyaluron oder Faltenbehandlung, oder willst sie gezielt aufbauen.",
  "Du willst selbstständig sein, aber nicht deine Abende mit Buchhaltung, Bestellungen und Dienstplänen verbringen.",
  "Dir sind Qualität, Hygiene und ein freundlicher Umgang mit Kunden wichtig, denn sie tragen deine Praxis und die Marke.",
];

export type Frage = { frage: string; antwort: string };

/**
 * FAQ: sichtbar auf der Seite und als FAQPage-Schema. Formuliert wie die
 * Fragen, die Aerzte bei Google und ChatGPT stellen (Recherche 05.11.2026).
 */
export const FRAGEN: Frage[] = [
  {
    frage: "Wie kann ich mich als Arzt in der ästhetischen Medizin selbstständig machen?",
    antwort:
      "Du brauchst eine Approbation, einen geeigneten Standort, eine Rechtsform (meist Privatpraxis oder Praxis-GmbH), Personal, Software, Einkauf und Marketing. Im Partnerprogramm von MY HEALTH & BEAUTY gründest du deine eigene Praxis, bekommst Marke, Website, Software und Einkauf aber fertig von uns und kannst Marketing, Recruiting, Lohn und Buchhaltung dazubuchen.",
  },
  {
    frage: "Was kostet die Gründung einer Praxis für ästhetische Medizin?",
    antwort:
      "Das hängt vor allem von Lage, Fläche und Ausstattung ab. Eine klassische Praxisübernahme kostet je nach Fach rund 180.000 € bis über 500.000 € (Analyse von apoBank und Zi). Eine ästhetische Praxis kommt meist mit weniger Geräten aus. Im Partnerprogramm fallen zudem die Kosten für Webagentur, Praxissoftware und Markenaufbau weg. Eine Rechnung für deinen Standort machen wir im Gespräch.",
  },
  {
    frage: "Was kostet das Partnerprogramm?",
    antwort:
      "Die Konditionen besprechen wir im persönlichen Gespräch. Marke, Website und Software sind enthalten, Produkte beziehst du über uns. Zusatzpakete wie Marketing oder Lohnabrechnung buchst du nur, wenn du sie brauchst. Was nach Nutzung anfällt, etwa Minuten der Telefon-KI oder WhatsApp-Nachrichten, siehst du einzeln auf der Abrechnung.",
  },
  {
    frage: "Ist das ein Franchise?",
    antwort:
      "Das Partnerprogramm funktioniert ähnlich: Du führst deine eigene Praxis unter unserer Marke und nutzt unser System. Wir nennen es bewusst Partnerprogramm, denn als Arzt bleibst du in allen medizinischen Fragen frei. Dazu gibt es kein Weisungsrecht.",
  },
  {
    frage: "Bleibe ich medizinisch unabhängig?",
    antwort:
      "Ja. Welche Behandlung für welchen Kunden richtig ist, entscheidest nur du. Wir kümmern uns um Marke, Technik, Einkauf und Verwaltung, nicht um Diagnosen oder Behandlungen.",
  },
  {
    frage: "Welche Voraussetzungen brauche ich?",
    antwort:
      "Eine ärztliche Approbation in Deutschland. Ein Facharzttitel ist kein Muss. Erfahrung mit ästhetischen Behandlungen ist ein großer Vorteil. Heilpraktiker können nicht Partner werden, weil bei uns ausschließlich Ärzte behandeln.",
  },
  {
    frage: "Gilt für ästhetische Behandlungen die GOÄ?",
    antwort:
      "Ja. Auch Behandlungen ohne medizinische Notwendigkeit rechnen Ärzte nach der Gebührenordnung für Ärzte ab (BGH, Urteil vom 23.03.2006, III ZR 223/05). Wie wir das an unseren Standorten umsetzen, zeigen wir dir im Gespräch.",
  },
  {
    frage: "Privatpraxis oder Praxis-GmbH: Was passt?",
    antwort:
      "Beides ist möglich. Was für dich passt, hängt von Größe, Zahl der Ärzte und deinen Plänen ab. Wir zeigen dir, wie es an anderen Standorten läuft, die Entscheidung triffst du mit deinem Steuerberater.",
  },
  {
    frage: "Was ist Pflicht und was ist freiwillig?",
    antwort:
      "Pflicht sind die Marke MY HEALTH & BEAUTY, deine Standortseite auf unserer Website, unsere Software und der Einkauf über uns. So sieht jede Praxis gleich gut aus und jeder Kunde erlebt dieselbe Qualität. Freiwillig sind die Zusatzpakete: Marketing, Social Media, Recruiting, Lohnabrechnung, vorbereitende Buchhaltung und Standortsuche.",
  },
  {
    frage: "Kann ich meine bestehende Praxis einbringen?",
    antwort:
      "Ja, wenn Lage und Räume passen. Du kannst uns deinen Standort vorschlagen, mit uns einen neuen suchen oder einen bestehenden Standort von MY HEALTH & BEAUTY übernehmen.",
  },
  {
    frage: "Wie lange dauert es bis zur Eröffnung?",
    antwort:
      "Das hängt vor allem vom Standort ab: Umbau und Mietvertrag brauchen die meiste Zeit. Am schnellsten geht es, wenn du einen bestehenden Standort übernimmst. Website, Software und Einkauf richten wir parallel ein.",
  },
  {
    frage: "Wie schnell meldet ihr euch nach der Bewerbung?",
    antwort: "Innerhalb von fünf Werktagen, per Telefon oder E-Mail.",
  },
];

/* ---------------------------------------------------------------- Formular */

export const FACHRICHTUNGEN = [
  "Dermatologie",
  "Plastische und Ästhetische Chirurgie",
  "Allgemeinmedizin",
  "Mund-Kiefer-Gesichtschirurgie",
  "HNO",
  "Gynäkologie",
  "Innere Medizin",
  "Ohne Facharzt / in Weiterbildung",
  "Andere",
];

export const SITUATIONEN = [
  "Angestellt in Klinik oder Praxis",
  "Bereits in eigener Praxis niedergelassen",
  "In Weiterbildung",
  "Andere",
];

export const ERFAHRUNG = [
  "Noch keine",
  "Unter 2 Jahre",
  "2 bis 5 Jahre",
  "Über 5 Jahre",
];

export const STANDORTWEG_OPTIONEN = [
  "Ich habe schon einen Standort oder eine Praxis",
  "Ich möchte gemeinsam einen Standort suchen",
  "Ich möchte einen MYHB-Standort übernehmen",
  "Noch offen",
];

export const START = [
  "So bald wie möglich",
  "In 3 bis 6 Monaten",
  "In 6 bis 12 Monaten",
  "Später / erst informieren",
];

export const PAKET_NAMEN = PAKETE.map((p) => p.titel);

export const PARTNER_MAX_NACHRICHT = 3000;

export type PartnerEingabe = {
  vorname?: unknown;
  nachname?: unknown;
  email?: unknown;
  telefon?: unknown;
  stadt?: unknown;
  fachrichtung?: unknown;
  situation?: unknown;
  erfahrung?: unknown;
  standortweg?: unknown;
  start?: unknown;
  pakete?: unknown;
  nachricht?: unknown;
  datenschutz?: unknown;
  /** Honeypot */
  website?: unknown;
  herkunft?: unknown;
};

export type PartnerAnfrage = {
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  stadt: string;
  fachrichtung: string;
  situation: string;
  erfahrung: string;
  standortweg: string;
  start: string;
  pakete: string[];
  nachricht: string;
  herkunft: Record<string, string>;
};

const kurz = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const ausListe = (v: unknown, liste: string[]) => {
  const s = kurz(v);
  return liste.includes(s) ? s : "";
};

/** Herkunftsfelder, die die Seite mitschickt (alles andere faellt weg). */
const HERKUNFT_FELDER = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "referrer", "seite"];

export function pruefePartnerEingabe(
  e: PartnerEingabe,
): { ok: true; bot: boolean; anfrage: PartnerAnfrage } | { ok: false; fehler: string } {
  const bot = kurz(e.website) !== "";
  const vorname = kurz(e.vorname, 100);
  const nachname = kurz(e.nachname, 100);
  const email = kurz(e.email, 254);
  const telefon = kurz(e.telefon, 40);
  const stadt = kurz(e.stadt, 120);
  if (!vorname || !nachname) return { ok: false, fehler: "Bitte gib deinen Vor- und Nachnamen an." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, fehler: "Bitte prüf deine E-Mail-Adresse." };
  if (telefon.replace(/\D/g, "").length < 6) return { ok: false, fehler: "Bitte gib eine Telefonnummer an." };
  if (!stadt) return { ok: false, fehler: "Bitte nenn uns deine Wunschregion oder Stadt." };
  if (e.datenschutz !== true && e.datenschutz !== "true") {
    return { ok: false, fehler: "Bitte stimm der Verarbeitung deiner Angaben zu." };
  }
  const pakete = (Array.isArray(e.pakete) ? e.pakete : [])
    .map((p) => kurz(p))
    .filter((p) => PAKET_NAMEN.includes(p));
  const herkunftRoh = (e.herkunft && typeof e.herkunft === "object" ? e.herkunft : {}) as Record<string, unknown>;
  const herkunft: Record<string, string> = {};
  for (const k of HERKUNFT_FELDER) {
    const v = kurz(herkunftRoh[k], 300);
    if (v) herkunft[k] = v;
  }
  return {
    ok: true,
    bot,
    anfrage: {
      vorname,
      nachname,
      email,
      telefon,
      stadt,
      fachrichtung: ausListe(e.fachrichtung, FACHRICHTUNGEN),
      situation: ausListe(e.situation, SITUATIONEN),
      erfahrung: ausListe(e.erfahrung, ERFAHRUNG),
      standortweg: ausListe(e.standortweg, STANDORTWEG_OPTIONEN),
      start: ausListe(e.start, START),
      pakete,
      nachricht: kurz(e.nachricht, PARTNER_MAX_NACHRICHT),
      herkunft,
    },
  };
}

/** ".../functions/v1/lead-anfrage" -> ".../functions/v1/partner-anfrage" */
export function partnerAnfrageUrl(leadAnfrageUrl: string | undefined): string | null {
  const url = (leadAnfrageUrl ?? "").trim();
  if (!/\/functions\/v1\/lead-anfrage\/?$/.test(url)) return null;
  return url.replace(/lead-anfrage\/?$/, "partner-anfrage");
}

/** FAQPage-Schema aus FRAGEN (Text 1:1 wie auf der Seite). */
export function partnerFaqSchema(fragen: Frage[] = FRAGEN) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: fragen.map((f) => ({
      "@type": "Question",
      name: f.frage,
      acceptedAnswer: { "@type": "Answer", text: f.antwort },
    })),
  };
}

/** Die Seite als Angebot an Aerzte, fuer Suchmaschinen und KI-Suchen. */
export function partnerServiceSchema(siteUrl: string) {
  const url = `${siteUrl.replace(/\/$/, "")}${PARTNER_PATH}`;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#partnerprogramm`,
    name: "Partnerprogramm für Ärzte",
    serviceType: "Partnerprogramm für Praxen der ästhetischen Medizin",
    description: PARTNER_SEO.description,
    url,
    areaServed: { "@type": "Country", name: "Deutschland" },
    audience: { "@type": "Audience", audienceType: "Ärzte, die eine eigene Praxis für ästhetische Medizin gründen wollen" },
    provider: { "@type": "Organization", name: "MY HEALTH & BEAUTY", url: siteUrl },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Leistungen für Partnerpraxen",
      itemListElement: [...FUNDAMENT, ...PAKETE].map((k) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: k.titel, description: k.text },
      })),
    },
  };
}
