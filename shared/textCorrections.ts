/**
 * E24: fachliche Korrekturen der Strapi-Texte je Seite (Benjamin, 06.11.2026:
 * "alle Vorschlaege korrigieren").
 *
 * Auf den Behandlungs- und Standortseiten standen fuer dieselbe Behandlung
 * verschiedene Werte (Botox haelt 3-4, 4-6 oder 3-6 Monate, Zornesfalte
 * 10-15 oder 20-30 Minuten ...), Preisantworten nannten die falsche
 * Behandlung ("Baby Botox" auf der Facelift-Seite) und Seiten anderer
 * Staedte "Koeln Arcaden". Viele Fehler stehen nur an einem Standort, ein
 * blindes Suchen-und-Ersetzen in Strapi haette die richtigen Seiten mit
 * getroffen. Darum gilt jedes Paar nur fuer seine Seite:
 *   scope "<stadt>/<standort>"  Standortseite /standorte/...
 *   scope "behandlungen"        /behandlungen/<pathKey> (by-path)
 *   scope "*"                   beide (gleicher falscher Text ueberall)
 * Paare mit `pfad` gelten nur an diesem Feld (der Text kommt auf der Seite
 * mehrfach vor). Liste: server/assets/text-corrections.json.
 */
export type TextCorrection = {
  pathKey: string;
  scope: string;
  find: string;
  replace: string;
  pfad?: string;
};

/** Seite aus dem Strapi-Pfad: Behandlung und Geltungsbereich. */
export function correctionTarget(strapiPath: string): { pathKey: string; scope: string } | null {
  const m = /^\/treatment-pages\/(.+?)\/?$/.exec(strapiPath);
  if (!m) return null;
  const parts = m[1].split("/");
  if (parts[0] === "by-path") return { pathKey: parts.slice(1).join("/"), scope: "behandlungen" };
  if (parts.length < 3) return null;
  return { pathKey: parts.slice(2).join("/"), scope: `${parts[0]}/${parts[1]}` };
}

export function correctionsFor(all: TextCorrection[], strapiPath: string): TextCorrection[] {
  const t = correctionTarget(strapiPath);
  if (!t) return [];
  return all.filter((c) => c.pathKey === t.pathKey && (c.scope === t.scope || c.scope === "*"));
}

function setAt(root: any, pfad: string, fn: (v: string) => string): boolean {
  const parts = pfad.match(/[^.[\]]+/g) ?? [];
  let o = root;
  for (const p of parts.slice(0, -1)) {
    o = o?.[/^\d+$/.test(p) ? Number(p) : p];
    if (o == null) return false;
  }
  const last = parts[parts.length - 1];
  if (typeof o?.[last] !== "string") return false;
  o[last] = fn(o[last]);
  return true;
}

/** Wendet die Paare auf die Antwort an (Kopie, Original bleibt). */
export function applyTextCorrections<T>(input: T, pairs: TextCorrection[]): T {
  if (!pairs.length || !input || typeof input !== "object") return input;
  const out: any = structuredClone(input);
  const data = out.data ?? out;
  const root = data?.treatmentPage ?? data;
  // Die Liste wurde gegen die ausgelieferte Seite erstellt, dort steht vor
  // dem Euro ein geschuetztes Leerzeichen (priceWording.ts), in Strapi steht
  // ein normales oder gar keins. Alle drei Schreibweisen zaehlen.
  const variants = (p: TextCorrection) =>
    p.find.includes("\u00a0")
      ? [p.find, p.find.replace(/\u00a0/g, " "), p.find.replace(/\u00a0€/g, "€")]
      : [p.find];
  const global = pairs.filter((p) => !p.pfad);
  for (const p of pairs) {
    if (p.pfad) setAt(root, p.pfad, (v) => variants(p).reduce((acc, f) => acc.split(f).join(p.replace), v));
  }
  if (!global.length) return out;
  const walk = (x: any): any => {
    if (typeof x === "string") {
      let s = x;
      for (const p of global) for (const f of variants(p)) if (s.includes(f)) s = s.split(f).join(p.replace);
      return s;
    }
    if (Array.isArray(x)) {
      for (let i = 0; i < x.length; i++) x[i] = walk(x[i]);
      return x;
    }
    if (x && typeof x === "object") {
      for (const k of Object.keys(x)) x[k] = walk(x[k]);
      return x;
    }
    return x;
  };
  return walk(out);
}
