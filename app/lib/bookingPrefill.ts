/**
 * Vorbefuellung der Calendly-Buchung nach dem Rabatt-Dialog (07.10.2026).
 *
 * Wer im Rabatt-Dialog E-Mail und Handynummer eingibt, musste sie im Calendly-
 * Formular ein zweites Mal tippen. Calendly liest dafuer Query-Parameter:
 * `email` und `a1` (= answer_1, die Telefon-Pflichtfrage der Standorte).
 *
 * Die Werte leben nur im Speicher (Dialogdaten) und gehen ausschliesslich in
 * die Calendly-URL des Widgets bzw. den Notausgang "In neuem Tab oeffnen" —
 * nie in dataLayer/GTM, nie in Storage. Die App-Buchung (app.myhealthandbeauty
 * .com/book-appointment) kennt keine Klartext-Vorbefuellung per Query, nur
 * `?lead=<token>`; den Token legt lib/bookingLead.ts an und er reist hier als
 * `leadToken` mit.
 *
 * Laeuft mit `npm run test:unit` (keine Nuxt-Importe).
 */

export type BookingPrefill = {
  email?: string;
  phone?: string;
  /** Token fuer `?lead=` an der App-URL (lib/bookingLead.ts), sonst leer. */
  leadToken?: string;
};

/**
 * Handynummer in das Format, das die Calendly-Telefonfrage erwartet:
 * Laendervorwahl, Leerzeichen, Rest — z. B. "0171 123 45 67" -> "+49 1711234567".
 * Deutsche Schreibweisen (0…, 0049…, 49…) werden zu +49; eine andere
 * Laendervorwahl bleibt als "+<Ziffern>" stehen.
 */
export function calendlyPhone(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return undefined;
  let international = trimmed.startsWith("+");
  if (!international && digits.startsWith("00")) {
    digits = digits.slice(2);
    international = true;
  }
  if (!international) {
    if (digits.startsWith("0")) digits = `49${digits.slice(1)}`;
    else if (!(digits.startsWith("49") && digits.length >= 11))
      digits = `49${digits}`;
  }
  if (digits.startsWith("49")) {
    // "+49 (0) 171 …" -> fuehrende Null der Ortsvorwahl faellt weg
    const rest = digits.slice(2).replace(/^0+/, "");
    return rest ? `+49 ${rest}` : undefined;
  }
  return `+${digits}`;
}

/**
 * Haengt `email` und `a1` an eine Calendly-URL. Andere URLs (App, keine URL)
 * bleiben unveraendert; vorhandene Werte in der URL werden nicht ueberschrieben.
 */
export function withBookingPrefill(
  url: string,
  prefill?: BookingPrefill | null,
): string {
  if (!prefill) return url;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return url;
  }
  const host = u.hostname;
  if (host !== "calendly.com" && !host.endsWith(".calendly.com")) return url;
  const email = prefill.email?.trim();
  const phone = calendlyPhone(prefill.phone);
  if (email && !u.searchParams.has("email")) u.searchParams.set("email", email);
  if (phone && !u.searchParams.has("a1")) u.searchParams.set("a1", phone);
  return u.toString();
}
