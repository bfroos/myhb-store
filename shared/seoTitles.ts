/**
 * E24 #315: Title und H1 der bundesweiten Behandlungsseiten (www) auf den
 * Suchbegriff mit dem meisten Suchvolumen (SISTRIX DE, 12.10.2026) und
 * Aufraeumen aller Titles/Descriptions.
 *
 * Warum im Code: Strapi-Titles enthalten Emojis, Haken, Werbung mit
 * Neukundenrabatt (auf www nicht erlaubt) und teils falsche Preise
 * (Lippenkorrektur "ab 149,99 €", tatsaechlich 349,99 €). Hier steht der
 * Preis nicht im Text, sondern kommt aus Strapi (priceInEuroCent) - Title und
 * Seite koennen nicht mehr auseinanderlaufen.
 *
 * "Botox" steht nur dort, wo es heute schon im Title steht (#309 offen).
 * Ausnahmen: Lippen aufspritzen (Pilot #311 setzt eigenen Title), OPs.
 */

export type SeoTitle = {
  /** Title ohne Preis; mit Preis wird ": ab {preis}" angehaengt. */
  title: string;
  /** Preis anhaengen, wenn Strapi einen hat. */
  withPrice?: boolean;
  /** H1 (leer = Strapi-H1 bleibt). */
  h1?: string;
  /** Suchbegriff und Volumen (Doku). */
  keyword?: string;
};

export const SEO_TITLES: Record<string, SeoTitle> = {
  // ---------------------------------------------------------- Muskelrelaxans
  botox: { title: "Botox Behandlung beim Arzt", withPrice: true, keyword: "botox behandlung" },
  "botox/zornesfalte": { title: "Zornesfalte Botox: Zornesfalte glätten", withPrice: true, h1: "Zornesfalte mit Botox glätten", keyword: "zornesfalte botox 1.650" },
  "botox/stirnfalte": { title: "Botox Stirn: Stirnfalten glätten", withPrice: true, h1: "Stirnfalten mit Botox glätten", keyword: "botox stirn 1.650" },
  "botox/kraehenfuesse": { title: "Krähenfüße Botox: Augenfältchen glätten", withPrice: true, h1: "Krähenfüße mit Botox glätten", keyword: "krähenfüße botox 1.150" },
  "botox/masseter": { title: "Masseter Botox beim Arzt", withPrice: true, h1: "Masseter Botox Behandlung", keyword: "masseter botox 8.900" },
  "botox/lipflip": { title: "Lip Flip mit Botox", withPrice: true, h1: "Lip Flip mit Botox", keyword: "lip flip 7.050" },
  "botox/baby-botox": { title: "Baby Botox: sanfte Faltenbehandlung", withPrice: true, keyword: "baby botox 1.950" },
  "botox/barbie-botox": { title: "Barbie Botox: Trapezmuskel entspannen", withPrice: true },
  "botox/browlift": { title: "Browlift mit Botox", withPrice: true, h1: "Browlift mit Botox" },
  "botox/bunny-lines": { title: "Bunny Lines mit Botox glätten", withPrice: true },
  "botox/erdbeerkinn": { title: "Erdbeerkinn Botox", withPrice: true, h1: "Erdbeerkinn mit Botox behandeln" },
  "botox/full-face-botox": { title: "Full Face Botox: mehrere Zonen", withPrice: true, h1: "Full Face Botox Behandlung" },
  "botox/halsfalten-platysma": { title: "Platysma Botox gegen Halsfalten", withPrice: true },
  "botox/hyperhidrose-starkes-schwitzen": { title: "Botox gegen Schwitzen (Hyperhidrose)", withPrice: true, keyword: "botox gegen schwitzen 850" },
  "botox/lachfalten": { title: "Lachfalten mit Botox glätten", withPrice: true, h1: "Lachfalten mit Botox glätten" },
  "botox/migraenebehandlung": { title: "Botox gegen Migräne: ärztliche Behandlung", withPrice: true },
  "botox/zaehneknirschen-bruxismus": { title: "Botox gegen Zähneknirschen (Bruxismus)", withPrice: true, h1: "Zähneknirschen (Bruxismus) mit Botox behandeln" },
  // Preis in Strapi widerspruechlich (239,99 vs. 299,99 €) - ohne Preis
  "botox/3-zonen-botox-preise": { title: "3 Zonen Botox: Stirn, Zornesfalte, Krähenfüße" },

  // ---------------------------------------------------------- Hyaluron
  hyaluron: { title: "Hyaluron Unterspritzung beim Arzt", withPrice: true, keyword: "hyaluron unterspritzung 1.350" },
  "hyaluron/augenringe-unterspritzen": { title: "Augenringe unterspritzen mit Hyaluron", withPrice: true, h1: "Augenringe unterspritzen mit Hyaluron", keyword: "augenringe unterspritzen 2.800" },
  "hyaluron/jawline": { title: "Jawline unterspritzen mit Hyaluron", withPrice: true, keyword: "jawline unterspritzen 2.200" },
  "hyaluron/nasolabialfalte": { title: "Nasolabialfalte unterspritzen mit Hyaluron", withPrice: true, h1: "Nasolabialfalte unterspritzen", keyword: "nasolabialfalte unterspritzen 1.400" },
  "hyaluron/wangenaufbau": { title: "Wangenaufbau mit Hyaluron", withPrice: true, h1: "Wangenaufbau mit Hyaluron" },
  "hyaluron/kinnkorrektur": { title: "Kinn aufspritzen mit Hyaluron", withPrice: true, h1: "Kinnaufbau mit Hyaluron" },
  "hyaluron/marionettenfalten": { title: "Marionettenfalten unterspritzen", withPrice: true },
  "hyaluron/plisseefalten": { title: "Plisseefalten unterspritzen: Raucherfältchen", withPrice: true, h1: "Plisseefalten unterspritzen" },
  "hyaluron/hylase": { title: "Hylase: Hyaluron auflösen beim Arzt", withPrice: true, keyword: "hylase 2.250" },
  "hyaluron/lippenkorrektur": { title: "Lippenkorrektur mit Hyaluron", withPrice: true, h1: "Lippenkorrektur mit Hyaluron" },
  "hyaluron/russian-lips": { title: "Russian Lips: Lippen mit Russian-Lips-Technik", h1: "Russian Lips", keyword: "russian lips 6.700" },
  "hyaluron/full-face-hyaluron": { title: "Full Face Hyaluron", withPrice: true, h1: "Full Face Hyaluron" },
  "hyaluron/haende": { title: "Handrücken mit Hyaluron behandeln", withPrice: true },
  "hyaluron/dekolletee": { title: "Dekolleté-Falten mit Hyaluron behandeln", withPrice: true, h1: "Dekolleté-Falten mit Hyaluron behandeln" },

  // ---------------------------------------------------------- Skinbooster
  skinbooster: { title: "Skinbooster beim Arzt: Profhilo & Co.", withPrice: true, h1: "Skinbooster Behandlung", keyword: "skinbooster 2.100" },
  "skinbooster/profhilo": { title: "Profhilo Behandlung", withPrice: true, h1: "Profhilo® Behandlung", keyword: "profhilo 4.250" },
  "skinbooster/polynukleotide-lachssperma": { title: "Polynukleotide (Lachs-DNA) Behandlung", withPrice: true, h1: "Polynukleotide Behandlung", keyword: "polynukleotide 6.150" },
  "skinbooster/mesotherapie-nctf-135-ha": { title: "Mesotherapie Gesicht mit NCTF 135 HA", withPrice: true, h1: "Mesotherapie Gesicht", keyword: "mesotherapie gesicht 1.550" },
  "skinbooster/vampir-lifting-prp": { title: "Vampirlifting mit PRP", withPrice: true, keyword: "vampirlifting 1.500" },
  "skinbooster/lumi-eyes-polynukleotide": { title: "Lumi Eyes: Polynukleotide für die Augenpartie", withPrice: true },

  // ---------------------------------------------------------- Fettwegspritze
  fettwegspritze: { title: "Fettwegspritze mit Lemon Bottle", withPrice: true, h1: "Fettwegspritze mit Lemon Bottle", keyword: "fettwegspritze 6.300" },
  "fettwegspritze/lemon-bottle-backen": { title: "Fettwegspritze Wangen: Lemon Bottle", withPrice: true },
  "fettwegspritze/lemon-bottle-bauch": { title: "Fettwegspritze Bauch: Lemon Bottle", withPrice: true },
  "fettwegspritze/lemon-bottle-doppelkinn": { title: "Fettwegspritze Doppelkinn: Lemon Bottle", withPrice: true, h1: "Fettwegspritze am Doppelkinn" },
  "fettwegspritze/lemon-bottle-huefte": { title: "Fettwegspritze Hüfte: Lemon Bottle", withPrice: true },
  "fettwegspritze/lemon-bottle-knie": { title: "Fettwegspritze Knie: Lemon Bottle", withPrice: true },
  "fettwegspritze/lemon-bottle-oberarm": { title: "Fettwegspritze Oberarme: Lemon Bottle", withPrice: true },
  "fettwegspritze/lemon-bottle-oberschenkel": { title: "Fettwegspritze Oberschenkel: Lemon Bottle", withPrice: true },

  // ---------------------------------------------------------- Infusionen
  infusionen: { title: "Vitamin-Infusionen vom Arzt", withPrice: true, keyword: "vitamin infusion 1.800" },
  "infusionen/vitamin-c-infusion": { title: "Vitamin C Infusion vom Arzt", withPrice: true, h1: "Vitamin C Infusion", keyword: "vitamin c infusion 5.200" },
  "infusionen/b-komplex-infusion": { title: "Vitamin-B-Komplex-Infusion vom Arzt", withPrice: true },
  "infusionen/immun-infusion": { title: "Immun-Infusion vom Arzt", withPrice: true, h1: "Immun-Infusion" },
  "infusionen/power-infusion-glutathion": { title: "Power-Infusion mit Glutathion", withPrice: true, h1: "Power-Infusion mit Glutathion" },
  "infusionen/regenerations-infusion": { title: "Regenerations-Infusion vom Arzt", withPrice: true, h1: "Regenerations-Infusion" },
  "infusionen/relax-infusion": { title: "Relax-Infusion vom Arzt", withPrice: true, h1: "Relax-Infusion" },
  "infusionen/anti-aging-infusion": { title: "Anti-Aging-Infusion vom Arzt", withPrice: true },

  // ---------------------------------------------------------- Haarausfall
  "anti-haarausfall": { title: "Haarausfall Behandlung: PRP & Mesotherapie", withPrice: true, h1: "Haarausfall-Behandlung mit PRP und Mesotherapie" },
  "anti-haarausfall/prp-haartherapie": { title: "PRP Haare: Behandlung bei Haarausfall", withPrice: true, h1: "PRP-Haartherapie", keyword: "prp haare 650" },
  "anti-haarausfall/mesotherapie-haare": { title: "Mesotherapie Haare: Behandlung bei Haarausfall", withPrice: true, keyword: "mesotherapie haare 1.050" },
};

function euro(cent: number): string {
  return `${(cent / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

/** Title fuer eine bundesweite Behandlungsseite, sonst null (Strapi bleibt). */
export function seoTitleFor(
  pathKey: string | null | undefined,
  treatment: { priceInEuroCent?: number | null; isStartingPrice?: boolean | null } | null | undefined,
): { title: string; h1?: string } | null {
  const t = SEO_TITLES[String(pathKey ?? "").replace(/^\/+|\/+$/g, "")];
  if (!t) return null;
  const cent = treatment?.priceInEuroCent;
  // "Botox Stirn: Stirnfalten glätten ab 149,99 €" - kein zweiter Doppelpunkt
  const sep = t.title.includes(":") ? " " : ": ";
  const title = t.withPrice && cent ? `${t.title}${sep}ab ${euro(cent)}` : t.title;
  return { title, ...(t.h1 ? { h1: t.h1 } : {}) };
}

/**
 * Titles und Descriptions aus Strapi aufraeumen (www): Emojis und Haken weg,
 * keine Rabattwerbung, doppelte Leerzeichen, Tippfehler "Ärtze".
 */
export function cleanSeoText(text: string | null | undefined): string {
  if (!text) return "";
  return String(text)
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2705}\u{2714}\u{2713}\u{FE0F}\u{200D}]/gu, "")
    .replace(/\s*(?:mit|inkl\.?|und)?\s*\d+\s*%\s*Rabatt(?:\s+für\s+(?:neue\s+Kunden|Neukunden))?/gi, "")
    .replace(/Ärtze/g, "Ärzte")
    .replace(/\s+([,.!?:])/g, "$1")
    .replace(/([–|-])\s*([–|-])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s–|-]+|[\s–|-]+$/g, "")
    .trim();
}
