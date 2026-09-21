import type { LocationDto } from "~/lib/strapi/dto/collections";

/**
 * Die Buchungs-URLs eines Standorts — leer, solange er nicht buchen darf.
 *
 * `isBookingAllowed` ist der Schalter der Redaktion fuer "hier nimmt gerade
 * niemand Termine an": vorübergehend geschlossen, noch nicht eröffnet, kein
 * Personal. Bis hierher wertete ihn nur der Hero-Knopf aus
 * (mapLocationPageBlocks); alle uebrigen Buchungsknoepfe bekamen die
 * Calendly-URL trotzdem und nahmen munter Termine entgegen.
 *
 * Gemessen am 21.09.2026: 94 Klicks auf "Termin buchen" in zwei Wochen an drei
 * gesperrten Standorten, **null** Buchungen daraus — 70 davon an der
 * MediaPark-Klinik, deren Seite nicht einmal einen Hinweis trug. Das sind
 * Menschen, die einen Termin wollten und ins Leere liefen, obwohl in Koeln ein
 * offener Standort zwei Kilometer weiter buchbar ist.
 *
 * Ohne URL oeffnet der Buchungsknopf die Standortsuche (useCalendlyDialog) —
 * der Besucher landet also bei einem Standort, der ihn auch bedienen kann,
 * statt in einem Kalender ohne freie Zeiten.
 *
 * Die Flagge ist damit die einzige Stelle, an der das geschaltet wird: Die
 * URLs duerfen in Strapi stehen bleiben, und beim Wiederoeffnen reicht ein
 * Haken statt zwei nachgetragener Felder.
 */
export function bookingUrlsOf(location?: LocationDto | null): {
  calendlyUrl?: string;
  appBookingUrl?: string;
} {
  if (!location || location.isBookingAllowed === false) return {};
  return {
    calendlyUrl: location.calendlyUrl ?? undefined,
    appBookingUrl: location.appBookingUrl ?? undefined,
  };
}
