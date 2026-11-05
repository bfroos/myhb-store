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
 * Rankings nicht leiden. Seiten mit Ranking bekommen hier keinen Eintrag.
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
};

/** Notschalter: false = alle Seiten zeigen wieder nur den Strapi-Text. */
export const SEO_LOCAL_TEXTS_ENABLED = true;

/** So viele Strapi-Fragen bleiben neben den drei Standortfragen stehen. */
export const STRAPI_FAQS_KEPT = 3;

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

const rich = (paragraphs: string[]) =>
  paragraphs.map((text) => ({ type: "paragraph", children: [{ type: "text", text }] }));

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
  // Die Strapi-Fragen stehen gleich auf allen Standorten und auf dem Hub
  // (rund 1.300 Woerter). Hier nur die ersten drei, die uebrigen auf dem
  // Hub, der unten auf der Seite verlinkt ist.
  if (text.faqs?.length && out.faq) {
    const strapi = [
      ...(out.faq.faqs ?? []),
      ...(out.faq.faqSets ?? []).flatMap((set: any) => set?.faqs ?? []),
    ];
    out.faq = {
      ...out.faq,
      faqs: [
        ...text.faqs.map((f) => ({ question: f.question, answer: rich([f.answer]) })),
        ...strapi.slice(0, STRAPI_FAQS_KEPT),
      ],
      faqSets: [],
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
