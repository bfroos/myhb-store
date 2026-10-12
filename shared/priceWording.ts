/**
 * E24 #313: einheitliche Preisschreibweise auf www ("ab 149,99 €").
 *
 * In Strapi stehen dieselben Preise in drei Schreibweisen ("ab 149 €",
 * "ab 149,99€", "ab 149,99 €"), teils auf derselben Seite. KI-Systeme lesen
 * daraus widerspruechliche Preise. Beim Ausliefern:
 *   "149,99€" -> "149,99 €" (geschuetztes Leerzeichen)
 *   "ab 149€" / "ab 149 €" -> "ab 149,99 €" (alle unsere Preise enden auf
 *   ,99; nur mit "ab" davor, damit fremde Zahlen und Spannen unberuehrt
 *   bleiben)
 * Nur Behandlungs-, Standort- und freie Seiten (nicht Ratgeber), ohne
 * Schoenheits-OPs, ohne URLs.
 */
const EURO_NBSP = " €";

export function normalizePriceWording(text: string): string {
  if (!/€/.test(text)) return text;
  return text
    .replace(/\bab\s+(\d{2,3}9)\s?€/g, `ab $1,99${EURO_NBSP}`)
    .replace(/(\d{1,3}(?:\.\d{3})*,\d{2})[  ]?€/g, `$1${EURO_NBSP}`);
}

const SKIP_KEYS = new Set(["url", "href", "slug", "pathKey", "path", "link", "src", "mime", "hash", "ext", "provider"]);

export function normalizePriceWordingDeep<T>(input: T): T {
  const walk = (x: any, key?: string): any => {
    if (typeof x === "string") {
      if (key && SKIP_KEYS.has(key)) return x;
      if (/^(?:https?:)?\/\//.test(x) || x.startsWith("/")) return x;
      return normalizePriceWording(x);
    }
    if (Array.isArray(x)) return x.map((v) => walk(v));
    if (x && typeof x === "object") {
      if (typeof x.pathKey === "string" && x.pathKey.startsWith("schoenheitsoperationen")) return x;
      const out: Record<string, any> = {};
      for (const [k, v] of Object.entries(x)) out[k] = walk(v, k);
      return out;
    }
    return x;
  };
  return walk(input);
}
