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
 * 3. #199: Blog-Links fallen weg (Blog ist auf go. aus), Links auf Adressen
 *    mit "botox"/"btx" gehen auf die Muskelrelaxans-Seite (wie die
 *    Weiterleitung, shared/adsRedirects.ts), die alte Aachen-Lippenseite auf
 *    die aktuelle. Mit `adsPathKeys` fallen Links auf Behandlungen weg, die
 *    es im Ads-Baum nicht gibt (404 auf go.); eindeutige Kurzformen
 *    (/behandlungen/prp-haartherapie) werden zur vollen Adresse.
 *
 * Laeuft im Strapi-Proxy nach sanitizeAdsContent, nur im Ads-Modus.
 */

import {
  adsRedirectTarget,
  legacyPageRedirect,
  RESTRICTED_PATH,
} from "./adsRedirects.ts";

const WWW_ORIGIN = /^https?:\/\/(?:www\.)?myhealthandbeauty\.com(?=\/|$|\?|#)/i;
const TREATMENT_PATH = /^\/behandlungen\/([^?#]+?)\/?(?=[?#]|$)/;

export type AdsLinkContext = {
  /** "/standorte/koeln/koeln-arcaden" auf Standort-Behandlungsseiten. */
  locationBase?: string | null;
  /** pathKeys, die es an diesem Standort gibt. */
  availablePathKeys?: string[] | null;
  /** pathKeys des Ads-Baums (adsTreePathKeys), fuer alle Seiten. */
  adsPathKeys?: ReadonlySet<string> | null;
};

const BLOG_PATH = /^\/(?:(?:en|tr|fr|nl)\/)?blog(?:[/?#]|$)|^\/ar\/mudawwana(?:[/?#]|$)/i;
const LOCATION_TREATMENT = /^\/standorte\/[^/?#]+\/[^/?#]+\/([^?#]+?)\/?(?=[?#]|$)/;

function splitRest(path: string): [string, string] {
  const i = path.search(/[?#]/);
  return i < 0 ? [path, ""] : [path.slice(0, i), path.slice(i)];
}

function hasAdsKey(keys: ReadonlySet<string>, pathKey: string): boolean {
  const mapped = pathKey.replace(/botox/gi, "muskelrelaxans");
  return keys.has(mapped) || keys.has(`${mapped}-rabatt`);
}

/** Eindeutige Seite im Ads-Baum, deren letzter Teil `leaf` ist. */
function uniqueLeaf(keys: ReadonlySet<string>, leaf: string): string | null {
  const hits = [...keys].filter((k) => k.endsWith(`/${leaf}`));
  return hits.length === 1 ? hits[0]! : null;
}

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

  // #199: Blog aus, Aachen-Lippenseite ersetzt, keine Botox-Adressen.
  {
    const [bare, rest] = splitRest(path);
    const legacy = legacyPageRedirect(bare);
    if (legacy) path = `${legacy}${rest}`;
    else if (BLOG_PATH.test(bare)) return null;
    else if (RESTRICTED_PATH.test(bare)) {
      path = `${adsRedirectTarget(bare, { adsPathKeys: ctx.adsPathKeys }) ?? "/behandlungen/muskelrelaxans"}${rest}`;
    }
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

  // Behandlungen, die es auf go. nicht gibt (404): Link weg bzw. volle Adresse.
  if (ctx.adsPathKeys) {
    const t = TREATMENT_PATH.exec(path);
    if (t) {
      const pathKey = t[1]!;
      if (!hasAdsKey(ctx.adsPathKeys, pathKey)) {
        const full = pathKey.includes("/") ? null : uniqueLeaf(ctx.adsPathKeys, pathKey);
        return full ? `/behandlungen/${full}${path.slice(t[0].length)}` : null;
      }
    }
    const l = LOCATION_TREATMENT.exec(path);
    if (l && !hasAdsKey(ctx.adsPathKeys, l[1]!)) return null;
  }
  return wasAbsolute || path !== url ? path : url;
}

/** Markdown- und HTML-Links in einem Fliesstext. */
export function rewriteAdsLinksInText(value: string, ctx: AdsLinkContext = {}): string {
  if (!value.includes("myhealthandbeauty.com") && !/\]\(\/|href="\//.test(value)) {
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
        // Knopf/Feld ohne Ziel: zur Standortseite bzw. Uebersicht statt ins Leere.
        return next === null ? ctx.locationBase ?? "/behandlungen" : next;
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
