/**
 * Links von der Standortseite auf die Ärzteseiten (store#422, E24).
 *
 * Audit 05.11.2026: 44 Sitemap-Seiten bekamen höchstens einen internen Link,
 * vor allem die Ärzteseiten (/aerzte/…). Die Standortseite verlinkt deshalb
 * alle Ärzte, die diesem Standort zugeordnet und öffentlich sind. Auswahl wie
 * bei der go.-Vorlage (pickAdsV2Doctors: aktiv, nicht versteckt, mit Namen,
 * nur dieses Standorts), aber ohne Obergrenze und nur mit eigener Seite (slug).
 */
import { employeeDisplayName, pickAdsV2Doctors, type EmployeeLike } from "./adsTemplateV2.ts";

export interface StandortArztLink {
  name: string;
  slug: string;
}

type Mitarbeiter = EmployeeLike & { slug?: string | null };

export function standortAerzteLinks(
  mitarbeiter: Mitarbeiter[] | null | undefined,
  standortSlug: string | null | undefined,
): StandortArztLink[] {
  if (!standortSlug) return [];
  const gesehen = new Set<string>();
  return pickAdsV2Doctors(mitarbeiter ?? [], standortSlug, Number.POSITIVE_INFINITY)
    .map((e) => ({ name: employeeDisplayName(e), slug: String(e.slug ?? "").trim() }))
    .filter((d) => d.name && d.slug && !gesehen.has(d.slug) && gesehen.add(d.slug))
    .sort((a, b) => a.name.localeCompare(b.name, "de"));
}
