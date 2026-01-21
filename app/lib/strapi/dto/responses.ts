import type { TreatmentPageListItemDto } from "./collections";

export type TreatmentPageGroupDto = {
  groupId: string;
  groupName: string;
  treatmentPages: TreatmentPageListItemDto[];
};
