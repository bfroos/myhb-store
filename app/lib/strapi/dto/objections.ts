// Strapi blocks.objection-section / shared.objection-card (myhb-cms).
import type { IconHubIconDto } from "./types";
import type { CardSettingsDto, SharedButtonDto } from "./components";

export type SharedObjectionCardDto = {
  id?: number;
  /** Iconhub-Feld (wie TrustGrid/BenefitsList); fehlt es, zeigt die Karte ein Haken-Icon. */
  icon?: IconHubIconDto | null;
  title: string;
  /** Antwort; Platzhalter {preis} und {rabatt} (shared/objections.ts). */
  text?: string | null;
  link?: SharedButtonDto | null;
};

export type BlockObjectionSectionDto = {
  headline?: string | null;
  subheadline?: string | null;
  items?: SharedObjectionCardDto[] | null;
  showCta?: boolean | null;
  cta?: SharedButtonDto | null;
  cardSettings?: CardSettingsDto | null;
};
