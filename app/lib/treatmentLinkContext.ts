import type { ComputedRef, InjectionKey } from "vue";
import type { TreatmentTileLinkInput } from "#shared/locationTreatmentLinks";

/**
 * Standortkontext fuer Behandlungslinks in dynamischen Strapi-Bloecken.
 *
 * Dynamische Bloecke (treatmentPage.blocks, z. B. blocks.price-teaser) laufen
 * nicht durch die Mapper, sondern gehen roh an den BlockRenderer. Die
 * Standort-Behandlungsseite stellt den Kontext deshalb per provide bereit;
 * Bloecke bauen ihre Links damit ueber resolveTreatmentTilePath (erst lokal,
 * dann Geschwister-Standort, dann /behandlungen). Ohne Kontext (/behandlungen,
 * go.) bleibt es bei /behandlungen/{pathKey}.
 */
export type TreatmentLinkContext = Omit<TreatmentTileLinkInput, "pathKey">;

export const TREATMENT_LINK_CONTEXT: InjectionKey<
  ComputedRef<TreatmentLinkContext | undefined>
> = Symbol("treatmentLinkContext");
