// Strapi blocks.doctor-team / shared.doctor-card (myhb-cms). Eigene Datei,
// damit components.ts fuer diesen Block nicht angefasst werden muss.
import type { StrapiMedia } from "./types";
import type { EmployeeDto } from "./collections";
import type { CardSettingsDto, SharedButtonDto } from "./components";

export type SharedDoctorCardDto = {
  id?: number;
  /** Bevorzugte Quelle; kommt leer an, wenn der Employee versteckt/inaktiv ist. */
  employee?: EmployeeDto | null;
  /** Overrides der Employee-Daten (optional). */
  name?: string | null;
  role?: string | null;
  image?: StrapiMedia | null;
  imageAlt?: string | null;
  profileLink?: string | null;
};

export type BlockDoctorTeamDto = {
  headline?: string | null;
  description?: string | null;
  doctors?: SharedDoctorCardDto[] | null;
  trustText?: string | null;
  showCta?: boolean | null;
  cta?: SharedButtonDto | null;
  cardSettings?: CardSettingsDto | null;
};
