/**
 * Eigene Seite je Kundenvideo (E24): /videos und /videos/<slug>.
 *
 * Die Stories (Strapi-Collection `stories`) laufen als Kacheln auf vielen
 * Seiten. Google zeigt ein Video aber nur dann in der Videosuche, wenn es der
 * Hauptinhalt einer Seite ist. Deshalb bekommt jede Story hier eine eigene
 * Seite mit Titel, Text, Vorschaubild und VideoObject.
 *
 * Es gibt zwei Formate in Strapi:
 * - alt: title = Behandlung, subtitle = Standort ("Browlift mit Botox" /
 *   "Aquis Plaza Aachen"),
 * - neu: title = "MY <Stadt>", subtitle = Behandlung + "Erfahrung"
 *   ("MY Köln" / "Botox Bewertung").
 *
 * Der Slug ist Titel (ohne "Erfahrung", "Bewertung", Klammerzusatz) plus
 * Stadt, z. B. browlift-mit-botox-aachen. Er aendert sich nur, wenn jemand den
 * Titel in Strapi aendert.
 *
 * Vorschaubilder: public/videos/thumbs/<slug>.jpg, erzeugt mit
 * scripts/video-thumbs.mjs. Eine Story ohne Bild bekommt keine Seite (wie in
 * der Video-Sitemap: ohne Vorschaubild ist der Eintrag ungueltig).
 */

import { btxToBotox } from "./seoTerms.ts";
import thumbSlugs from "./storyVideoThumbs.json" with { type: "json" };

export type StoryInput = {
  id: number | string;
  title?: string | null;
  subtitle?: string | null;
  internalLabel?: string | null;
  createdAt?: string | null;
  publishedAt?: string | null;
  video?: { url?: string | null; mime?: string | null } | null;
};

export type StoryLocation = {
  /** /standorte/<path> */
  path: string;
  citySlug: string;
  /** Kurzname fuer Kacheln und Breadcrumb, z. B. "Aquis Plaza Aachen". */
  name: string;
  /** Mit Praeposition fuer Saetze, z. B. "im Aquis Plaza Aachen". */
  at: string;
};

export type StoryTreatment = {
  /** pathKey der Behandlungsseite, z. B. botox/browlift. */
  pathKey: string;
  /** Fuer Text und Linktext, z. B. "Browlift mit Botox". */
  name: string;
};

export type StoryKind = "erfahrung" | "ergebnis" | "beratung" | "rundgang" | "feedback";

export type StoryVideo = {
  id: number | string;
  slug: string;
  title: string;
  h1: string;
  kind: StoryKind;
  sentences: string[];
  description: string;
  group: string;
  location: StoryLocation;
  treatment: StoryTreatment | null;
  /** Seite "Behandlung je Standort", sonst die Standortseite. */
  linkPath: string;
  linkText: string;
  videoUrl: string;
  uploadDate: string;
  thumbPath: string;
};

export const VIDEOS_PATH = "/videos";

/** Reihenfolge = Reihenfolge der Treffer. Erster Treffer gewinnt. */
export const STORY_LOCATIONS: Array<{ match: RegExp } & StoryLocation> = [
  { match: /aachen|aquis/, path: "aachen/aquis-plaza", citySlug: "aachen", name: "Aquis Plaza Aachen", at: "im Aquis Plaza Aachen" },
  { match: /k(ö|oe)ln/, path: "koeln/koeln-arcaden", citySlug: "koeln", name: "Köln Arcaden", at: "in den Köln Arcaden" },
  { match: /m(ö|oe)nchengladbach|minto/, path: "moenchengladbach/minto", citySlug: "moenchengladbach", name: "Minto Mönchengladbach", at: "im Minto Mönchengladbach" },
  { match: /kaiserslautern|k in lautern/, path: "kaiserslautern/k-in-lautern", citySlug: "kaiserslautern", name: "K in Lautern Kaiserslautern", at: "im K in Lautern Kaiserslautern" },
  { match: /recklinghausen|palais vest/, path: "recklinghausen/palais-vest", citySlug: "recklinghausen", name: "Palais Vest Recklinghausen", at: "im Palais Vest Recklinghausen" },
  { match: /berlin|gesundbrunnen/, path: "berlin/gesundbrunnencenter", citySlug: "berlin", name: "Gesundbrunnen-Center Berlin", at: "im Gesundbrunnen-Center Berlin" },
  { match: /leipzig|br(ü|ue)hl/, path: "leipzig/hoefe-am-bruehl", citySlug: "leipzig", name: "Höfe am Brühl Leipzig", at: "in den Höfen am Brühl Leipzig" },
  { match: /d(ü|ue)sseldorf/, path: "duesseldorf/duesseldorf-arcaden", citySlug: "duesseldorf", name: "Düsseldorf Arcaden", at: "in den Düsseldorf Arcaden" },
];

/**
 * Titel -> Behandlungsseite. Gesucht wird im Titel, Untertitel und internen
 * Label. Speziell vor allgemein (Erdbeerkinn vor Kinn, Lippenkorrektur vor
 * Lippen, Browlift vor Botox). Jede Zielseite je Standort ist am 06.11.2026
 * per curl mit 200 geprueft (Test in storyVideos.test.ts haelt die Liste fest).
 */
export const STORY_TREATMENTS: Array<{ match: RegExp } & StoryTreatment> = [
  { match: /browlift/, pathKey: "botox/browlift", name: "Browlift mit Botox" },
  { match: /lip ?flip/, pathKey: "botox/lipflip", name: "Lip Flip mit Botox" },
  { match: /erdbeerkinn/, pathKey: "botox/erdbeerkinn", name: "Botox gegen das Erdbeerkinn" },
  // "Botox gegen Kopfschmerzen" ist laut Video-Datei eine Masseter-Behandlung.
  { match: /masseter|kopfschmerz/, pathKey: "botox/masseter", name: "Masseter-Botox" },
  { match: /^stirnfalte/, pathKey: "botox/stirnfalte", name: "Stirnfalte mit Botox" },
  { match: /zornesfalte/, pathKey: "botox/zornesfalte", name: "Zornesfalte mit Botox" },
  { match: /stirnfalte/, pathKey: "botox/stirnfalte", name: "Stirnfalte mit Botox" },
  { match: /jawline/, pathKey: "hyaluron/jawline", name: "Jawline mit Hyaluron" },
  { match: /kinn/, pathKey: "hyaluron/kinnkorrektur", name: "Kinnkorrektur mit Hyaluron" },
  { match: /lippenkorrektur/, pathKey: "hyaluron/lippenkorrektur", name: "Lippenkorrektur mit Hyaluron" },
  { match: /lippe/, pathKey: "hyaluron/lippen-aufspritzen", name: "Lippen aufspritzen mit Hyaluron" },
  { match: /prp|vampir/, pathKey: "skinbooster/vampir-lifting-prp", name: "Vampir-Lifting mit PRP" },
  { match: /vitamin ?c/, pathKey: "infusionen/vitamin-c-infusion", name: "Vitamin-C-Infusion" },
  { match: /botox/, pathKey: "botox", name: "Botox" },
  { match: /hyaluron/, pathKey: "hyaluron", name: "Hyaluron" },
];

/** Gruppen der Uebersicht, in dieser Reihenfolge. */
export const STORY_GROUPS = ["Botox", "Hyaluron", "Vampir-Lifting (PRP)", "Infusionen", "Beratung und Standort"] as const;

const GROUP_BY_PREFIX: Record<string, (typeof STORY_GROUPS)[number]> = {
  botox: "Botox",
  hyaluron: "Hyaluron",
  skinbooster: "Vampir-Lifting (PRP)",
  infusionen: "Infusionen",
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Strapi schreibt "BTX" (wegen go.). Die Seiten gibt es nur auf www, also immer
// "Botox", egal ob die Daten ueber den www-Proxy oder direkt aus Strapi kommen
// (Sitemaps, Bild-Skript). Sonst hingen Slug und Text an der Quelle.
const clean = (s?: string | null) => btxToBotox((s ?? "").replace(/\s+/g, " ").trim());

function findLocation(text: string): StoryLocation | null {
  const hit = STORY_LOCATIONS.find((l) => l.match.test(text));
  if (!hit) return null;
  const { match: _m, ...loc } = hit;
  return loc;
}

function findTreatment(text: string): StoryTreatment | null {
  const hit = STORY_TREATMENTS.find((t) => t.match.test(text));
  if (!hit) return null;
  const { match: _m, ...t } = hit;
  return t;
}

/**
 * Schreibweisen aus Strapi in natuerliches Deutsch (nur fuer diese Seiten;
 * die Kacheln zeigen weiter den Strapi-Text).
 */
const TITLE_FIXES: Array<[RegExp, string]> = [
  [/^1\. Mal Botox mit (\d+) Jahren$/i, "Mit $1 zum ersten Mal Botox"],
  [/^Hyaluron Jawline Behandlung$/i, "Jawline-Behandlung mit Hyaluron"],
  [/Lippen Unterspritzung/i, "Lippenunterspritzung"],
  [/Vitamin C Infusion/i, "Vitamin-C-Infusion"],
  [/^(Masseter|PRP) (Behandlung|Botox)$/i, "$1-$2"],
  [/Lipflip/i, "Lip Flip"],
  [/ & /g, " und "],
];

/** Anzeigetitel ohne "Erfahrung"/"Bewertung" und ohne Klammerzusatz. */
function parseTitle(story: StoryInput): { title: string; note: string } {
  const title = clean(story.title);
  const isNew = /^MY\s/i.test(title);
  let base = isNew ? clean(story.subtitle) : title;
  const note = (base.match(/\(([^)]*)\)/)?.[1] ?? "").trim().toLowerCase();
  base = base.replace(/\([^)]*\)/g, " ");
  base = base.replace(/(\s+(Erfahrung|Bewertung|Rezension))+\s*$/i, "");
  base = clean(base);
  for (const [re, to] of TITLE_FIXES) base = base.replace(re, to);
  return { title: base, note };
}

function kindOf(title: string, note: string, treatment: StoryTreatment | null): StoryKind {
  if (/standortf(ü|ue)hrung|rundgang/i.test(title)) return "rundgang";
  if (/beratung/i.test(title)) return "beratung";
  if (!treatment) return "feedback";
  if (/nachher/.test(note)) return "ergebnis";
  return "erfahrung";
}

const BRAND = "MY HEALTH & BEAUTY";
const AERZTE = `Bei ${BRAND} behandeln ausschließlich Ärzte.`;
const BERATUNG = "Ob eine Behandlung zu dir passt, klärst du vorher in einem persönlichen Beratungsgespräch am Standort.";
const INDIVIDUELL = "Jedes Ergebnis ist individuell und kann bei dir anders ausfallen.";

function buildSentences(kind: StoryKind, title: string, loc: StoryLocation, treatment: StoryTreatment | null): string[] {
  switch (kind) {
    case "rundgang":
      return [
        `Das Video nimmt dich mit auf einen Rundgang durch ${BRAND} ${loc.at}.`,
        "So siehst du schon vor deinem ersten Termin, wo du ankommst und wie es bei uns aussieht.",
        AERZTE,
      ];
    case "beratung":
      return [
        `In diesem Video erzählt ein Kunde, wie er die ${/kostenlos/i.test(title) ? "kostenlose " : ""}Beratung ${loc.at} erlebt hat.`,
        "Im Beratungsgespräch klärst du, welche Behandlung zu dir passt und wie sie abläuft.",
        AERZTE,
      ];
    case "feedback":
      return [
        `In diesem Video erzählt ein Kunde, wie er seinen Besuch bei ${BRAND} ${loc.at} erlebt hat.`,
        BERATUNG,
        AERZTE,
      ];
    case "ergebnis":
      return [
        `Das Video zeigt das Ergebnis einer Behandlung ${loc.at}: ${treatment!.name}.`,
        AERZTE,
        BERATUNG,
        INDIVIDUELL,
      ];
    default:
      return [
        `In diesem Video erzählt ein Kunde von seiner Behandlung ${loc.at}: ${treatment!.name}.`,
        AERZTE,
        BERATUNG,
        INDIVIDUELL,
      ];
  }
}

function buildH1(kind: StoryKind, title: string, note: string, loc: StoryLocation): string {
  if (kind === "rundgang") return `${title} ${loc.at}`;
  if (kind === "feedback") return `Kundenfeedback ${loc.at}`;
  const suffix = kind === "ergebnis" ? "Ergebnis" : "Erfahrung";
  const lang = note === "arabisch" ? " auf Arabisch" : "";
  return `${title} ${loc.at} – ${suffix}${lang}`;
}

/** Eine Story -> Videoseite. null, wenn Video oder Standort fehlt. */
export function toStoryVideo(story: StoryInput): Omit<StoryVideo, "slug" | "thumbPath"> & { baseSlug: string } | null {
  const videoUrl = story.video?.url;
  if (!videoUrl) return null;
  if (story.video?.mime && !story.video.mime.startsWith("video/")) return null;

  const haystack = [story.title, story.subtitle, story.internalLabel].map(clean).join(" ").toLowerCase();
  const location = findLocation(haystack);
  if (!location) return null;

  const parsed = parseTitle(story);
  const treatment = findTreatment(haystack);
  const kind = kindOf(parsed.title, parsed.note, treatment);
  const title = kind === "feedback" ? "Kundenfeedback" : parsed.title || "Kundenfeedback";
  const sentences = buildSentences(kind, title, location, treatment);
  const uploadRaw = story.createdAt || story.publishedAt || "";

  return {
    id: story.id,
    // Sprachzusatz gehoert in den Slug: "Botox ohne Termin (Arabisch)" und
    // "Botox ohne Termin" am selben Standort sind zwei Videos.
    baseSlug: slugify([title, parsed.note === "arabisch" ? "arabisch" : "", location.citySlug].filter(Boolean).join(" ")),
    title,
    h1: buildH1(kind, title, parsed.note, location),
    kind,
    sentences,
    description: sentences.join(" "),
    group: treatment ? (GROUP_BY_PREFIX[treatment.pathKey.split("/")[0]!] ?? "Beratung und Standort") : "Beratung und Standort",
    location,
    treatment,
    linkPath: treatment ? `/standorte/${location.path}/${treatment.pathKey}` : `/standorte/${location.path}`,
    linkText: treatment ? `${treatment.name} ${location.at}` : `${BRAND} ${location.at}`,
    videoUrl,
    // W3C-Datum mit Sekunden: 2026-02-12T12:09:13Z
    uploadDate: uploadRaw.replace(/\.\d+Z$/, "Z"),
  };
}

/**
 * Alle Stories -> Videoseiten mit eindeutigem Slug. Doppelte Slugs bekommen
 * die Story-ID angehaengt; sortiert wird vorher nach ID, damit der erste
 * Eintrag seinen Slug behaelt.
 */
export function buildStoryVideos(stories: StoryInput[], hasThumb?: (slug: string) => boolean): StoryVideo[] {
  const sorted = [...stories].sort((a, b) => Number(a.id) - Number(b.id));
  const seen = new Set<string>();
  const out: StoryVideo[] = [];
  for (const story of sorted) {
    const v = toStoryVideo(story);
    if (!v) continue;
    const { baseSlug, ...rest } = v;
    const slug = seen.has(baseSlug) ? `${baseSlug}-${story.id}` : baseSlug;
    seen.add(slug);
    if (hasThumb && !hasThumb(slug)) continue;
    out.push({ ...rest, slug, thumbPath: `${VIDEOS_PATH}/thumbs/${slug}.jpg` });
  }
  return out;
}

/** Gruppen fuer die Uebersicht, leere Gruppen fallen weg. */
export function groupStoryVideos(videos: StoryVideo[]): Array<{ group: string; videos: StoryVideo[] }> {
  return STORY_GROUPS.map((group) => ({ group, videos: videos.filter((v) => v.group === group) })).filter(
    (g) => g.videos.length > 0,
  );
}

const abs = (siteUrl: string, path: string) => (/^https?:\/\//.test(path) ? path : `${siteUrl.replace(/\/+$/, "")}${path}`);

/** schema.org VideoObject fuer die Einzelseite. */
export function storyVideoSchema(v: StoryVideo, siteUrl: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: v.h1,
    description: v.description,
    thumbnailUrl: [abs(siteUrl, v.thumbPath)],
    uploadDate: v.uploadDate,
    contentUrl: v.videoUrl,
    inLanguage: "de",
    publisher: { "@type": "Organization", name: BRAND, url: siteUrl.replace(/\/+$/, "") },
  };
}

/** Strapi-Abfrage der Stories, fuer Seite, Sitemaps und Bild-Skript. */
export const STORIES_QUERY = {
  fields: ["title", "subtitle", "internalLabel", "createdAt", "publishedAt"],
  populate: { video: { fields: ["url", "mime"] } },
  pagination: { pageSize: 200 },
} as const;

const THUMBS = new Set<string>(thumbSlugs as string[]);

/** Gibt es public/videos/thumbs/<slug>.jpg? (Liste aus scripts/video-thumbs.mjs) */
export const hasStoryThumb = (slug: string) => THUMBS.has(slug);
