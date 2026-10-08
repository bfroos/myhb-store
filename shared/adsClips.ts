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
 * - Hero-Clip nur, wenn ein tauglicher existiert UND vermessen ist (focusY,
 *   captionZones) und keinen fremden Stadtnamen zeigt; sonst Hero-Foto.
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
  /**
   * Quelle (nur Doku): Strapi-Media-ID, bei frame.io-Clips der Name des
   * Rohschnitts ("fio-barbie-1").
   */
  source?: number | string;
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

/** Eintrag je Behandlung (Konfiguration). */
export type AdsClipSet = {
  /**
   * Hero-Kandidaten in Reihenfolge: der erste, der fuer die Stadt der Seite
   * passt (ohne `city` oder mit derselben Stadt), wird gezeigt. So laeuft z. B.
   * der Koelner Jawline-Clip in Koeln und ein neutraler Clip in allen anderen
   * Staedten.
   */
  heroes: AdsClip[];
  carousel: AdsClip[];
  /** Kundenfeedback-Videos fuer den Bewertungsabschnitt (12 s mit Ton). */
  feedback?: AdsClip[];
};

/** Ergebnis fuer eine Seite (bereits nach Stadt und Sperrliste gefiltert). */
export type AdsClipsForPage = {
  hero?: AdsClip;
  carousel: AdsClip[];
  feedback: AdsClip[];
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
  crop: Pick<AdsClip, "focusY" | "captionZones" | "city"> = {},
): AdsClip => ({
  url: `/videos/go/${name}.mp4`,
  posterUrl: `/videos/go/${name}-poster.jpg`,
  aspect: 9 / 16,
  ...crop,
});

/** `city`: Stadtname prominent im Bild -> nur auf Seiten dieser Stadt. */
const clip = (name: string, source: number | string, caption: string, city?: string): AdsClip => ({
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

// Vermessen am 01.10.2026 wie #206: Einzelbilder alle 0,5 s, Texterkennung
// (Apple Vision) fuer die Untertitel-Zeilen, Gesichtserkennung fuer den
// Fokus; Zonen = gemessene Zeilen plus ~0,03 Rand. Das Logo oben ("MY
// HEALTH & BEAUTY", neues Logo) zaehlt nicht als Untertitel.
const KRAEHEN_7S_CROP = {
  // Gesicht 31-69 %, in der Nahaufnahme (1,5-4 s) Augen bei ~20 %
  focusY: 0.33,
  // Untertitel 74-82 %
  captionZones: [[0.71, 0.85]] as Array<[number, number]>,
};
const LIPFLIP_5S_CROP = {
  // Gesicht 19-36 %, Lippen bei ~30 %
  focusY: 0.3,
  // Aufkleber "Top Beratung" 15-19 % (ab 4 s), Untertitel 74-82 %
  captionZones: [
    [0.12, 0.2],
    [0.71, 0.85],
  ] as Array<[number, number]>,
};
const MASSETER_1_CROP = {
  // Gesicht 34-65 %, Kieferwinkel/Kaumuskel bei ~55 %; kein Text im Bild
  focusY: 0.5,
  captionZones: [] as Array<[number, number]>,
};
const KINN_1_CROP = {
  // Gesicht 32-53 %, Kinn bei ~50 %
  focusY: 0.45,
  // "KINNAUFBAU, KAISERSLAUTERN" 65-68 % (ganze Laufzeit), Untertitel 69-76 %
  captionZones: [[0.62, 0.79]] as Array<[number, number]>,
  city: "kaiserslautern",
};
const JAW_1_CROP = {
  // Gesicht 30-46 %, Kieferlinie bei ~44 %
  focusY: 0.4,
  // "JAWLIN BEHANDLUNG, KÖLN" 66-71 % (ganze Laufzeit), Untertitel 76-79 %
  captionZones: [[0.63, 0.82]] as Array<[number, number]>,
  city: "koeln",
};
const WANGEN_7S_CROP = {
  // Gesicht 38-58 %, Wangen bei ~48 %
  focusY: 0.47,
  // Untertitel 75-80 % (Wandbild "Happy Place" 20-31 % ist kein Untertitel)
  captionZones: [[0.72, 0.83]] as Array<[number, number]>,
};


// Neue Hero-Clips (Benjamin, 01.10.2026: "oben soll sich immer was bewegen").
// Geschnitten aus Benjamins Zuordnung (einsatz hero/karussell) bzw. frame.io,
// vermessen wie #206: Einzelbilder alle 0,5 s, Texterkennung (auch oberes
// Drittel 3-fach vergroessert, kein "MYH&B"), Gesichtserkennung; Zonen =
// gemessene Untertitel-Zeilen plus ~0,03 Rand. Das Logo oben ("MY HEALTH &
// BEAUTY") und Wandbilder ("Happy Place") zaehlen nicht als Untertitel.
const crop = (focusY: number, captionZones: Array<[number, number]> = [], city?: string) => ({
  focusY,
  captionZones,
  ...(city ? { city } : {}),
});
const H = {
  // Muskelrelaxans
  stirn: heroClip("hero-stirn-zornesfalte-7s", STIRN_7S_CROP),
  kraehen: heroClip("hero-kraehenfuesse-7s", KRAEHEN_7S_CROP),
  lipflip: heroClip("hero-lipflip-5s", LIPFLIP_5S_CROP),
  masseter: heroClip("hero-masseter-1", MASSETER_1_CROP),
  // 803/251-Material (frame.io "MI: Browlift Behandlung"): Augenbrauen bei
  // ~30 %, Untertitel 60-64 %
  browlift: heroClip("fio-browlift-1-hero-6s", crop(0.32, [[0.57, 0.67]])),
  // frame.io "Barbie" 37-44 s: Injektion an der Schulter, kein Text
  barbie: heroClip("fio-barbie-1-hero-7s", crop(0.45)),
  // 277 (4-11,5 s): Kinn bei ~55 %, Untertitel 74-81 %
  erdbeerkinn: heroClip("hero-erdbeerkinn-7s", crop(0.55, [[0.71, 0.84]])),
  // 832 (0-4,9 s, vor der Preiszeile ab 5 s): Achsel 20-55 %, Aufzaehlung
  // 23-37 % / 46-66 %
  hyperhidrose: heroClip("hero-hyperhidrose-5s", crop(0.35, [[0.2, 0.4], [0.43, 0.69]])),
  // Hyaluron
  lippen: heroClip("hero-lippen-8s", LIPPEN_8S_CROP),
  // 206 (33,5-40,5 s, nach dem Arzt mit Kittel-Schriftzug): Lippen bei ~60 %,
  // Untertitel 71-86 %
  lippenkorrektur: heroClip("hero-lippenkorrektur-7s", crop(0.6, [[0.68, 0.89]])),
  // Lippenbehandlung mit rosa Handschuhen, kein Text; Lippen bei ~55 %
  lippenInjektion: heroClip("hero-lippen-2", crop(0.52)),
  // Lippen-Ergebnis im Profil, kein Text; Mund bei ~50 %
  lippenErgebnis: heroClip("hero-lippen-1", crop(0.5)),
  // Wange mit eingezeichneten Punkten, Unterspritzung; unten 92-98 % Text
  wangenPunkte: heroClip("hero-wangen-1", crop(0.5, [[0.9, 1]])),
  wangen: heroClip("hero-wangenaufbau-7s", WANGEN_7S_CROP),
  kinnKL: heroClip("hero-kinn-1", KINN_1_CROP),
  jawKoeln: heroClip("hero-jaw-1", JAW_1_CROP),
  // frame.io Jawline: Kieferlinie bei ~50 %, kein Text
  jaw: heroClip("fio-jawline-1-hero-6s", crop(0.48)),
  // frame.io Jawline-Ergebnis: Gesicht 17-36 %, Untertitel 69-72 %
  jawErgebnis: heroClip("fio-jawline-2-hero-6s", crop(0.32, [[0.66, 0.75]])),
  // Skinbooster / PRP
  // 268 (25,5-32,5 s): Gesicht 34-54 %, Untertitel 73-83 %
  profhilo: heroClip("hero-profhilo-7s", crop(0.48, [[0.7, 0.86]])),
  // 823 (10-17 s): Gesicht 40-55 %, Untertitel 64-74 %
  skinbooster: heroClip("hero-skinbooster-7s", crop(0.47, [[0.61, 0.77]])),
  // 267 (33-40,5 s): Unterspritzung unter den Augen, Augen bei ~48 %
  lumiEyes: heroClip("hero-lumi-eyes-7s", crop(0.48, [[0.7, 0.86]])),
  // 1090 (7-13,5 s): Gesicht 41-64 %, Untertitel 74-83 %
  vampir: heroClip("hero-vampir-prp-6s", crop(0.5, [[0.71, 0.86]])),
  // Haare
  // 1087 (5,6-12,6 s): Kopfhaut 30-60 %, Untertitel 78-85 %
  haarePrp: heroClip("hero-haare-prp-7s", crop(0.45, [[0.75, 0.88]])),
  // 287 (15-21 s): Behandlung an der Kopfhaut 30-50 %, Untertitel 75-80 %
  haareMeso: heroClip("hero-haare-meso-6s", crop(0.4, [[0.72, 0.83]])),
  // Infusionen
  // 827 (29,5-37 s): Kundin mit Zugang am Arm, Gesicht 45-61 %, Untertitel 75-80 %
  infusion: heroClip("hero-infusion-7s", crop(0.55, [[0.72, 0.83]])),
  // 824 (19-26,5 s): B-Komplex-Infusion, Gesicht 47-58 %, Untertitel 75-79 %
  infusionB: heroClip("hero-infusion-b-7s", crop(0.55, [[0.72, 0.82]])),
};

// 08.10.2026 entfernt: Clips mit eingebranntem "BOTOX" (stirn-karussell-10,
// stirn-karussell-14, feedback-koeln-1, feedback-mr-1, feedback-recklinghausen-1,
// hyperhidrose-karussell-1 - Laienwerbung fuer ein verschreibungspflichtiges
// Mittel, HWG) und mit Ergebnisdarstellung (lippen-karussell-7,
// fio-lippen-2-karussell-12s - Vorher-Nachher-Verbot). Nicht wieder aufnehmen.
// Muskelrelaxans Stirn/Zornesfalte/Kraehenfuesse (Benjamin: dieselben Videos
// fuer alle drei Zonen, wo er sie so markiert hat).
const MR = {
  injectionMan: clip("stirn-karussell-2", 209, "Behandlung: die Zonen werden vorher erklärt"),
  marking: clip("stirn-karussell-8", 831, "Einzeichnen und behandeln"),
  refresh: clip("stirn-karussell-9", 839, "Stirn und Zornesfalte auffrischen"),
  trio: clip("stirn-karussell-6", 266, "Kundinnen nach der Behandlung"),
  firstTime: clip("stirn-karussell-12", 848, "Zum ersten Mal – trotz Angst vor Spritzen"),
  patricia: clip("stirn-karussell-15", 1143, "Krähenfüße und Zornesfalte"),
  zornesMan: clip("zornes-karussell-2", 272, "Behandlung der Zornesfalte"),
  zornesKoeln: clip("zornes-karussell-1", 257, "Auf dem Weg in die Köln Arcaden", "koeln"),
};

// Kundenfeedback (Benjamins Notiz "Kundenfeedback", 01.10.2026), 12 s mit
// Ton; Stadtname im Bild -> nur in dieser Stadt.
const FB = {
  mr2: clip("feedback-mr-2", 862, "Kundin erzählt (Englisch)"),
  mrTrio: MR.trio,
  lippen1: clip("lippen-karussell-9", 1073, "Zwei Cousinen erzählen"),
  prpLeipzig: clip("feedback-leipzig-prp-1", 808, "Kundin in Leipzig", "leipzig"),
  // Strapi 874, 0-10,1 s: endet vor "... originales Botox verwendet", nennt
  // also keine Behandlung - passt auf jede Seite (Benjamin 05.10.2026)
  allgemein: clip("feedback-allgemein-1", 874, "Erster Eindruck: sehr professionell"),
};
const FEEDBACK_MR = [FB.allgemein, FB.mrTrio, FB.mr2];
const FEEDBACK_LIPPEN = [FB.lippen1, FB.allgemein];

const LIPPENKORR = [
  clip("lippenkorr-karussell-1", 206, "Woanders behandelt, jetzt korrigiert"),
  clip("lippenkorr-karussell-2", 206, "Korrektur durch den Arzt"),
];
const LUMI = [
  clip("lumi-karussell-1", 267, "Beratung und Behandlung unter den Augen"),
  clip("lumi-karussell-2", 267, "Kundin vor ihrer Behandlung"),
];
const HAARE = [
  clip("haare-karussell-1", 851, "Behandlung der Kopfhaut"),
  clip("haare-karussell-2", 263, "Ärztin erklärt die Eigenblut-Behandlung"),
];
const INF = {
  power: clip("infusion-karussell-1", 254, "Zwei Kunden bei der Infusion"),
  antiAging: clip("infusion-karussell-2", 827, "Kundin bei der Anti-Aging-Infusion"),
  bKomplex: clip("infusion-karussell-3", 824, "Kundin bei der B-Komplex-Infusion"),
};
const VAMPIR = [
  clip("vampir-karussell-1", 861, "Eigenblut: aufbereiten und behandeln"),
  clip("vampir-karussell-2", 222, "Von der Blutabnahme zur Behandlung"),
];

const CLIPS: Record<string, AdsClipSet> = {
  // ---------------------------------------------------------- Muskelrelaxans
  "muskelrelaxans/stirnfalte": {
    heroes: [H.stirn],
    // Benjamin 07.10.2026: vor allem Frauen als Kundinnen -> Clip mit Mann ans Ende
    carousel: [MR.marking, MR.refresh, MR.trio, MR.injectionMan],
    feedback: FEEDBACK_MR,
  },
  "muskelrelaxans/zornesfalte": {
    heroes: [H.stirn],
    carousel: [MR.marking, MR.firstTime, MR.zornesKoeln, MR.zornesMan],
    feedback: FEEDBACK_MR,
  },
  "muskelrelaxans/kraehenfuesse": {
    heroes: [H.kraehen],
    carousel: [MR.marking, MR.patricia, MR.trio],
    feedback: FEEDBACK_MR,
  },
  "muskelrelaxans/browlift": {
    heroes: [H.browlift],
    carousel: [clip("fio-browlift-1-karussell-12s", "fio-browlift-1", "Einblick in die Browlift-Behandlung")],
    feedback: FEEDBACK_MR,
  },
  "muskelrelaxans/lipflip": {
    heroes: [H.lipflip],
    carousel: [clip("lipflip-karussell-1", 1053, "Lip Flip in Berlin", "berlin")],
    feedback: FEEDBACK_MR,
  },
  // verwandt: Lachfalten liegen wie Kraehenfuesse an den Augen
  "muskelrelaxans/lachfalten": { heroes: [H.kraehen], carousel: [], feedback: FEEDBACK_MR },
  "muskelrelaxans/zaehneknirschen-bruxismus": {
    heroes: [H.masseter],
    carousel: [
      clip("masseter-karussell-5", 1052, "Kundin in den Köln Arcaden", "koeln"),
      clip("masseter-karussell-3", 521, "Aufklärung vor der Behandlung"),
      clip("masseter-karussell-1", 223, "Kundin in Leipzig", "leipzig"),
    ],
    feedback: FEEDBACK_MR,
  },
  // verwandt (kein eigener Clip): Stirn/Zornesfalte, Unterkiefer fuer den Hals
  "muskelrelaxans/full-face-muskelrelaxans": { heroes: [H.stirn], carousel: [], feedback: FEEDBACK_MR },
  "muskelrelaxans/bunny-lines": { heroes: [H.stirn], carousel: [], feedback: FEEDBACK_MR },
  "muskelrelaxans/halsfalten-platysma": { heroes: [H.masseter], carousel: [], feedback: FEEDBACK_MR },
  "muskelrelaxans/erdbeerkinn": {
    heroes: [H.erdbeerkinn],
    carousel: [clip("erdbeer-karussell-1", 277, "Erdbeerkinn: so läuft die Behandlung")],
    feedback: FEEDBACK_MR,
  },
  "muskelrelaxans/barbie-muskelrelaxans": {
    heroes: [H.barbie],
    carousel: [clip("fio-barbie-1-karussell-12s", "fio-barbie-1", "Behandlung am Schultermuskel")],
    feedback: FEEDBACK_MR,
  },
  "muskelrelaxans/hyperhidrose-starkes-schwitzen": {
    heroes: [H.hyperhidrose],
    carousel: [],
    feedback: FEEDBACK_MR,
  },
  // ---------------------------------------------------------------- Hyaluron
  "hyaluron/lippen-aufspritzen": {
    heroes: [H.lippen],
    carousel: [
      clip("lippen-karussell-6", 854, "Direkt nach der Behandlung"),
      clip("lippen-karussell-3", 221, "Die erste Lippenbehandlung", "leipzig"),
      clip("lippen-karussell-2", 217, "Kundin in Mönchengladbach", "moenchengladbach"),
      clip("lippen-karussell-8", 1046, "Warum sie zu uns gewechselt ist"),
      FB.lippen1,
    ],
    feedback: FEEDBACK_LIPPEN,
  },
  "hyaluron/lippenkorrektur": { heroes: [H.lippenkorrektur], carousel: LIPPENKORR, feedback: FEEDBACK_LIPPEN },
  // verwandt: Lippen/Mundpartie und Mittelgesicht
  "hyaluron/plisseefalten": { heroes: [H.lippenInjektion], carousel: [], feedback: FEEDBACK_LIPPEN },
  "hyaluron/marionettenfalten": { heroes: [H.lippenErgebnis], carousel: [], feedback: FEEDBACK_LIPPEN },
  "hyaluron/nasolabialfalte": { heroes: [H.wangen], carousel: [] },
  "hyaluron/full-face-hyaluron": { heroes: [H.wangenPunkte], carousel: [] },
  "hyaluron/augenringe-unterspritzen": { heroes: [H.wangenPunkte], carousel: [] },
  // verwandt: Korrektur einer frueheren Lippenbehandlung
  "hyaluron/hylase": { heroes: [H.lippenkorrektur], carousel: [] },
  "hyaluron/kinnkorrektur": {
    heroes: [H.kinnKL, H.jawErgebnis],
    carousel: [clip("kinn-karussell-1", 523, "Kundin in Recklinghausen", "recklinghausen")],
  },
  "hyaluron/jawline": {
    heroes: [H.jawKoeln, H.jaw],
    carousel: [
      clip("jaw-karussell-1", 215, "Kundin in Köln", "koeln"),
      clip("jaw-karussell-3", 1078, "Behandlung durch Ärztinnen und Ärzte"),
      clip("jaw-karussell-2", 822, "Aufklärung und Beratung"),
    ],
  },
  "hyaluron/wangenaufbau": {
    heroes: [H.wangen],
    carousel: [clip("wangen-karussell-1", 859, "Wangenaufbau mit 0,5 ml Hyaluron")],
  },
  // ------------------------------------------------------------- Skinbooster
  "skinbooster/profhilo": {
    heroes: [H.profhilo],
    carousel: [
      clip("profhilo-karussell-3", 823, "Beratung und Behandlung"),
      clip("profhilo-karussell-2", 268, "Frischekick für die Haut"),
      // Benjamin 05.10.2026: am Desktop vier nebeneinander. Strapi 823,
      // 23,8-36,0 s: nach der Behandlung erzaehlt (ohne Nadel im Bild)
      clip("profhilo-karussell-4", 823, "Direkt nach der Behandlung"),
      // laeuft im "Noch unsicher?"-Bento, nicht in der Reihe
      clip("profhilo-karussell-1", 253, "Endlich wieder frisch fühlen"),
      FB.allgemein,
    ],
  },
  "skinbooster/lumi-eyes-polynukleotide": { heroes: [H.lumiEyes], carousel: LUMI },
  // verwandt: Lumi Eyes sind Polynukleotide unter den Augen
  "skinbooster/polynukleotide-lachssperma": { heroes: [H.lumiEyes], carousel: LUMI },
  // verwandt: Skinbooster-Behandlung im Gesicht (823, ohne Produktnamen)
  "skinbooster/mesotherapie-nctf-135-ha": { heroes: [H.skinbooster], carousel: [] },
  "skinbooster/vampir-lifting-prp": {
    heroes: [H.vampir],
    carousel: VAMPIR,
    feedback: [FB.prpLeipzig],
  },
  // ------------------------------------------------------------------- Haare
  "anti-haarausfall/prp-haartherapie": { heroes: [H.haarePrp], carousel: HAARE },
  "anti-haarausfall/mesotherapie-haare": { heroes: [H.haareMeso], carousel: HAARE },
  // -------------------------------------------------------------- Infusionen
  "infusionen/b-komplex-infusion": { heroes: [H.infusionB], carousel: [INF.bKomplex, INF.power, INF.antiAging] },
  "infusionen/anti-aging-infusion": { heroes: [H.infusion], carousel: [INF.antiAging, INF.power, INF.bKomplex] },
  "infusionen/power-infusion-glutathion": { heroes: [H.infusion], carousel: [INF.power, INF.antiAging, INF.bKomplex] },
  "infusionen/vitamin-c-infusion": { heroes: [H.infusion], carousel: [INF.power, INF.antiAging, INF.bKomplex] },
  "infusionen/immun-infusion": { heroes: [H.infusion], carousel: [INF.power, INF.antiAging, INF.bKomplex] },
  "infusionen/regenerations-infusion": { heroes: [H.infusion], carousel: [INF.power, INF.antiAging, INF.bKomplex] },
  "infusionen/relax-infusion": { heroes: [H.infusion], carousel: [INF.power, INF.antiAging, INF.bKomplex] },
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

const forCity = (city: string) => (c: AdsClip) => !c.city || c.city.toLowerCase() === city;

/**
 * Clips einer Behandlungsseite (pathKey ohne Standort), bereits gefiltert.
 * `citySlug`: Stadt der Seite - Clips mit fremdem Stadtnamen im Bild fallen
 * weg. Volle Videos ohne eigenes Poster ebenso (sie wuerden sonst schon vor
 * dem Tippen laden muessen, um ein Bild zu zeigen). Kundenfeedback ohne die
 * Clips, die schon im Karussell laufen.
 */
/**
 * Allgemeines Kundenvideo (Strapi 874, ohne Behandlungsbezug): fuellt am
 * Desktop kurze Clip-Reihen auf (Benjamin 05.10.2026: lieber vier Videos
 * nebeneinander als eine halb leere Karte), siehe adsV2/Page.vue.
 */
export const ADS_GENERAL_FEEDBACK_CLIP: AdsClip = FB.allgemein;

export function adsClipsFor(
  pathKey: string | null | undefined,
  citySlug?: string | null,
): AdsClipsForPage {
  const set = CLIPS[baseKey(pathKey)];
  if (!set) return { carousel: [], feedback: [] };
  const city = String(citySlug ?? "").toLowerCase();
  // Hero nur mit vermessenem Ausschnitt (focusY) und ohne fremden Stadtnamen.
  const hero = set.heroes
    .filter(adsClipAllowed)
    .filter((c) => typeof c.focusY === "number")
    .find(forCity(city));
  const usable = (list: AdsClip[]) =>
    list
      .filter(adsClipAllowed)
      .filter(forCity(city))
      .filter((c) => adsClipIsShort(c) || !!c.posterUrl);
  const carousel = usable(set.carousel);
  const inCarousel = new Set(carousel.map((c) => c.url));
  return {
    hero,
    carousel,
    feedback: usable(set.feedback ?? []).filter((c) => !inCarousel.has(c.url)),
  };
}

/**
 * Vorschaubilder einer Behandlung (Poster ihres Hero-Clips, dann der
 * Karussell-Clips) fuer Kacheln "Weitere Behandlungen". Die Kacheln nehmen
 * davon das erste, das noch keine andere Kachel zeigt.
 */
export function adsClipPostersFor(
  pathKey: string | null | undefined,
  citySlug?: string | null,
): string[] {
  const { hero, carousel } = adsClipsFor(pathKey, citySlug);
  return [hero, ...carousel].map((c) => c?.posterUrl).filter((u): u is string => !!u);
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

/**
 * "Komm, ich nehme dich mit ins Center" (Benjamin, 02.10.2026): Weg vom
 * Mall-Eingang bis zur Lounge, je Standort (locationSlug). Stumme Kurzclips
 * aus dem Anfang der Standortvideos geschnitten (nur der Weg, ohne die
 * Behandlung danach), fuer "So findest du uns". Geprueft: aktuelles Logo
 * "MY HEALTH & BEAUTY", kein Adventskalender. Fehlende Standorte: siehe
 * Bericht vom 02.10.2026 (kein Material gefunden).
 */
export const ADS_WAY_CLIPS: Record<string, AdsClip> = {
  // Strapi 34, 0,2-14,2 s: Haupteingang Aquis Plaza -> Untergeschoss -> Empfang
  "aquis-plaza": {
    url: "/videos/go/weg-aachen-aquis-plaza.mp4",
    posterUrl: "/videos/go/weg-aachen-aquis-plaza-poster.jpg",
    caption: "Vom Haupteingang zu uns ins Untergeschoss",
    source: 34,
  },
  // Strapi 522, 10,0-24,5 s: Fussgaengerzone -> Eingang K in Lautern -> Gang ->
  // Rolltreppe ins Untergeschoss -> Empfang (ersetzt 206, das nur bis zum Gang reichte)
  "k-in-lautern": {
    url: "/videos/go/weg-kaiserslautern-k-in-lautern.mp4",
    posterUrl: "/videos/go/weg-kaiserslautern-k-in-lautern-poster.jpg",
    caption: "Vom Eingang zu uns ins Untergeschoss",
    source: 522,
  },
  // Strapi 211, 0,2-12,2 s: Rundgang ab dem Eingang der Lounge im Palais Vest
  "palais-vest": {
    url: "/videos/go/weg-recklinghausen-palais-vest.mp4",
    posterUrl: "/videos/go/weg-recklinghausen-palais-vest-poster.jpg",
    caption: "Ein Blick in unser Center im Palais Vest",
    source: 211,
  },
  // Strapi 257, 9,0-19,0 s: Koeln Arcaden -> Rolltreppe ein Stockwerk tiefer -> Empfang
  // (nicht laenger: ab 29 s steht im Quellvideo das alte Logo im Bild)
  "koeln-arcaden": {
    url: "/videos/go/weg-koeln-arcaden.mp4",
    posterUrl: "/videos/go/weg-koeln-arcaden-poster.jpg",
    caption: "Vom Eingang zu uns ein Stockwerk tiefer",
    source: 257,
  },
  // Strapi 224 (Datei aus der Dublette 521), 0-11,5 s: Hoefe am Bruehl -> Rolltreppe
  // ins Untergeschoss -> Empfang links
  "hoefe-am-bruehl": {
    url: "/videos/go/weg-leipzig-hoefe-am-bruehl.mp4",
    posterUrl: "/videos/go/weg-leipzig-hoefe-am-bruehl-poster.jpg",
    caption: "Vom Eingang zu uns ins Untergeschoss",
    source: 224,
  },
  // Strapi 520, 0-11,0 s: Gesundbrunnencenter -> Rolltreppe ins Obergeschoss -> Empfang
  gesundbrunnencenter: {
    url: "/videos/go/weg-berlin-gesundbrunnencenter.mp4",
    posterUrl: "/videos/go/weg-berlin-gesundbrunnencenter-poster.jpg",
    caption: "Vom Eingang zu uns ins Obergeschoss",
    source: 520,
  },
  // Strapi 217, 3,0-10,5 s: Minto -> durch die Mall -> Empfang
  minto: {
    url: "/videos/go/weg-moenchengladbach-minto.mp4",
    posterUrl: "/videos/go/weg-moenchengladbach-minto-poster.jpg",
    caption: "Vom Eingang durch das Minto zu uns",
    source: 217,
  },
};

export function adsWayClipFor(locationSlug: string | null | undefined): AdsClip | null {
  const clip = ADS_WAY_CLIPS[String(locationSlug ?? "")];
  return clip && adsClipAllowed(clip) ? clip : null;
}

/**
 * Lounge-Galerie je Standort (locationSlug), wenn die Seite in Strapi keinen
 * eigenen Galerie-Block hat (der Strapi-Block bleibt die bevorzugte Quelle,
 * Page.vue). Gesucht am 02.10.2026 in der ganzen Strapi-Medienbibliothek
 * (974 Bilder) und im Material der Sitzung. Das Fotoshooting
 * "2026_MYHB_Tag1-3" (112 Bilder) hat keine Standortangabe; die Alt-Texte
 * nennen Staedte nur als SEO-Zusatz und widersprechen sich. Zuordnung
 * deshalb nur ueber den Bildinhalt gegen das Weg-Video des Standorts.
 * Jedes Bild angesehen: aktuelles Logo bzw. keins, kein "MYH&B", keine Nadel.
 */
export type AdsLoungeImage = {
  id: number;
  url: string;
  width: number;
  height: number;
  mime: string;
};

export type AdsLoungeGallery = {
  images: readonly AdsLoungeImage[];
  /** Woher die Zuordnung zum Standort stammt. */
  source: string;
  /** false = Zuordnung nur wahrscheinlich, vor dem Merge bestaetigen lassen. */
  confirmed: boolean;
  /** Bilder (ids) in dieser Reihenfolge zuerst, der Rest danach. */
  order?: readonly number[];
};

export const ADS_LOUNGE_GALLERY: Record<string, AdsLoungeGallery> = {
  // Strapi 79: dunkelgraue Grossfliesen mit hellem Rand, Alcove-Sofa,
  // schwarzes USM-Sideboard - wie am Ende des Koelner Weg-Videos (Strapi
  // 257). UNBESTAETIGT, darum nur in der neutralen Galerie. Strapi 114
  // (Empfang unter offener Decke) seit 03.10.2026 raus (Michael).
  "koeln-arcaden": {
    images: [
      { id: 79, url: "https://media.myhb.app/sofa_my_lounge_8abdcf62d3.jpg", width: 3024, height: 4032, mime: "image/jpeg" },
    ],
    source: "Bildinhalt gegen Weg-Video Strapi 257",
    confirmed: false,
    // Michael, 03.10.2026: der weisse Empfang mit Wandlogo (1022) zuerst
    order: [1022, 79],
  },
  // Parya's Galerie "MY Lounge Duesseldorf" (Strapi-Block auf Profhilo
  // Duesseldorf Arcaden, Stand 02.10.2026 nachmittags; inzwischen dort
  // entfernt). Zuordnung von Parya.
  "duesseldorf-arcaden": {
    images: [
      { id: 1040, url: "https://media.myhealthandbeauty.app/2026_MYHB_Tag2_01_1_e0b49e246f.webp", width: 7216, height: 4806, mime: "image/webp" },
      { id: 1035, url: "https://media.myhealthandbeauty.app/2026_MYHB_Tag3_44_7376ce11f2.webp", width: 8144, height: 5424, mime: "image/webp" },
      { id: 1022, url: "https://media.myhealthandbeauty.app/2026_MYHB_Tag3_34_ebf7060f7d.webp", width: 8144, height: 5424, mime: "image/webp" },
      { id: 1014, url: "https://media.myhealthandbeauty.app/2026_MYHB_Tag2_114_5f7edfd46f.webp", width: 8368, height: 5584, mime: "image/webp" },
      { id: 1009, url: "https://media.myhealthandbeauty.app/2026_MYHB_Tag2_105_03ed4c1626.webp", width: 8368, height: 5584, mime: "image/webp" },
      { id: 985, url: "https://media.myhealthandbeauty.app/2026_MYHB_Tag2_18_c8f564feac.webp", width: 8144, height: 5424, mime: "image/webp" },
      { id: 981, url: "https://media.myhealthandbeauty.app/2026_MYHB_Tag1_78_4436aca9ab.webp", width: 4649, height: 6974, mime: "image/webp" },
    ],
    source: "Strapi-Galerieblock von Parya (Profhilo Duesseldorf)",
    confirmed: true,
  },
};

/** Ueberschrift, wenn der Standort keine sicher eigenen Fotos hat. */
export const ADS_LOUNGE_NEUTRAL_HEADLINE = "Einblicke in unsere MY Lounges";

/**
 * Allgemeine Lounge-/Team-Fotos (Benjamin, 02.10.2026: fuer Standorte ohne
 * sicher eigene Fotos ok, dann mit neutraler Ueberschrift und Alt-Texten
 * ohne Ort). Aus Parya's Duesseldorfer Auswahl, ohne sichtbaren Ortsnamen.
 */
// Michael, 03.10.2026: der weisse Empfang mit Wandlogo (1022) zuerst.
const ADS_LOUNGE_GENERAL_IDS: readonly number[] = [1022, 1040, 1035, 1009, 985];

export type AdsLoungeSelection = {
  images: readonly AdsLoungeImage[];
  /** true = sicher eigene Fotos des Standorts ("MY Lounge <Stadt>"). */
  own: boolean;
};

/**
 * Galerie fuer den Standort: sicher eigene Fotos (confirmed) mit Ortsnamen;
 * sonst neutral - zuerst die wahrscheinlichen eigenen Bilder (z. B. Koeln
 * 114/79, unbestaetigt), dann die allgemeinen, zusammen hoechstens 7.
 */
export function adsLoungeGalleryFor(locationSlug: string | null | undefined): AdsLoungeSelection {
  const g = ADS_LOUNGE_GALLERY[String(locationSlug ?? "")] ?? null;
  if (g?.confirmed) return { images: g.images, own: true };
  const pool = ADS_LOUNGE_GALLERY["duesseldorf-arcaden"]?.images ?? [];
  const general = ADS_LOUNGE_GENERAL_IDS.flatMap((id) => pool.filter((img) => img.id === id));
  const seen = new Set<number>();
  let images = [...(g?.images ?? []), ...general].filter((img) => !seen.has(img.id) && seen.add(img.id));
  const order = g?.order ?? [];
  if (order.length) {
    const rank = (id: number) => (order.includes(id) ? order.indexOf(id) : order.length);
    images = [...images].sort((a, b) => rank(a.id) - rank(b.id));
  }
  images = images.slice(0, 7);
  return { images, own: false };
}

/**
 * Kundinnen-Video als Kachel im "Noch unsicher?"-Bento (Benjamin,
 * 03.10.2026; nur CI-Gestaltung). Es laeuft dann nicht zusaetzlich in der
 * Clip-Reihe oben bzw. bei den Bewertungen (Page.vue filtert es dort heraus).
 * - Profhilo: Strapi 253 "Endlich wieder frisch" (Kundin erzaehlt)
 * - Lippen: Strapi 1073 "Zwei Cousinen erzaehlen" (Lippen-Feedback)
 */
const OBJECTION_CLIP_URLS: Record<string, string> = {
  "skinbooster/profhilo": "/videos/go/profhilo-karussell-1.mp4",
  "hyaluron/lippen-aufspritzen": "/videos/go/lippen-karussell-9.mp4",
};

export function adsObjectionClipFor(
  pathKey: string | null | undefined,
  citySlug?: string | null,
): AdsClip | null {
  const key = baseKey(pathKey);
  const url = OBJECTION_CLIP_URLS[key];
  const set = CLIPS[key];
  if (!url || !set) return null;
  const c = [...set.carousel, ...(set.feedback ?? [])].find((x) => x.url === url);
  if (!c || !adsClipAllowed(c) || !forCity(String(citySlug ?? "").toLowerCase())(c)) return null;
  return c;
}

/**
 * Bilder fuer "So laeuft deine Behandlung ab" in drei Schritten (Vor /
 * Waehrend / Nachsorge), Benjamin 03.10.2026: Parya's Bilder (Profhilo
 * Duesseldorf) bzw. dasselbe Shooting "2026_MYHB_Tag1-3". Jedes Bild
 * angesehen: aktuelles Logo, kein "MYH&B", keine Nadel/kein Einstich im Bild.
 * Alt-Texte eigene, ohne Ort.
 */
const PI = (id: number, url: string, width: number, height: number, alt: string): AdsLoungeImage & { alt: string } => ({
  id, url, width, height, mime: "image/webp", alt,
});
const PROCESS_VOR = PI(1033, "https://media.myhealthandbeauty.app/2026_MYHB_Tag2_110_1f5ec7c29b.webp", 8368, 5584, "Beratungsgespräch in der Lounge");
const ADS_PROCESS_IMAGES: Record<string, ReadonlyArray<AdsLoungeImage & { alt: string }>> = {
  // Parya: Beratung (1033), Team (985); Waehrend: Haut wird abgetastet (996)
  default: [
    PROCESS_VOR,
    PI(996, "https://media.myhealthandbeauty.app/2026_MYHB_Tag2_120_6e84fb584d.webp", 8368, 5584, "Arzt tastet vor der Behandlung die Haut ab"),
    PI(985, "https://media.myhealthandbeauty.app/2026_MYHB_Tag2_18_c8f564feac.webp", 8144, 5424, "Ärztinnen und Arzt von MY HEALTH & BEAUTY"),
  ],
  "hyaluron/lippen-aufspritzen": [
    PROCESS_VOR,
    PI(1049, "https://media.myhealthandbeauty.app/2026_MYHB_Tag2_130_1_50aeef5683.webp", 7816, 5216, "Ärztin und Kundin prüfen die Lippen im Spiegel"),
    PI(999, "https://media.myhealthandbeauty.app/2026_MYHB_Tag2_134_4d5a9103df.webp", 8368, 5584, "Kundin und Ärztin nach der Behandlung"),
  ],
};

export function adsProcessImagesFor(pathKey: string | null | undefined) {
  return ADS_PROCESS_IMAGES[baseKey(pathKey)] ?? ADS_PROCESS_IMAGES.default!;
}

/**
 * Grosses Aerztinnen-Foto je Standort fuer den Aerzte-Block (Benjamin,
 * 03.10.2026). Nur Aerzt:innen, die in Strapi diesem Standort zugeordnet
 * sind (Strapi employees.locations, Stand 03.10.2026; bevorzugt nur diesem
 * Standort zugeordnet), Foto jeweils das Strapi-Foto der Person, angesehen:
 * aktuelles Logo, kein "MYH&B". Berlin und Leipzig: niemand mit Foto;
 * Kaiserslautern: nur "Aerztin.png" (anderer Stil, nicht als Mariam
 * belegt). Dort kein Eintrag - der Block steht nur mit Text.
 */
/**
 * Bundesweite Seiten (www, Meta): Beratungsgespraech aus dem Shooting
 * (Parya, 1009; Aerztin und Kundin, kein Ort, keine einzelne Aerztin
 * benannt). Das Teamfoto 985 steht dort schon im Ablauf.
 */
export const ADS_TEAM_FEATURE: { image: AdsLoungeImage; name: string } = {
  image: { id: 1009, url: "https://media.myhealthandbeauty.app/2026_MYHB_Tag2_105_03ed4c1626.webp", width: 8368, height: 5584, mime: "image/webp" },
  name: "Kostenlose Beratung",
};

export const ADS_DOCTOR_FEATURE: Record<string, { image: AdsLoungeImage; name: string }> = {
  "koeln-arcaden": {
    image: { id: 948, url: "https://media.myhealthandbeauty.app/98/2026_MYHB_Tag1_55_1_904a1c842f.webp", width: 5424, height: 5952, mime: "image/webp" },
    name: "Ärztin Iqra",
  },
  // Strapi employee 858, nur Duesseldorf
  "duesseldorf-arcaden": {
    image: { id: 949, url: "https://media.myhealthandbeauty.app/2026_MYHB_Tag1_63_1_07baed1afc.webp", width: 5395, height: 5732, mime: "image/webp" },
    name: "Ärztin Noura",
  },
  // Strapi employee 855, nur Moenchengladbach
  minto: {
    image: { id: 941, url: "https://media.myhealthandbeauty.app/98/2026_MYHB_Tag1_50_1_70ce7e8386.webp", width: 5237, height: 5771, mime: "image/webp" },
    name: "Ärztin Ricarda",
  },
  // Strapi employee 854, nur Recklinghausen
  "palais-vest": {
    image: { id: 1018, url: "https://media.myhealthandbeauty.app/2026_MYHB_Tag3_4_d36ef735c7.webp", width: 7805, height: 5198, mime: "image/webp" },
    name: "Arzt Ruben",
  },
  // Strapi employee 760, Duisburg und Recklinghausen
  forum: {
    image: { id: 1019, url: "https://media.myhealthandbeauty.app/2026_MYHB_Tag3_6_1_ea6ad4569e.webp", width: 7882, height: 5249, mime: "image/webp" },
    name: "Arzt Mirza-Haras",
  },
  // Strapi employee 756, nur Aachen
  "aquis-plaza": {
    image: { id: 969, url: "https://media.myhealthandbeauty.app/98/2026_MYHB_Tag2_21_1_9926822185.webp", width: 7676, height: 5112, mime: "image/webp" },
    name: "Ärztin Avin",
  },
};
