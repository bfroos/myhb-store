/**
 * E24 #313: Kostenseiten je Hauptthema (www).
 *
 * Die drei Seiten /p/botox-kosten, /p/hyaluron-spritzen-kosten und
 * /p/skinbooster-preise tragen den Suchbegriff schon in URL und Title, waren
 * aber schwach: Preise als Ueberschriften statt Tabelle, keine Erklaerung,
 * keine Fragen, kein Preis-Schema, teils widerspruechliche Preise
 * (Polynukleotide "ab 299,99 €" auf der Seite, 229,99 € in Strapi).
 * Neu: Kurzantwort, Preistabelle direkt aus den Strapi-Preisen,
 * "Im Preis enthalten", "Wovon haengt der Preis ab?", Preise je Standort,
 * Fragen mit Kaufabsicht (Analyse Abschnitt 5) und FAQPage-/Angebots-Schema.
 * Die Strapi-Bloecke darunter (Behandlungen, Standortkarte, Bewertungen)
 * bleiben; Hero und alte Preistabelle der Strapi-Seite ersetzt diese Vorlage.
 *
 * Preise stehen als Platzhalter {schluessel} in den Texten und kommen beim
 * Ausliefern aus Strapi (costPagePrices), damit Text und Tabelle nie
 * auseinanderlaufen. Fehlt ein Preis, faellt der ganze Satz weg.
 *
 * Regeln: du-Form, kein Vorher-Nachher, keine Heilversprechen, kein
 * Neukundenrabatt auf www. "Botox" steht nur dort, wo es heute schon steht
 * (Title/H1 der Seite /p/botox-kosten) und als Erklaerung des Wirkstoffs -
 * die Rechtsfrage dazu ist offen (#309).
 */

export type CostFaq = { question: string; answer: string };

export type CostPageConfig = {
  slug: string;
  /** Strapi-Produktkategorie (prices-page) mit Behandlungen und Praeparaten. */
  categorySlug: string;
  /** Kategorie-Pfad der Standortseiten (/standorte/{stadt}/{standort}/{pfad}). */
  locationCategoryPath: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  subline: string;
  answer: string;
  tableHeadline: string;
  /** Spaltenueberschrift der Behandlungsspalte. */
  tableLabel: string;
  /** Praeparate-Tabelle zeigen (Hyaluron: Preis je ml und Praeparat). */
  showProducts?: boolean;
  /** Varianten des Praeparats als eigene Tabelle (Muskelrelaxans: Zonen). */
  zoneTable?: { headline: string; productName: RegExp; intro: string };
  inclusive: string[];
  factorsHeadline: string;
  factors: string[];
  faqs: CostFaq[];
  /** Ratgeber-/Hub-Links unter den Fragen. */
  links: Array<{ text: string; href: string }>;
};

const RATEN =
  "Ja, über einen Gutschein: Du kaufst ihn im Shop und bezahlst ihn dort mit Klarna oder PayPal in Raten, eingelöst wird er bei der Behandlung.";
const SAME_PRICE =
  "Ja. Für alle nichtoperativen Behandlungen gelten an unseren Standorten dieselben Preise – in Köln, Düsseldorf, Berlin, Leipzig, Aachen, Duisburg, Mönchengladbach, Recklinghausen und Kaiserslautern.";
const WALK_IN =
  "An allen Standorten nach Verfügbarkeit ja. Vorher gibt es immer ein ärztliches Gespräch. Sicherer ist ein Termin, den du online buchen kannst.";

export const COST_PAGES: Record<string, CostPageConfig> = {
  "botox-kosten": {
    slug: "botox-kosten",
    categorySlug: "botox",
    locationCategoryPath: "botox",
    metaTitle: "Botox Kosten 2026: Preise pro Zone ab {z1}",
    metaDescription:
      "Faltenbehandlung mit Muskelrelaxans: 1 Zone {z1}, 2 Zonen {z2}, 3 Zonen {z3}. Beratung und Nachkontrolle inklusive, an 9 Standorten gleich.",
    h1: "Botox Kosten: Preise pro Zone",
    subline: "Faltenbehandlung mit Muskelrelaxans – ärztlich, mit Nachkontrolle, an 9 Standorten",
    answer:
      "Eine Faltenbehandlung mit Muskelrelaxans (Wirkstoff Botulinumtoxin, bekannt als Botox®) kostet bei MY HEALTH & BEAUTY {z1} für eine Zone, {z2} für zwei und {z3} für drei Zonen. Eine Zone ist ein Behandlungsbereich, etwa Stirn, Zornesfalte oder Krähenfüße. Ärztliche Beratung und eine Nachkontrolle nach 14 Tagen sind inklusive, eine nötige Nachbehandlung ebenfalls.",
    tableHeadline: "Preise nach Behandlung",
    tableLabel: "Behandlung",
    zoneTable: {
      headline: "Preise nach Anzahl der Zonen",
      productName: /botox|muskelrelax/i,
      intro: "Je mehr Bereiche in einer Sitzung behandelt werden, desto günstiger wird die einzelne Zone.",
    },
    inclusive: [
      "Ärztliches Beratungsgespräch vor der Behandlung",
      "Behandlung ausschließlich durch Ärztinnen und Ärzte",
      "Kostenlose Nachkontrolle nach 14 Tagen",
      "Nachbehandlung bei der Kontrolle inklusive (Zufriedenheitsgarantie)",
    ],
    factorsHeadline: "Wovon hängt der Preis ab?",
    factors: [
      "Anzahl der Zonen: Stirn, Zornesfalte und Krähenfüße sind je eine Zone; drei Zonen kosten {z3} statt dreimal {z1}.",
      "Besondere Bereiche brauchen mehr Wirkstoff, etwa der Kaumuskel (Masseter, {masseter}) oder die Achseln bei starkem Schwitzen ({hyperhidrose}).",
      "Die Dosis legt die Ärztin oder der Arzt nach deiner Muskelaktivität fest – du zahlst den Preis der Zone, nicht pro Einheit.",
    ],
    faqs: [
      {
        question: "Was kostet die Behandlung der Zornesfalte?",
        answer:
          "Die Zornesfalte ist eine Zone und kostet {zornes}. Zusammen mit der Stirn sind es zwei Zonen für {z2}, mit Krähenfüßen drei Zonen für {z3}.",
      },
      {
        question: "Wie viele Zonen brauche ich?",
        answer:
          "Das klärt die Ärztin oder der Arzt im Gespräch. Viele starten mit einer oder zwei Zonen, häufig Stirn und Zornesfalte.",
      },
      {
        question: "Was ist im Preis enthalten?",
        answer:
          "Die ärztliche Beratung, die Behandlung selbst und eine kostenlose Nachkontrolle nach 14 Tagen. Ist dabei eine Nachbehandlung nötig, ist sie inklusive.",
      },
      { question: "Bekomme ich auch ohne Termin eine Behandlung?", answer: WALK_IN },
      {
        question: "Warum ist es woanders günstiger oder teurer?",
        answer:
          "Preise hängen davon ab, wie viel Wirkstoff gegeben wird, ob ärztlich behandelt wird und ob eine Nachkontrolle dabei ist. Bei uns behandeln nur Ärztinnen und Ärzte, die Kontrolle nach 14 Tagen ist immer inklusive.",
      },
      { question: "Gelten die Preise an allen Standorten?", answer: SAME_PRICE },
      { question: "Kann ich in Raten zahlen?", answer: RATEN },
      {
        question: "Muskelrelaxans oder Hyaluron – was hilft gegen meine Falte?",
        answer:
          "Mimikfalten wie Zornes- oder Stirnfalte entstehen durch Muskelbewegung, hier hilft ein Muskelrelaxans. Tiefe Ruhefalten oder Volumenverlust behandelt man eher mit Hyaluron. Oft entscheidet die Ärztin oder der Arzt nach Befund.",
      },
    ],
    links: [
      { text: "Alle Preise im Überblick", href: "/preise" },
      { text: "Hyaluron Kosten", href: "/p/hyaluron-spritzen-kosten" },
      { text: "Faltenbehandlung mit Muskelrelaxans", href: "/behandlungen/botox" },
    ],
  },
  "hyaluron-spritzen-kosten": {
    slug: "hyaluron-spritzen-kosten",
    categorySlug: "hyaluron-und-filler",
    locationCategoryPath: "hyaluron",
    metaTitle: "Hyaluron Spritzen Kosten 2026: Preise ab {lips05}",
    metaDescription:
      "Hyaluron beim Arzt: Lippen 0,5 ml {lips05}, Nasolabialfalte ab {naso}, Wangenaufbau ab {wangen}. Beratung und Nachkontrolle inklusive.",
    h1: "Hyaluron Spritzen Kosten",
    subline: "Preise je Behandlungsbereich und Menge – ärztlich, mit Nachkontrolle, an 9 Standorten",
    answer:
      "Was eine Hyaluron-Behandlung kostet, hängt vom Bereich und der Menge ab. Bei MY HEALTH & BEAUTY kosten Lippen mit 0,5 ml {lips05} und mit 1 ml {lips1}, die Nasolabialfalte ab {naso}, die Tränenrinne ab {traenen} und ein Full-Face-Aufbau ab {fullface}. Ärztliche Beratung und eine Nachkontrolle nach 14 Tagen sind inklusive.",
    tableHeadline: "Preise nach Behandlungsbereich",
    tableLabel: "Bereich",
    showProducts: true,
    inclusive: [
      "Ärztliches Beratungsgespräch vor der Behandlung",
      "Betäubungscreme, auf Wunsch Kühlung",
      "Kostenlose Nachkontrolle nach 14 Tagen",
      "Korrekturen der Form bei der Kontrolle inklusive; zusätzliches Volumen (weitere ml) nach Preisliste",
    ],
    factorsHeadline: "Wovon hängt der Preis ab?",
    factors: [
      "Die Menge: Hyaluron wird in Millilitern (ml) gerechnet. Lippen brauchen oft 0,5–1 ml, ein Full-Face-Aufbau deutlich mehr.",
      "Das Präparat: Je nach Bereich braucht es ein weicheres oder festeres Gel, zum Beispiel Aliaxin® (IBSA). Die Präparate und ihre Preise je ml stehen in der Tabelle.",
      "Der Bereich: Feine Zonen wie die Tränenrinne ({traenen}) brauchen besondere Technik und Erfahrung.",
    ],
    faqs: [
      {
        question: "Was kostet 1 ml Hyaluron?",
        answer:
          "An den Lippen kostet 1 ml {lips1}, 0,5 ml {lips05}. Für andere Bereiche und Präparate stehen die Preise je ml in der Tabelle oben.",
      },
      {
        question: "Wie viel Hyaluron brauche ich?",
        answer:
          "Das legt ihr im Beratungsgespräch fest. Lieber schrittweise aufbauen: Nach etwa zwei Wochen ist die Schwellung abgeklungen, dann kann bei der Nachkontrolle ergänzt werden.",
      },
      {
        question: "Was kostet die Unterspritzung der Nasolabialfalte?",
        answer:
          "Ab {naso}. Oft hilft es, zusätzlich Volumen im Mittelgesicht aufzubauen (Wangenaufbau ab {wangen}) – das entscheidet die Ärztin oder der Arzt nach Befund.",
      },
      {
        question: "Was ist im Preis enthalten?",
        answer:
          "Die ärztliche Beratung, die Betäubung, die Behandlung und eine kostenlose Nachkontrolle nach 14 Tagen. Korrekturen der Form sind dabei inklusive; möchtest du mehr Volumen, werden die weiteren ml nach Preisliste berechnet.",
      },
      {
        question: "Kann man Hyaluron wieder auflösen, und was kostet das?",
        answer:
          "Ja, mit dem Enzym Hyaluronidase. Das Auflösen kostet ab {hylase} – auch wenn du woanders behandelt wurdest.",
      },
      { question: "Gelten die Preise an allen Standorten?", answer: SAME_PRICE },
      { question: "Kann ich in Raten zahlen?", answer: RATEN },
      { question: "Bekomme ich auch ohne Termin eine Behandlung?", answer: WALK_IN },
    ],
    links: [
      { text: "Lippen aufspritzen Kosten", href: "/behandlungen/hyaluron/lippen-aufspritzen#kosten" },
      { text: "Botox Kosten pro Zone", href: "/p/botox-kosten" },
      { text: "Alle Preise im Überblick", href: "/preise" },
    ],
  },
  "skinbooster-preise": {
    slug: "skinbooster-preise",
    categorySlug: "skinbooster",
    locationCategoryPath: "skinbooster",
    metaTitle: "Skinbooster Kosten 2026: Profhilo & Co. ab {sbMin}",
    metaDescription:
      "Skinbooster beim Arzt: Profhilo {profhilo}, Mesotherapie {meso}, Polynukleotide {pn} pro Sitzung. Beratung inklusive, an 9 Standorten gleich.",
    h1: "Skinbooster Kosten und Preise",
    subline: "Preise pro Sitzung – ärztlich, mit Nachkontrolle, an 9 Standorten",
    answer:
      "Skinbooster werden pro Sitzung berechnet. Bei MY HEALTH & BEAUTY kostet eine Sitzung Profhilo® {profhilo}, Mesotherapie (NCTF 135 HA) {meso}, Polynukleotide {pn} und Vampir-Lifting (PRP) {prp}. Wie viele Sitzungen sinnvoll sind, hängt von Haut und Ziel ab; bei Profhilo® sind es meist zwei im Abstand von etwa vier Wochen.",
    tableHeadline: "Preise pro Sitzung",
    tableLabel: "Behandlung",
    inclusive: [
      "Ärztliches Beratungsgespräch vor der Behandlung",
      "Auf Wunsch Betäubungscreme",
      "Kostenlose Nachkontrolle und Beratung innerhalb von 14 Tagen",
    ],
    factorsHeadline: "Wovon hängen die Kosten ab?",
    factors: [
      "Die Zahl der Sitzungen: Profhilo® meist 2 im Abstand von etwa 4 Wochen, Mesotherapie meist als Kur aus mehreren Sitzungen.",
      "Das Präparat: Profhilo® (IBSA), NCTF 135 HA, Polynukleotide oder das eigene Plasma beim Vampir-Lifting.",
      "Der Bereich: Gesicht, Hals, Dekolleté oder die Augenpartie (Lumi Eyes, {lumi}).",
    ],
    faqs: [
      {
        question: "Was kostet Profhilo®?",
        answer: "Eine Sitzung kostet {profhilo}. Üblich sind zwei Sitzungen im Abstand von etwa vier Wochen, danach eine Auffrischung nach einigen Monaten.",
      },
      {
        question: "Profhilo®, Mesotherapie oder Polynukleotide – was passt zu mir?",
        answer:
          "Profhilo® verteilt sich flächig und verbessert Feuchtigkeit und Elastizität ({profhilo}). Mesotherapie versorgt die Haut mit Hyaluron, Vitaminen und Aminosäuren ({meso}). Polynukleotide sollen die Regeneration der Haut unterstützen ({pn}). Was passt, klärt die Beratung.",
      },
      {
        question: "Wie viele Sitzungen brauche ich?",
        answer:
          "Das hängt von Haut und Ziel ab. Bei Profhilo® meist zwei, bei Mesotherapie und Polynukleotiden oft zwei bis drei oder eine Kur. Die Ärztin oder der Arzt macht dir einen Vorschlag.",
      },
      {
        question: "Was ist im Preis enthalten?",
        answer: "Die ärztliche Beratung, die Behandlung und eine kostenlose Nachkontrolle mit Beratung innerhalb von 14 Tagen.",
      },
      { question: "Gelten die Preise an allen Standorten?", answer: SAME_PRICE },
      { question: "Kann ich in Raten zahlen?", answer: RATEN },
      { question: "Bekomme ich auch ohne Termin eine Behandlung?", answer: WALK_IN },
    ],
    links: [
      { text: "Profhilo®", href: "/behandlungen/skinbooster/profhilo" },
      { text: "Hyaluron Kosten", href: "/p/hyaluron-spritzen-kosten" },
      { text: "Alle Preise im Überblick", href: "/preise" },
    ],
  },
};

/** Behandlungs-pathKey -> Platzhalter in den Texten. */
export const COST_PRICE_KEYS: Record<string, string> = {
  "botox/zornesfalte": "zornes",
  "botox/masseter": "masseter",
  "botox/hyperhidrose-starkes-schwitzen": "hyperhidrose",
  "hyaluron/nasolabialfalte": "naso",
  "hyaluron/augenringe-unterspritzen": "traenen",
  "hyaluron/full-face-hyaluron": "fullface",
  "hyaluron/wangenaufbau": "wangen",
  "skinbooster/profhilo": "profhilo",
  "skinbooster/mesotherapie-nctf-135-ha": "meso",
  "skinbooster/polynukleotide-lachssperma": "pn",
  "skinbooster/vampir-lifting-prp": "prp",
};

export type CostCategory = {
  slug?: string;
  treatments?: Array<{
    name?: string;
    priceInEuroCent?: number | null;
    isStartingPrice?: boolean | null;
    treatmentPage?: { pathKey?: string | null } | null;
  }>;
  products?: Array<{
    name?: string | null;
    variants?: Array<{ label?: string | null; name?: string | null; slug?: string | null; priceInEuroCent?: number | null; isActive?: boolean | null }> | null;
  }>;
};

export function formatEuro(cent: number, ab = false): string {
  const v = (cent / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${ab ? "ab " : ""}${v} €`;
}

/** Preise fuer die Platzhalter aus den Strapi-Produktkategorien. */
export function costPagePrices(categories: CostCategory[] | null | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  const all = categories ?? [];
  for (const c of all) {
    for (const t of c.treatments ?? []) {
      const key = COST_PRICE_KEYS[String(t.treatmentPage?.pathKey ?? "")];
      if (key && t.priceInEuroCent) out[key] = formatEuro(t.priceInEuroCent, !!t.isStartingPrice);
      if (/lumi eyes/i.test(String(t.name ?? "")) && t.priceInEuroCent) out.lumi = formatEuro(t.priceInEuroCent, !!t.isStartingPrice);
    }
    for (const p of c.products ?? []) {
      for (const v of p.variants ?? []) {
        if (v.isActive === false || !v.priceInEuroCent) continue;
        const slug = String(v.slug ?? "");
        if (/botox/i.test(String(p.name ?? ""))) {
          const z = /^(\d)-zonen?$/.exec(slug);
          if (z) out[`z${z[1]}`] = formatEuro(v.priceInEuroCent);
        }
        if (/aliaxin/i.test(String(p.name ?? ""))) {
          if (slug === "0-5-ml") out.lips05 = formatEuro(v.priceInEuroCent);
          if (slug === "1-0-ml") out.lips1 = formatEuro(v.priceInEuroCent);
        }
        if (/hylase/i.test(String(p.name ?? "")) && !out.hylase) out.hylase = formatEuro(v.priceInEuroCent, true);
      }
    }
    if (c.slug === "skinbooster") {
      const min = Math.min(...(c.treatments ?? []).map((t) => t.priceInEuroCent || Infinity));
      if (Number.isFinite(min)) out.sbMin = formatEuro(min);
    }
  }
  return out;
}

/**
 * Platzhalter fuellen. Fehlt ein Preis, faellt der ganze Satz weg (nie ein
 * leeres "{z2}" oder ein erfundener Preis auf der Seite).
 */
export function fillPrices(text: string, prices: Record<string, string>): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences
    .filter((s) => [...s.matchAll(/\{(\w+)\}/g)].every((m) => !!prices[m[1]!]))
    .map((s) => s.replace(/\{(\w+)\}/g, (_, k: string) => prices[k]!))
    .join(" ")
    // "ab {naso}" mit einem Preis, der selbst "ab ..." ist
    .replace(/\bab ab\b/g, "ab");
}

export function costPageFor(slug: string | null | undefined): CostPageConfig | null {
  return COST_PAGES[String(slug ?? "")] ?? null;
}
