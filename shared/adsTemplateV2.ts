/**
 * go.* (Ads-Modus): Seitenvorlage v2 fuer Standort-Behandlungsseiten.
 *
 * Grundlage: Playbook "go.-Behandlungsseite v2" (bfroos/myhb-store#203,
 * Kapitel 3) und Benjamins Vorgaben vom 30.09.2026. Erst die Vorlage auf zwei
 * Musterseiten; passt sie, wird ADS_TEMPLATE_V2_PAGES erweitert (bis "*").
 *
 * Hier liegt alles ohne Vue: Umschaltung, kurze Code-Texte je
 * Behandlungskategorie (Ablauf, Einwaende, Vertrauenszeile), Preiskarten,
 * Auswahl von Bewertungen und Aerzt:innen. Alles ohne Markennamen des
 * Muskelrelaxans, ohne Heilversprechen, "Kostenlos absagen" und "Aerztlich
 * geprueft" bewusst nicht (Benjamin, 30.09.2026).
 */
import {
  DEFAULT_NEW_CUSTOMER_DISCOUNT_PCT,
  formatEuroCent,
  newCustomerPriceCent,
} from "./newCustomerOffer.ts";

/**
 * Standorte mit Vorlage v2 (alle 9 Staedte mit Google-Ads-Kampagne, Stand
 * 01.10.2026; Duisburg vorsorglich, Kampagne noch pausiert).
 */
export const ADS_TEMPLATE_V2_LOCATIONS: readonly string[] = [
  "koeln/koeln-arcaden",
  "berlin/gesundbrunnencenter",
  "duesseldorf/duesseldorf-arcaden",
  "recklinghausen/palais-vest",
  "moenchengladbach/minto",
  "kaiserslautern/k-in-lautern",
  "leipzig/hoefe-am-bruehl",
  "aachen/aquis-plaza",
  "duisburg/forum",
];

/**
 * Behandlungen mit Vorlage v2 (pathKey ohne "-rabatt"): alle, die Ziel einer
 * aktiven Anzeige sind, plus die am 01.10.2026 neu beworbenen. Jede hat einen
 * Inhalts-Eintrag in shared/adsTemplateV2Content.ts (Test prueft das) und
 * existiert an allen Standorten oben (gegen Strapi geprueft, 351 Seiten).
 * Nicht dabei: fettwegspritze (eigene Freigabe noetig), Schoenheits-OPs.
 */
export const ADS_TEMPLATE_V2_TREATMENTS: readonly string[] = [
  "muskelrelaxans/stirnfalte",
  "muskelrelaxans/zornesfalte",
  "muskelrelaxans/kraehenfuesse",
  "muskelrelaxans/browlift",
  "muskelrelaxans/lachfalten",
  "muskelrelaxans/lipflip",
  "muskelrelaxans/bunny-lines",
  "muskelrelaxans/erdbeerkinn",
  "muskelrelaxans/full-face-muskelrelaxans",
  "muskelrelaxans/masseter",
  "muskelrelaxans/zaehneknirschen-bruxismus",
  "muskelrelaxans/barbie-muskelrelaxans",
  "muskelrelaxans/halsfalten-platysma",
  "muskelrelaxans/hyperhidrose-starkes-schwitzen",
  "hyaluron/lippen-aufspritzen",
  "hyaluron/lippenkorrektur",
  "hyaluron/nasolabialfalte",
  "hyaluron/marionettenfalten",
  "hyaluron/plisseefalten",
  "hyaluron/kinnkorrektur",
  "hyaluron/jawline",
  "hyaluron/wangenaufbau",
  "hyaluron/full-face-hyaluron",
  "hyaluron/augenringe-unterspritzen",
  "hyaluron/hylase",
  "skinbooster/profhilo",
  "skinbooster/lumi-eyes-polynukleotide",
  "skinbooster/polynukleotide-lachssperma",
  "skinbooster/mesotherapie-nctf-135-ha",
  "skinbooster/vampir-lifting-prp",
  "anti-haarausfall/mesotherapie-haare",
  "anti-haarausfall/prp-haartherapie",
  "infusionen/vitamin-c-infusion",
  "infusionen/b-komplex-infusion",
  "infusionen/immun-infusion",
  "infusionen/power-infusion-glutathion",
  "infusionen/regenerations-infusion",
  "infusionen/relax-infusion",
  "infusionen/anti-aging-infusion",
];

/**
 * Seiten mit Vorlage v2, als "stadt/standort/pathKey". Jedes Segment darf
 * "*" sein; ein pathKey "hyaluron/*" meint alle Hyaluron-Seiten, "*" alle.
 * Seit 01.10.2026 (Benjamin: "heute schon die Seiten auf die neue Vorlage
 * umstellen") Standorte x Behandlungen oben, live auf den echten URLs.
 */
export const ADS_TEMPLATE_V2_PAGES: readonly string[] = ADS_TEMPLATE_V2_LOCATIONS.flatMap(
  (loc) => ADS_TEMPLATE_V2_TREATMENTS.map((key) => `${loc}/${key}`),
);

/**
 * v2 auch auf den echten Anzeigen-Ziel-URLs /standorte/... (nicht nur in der
 * Vorschau). Notschalter: false = v2 nur noch unter /vorschau-v2/.
 */
export const ADS_TEMPLATE_V2_LIVE = true;

/**
 * Ausnahmen von v2 auf den echten URLs (gleiches Muster wie
 * ADS_TEMPLATE_V2_PAGES, "stadt/standort/pathKey"): Diese Seiten zeigen auf
 * go. die in Strapi gebaute Fassung (Strapi-Bloecke wie vor v2, mit
 * Neukundenpreisen, Botox-Ersetzung und Video-Sperrliste des Strapi-Proxys).
 *
 * - duesseldorf/duesseldorf-arcaden/skinbooster/profhilo: eigene Bloecke von
 *   Parya in Strapi (Benjamin, 02.10.2026). Profhilo an anderen Standorten
 *   bleibt v2.
 *
 * Die Texte dieser Seiten nennen den Neukundenpreis schon selbst ("Neukunden
 * ab 239,99 € ... statt regulär 299,99 €"); der Strapi-Proxy laesst Saetze
 * mit "Neukunde" deshalb unberuehrt (keepNewCustomerSentences in
 * shared/newCustomerOffer.ts), sonst stuende dort ein doppelter Rabatt.
 *
 * Folgen: kein Umleitungsskript fuer `?angebot=beratung`, /ab-beratung/...
 * leitet auf die echte Seite zurueck (302) - die Seite ist damit nicht im
 * Angebots-Test (shared/adsOfferVariant.ts). Die Vorschau /vorschau-v2/...
 * zeigt v2 weiter, zum Vergleich.
 */
export const ADS_TEMPLATE_V2_EXCLUDE: readonly string[] = [
  "duesseldorf/duesseldorf-arcaden/skinbooster/profhilo",
];

function basePathKey(pathKey: string | null | undefined): string {
  return String(pathKey ?? "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/-rabatt$/, "");
}

function matchesPattern(
  pattern: string,
  city: string,
  loc: string,
  pathKey: string,
): boolean {
  const [pCity, pLoc, ...rest] = pattern.split("/");
  const pKey = rest.join("/");
  if (!pCity || !pLoc || !pKey) return false;
  if (pCity !== "*" && pCity !== city) return false;
  if (pLoc !== "*" && pLoc !== loc) return false;
  if (pKey === "*") return true;
  if (pKey.endsWith("/*")) return pathKey.startsWith(pKey.slice(0, -1));
  return pKey === pathKey;
}

export function isAdsTemplateV2Page(
  city: string | null | undefined,
  loc: string | null | undefined,
  pathKey: string | null | undefined,
  pages: readonly string[] = ADS_TEMPLATE_V2_PAGES,
): boolean {
  const key = basePathKey(pathKey);
  if (!city || !loc || !key) return false;
  // Schoenheits-OPs haben andere Preise, Ablaeufe und Einwaende.
  if (key.startsWith("schoenheitsoperationen")) return false;
  return pages.some((p) => matchesPattern(p, city, loc, key));
}

/**
 * Echte Seite /standorte/<stadt>/<standort>/<pathKey> mit v2? Wie
 * isAdsTemplateV2Page, aber ohne die "-rabatt"-Adressen: die sind kein
 * Anzeigenziel und bleiben bei der bisherigen Seite (die Vorschau zeigt sie).
 * Ohne die Ausnahmen aus ADS_TEMPLATE_V2_EXCLUDE.
 */
export function isAdsTemplateV2LivePage(
  city: string | null | undefined,
  loc: string | null | undefined,
  pathKey: string | null | undefined,
  pages: readonly string[] = ADS_TEMPLATE_V2_PAGES,
  live: boolean = ADS_TEMPLATE_V2_LIVE,
  exclude: readonly string[] = ADS_TEMPLATE_V2_EXCLUDE,
): boolean {
  if (!live) return false;
  const key = String(pathKey ?? "").replace(/^\/+|\/+$/g, "");
  if (key.endsWith("-rabatt")) return false;
  if (isAdsTemplateV2Excluded(city, loc, key, exclude)) return false;
  return isAdsTemplateV2Page(city, loc, key, pages);
}

/** Steht die Seite in ADS_TEMPLATE_V2_EXCLUDE (Strapi-Fassung statt v2)? */
export function isAdsTemplateV2Excluded(
  city: string | null | undefined,
  loc: string | null | undefined,
  pathKey: string | null | undefined,
  exclude: readonly string[] = ADS_TEMPLATE_V2_EXCLUDE,
): boolean {
  const key = String(pathKey ?? "").replace(/^\/+|\/+$/g, "");
  if (!city || !loc || !key) return false;
  return exclude.some((p) => matchesPattern(p, city, loc, key));
}

/** Hat der Standort mindestens eine v2-Seite? (Endpunkt der Zusatzdaten) */
export function isAdsTemplateV2Location(
  city: string | null | undefined,
  loc: string | null | undefined,
  pages: readonly string[] = ADS_TEMPLATE_V2_PAGES,
): boolean {
  if (!city || !loc) return false;
  return pages.some((p) => {
    const [pCity, pLoc] = p.split("/");
    return (pCity === "*" || pCity === city) && (pLoc === "*" || pLoc === loc);
  });
}

/**
 * Vorschau-Pfad (Benjamin, 30.09.2026: Vorlage erst ansehen, dann
 * aktivieren). v2 laeuft NUR unter /vorschau-v2/standorte/..., nie auf den
 * echten Anzeigen-Ziel-URLs. Ein Query-Parameter reicht nicht: Vercel-ISR
 * reicht die Query nicht an das Server-Rendern durch.
 */
export const ADS_TEMPLATE_V2_PREVIEW_PREFIX = "/vorschau-v2";

/** Pfad ohne Vorschau-Praefix (fuer Canonical), sonst unveraendert. */
export function stripAdsTemplateV2Preview(path: string): string {
  return path.replace(/^(\/[a-z]{2})?\/vorschau-v2(?=\/)/, "$1");
}

export function isAdsTemplateV2PreviewPath(path: string | null | undefined): boolean {
  return /^(?:\/[a-z]{2})?\/vorschau-v2\//.test(String(path ?? ""));
}

export type AdsV2Category = "muskelrelaxans" | "hyaluron" | "skinbooster" | "other";

export function adsV2Category(pathKey: string | null | undefined): AdsV2Category {
  const top = basePathKey(pathKey).split("/")[0];
  if (top === "muskelrelaxans") return "muskelrelaxans";
  if (top === "hyaluron" || top === "hyaluron-und-filler") return "hyaluron";
  if (top === "skinbooster") return "skinbooster";
  return "other";
}

// ---------------------------------------------------------------- Texte

export const ADS_V2_CTA = {
  /** Hauptknopf (oeffnet denselben Buchungsdialog wie "Termin buchen"). */
  primary: "Kostenlose Beratung buchen",
  /**
   * Mitlaufende Leiste, eine Zeile (Agentur-Feedback 01.10.2026: "Kostenlose
   * Beratung" statt "Beratung buchen"; daneben "Anrufen").
   */
  sticky: "Kostenlose Beratung",
};

export type AdsV2TrustItem = { key: string; title: string; text?: string };

/**
 * Zufriedenheitsgarantie je Kategorie (Benjamin, 01.10.2026: gilt fuer alles).
 * - Muskelrelaxans: Nachkontrolle mit kostenloser Nachbehandlung (am staerksten).
 * - Hyaluron: Nachkontrolle und Korrektur der Form ja; wer nach dem
 *   Abschwellen mehr Volumen (weitere ml) moechte, zahlt das Material.
 * - Hyaluron aufloesen, Skinbooster, Mesotherapie, PRP, Infusionen:
 *   Nachkontrolle und Beratung (kein Heilversprechen).
 */
export type AdsV2GuaranteeKind = "mr" | "hyaluron" | "check";

export function adsV2GuaranteeKind(pathKey: string | null | undefined): AdsV2GuaranteeKind {
  const key = basePathKey(pathKey);
  const cat = adsV2Category(key);
  if (cat === "muskelrelaxans") return "mr";
  if (cat === "hyaluron" && !key.endsWith("/hylase")) return "hyaluron";
  return "check";
}

export const ADS_V2_GUARANTEE: Readonly<
  Record<AdsV2GuaranteeKind, { short: string; timeline: string; faq: string }>
> = {
  mr: {
    short: "Kostenlose Nachkontrolle nach 14 Tagen inkl. kostenloser Nachbehandlung",
    timeline:
      "Nach 14 Tagen schauen wir gemeinsam auf das Ergebnis. Ist eine Nachbehandlung nötig, ist sie kostenlos (Zufriedenheitsgarantie).",
    faq: "Dann sag es uns: Nach 14 Tagen gibt es eine kostenlose Nachkontrolle, eine Nachbehandlung ist dabei inklusive und kostenlos (Zufriedenheitsgarantie).",
  },
  hyaluron: {
    short:
      "Kostenlose Nachkontrolle nach 14 Tagen; Korrekturen der Form inklusive – zusätzliches Volumen (weitere ml) wird nach Preisliste berechnet",
    timeline:
      "Nach 14 Tagen prüfen wir das Ergebnis kostenlos. Korrekturen der Form sind inklusive; möchtest du nach dem Abschwellen mehr Volumen, werden die weiteren ml nach Preisliste berechnet (Zufriedenheitsgarantie).",
    faq: "Nach 14 Tagen gibt es eine kostenlose Nachkontrolle. Korrekturen der Form sind inklusive (Zufriedenheitsgarantie). Möchtest du nach dem Abschwellen mehr Volumen, also weitere ml, wird das zusätzliche Material nach Preisliste berechnet.",
  },
  check: {
    short: "Kostenlose Nachkontrolle und Beratung innerhalb von 14 Tagen",
    timeline:
      "Innerhalb von 14 Tagen schauen wir uns das Ergebnis kostenlos an und beraten dich zum weiteren Vorgehen (Zufriedenheitsgarantie).",
    faq: "Innerhalb von 14 Tagen gibt es eine kostenlose Nachkontrolle und Beratung (Zufriedenheitsgarantie). Ärztin oder Arzt schauen sich das Ergebnis an und besprechen mit dir, wie es weitergeht.",
  },
};

export function adsV2Guarantee(pathKey: string | null | undefined) {
  return ADS_V2_GUARANTEE[adsV2GuaranteeKind(pathKey)];
}

/**
 * Vertrauenszeile (Benjamin, 01.10.2026): nach der Google-Bewertung (steht in
 * der Seite davor) Garantie -> nur Aerztinnen und Aerzte -> auch ohne Termin.
 * Die Garantie gilt fuer alle Kategorien, Text je Kategorie.
 */
export function adsV2TrustItems(pathKey?: string | null): AdsV2TrustItem[] {
  return [
    {
      key: "garantie",
      title: "Zufriedenheitsgarantie",
      text: adsV2Guarantee(pathKey).short,
    },
    {
      key: "aerzte",
      title: "Nur Ärztinnen und Ärzte",
      text: "Behandlung nur durch Ärztinnen und Ärzte",
    },
    {
      key: "walkin",
      title: "Auch ohne Termin",
      text: "Komm vorbei und frag, ob gerade Zeit ist. Mit Termin bist du auf der sicheren Seite.",
    },
  ];
}

export type AdsV2Step = { title: string; text: string };

/** "20-30 Minuten" aus Strapi, sonst die Angabe der Kategorie. */
function shortDuration(value: string | null | undefined, fallback: string): string {
  const m = /^\s*(\d+)\s*[-–]\s*(\d+)\s*Minuten\s*$/i.exec(value ?? "");
  return m ? `${m[1]}–${m[2]} Minuten` : fallback;
}

export function adsV2Steps(
  pathKey: string | null | undefined,
  strapiDuration?: string | null,
): AdsV2Step[] {
  const cat = adsV2Category(pathKey);
  const consult = {
    title: "Kostenlose Beratung",
    text:
      cat === "muskelrelaxans"
        ? "Deine Ärztin oder dein Arzt schaut sich deine Mimik an und bespricht mit dir, was sinnvoll ist."
        : "Deine Ärztin oder dein Arzt bespricht mit dir Wunsch, Menge und Ablauf. Du entscheidest danach in Ruhe.",
  };
  const control = {
    title: "Nachkontrolle",
    text: adsV2Guarantee(pathKey).timeline,
  };
  if (cat === "muskelrelaxans") {
    const d = shortDuration(strapiDuration, "20–30 Minuten");
    return [
      consult,
      {
        title: `Behandlung in ${d}`,
        text: "Mit einer sehr feinen Nadel wird an wenigen Punkten gespritzt. Danach kannst du meist direkt weitermachen.",
      },
      control,
    ];
  }
  if (cat === "hyaluron") {
    const d = shortDuration(strapiDuration, "30–45 Minuten");
    return [
      consult,
      {
        title: `Behandlung in ${d}`,
        text: "Nach der Betäubung wird das Hyaluron an den besprochenen Stellen eingebracht. Leichte Schwellungen gehen meist nach wenigen Tagen zurück.",
      },
      control,
    ];
  }
  const d = shortDuration(strapiDuration, "30 Minuten");
  return [
    consult,
    {
      title: `Behandlung in ${d}`,
      text: "Die Behandlung selbst ist kurz. Danach kannst du meist direkt weitermachen.",
    },
    control,
  ];
}

/**
 * Hersteller, soweit auf go. erlaubt (Benjamin, 30.09.2026): Aliaxin fuer
 * Hyaluron-Filler, Profhilo nur auf der Profhilo-Seite. Hyaluron aufloesen,
 * Polynukleotide, Mesotherapie, PRP: kein Hersteller.
 */
export function adsV2ProductNote(pathKey: string | null | undefined): string | null {
  const key = basePathKey(pathKey);
  const cat = adsV2Category(key);
  if (cat === "hyaluron") return key.endsWith("/hylase") ? null : "Wir verwenden Hyaluron von Aliaxin® (IBSA).";
  if (key === "skinbooster/profhilo") return "Wir verwenden Profhilo® (IBSA).";
  return null;
}

/**
 * Ratenzahlung (Benjamin, 01.10.2026): Raten gibt es nur ueber einen vorab
 * gekauften Gutschein, beim Gutscheinkauf mit Klarna oder PayPal. Der Knopf
 * fuehrt auf den Geschenkgutschein im Shop.
 */
export const ADS_V2_PAYMENT_TITLE = "Lieber in Raten?";
export const ADS_V2_PAYMENT_NOTE =
  "Gutschein vorab kaufen und mit Klarna oder PayPal in Raten zahlen.";
export const ADS_V2_VOUCHER_LABEL = "Gutschein kaufen\u00a0– in Raten zahlen";
export const ADS_V2_VOUCHER_URL = "https://shop.myhealthandbeauty.com/products/myh-b-geschenkgutschein";

const BLOCKED_UTM_TERM = /botox|btx|botulinum/gi;

function utmSlug(v: string | null | undefined): string {
  return String(v ?? "")
    .toLowerCase()
    .replace(BLOCKED_UTM_TERM, "muskelrelaxans")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Behandlungs-Slug fuer Tracking und utm_content: letztes Segment des Pfads. */
export function adsV2TreatmentSlug(pathKey: string | null | undefined): string {
  const key = basePathKey(pathKey);
  return utmSlug(key.split("/").pop());
}

/** Gutschein-Link mit Kampagnenwerten; utm_content = <behandlung>-<stadt>. */
export function adsV2VoucherUrl(pathKey: string | null | undefined, citySlug: string | null | undefined): string {
  const content = [adsV2TreatmentSlug(pathKey), utmSlug(citySlug)].filter(Boolean).join("-");
  const params = new URLSearchParams({
    utm_source: "go",
    utm_medium: "landingpage",
    utm_campaign: "gutschein_raten",
  });
  if (content) params.set("utm_content", content);
  return `${ADS_V2_VOUCHER_URL}?${params.toString()}`;
}

export type AdsV2Faq = { question: string; answer: string };

export function adsV2Faqs(
  pathKey: string | null | undefined,
  strapi?: { effectDuration?: string | null; initialResults?: string | null },
): AdsV2Faq[] {
  const cat = adsV2Category(pathKey);
  const clean = (v?: string | null) => (v ?? "").replace(/\s+/g, " ").trim();
  const guarantee = adsV2Guarantee(pathKey).faq;
  const who =
    "Ausschließlich Ärztinnen und Ärzte. Sie beraten dich vorher und sagen dir ehrlich, wenn eine Behandlung nicht zu dir passt.";

  if (cat === "muskelrelaxans") {
    const duration =
      [clean(strapi?.initialResults), clean(strapi?.effectDuration)]
        .filter(Boolean)
        .join(" ") ||
      "Die Wirkung setzt nach einigen Tagen ein und hält in der Regel 3 bis 6 Monate.";
    return [
      {
        question: "Tut das weh?",
        answer:
          "Die meisten spüren nur kurze Pikser. Es wird mit sehr feinen Nadeln gearbeitet, auf Wunsch gibt es vorher eine Betäubungscreme.",
      },
      {
        question: "Sieht das natürlich aus?",
        answer:
          "Ziel ist ein entspannter Ausdruck, kein starres Gesicht. Die Menge wird an deine Mimik angepasst. Lieber mit weniger starten und bei der Nachkontrolle ergänzen.",
      },
      { question: "Wie lange hält das?", answer: duration },
      {
        question: "Welche Risiken gibt es – und was, wenn es mir nicht gefällt?",
        answer: `Kleine Rötungen oder blaue Flecken sind möglich und gehen meist nach wenigen Tagen zurück. Über alle Risiken klärt dich die Ärztin oder der Arzt vorher auf. ${guarantee}`,
      },
      { question: "Wer behandelt mich?", answer: who },
    ];
  }

  const duration =
    clean(strapi?.effectDuration) ||
    "Das hängt von Bereich und Menge ab. Die Ärztin oder der Arzt sagt dir in der Beratung, womit du rechnen kannst.";
  return [
    {
      question: "Tut das weh?",
      answer:
        "Vorher wird betäubt. Die meisten spüren nur Druck und kurze Pikser.",
    },
    {
      question: "Sieht das natürlich aus?",
      answer:
        "Wir arbeiten mit kleinen Mengen und passend zu deinem Gesicht. Lieber mit weniger starten – bei der Nachkontrolle kann ergänzt werden.",
    },
    { question: "Wie lange hält das?", answer: duration },
    {
      question: "Welche Risiken gibt es – und was, wenn es mir nicht gefällt?",
      answer: `Schwellungen und kleine blaue Flecken sind in den ersten Tagen normal. Über alle Risiken klärt dich die Ärztin oder der Arzt vorher auf. ${guarantee}`,
    },
    {
      question:
        cat === "hyaluron" || cat === "skinbooster"
          ? "Welches Produkt wird verwendet – und wer behandelt?"
          : "Wer behandelt mich?",
      answer: [adsV2ProductNote(pathKey), who].filter(Boolean).join(" "),
    },
  ];
}

// ---------------------------------------------------------------- Preise

export type AdsV2PriceCard = {
  key: string;
  label: string;
  regularCent: number;
  regular: string;
  /** Neukundenpreis mit Sternchen, z. B. "119,99 €*"; null = nur regulaer. */
  offer: string | null;
  /** Zusatz, z. B. "79,99 € je Zone". */
  note?: string;
  /** Streichpreis-Paket (nur ueber ADS_V2_PACKAGES). */
  isPackage?: boolean;
};

/**
 * Pakete mit Streichpreis: NOCH NICHT aktiv (Benjamin, 30.09.2026: Preise
 * nicht final, die Center muessen sie kennen). Spaeter hier je pathKey
 * (ohne "-rabatt") eintragen, z. B.
 *   "muskelrelaxans/stirnfalte": [{ key: "stirn-zornes", label: "Stirn +
 *   Zornesfalte", regularCent: 19999, offerCent: 14999 }]
 * Die Karten erscheinen dann vor den Einzelpreisen.
 */
export type AdsV2Package = {
  key: string;
  label: string;
  regularCent: number;
  offerCent: number;
  note?: string;
};
export const ADS_V2_PACKAGES: Readonly<Record<string, readonly AdsV2Package[]>> = {};

type VariantLike = {
  slug?: string | null;
  name?: string | null;
  priceInEuroCent?: number | null;
  isActive?: boolean | null;
};

function variantLabel(v: VariantLike): string | null {
  const slug = String(v.slug ?? "");
  let m = /^(\d+)-(\d+)-ml$/.exec(slug);
  if (m) return `${m[1]},${m[2]} ml`;
  m = /^(\d+)-ml$/.exec(slug);
  if (m) return `${m[1]} ml`;
  m = /^(\d+)-zonen?$/.exec(slug);
  if (m) return `${m[1]} ${m[1] === "1" ? "Zone" : "Zonen"}`;
  const name = (v.name ?? "").trim();
  return name || null;
}

/** Muskelrelaxans-Seiten mit Zonenpreisen (1-3 Zonen). */
const ZONE_PRICE_KEYS = new Set([
  "muskelrelaxans/stirnfalte",
  "muskelrelaxans/zornesfalte",
  "muskelrelaxans/kraehenfuesse",
  "muskelrelaxans/browlift",
  "muskelrelaxans/lachfalten",
  "muskelrelaxans/lipflip",
  "muskelrelaxans/bunny-lines",
  "muskelrelaxans/erdbeerkinn",
]);

/**
 * Welche Strapi-Varianten als Preiskarten erscheinen. An vielen Behandlungen
 * haengen Produkte mit Varianten, die nicht zur Seite passen (Lippenkorrektur:
 * Muskelrelaxans-Zonen; Nasolabialfalte: zwei "1,0 ml" mit 199,99/299,99 €,
 * waehrend der Hero "ab 199,99 €" sagt). Dort zaehlt nur der Grundpreis der
 * Behandlung - derselbe wie im Hero (useNewCustomerOffer).
 * - "zones": Muskelrelaxans-Zonen 1-3 (Stirn & Co.)
 * - "ml": Lippen aufspritzen (0,5 ml / 1,0 ml, wie bisher)
 * - "variant:<slug>": genau eine Variante (Masseter, Zaehneknirschen)
 * - "base": nur der Grundpreis
 * Seiten ohne v2-Eintrag behalten das alte Verhalten (Muskelrelaxans: Zonen,
 * sonst alle Varianten).
 */
export function adsV2PriceMode(pathKey: string | null | undefined): string {
  const key = basePathKey(pathKey);
  if (ZONE_PRICE_KEYS.has(key)) return "zones";
  if (key === "hyaluron/lippen-aufspritzen") return "ml";
  if (key === "muskelrelaxans/masseter") return "variant:masseter";
  if (key === "muskelrelaxans/zaehneknirschen-bruxismus") return "variant:bruxismus";
  if (ADS_TEMPLATE_V2_TREATMENTS.includes(key)) return "base";
  return adsV2Category(key) === "muskelrelaxans" ? "zones" : "all";
}

/**
 * Preiskarten aus den Strapi-Varianten der Behandlung: Neukundenpreis* gross,
 * regulaer klein. Muskelrelaxans: nur Zonen (1-3), ohne Masseter & Co., die
 * am selben Produkt haengen. Hoechstens `max` Karten, nach Preis sortiert.
 */
export function adsV2PriceCards(
  pathKey: string | null | undefined,
  treatment:
    | { products?: Array<{ variants?: VariantLike[] | null }> | null; priceInEuroCent?: number | null; isStartingPrice?: boolean | null }
    | null
    | undefined,
  pct: number = DEFAULT_NEW_CUSTOMER_DISCOUNT_PCT,
  max = 3,
): AdsV2PriceCard[] {
  const mode = adsV2PriceMode(pathKey);
  const seen = new Set<string>();
  const cards: AdsV2PriceCard[] = [];
  const variants = mode === "base" ? [] : (treatment?.products ?? []).flatMap((p) => p?.variants ?? []);
  for (const v of variants) {
    if (!v || v.isActive === false || !v.priceInEuroCent) continue;
    const slug = String(v.slug ?? "");
    if (mode === "zones" && !/^[123]-zonen?$/.test(slug)) continue;
    if (mode === "ml" && !/^\d+(?:-\d+)?-ml$/.test(slug)) continue;
    if (mode.startsWith("variant:") && slug !== mode.slice("variant:".length)) continue;
    const label = mode.startsWith("variant:") ? "Behandlung" : variantLabel(v);
    if (!label || seen.has(label)) continue;
    seen.add(label);
    const nk = newCustomerPriceCent(v.priceInEuroCent, pct);
    const zones = /^(\d+)-zonen?$/.exec(slug);
    const perZone =
      nk && zones && Number(zones[1]) > 1
        ? Math.floor((nk / Number(zones[1]) - 99) / 100) * 100 + 99
        : null;
    cards.push({
      key: slug || label,
      label,
      regularCent: v.priceInEuroCent,
      regular: `regulär ${formatEuroCent(v.priceInEuroCent)}`,
      offer: nk ? `${formatEuroCent(nk)}*` : null,
      note: perZone && perZone > 0 ? `${formatEuroCent(perZone)} je Zone` : undefined,
    });
  }
  cards.sort((a, b) => a.regularCent - b.regularCent);
  const singles = cards.slice(0, max);

  if (singles.length === 0 && treatment?.priceInEuroCent) {
    const nk = newCustomerPriceCent(treatment.priceInEuroCent, pct);
    const ab = treatment.isStartingPrice ? "ab " : "";
    singles.push({
      key: "base",
      label: "Behandlung",
      regularCent: treatment.priceInEuroCent,
      regular: `regulär ${ab}${formatEuroCent(treatment.priceInEuroCent)}`,
      offer: nk ? `${ab}${formatEuroCent(nk)}*` : null,
    });
  }

  const packages = (ADS_V2_PACKAGES[basePathKey(pathKey)] ?? []).map((p) => ({
    key: `paket-${p.key}`,
    label: p.label,
    regularCent: p.regularCent,
    regular: `statt ${formatEuroCent(p.regularCent)}`,
    offer: `${formatEuroCent(p.offerCent)}*`,
    note: p.note,
    isPackage: true,
  }));
  return [...packages, ...singles];
}

// ---------------------------------------------------------------- Bewertungen

export type ReviewLike = {
  id?: number | string;
  rating?: number | null;
  text?: string | null;
  author?: string | null;
};

const CITY_NAMES = [
  "Aachen", "Berlin", "Bochum", "Bonn", "Dortmund", "Düsseldorf", "Duisburg",
  "Essen", "Frankfurt", "Hamburg", "Kaiserslautern", "Köln", "Leipzig",
  "Magdeburg", "Mainz", "Mönchengladbach", "München", "Oberhausen",
  "Recklinghausen", "Wuppertal",
];

const CATEGORY_WORDS: Record<AdsV2Category, RegExp> = {
  muskelrelaxans: /falte|stirn|zornes|krähen|mimik|masseter/i,
  hyaluron: /lippe|hyaluron|filler|volumen/i,
  skinbooster: /skinbooster|profhilo|haut/i,
  other: /$^/,
};

const RESTRICTED = /botox|botulinum|btx/i;

/**
 * Drei Bewertungen des Standorts: 5 Sterne, ohne Markennamen, ohne Nennung
 * einer anderen Stadt (in Strapi haengen einzelne Bewertungen anderer Center
 * am Standort), Treffer zur Behandlung zuerst, dann nach Laenge (nicht zu
 * kurz, nicht zu lang).
 */
export function pickAdsV2Reviews<T extends ReviewLike>(
  reviews: T[] | null | undefined,
  city: string | null | undefined,
  pathKey: string | null | undefined,
  count = 3,
): T[] {
  const words = CATEGORY_WORDS[adsV2Category(pathKey)];
  const otherCities = CITY_NAMES.filter((c) => c !== city);
  const ok = (reviews ?? []).filter((r) => {
    const text = String(r?.text ?? "");
    if ((r?.rating ?? 5) < 5 || text.trim().length < 40) return false;
    if (RESTRICTED.test(text) || RESTRICTED.test(String(r?.author ?? ""))) return false;
    return !otherCities.some((c) => text.includes(c));
  });
  const score = (r: T) => {
    const text = String(r.text ?? "");
    const len = text.length;
    return (words.test(text) ? 1000 : 0) - Math.abs(len - 220);
  };
  // Dieselbe Bewertung steht in den Daten teils doppelt (z. B. zwei Eintraege
  // derselben Person mit gleichem Text) - nur einmal zeigen.
  const seen = new Set<string>();
  const unique = [...ok]
    .sort((a, b) => score(b) - score(a))
    .filter((r) => {
      const key = `${String(r.author ?? "").trim().toLowerCase()}|${String(r.text ?? "").replace(/\s+/g, " ").trim().toLowerCase()}`;
      const textKey = String(r.text ?? "").replace(/\s+/g, " ").trim().toLowerCase();
      if (seen.has(key) || seen.has(textKey)) return false;
      seen.add(key);
      seen.add(textKey);
      return true;
    });
  return unique.slice(0, count);
}

/** Kuerzen am Wortende, hoechstens `max` Zeichen. */
export function shortenText(value: string | null | undefined, max = 240): string {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20)).replace(/[\s,.;:–-]+$/, "")} …`;
}

// ---------------------------------------------------------------- Aerzt:innen

export type EmployeeLike = {
  academicTitle?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  employeeType?: string | null;
  isActive?: boolean | null;
  hideFromPublic?: boolean | null;
  photo?: unknown;
  locations?: Array<{ slug?: string | null }> | null;
};

export function employeeDisplayName(e: EmployeeLike): string {
  return [e.academicTitle, e.firstName, e.lastName]
    .map((v) => (v ?? "").trim())
    .filter(Boolean)
    .join(" ");
}

/**
 * Aerzt:innen DES Centers: sichtbar, mit Foto, dem Standort zugeordnet.
 * Wer an vielen Centern gefuehrt wird (Chefarzt an allen), kommt nach
 * hinten; hoechstens `count`.
 */
export function pickAdsV2Doctors<T extends EmployeeLike>(
  employees: T[] | null | undefined,
  locationSlug: string | null | undefined,
  count = 3,
): T[] {
  const list = (employees ?? []).filter(
    (e) =>
      e &&
      e.employeeType === "doctor" &&
      e.isActive !== false &&
      !e.hideFromPublic &&
      !!e.photo &&
      !!employeeDisplayName(e) &&
      (e.locations ?? []).some((l) => l?.slug === locationSlug),
  );
  return [...list]
    .sort((a, b) => (a.locations?.length ?? 0) - (b.locations?.length ?? 0))
    .slice(0, count);
}

// ---------------------------------------------------------------- Oeffnungszeiten

const DAYS = [
  ["monday", "Mo"], ["tuesday", "Di"], ["wednesday", "Mi"], ["thursday", "Do"],
  ["friday", "Fr"], ["saturday", "Sa"], ["sunday", "So"],
] as const;

type WeekLike = Array<{
  day?: string | null;
  closed?: boolean | null;
  intervals?: Array<{ opens?: string | null; closes?: string | null }> | null;
}>;

function hhmm(v: string | null | undefined): string {
  const m = /^(\d{1,2}):(\d{2})/.exec(v ?? "");
  if (!m) return "";
  return m[2] === "00" ? String(Number(m[1])) : `${Number(m[1])}:${m[2]}`;
}

/** "Mo–Do 10–20 Uhr · Fr–Sa 10–21 Uhr · So geschlossen" */
export function openingHoursSummary(week: WeekLike | null | undefined): string {
  if (!week?.length) return "";
  const byDay = new Map(week.map((d) => [d.day, d]));
  const rows = DAYS.map(([day, short]) => {
    const d = byDay.get(day);
    const iv = d?.intervals ?? [];
    const value =
      !d || d.closed || iv.length === 0
        ? "geschlossen"
        : `${iv.map((i) => `${hhmm(i.opens)}–${hhmm(i.closes)}`).join(", ")} Uhr`;
    return { short, value };
  });
  const groups: Array<{ from: string; to: string; value: string }> = [];
  for (const r of rows) {
    const last = groups[groups.length - 1];
    if (last && last.value === r.value) last.to = r.short;
    else groups.push({ from: r.short, to: r.short, value: r.value });
  }
  return groups
    .map((g) => `${g.from === g.to ? g.from : `${g.from}–${g.to}`} ${g.value}`)
    .join(" · ");
}
