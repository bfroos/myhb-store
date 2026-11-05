/**
 * E24 On-Page-Audit (05.11.2026): Titel und Bild-Alt-Texte.
 *
 * Titel: 320 von 782 Seiten hatten mit "| MY HEALTH & BEAUTY" mehr als 65
 * Zeichen; Google schneidet dann mitten im Titel ab. Der Markenzusatz faellt
 * weg, wenn er nicht mehr passt (die Marke zeigt Google ueber den Site-Namen).
 *
 * Alt-Text: Auf 283 Seiten hatten Bilder alt="" (in Strapi kein
 * alternativeText gepflegt). Fallback ist der Dateiname ohne Hash und Endung.
 */
export const MAX_TITLE_LENGTH = 65;

export function composeTitle(metaTitle: string, separator: string, suffix: string, max = MAX_TITLE_LENGTH): string {
  const base = metaTitle.trim();
  if (!suffix || base.includes(suffix)) return base;
  const full = [base, separator, suffix].filter(Boolean).join(" ");
  return full.length > max && base.length > 0 ? base : full;
}

/** Lesbarer Alt-Text aus einem Mediennamen, "" wenn nichts Sinnvolles bleibt. */
export function altFromFileName(name: string | null | undefined): string {
  let s = String(name ?? "").split("/").pop() ?? "";
  s = s.replace(/\.[a-z0-9]{2,5}$/i, "").replace(/_[0-9a-f]{8,12}$/i, "");
  s = s.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!s || /^(img|dsc|bildschirmfoto|screenshot|image|foto|photo|pxl|whatsapp)\b/i.test(s) || /^[\d\s]+$/.test(s)) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
