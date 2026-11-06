/**
 * E24 #396: eigene Texte je Seite "Behandlung je Standort".
 *
 * Bis Februar 2026 (myhealthandbeauty.app) hatte jede Stadtseite ihren
 * eigenen Text, im Mittel 62 % eigene Wortfolgen. Seit dem Umzug zeigen
 * alle 9 Standorte den Strapi-Text der Behandlung, nur der Ort ist
 * getauscht (6-17 % eigener Text, gemessen 05.11.2026). Hier stehen je
 * Seite eigene Fassungen der Bloecke "Was ist das", "Vorteile", "Fuer wen",
 * "Ablauf" und drei Fragen zum Standort. Fachliche Quelle ist der Strapi-
 * Text, die alte Stadtseite nur Anregung fuer Aufbau und Blickwinkel.
 *
 * Benjamin, 05.11.2026: erst nur Seiten ohne Ranking, damit bestehende
 * Rankings nicht leiden. 06.11.2026: auch Seiten auf Platz 11 und
 * schlechter (SISTRIX, 05.11.); nur Seiten in den Top 10 bekommen hier
 * keinen Eintrag.
 *
 * Die Texte liegen in server/assets/seo-local-texts.json und kommen ueber
 * /api/seo-local-text auf die Seite (nicht ins Browser-Paket). Strapi und
 * der Hub der Behandlung bleiben unveraendert. Regeln wie in
 * shared/seoCityExtras.ts: du-Form, keine Heilversprechen, keine Preise,
 * keine Markennamen, nie "MYH&B".
 */

export type SeoLocalText = {
  /** "pathKey@stadt/standort" */
  key: string;
  about?: { headline: string; intro: string; paragraphs: string[] };
  benefits?: { headline: string; items: { heading: string; text: string }[] };
  suitableFor?: { heading: string; paragraphs: string[] };
  process?: { headline: string; intro: string; steps: { heading: string; text: string }[] };
  faqHeadline?: string;
  faqs?: { question: string; answer: string }[];
  /** Neu formulierte Strapi-Bloecke (05.11.2026, Benjamin: umschreiben statt loeschen). */
  toc?: { headline?: string; intro?: string; paragraphs: string[] };
  team?: { headline?: string; intro?: string; paragraphs: string[] };
  plan?: {
    headline?: string;
    paragraphs?: string[];
    additionalInfos?: string[];
    steps?: { description?: string; followUpPlanText?: string; endOfPlanText?: string }[];
  };
  /** Alle Strapi-Fragen neu formuliert, gleiche Anzahl und Reihenfolge. */
  strapiFaqs?: { question: string; answer: string }[];
};

/** Notschalter: false = alle Seiten zeigen wieder nur den Strapi-Text. */
export const SEO_LOCAL_TEXTS_ENABLED = true;

/** Woerter und Wendungen, die in keinem Text stehen duerfen. */
export const SEO_LOCAL_TEXT_FORBIDDEN =
  /MYH\s?&\s?B|\bMYHB\b|®|€|\beuro\b|rabatt|angebot|neukund|kostenlos|gratis|garantie|garantiert|\bheilt|perfekt|schmerzfrei|risikolos|ohne nebenwirkungen|vorher[- ]nachher|\bdr\.|vistabel|allergan|juv[eé]derm|teoxane|aliaxin|restylane|azzalure|bocouture|xeomin|dysport|original-botox|kundin|(?:ärzt|berater|patient|spezialist|expert)innen/i;

export function localTextKey(
  pathKey: string | null | undefined,
  citySlug: string | null | undefined,
  locationSlug: string | null | undefined,
): string {
  return `${String(pathKey ?? "").replace(/^\/+|\/+$/g, "")}@${citySlug}/${locationSlug}`;
}

const SITE = "https://www.myhealthandbeauty.com";
const LINK = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;

/** Text mit [Linktext](/pfad) als Strapi-Inline-Knoten. */
function inline(text: string) {
  const out: any[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK)) {
    if (m.index! > last) out.push({ type: "text", text: text.slice(last, m.index) });
    out.push({ type: "link", url: SITE + m[2], children: [{ type: "text", text: m[1] }] });
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push({ type: "text", text: text.slice(last) });
  return out.length ? out : [{ type: "text", text: "" }];
}

/** Absaetze als Strapi-Rich-Text; Zeilen mit "- " werden zur Liste. */
export function rich(paragraphs: string[]) {
  const blocks: any[] = [];
  let list: any[] | null = null;
  for (const line of paragraphs.flatMap((p) => p.split("\n")).map((l) => l.trim()).filter(Boolean)) {
    if (line.startsWith("- ")) {
      if (!list) blocks.push({ type: "list", format: "unordered", children: (list = []) });
      list.push({ type: "list-item", children: inline(line.slice(2)) });
    } else {
      list = null;
      blocks.push({ type: "paragraph", children: inline(line) });
    }
  }
  return blocks;
}

/** Ohne Link-Syntax, fuer Tests. */
const plain = (t: string | undefined) => (t ?? "").replace(LINK, "$1");

/** Gesamter eigener Text einer Seite (fuer Aehnlichkeits- und Regeltests). */
export function localTextOwn(t: SeoLocalText): string {
  return [
    t.about?.headline,
    t.about?.intro,
    ...(t.about?.paragraphs ?? []),
    t.benefits?.headline,
    ...(t.benefits?.items ?? []).flatMap((i) => [i.heading, i.text]),
    t.suitableFor?.heading,
    ...(t.suitableFor?.paragraphs ?? []),
    t.process?.headline,
    t.process?.intro,
    ...(t.process?.steps ?? []).flatMap((s) => [s.heading, s.text]),
    t.faqHeadline,
    ...(t.faqs ?? []).flatMap((f) => [f.question, f.answer]),
    t.toc?.headline,
    t.toc?.intro,
    ...(t.toc?.paragraphs ?? []).map(plain),
    t.team?.headline,
    t.team?.intro,
    ...(t.team?.paragraphs ?? []).map(plain),
    t.plan?.headline,
    ...(t.plan?.paragraphs ?? []).map(plain),
    ...(t.plan?.additionalInfos ?? []).map(plain),
    ...(t.plan?.steps ?? []).flatMap((s) => [s.description, s.followUpPlanText, s.endOfPlanText]),
    ...(t.strapiFaqs ?? []).flatMap((f) => [f.question, plain(f.answer)]),
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Ersetzt die Texte der festen Bloecke durch die eigene Fassung. Bilder,
 * Videos, Layout und "Nicht geeignet fuer" (medizinisch) bleiben aus
 * Strapi. Die drei Standortfragen kommen vor die Strapi-Fragen.
 */
export function applyLocalText<T extends Record<string, any> | null | undefined>(
  fixed: T,
  text: SeoLocalText | null | undefined,
): T {
  if (!fixed || !text || !SEO_LOCAL_TEXTS_ENABLED) return fixed;
  const out: Record<string, any> = { ...fixed };
  const toc: Record<string, string> = {};

  if (text.about && out.about) {
    out.about = {
      ...out.about,
      headline: text.about.headline,
      intro: text.about.intro,
      content: rich(text.about.paragraphs),
    };
    toc["how-it-works"] = text.about.headline;
  }
  if (text.benefits && out.benefits) {
    const media = out.benefits.items ?? [];
    out.benefits = {
      ...out.benefits,
      headline: text.benefits.headline,
      items: text.benefits.items.map((i, n) => ({
        ...(media[n] ?? {}),
        heading: i.heading,
        content: rich([i.text]),
      })),
    };
    toc.benefits = text.benefits.headline;
  }
  if (text.suitableFor && out.suitability?.firstItem) {
    out.suitability = {
      ...out.suitability,
      firstItem: { heading: text.suitableFor.heading, content: rich(text.suitableFor.paragraphs) },
    };
  }
  if (text.process && out.treatmentProcess) {
    const old = out.treatmentProcess.steps ?? [];
    out.treatmentProcess = {
      ...out.treatmentProcess,
      headline: text.process.headline,
      content: rich([text.process.intro]),
      steps: text.process.steps.map((s, n) => ({ ...(old[n] ?? {}), heading: s.heading, text: s.text })),
    };
    toc["treatment-process-steps"] = text.process.headline;
  }
  if (text.team && out.medicalTeamHighlight) {
    out.medicalTeamHighlight = {
      ...out.medicalTeamHighlight,
      headline: text.team.headline || out.medicalTeamHighlight.headline,
      intro: text.team.intro ?? out.medicalTeamHighlight.intro,
      content: rich(text.team.paragraphs),
    };
    if (text.team.headline) toc.employee = text.team.headline;
  }
  if (text.plan && out.treatmentPlan) {
    const old = out.treatmentPlan.steps ?? [];
    out.treatmentPlan = {
      ...out.treatmentPlan,
      headline: text.plan.headline || out.treatmentPlan.headline,
      content: text.plan.paragraphs?.length ? rich(text.plan.paragraphs) : out.treatmentPlan.content,
      additionalInfos: text.plan.additionalInfos?.length
        ? rich(text.plan.additionalInfos)
        : out.treatmentPlan.additionalInfos,
      steps: old.map((step: any, n: number) => ({ ...step, ...(text.plan!.steps?.[n] ?? {}) })),
    };
    if (text.plan.headline) toc["treatment-plan"] = text.plan.headline;
  }
  // Fragen: drei zum Standort, dann alle Strapi-Fragen - neu formuliert, wo
  // vorhanden, sonst im Strapi-Wortlaut.
  if (out.faq && (text.faqs?.length || text.strapiFaqs?.length)) {
    const strapi = text.strapiFaqs?.length
      ? text.strapiFaqs.map((f) => ({ question: f.question, answer: rich([f.answer]) }))
      : [...(out.faq.faqs ?? []), ...(out.faq.faqSets ?? []).flatMap((set: any) => set?.faqs ?? [])];
    out.faq = {
      ...out.faq,
      faqs: [...(text.faqs ?? []).map((f) => ({ question: f.question, answer: rich([f.answer]) })), ...strapi],
      faqSets: [],
    };
  }
  if (text.toc && out.tableOfContents) {
    out.tableOfContents = {
      ...out.tableOfContents,
      headline: text.toc.headline || out.tableOfContents.headline,
      intro: text.toc.intro ?? out.tableOfContents.intro,
      content: rich(text.toc.paragraphs),
    };
  }
  if (out.tableOfContents?.index) {
    out.tableOfContents = {
      ...out.tableOfContents,
      index: out.tableOfContents.index.map((e: { key: string; value: string }) =>
        toc[e.key] ? { ...e, value: toc[e.key] } : e,
      ),
    };
  }
  return out as T;
}
