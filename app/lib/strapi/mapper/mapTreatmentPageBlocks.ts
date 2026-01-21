import { SharedButtonAction, SharedButtonMethod } from "../dto/enums";
import type { SharedKeyValueDto } from "../dto/components";
import type { TreatmentPageDto } from "../dto/collections";
import { mapTreatmentCommonFixedBlocks } from "./mapTreatmentCommonFixedBlocks";

export function mapTreatmentPageFixedBlocks(
  treatmentPage: TreatmentPageDto = {} as TreatmentPageDto,
) {
  const { t } = useI18n();

  const tableOfContents: SharedKeyValueDto[] = [];

  const commonBlocks = mapTreatmentCommonFixedBlocks(
    treatmentPage,
    tableOfContents,
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
      intro: treatmentPage?.hero?.intro,
      cover: treatmentPage?.hero?.cover,
      cta: link,
      priceInEuroCent: treatmentPage?.treatment?.priceInEuroCent,
      isStartingPrice: treatmentPage?.treatment?.isStartingPrice,
      showPrice: treatmentPage?.hero?.showPrice,
      showGlobalDiscount: treatmentPage?.hero?.showDiscount,
      treatment: treatmentPage?.treatment,
      showCompanyLogos: true,
      showReviews: true,
    };
  }

  return fixed;
}
