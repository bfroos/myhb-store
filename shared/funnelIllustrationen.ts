/**
 * Kopf-Illustrationen fuer die Antwort-Kacheln im Anfrage-Funnel
 * (E28, aus Michaels Entwurf "LP Haartransplantation", 21.10.2026).
 * Pfade im 100x100-Raster; die Komponente zeichnet Gesicht, Hals und
 * Schultern selbst und legt diese Haar-Pfade darueber.
 */

export type FunnelIllustration = {
  /** Haar am Hinterkopf (nur Frauen-Varianten). */
  back?: string;
  hair: string;
  hairOpacity: number;
  /** Hautfarbene Flaeche ueber dem Haar (z. B. breiter Scheitel). */
  skin?: string;
  /** Pfeil, der auf die betroffene Stelle zeigt. */
  arrow: string;
};

const BACK_LANG =
  "M27 50 C24 22 38 12 50 12 C62 12 76 22 73 50 C75 66 78 84 82 100 L18 100 C22 84 25 66 27 50 Z";

export const FUNNEL_ILLUSTRATIONEN: Record<string, FunnelIllustration> = {
  scheitel: {
    back: BACK_LANG,
    hair: "M29 52 C27 27 37 15 45 13.5 C43 20 41 26 35 30 C31.5 36 30 43 29 52 Z M71 52 C73 27 63 15 55 13.5 C57 20 59 26 65 30 C68.5 36 70 43 71 52 Z",
    hairOpacity: 1,
    skin: "M45 13.5 L55 13.5 L51.6 31 L48.4 31 Z",
    arrow: "M50 0.5 L50 10.5 M50 10.5 l-3 -3 M50 10.5 l3 -3",
  },
  haaransatz: {
    back: BACK_LANG,
    hair: "M29 52 C27 27 37 13 49.5 12 C47 15 42 17 37 19 C32 24 30 38 29 52 Z M71 52 C73 27 63 13 50.5 12 C53 15 58 17 63 19 C68 24 70 38 71 52 Z",
    hairOpacity: 1,
    arrow: "M38 22 Q50 16 62 22 M38 22 l2.8 -.2 M38 22 l1.1 -2.5 M62 22 l-2.8 -.2 M62 22 l-1.1 -2.5",
  },
  schlaefen: {
    back: BACK_LANG,
    hair: "M29 52 C27 27 37 15 49 13.5 C47 20 42 25 38 27 C35 28 33 31 31.5 36 C30.5 41 29.5 46 29 52 Z M71 52 C73 27 63 15 51 13.5 C53 20 58 25 62 27 C65 28 67 31 68.5 36 C69.5 41 70.5 46 71 52 Z",
    hairOpacity: 1,
    arrow: "M33 23 q-3 4 -1 9 M31.5 29.5 l.5 2.6 l2.4 -1.3 M67 23 q3 4 1 9 M68.5 29.5 l-.5 2.6 l-2.4 -1.3",
  },
  duenner: {
    back: BACK_LANG,
    hair: "M29 52 C27 27 37 15 49 13.5 C47 20 41 26 35 30 C31.5 36 30 43 29 52 Z M71 52 C73 27 63 15 51 13.5 C53 20 59 26 65 30 C68.5 36 70 43 71 52 Z",
    hairOpacity: 0.55,
    arrow: "M38 9 Q50 3 62 9 M62 9 l-2.8 -.4 M62 9 l-.9 -2.6",
  },
  geheimratsecken: {
    hair: "M29 50 C26 24 38 14 50 14 C62 14 74 24 71 50 C70 42 68 36 65 33 C63 31 61 25 57 26 C54 28 46 28 43 26 C39 25 37 31 35 33 C32 36 30 42 29 50 Z",
    hairOpacity: 1,
    arrow: "M35 21 q-3 4 -1 9 M33.5 27.5 l0.5 2.6 l2.4 -1.3 M65 21 q3 4 1 9 M66.5 27.5 l-0.5 2.6 l-2.4 -1.3",
  },
  tonsur: {
    hair: "M29 50 C26 24 38 14 50 14 C62 14 74 24 71 50 C70 40 67 33 62 30 C57 31 43 31 38 30 C33 33 30 40 29 50 Z",
    hairOpacity: 1,
    skin: "M40 19 a10 5.5 0 1 0 20 0 a10 5.5 0 1 0 -20 0 Z",
    arrow: "M37 11 Q50 4 63 11 M63 11 l-2.8 -0.4 M63 11 l-0.9 -2.6",
  },
  oberkopf: {
    hair: "M29.5 55 C27 44 28.5 35 33 29.5 C33.5 33 33 37 34 41 C34.6 45 35.4 50 35.6 55 Z M70.5 55 C73 44 71.5 35 67 29.5 C66.5 33 67 37 66 41 C65.4 45 64.6 50 64.4 55 Z",
    hairOpacity: 1,
    arrow: "M36 13 Q50 5 64 13 M36 13 l2.8 -0.4 M36 13 l0.9 -2.6 M64 13 l-2.8 -0.4 M64 13 l-0.9 -2.6",
  },
  licht: {
    hair: "M29 50 C26 24 38 14 50 14 C62 14 74 24 71 50 C70 40 67 33 62 30 C57 31 43 31 38 30 C33 33 30 40 29 50 Z M36 30 C40 24 46 20 50 19 M42 30 C45 24 49 21 54 20 M48 30 C51 24 56 21 61 22 M55 30 C58 26 62 24 66 27",
    hairOpacity: 0.55,
    arrow: "M38 11 Q50 5 62 11 M62 11 l-2.8 -0.4 M62 11 l-0.9 -2.6",
  },
};

export function funnelIllustration(key?: string | null): FunnelIllustration | null {
  return key ? (FUNNEL_ILLUSTRATIONEN[key] ?? null) : null;
}
