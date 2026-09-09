import { SharedButtonAction, SharedButtonMethod } from "../dto/enums";
import type { SharedKeyValueDto } from "../dto/components";
import type { TreatmentPageDto } from "../dto/collections";
import { mapTreatmentCommonFixedBlocks } from "./mapTreatmentCommonFixedBlocks";
import { resolveAppTreatmentSlug } from "~/composables/useAppBookingDialog";

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

    // SEO: Die <h1> nutzt das Haupt-Keyword der Behandlung
    // (treatmentPage.name, z.B. "Zornesfalte", "Lippenaufpolsterung") statt der
    // längeren hero.headline. So ist die H1 deckungsgleich mit dem Meta-Titel-
    // Keyword und Google zeigt dieses Keyword als Suchergebnis-Titel an.
    // (Einige Namen haben führende/abschließende Leerzeichen -> trim.)
    const treatmentKeyword = (
      treatmentPage?.name ??
      treatmentPage?.hero?.headline ??
      ""
    ).trim();

    return {
      headline: treatmentKeyword,
      subline: treatmentPage?.hero?.subline,
      text: treatmentPage?.hero?.text,
      cover: treatmentPage?.hero?.cover,
      cta: link,
      // Deeplink #66: Die Behandlungsseite kennt keinen Standort – der Button
      // öffnet die Standortsuche. Der Slug wandert mit und wird an die
      // App-Buchungs-URL des dort gewählten Standorts gehängt.
      appTreatmentSlug: resolveAppTreatmentSlug(treatmentPage),
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
