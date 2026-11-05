/**
 * E24: sprachliche Korrekturen fuer Strapi-Ueberschriften und -Fragen der
 * Seiten "Behandlung je Standort" (Benjamin, 05.11.2026: "ueberall richtiges
 * Deutsch"). Viele Vorlagen haengen Behandlung und Stadt einfach an ("Alle
 * Details zur Lip Flip Botox Köln"). Die Paare alt -> richtig liegen je Seite
 * in server/assets/headline-fixes.json (sprachlich geprueft 05.11.2026) und
 * kommen ueber /api/seo-headline-fixes. Ersetzt wird nur bei exakt gleichem
 * Text (nach Platzhaltern, ohne Rand-Leerzeichen), Strapi bleibt unveraendert.
 * Dauerhaft gehoert die Korrektur nach Strapi.
 */
export type HeadlineFixes = Record<string, string>;

/** Ersetzt in einem Block-Baum jeden String, der exakt einer Korrektur entspricht. */
export function applyHeadlineFixes<T>(value: T, fixes: HeadlineFixes | null | undefined): T {
  if (!fixes || !Object.keys(fixes).length) return value;
  const walk = (v: any): any => {
    if (typeof v === "string") return fixes[v.trim()] ?? v;
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      const out: Record<string, any> = {};
      for (const [k, x] of Object.entries(v)) out[k] = walk(x);
      return out;
    }
    return v;
  };
  return walk(value);
}
