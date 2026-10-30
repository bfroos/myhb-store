/**
 * Block „Kostenlose Hautanalyse“ auf Behandlungsseiten und Link auf der
 * Startseite (myhb-app/myhb-os#1445, Benjamin 29.10.2026).
 *
 * Welche Seiten den Block bekommen, kommt aus den Empfehlungsregeln der App
 * (myhb-os `src/lib/hautanalyse/ctaSeiten.json`), nicht von Hand: nur Themen,
 * die die Analyse wirklich misst. Kein Block fuer Mundpartie, Marionettenfalten,
 * Straffheit oder Doppelkinn. Aktualisieren: `node scripts/sync-hautanalyse-cta-seiten.mjs`.
 *
 * Die Analyse laeuft in der App und nur angemeldet (erst registrieren, dann
 * analysieren; myhb-os#1148 bleibt geparkt). Der Link fuehrt deshalb dorthin,
 * nicht auf den Store-Prototyp unter /hautanalyse.
 */
import seiten from "./hautanalyseCtaSeiten.json" with { type: "json" };

export const HAUTANALYSE_APP_URL = "https://app.myhealthandbeauty.com/hautanalyse";

const SLUGS: ReadonlySet<string> = new Set((seiten as { slug: string }[]).map((s) => s.slug));

/** Slug der Seite aus dem pathKey (`botox/stirnfalte` -> `stirnfalte`). */
export function seitenSlug(pathKey?: string | null): string | null {
  const teile = String(pathKey ?? "").split("/").filter(Boolean);
  return teile.at(-1) ?? null;
}

/** Bekommt die Behandlungsseite den Hautanalyse-Block? */
export function hatHautanalyseBlock(pathKey?: string | null): boolean {
  const slug = seitenSlug(pathKey);
  return slug != null && SLUGS.has(slug);
}

/**
 * Deeplink in die Analyse der App. Eigene Quelle je Einstieg, damit myhb-os#254
 * die Starts je Seite zeigt: `utm_content` ist der Seiten-Slug bzw. `startseite`.
 */
export function hautanalyseDeeplink(
  content: string,
  medium: "behandlungsseite" | "startseite" = "behandlungsseite",
): string {
  const url = new URL(HAUTANALYSE_APP_URL);
  url.searchParams.set("utm_source", "website");
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", "hautanalyse");
  url.searchParams.set("utm_content", content);
  return url.toString();
}
