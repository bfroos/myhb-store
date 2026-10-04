/**
 * Seitentest fuer Meta-Werbung auf www (Benjamin, 04.10.2026): Die Anzeigen
 * zeigen weiter auf die handgebauten Seiten; ein Teil der Besucher wird beim
 * Laden auf das Gegenstueck im v2-Design (app/pages/aktion) weitergeleitet.
 *
 * Warum ein Skript im <head> statt einer Server-Weiche: www kommt aus dem
 * ISR-Cache (nuxt.config routeRules "/**"), der Server sieht die meisten
 * Aufrufe gar nicht. Das Skript laeuft vor dem ersten Zeichnen, leitet mit
 * location.replace weiter (Zurueck fuehrt nicht in eine Schleife) und nimmt
 * Query (fbclid, utm_*) und Hash mit. Gespeichert wird nichts (keine
 * Einwilligung noetig) - wer spaeter wiederkommt, wird neu gelost.
 *
 * Markierung in der Adresse: `split=neu` (weitergeleitet) bzw. `split=alt`
 * (geblieben, per replaceState ergaenzt) - so trennt GA4 Testbesucher von
 * Aufrufen vor dem Start. Zum Pruefen von Hand: `?split=neu` erzwingt die
 * Weiterleitung, `?split=alt` das Bleiben.
 *
 * Auswertung: Landepfad (Calendly `lp:` in salesforce_uuid, GA4
 * page_location/template "v2-meta"), Rabatt-Anmeldungen und Buchungen je Arm.
 */
export const META_PAGE_SPLIT_ENABLED = true;

/** Anteil, der auf die neue Seite geht (Benjamin: 20 %). */
export const META_PAGE_SPLIT_SHARE = 0.2;

export const META_PAGE_SPLIT: Readonly<Record<string, string>> = {
  "/p/botox-meta-rabatt": "/aktion/botox",
  "/p/lippen-meta-rabatt": "/aktion/lippen",
};

export const META_SPLIT_PARAM = "split";

/** Ziel fuer einen Pfad der alten Seiten, sonst null. */
export function metaSplitTarget(pathname: string): string | null {
  const p = String(pathname ?? "").replace(/\/+$/, "").toLowerCase();
  return META_PAGE_SPLIT[p] ?? null;
}

/**
 * Entscheidung (ohne Browser testbar): "neu" = weiterleiten, "alt" = bleiben,
 * null = keine Testseite. `roll` ist Math.random().
 */
export function metaSplitDecision(
  pathname: string,
  search: string,
  roll: number,
  share: number = META_PAGE_SPLIT_SHARE,
): "neu" | "alt" | null {
  if (!metaSplitTarget(pathname)) return null;
  const forced = new URLSearchParams(search).get(META_SPLIT_PARAM);
  if (forced === "neu" || forced === "alt") return forced;
  return roll < share ? "neu" : "alt";
}

/** Inline-Skript fuer den <head> der alten Seiten. */
export const META_PAGE_SPLIT_SCRIPT = `(function(){try{var M=${JSON.stringify(
  META_PAGE_SPLIT,
)},K=${JSON.stringify(META_SPLIT_PARAM)},S=${META_PAGE_SPLIT_SHARE};var p=location.pathname.replace(/\\/+$/,"").toLowerCase();var t=M[p];if(!t)return;var q=new URLSearchParams(location.search);var f=q.get(K);var v=f==="neu"||f==="alt"?f:(Math.random()<S?"neu":"alt");q.set(K,v);if(v==="neu"){location.replace(t+"?"+q.toString()+location.hash)}else if(f!=="alt"){history.replaceState(history.state,"",location.pathname+"?"+q.toString()+location.hash)}}catch(e){}})();`;
