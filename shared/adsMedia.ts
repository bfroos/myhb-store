/**
 * go.* (Ads-Modus): keine Videos mit dem Markennamen des Muskelrelaxans
 * (Google-Policy RESTRICTED_DRUG_TERMS, 30.09.2026).
 *
 * sanitizeAdsContent laesst Medien-URLs bewusst unveraendert (eine Ersetzung
 * wuerde die Datei brechen). Einige Videos tragen den Begriff aber im
 * Dateinamen/`src` oder im Strapi-Namen/Alt-Text. Solche Videos
 * werden im Ads-Modus nicht ausgeliefert: ersetzt durch ein unbedenkliches
 * Poster-Bild desselben Blocks, sonst entfernt. www unveraendert.
 */

const BLOCKED_TERM = /botox|btx/i;

/**
 * Per Strapi-Media-ID gesperrt (Video-Inventur 30.09.2026):
 * - Begriff nur im Strapi-Dateinamen, den die API-Antwort nicht mitliefert
 *   (URL neutral): 34 Browlift_mit_BTX_Aachen, 209 …_drei_Zonen_BTX_Berlin,
 *   213 Lipflip_BTX_Berlin, 214 BTX_mit_50, 220 Erdbeerkinn_BTX_Koeln,
 *   223 BTX_gegen_Kopfschmerzen_Leipzig.
 * - 257/273: Begriff in der URL (…_Botox_…) - sperrt schon BLOCKED_TERM,
 *   die IDs bleiben zur Sicherheit stehen.
 * Eingebrannter Text im Bild sperrt NICHT mehr (Benjamin, 30.09.2026:
 * "Wenn es im Video selbst vorkommt, ist es okay" - nur Titel, Dateiname und
 * Alt-Text zaehlen). Freigegeben: 224, 277, 280, 286, 247, 255, 272, 274,
 * 279, 284, 285, 518, 1052, 521, 523, 531, 532, 803, 833, 1046.
 * - Altes Logo "MYH&B" im Bild (Benjamin, 01.10.2026; neues Logo "MY HEALTH &
 *   BEAUTY" ist ok): 207 und 275 (Wandschild "MYH&B POWER DRIP LOUNGE",
 *   0-3 s), 257 (dasselbe Schild bei 29 s und 44-47 s). Texterkennung voller
 *   Aufloesung alle 0,5 s ueber alle auf go. ausgelieferten Videos am
 *   01.10.2026; 207/275 laufen derzeit nirgends auf go., stehen vorsorglich
 *   hier. Der Hero-Clip hero-stirn-zornesfalte-7s (aus 207) beginnt nach dem
 *   Schild und ist frei.
 */
export const BLOCKED_VIDEO_IDS: ReadonlySet<number> = new Set([
  257, 273, 34, 209, 213, 214, 220, 223, 207, 275,
]);

function isMedia(value: any): boolean {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.url === "string" &&
    typeof value.mime === "string"
  );
}

function mentionsTerm(media: any): boolean {
  return [media.url, media.name, media.hash, media.alternativeText, media.caption]
    .filter((v) => typeof v === "string")
    .some((v) => BLOCKED_TERM.test(v));
}

export function isBlockedAdsVideo(media: any): boolean {
  if (!isMedia(media) || !String(media.mime).startsWith("video/")) return false;
  return BLOCKED_VIDEO_IDS.has(Number(media.id)) || mentionsTerm(media);
}

/** Poster/Bild mit dem Begriff im Dateinamen. */
function isBlockedAdsImage(media: any): boolean {
  return isMedia(media) && String(media.mime).startsWith("image/") && mentionsTerm(media);
}

/**
 * Bild mit dem Begriff in der Datei-URL. Der Name steht in der Bild-URL
 * (src/srcset, og:image) und zaehlt fuer Google wie sichtbarer Text - z. B.
 * "Kopie_von_BOTOX_OT_NEU_45" (Lippenbild, id 1044) auf /p/lippen-meta-rabatt.
 * Solche Bilder werden im Ads-Modus ausgeblendet (#199), www unveraendert.
 * Nur die Adresse zaehlt: Alt-Texte ersetzt sanitizeAdsContent ohnehin.
 */
export function isBlockedAdsImageFile(media: any): boolean {
  if (!isMedia(media) || !String(media.mime).startsWith("image/")) return false;
  const urls = [media.url, media.hash];
  for (const f of Object.values(media.formats ?? {})) urls.push((f as any)?.url);
  return urls.some(
    (v) =>
      typeof v === "string" &&
      (BLOCKED_TERM.test(v) || BLOCKED_IMAGE_FILES.some((name) => v.includes(name))),
  );
}

/**
 * Bilder mit dem alten Schriftzug "MYH&B" im Bild (Benjamin, 01.10.2026: das
 * alte Logo nicht mehr zeigen, "MY HEALTH & BEAUTY" ist ok). Per Datei-Hash,
 * weil Strapi-Bilder in mehreren Groessen (thumbnail_/small_ …) kommen.
 * Gefunden per Texterkennung + Ansehen aller go.-Bilder am 01.10.2026:
 * - dr_gero_ruppert: Aufsteller "MYH&B" und Wand "…B SHOP" im Hintergrund
 *   (Aerzte-Block, auf fast allen Standort-Behandlungsseiten);
 * - MY_Centerplan_Berlin: Lageplan-Beschriftung "MYH&B – MY HEALTH AND BEAUTY";
 * - Infusion1: Aufsteller "MYH&B … Dein Health-Check" (/behandlungen/infusionen).
 * Ersatz ginge nur ueber einen Strapi-Upload; bis dahin ausgeblendet.
 */
const BLOCKED_IMAGE_FILES: readonly string[] = [
  "dr_gero_ruppert_54fc7b563a",
  "MY_Centerplan_Berlin_0efebc457a",
  "Infusion1_bad8f18c9b",
];

export function stripBlockedAdsVideos<T>(input: T): T {
  const walk = (value: any): any => {
    if (Array.isArray(value)) return value.map(walk);
    if (value === null || typeof value !== "object") return value;
    if (isMedia(value)) return value;

    const rawPoster = value.poster;
    const poster =
      isMedia(rawPoster) && !isBlockedAdsImage(rawPoster) && !isBlockedAdsImageFile(rawPoster)
        ? rawPoster
        : null;
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      if (k === "poster" && isMedia(v)) {
        out[k] = poster;
      } else if (isBlockedAdsVideo(v)) {
        out[k] = poster; // Bild statt Video, sonst null
      } else if (isBlockedAdsImageFile(v)) {
        out[k] = null; // #199: Bild mit dem Begriff im Dateinamen ausblenden
      } else if (Array.isArray(v) && v.some((item) => isBlockedAdsVideo(item) || isBlockedAdsImageFile(item))) {
        out[k] = v
          .map((item) => (isBlockedAdsVideo(item) ? poster : isBlockedAdsImageFile(item) ? null : item))
          .filter((item) => item !== null)
          .map(walk);
      } else {
        out[k] = walk(v);
      }
    }
    return out;
  };
  return walk(input);
}
