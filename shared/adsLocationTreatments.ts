/**
 * go.* (Ads-Modus): Behandlungen eines Standorts im Ads-Baum.
 *
 * Strapi nennt die Behandlungen eines Standorts nur im SEO-Baum
 * (`/locations/<stadt>/<standort>/with-treatments`, pathKeys "botox/..."). Der
 * Ads-Endpunkt liefert keine. Auf go. gibt es dieselben Seiten unter anderen
 * pathKeys ("muskelrelaxans/...", teils nur als "-rabatt"-Variante). Hier wird
 * die SEO-Liste auf Seiten abgebildet, die es im Ads-Baum wirklich gibt -
 * damit Kacheln und Menue der Standortseite nur go.-Seiten verlinken, die
 * laden (Inhaber, 30.09.2026: "Beides zurueck, nur go.-intern").
 *
 * Schoenheits-OPs bleiben draussen (Inhaber: wir machen keine OPs).
 */

export type AdsTreePage = {
  pathKey?: string | null;
  name?: string | null;
  slug?: string | null;
  ancestorSlugs?: string[] | null;
  [key: string]: any;
};

const SURGERY = /^schoenheitsoperationen(?:\/|$)/;

/** Markenname in Datei- oder Seitennamen (Bild-URLs, Slugs). */
const RESTRICTED_NAME = /botox|botulinum|btx/i;

/** Markenname in Kundentexten. */
const RESTRICTED_TEXT = /botox|botulinum|\bbtx\b/i;

export function isAdsSurgeryPathKey(pathKey: unknown): boolean {
  return typeof pathKey === "string" && SURGERY.test(pathKey);
}

/**
 * Ads-pathKey zu einem SEO-pathKey, oder `null`, wenn der Ads-Baum die Seite
 * nicht hat. "botox" heisst dort "muskelrelaxans" (auch im Slug:
 * baby-botox -> baby-muskelrelaxans). Fehlt die Grundseite, zaehlt die
 * "-rabatt"-Variante (z. B. muskelrelaxans/lachfalten-rabatt).
 */
export function adsPathKeyForSeo(
  seoPathKey: string | null | undefined,
  adsPathKeys: ReadonlySet<string>,
): string | null {
  if (!seoPathKey) return null;
  const mapped = seoPathKey.replace(/botox/gi, "muskelrelaxans");
  if (isAdsSurgeryPathKey(mapped)) return null;
  if (adsPathKeys.has(mapped)) return mapped;
  if (adsPathKeys.has(`${mapped}-rabatt`)) return `${mapped}-rabatt`;
  return null;
}

function mediaHasRestrictedName(media: any): boolean {
  if (!media || typeof media !== "object") return false;
  return [media.url, media.name, media.hash].some(
    (v) => typeof v === "string" && RESTRICTED_NAME.test(v),
  );
}

/** Bild der Kachel ohne Markennamen in Datei-URL/-Name, sonst keins. */
export function adsSafeTeaserImage(page: AdsTreePage): any {
  const candidates = [page?.teaser?.image, page?.hero?.cover];
  return candidates.find((m) => m && !mediaHasRestrictedName(m)) ?? null;
}

/**
 * Ads-Seiten des Standorts in der Reihenfolge der SEO-Liste, ohne Dubletten
 * und OPs. Jede Seite traegt `topCategory` (Wurzel im Ads-Baum) fuer die
 * Filterchips und ein Kachelbild ohne Markennamen.
 */
export function buildAdsLocationTreatmentPages(
  seoPages: Array<{ pathKey?: string | null }>,
  adsPages: AdsTreePage[],
): AdsTreePage[] {
  const byKey = new Map<string, AdsTreePage>();
  for (const page of adsPages) {
    if (page?.pathKey) byKey.set(page.pathKey, page);
  }
  const keys = new Set(byKey.keys());
  const seen = new Set<string>();
  const out: AdsTreePage[] = [];
  for (const seo of seoPages) {
    const key = adsPathKeyForSeo(seo?.pathKey, keys);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const page = byKey.get(key)!;
    const rootSlug = key.split("/")[0]!;
    const root = byKey.get(rootSlug);
    const image = adsSafeTeaserImage(page);
    out.push({
      ...page,
      topCategory: { slug: rootSlug, name: root?.name ?? page.name ?? rootSlug },
      teaser: { ...(page.teaser ?? {}), image },
      hero: page.hero ? { ...page.hero, cover: image } : page.hero,
    });
  }
  return out;
}

/**
 * pathKeys, unter denen der Standort auf go. eine Seite hat: die gewaehlten
 * Ads-Seiten, bei "-rabatt"-Seiten auch die Grundadresse (die Standortseite
 * faellt dort auf "-rabatt" zurueck), und Kategorie-Wurzeln mit mindestens
 * einer Seite am Standort.
 */
export function adsLocationPathKeys(pages: AdsTreePage[]): string[] {
  const out = new Set<string>();
  for (const page of pages) {
    const key = page?.pathKey;
    if (!key) continue;
    out.add(key);
    if (key.endsWith("-rabatt")) out.add(key.slice(0, -"-rabatt".length));
    out.add(key.split("/")[0]!);
  }
  return [...out];
}

/**
 * Bewertungen ohne Markennamen. Kundenzitate werden nicht umgeschrieben -
 * wer "Botox" schreibt, wird auf go. nicht gezeigt.
 */
export function reviewsWithoutRestrictedTerms<T extends { text?: unknown; author?: unknown }>(
  reviews: T[] | null | undefined,
): T[] {
  return (reviews ?? []).filter(
    (r) =>
      !(typeof r?.text === "string" && RESTRICTED_TEXT.test(r.text)) &&
      !(typeof r?.author === "string" && RESTRICTED_TEXT.test(r.author)),
  );
}
