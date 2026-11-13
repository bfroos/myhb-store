/**
 * Daten aus dem Rabatt-Dialog fuer die anschliessende Buchung (07.10.2026).
 *
 * Die App-Buchung (app.myhealthandbeauty.com/book-appointment) kennt keine
 * Klartext-Vorbefuellung per Query, nur `?lead=<token>`; den Token legt
 * lib/bookingLead.ts an und er reist hier als `leadToken` mit. E-Mail und
 * Telefon leben nur im Speicher (Dialogdaten) — nie in dataLayer/GTM, nie in
 * Storage.
 */
export type BookingPrefill = {
  email?: string;
  phone?: string;
  /** Token fuer `?lead=` an der App-URL (lib/bookingLead.ts), sonst leer. */
  leadToken?: string;
};
