import {
  ColorTheme,
  LocationOpenStatus,
  SharedButtonAction,
  SharedButtonMethod,
  LocationType,
} from "../dto/enums";
import { OrganismMediaCardLayout } from "~/lib/ui/enums";
import type { SharedButtonDto } from "../dto/components";
import type { LocationDto, TreatmentPageDto } from "../dto/collections";
import { DEFAULT_TIMEZONE } from "../config";
import { formatDate } from "~/utils/date";
import {
  replacePlaceholderString,
  replacePlaceholderRichtext,
} from "~/utils/placeholder";

export function mapLocationFixedBlocks(
  location: LocationDto,
  locationOpenStatus: LocationOpenStatus,
  brandName: string,
  treatmentPages: TreatmentPageDto[] = [],
) {
  const { t, locale, localeProperties } = useI18n();
  const dateLocale = computed<string>(() => {
    const iso = localeProperties.value?.iso as string | undefined;
    return iso ?? locale.value;
  });

  const fixed = {
    hero: buildTreatmentHeroBlockModel(),
    reviews: buildReviewsBlockModel(),
    locationContact: buildLocationContactBlockModel(),
    locationDirections: buildLocationDirectionsBlockModel(),
    about: buildAboutBlockModel(),
    treatmentTeasers: buildTreatmentTeasersBlockModel(),
  };

  function buildTreatmentHeroBlockModel() {
    const cta = location?.isBookingAllowed
      ? ({
          label: t("blocks.treatmentHero.ctaActionLabel"),
          method: SharedButtonMethod.ACTION,
          action: SharedButtonAction.APPOINTMENT_BOOKING,
        } as SharedButtonDto)
      : undefined;

    const announcementText = {
      [LocationOpenStatus.OPEN]: undefined,
      [LocationOpenStatus.OPEN_NEW_TODAY]: t(
        "locations.location.openingHoursOpenNewToday",
      ),
      [LocationOpenStatus.OPEN_SOON]: t(
        "locations.location.openingHoursOpenSoon",
        {
          date: formatDate(location?.newOpeningDate, dateLocale.value),
        },
      ),
      [LocationOpenStatus.COMING_SOON]: t(
        "locations.location.openingHoursComingSoon",
        {
          date: formatDate(location?.newOpeningDate, dateLocale.value),
        },
      ),
    };

    return {
      announcementText: announcementText[locationOpenStatus],
      headline: location?.name,
      headlinePrefix: brandName,
      cover: location?.buildingImage,
      text: location?.description,
      cta,
      showGlobalDiscount: location?.showDiscount,
      showCompanyLogos: true,
      showReviews: true,
      calendlyUrl: location?.calendlyUrl,
    };
  }

  function buildReviewsBlockModel() {
    if (!location?.reviews || location?.reviews?.length === 0) {
      return;
    }

    return {
      localReviews: !!location?.googlePlaceId,
      googlePlaceId: location?.googlePlaceId ?? undefined,
      oddItemsTheme: ColorTheme.NEUTRAL,
      evenItemsTheme: ColorTheme.SOFT,
      reviews: location?.reviews,
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

  function buildAboutBlockModel() {
    if (!location?.about) {
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

  function buildTreatmentTeasersBlockModel() {
    const headlines = {
      [LocationType.LOUNGE]: t("location.treatmentTeasers.headline.lounge", {
        city: location?.city?.name,
      }),
      [LocationType.CENTER]: t("location.treatmentTeasers.headline.center", {
        city: location?.city?.name,
      }),
      [LocationType.CLINIC]: t("location.treatmentTeasers.headline.clinic", {
        city: location?.city?.name,
      }),
    };

    const headline = headlines[location?.type as LocationType];

    return {
      headline,
      showShortDescriptions: true,
      showPrices: true,
      showDescriptions: true,
      treatmentPages,
      locationPathKey: `${location?.city?.slug}/${location?.slug}`,
      cardSettings: {
        colorTheme: ColorTheme.STRONG,
      },
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
