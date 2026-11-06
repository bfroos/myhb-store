/**
 * Wer sieht den 20-%-Neukundenrabatt auf der Website? (Benjamin 06.11.2026)
 *
 * Nur wer über eine Werbeanzeige kommt, die den Code zeigt. Seit 05.11.2026
 * wirbt nur noch Meta mit dem Rabatt, Google nicht mehr (#2042,
 * ADS_NO_DISCOUNT). Vorher sah jeder www-Besucher „20 % Rabatt sichern“:
 * gemessen am 06.11.2026 auf 602 von 782 www-Seiten, und die Hälfte der
 * Anmeldungen seit 20.10. kam ohne Anzeigen-Klick (503 aus der Google-Suche).
 *
 * Berechtigt ist, wer in dieser Sitzung oder im gespeicherten Stempel
 * (myhb_attribution, first oder last) eine bezahlte Meta-Berührung hat:
 * - fbclid, aber nicht aus dem Link im Instagram-Profil (utm_medium social,
 *   social_organic, organic; gleiche Regel wie termine.sql in myhb-os), oder
 * - utm_source facebook/instagram/meta/fb/ig mit bezahltem utm_medium.
 *
 * Reine Funktion ohne Browserzugriff, damit sie im Unit-Test läuft.
 */
export type Beruehrung = {
  utm_source?: string;
  utm_medium?: string;
  fbclid?: string;
};

const META_QUELLEN = new Set(["facebook", "fb", "instagram", "ig", "meta", "facebook.com"]);
const ORGANISCH = new Set(["social", "social_organic", "organic"]);
const BEZAHLT = new Set(["paid", "paid_social", "paidsocial", "cpc", "ppc", "social_paid"]);

const klein = (s: string | undefined) => String(s ?? "").trim().toLowerCase();

export function istBezahlteMetaBeruehrung(t: Beruehrung | null | undefined): boolean {
  if (!t) return false;
  const quelle = klein(t.utm_source);
  const medium = klein(t.utm_medium);
  if (t.fbclid && !ORGANISCH.has(medium)) return true;
  return META_QUELLEN.has(quelle) && BEZAHLT.has(medium);
}

export function rabattBerechtigt(
  gespeichert: { first?: Beruehrung; last?: Beruehrung } | null | undefined,
  jetzt?: Beruehrung | null,
): boolean {
  return (
    istBezahlteMetaBeruehrung(jetzt) ||
    istBezahlteMetaBeruehrung(gespeichert?.last) ||
    istBezahlteMetaBeruehrung(gespeichert?.first)
  );
}
