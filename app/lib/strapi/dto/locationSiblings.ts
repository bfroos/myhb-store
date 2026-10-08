/**
 * Geschwister-Standort derselben Stadt, der Behandlungsarten bedient, die
 * dieser Standort abgibt (myhb-cms: with-treatments -> siblingLocations).
 * Standort-Konsolidierung Köln: Arcaden <-> MediaPark.
 */
export type LocationSiblingHintDto = {
  citySlug: string;
  locationSlug: string;
  locationName: string;
  treatmentTypes: string[];
  categoryPathKeys: string[];
};

/** pathKey -> "citySlug/locationSlug" der Geschwister-Standorte (myhb-cms). */
export type CityTreatmentLocations = Record<string, string>;
