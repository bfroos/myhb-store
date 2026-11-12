/**
 * Recruiting-Funnel Aerzte fuer Meta-Anzeigen (Ersatz fuer den Perspective-Funnel).
 *
 * Eine Seite je Stadt (/karriere/bewerben/<stadt>), kurz und fuer das Handy:
 * vier Klickfragen wie bei Perspective, dann Kontakt. Die Bewerbung geht ueber
 * /api/karriere/kurzbewerbung an `bewerbung-eingang` der App und landet im
 * Bewerber-Board (Personal > Bewerber), mit Stadt und Kampagne in `herkunft`.
 *
 * Reine Logik ohne Nuxt, damit sie mit node:test pruefbar ist.
 */

export interface FunnelStadt {
  slug: string;
  name: string;
}

/** Staedte mit Recruiting-Anzeigen in Meta (Ad Sets der Kampagne "Recruiting"). */
export const FUNNEL_STAEDTE: readonly FunnelStadt[] = [
  { slug: "aachen", name: "Aachen" },
  { slug: "duisburg", name: "Duisburg" },
  { slug: "duesseldorf", name: "Düsseldorf" },
  { slug: "koeln", name: "Köln" },
  { slug: "recklinghausen", name: "Recklinghausen" },
  { slug: "kaiserslautern", name: "Kaiserslautern" },
];

export const stadtAusSlug = (slug: string | undefined): FunnelStadt | null =>
  FUNNEL_STAEDTE.find((s) => s.slug === (slug ?? "").toLowerCase()) ?? null;

export interface FunnelFrage {
  id: string;
  frage: string;
  optionen: readonly string[];
}

/**
 * Die Fragen des Perspective-Funnels "Recruiting - Arzt", sinngemaess
 * uebernommen, plus die Approbation vorne: Ohne Approbation kann das Team
 * nicht einstellen, und genau diese Bewerbungen fuellen heute das Board.
 */
export const FUNNEL_FRAGEN: readonly FunnelFrage[] = [
  {
    id: "approbation",
    frage: "Hast du eine deutsche Approbation als Arzt/Ärztin?",
    optionen: [
      "Ja, ich bin approbiert",
      "Approbation ist beantragt",
      "Nein, noch nicht",
    ],
  },
  {
    id: "erfahrung",
    frage: "Wie viel Erfahrung hast du in der ästhetischen Medizin?",
    optionen: [
      "Neu im Bereich, keine Erfahrung",
      "Unter 1 Jahr",
      "1–3 Jahre Erfahrung",
      "Mehr als 3 Jahre",
    ],
  },
  {
    id: "motivation",
    frage: "Was reizt dich an der ästhetischen Medizin am meisten?",
    optionen: [
      "Menschen zu mehr Wohlbefinden und Selbstvertrauen verhelfen",
      "Fachliche Spezialisierung in neuen Behandlungsmethoden",
      "Planbare Arbeitszeiten ohne Nacht- und Wochenenddienste",
      "Patientenkontakt & Sinnhaftigkeit",
    ],
  },
  {
    id: "suche",
    frage: "Wie aktiv suchst du gerade?",
    optionen: [
      "Ich bin aktiv auf der Suche",
      "Offen für das richtige Angebot",
      "Erstmal nur informieren",
    ],
  },
];

/** Antworten, die das Recruiting sofort sehen soll: keine Approbation. */
export const ohneApprobation = (antworten: Record<string, string>): boolean =>
  antworten.approbation === "Nein, noch nicht";

const TRACKING = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
  "fbclid",
] as const;

const kurz = (v: unknown, max: number): string =>
  String(v ?? "").trim().slice(0, max);

/** Nur bekannte Tracking-Parameter aus der Query, jeweils gekuerzt. */
export function trackingAusQuery(
  query: Record<string, unknown>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of TRACKING) {
    const roh = Array.isArray(query[k]) ? (query[k] as unknown[])[0] : query[k];
    const w = kurz(roh, 300);
    if (w) out[k] = w;
  }
  return out;
}

export interface KurzbewerbungEingabe {
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  stadt: FunnelStadt;
  antworten: Record<string, string>;
  tracking: Record<string, string>;
}

/** Eingabe -> Body im "eigenen Format" von bewerbung-eingang (myhb-os). */
export function kurzbewerbungFuerApp(e: KurzbewerbungEingabe) {
  const antworten = FUNNEL_FRAGEN
    .filter((f) => f.optionen.includes(e.antworten[f.id] ?? ""))
    .map((f) => ({ frage: f.frage, antwort: e.antworten[f.id]! }));
  return {
    vorname: kurz(e.vorname, 120),
    nachname: kurz(e.nachname, 120),
    email: kurz(e.email, 254).toLowerCase(),
    telefon: kurz(e.telefon, 40),
    stelle: "Arzt (m/w/d)",
    standort: e.stadt.name,
    ausbildungsstand: e.antworten.approbation ?? null,
    nachricht: ohneApprobation(e.antworten)
      ? "Hinweis aus dem Funnel: noch keine Approbation."
      : null,
    quelle: "funnel",
    datenschutz: true,
    antworten,
    herkunft: {
      formular: `funnel-${e.stadt.slug}`,
      stadt: e.stadt.name,
      ...e.tracking,
    },
  };
}

/** Pruefung fuer Formular und Route. Gibt die erste Fehlermeldung zurueck. */
export function pruefeKurzbewerbung(e: {
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  antworten: Record<string, string>;
  datenschutz: boolean;
}): string | null {
  for (const f of FUNNEL_FRAGEN) {
    if (!f.optionen.includes(e.antworten[f.id] ?? "")) {
      return "Bitte beantworte alle Fragen.";
    }
  }
  if (!e.vorname.trim() || !e.nachname.trim()) {
    return "Bitte gib deinen Vor- und Nachnamen an.";
  }
  if (!/^\S+@\S+\.\S+$/.test(e.email.trim())) {
    return "Bitte gib eine gültige E-Mail-Adresse an.";
  }
  if (e.telefon.replace(/\D/g, "").length < 6) {
    return "Bitte gib deine Telefonnummer an.";
  }
  if (!e.datenschutz) return "Bitte stimme der Datenschutzerklärung zu.";
  return null;
}
