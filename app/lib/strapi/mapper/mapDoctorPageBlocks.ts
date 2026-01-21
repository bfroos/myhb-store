import type { EmployeeDto } from "../dto/collections";
import { ColorTheme } from "../dto/enums";

export function mapDoctorPageBlocks(employee: EmployeeDto) {
  const { t } = useI18n();

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
      subline: position,
      cover: employee?.photo,
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
