/**
 * go.* (Ads-Modus), Seitenvorlage v2: welche Behandlungsclips wo laufen.
 *
 * Reine Code-Konfiguration (kein Strapi-Feld), damit neue Clips ohne
 * Schema-Aenderung dazukommen: Ein neu geschnittener und hochgeladener Clip
 * wird hier mit seiner Strapi-Media-ID und URL eingetragen. Die Strapi-API
 * gibt Medien nicht einzeln per ID heraus (/upload/files ist gesperrt),
 * deshalb steht die URL mit dabei; die ID dient der Sperrliste.
 *
 * Regeln (Benjamin, 30.09.2026; Playbook v2 §4):
 * - Nur Videos, die shared/adsMedia.ts nicht sperrt (ID-Liste, Begriff in
 *   URL/Name/Alt). `adsClipAllowed` prueft das erneut, falls hier einmal ein
 *   gesperrtes Video eingetragen wird.
 * - Kein Vorher/Nachher: Behandlungsablauf und Kundinnen-Clips.
 * - Hero-Clip nur, wenn ein tauglicher existiert; sonst bleibt das Hero-Foto.
 *   `start`/`end` schneiden ein laengeres Video im Browser zu (546: nur
 *   Sekunde 0-10, am Ende steht ein Rabatt-Text im Bild).
 * - Poster: ohne `posterUrl` zeigt der Hero sein Foto darunter, das Karussell
 *   einen neutralen Platzhalter - nie `#t=1` (dort stand bei 257/273 der
 *   Markenname im Vorschaubild).
 */
import { BLOCKED_VIDEO_IDS } from "./adsMedia.ts";

export type AdsClip = {
  /** Strapi-Media-ID (fuer die Sperrliste; bei Code-Dateien weglassen). */
  mediaId?: number;
  /** Video-URL (mp4, H.264). */
  url: string;
  /** Vorschaubild (WebP/JPEG, gleiches Seitenverhaeltnis). */
  posterUrl?: string;
  /** Sekunden: nur dieser Ausschnitt laeuft (Schleife start..end). */
  start?: number;
  end?: number;
  /** Kurze Unterschrift unter dem Clip (Karussell), ohne Markennamen. */
  caption?: string;
  /** Seitenverhaeltnis Breite/Hoehe, Standard 9/16. */
  aspect?: number;
  /** Bildausschnitt im querformatigen Hero (CSS object-position). */
  focus?: string;
};

export type AdsClipSet = {
  hero?: AdsClip;
  carousel: AdsClip[];
};

const MEDIA = "https://media.myhealthandbeauty.app";

// Lippen: 546 "Lippenergebnisse" (0-10 s, danach Rabatt-Text), 547 ohne
// Einblendung, 806 Kundin in Kaiserslautern ("tat gar nicht weh").
// Nicht: 837 (alte Preise im Bild "ab 199 €/149 €").
const LIPPEN_546: AdsClip = {
  mediaId: 546,
  url: `${MEDIA}/Lippenergebnisse_1_1_62e7d5540c.mp4`,
  start: 0,
  end: 10,
};

/**
 * Hero-Clips aus dem Repo (public/videos/go/): 5-8 s, 540x960, H.264 ohne
 * Tonspur, faststart, je ~450-560 KB, Poster ~37 KB. Geschnitten und per
 * Texterkennung (0,25 s) geprueft am 30.09.2026; ein Strapi-Upload war
 * mangels Token nicht moeglich. Neutrale Dateinamen (kein Markenname).
 */
const heroClip = (name: string, focus?: string): AdsClip => ({
  url: `/videos/go/${name}.mp4`,
  posterUrl: `/videos/go/${name}-poster.jpg`,
  aspect: 9 / 16,
  focus,
});

const CLIPS: Record<string, AdsClipSet> = {
  "hyaluron/lippen-aufspritzen": {
    hero: heroClip("hero-lippen-8s", "center 68%"),
    carousel: [
      {
        mediaId: 547,
        url: `${MEDIA}/Lippen_1_a2715c62db.mp4`,
        posterUrl: "/ads-clips/lippen-547.jpg",
        caption: "Lippen mit Hyaluron",
      },
      {
        mediaId: 806,
        url: `${MEDIA}/Lippen_Kaiserslautern_7a33549a14.mp4`,
        posterUrl: "/ads-clips/lippen-806.jpg",
        caption: "Kundin direkt nach der Lippenbehandlung",
      },
      {
        ...LIPPEN_546,
        posterUrl: "/ads-clips/lippen-546.jpg",
        caption: "Ergebnisse mit Hyaluron",
      },
    ],
  },
  // Stirnfalte: Hero-Clip "Stirn/Zornesfalte" (neu geschnitten). Im
  // Karussell zusaetzlich ein Kundinnen-Clip derselben Behandlungsart
  // (Masseter, Leipzig), klar beschriftet.
  "muskelrelaxans/stirnfalte": {
    hero: heroClip("hero-stirn-zornesfalte-7s"),
    carousel: [
      {
        mediaId: 807,
        url: `${MEDIA}/Masseter_Leipzig_4d0c7db665.mp4`,
        posterUrl: "/ads-clips/muskelrelaxans-807.jpg",
        caption: "Kundin nach der Kiefer-Behandlung (Leipzig)",
      },
    ],
  },
  // Vorbereitet fuer die Erweiterung (Seiten noch nicht in
  // ADS_TEMPLATE_V2_PAGES):
  "muskelrelaxans/zornesfalte": { hero: heroClip("hero-stirn-zornesfalte-7s"), carousel: [] },
  "muskelrelaxans/kraehenfuesse": { hero: heroClip("hero-kraehenfuesse-7s"), carousel: [] },
  "muskelrelaxans/lipflip": { hero: heroClip("hero-lipflip-5s"), carousel: [] },
  "hyaluron/wangenaufbau": { hero: heroClip("hero-wangenaufbau-7s"), carousel: [] },
};

function baseKey(pathKey: string | null | undefined): string {
  return String(pathKey ?? "").replace(/-rabatt$/, "");
}

const BLOCKED_TERM = /botox|btx|botulinum/i;

/** Clip darf auf go. laufen (Sperrliste aus adsMedia, Begriff in URL/Text). */
export function adsClipAllowed(clip: AdsClip | null | undefined): clip is AdsClip {
  if (!clip || typeof clip.url !== "string" || !clip.url) return false;
  if (clip.mediaId != null && BLOCKED_VIDEO_IDS.has(Number(clip.mediaId))) return false;
  return ![clip.url, clip.posterUrl, clip.caption].some(
    (v) => typeof v === "string" && BLOCKED_TERM.test(v),
  );
}

/** Clips einer Behandlungsseite (pathKey ohne Standort), bereits gefiltert. */
export function adsClipsFor(pathKey: string | null | undefined): AdsClipSet {
  const set = CLIPS[baseKey(pathKey)];
  if (!set) return { carousel: [] };
  return {
    hero: adsClipAllowed(set.hero) ? set.hero : undefined,
    carousel: set.carousel.filter(adsClipAllowed),
  };
}

/** Alle Eintraege (fuer Tests). */
export function adsClipEntries(): Array<[string, AdsClipSet]> {
  return Object.entries(CLIPS);
}
