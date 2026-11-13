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
  medium: "behandlungsseite" | "startseite" | "ratgeber" = "behandlungsseite",
): string {
  const url = new URL(HAUTANALYSE_APP_URL);
  url.searchParams.set("utm_source", "website");
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", "hautanalyse");
  url.searchParams.set("utm_content", content);
  return url.toString();
}

/**
 * myhb-os#643: Der alte Store-Prototyp unter /hautanalyse hatte eine eigene
 * Empfehlungslogik neben der geprueften in der App. Nichts verlinkt ihn mehr
 * (alle Knoepfe fuehren in die App), er war aber noch erreichbar. Wer ihn
 * aufruft (alte Lesezeichen, Anzeigen), landet jetzt in der Analyse der App.
 * Vorhandene utm-Werte bleiben erhalten, sonst wird die Herkunft gesetzt.
 */
export function hautanalysePrototypZiel(pathname: string, search = ""): string | null {
  const pfad = pathname.replace(/\/+$/, "").toLowerCase();
  if (!/^(\/[a-z]{2})?\/hautanalyse$/.test(pfad)) return null;
  const url = new URL(HAUTANALYSE_APP_URL);
  new URLSearchParams(search).forEach((wert, name) => url.searchParams.set(name, wert));
  if (!url.searchParams.has("utm_source")) {
    url.searchParams.set("utm_source", "website");
    url.searchParams.set("utm_medium", "prototyp");
    url.searchParams.set("utm_campaign", "hautanalyse");
  }
  return url.toString();
}
