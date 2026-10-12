/**
 * E24 SEO-Pilot (shared/seoPilotLippen.ts): kleine Rechenhilfen fuer
 * Hub und Stadtseiten.
 */

export type LipPrice = { label: string; value: string; cent: number };

function euro(cent: number): string {
  return `${(cent / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

/**
 * Preise je Menge aus den Strapi-Varianten der Behandlung (0,5 ml / 1 ml),
 * regulaer, ohne Neukundenrabatt (www, Benjamin 12.10.2026). Ohne Varianten:
 * Grundpreis "ab".
 */
export function lipPrices(treatment: any): LipPrice[] {
  const variants = (treatment?.products ?? []).flatMap((p: any) => p?.variants ?? []);
  const out: LipPrice[] = [];
  const seen = new Set<string>();
  for (const v of variants) {
    const m = /^(\d+)(?:-(\d+))?-ml$/.exec(String(v?.slug ?? ""));
    if (!m || v.isActive === false || !v.priceInEuroCent) continue;
    const label = m[2] && m[2] !== "0" ? `${m[1]},${m[2]} ml` : `${m[1]} ml`;
    if (seen.has(label)) continue;
    seen.add(label);
    out.push({ label, value: euro(v.priceInEuroCent), cent: v.priceInEuroCent });
  }
  out.sort((a, b) => a.cent - b.cent);
  if (!out.length && treatment?.priceInEuroCent) {
    out.push({ label: "Behandlung", value: `ab ${euro(treatment.priceInEuroCent)}`, cent: treatment.priceInEuroCent });
  }
  return out;
}

/** Preis "ab 149,99 €" einer Behandlung (Strapi), sonst null. */
export function startingPrice(treatment: any): string | null {
  const cent = treatment?.priceInEuroCent;
  if (!cent) return null;
  return `${treatment?.isStartingPrice ? "ab " : ""}${euro(cent)}`;
}

type Week = Array<{ day?: string | null; closed?: boolean | null; intervals?: Array<{ opens?: string | null; closes?: string | null }> | null }>;

/** "Jetzt geöffnet bis 21 Uhr" / "Heute geschlossen" / "Öffnet um 10 Uhr" (Berliner Zeit). */
export function openStatus(week: Week | null | undefined, now: Date): { open: boolean; text: string } | null {
  if (!week?.length) return null;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value.toLowerCase() ?? "";
  const hh = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24;
  const mm = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const minutes = hh * 60 + mm;
  const today = week.find((d) => d.day === weekday);
  const toMin = (v?: string | null) => {
    const m = /^(\d{1,2}):(\d{2})/.exec(v ?? "");
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  };
  const fmt = (v?: string | null) => {
    const m = /^(\d{1,2}):(\d{2})/.exec(v ?? "");
    if (!m) return "";
    return m[2] === "00" ? `${Number(m[1])} Uhr` : `${Number(m[1])}:${m[2]} Uhr`;
  };
  if (!today || today.closed || !today.intervals?.length) {
    return { open: false, text: "Heute geschlossen" };
  }
  for (const iv of today.intervals) {
    const o = toMin(iv.opens);
    const c = toMin(iv.closes);
    if (o == null || c == null) continue;
    if (minutes < o) return { open: false, text: `Öffnet heute um ${fmt(iv.opens)}` };
    if (minutes < c) return { open: true, text: `Jetzt geöffnet bis ${fmt(iv.closes)}` };
  }
  return { open: false, text: "Heute schon geschlossen" };
}
