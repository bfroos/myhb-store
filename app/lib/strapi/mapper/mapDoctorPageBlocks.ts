import type { EmployeeDto } from "../dto/collections";
import { BlockPageHeaderLayout, ColorTheme } from "../dto/enums";

// translate: t aus dem Setup der Seite. useI18n darf nur im Setup laufen; die
// Seite rechnet diesen Block aber in einem computed, das Vue auch nach dem
// Setup neu auswerten kann (sonst "SyntaxError: 26").
export function mapDoctorPageBlocks(
  employee: EmployeeDto,
  translate?: ReturnType<typeof useI18n>["t"],
) {
  const t = translate ?? useI18n().t;

  const blocks = {
    hero: buildHeroBlockModel(),
    textContent: buildTextContentBlockModel(),
    qualifications: buildEmployeeQualificationskModel(),
    treatmentSpecialties: buildTreatmentSpecialtiesBlockModel(),
    locations: buildLocationsBlockModel(),
  };

  function buildHeroBlockModel() {
    const fullName = [
      employee?.academicTitle,
      employee?.firstName,
      employee?.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    const position = [employee?.role, employee?.department]
      .filter(Boolean)
      .join(" · ");

    return {
      headline: fullName,
      intro: position,
      layout: BlockPageHeaderLayout.COMPACT,
      media: employee?.photo,
      fixedImageAspectRatio: true,
    };
  }

  function buildTextContentBlockModel() {
    if (!employee?.aboutText) {
      return null;
    }

    return {
      headline: t("doctors.doctor.aboutMe.headline"),
      content: employee?.aboutText,
      columnCount: 2 as const,
      cardSettings: {
        colorTheme: ColorTheme.SOFT,
      },
    };
  }

  function buildEmployeeQualificationskModel() {
    if (
      !employee?.qualificationGroups?.length &&
      !employee?.vitaEntries?.length
    ) {
      return null;
    }

    return {
      headline: t("blocks.qualifications.headline"),
      qualifications: employee?.qualificationGroups,
      vitaEntries: employee?.vitaEntries,
      cardSettings: {
        colorTheme: ColorTheme.NEUTRAL,
      },
    };
  }

  function buildTreatmentSpecialtiesBlockModel() {
    if (!employee?.treatmentSpecialties?.length) {
      return null;
    }

    return {
      headline: t("doctors.doctor.specializations.headline"),
      treatmentPages: employee?.treatmentSpecialties,
      showShortDescriptions: true,
      showPrices: true,
      showDescriptions: true,
      cardSettings: {
        colorTheme: ColorTheme.STRONG,
      },
    };
  }

  function buildLocationsBlockModel() {
    if (!employee?.locations?.length) {
      return null;
    }

    const headline =
      employee?.locations?.length === 1
        ? t("doctors.doctor.locations.headline.one", {
            city: employee?.locations?.[0]?.city?.name,
          })
        : t("doctors.doctor.locations.headline.other", {
            count: employee?.locations?.length,
          });

    return {
      headline,
      locations: employee?.locations,
    };
  }

  return blocks;
}

// Auf der Arzt-Seite nur gute Bewertungen (ab 4 Sternen), hoechstens sechs.
const DOCTOR_REVIEW_MIN_RATING = 4;
const DOCTOR_REVIEW_LIMIT = 6;

export function mapDoctorReviewsBlock(employee: EmployeeDto | null) {
  // Die Texte sind schon serverseitig bereinigt (shared/reviewPrivacy.ts).
  const reviews = (employee?.reviews ?? [])
    .filter((review) => (review?.rating ?? 0) >= DOCTOR_REVIEW_MIN_RATING)
    .slice(0, DOCTOR_REVIEW_LIMIT);

  if (reviews.length === 0) {
    return null;
  }

  return {
    oddItemsTheme: ColorTheme.NEUTRAL,
    evenItemsTheme: ColorTheme.SOFT,
    reviews,
  };
}
