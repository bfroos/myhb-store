/**
 * Was der Buchungsdialog ueber die Behandlung der Seite anzeigt, von der er
 * geoeffnet wurde (bfroos/myhb-store#78, Entscheidung Benjamin 24.09.2026).
 *
 * `priceLabel` ist der fertig formatierte Preis, genau so, wie ihn die
 * Behandlungsseite selbst zeigt („ab 149,99 €" oder leer, wenn die Seite
 * keinen Preis zeigt). Der Dialog rechnet nichts nach — der Kunde hat den Preis
 * gerade gelesen, im Dialog ist er keine neue Information.
 */
export type BookingTreatmentContext = {
  name: string;
  priceLabel?: string;
};
