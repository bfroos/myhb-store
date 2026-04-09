import {
  ColorTheme,
  LocationOpenStatus,
  SharedButtonAction,
  SharedButtonMethod,
} from "../dto/enums";
import type {
  BlockTreatmentHeroDto,
  SharedKeyValueDto,
} from "../dto/components";
import type { LocationDto, TreatmentPageDto } from "../dto/collections";
import { DEFAULT_TIMEZONE } from "../config";
import { OrganismMediaCardLayout } from "~/lib/ui/enums";
import { mapTreatmentCommonFixedBlocks } from "./mapTreatmentCommonFixedBlocks";

export function mapLocationTreatmentPageFixedBlocks(
  treatmentPage: TreatmentPageDto,
  location: LocationDto,
  locationOpenStatus: LocationOpenStatus,
) {
  if (!treatmentPage || !location) {
    return;
  }

  const { t, locale, localeProperties } = useI18n();
  const { isAdsMode } = useSiteModeFlags();
  const dateLocale = computed<string>(() => {
    const iso = localeProperties.value?.iso as string | undefined;
    return iso ?? locale.value;
  });

  const tableOfContents: SharedKeyValueDto[] = [];
  const commonBlocks = mapTreatmentCommonFixedBlocks(
    treatmentPage,
    tableOfContents,
    location,
    {
      city: location.city?.name ?? "",
      cityPhrase: location.city?.name
        ? t("locations.location.cityPhrase", {
            city: location.city.name,
          })
        : "",
    },
  );

  const fixed = {
    hero: buildTreatmentHeroBlockModel(),
    locationContact: buildLocationContactBlockModel(),
    aboutLocation: buildAboutLocationBlockModel(),
    locationDirections: buildLocationDirectionsBlockModel(),
    ...commonBlocks,
  };

  function buildTreatmentHeroBlockModel(): BlockTreatmentHeroDto {
    const link = {
      label: t("cta.bookAppointment"),
      method: SharedButtonMethod.ACTION,
      action: SharedButtonAction.APPOINTMENT_BOOKING,
    };

    const fullLocationName = `${location.city?.name ?? ""} · ${location.name}`;

    return {
      headlinePrefix: fullLocationName,
      headline: treatmentPage.hero?.headline ?? treatmentPage.name,
      headlineSuffix: treatmentPage.hero?.headlineSuffix,
      subline: treatmentPage.hero?.subline,
      cover: treatmentPage.hero?.cover ?? location.buildingImage,
      text: treatmentPage.hero?.text,
      showPrice: treatmentPage.hero?.showPrice,
      showGlobalDiscount: treatmentPage.hero?.showDiscount,
      showCompanyLogos: true,
      showReviews: true,
      treatment: treatmentPage.treatment,
      cta: link,
      calendlyUrl: location?.calendlyUrl ?? undefined,
      googlePlaceId: location?.googlePlaceId ?? undefined,
    };
  }

  function buildLocationContactBlockModel() {
    if (
      !location?.address &&
      !location?.coordinates &&
      !location?.contact &&
      !location?.openingHours &&
      !location?.newOpeningDate
    ) {
      return;
    }

    return {
      address: location?.address,
      coordinates: location?.coordinates,
      contact: location?.contact,
      openingHours: location?.openingHours,
      newOpeningDate: location?.newOpeningDate,
      timezone: location?.timezone ?? DEFAULT_TIMEZONE,
      cardSettings: {
        colorTheme: ColorTheme.STRONG,
      },
    };
  }

  function buildAboutLocationBlockModel() {
    if (isAdsMode.value || !location?.about) {
      return;
    }

    const aboutItemMap = {
      [LocationOpenStatus.OPEN_NEW_TODAY]: location?.about?.open,
      [LocationOpenStatus.OPEN]: location?.about?.open,
      [LocationOpenStatus.OPEN_SOON]: location?.about?.openSoon,
      [LocationOpenStatus.COMING_SOON]: location?.about?.comingSoon,
    };

    const aboutItem = aboutItemMap[locationOpenStatus];

    if (!aboutItem?.headline || !aboutItem?.content) {
      return;
    }

    const link = {
      label: t("cta.bookAppointment"),
      method: SharedButtonMethod.ACTION,
      action: SharedButtonAction.APPOINTMENT_BOOKING,
    };

    const replacements = [
      {
        placeholder: "{{ date }}",
        replacement: formatDate(location?.newOpeningDate, dateLocale.value),
      },
      {
        placeholder: "{{ city }}",
        replacement: location?.city?.name ?? "",
      },
    ];

    const headline = replacePlaceholderString(
      aboutItem?.headline,
      replacements,
    );
    const intro = replacePlaceholderString(aboutItem?.intro, replacements);
    const content = replacePlaceholderRichtext(
      aboutItem?.content,
      replacements,
    );

    return {
      headline,
      intro,
      content,
      media: aboutItem?.media,
      links: [link],
      layout: OrganismMediaCardLayout.MEDIA_LEFT,
    };
  }

  function buildLocationDirectionsBlockModel() {
    if (!location?.directions) {
      return;
    }

    return {
      headline: location?.directions?.headline,
      content: location?.directions?.content,
      walkDirections: location?.directions?.walkDirections,
      publicTransportDirections:
        location?.directions?.publicTransportDirections,
      carDirections: location?.directions?.carDirections,
      image: location?.directions?.image,
      fixedImageAspectRatio: true,
      cardSettings: {
        colorTheme: ColorTheme.SOFT,
      },
    };
  }

  return fixed;
}
