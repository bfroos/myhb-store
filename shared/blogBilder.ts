/**
 * Bilder im Text der Ratgeber-Artikel (myhb-os#418, Benjamin 06.11.2026:
 * "zu textlastig"). Ausgewaehlt aus der Strapi-Medienbibliothek, nur Fotos ohne
 * eingebrannten Text, ohne Vorher-Nachher. Je Artikel bis zu zwei Bilder;
 * BlogArticleBlock setzt sie nach dem ersten Abschnitt und bei drei Vierteln.
 */
import bilder from "./blogBilder.json" with { type: "json" };

export type BlogBild = { id: number; url: string; mime: string; width: number; height: number; alt: string };

const BILDER = bilder as Record<string, BlogBild[]>;

export function blogBilder(slug: string | null | undefined): BlogBild[] {
  return BILDER[String(slug ?? "")] ?? [];
}
