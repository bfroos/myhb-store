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
 * - Karussell (Benjamin, 30.09.2026): nur Clips, die zur Behandlung der Seite
 *   passen und keinen fremden Stadtnamen zeigen (`city`); passt keiner, wird
 *   der Abschnitt ausgeblendet. Volle Strapi-Videos (2,5-8,5 MB) nur mit
 *   eigenem Poster und erst auf Tippen geladen; von selbst laufen nur die
 *   geschnittenen Clips aus public/videos/go/ (~0,5 MB).
 * - Hero-Ausschnitt: eingebrannte Untertitel duerfen nicht halb angeschnitten
 *   sein. `focusY` und `captionZones` je Clip; `heroObjectPositionY` waehlt
 *   daraus je Kartengroesse den Ausschnitt (Untertitel ganz drin oder ganz
 *   draussen).
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
  /** Quelle im Strapi-Medienbestand (nur Doku, fuer Code-Dateien). */
  source?: number;
  /** Seitenverhaeltnis Breite/Hoehe, Standard 9/16. */
  aspect?: number;
  /**
   * Hero: vertikale Bildmitte des Wichtigen (0 = oben, 1 = unten), z. B. die
   * Lippen. Standard 0,4.
   */
  focusY?: number;
  /**
   * Hero: Bereiche (Anteil der Hoehe, von-bis) mit eingebrannten Untertiteln.
   * Der Ausschnitt schneidet keinen davon an.
   */
  captionZones?: Array<[number, number]>;
  /**
   * Stadt-Slug, falls der Clip einen Stadtnamen im Bild zeigt; laeuft dann
   * nur auf Seiten dieser Stadt.
   */
  city?: string;
};

export type AdsClipSet = {
  hero?: AdsClip;
  carousel: AdsClip[];
};

/**
 * Alle Clips liegen im Repo (public/videos/go/), geschnitten am 30.09.2026
 * aus Benjamins Video-Zuordnung (nur einsatz hero/karussell, Dubletten auf die
 * beste Fassung zusammengefasst), 540x960 H.264, faststart:
 * - Hero 4-8 s ohne Tonspur, <= 600 KB;
 * - Karussell 12 s MIT Ton (startet stumm, Ton per Knopf), <= 1,2 MB.
 * Neutrale Dateinamen; eingebrannter Text ist erlaubt (Benjamin), per
 * Texterkennung geprueft: keine Preise, keine fremde Behandlung.
 * Quelle (Strapi-Media-ID) steht als `source` dabei, nur zur Nachvollziehbarkeit.
 */
const heroClip = (
  name: string,
  crop: Pick<AdsClip, "focusY" | "captionZones"> = {},
): AdsClip => ({
  url: `/videos/go/${name}.mp4`,
  posterUrl: `/videos/go/${name}-poster.jpg`,
  aspect: 9 / 16,
  ...crop,
});

/** `city`: Stadtname prominent im Bild -> nur auf Seiten dieser Stadt. */
const clip = (name: string, source: number, caption: string, city?: string): AdsClip => ({
  url: `/videos/go/${name}.mp4`,
  posterUrl: `/videos/go/${name}-poster.jpg`,
  aspect: 9 / 16,
  caption,
  source,
  ...(city ? { city } : {}),
});

// Untertitel-Zonen per Einzelbild (0,6 s) vermessen am 30.09.2026.
const LIPPEN_8S_CROP = {
  // Lippen der drei Kundinnen liegen bei 53-66 %, Augen bei 35-45 %.
  focusY: 0.52,
  // oben "LIPPENERGEBNISSE" (0-1,8 s), unten die laufenden Untertitel
  captionZones: [
    [0.2, 0.29],
    [0.68, 0.88],
  ] as Array<[number, number]>,
};
const STIRN_7S_CROP = {
  // Stirn mit Markierungen bei 15-45 %
  focusY: 0.32,
  captionZones: [[0.61, 0.87]] as Array<[number, number]>,
};


// Muskelrelaxans Stirn/Zornesfalte/Kraehenfuesse (Benjamin: dieselben Videos
// fuer alle drei Zonen, wo er sie so markiert hat).
const MR = {
  injectionMan: clip("stirn-karussell-2", 209, "Behandlung: die Zonen werden vorher erklärt"),
  marking: clip("stirn-karussell-8", 831, "Einzeichnen und behandeln"),
  threeZones: clip("stirn-karussell-10", 843, "Kundin direkt nach der Behandlung"),
  refresh: clip("stirn-karussell-9", 839, "Stirn und Zornesfalte auffrischen"),
  koeln: clip("stirn-karussell-14", 1080, "Kundin in Köln", "koeln"),
  trio: clip("stirn-karussell-6", 266, "Kundinnen nach der Behandlung"),
  firstTime: clip("stirn-karussell-12", 848, "Zum ersten Mal – trotz Angst vor Spritzen"),
  patricia: clip("stirn-karussell-15", 1143, "Krähenfüße und Zornesfalte"),
  zornesMan: clip("zornes-karussell-2", 272, "Behandlung der Zornesfalte"),
  zornesKoeln: clip("zornes-karussell-1", 257, "Auf dem Weg in die Köln Arcaden", "koeln"),
};

const CLIPS: Record<string, AdsClipSet> = {
  "muskelrelaxans/stirnfalte": {
    hero: heroClip("hero-stirn-zornesfalte-7s", STIRN_7S_CROP),
    carousel: [MR.injectionMan, MR.marking, MR.refresh, MR.threeZones, MR.koeln, MR.trio],
  },
  "hyaluron/lippen-aufspritzen": {
    hero: heroClip("hero-lippen-8s", LIPPEN_8S_CROP),
    carousel: [
      clip("lippen-karussell-7", 857, "Lippen mit 0,5 ml Hyaluron"),
      clip("lippen-karussell-6", 854, "Direkt nach der Behandlung"),
      clip("lippen-karussell-3", 221, "Die erste Lippenbehandlung", "leipzig"),
      clip("lippen-karussell-2", 217, "Kundin in Mönchengladbach", "moenchengladbach"),
      clip("lippen-karussell-8", 1046, "Warum sie zu uns gewechselt ist"),
      clip("lippen-karussell-9", 1073, "Zwei Cousinen erzählen"),
    ],
  },
  // Vorrat (Seiten noch nicht in ADS_TEMPLATE_V2_PAGES):
  "muskelrelaxans/zornesfalte": {
    hero: heroClip("hero-stirn-zornesfalte-7s", STIRN_7S_CROP),
    carousel: [MR.zornesMan, MR.marking, MR.firstTime, MR.zornesKoeln, MR.threeZones, MR.koeln],
  },
  "muskelrelaxans/kraehenfuesse": {
    hero: heroClip("hero-kraehenfuesse-7s"),
    carousel: [MR.marking, MR.patricia, MR.threeZones, MR.koeln, MR.trio],
  },
  "muskelrelaxans/lipflip": {
    hero: heroClip("hero-lipflip-5s"),
    carousel: [clip("lipflip-karussell-1", 1053, "Lip Flip in Berlin", "berlin")],
  },
  "muskelrelaxans/zaehneknirschen-bruxismus": {
    hero: heroClip("hero-masseter-1"),
    carousel: [
      clip("masseter-karussell-5", 1052, "Kundin in den Köln Arcaden", "koeln"),
      clip("masseter-karussell-3", 521, "Aufklärung vor der Behandlung"),
      clip("masseter-karussell-1", 223, "Kundin in Leipzig", "leipzig"),
    ],
  },
  "hyaluron/kinnkorrektur": {
    hero: heroClip("hero-kinn-1"),
    carousel: [clip("kinn-karussell-1", 523, "Kundin in Recklinghausen", "recklinghausen")],
  },
  "hyaluron/jawline": {
    hero: heroClip("hero-jaw-1"),
    carousel: [
      clip("jaw-karussell-1", 215, "Kundin in Köln", "koeln"),
      clip("jaw-karussell-3", 1078, "Behandlung durch Ärztinnen und Ärzte"),
      clip("jaw-karussell-2", 822, "Aufklärung und Beratung"),
    ],
  },
  "hyaluron/wangenaufbau": {
    hero: heroClip("hero-wangenaufbau-7s"),
    carousel: [clip("wangen-karussell-1", 859, "Wangenaufbau mit 0,5 ml Hyaluron")],
  },
  "skinbooster/profhilo": {
    carousel: [
      clip("profhilo-karussell-3", 823, "Beratung und Behandlung"),
      clip("profhilo-karussell-2", 268, "Frischekick für die Haut"),
      clip("profhilo-karussell-1", 253, "Endlich wieder frisch fühlen"),
    ],
  },
};
CLIPS["muskelrelaxans/masseter"] = CLIPS["muskelrelaxans/zaehneknirschen-bruxismus"]!;

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

/** Geschnittener Kurzclip aus dem Repo (~0,5 MB): darf von selbst laufen. */
export function adsClipIsShort(clip: AdsClip | null | undefined): boolean {
  return typeof clip?.url === "string" && clip.url.startsWith("/videos/go/");
}

/**
 * Clips einer Behandlungsseite (pathKey ohne Standort), bereits gefiltert.
 * `citySlug`: Stadt der Seite - Clips mit fremdem Stadtnamen im Bild fallen
 * weg. Volle Videos ohne eigenes Poster ebenso (sie wuerden sonst schon vor
 * dem Tippen laden muessen, um ein Bild zu zeigen).
 */
export function adsClipsFor(
  pathKey: string | null | undefined,
  citySlug?: string | null,
): AdsClipSet {
  const set = CLIPS[baseKey(pathKey)];
  if (!set) return { carousel: [] };
  const city = String(citySlug ?? "").toLowerCase();
  return {
    hero: adsClipAllowed(set.hero) ? set.hero : undefined,
    carousel: set.carousel
      .filter(adsClipAllowed)
      .filter((c) => !c.city || c.city.toLowerCase() === city)
      .filter((c) => adsClipIsShort(c) || !!c.posterUrl),
  };
}

/**
 * Hero: object-position (Prozent, vertikal) fuer einen hochkant Clip in einer
 * querformatigen Karte. Der sichtbare Ausschnitt liegt moeglichst mittig um
 * `focusY` und schneidet keine Untertitel-Zone an: jede liegt ganz drin oder
 * ganz draussen (lieber draussen). Laesst sich das nicht erfuellen, bleibt der
 * Fokus-Ausschnitt.
 */
export function heroObjectPositionY(
  boxWidth: number,
  boxHeight: number,
  clip: Pick<AdsClip, "aspect" | "focusY" | "captionZones">,
): number {
  const aspect = clip.aspect ?? 9 / 16;
  const focus = clip.focusY ?? 0.4;
  if (!(boxWidth > 0) || !(boxHeight > 0)) return Math.round(focus * 100);
  // sichtbarer Anteil der Videohoehe bei object-fit: cover (Breite fuellt)
  const r = boxHeight / (boxWidth / aspect);
  if (r >= 1) return 50;
  const maxTop = 1 - r;
  const ideal = Math.min(Math.max(focus - r / 2, 0), maxTop);
  const zones = clip.captionZones ?? [];
  const eps = 0.001;
  const ok = (t: number) =>
    zones.every(([a, z]) => t + r <= a + eps || t >= z - eps || (t <= a + eps && t + r >= z - eps));
  // Lieber ohne Untertitel: jede ganz sichtbare Zone kostet ihre Hoehe.
  const cost = (t: number) =>
    Math.abs(t - ideal) +
    zones.reduce((sum, [a, z]) => sum + (t <= a + eps && t + r >= z - eps ? z - a : 0), 0);
  let best: number | null = null;
  const steps = 400;
  for (let i = 0; i <= steps; i++) {
    const t = (maxTop * i) / steps;
    if (ok(t) && (best == null || cost(t) < cost(best))) best = t;
  }
  const top = best ?? ideal;
  return Math.round((top / maxTop) * 1000) / 10;
}

/** Alle Eintraege (fuer Tests). */
export function adsClipEntries(): Array<[string, AdsClipSet]> {
  return Object.entries(CLIPS);
}
