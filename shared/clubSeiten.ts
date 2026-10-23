/**
 * Seiten „MY Club" (/club) und „Beauty-Sparbuch" (/beauty-sparbuch).
 *
 * Inhalt: Eckpunkte vom 21.10.2026 (Michael und Hessam, Treueprogramm-Rechner,
 * myhb-os docs/treueprogramm-stufen-2026-10-21.md) und das Sparbuch-Konzept
 * (myhb-os PR #1187). Alle Zahlen stehen nur hier; die Seiten rechnen nichts
 * selbst aus, ausser dem Rechenbeispiel.
 *
 * Wortwahl Sparbuch (Konzept Kap. 3): nie „Zinsen", „Einlage", „Rendite" und
 * „Bank" im Namen (§ 39 KWG). Neben jedem Prozent steht der Pflichtsatz
 * SPARBUCH_PFLICHTSATZ.
 */
export const APP_URL = "https://app.myhealthandbeauty.com/";

export type ClubLinkOrt =
  | "header"
  | "footer"
  | "mobilmenue"
  | "myclub-block"
  | "preise"
  | "club-seite"
  | "sparbuch-seite";

export function appUrl(ort: ClubLinkOrt, kampagne: "club" | "sparbuch"): string {
  const url = new URL(APP_URL);
  url.searchParams.set("utm_source", "website");
  url.searchParams.set("utm_medium", ort);
  url.searchParams.set("utm_campaign", kampagne);
  return url.toString();
}

/**
 * Schalter `NUXT_PUBLIC_CLUB_SEITEN`. Leer/unbekannt = AUS: Die Seiten sind
 * dann `noindex` und nirgends verlinkt; Header, Footer und der MY-Club-Block
 * zeigen wie bisher auf die App. Auf Vercel-Previews ist er an (nuxt.config).
 * Einschalten erst, wenn Stufen und Sparbuch in der App wirklich laufen.
 */
export function isClubSeitenEnabled(raw: unknown): boolean {
  const wert = String(raw ?? "").trim().toLowerCase();
  return wert === "on" || wert === "1" || wert === "true" || wert === "yes";
}

export type Stufe = {
  name: string;
  /** Umsatz in den letzten 36 Monaten, ab dem die Stufe gilt (€). */
  ab: number | null;
  cashbackProzent: number;
  geburtstagEuro: number;
  geschenkEuro: number | null;
  sparbuchBonusProzent: number;
  aktionen: boolean;
  wunscharzt: boolean;
  bevorzugterService: boolean;
};

export const STATUS_FENSTER_MONATE = 36;

// Benjamin 21.10.2026, abweichend vom Rechner: Basic behaelt 1 % Cashback wie
// seit 19.10.2026 fuer alle, White 1,5 % (statt 0 / 1 %), kein Startguthaben.
// Benjamin 23.10.2026 (nach Michaels Mail-Werkstatt): Wunscharzt schon ab WHITE,
// Status-Namen in Versalien, der Geburtstagsbonus wird nicht genannt (Ueberraschung).

export const STUFEN: Stufe[] = [
  { name: "BASIC", ab: null, cashbackProzent: 1, geburtstagEuro: 10, geschenkEuro: null, sparbuchBonusProzent: 6, aktionen: false, wunscharzt: false, bevorzugterService: false },
  { name: "WHITE", ab: 1000, cashbackProzent: 1.5, geburtstagEuro: 20, geschenkEuro: 50, sparbuchBonusProzent: 7, aktionen: false, wunscharzt: true, bevorzugterService: false },
  { name: "GREY", ab: 3000, cashbackProzent: 2, geburtstagEuro: 30, geschenkEuro: 100, sparbuchBonusProzent: 8, aktionen: true, wunscharzt: true, bevorzugterService: true },
  { name: "BLACK", ab: 5000, cashbackProzent: 3, geburtstagEuro: 50, geschenkEuro: 200, sparbuchBonusProzent: 9, aktionen: true, wunscharzt: true, bevorzugterService: true },
];

export const CLUB = {
  empfehlungEuro: 50,
  /**
   * Jedes Bonusguthaben (auch der Sparbuch-Bonus) gilt ab Gutschrift so lange,
   * und wer so lange nicht da war, verliert alles Bonusguthaben (Benjamin
   * 21.10.2026, am 23.10.2026 von 12 auf 36 Monate). Eingezahltes Geld verfaellt nie.
   */
  bonusGueltigMonate: 36,
  verfallOhneBesuchMonate: 36,
  loloyalPunkteJeEuro: 100,
};

export const SPARBUCH = {
  mindestRate: 10,
  schrittRate: 10,
  obergrenze: 1000,
  mindestlaufzeitMonate: 3,
  widerrufTage: 14,
  beispielRate: 50,
  beispielMonate: 12,
};

export const SPARBUCH_PFLICHTSATZ =
  "Beauty-Bonus im Jahr auf dein eingezahltes Guthaben, jeden Monat als Bonusguthaben gutgeschrieben. Nicht auszahlbar, nur bei MY HEALTH & BEAUTY einlösbar. Kein Bankprodukt, keine Einlagensicherung.";

/**
 * Rechenbeispiel: gleiche Rate jeden Monat, Bonus am Monatsende auf das
 * eingezahlte Guthaben (ein Zwölftel des Jahressatzes), kein Bonus auf Bonus.
 * Der halbe erste Monat aus dem Konzept bleibt aussen vor, darum „rund".
 */
export function sparbuchBeispiel(prozentImJahr: number) {
  const { beispielRate: rate, beispielMonate: monate } = SPARBUCH;
  let eingezahlt = 0;
  let bonus = 0;
  for (let m = 1; m <= monate; m++) {
    eingezahlt = Math.min(eingezahlt + rate, SPARBUCH.obergrenze);
    bonus += (eingezahlt * prozentImJahr) / 100 / 12;
  }
  return { eingezahlt, bonus: Math.round(bonus * 100) / 100 };
}

export function prozent(wert: number): string {
  return `${wert.toLocaleString("de-DE", { maximumFractionDigits: 1 })} %`;
}

export function euro(betrag: number): string {
  return betrag.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(betrag) ? 0 : 2,
  });
}
