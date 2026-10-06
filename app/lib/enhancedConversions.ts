/**
 * Erweiterte Conversions fuer Google Ads (myhb-app/myhb-os#637).
 *
 * Der Kauf-Upload der App (google-ads-offline-conversions) meldet bezahlte
 * Behandlungen mit gehashter E-Mail und Telefonnummer. Google ordnet sie einer
 * Anzeige nur zu, wenn dieselbe Kundin schon bei der Buchung mit denselben
 * Hashes am Ads-Tag ankam (GTM Tag 44 "Dankesseite Calendly"). Deshalb
 * normalisiert diese Datei EXAKT wie der Upload:
 * - E-Mail: getrimmt, klein (normalizeEmail in
 *   myhb-os supabase/functions/_shared/googleAdsConversions.ts)
 * - Telefon: E.164 mit "+", deutsche Vorwahl als Standard — wortgleiche Kopie
 *   von toE164 aus myhb-os supabase/functions/_shared/phone.ts (Stand
 *   06.10.2026). Aendert sich dort etwas, hier nachziehen; der Test prueft
 *   dieselben Faelle wie myhb-os src/lib/enhancedConversions.test.ts.
 *
 * In die Datenschicht gehen nur Hashes, nie Klardaten.
 */

const DEFAULT_COUNTRY_DIAL_CODE = "49";

const DE_MOBIL_NATIONAL = /^1(5[12579]|6[023]|7\d)\d{7,8}$/;

const istMoeglicheNanpNummer = (national: string): boolean =>
  /^[2-9][0-8]\d[2-9]\d{6}$/.test(national) &&
  !/^\d11/.test(national) &&
  !/^\d{3}\d11/.test(national);

const deutscheMobilnummerHinterUs = (e164: string): string | null => {
  const m = /^\+1(\d+)$/.exec(e164);
  if (!m) return null;
  // "+1" + "1762…" (Vorwahlfeld +1 und die Nummer ohne Null dahinter) traegt
  // die deutsche "1" schon selbst; sonst hat das "+" die "0" ersetzt und die
  // "1" der Vorwahl ist die erste Ziffer der deutschen Nummer.
  const deutsch = m[1].startsWith("1") ? m[1] : `1${m[1]}`;
  return DE_MOBIL_NATIONAL.test(deutsch) ? `+49${deutsch}` : null;
};

const repariereDeutscheMobilnummerAlsUs = (e164: string): string => {
  const m = /^\+1(\d+)$/.exec(e164);
  if (!m || istMoeglicheNanpNummer(m[1])) return e164;
  return deutscheMobilnummerHinterUs(e164) ?? e164;
};

const toE164 = (raw: string | null | undefined): string | null => {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  const all = trimmed.replace(/\D/g, "");
  if (!all) return null;

  let digits: string;
  if (trimmed.startsWith("+")) {
    digits = all;
    // "+49 0176…" — Vorwahlfeld plus Nummer mit Verkehrsnull (book-with-phone
    // setzt dial_code und Eingabe so zusammen). Hinter +49 steht nie eine 0.
    if (digits.startsWith(`${DEFAULT_COUNTRY_DIAL_CODE}0`)) {
      digits = DEFAULT_COUNTRY_DIAL_CODE + digits.slice(DEFAULT_COUNTRY_DIAL_CODE.length).replace(/^0+/, "");
    }
    // "+0177…" — "+" vor der nationalen Schreibweise (#287). Keine
    // Landesvorwahl beginnt mit 0; "+00…" ist die Auslandsvorwahl.
    if (digits.startsWith("00")) digits = digits.slice(2);
    else if (digits.startsWith("0")) digits = DEFAULT_COUNTRY_DIAL_CODE + digits.slice(1);
  } else if (all.startsWith("00")) {
    digits = all.slice(2);
  } else if (all.startsWith(DEFAULT_COUNTRY_DIAL_CODE) && all.length > DEFAULT_COUNTRY_DIAL_CODE.length) {
    // Die Vorwahl steht schon da — kein zweites Mal davor (#66).
    const rest = all.slice(DEFAULT_COUNTRY_DIAL_CODE.length);
    digits = rest.startsWith("0") ? DEFAULT_COUNTRY_DIAL_CODE + rest.replace(/^0+/, "") : all;
  } else {
    digits = DEFAULT_COUNTRY_DIAL_CODE + all.replace(/^0/, "");
  }

  if (digits.length < 8 || digits.length > 15) return null;
  return repariereDeutscheMobilnummerAlsUs(`+${digits}`);
};

export const normalizeEmail = (raw: string | null | undefined): string | null => {
  const v = (raw ?? "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : null;
};

export const normalizePhone = (raw: string | null | undefined): string | null => toE164(raw);

export const sha256Hex = async (input: string): Promise<string> => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

export interface HashedUserData {
  sha256_email_address?: string;
  sha256_phone_number?: string;
}

/** Gehashte Kontaktdaten in den Feldnamen der GTM-Variable "Vom Nutzer bereitgestellte Daten". */
export const hashedUserData = async (contact: {
  email?: string | null;
  phone?: string | null;
}): Promise<HashedUserData> => {
  const out: HashedUserData = {};
  const email = normalizeEmail(contact.email);
  if (email) out.sha256_email_address = await sha256Hex(email);
  const phone = normalizePhone(contact.phone);
  if (phone) out.sha256_phone_number = await sha256Hex(phone);
  return out;
};
