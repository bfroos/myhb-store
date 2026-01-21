import {
  ColorTheme,
  SharedButtonAction,
  SharedButtonCollection,
  SharedButtonMethod,
} from "../dto/enums";
import type { SharedButtonDto, SharedKeyValueDto } from "../dto/components";
import type {
  GeneralPageDto,
  LocationDto,
  TreatmentPageDto,
} from "../dto/collections";
import { OrganismMediaCardLayout } from "~/lib/ui/enums";

export function mapTreatmentCommonFixedBlocks(
  treatmentPage: TreatmentPageDto,
  tableOfContents: SharedKeyValueDto[],
  location?: LocationDto,
) {
  const { t } = useI18n();

  const fixed = {
    tableOfContents: buildTableOfContentsBlockModel(),
    reviews: buildReviewsBlockModel(),
    about: buildAboutBlockModel(),
    treatmentDetails: buildTreatmentDetailsBlockModel(),
    treatmentPlan: buildTreatmentPlanBlockModel(),
    benefits: buildBenefitsBlockModel(),
    suitability: buildSuitabilityBlockModel(),
    medicalTeamHighlight: buildMedicalTeamHighlightBlockModel(),
    treatmentProcess: buildTreatmentProcessBlockModel(),
    relatedTreatments: buildRelatedTreatmentsBlockModel(),
    faq: buildFaqBlockModel(),
  };

  function buildTableOfContentsBlockModel() {
    if (!treatmentPage?.tableOfContents) {
      return;
    }

    const ctaLink = {
      label: t("cta.bookAppointment"),
      method: SharedButtonMethod.ACTION,
      action: SharedButtonAction.APPOINTMENT_BOOKING,
      data: {
        calendlyUrl: location?.calendlyUrl,
      },
    };

    return {
      headline: treatmentPage?.tableOfContents?.headline,
      intro: treatmentPage?.tableOfContents?.intro,
      content: treatmentPage?.tableOfContents?.content,
      index: tableOfContents,
      links: [ctaLink],
      cardSettings: {
        colorTheme: ColorTheme.STRONG,
      },
    };
  }

  function buildReviewsBlockModel() {
    if (
      !treatmentPage?.reviews ||
      treatmentPage?.reviews?.reviews?.length === 0
    ) {
      return;
    }

    tableOfContents.push({
      key: "reviews",
      value: treatmentPage?.reviews?.headline ?? t("blocks.reviews.headline"),
    });

    return {
      headline: treatmentPage?.reviews?.headline,
      reviews:
        treatmentPage?.reviews?.reviews ?? treatmentPage?.treatment?.reviews,
      localReviews: false,
    };
  }

  function buildAboutBlockModel() {
    if (!treatmentPage?.about) {
      return;
    }

    tableOfContents.push({
      key: "how-it-works",
      value: treatmentPage?.about?.headline ?? "",
    });

    return {
      headline: treatmentPage?.about?.headline,
      intro: treatmentPage?.about?.intro,
      content: treatmentPage?.about?.content,
      mediaItems: [treatmentPage?.about?.media],
    };
  }

  function buildTreatmentDetailsBlockModel() {
    if (!treatmentPage?.treatmentDetails) {
      return;
    }

    tableOfContents.push({
      key: "treatment-details",
      value: treatmentPage?.treatmentDetails?.headline ?? "",
    });

    return {
      headline: treatmentPage?.treatmentDetails?.headline,
      priceInEuroCent: treatmentPage?.treatment?.priceInEuroCent,
      price: treatmentPage?.treatmentDetails?.price,
      duration: treatmentPage?.treatmentDetails?.duration,
      effect: treatmentPage?.treatmentDetails?.effect,
      initialResults: treatmentPage?.treatmentDetails?.initialResults,
      finalResults: treatmentPage?.treatmentDetails?.finalResults,
      effectDuration: treatmentPage?.treatmentDetails?.effectDuration,
      anesthesia: treatmentPage?.treatmentDetails?.anesthesia,
      medication: treatmentPage?.treatmentDetails?.medication,
      aftercareSummary: treatmentPage?.treatmentDetails?.aftercareSummary,
      followUpTreatments: treatmentPage?.treatmentDetails?.followUpTreatments,
      image: treatmentPage?.treatmentDetails?.image,
      treatment: treatmentPage?.treatment,
      cardSettings: {
        colorTheme: ColorTheme.STRONG,
      },
    };
  }

  function buildTreatmentPlanBlockModel() {
    if (!treatmentPage?.treatmentPlan) {
      return;
    }

    tableOfContents.push({
      key: "treatment-plan",
      value: treatmentPage?.treatmentPlan?.headline ?? "",
    });

    return {
      headline: treatmentPage?.treatmentPlan?.headline,
      content: treatmentPage?.treatmentPlan?.content,
      additionalInfos: treatmentPage?.treatmentPlan?.additionalInfos,
      personaPhoto: treatmentPage?.treatmentPlan?.personaPhoto,
      personaAge: treatmentPage?.treatmentPlan?.personaAge,
      personaTreatmentGoal: treatmentPage?.treatmentPlan?.personaTreatmentGoal,
      steps: treatmentPage?.treatmentPlan?.steps,
    };
  }

  function buildBenefitsBlockModel() {
    if (!treatmentPage?.benefits) {
      return;
    }

    tableOfContents.push({
      key: "benefits",
      value: treatmentPage?.benefits?.headline ?? "",
    });

    return {
      headline: treatmentPage?.benefits?.headline,
      items: treatmentPage?.benefits?.items,
      media: treatmentPage?.benefits?.media,
      layout: OrganismMediaCardLayout.MEDIA_LEFT,
      cardSettings: {
        colorTheme: ColorTheme.SOFT,
      },
    };
  }

  function buildSuitabilityBlockModel() {
    if (
      !treatmentPage?.suitability?.suitableFor ||
      !treatmentPage?.suitability?.notSuitableFor
    ) {
      return;
    }

    if (treatmentPage?.suitability?.suitableFor) {
      tableOfContents.push({
        key: "suitability",
        value: treatmentPage?.suitability?.suitableFor?.heading ?? "",
      });
    }

    if (treatmentPage?.suitability?.notSuitableFor) {
      tableOfContents.push({
        key: "suitability",
        value: treatmentPage?.suitability?.notSuitableFor?.heading ?? "",
      });
    }

    return {
      firstItem: treatmentPage?.suitability?.suitableFor,
      secondItem: treatmentPage?.suitability?.notSuitableFor,
      cardSettings: {
        colorTheme: ColorTheme.STRONG,
      },
    };
  }

  function buildMedicalTeamHighlightBlockModel() {
    if (!treatmentPage?.medicalTeamHighlight) {
      return;
    }

    const link: SharedButtonDto = {
      label: t("cta.learnMore"),
      method: SharedButtonMethod.INTERNAL_LINK,
      collection: SharedButtonCollection.PAGE,
      page: {
        slug: "aerzte",
      } as GeneralPageDto,
    };

    tableOfContents.push({
      key: "employee",
      value: treatmentPage?.medicalTeamHighlight?.headline ?? "",
    });

    const employee = treatmentPage?.medicalTeamHighlight?.employee
      ?.hideFromPublic
      ? undefined
      : treatmentPage?.medicalTeamHighlight?.employee;

    return {
      headline: treatmentPage?.medicalTeamHighlight?.headline,
      intro: treatmentPage?.medicalTeamHighlight?.intro,
      content: treatmentPage?.medicalTeamHighlight?.content,
      employee,
      layout: OrganismMediaCardLayout.MEDIA_LEFT,
      links: [link],
      cardSettings: {
        colorTheme: ColorTheme.NEUTRAL,
      },
    };
  }

  function buildTreatmentProcessBlockModel() {
    if (!treatmentPage?.treatmentProcess) {
      return;
    }

    tableOfContents.push({
      key: "treatment-process-steps",
      value: treatmentPage?.treatmentProcess?.headline ?? "",
    });

    return {
      headline: treatmentPage?.treatmentProcess?.headline,
      content: treatmentPage?.treatmentProcess?.content,
      steps: treatmentPage?.treatmentProcess?.steps,
    };
  }

  function buildRelatedTreatmentsBlockModel() {
    if (!treatmentPage?.relatedTreatments) {
      return;
    }

    tableOfContents.push({
      key: "related-treatments",
      value: treatmentPage?.relatedTreatments?.headline ?? "",
    });

    return {
      headline: treatmentPage?.relatedTreatments?.headline,
      treatmentPages: treatmentPage?.relatedTreatments?.treatmentPages,
      showShortDescriptions: true,
      showPrices: true,
      showDescriptions: true,
      cardSettings: {
        colorTheme: ColorTheme.STRONG,
      },
    };
  }

  function buildFaqBlockModel() {
    if (!treatmentPage?.faq) {
      return;
    }

    tableOfContents.push({
      key: "faq",
      value: treatmentPage?.faq?.headline ?? "",
    });

    return {
      headline: treatmentPage?.faq?.headline,
      faqs: treatmentPage?.faq?.faqs,
      cardSettings: {
        colorTheme: ColorTheme.NEUTRAL,
      },
    };
  }

  return fixed;
}
