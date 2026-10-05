/**
 * go.* Seitenvorlage v2 - Premium-Ebene ("Premium Ads Landing Page",
 * Ticket Parya 05.10.2026).
 *
 * Entscheidungen (Parya, 05.10.2026):
 * - Hybrid: Inhalte, Preise, Garantie- und Compliance-Logik bleiben in v2
 *   (shared/adsTemplateV2*.ts). Strapi darf nur freigegebene Texte, die
 *   Reihenfolge und die Sichtbarkeit einzelner Abschnitte ueberschreiben.
 * - Gestaltung: dezente Tiefe AUF der CI-Gestaltung "ci-preis" (Benjamin,
 *   02.10.2026: v2 wirkte "zu AI-maessig"). Keine neuen Farben, kein Glas,
 *   kein Blur, kein WebGL - nur Schatten-Ebenen, geschichtete Fotos und eine
 *   ruhige Parallaxe im Hero (Desktop, Maus).
 * - Strapi-Schema vorerst nur als JSON im PR (docs/strapi-schema/ads/).
 *
 * Alles hier ohne Vue und ohne Nuxt, damit es mit
 * `node --experimental-strip-types --test` pruefbar bleibt.
 */
import { isAdsTemplateV2Page, isAdsTemplateV2PreviewPath, stripAdsTemplateV2Preview } from "./adsTemplateV2.ts";

// ---------------------------------------------------------------- Umschaltung

/**
 * Seiten mit Premium-Ebene auf den ECHTEN Anzeigen-URLs, Muster wie
 * ADS_TEMPLATE_V2_PAGES ("stadt/standort/pathKey", "*" je Segment).
 * Absichtlich leer: Premium laeuft zunaechst nur in der Vorschau
 * /vorschau-premium/standorte/... (Ticket: nicht deployen, erst vergleichen).
 * Ausrollen = Muster eintragen, wie bei ADS_TEMPLATE_V2_DESIGN.
 */
export const ADS_PREMIUM_PAGES: readonly string[] = [];

/** Vorschau-Pfad der Premium-Ebene (gleiches Prinzip wie /vorschau-v2). */
export const ADS_PREMIUM_PREVIEW_PREFIX = "/vorschau-premium";

export function isAdsPremiumPreviewPath(path: string | null | undefined): boolean {
  return /^(?:\/[a-z]{2})?\/vorschau-premium\//.test(String(path ?? ""));
}

/** Eine der Ads-Vorschauen (/vorschau-v2 oder /vorschau-premium)? */
export function isAdsAnyPreviewPath(path: string | null | undefined): boolean {
  return isAdsTemplateV2PreviewPath(path) || isAdsPremiumPreviewPath(path);
}

/** Pfad ohne Vorschau-Praefix (fuer Canonical), sonst unveraendert. */
export function stripAdsAnyPreview(path: string): string {
  return stripAdsTemplateV2Preview(path).replace(/^(\/[a-z]{2})?\/vorschau-premium(?=\/)/, "$1");
}

/** Premium auf der echten Seite? (nur v2-Seiten, nur ueber ADS_PREMIUM_PAGES) */
export function isAdsPremiumPage(
  city: string | null | undefined,
  loc: string | null | undefined,
  pathKey: string | null | undefined,
  pages: readonly string[] = ADS_PREMIUM_PAGES,
): boolean {
  if (!pages.length) return false;
  return isAdsTemplateV2Page(city, loc, pathKey, pages);
}

// ---------------------------------------------------------------- Abschnitte

/**
 * Abschnitte der v2-Seite in der heutigen Reihenfolge (Page.vue). "hero" und
 * "final" sind fest (erster/letzter), "trust" bleibt direkt hinter Hero bzw.
 * Clips (Benjamin, 01.10.2026: Clips noch vor der Vertrauenszeile).
 */
export const ADS_SECTIONS = [
  "hero",
  "clips",
  "trust",
  "facts",
  "how",
  "mid",
  "steps",
  "prices",
  "zones",
  "doctors",
  "lounge",
  "consult",
  "reviews",
  "objections",
  "location",
  "faq",
  "final",
] as const;
export type AdsSection = (typeof ADS_SECTIONS)[number];

/** Nie ausblendbar: Einstieg, Vertrauen, Preis/Angebot, Schlussaufruf. */
export const ADS_REQUIRED_SECTIONS: ReadonlySet<AdsSection> = new Set<AdsSection>([
  "hero",
  "trust",
  "prices",
  "final",
]);

/** Nicht verschiebbar (Position fest). */
const PINNED: ReadonlySet<AdsSection> = new Set<AdsSection>(["hero", "clips", "trust", "final"]);

function isSection(v: unknown): v is AdsSection {
  return typeof v === "string" && (ADS_SECTIONS as readonly string[]).includes(v);
}

/**
 * Reihenfolge aus Strapi (Liste von Abschnitts-Schluesseln) gegen die feste
 * Struktur pruefen: unbekannte und doppelte Schluessel fallen weg, feste
 * Abschnitte bleiben an ihrem Platz, fehlende Abschnitte kommen in der
 * Standard-Reihenfolge ans Ende des beweglichen Teils.
 */
export function resolveSectionOrder(order: readonly unknown[] | null | undefined): AdsSection[] {
  const movableDefault = ADS_SECTIONS.filter((s) => !PINNED.has(s));
  const seen = new Set<AdsSection>();
  const movable: AdsSection[] = [];
  for (const raw of order ?? []) {
    if (!isSection(raw) || PINNED.has(raw) || seen.has(raw)) continue;
    seen.add(raw);
    movable.push(raw);
  }
  for (const s of movableDefault) if (!seen.has(s)) movable.push(s);
  return ["hero", "clips", "trust", ...movable, "final"];
}

/** Ausgeblendete Abschnitte ohne die Pflicht-Abschnitte. */
export function resolveHiddenSections(hidden: readonly unknown[] | null | undefined): Set<AdsSection> {
  const out = new Set<AdsSection>();
  for (const raw of hidden ?? []) {
    if (isSection(raw) && !ADS_REQUIRED_SECTIONS.has(raw)) out.add(raw);
  }
  return out;
}

// ---------------------------------------------------------------- Strapi-Overrides

/** Ueberschriften der v2-Seite, die Strapi ersetzen darf (Schluessel von H). */
export const ADS_OVERRIDABLE_HEADLINES = [
  "clips",
  "facts",
  "how",
  "steps",
  "prices",
  "zones",
  "doctors",
  "consult",
  "reviews",
  "faq",
  "location",
  "final",
] as const;
export type AdsHeadlineKey = (typeof ADS_OVERRIDABLE_HEADLINES)[number];

/**
 * Rohform aus Strapi (Komponente ads.overrides, docs/strapi-schema/ads/).
 * Bewusst KEINE Felder fuer Preise, Rabatt, Garantie, Farben, Abstaende
 * oder CSS - und keines fuer den Buchungsknopf: Text und Ziel kommen fuer
 * alle Knoepfe der Seite (Hero, Mitte, Preise, Aerzt:innen, Einwaende,
 * Schluss, Leiste) aus EINER Quelle in Page.vue (bookingButton/heroCta,
 * ADS_V2_CTA und Angebots-Test shared/adsOfferVariant.ts). Ein Redaktions-
 * Override wuerde den A/B-Test verfaelschen.
 */
export type AdsOverridesRaw = {
  heroHeadline?: unknown;
  heroSubline?: unknown;
  headlines?: Array<{ key?: unknown; text?: unknown }> | null;
  sectionOrder?: Array<{ section?: unknown }> | null;
  hiddenSections?: Array<{ section?: unknown }> | null;
} | null | undefined;

export type AdsOverrides = {
  heroHeadline: string | null;
  heroSubline: string | null;
  headlines: Partial<Record<AdsHeadlineKey, string>>;
  order: AdsSection[];
  hidden: Set<AdsSection>;
  /** Abgelehnte Felder mit Grund (fuer Konsole/Redaktion, nicht fuer Nutzer). */
  rejected: Array<{ field: string; reason: string }>;
};

/** Markenname des Muskelrelaxans: auf go. nie (shared/adsTemplateV2.ts). */
const RESTRICTED_GO = /botox|botulinum|btx/i;
/**
 * Heilversprechen und Garantie-Woerter, die v2 bewusst nicht nutzt
 * (Benjamin, 30.09.2026: kein Heilversprechen, kein "Aerztlich geprueft",
 * kein "Kostenlos absagen"). Die Garantie-Texte kommen nur aus dem Code.
 */
const RESTRICTED_CLAIMS = /garantiert|100\s*%|schmerzfrei|ohne\s+risiko|risikofrei|heilt|ärztlich\s+geprüft|kostenlos\s+absagen/i;
const MARKUP = /<[^>]*>|https?:\/\/|javascript:/i;

const LIMITS = { heroHeadline: 70, heroSubline: 140, headline: 70 } as const;

function cleanText(
  value: unknown,
  max: number,
  field: string,
  goMode: boolean,
  rejected: AdsOverrides["rejected"],
): string | null {
  if (value == null) return null;
  if (typeof value !== "string") {
    rejected.push({ field, reason: "kein Text" });
    return null;
  }
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return null;
  if (text.length > max) {
    rejected.push({ field, reason: `länger als ${max} Zeichen` });
    return null;
  }
  if (MARKUP.test(text)) {
    rejected.push({ field, reason: "HTML oder Link" });
    return null;
  }
  if (goMode && RESTRICTED_GO.test(text)) {
    rejected.push({ field, reason: "Markenname auf go. nicht erlaubt" });
    return null;
  }
  if (RESTRICTED_CLAIMS.test(text)) {
    rejected.push({ field, reason: "Heil-/Garantieversprechen" });
    return null;
  }
  return text;
}

/**
 * Overrides aus Strapi pruefen. Was nicht passt, faellt auf die v2-Texte
 * zurueck (null = v2-Standard). Seite bricht nie wegen eines Overrides.
 */
export function resolveAdsOverrides(raw: AdsOverridesRaw, opts: { goMode: boolean }): AdsOverrides {
  const rejected: AdsOverrides["rejected"] = [];
  const r = raw ?? {};
  const headlines: Partial<Record<AdsHeadlineKey, string>> = {};
  for (const item of r.headlines ?? []) {
    const key = item?.key;
    if (typeof key !== "string" || !(ADS_OVERRIDABLE_HEADLINES as readonly string[]).includes(key)) {
      rejected.push({ field: `headlines.${String(key)}`, reason: "unbekannter Abschnitt" });
      continue;
    }
    const text = cleanText(item?.text, LIMITS.headline, `headlines.${key}`, opts.goMode, rejected);
    if (text) headlines[key as AdsHeadlineKey] = text;
  }
  return {
    heroHeadline: cleanText(r.heroHeadline, LIMITS.heroHeadline, "heroHeadline", opts.goMode, rejected),
    heroSubline: cleanText(r.heroSubline, LIMITS.heroSubline, "heroSubline", opts.goMode, rejected),
    headlines,
    order: resolveSectionOrder((r.sectionOrder ?? []).map((x) => x?.section)),
    hidden: resolveHiddenSections((r.hiddenSections ?? []).map((x) => x?.section)),
    rejected,
  };
}

// ---------------------------------------------------------------- Bewegung

export type DepthEnv = {
  reducedMotion: boolean;
  /** (pointer: coarse) bzw. kein Hover = Touch-Geraet */
  coarsePointer: boolean;
  saveData?: boolean;
  /** navigator.deviceMemory in GB, falls bekannt */
  deviceMemory?: number;
  viewportWidth: number;
};

/** Ab dieser Breite darf der Hero auf die Maus reagieren (= v2-Desktop-Layout). */
export const ADS_DEPTH_MIN_WIDTH = 1024;

/**
 * Darf die Hero-Parallaxe laufen? Nur Desktop mit feiner Maus, ohne
 * reduzierte Bewegung, ohne Datensparmodus, nicht auf schwachen Geraeten.
 * Sonst bleibt die statische Tiefe (Schatten/Ebenen) - Inhalt und CTA haengen
 * nie an der Bewegung.
 */
export function shouldEnableDepthMotion(env: DepthEnv): boolean {
  if (env.reducedMotion || env.coarsePointer || env.saveData) return false;
  if (typeof env.deviceMemory === "number" && env.deviceMemory > 0 && env.deviceMemory < 4) return false;
  return env.viewportWidth >= ADS_DEPTH_MIN_WIDTH;
}

/** Maus-Position (0..1) in einen begrenzten Versatz in px umrechnen. */
export function depthOffset(ratioX: number, ratioY: number, maxPx = 6): { x: number; y: number } {
  const clamp = (v: number) => Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0.5));
  const round = (v: number) => Math.round(v * 100) / 100;
  return {
    x: round((clamp(ratioX) - 0.5) * 2 * maxPx),
    y: round((clamp(ratioY) - 0.5) * 2 * maxPx),
  };
}

// ---------------------------------------------------------------- Tracking

/**
 * Stabile Kennung fuer data-track-placement nach der v2-Konvention
 * ("v2_<abschnitt>[_<element>][_<schluessel>]", nur a-z0-9_).
 */
export function adsTrackPlacement(section: AdsSection, element?: string | null, key?: string | null): string {
  const part = (v: string | null | undefined) =>
    String(v ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  return ["v2", part(section), part(element), part(key)].filter(Boolean).join("_");
}
