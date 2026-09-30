/**
 * go.* (Ads-Modus, Deutsch): H1 und Unterzeile in Suchsprache.
 *
 * Auf www tragen die H1 das Keyword samt Markennamen ("Stirnfalte Botox").
 * Auf go. darf der Markenname nicht stehen (shared/adsTerms.ts); uebrig blieb
 * nur das nackte Problemwort ("Stirnfalte Köln"). Gesucht wird aber
 * "Stirnfalte glätten", "Lippen aufspritzen", "Nasolabialfalte unterspritzen"
 * (Inhaber, 30.09.2026: "Seite für Seite angucken"). Die Formulierungen unten
 * kommen aus den Keywords und Suchbegriffen der Anzeigengruppen (Google Ads,
 * Konto 790-400-3244, Klicks seit Kontostart), damit H1 ≈ Suchbegriff ≈
 * Anzeigenueberschrift ist.
 *
 * Nur Code, kein Strapi: www (SEO-Ueberschriften) bleibt unveraendert.
 * Hero ist bewusst knapp (#192) - H1 kurz, eine Unterzeile, ohne
 * Heilversprechen, ohne Markennamen.
 */

export type AdsHeadline = {
  /** H1 ohne Stadt, z. B. "Stirnfalte glätten". */
  h1: string;
  /** Konkrete Unterzeile (ersetzt nur generische Strapi-Unterzeilen). */
  subline: string;
};

const HEADLINES: Record<string, AdsHeadline> = {
  // Muskelrelaxans (Grundseite: #186)
  muskelrelaxans: {
    h1: "Faltenbehandlung mit Muskelrelaxans",
    subline: "Mimikfalten sanft glätten – ärztlich, ohne Ausfallzeit",
  },
  "muskelrelaxans/stirnfalte": {
    h1: "Stirnfalte glätten",
    subline: "Glattere Stirn in 20–30 Minuten – ärztlich, ohne Ausfallzeit",
  },
  "muskelrelaxans/zornesfalte": {
    h1: "Zornesfalte glätten",
    subline: "Entspannter Blick zwischen den Brauen – ärztlich, ohne Ausfallzeit",
  },
  "muskelrelaxans/kraehenfuesse": {
    h1: "Krähenfüße glätten",
    subline: "Weniger Fältchen um die Augen – ärztlich, ohne Ausfallzeit",
  },
  "muskelrelaxans/lachfalten": {
    h1: "Lachfalten glätten",
    subline: "Weniger Fältchen um die Augen – ärztlich, ohne Ausfallzeit",
  },
  "muskelrelaxans/lipflip": {
    h1: "Lip Flip",
    subline: "Oberlippe sanft nach außen drehen – vollere Wirkung ohne Filler",
  },
  "muskelrelaxans/browlift": {
    h1: "Augenbrauenlifting",
    subline: "Brauen sanft anheben, offenerer Blick – ohne OP",
  },
  "muskelrelaxans/full-face-muskelrelaxans": {
    h1: "Faltenbehandlung Full Face",
    subline: "Stirn, Zornesfalte und Augen in einer Sitzung – ärztlich",
  },
  "muskelrelaxans/masseter": {
    h1: "Masseter-Behandlung",
    subline: "Gesicht schmaler, Kaumuskel entspannt – ärztlich, ohne OP",
  },
  masseter: {
    h1: "Masseter-Behandlung",
    subline: "Gesicht schmaler, Kaumuskel entspannt – ärztlich, ohne OP",
  },
  "muskelrelaxans/zaehneknirschen-bruxismus": {
    h1: "Zähneknirschen behandeln",
    subline: "Kaumuskel gezielt entspannen – ärztlich, ohne OP",
  },
  "muskelrelaxans/hyperhidrose-starkes-schwitzen": {
    h1: "Starkes Schwitzen behandeln",
    subline: "Weniger Schweiß unter den Achseln – ärztlich, in einer Sitzung",
  },
  "muskelrelaxans/halsfalten-platysma": {
    h1: "Halsfalten glätten",
    subline: "Halsmuskel entspannen, feine Falten glätten – ärztlich",
  },
  "muskelrelaxans/barbie-muskelrelaxans": {
    h1: "Barbie-Behandlung",
    subline: "Schlankere Schultern, längerer Nacken – ärztlich, ohne OP",
  },
  "muskelrelaxans/bunny-lines": {
    h1: "Nasenfältchen glätten",
    subline: "Weniger Knitterfältchen am Nasenrücken – ärztlich",
  },
  "muskelrelaxans/erdbeerkinn": {
    h1: "Erdbeerkinn glätten",
    subline: "Glatteres Kinn ohne Grübchen – ärztlich, ohne Ausfallzeit",
  },
  "muskelrelaxans/baby-muskelrelaxans": {
    h1: "Baby-Faltenbehandlung",
    subline: "Kleine Dosis, natürliche Mimik – ärztlich, ohne Ausfallzeit",
  },
  "muskelrelaxans/migraenebehandlung": {
    h1: "Migräne behandeln",
    subline: "Ärztliche Therapie bei chronischer Migräne",
  },

  // Hyaluron
  "hyaluron/lippen-aufspritzen": {
    h1: "Lippen aufspritzen",
    subline: "Mehr Volumen und Kontur mit Hyaluron – natürlich, ärztlich",
  },
  "hyaluron/lippenkorrektur": {
    h1: "Lippenkorrektur",
    subline: "Kontur, Form und Symmetrie mit Hyaluron – ärztlich",
  },
  "hyaluron/nasolabialfalte": {
    h1: "Nasolabialfalte unterspritzen",
    subline: "Falte zwischen Nase und Mund sanft auffüllen – mit Hyaluron",
  },
  "hyaluron/marionettenfalten": {
    h1: "Marionettenfalten unterspritzen",
    subline: "Mundwinkel sanft anheben – mit Hyaluron, ärztlich",
  },
  "hyaluron/plisseefalten": {
    h1: "Plisseefalten glätten",
    subline: "Feine Raucherfältchen an der Oberlippe mildern – mit Hyaluron",
  },
  "hyaluron/kinnkorrektur": {
    h1: "Kinn unterspritzen",
    subline: "Mehr Profil und Balance fürs Gesicht – mit Hyaluron",
  },
  "hyaluron/jawline": {
    h1: "Jawline unterspritzen",
    subline: "Klar definierte Kieferlinie – mit Hyaluron, ärztlich",
  },
  "hyaluron/wangenaufbau": {
    h1: "Wangenaufbau mit Hyaluron",
    subline: "Mehr Volumen und Kontur für die Wangen – ärztlich",
  },
  "hyaluron/full-face-hyaluron": {
    h1: "Full Face Hyaluron",
    subline: "Hyaluron fürs ganze Gesicht – abgestimmt in einer Sitzung",
  },
  "hyaluron/hylase": {
    h1: "Hylase-Behandlung",
    subline: "Hyaluron gezielt auflösen – ärztlich, schnell",
  },
  "hyaluron/augenringe-unterspritzen": {
    h1: "Augenringe unterspritzen",
    subline: "Schatten unter den Augen mildern – mit Hyaluron, ärztlich",
  },
  "hyaluron/dekolletee": {
    h1: "Dekolleté-Falten behandeln",
    subline: "Feine Falten am Dekolleté mildern – mit Hyaluron",
  },
  "hyaluron/haende": {
    h1: "Handverjüngung mit Hyaluron",
    subline: "Mehr Volumen für die Handrücken – ärztlich",
  },

  // Skinbooster
  "skinbooster/profhilo": {
    h1: "Profhilo-Behandlung",
    subline: "Skinbooster für straffere, frischere Haut – ärztlich",
  },
  "skinbooster/mesotherapie-nctf-135-ha": {
    h1: "Mesotherapie Gesicht",
    subline: "Vitamine und Hyaluron für ein frischeres Hautbild",
  },
  "skinbooster/vampir-lifting-prp": {
    h1: "Vampir-Lifting",
    subline: "Eigenblut (PRP) für ein frischeres Hautbild – ärztlich",
  },
  "skinbooster/lumi-eyes-polynukleotide": {
    h1: "Augenringe behandeln",
    subline: "Lumi Eyes mit Polynukleotiden für die zarte Haut unter den Augen",
  },
  "skinbooster/polynukleotide-lachssperma": {
    h1: "Polynukleotide-Behandlung",
    subline: "Lachs-DNA-Skinbooster für eine erholte, glattere Haut",
  },

  // Fettwegspritze
  fettwegspritze: {
    h1: "Fettwegspritze",
    subline: "Kleine Fettpolster gezielt behandeln – ohne OP",
  },
  "fettwegspritze/lemon-bottle-doppelkinn": {
    h1: "Fettwegspritze Doppelkinn",
    subline: "Doppelkinn gezielt behandeln – ohne OP, ärztlich",
  },
  "fettwegspritze/lemon-bottle-bauch": {
    h1: "Fettwegspritze Bauch",
    subline: "Kleine Fettpolster am Bauch gezielt behandeln – ohne OP",
  },
  "fettwegspritze/lemon-bottle-huefte": {
    h1: "Fettwegspritze Hüfte",
    subline: "Kleine Fettpolster an der Hüfte gezielt behandeln – ohne OP",
  },
  "fettwegspritze/lemon-bottle-oberarm": {
    h1: "Fettwegspritze Oberarme",
    subline: "Kleine Fettpolster an den Oberarmen gezielt behandeln – ohne OP",
  },
  "fettwegspritze/lemon-bottle-oberschenkel": {
    h1: "Fettwegspritze Oberschenkel",
    subline: "Kleine Fettpolster an den Oberschenkeln gezielt behandeln – ohne OP",
  },
  "fettwegspritze/lemon-bottle-knie": {
    h1: "Fettwegspritze Knie",
    subline: "Kleine Fettpolster an den Knien gezielt behandeln – ohne OP",
  },
  "fettwegspritze/lemon-bottle-wangen": {
    h1: "Fettwegspritze Wangen",
    subline: "Konturiertere Wangen – ohne OP, ärztlich",
  },
};

/** Strapi-Unterzeilen ohne Aussage zur Behandlung. */
const GENERIC_SUBLINE = /^\s*(?:erfahrene\s+ärzt(?:e|:innen|innen)\s*(?:&|und)\s*premium[-\s]produkte)\s*$/i;

function baseKey(pathKey: string | null | undefined): string | null {
  if (!pathKey) return null;
  return pathKey.replace(/-rabatt$/, "");
}

export function adsHeadlineFor(
  pathKey: string | null | undefined,
): AdsHeadline | null {
  const key = baseKey(pathKey);
  return (key && HEADLINES[key]) || null;
}

/**
 * H1 fuer go.: "Stirnfalte glätten in Köln", ohne Stadt "Stirnfalte glätten".
 * `null` = kein Eintrag, die Seite nimmt ihre normale H1.
 */
export function adsH1(
  pathKey: string | null | undefined,
  city?: string | null,
): string | null {
  const entry = adsHeadlineFor(pathKey);
  if (!entry) return null;
  const c = (city ?? "").trim();
  return c ? `${entry.h1} in ${c}` : entry.h1;
}

export function isGenericSubline(value: string | null | undefined): boolean {
  return !value || !value.trim() || GENERIC_SUBLINE.test(value);
}

/**
 * Unterzeile fuer go.: Eine konkrete Strapi-Unterzeile bleibt, eine
 * generische ("Erfahrene Ärzte & Premium Produkte") oder fehlende wird durch
 * die Unterzeile der Behandlung ersetzt.
 */
export function adsSubline(
  pathKey: string | null | undefined,
  strapiSubline: string | null | undefined,
): string | null | undefined {
  if (!isGenericSubline(strapiSubline)) return strapiSubline;
  return adsHeadlineFor(pathKey)?.subline ?? strapiSubline;
}

/** Alle Eintraege (fuer Tests). */
export function adsHeadlineEntries(): Array<[string, AdsHeadline]> {
  return Object.entries(HEADLINES);
}
