/**
 * go.* (Ads-Modus): Ausgaenge schliessen (bfroos/myhb-store#184).
 *
 * 1. Absolute Links auf www.myhealthandbeauty.com in Strapi-Freitexten
 *    verliessen das Ads-Deployment - auf www steht "Botox" sichtbar (Google-
 *    Policy) und die Standort-Buchung fehlt. Sie werden zu relativen Pfaden
 *    auf go.
 * 2. Auf Standort-Behandlungsseiten fuehren ortlose Querlinks
 *    (/behandlungen/<pathKey>) auf dieselbe Behandlung am selben Standort
 *    (/standorte/<stadt>/<standort>/<pathKey>), wenn es sie dort gibt. Sonst
 *    wird der Link zu reinem Text (Buttons: zur Standortseite).
 *
 * Laeuft im Strapi-Proxy nach sanitizeAdsContent, nur im Ads-Modus.
 */

const WWW_ORIGIN = /^https?:\/\/(?:www\.)?myhealthandbeauty\.com(?=\/|$|\?|#)/i;
const TREATMENT_PATH = /^\/behandlungen\/([^?#]+?)\/?(?=[?#]|$)/;

export type AdsLinkContext = {
  /** "/standorte/koeln/koeln-arcaden" auf Standort-Behandlungsseiten. */
  locationBase?: string | null;
  /** pathKeys, die es an diesem Standort gibt. */
  availablePathKeys?: string[] | null;
};

/**
 * Neues Ziel eines Links: unveraendert, umgeschrieben oder `null` (= Link
 * entfernen, Text behalten).
 */
export function mapAdsLink(url: string, ctx: AdsLinkContext = {}): string | null {
  if (typeof url !== "string" || !url) return url;
  let path = url;
  const wasAbsolute = WWW_ORIGIN.test(url);
  if (wasAbsolute) {
    path = url.replace(WWW_ORIGIN, "") || "/";
    if (!path.startsWith("/")) path = `/${path}`;
  } else if (!url.startsWith("/")) {
    return url; // extern, Anker, mailto, tel ...
  }

  if (ctx.locationBase && ctx.availablePathKeys) {
    const m = TREATMENT_PATH.exec(path);
    if (m) {
      const pathKey = m[1]!;
      const rest = path.slice(m[0].length);
      return ctx.availablePathKeys.includes(pathKey)
        ? `${ctx.locationBase}/${pathKey}${rest}`
        : null;
    }
  }
  return wasAbsolute ? path : url;
}

/** Markdown- und HTML-Links in einem Fliesstext. */
export function rewriteAdsLinksInText(value: string, ctx: AdsLinkContext = {}): string {
  if (!value.includes("myhealthandbeauty.com") && !value.includes("/behandlungen/")) {
    return value;
  }
  return value
    .replace(/\[([^\]]*)\]\(([^)\s]*)\)/g, (m, text: string, url: string) => {
      const next = mapAdsLink(url, ctx);
      if (next === null) return text;
      return next === url ? m : `[${text}](${next})`;
    })
    .replace(
      /<a\b([^>]*?)href="([^"]*)"([^>]*)>([\s\S]*?)<\/a>/gi,
      (m, before: string, url: string, after: string, text: string) => {
        const next = mapAdsLink(url, ctx);
        if (next === null) return text;
        return next === url ? m : `<a${before}href="${next}"${after}>${text}</a>`;
      },
    );
}

const URL_KEY = /^(?:url|href|link|to)$/i;
const SKIP_KEY = /canonical|^(?:id|documentid|slug|slugs|pathkey|ancestorslugs|locale|hash|ext|mime|provider)$/i;

function isMedia(value: any): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.url === "string" &&
    typeof value.mime === "string"
  );
}

/** rewriteAdsLinks rekursiv ueber eine Strapi-Antwort. */
export function rewriteAdsLinksDeep<T>(input: T, ctx: AdsLinkContext = {}): T {
  const walk = (value: any, key?: string): any => {
    if (typeof value === "string") {
      if (key && SKIP_KEY.test(key)) return value;
      if (key && URL_KEY.test(key)) {
        const next = mapAdsLink(value, ctx);
        // Knopf/Feld ohne Ziel am Standort: zur Standortseite statt ins Leere.
        return next === null ? ctx.locationBase ?? value : next;
      }
      return rewriteAdsLinksInText(value, ctx);
    }
    if (Array.isArray(value)) {
      const out: any[] = [];
      for (const item of value) {
        // Strapi-Blocks-Link ohne Ziel am Standort -> nur der Linktext.
        if (
          item &&
          typeof item === "object" &&
          item.type === "link" &&
          typeof item.url === "string" &&
          Array.isArray(item.children) &&
          mapAdsLink(item.url, ctx) === null
        ) {
          for (const child of item.children) out.push(walk(child));
        } else {
          out.push(walk(item, key));
        }
      }
      return out;
    }
    if (value !== null && typeof value === "object") {
      if (isMedia(value)) return value;
      const out: Record<string, any> = {};
      for (const [k, v] of Object.entries(value)) out[k] = walk(v, k);
      return out;
    }
    return value;
  };
  return walk(input);
}
