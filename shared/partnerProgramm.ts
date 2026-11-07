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
  title: "Privatpraxis für ästhetische Medizin gründen | MY HEALTH & BEAUTY",
  description:
    "Als Arzt eine Privatpraxis für ästhetische Medizin gründen: unter der Marke MY HEALTH & BEAUTY, mit Website, Software, Einkauf und Ausbildung aus einer Hand.",
};

export type Kachel = { titel: string; text: string };

/**
 * Fotos vom eigenen Shooting 2026 aus der Strapi-Mediathek (large = 800 px).
 * Bewusst Team, Lounge und Beratung, keine Behandlung im Gesicht: Die Seite
 * richtet sich an Aerzte, nicht an Kunden.
 */
const MEDIA = "https://media.myhealthandbeauty.app";
export const BILDER = {
  team: { src: `${MEDIA}/large_2026_MYHB_Tag2_18_c8f564feac.webp`, alt: "Ärzteteam von MY HEALTH & BEAUTY vor dem Logo", width: 800, height: 533 },
  aerzte: { src: `${MEDIA}/large_2026_MYHB_Tag2_40_46146feabe.webp`, alt: "Ärzte von MY HEALTH & BEAUTY in der Lounge", width: 800, height: 533 },
  beratung: { src: `${MEDIA}/large_2026_MYHB_Tag2_107_eeb1dc8823.webp`, alt: "Beratungsgespräch in einer MY HEALTH & BEAUTY Lounge", width: 800, height: 534 },
  empfang: { src: `${MEDIA}/large_2026_MYHB_Tag3_34_ebf7060f7d.webp`, alt: "Empfang einer MY HEALTH & BEAUTY Lounge", width: 800, height: 533 },
  lounge: { src: `${MEDIA}/large_2026_MYHB_Tag3_32_4cedcff959.webp`, alt: "Schild einer MY HEALTH & BEAUTY Lounge im Einkaufszentrum", width: 800, height: 533 },
  software: { src: `${MEDIA}/large_2026_MYHB_Tag2_65_21135b2901.webp`, alt: "Kundenberaterin arbeitet am Tablet mit der MYHB-Software", width: 800, height: 533 },
} as const;

/**
 * Ausbildung an unseren Standorten (Benjamin 05.11.2026): Wer noch nicht
 * genug Erfahrung hat, arbeitet erst bei uns und lernt alle Behandlungsarten.
 * Keine Pflicht. Die fachliche Pruefung vor dem Start gilt aber fuer jeden
 * Partner, denn jede Praxis traegt die Marke.
 */
export const AUSBILDUNG = {
  titel: "Lerne erst bei uns, bevor du selbstständig startest!",
  text: "Dir fehlt noch Erfahrung in der Ästhetik? Dann starte als Arzt an einem unserer Standorte. Dort lernst du alle Behandlungen, die wir anbieten, an der Seite erfahrener Kollegen. Wenn du sicher bist, eröffnest du deine eigene Praxis.",
  punkte: [
    "Alle Behandlungen: Botox, Hyaluron, Skinbooster, Mesotherapie, Infusionen und mehr",
    "Du lernst unsere Standards und unsere Software im Alltag kennen",
    "Kein Muss: Wer schon erfahren ist, startet direkt als Partner",
  ],
};

export const QUALITAET = {
  titel: "Qualität für jede Partnerpraxis",
  text: "Jede Partnerpraxis trägt die Marke MY HEALTH & BEAUTY. Darum lernen wir jeden Arzt vor dem Start auch fachlich kennen, an einem unserer Standorte. Das gilt auch für die Ärzte in deinem Team.",
};

/** Was jede Partnerpraxis bekommt (und nutzt): Marke, Website, Software, Einkauf. */
export const FUNDAMENT: Kachel[] = [
  {
    titel: "Die Marke MY HEALTH & BEAUTY",
    text: "Du startest nicht mit einem unbekannten Namen, sondern als Standort einer Marke, die über 50.000 Kunden in neun Städten schon kennen und schätzen.",
  },
  {
    titel: "Deine Standortseite",
    text: "Dein Standort steht auf myhealthandbeauty.com, mit Seiten zu jeder Behandlung und Online-Termin. So finden dich Kunden bei Google und in ChatGPT.",
  },
  {
    titel: "Unsere Software",
    text: "Buchung, Kunden-App, Kundenakte, Kasse und Lager in einem System. Du behandelst, die Software erledigt den Rest.",
  },
  {
    titel: "Faire Einkaufspreise",
    text: "Produkte und Material bestellst du über uns, zu denselben Konditionen wie unsere eigenen Standorte.",
  },
];

/** Automatisierung, die zur Software gehoert. */
export const AUTOMATISIERUNG: Kachel[] = [
  { titel: "MY-Telefonassistenz", text: "Nimmt jeden Anruf an, beantwortet Fragen und bucht Termine. Auch dann, wenn am Empfang gerade viel los ist." },
  { titel: "MY-Chatassistent", text: "Beantwortet Nachrichten auf WhatsApp rund um die Uhr." },
  { titel: "Terminbestätigung", text: "Kunden bekommen Bestätigung und Erinnerung automatisch. So fallen weniger Termine aus." },
  { titel: "Kunden-App", text: "Kunden buchen selbst, sehen ihren Behandlungsplan und kommen wieder. Du siehst jede Behandlung auf einen Blick." },
];

/** Was man zusaetzlich buchen kann. */
/** Kassen-Paket: Benjamin 05.11.2026, Kasse in der App mit Zahlungsanbieter statt Shopify (myhb-os#2207). */
export const PAKETE: Kachel[] = [
  { titel: "Marketing-Paket", text: "Anzeigen bei Google, Instagram und Facebook, gesteuert von unserem Team." },
  { titel: "Social-Media-Paket", text: "Wir kommen in deine Praxis, drehen deine ersten Videos und betreuen deine Kanäle." },
  { titel: "Recruiting-Paket", text: "Wir finden Kundenberater und Ärzte für dein Team." },
  { titel: "Lohn-Paket", text: "Die monatliche Lohnabrechnung für dein ganzes Team inkl. Zeiterfassung und Schichtenplanung." },
  { titel: "Buchhaltungs-Paket", text: "Belege, Kasse und Zahlungen jeden Monat fertig für deinen Steuerberater." },
  { titel: "Standort-Paket", text: "Wir suchen mit dir den passenden Standort und verhandeln den Mietvertrag." },
  { titel: "Kassen-Paket", text: "Kartenterminal und Kasse über uns. Die Zahlungen deiner Kunden gehen direkt auf dein Konto." },
];

export const PAKETE_HINWEIS =
  "Was nach Nutzung anfällt, etwa Minuten am Telefon oder WhatsApp-Nachrichten, siehst du einzeln auf deiner Abrechnung.";

/** Drei Wege zum eigenen Standort. */
export const STANDORT_WEGE: Kachel[] = [
  { titel: "Dein eigener Standort", text: "Du hast schon eine Fläche oder eine Praxis? Wir prüfen sie gemeinsam mit dir." },
  { titel: "Gemeinsam suchen", text: "Du nennst uns deine Wunschregion, wir finden die passende Fläche und verhandeln den Mietvertrag." },
  { titel: "Standort übernehmen", text: "Auf Anfrage prüfen wir, ob du einen bestehenden Standort von MY übernehmen kannst." },
];

export const SCHRITTE: Kachel[] = [
  { titel: "Bewerbung", text: "Du füllst das Formular unten aus. Das dauert nur 3 Minuten." },
  { titel: "Kennenlernen", text: "Wir melden uns innerhalb von 5 Werktagen und sprechen über dich und deine Pläne." },
  { titel: "Fachlicher Check", text: "Du zeigst uns an einem unserer Standorte, wie du behandelst." },
  { titel: "Standort und Rechnung", text: "Wir finden deinen Standort und rechnen gemeinsam durch, was deine Praxis braucht." },
  { titel: "Vertrag und Aufbau", text: "Wir richten Website, Software und Einkauf ein und stellen gemeinsam mit dir dein Team zusammen." },
  { titel: "Eröffnung", text: "Deine Praxis öffnet, und wir sind weiter für dich da." },
];

export const WEN_WIR_SUCHEN = [
  "Du bist approbierter Arzt in Deutschland.",
  "Du hast Erfahrung in der Ästhetik oder willst sie bei uns sammeln.",
  "Du willst selbstständig sein, ohne Abende mit Buchhaltung und Dienstplänen.",
  "Qualität, Hygiene und ein herzlicher Umgang mit Kunden sind dir wichtig.",
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
      "Du brauchst eine Approbation, einen Standort, eine Rechtsform (meist Privatpraxis oder Praxis-GmbH), ein Team, Software, Einkauf und Marketing. Im Partnerprogramm von MY HEALTH & BEAUTY eröffnest du deine eigene Praxis und bekommst Marke, Website, Software und Einkauf fertig von uns. Marketing, Recruiting, Lohn und Buchhaltung kannst du dazubuchen.",
  },
  {
    frage: "Was kostet die Gründung einer Praxis für ästhetische Medizin?",
    antwort:
      "Das hängt vor allem von Lage, Fläche und Ausstattung ab. Eine klassische Praxisübernahme kostet je nach Fach rund 180.000 € bis über 500.000 € (Analyse von apoBank und Zi). Eine ästhetische Praxis über uns ist deutlich günstiger. Im Partnerprogramm sparst du dir außerdem Webagentur, Praxissoftware und den Aufbau einer eigenen Marke. Was es für deinen Standort kostet, rechnen wir im Gespräch gemeinsam durch.",
  },
  {
    frage: "Was kostet das Partnerprogramm?",
    antwort:
      "Das besprechen wir persönlich mit dir. Marke, Website und Software sind enthalten, Produkte beziehst du über uns. Zusatzpakete buchst du nur, wenn du sie brauchst. Was nach Nutzung anfällt, etwa Minuten am Telefon, siehst du einzeln auf deiner Abrechnung.",
  },
  {
    frage: "Ist das ein Franchise?",
    antwort:
      "Ähnlich: Du führst deine eigene Praxis unter unserer Marke und mit unserem System. Wir nennen es bewusst Partnerprogramm, denn in allen medizinischen Fragen entscheidest du frei.",
  },
  {
    frage: "Bleibe ich medizinisch unabhängig?",
    antwort:
      "Ja. Welche Behandlung für welchen Kunden richtig ist, entscheidest nur du. Wir kümmern uns um Marke, Technik, Einkauf und Verwaltung.",
  },
  {
    frage: "Welche Voraussetzungen brauche ich?",
    antwort:
      "Eine ärztliche Approbation in Deutschland. Ein Facharzttitel ist kein Muss. Erfahrung in der Ästhetik ist ein großer Vorteil, und wenn sie dir noch fehlt, sammelst du sie zuerst an unseren Standorten. Heilpraktiker können nicht Partner werden, denn bei uns behandeln nur Ärzte.",
  },
  {
    frage: "Kann jeder Arzt eine Privatpraxis eröffnen?",
    antwort:
      "Ja. Für eine Privatpraxis brauchst du die Approbation, aber keine Kassenzulassung. Ästhetische Behandlungen zahlen deine Kunden selbst. Du meldest die Praxis bei deiner Ärztekammer an und schließt eine Berufshaftpflicht ab. Bei allen Schritten helfen wir dir.",
  },
  {
    frage: "Gibt es einen Facharzt für ästhetische Medizin?",
    antwort:
      "Nein, einen eigenen Facharzt für ästhetische Medizin gibt es in Deutschland nicht. Behandeln darf jeder Arzt, der die Behandlung sicher beherrscht. Genau dafür kannst du bei uns zuerst an unseren Standorten lernen.",
  },
  {
    frage: "Kann ich mich bei euch ausbilden lassen, bevor ich eine eigene Praxis eröffne?",
    antwort:
      "Ja. Du startest als Arzt an einem unserer Standorte und lernst dort alle Behandlungen, von der Faltenbehandlung über Hyaluron bis zu Infusionen. Wenn du sicher bist, eröffnest du deine eigene Praxis. Das ist ein Angebot, kein Muss.",
  },
  {
    frage: "Wie sichert ihr die Qualität in den Partnerpraxen?",
    antwort:
      "Vor dem Start lernen wir jeden Arzt auch fachlich kennen und lassen uns Behandlungen an einem unserer Standorte zeigen. Das gilt auch für die Ärzte, die später in einer Partnerpraxis arbeiten. Alle Praxen arbeiten mit denselben Standards und derselben Software.",
  },
  {
    frage: "Gilt für ästhetische Behandlungen die GOÄ?",
    antwort:
      "Ja. Auch Behandlungen ohne medizinische Notwendigkeit rechnen Ärzte nach der Gebührenordnung für Ärzte ab (BGH, Urteil vom 23.03.2006, III ZR 223/05). Wie wir das an unseren Standorten machen, zeigen wir dir im Gespräch.",
  },
  {
    frage: "Privatpraxis oder Praxis-GmbH: Was passt?",
    antwort:
      "Beides ist möglich. Was zu dir passt, hängt von der Größe und der Zahl der Ärzte ab. Wir zeigen dir, wie es an anderen Standorten läuft. Die Entscheidung triffst du mit deinem Steuerberater.",
  },
  {
    frage: "Was ist Pflicht und was ist freiwillig?",
    antwort:
      "Pflicht sind die Marke MY HEALTH & BEAUTY, deine Standortseite auf unserer Website, unsere Software und der Einkauf über uns. So erlebt jeder Kunde in jeder Praxis dieselbe Qualität. Freiwillig sind die Zusatzpakete: Marketing, Social Media, Recruiting, Lohn, Buchhaltung, Standortsuche und Kasse.",
  },
  {
    frage: "Kann ich meine bestehende Praxis einbringen?",
    antwort:
      "Ja, wenn Lage und Räume passen. Du kannst uns deinen Standort vorschlagen, mit uns einen neuen suchen oder einen bestehenden Standort von MY übernehmen.",
  },
  {
    frage: "Wie lange dauert es bis zur Eröffnung?",
    antwort:
      "Das hängt vor allem vom Standort ab, denn Mietvertrag und Umbau brauchen die meiste Zeit. Am schnellsten geht es, wenn du einen bestehenden Standort übernimmst. Website, Software und Einkauf richten wir parallel ein.",
  },
  {
    frage: "Wie schnell meldet ihr euch nach der Bewerbung?",
    antwort: "Innerhalb von 5 Werktagen, per Telefon oder E-Mail.",
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
  "Schon in eigener Praxis",
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
  "Ich möchte einen Standort von MY übernehmen",
  "Noch offen",
];

export const AUSBILDUNG_OPTIONEN = [
  "Ja, ich möchte erst bei euch lernen",
  "Vielleicht, lass uns darüber sprechen",
  "Nein, ich bin schon erfahren",
];

export const START = [
  "So bald wie möglich",
  "In 3 bis 6 Monaten",
  "In 6 bis 12 Monaten",
  "Später, erst mal informieren",
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
  ausbildung?: unknown;
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
  ausbildung: string;
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
      ausbildung: ausListe(e.ausbildung, AUSBILDUNG_OPTIONEN),
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
