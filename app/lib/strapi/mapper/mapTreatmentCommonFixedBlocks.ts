import {
  ColorTheme,
  MediaBentoLayout,
  MediaBentoMediaItemAlignment,
  SharedButtonAction,
  SharedButtonMethod,
  SharedButtonSingleType,
  SharedButtonTargetType,
} from "../dto/enums";
import type { SharedButtonDto, SharedKeyValueDto } from "../dto/components";
import type { LocationDto, TreatmentPageLikeDto } from "../dto/collections";
import { OrganismMediaCardLayout } from "~/lib/ui/enums";
import { replacePlaceholderString } from "~/utils/placeholder";

type PlaceholderContext = {
  city?: string;
  cityPhrase?: string;
};

export function mapTreatmentCommonFixedBlocks(
  treatmentPage: TreatmentPageLikeDto,
  tableOfContents: SharedKeyValueDto[],
  location?: LocationDto,
  placeholderContext?: PlaceholderContext,
) {
  const { t } = useI18n();
  const { isAdsMode } = useSiteModeFlags();
  const city = placeholderContext?.city ?? "";
  const cityPhrase = placeholderContext?.cityPhrase ?? "";
  const replacements = [
    {
      placeholder: "{{ cityPhrase }}",
      replacement: cityPhrase,
    },
    {
      placeholder: "{{ cityName }}",
      replacement: city,
    },
  ];

  function withPlaceholders(value: string | null | undefined): string | undefined {
    return replacePlaceholderString(value, replacements) ?? undefined;
  }
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
      headline: withPlaceholders(treatmentPage?.tableOfContents?.headline),
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

    const headline = withPlaceholders(treatmentPage?.reviews?.headline);

    tableOfContents.push({
      key: "reviews",
      value: headline ?? t("blocks.reviews.headline"),
    });

    return {
      headline,
      reviews:
        treatmentPage?.reviews?.reviews ?? treatmentPage?.treatment?.reviews,
    };
  }

  function buildAboutBlockModel() {
    if (!treatmentPage?.about) {
      return;
    }

    const headline = withPlaceholders(treatmentPage?.about?.headline);

    tableOfContents.push({
      key: "how-it-works",
      value: headline ?? "",
    });

    return {
      headline,
      intro: treatmentPage?.about?.intro,
      content: treatmentPage?.about?.content,
      mediaItems: [treatmentPage?.about?.media],
      layout: MediaBentoLayout.MEDIA_LEFT,
      mediaItemAlignment: MediaBentoMediaItemAlignment.HORIZONTAL,
    };
  }

  function buildTreatmentDetailsBlockModel() {
    if (!treatmentPage?.treatmentDetails) {
      return;
    }

    const headline = withPlaceholders(treatmentPage?.treatmentDetails?.headline);

    tableOfContents.push({
      key: "treatment-details",
      value: headline ?? "",
    });

    return {
      headline,
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

    const headline = withPlaceholders(treatmentPage?.treatmentPlan?.headline);

    tableOfContents.push({
      key: "treatment-plan",
      value: headline ?? "",
    });

    return {
      headline,
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

    const headline = withPlaceholders(treatmentPage?.benefits?.headline);

    tableOfContents.push({
      key: "benefits",
      value: headline ?? "",
    });

    return {
      headline,
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
      const suitableForHeading = withPlaceholders(
        treatmentPage?.suitability?.suitableFor?.heading,
      );
      tableOfContents.push({
        key: "suitability",
        value: suitableForHeading ?? "",
      });
    }

    if (treatmentPage?.suitability?.notSuitableFor) {
      const notSuitableForHeading = withPlaceholders(
        treatmentPage?.suitability?.notSuitableFor?.heading,
      );
      tableOfContents.push({
        key: "suitability",
        value: notSuitableForHeading ?? "",
      });
    }

    const firstItem = treatmentPage?.suitability?.suitableFor
      ? {
          ...treatmentPage.suitability.suitableFor,
          heading: withPlaceholders(treatmentPage.suitability.suitableFor.heading),
        }
      : undefined;
    const secondItem = treatmentPage?.suitability?.notSuitableFor
      ? {
          ...treatmentPage.suitability.notSuitableFor,
          heading: withPlaceholders(
            treatmentPage.suitability.notSuitableFor.heading,
          ),
        }
      : undefined;

    return {
      firstItem,
      secondItem,
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
      targetType: SharedButtonTargetType.SINGLE_TYPE,
      singleType: SharedButtonSingleType.DOCTORS,
    };

    const headline = withPlaceholders(treatmentPage?.medicalTeamHighlight?.headline);

    tableOfContents.push({
      key: "employee",
      value: headline ?? "",
    });

    const employee = treatmentPage?.medicalTeamHighlight?.employee
      ?.hideFromPublic
      ? undefined
      : treatmentPage?.medicalTeamHighlight?.employee;

    return {
      headline,
      intro: treatmentPage?.medicalTeamHighlight?.intro,
      content: treatmentPage?.medicalTeamHighlight?.content,
      employee,
      layout: OrganismMediaCardLayout.MEDIA_LEFT,
      links: isAdsMode.value ? [] : [link],
      cardSettings: {
        colorTheme: ColorTheme.NEUTRAL,
      },
    };
  }

  function buildTreatmentProcessBlockModel() {
    if (!treatmentPage?.treatmentProcess) {
      return;
    }

    const headline = withPlaceholders(treatmentPage?.treatmentProcess?.headline);

    tableOfContents.push({
      key: "treatment-process-steps",
      value: headline ?? "",
    });

    return {
      headline,
      content: treatmentPage?.treatmentProcess?.content,
      steps: treatmentPage?.treatmentProcess?.steps,
    };
  }

  function buildRelatedTreatmentsBlockModel() {
    if (!treatmentPage?.relatedTreatments) {
      return;
    }

    const headline = withPlaceholders(treatmentPage?.relatedTreatments?.headline);

    tableOfContents.push({
      key: "related-treatments",
      value: headline ?? "",
    });

    return {
      headline,
      treatmentPages: treatmentPage?.relatedTreatments?.treatmentPages,
      treatmentAdsPages: treatmentPage?.relatedTreatments?.treatmentAdsPages,
      showShortDescriptions: true,
      showPrices: true,
      showDescriptions: true,
      locationPathKey: location
        ? `${location.city?.slug}/${location.slug}`
        : undefined,
      cardSettings: {
        colorTheme: ColorTheme.STRONG,
      },
    };
  }

  function buildFaqBlockModel() {
    if (!treatmentPage?.faq) {
      return;
    }

    const headline = withPlaceholders(treatmentPage?.faq?.headline);

    tableOfContents.push({
      key: "faq",
      value: headline ?? "",
    });

    return {
      headline,
      faqs: treatmentPage?.faq?.faqs,
      faqSets: treatmentPage?.faq?.faqSets,
      cardSettings: {
        colorTheme: ColorTheme.NEUTRAL,
      },
    };
  }

  return fixed;
}
