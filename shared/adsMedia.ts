/**
 * go.* (Ads-Modus): keine Videos mit dem Markennamen des Muskelrelaxans
 * (Google-Policy RESTRICTED_DRUG_TERMS, 30.09.2026).
 *
 * sanitizeAdsContent laesst Medien-URLs bewusst unveraendert (eine Ersetzung
 * wuerde die Datei brechen). Einige Videos tragen den Begriff aber im
 * Dateinamen/`src` und teils eingebrannt im Bild - ohne Poster ist genau
 * dieses Bild das Vorschaubild (MediaVideo setzt `#t=1`). Solche Videos
 * werden im Ads-Modus nicht ausgeliefert: ersetzt durch ein unbedenkliches
 * Poster-Bild desselben Blocks, sonst entfernt. www unveraendert.
 */

const BLOCKED_TERM = /botox|btx/i;

/**
 * Per Strapi-Media-ID gesperrt (Video-Inventur 30.09.2026):
 * - eingebrannter Text: 257 "BOTOX® MIT ÜBER…" (Zornesfalte), 273 "BOTOX
 *   OHNE TERMIN" (Stirnfalte);
 * - Begriff nur im Strapi-Dateinamen, den die API-Antwort nicht mitliefert
 *   (URL neutral): 34 Browlift_mit_BTX_Aachen, 209 …_drei_Zonen_BTX_Berlin,
 *   213 Lipflip_BTX_Berlin, 214 BTX_mit_50, 220 Erdbeerkinn_BTX_Koeln,
 *   223 BTX_gegen_Kopfschmerzen_Leipzig.
 * - Texterkennung aller Frames (30.09.2026), Begriff nur eingebrannt:
 *   224/286 Masseter Leipzig ("MIT BOTOX®" bei 18 s), 277 Erdbeerkinn
 *   (ab 1,5 s), 280 Lipflip (bei 6,5 s) - liefen auf go.; vorsorglich
 *   (heute nicht auf go. eingebunden): 247, 255, 272, 274, 279, 284, 285,
 *   518, 1052, 521, 523, 531, 532, 803, 833, 1046.
 */
export const BLOCKED_VIDEO_IDS: ReadonlySet<number> = new Set([
  257, 273, 34, 209, 213, 214, 220, 223,
  224, 277, 280, 286,
  247, 255, 272, 274, 279, 284, 285, 518, 1052, 521, 523, 531, 532, 803, 833,
  1046,
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
  return urls.some((v) => typeof v === "string" && BLOCKED_TERM.test(v));
}

export function stripBlockedAdsVideos<T>(input: T): T {
  const walk = (value: any): any => {
    if (Array.isArray(value)) return value.map(walk);
    if (value === null || typeof value !== "object") return value;
    if (isMedia(value)) return value;

    const rawPoster = value.poster;
    const poster = isMedia(rawPoster) && !isBlockedAdsImage(rawPoster) ? rawPoster : null;
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
