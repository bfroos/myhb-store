/**
 * E24 #318: /llms.txt aus Strapi statt fester Text.
 *
 * Vorher statisch: nannte "Essen" (gibt es nicht), liess fuenf Staedte weg,
 * keine Preise je Behandlung, keine Oeffnungszeiten, kein Buchungslink.
 * Jetzt: alle eroeffneten Standorte mit Adresse, Telefon, Oeffnungszeiten
 * und Online-Termin, Behandlungen mit Preis aus Strapi, Kostenseiten,
 * aerztliche Pruefung. Ohne Markennamen des Muskelrelaxans als Werbebegriff
 * (#309 offen), Schoenheits-OPs nur als Verweis ohne Preise.
 */
import { openingHoursSummary } from "./adsTemplateV2.ts";
import { RATGEBER, ratgeberPfad } from "./partnerRatgeber.ts";

type Loc = {
  name?: string;
  slug?: string;
  type?: string | null;
  newOpeningDate?: string | null;
  appBookingUrl?: string | null;
  city?: { name?: string; slug?: string } | null;
  address?: { street?: string; houseNumber?: string; postalCode?: string; city?: string } | null;
  contact?: { phoneNumber?: string | null } | null;
  openingHours?: { week?: any[] } | null;
};

type Cat = {
  slug?: string;
  treatments?: Array<{ name?: string; priceInEuroCent?: number | null; isStartingPrice?: boolean | null; treatmentPage?: { pathKey?: string | null } | null }>;
};

const CATEGORY_TITLE: Record<string, string> = {
  botox: "Faltenbehandlung mit Muskelrelaxans (Botulinumtoxin)",
  "hyaluron-und-filler": "Hyaluron",
  skinbooster: "Skinbooster",
  infusionen: "Infusionen",
  "anti-haarausfall": "Haarausfall",
  "fett-weg-spritze": "Fettwegspritze",
};

function euro(cent: number): string {
  return `${(cent / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

function phone(p: string | null | undefined): string {
  const raw = String(p ?? "").replace(/\//g, " ").replace(/\s+/g, " ").trim();
  if (!raw) return "";
  if (!raw.startsWith("0")) return raw;
  // "030 98 60 73 80" -> "+49 30 98607380" (Vorwahl, dann Rufnummer)
  const [area, ...rest] = raw.slice(1).split(" ");
  return `+49 ${area} ${rest.join("")}`.trim();
}

export function isOpenLocation(l: Loc, now = new Date()): boolean {
  if (!l.newOpeningDate) return false;
  return new Date(`${l.newOpeningDate}T00:00:00Z`).getTime() <= now.getTime();
}

export function buildLlmsText(siteUrl: string, locations: Loc[], categories: Cat[], now = new Date()): string {
  const open = locations
    .filter((l) => isOpenLocation(l, now) && l.city?.slug && l.slug)
    .sort((a, b) => String(a.city?.name).localeCompare(String(b.city?.name), "de"));
  const lounges = open.filter((l) => l.type !== "clinic");
  const cities = [...new Set(lounges.map((l) => l.city!.name!))];
  const lines: string[] = [];
  lines.push("# MY HEALTH & BEAUTY", "");
  lines.push(
    `> Ärztlich geführte Lounges für ästhetische Medizin in ${cities.length} Städten in Deutschland (${cities.join(", ")}), meist in Einkaufszentren. Es behandeln ausschließlich Ärzte; medizinisch verantwortlich ist Chefarzt Dr. Gero Ruppert. Termine online, nach Verfügbarkeit auch ohne Termin. Die Preise sind an allen Standorten gleich.`,
    "",
  );
  lines.push("## Standorte", "");
  for (const l of open) {
    const a = l.address;
    const addr = a ? `${[a.street, a.houseNumber].filter(Boolean).join(" ")}, ${[a.postalCode, a.city].filter(Boolean).join(" ")}` : "";
    const hours = openingHoursSummary(l.openingHours?.week as any);
    const parts = [addr, phone(l.contact?.phoneNumber) && `Tel. ${phone(l.contact?.phoneNumber)}`, hours, l.appBookingUrl && `Online-Termin: ${l.appBookingUrl}`].filter(Boolean);
    lines.push(`- [${l.city!.name} – ${l.name}](${siteUrl}/standorte/${l.city!.slug}/${l.slug}): ${parts.join(" · ")}`);
  }
  lines.push("");
  lines.push("## Behandlungen und Preise", "");
  for (const c of categories) {
    const title = CATEGORY_TITLE[String(c.slug)];
    if (!title) continue;
    const rows = (c.treatments ?? []).filter((t) => t.priceInEuroCent && t.treatmentPage?.pathKey);
    if (!rows.length) continue;
    lines.push(`### ${title}`);
    for (const t of rows.sort((x, y) => (x.priceInEuroCent ?? 0) - (y.priceInEuroCent ?? 0))) {
      const name = String(t.name ?? "").replace(/\s*Botox®?\s*/gi, " ").replace(/\s+/g, " ").trim();
      lines.push(`- [${name}](${siteUrl}/behandlungen/${t.treatmentPage!.pathKey}): ${t.isStartingPrice === false ? "" : "ab "}${euro(t.priceInEuroCent!)}`);
    }
    lines.push("");
  }
  lines.push("## Kosten", "");
  lines.push(`- [Faltenbehandlung: Preise pro Zone](${siteUrl}/p/botox-kosten)`);
  lines.push(`- [Lippen aufspritzen: Kosten](${siteUrl}/behandlungen/hyaluron/lippen-aufspritzen#kosten)`);
  lines.push(`- [Hyaluron: Kosten je Bereich](${siteUrl}/p/hyaluron-spritzen-kosten)`);
  lines.push(`- [Skinbooster: Kosten pro Sitzung](${siteUrl}/p/skinbooster-preise)`);
  lines.push(`- [Alle Preise](${siteUrl}/preise)`);
  lines.push("");
  lines.push("## Weitere Seiten", "");
  lines.push(`- [Unsere Ärzte](${siteUrl}/aerzte)`);
  lines.push(`- [Ratgeber](${siteUrl}/blog): ärztlich geprüfte Artikel zu Behandlungen, Kosten und Nachsorge`);
  lines.push(`- [Schönheitsoperationen](${siteUrl}/behandlungen/schoenheitsoperationen): in der MY Privatklinik Köln`);
  lines.push("");
  lines.push("## Für Ärzte", "");
  lines.push(`- [Partnerprogramm: eigene Praxis für ästhetische Medizin gründen](${siteUrl}/partnerpraxis): Ärzte, die sich in der Ästhetik selbstständig machen wollen, eröffnen ihre Praxis unter der Marke MY HEALTH & BEAUTY. Marke, Standortseite, Software (Buchung, Kunden-App, KI-Telefon, Warenwirtschaft) und Einkauf kommen von MYHB; Marketing, Social Media, Recruiting, Lohnabrechnung, vorbereitende Buchhaltung und Standortsuche sind buchbar. Wer noch wenig Erfahrung hat, kann vorher an MYHB-Standorten alle Behandlungsarten lernen (freiwillig); fachlich geprüft wird jeder Partner. Medizinisch bleibt der Arzt unabhängig. Bewerbung über das Formular auf der Seite.`);
  for (const r of RATGEBER) {
    // llms.txt nennt keine Marke "Botox" (llmsAi.test), daher der Wirkstoff.
    const titel = r.h1.replace(/Botox/g, "Botulinumtoxin");
    const kurz = r.kurzGesagt.replace(/Botox/g, "Botulinumtoxin");
    lines.push(`- [${titel}](${siteUrl}${ratgeberPfad(r.slug)}): ${kurz}`);
  }
  lines.push(`- [Karriere für Ärzte](${siteUrl}/karriere/aerzte): Anstellung in der Facharztweiterbildung`);
  lines.push("");
  return lines.join("\n");
}
