/**
 * Ergebnis des Preisrechners (blocks.price-calculator) einer Seite, damit der
 * Anfrage-Funnel (blocks.lead-funnel) es mitschicken kann (E28 #1639).
 */
export type LeadRechnerErgebnis = {
  bereiche: string[];
  einheiten: number;
  einheitLabel: string;
  methode: string | null;
  zusatz: string[];
  preisCent: number;
};

export function useLeadRechner() {
  return useState<LeadRechnerErgebnis | null>("lead-rechner", () => null);
}
