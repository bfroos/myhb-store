import { SharedButtonAction, SharedButtonMethod } from "../dto/enums";
import type { SharedKeyValueDto } from "../dto/components";
import type { TreatmentPageDto } from "../dto/collections";
import { mapTreatmentCommonFixedBlocks } from "./mapTreatmentCommonFixedBlocks";

type TranslateFn = ReturnType<typeof useI18n>["t"];

export function mapTreatmentPageFixedBlocks(
  treatmentPage: TreatmentPageDto = {} as TreatmentPageDto,
  t: TranslateFn,
  isAdsMode = false,
) {
  const tableOfContents: SharedKeyValueDto[] = [];

  const commonBlocks = mapTreatmentCommonFixedBlocks(
    treatmentPage,
    tableOfContents,
    t,
    isAdsMode,
    undefined,
    {
      city: "",
      cityPhrase: "",
    },
  );

  const fixed = {
    hero: buildTreatmentHeroBlockModel(),
    ...commonBlocks,
  };

  function buildTreatmentHeroBlockModel() {
    const link = {
      label: t("cta.bookAppointment"),
      method: SharedButtonMethod.ACTION,
      action: SharedButtonAction.APPOINTMENT_BOOKING,
    };

    return {
      headline: treatmentPage?.hero?.headline ?? treatmentPage?.name,
      headlineSuffix: treatmentPage?.hero?.headlineSuffix,
      subline: treatmentPage?.hero?.subline,
      text: treatmentPage?.hero?.text,
      cover: treatmentPage?.hero?.cover,
      cta: link,
      showPrice: treatmentPage?.hero?.showPrice,
      showGlobalDiscount: treatmentPage?.hero?.showDiscount ?? true,
      showBookingButton: treatmentPage?.hero?.showBookingButton ?? true,
      treatment: treatmentPage?.treatment,
      showCompanyLogos: true,
      showReviews: true,
    };
  }

  return fixed;
}
