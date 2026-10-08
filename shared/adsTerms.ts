/**
 * Ads-Modus (go.*): Google lehnt Anzeigen mit RESTRICTED_DRUG_TERMS ab, sobald
 * auf der Zielseite sichtbar "Botox" steht. Der Ads-Baum in Strapi heisst
 * bereits "Muskelrelaxans", aber Freitexte (FAQ, Preisvarianten, Querverweise)
 * kommen teils aus gemeinsamen Inhalten und tragen den Markennamen weiter.
 *
 * Diese Ersetzung laeuft nur im Ads-Modus (Strapi-Proxy + Seiten-Meta). www
 * behaelt "Botox" fuer SEO.
 */

const TERM_BY_LOCALE: Record<string, string> = {
  de: "Muskelrelaxans",
  en: "muscle relaxant",
  fr: "relaxant musculaire",
  nl: "spierontspanner",
  tr: "kas gevşetici",
  ar: "مرخي العضلات",
};

// "Botox®", "Botox (R)", "Botox&reg;", "Botox", "botox" sowie der Wirkstoff
// "Botulinumtoxin (Typ A)". Auch innerhalb von Komposita ("Botoxbehandlung").
const RESTRICTED_TERM =
  /Botulinum(?:toxin)?(?:\s+(?:Typ|Type)\s+A)?|Botox(?:\s?®|&reg;|\s?\(R\))?/gi;

const RESTRICTED_TEST = /botox|botulinum/i;

export function hasRestrictedDrugTerm(value: unknown): boolean {
  return typeof value === "string" && RESTRICTED_TEST.test(value);
}

export function adsTermForLocale(locale?: string | null): string {
  return TERM_BY_LOCALE[(locale || "de").slice(0, 2)] ?? TERM_BY_LOCALE.de;
}

/**
 * Ersetzt Botox/Botulinumtoxin im Fliesstext. Verweise, deren Ziel "botox"
 * enthaelt (Markdown oder HTML), werden zu reinem Text: Die Ziele liegen im
 * SEO-Baum auf www und wuerden den Begriff ueber die URL wieder einschleusen.
 */
export function replaceRestrictedDrugTerms(
  value: string,
  locale?: string | null,
): string {
  if (!RESTRICTED_TEST.test(value)) return value;
  const term = adsTermForLocale(locale);
  return value
    .replace(/\[([^\]]*)\]\(([^)]*)\)/g, (m, text, url) =>
      RESTRICTED_TEST.test(url) ? text : m,
    )
    .replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (m, url, text) =>
      RESTRICTED_TEST.test(url) ? text : m,
    )
    .replace(RESTRICTED_TERM, term);
}

// Felder, die Adressen oder Kennungen tragen. Ein "botox" darin ist kein
// sichtbarer Text, und eine Ersetzung wuerde Links und Zuordnungen brechen.
const SKIP_KEY =
  /(?:url|href|slug|slugs|pathkey)$|^(?:id|documentid|hash|ext|mime|provider|key|locale)$/i;
const LOOKS_LIKE_ADDRESS = /^(?:https?:\/\/|\/|#)|^[\w.-]+\.(?:mp4|webm|mov|jpe?g|png|webp|avif|gif|svg|pdf)$/i;

function isMedia(value: any): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.url === "string" &&
    typeof value.mime === "string"
  );
}

function isRestrictedLinkNode(value: any): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    value.type === "link" &&
    typeof value.url === "string" &&
    RESTRICTED_TEST.test(value.url) &&
    Array.isArray(value.children)
  );
}

/**
 * Laeuft rekursiv durch eine Strapi-Antwort und ersetzt die Begriffe in allen
 * Textfeldern. Rich-Text-Links (Strapi Blocks, type "link") auf botox-URLs
 * werden durch ihren Linktext ersetzt.
 */
export function sanitizeAdsContent<T>(input: T, locale?: string | null): T {
  const walk = (value: any, key?: string): any => {
    if (typeof value === "string") {
      if (key && SKIP_KEY.test(key)) return value;
      if (LOOKS_LIKE_ADDRESS.test(value)) return value;
      return replaceRestrictedDrugTerms(value, locale);
    }
    if (Array.isArray(value)) {
      const out: any[] = [];
      for (const item of value) {
        if (isRestrictedLinkNode(item)) {
          for (const child of item.children) out.push(walk(child));
        } else {
          out.push(walk(item, key));
        }
      }
      return out;
    }
    if (value !== null && typeof value === "object") {
      const media = isMedia(value);
      const out: Record<string, any> = {};
      for (const [k, v] of Object.entries(value)) {
        // Dateinamen von Medien sind nicht sichtbar; Alt-Text und Caption schon.
        if (media && k !== "alternativeText" && k !== "caption") {
          out[k] = v;
        } else {
          out[k] = walk(v, k);
        }
      }
      return out;
    }
    return value;
  };
  return walk(input);
}
