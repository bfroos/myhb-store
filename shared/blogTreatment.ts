/**
 * E24 #316: Ratgeber mit Buchung verbinden.
 *
 * Blogartikel haben in Strapi keine Verknuepfung zur Behandlung. Die
 * Zuordnung laeuft ueber den Slug (erste passende Regel gewinnt), sonst ueber
 * die Blog-Kategorie. Ohne Zuordnung (Haartransplantation, OPs, News) gibt
 * es keine Buchungsbox.
 */
const RULES: ReadonlyArray<readonly [RegExp, string]> = [
  [/haartransplantation|schonheitsoperation|schoenheitsoperation|bruststraffung/, ""],
  [/lip-flip/, "botox/lipflip"],
  [/lippen|(^|-)lip(-|$)/, "hyaluron/lippen-aufspritzen"],
  [/hylase/, "hyaluron/hylase"],
  [/augenringe|traenen/, "hyaluron/augenringe-unterspritzen"],
  [/jawline/, "hyaluron/jawline"],
  [/nasolabial/, "hyaluron/nasolabialfalte"],
  [/masseter/, "botox/masseter"],
  [/kraehenfuesse|krahenfusse/, "botox/kraehenfuesse"],
  [/zornesfalte/, "botox/zornesfalte"],
  [/botox-stirn|stirnfalte/, "botox/stirnfalte"],
  [/barbie/, "botox/barbie-botox"],
  [/profhilo/, "skinbooster/profhilo"],
  [/meso-?therapie/, "skinbooster/mesotherapie-nctf-135-ha"],
  [/polynukleotid/, "skinbooster/polynukleotide-lachssperma"],
  [/vampir|(^|-)prp(-|$)/, "skinbooster/vampir-lifting-prp"],
  [/vitamin-c-infusion/, "infusionen/vitamin-c-infusion"],
  [/haarausfall/, "anti-haarausfall"],
  [/lemon-bottle|fettweg/i, "fettwegspritze"],
  // Allgemeine Themen (die by-slug-Antwort liefert keine Kategorie)
  [/infusion/, "infusionen"],
  [/skinbooster|glow|haut|prp/, "skinbooster"],
  [/hyaluron/, "hyaluron"],
  [/botox|falten|augenlider|schlupflider/, "botox"],
];

const BY_CATEGORY: Record<string, string> = {
  botox: "botox",
  hyaluron: "hyaluron",
  skinbooster: "skinbooster",
  infusionen: "infusionen",
  haare: "anti-haarausfall",
  fettwegspritze: "fettwegspritze",
};

/** pathKey der Behandlung zu einem Artikel oder null. */
export function blogTreatmentPathKey(slug: string | null | undefined, categorySlug?: string | null): string | null {
  const s = String(slug ?? "").toLowerCase();
  for (const [re, key] of RULES) if (re.test(s)) return key || null;
  return BY_CATEGORY[String(categorySlug ?? "")] ?? null;
}

/** Kostenseite je Kategorie. */
export function costPageForPathKey(pathKey: string): { href: string; text: string } | null {
  if (pathKey === "hyaluron/lippen-aufspritzen") return { href: "/behandlungen/hyaluron/lippen-aufspritzen#kosten", text: "Lippen aufspritzen Kosten" };
  const cat = pathKey.split("/")[0];
  if (cat === "botox") return { href: "/p/botox-kosten", text: "Kosten pro Zone" };
  if (cat === "hyaluron") return { href: "/p/hyaluron-spritzen-kosten", text: "Hyaluron Kosten" };
  if (cat === "skinbooster") return { href: "/p/skinbooster-preise", text: "Skinbooster Kosten" };
  return { href: "/preise", text: "Alle Preise" };
}

/** Meta-Description aus dem Intro: hoechstens ~155 Zeichen, am Wortende. */
export function shortDescription(text: string | null | undefined, max = 155): string {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,.;:–-]+$/, "")} …`;
}
