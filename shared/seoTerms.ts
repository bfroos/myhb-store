/**
 * E24: auf www heisst es "Botox", nicht "BTX" (Benjamin, 06.11.2026).
 *
 * Viele Strapi-Texte (FAQ, Story-Titel, Vergleiche) schreiben "BTX", weil
 * dieselben Inhalte auch auf go. laufen. Fuer die Suche zaehlt auf www das
 * Wort, das die Leute eintippen. Ersetzt wird nur das grossgeschriebene
 * Kuerzel als eigenes Wort; Adressen, Dateinamen und Kennungen bleiben.
 * go. bekommt das nie: dort ersetzt shared/adsTerms.ts "Botox" durch
 * "Muskelrelaxans" (Google Ads).
 */
const BTX = /\bBTX\b/g;

export function btxToBotox(text: string): string {
  return text.includes("BTX") ? text.replace(BTX, "Botox") : text;
}

const SKIP_KEYS = new Set(["url", "href", "slug", "pathKey", "path", "link", "src", "mime", "hash", "ext", "provider", "name", "documentId"]);

export function btxToBotoxDeep<T>(input: T): T {
  // Ein Promise wuerde sonst zu {} (06.11.: alle Seiten 404 im lokalen Build).
  if (input && typeof (input as any).then === "function") {
    return (input as any).then((v: unknown) => btxToBotoxDeep(v)) as T;
  }
  const walk = (x: any, key?: string): any => {
    if (typeof x === "string") {
      if (key && SKIP_KEYS.has(key)) return x;
      if (/^(?:https?:)?\/\//.test(x) || x.startsWith("/")) return x;
      return btxToBotox(x);
    }
    if (Array.isArray(x)) return x.map((v) => walk(v));
    if (x && typeof x === "object") {
      const out: Record<string, any> = {};
      for (const [k, v] of Object.entries(x)) out[k] = walk(v, k);
      return out;
    }
    return x;
  };
  return walk(input);
}
