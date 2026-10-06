/**
 * Ziel-URL einer Behandlungskachel (relatedTreatments, Standort-Kacheln).
 *
 * Reihenfolge (Ticket "Standortarchitektur Köln konsolidieren", Punkt 6):
 *   1. Lokale Seite am aktuellen Standort, wenn er die Behandlung bedient.
 *   2. Lokale Seite am Geschwister-Standort derselben Stadt, wenn DIESER die
 *      Behandlung bedient (Köln Arcaden -> MediaPark fuer OPs und umgekehrt).
 *      Die Zuordnung kommt aus myhb-cms (cityTreatmentLocations) und folgt
 *      der Behandlungsart, nie einem gleichlautenden Slug.
 *   3. Erst dann die ueberregionale Seite /behandlungen/{pathKey}.
 *
 * Ohne Liste (locationTreatmentPathKeys undefined) gilt wie bisher: alles am
 * Standort verlinken.
 */
export type TreatmentTileLinkInput = {
  pathKey?: string | null;
  locationPathKey?: string | null;
  locationTreatmentPathKeys?: string[] | null;
  cityTreatmentLocations?: Record<string, string> | null;
};

export function resolveTreatmentTilePath({
  pathKey,
  locationPathKey,
  locationTreatmentPathKeys,
  cityTreatmentLocations,
}: TreatmentTileLinkInput): string {
  const key = pathKey ?? "";
  if (locationPathKey) {
    const availableHere =
      !locationTreatmentPathKeys || locationTreatmentPathKeys.includes(key);
    if (availableHere) return `/standorte/${locationPathKey}/${key}`;
    const sibling = cityTreatmentLocations?.[key];
    if (sibling) return `/standorte/${sibling}/${key}`;
  }
  return `/behandlungen/${key}`;
}
