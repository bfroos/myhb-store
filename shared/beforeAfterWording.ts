/**
 * Kein "Vorher-Nachher" bei Unterspritzungen (bfroos/myhb-store#307, E24).
 *
 * Werbung mit Vorher-Nachher-Darstellungen ist bei aesthetischen
 * Unterspritzungen unzulaessig (BGH, Urteil vom 31.07.2025 - I ZR 170/24),
 * nach unserer Rechtsnotiz auch als reine Textgegenueberstellung. In Strapi
 * stehen solche Formulierungen auf rund 25 Behandlungsseiten (88 Stellen,
 * Stand 12.10.2026). Statt sie einzeln in Strapi zu veroeffentlichen (das
 * nimmt fremde Entwuerfe mit), werden sie hier beim Ausliefern entschaerft -
 * wie die Markenname-Ersetzung fuer go. (shared/adsTerms.ts):
 *   "Vorher-Nachher-Ergebnisse" -> "Ergebnisse"
 *   "Im Vorher-Nachher-Vergleich wirkt ..." -> "Im Ergebnis wirkt ..."
 *   "Lippen aufspritzen Vorher-Nachher – Welche Ergebnisse ..." ->
 *   "Lippen aufspritzen – Welche Ergebnisse ..."
 * URLs, Slugs und Pfade bleiben unberuehrt (Links auf Ratgeber gehen weiter).
 * Schoenheits-OPs sind ausgenommen (Benjamin: OPs vorerst nicht anfassen).
 */

const VN = "vorher\\s*[-–]?\\s*(?:und\\s+)?nachher";

const RULES: ReadonlyArray<readonly [RegExp, string]> = [
  // "Sofort sichtbare Ergebnisse & Vorher-Nachher-Bilder" -> Zusatz weg
  [new RegExp(`\\s*(?:&|und)\\s*${VN}[-–\\s]*(?:bilder|fotos)n?`, "gi"), ""],
  // "✅ Vorher-Nachher, Haltbarkeit" -> "✅ Haltbarkeit"
  [new RegExp(`${VN}\\s*,\\s*`, "gi"), ""],
  // "Vorher-Nachher bei Masseter Botox® – ..." -> "Masseter Botox® – ..."
  [new RegExp(`^${VN}\\s+bei\\s+`, "i"), ""],
  // Zusammensetzungen: "Vorher-Nachher-Vergleich" -> "Ergebnis"
  [new RegExp(`${VN}[-–\\s]*vergleichs?`, "gi"), "Ergebnis"],
  [new RegExp(`${VN}[-–\\s]*bilder(n)?`, "gi"), "Ergebnisse"],
  [new RegExp(`${VN}[-–\\s]*fotos?`, "gi"), "Ergebnisse"],
  [new RegExp(`${VN}[-–\\s]*simulation(en)?`, "gi"), "Simulation$1"],
  // "Vorher-Nachher-Ergebnisse", "Vorher Nachher Effekt", "-Unterschied"
  [new RegExp(`${VN}[-–\\s]*(?=(?:ergebnis|effekt|unterschied|wirkung|veränderung))`, "gi"), ""],
  // Allein stehend ("Botox Lachfalten vorher-nachher", Ueberschriften)
  [new RegExp(`\\s*${VN}\\b`, "gi"), ""],
];

function fixCase(text: string): string {
  // "die Ergebnisse" bleibt; ein durch das Entfernen kleingeschriebener
  // Satzanfang ("ergebnisse ...") wird wieder gross.
  return text
    .replace(/(^|[.!?]\s+)(ergebnis|effekt|unterschied|wirkung|veränderung)/g, (_m, a: string, w: string) => `${a}${w[0]!.toUpperCase()}${w.slice(1)}`)
    .replace(/\b(ergebnis(?:se|sen)?|effekte?|unterschied|wirkung|veränderung)\b/g, (w) => `${w[0]!.toUpperCase()}${w.slice(1)}`)
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +([?.,!:;)])/g, "$1")
    // Alt-Texte wie "kosten & vorhernachher" -> "kosten"
    .replace(/\s+(?:&|und)\s*$/, "");
}

export function hasBeforeAfter(text: string | null | undefined): boolean {
  return new RegExp(VN, "i").test(String(text ?? ""));
}

/** Einen Text entschaerfen (nur, wenn er "vorher ... nachher" enthaelt). */
export function rewriteBeforeAfter(text: string): string {
  if (!hasBeforeAfter(text)) return text;
  // Leerzeichen am Rand gehoeren zum Fliesstext neben Links - erhalten.
  const lead = /^\s*/.exec(text)![0];
  const trail = /\s*$/.exec(text)![0];
  let out = text.trim();
  for (const [re, by] of RULES) out = out.replace(re, by);
  return `${lead}${fixCase(out).trim()}${trail}`;
}

const SKIP_KEYS = new Set(["url", "href", "slug", "pathKey", "path", "link", "src", "mime", "hash", "ext", "provider"]);

function isSurgery(x: any): boolean {
  return typeof x?.pathKey === "string" && x.pathKey.startsWith("schoenheitsoperationen");
}

/** Strapi-Antwort durchgehen (ohne OP-Seiten, ohne URLs). */
export function rewriteBeforeAfterDeep<T>(input: T): T {
  const walk = (x: any, key?: string): any => {
    if (typeof x === "string") {
      if (key && SKIP_KEYS.has(key)) return x;
      if (/^(?:https?:)?\/\//.test(x) || x.startsWith("/")) return x;
      return rewriteBeforeAfter(x);
    }
    if (Array.isArray(x)) return x.map((v) => walk(v));
    if (x && typeof x === "object") {
      if (isSurgery(x)) return x;
      const out: Record<string, any> = {};
      for (const [k, v] of Object.entries(x)) out[k] = walk(v, k);
      return out;
    }
    return x;
  };
  return walk(input);
}

/** Welche Strapi-Pfade betroffen sind: Behandlungs-, Standort-, freie Seiten. Kein Blog. */
export function rewritesBeforeAfterFor(strapiPath: string): boolean {
  return !/^\/(?:blog[a-z-]*|authors)(?:\/|$)/.test(strapiPath);
}
