<template>
  <div class="locationTile" :class="classes">
    <NuxtLinkLocale
      :to="buildLocationPath(item)"
      class="locationTile__imageLink"
    >
      <UiAtomMediaPicture
        v-if="item.buildingImage && isMediaImage(item.buildingImage)"
        :media="item.buildingImage"
        :sources="{
          [ImageBreakpoint.SMALL]: ImageFormat.SMALL,
        }"
      />
      <IconBuildingStore v-else size="25%" stroke="1" />
    </NuxtLinkLocale>
    <div class="locationTile__content">
      <div class="locationTile__contactInfo">
        <div class="locationTitle__header">
          <b v-if="item.city" class="locationTile__title">{{ title }}</b>
          <span
            v-if="
              item.distanceInKilometers &&
              Number.isFinite(Number(item.distanceInKilometers))
            "
            class="locationTitle__distance"
          >
            <IconDirectionSign size="1.5em" stroke="2" />
            {{ item.distanceInKilometers?.toFixed(1) }}
            {{ $t("common.distanceKilometersSuffix") }}
          </span>
        </div>
        <a
          v-if="googleReview"
          class="locationTile__rating"
          :href="googleReview.placeUrl"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="`${$t('common.rating')}: ${googleReview.ratingDisplay}/5, ${$t('common.reviewsCount', { count: googleReview.countDisplay })}`"
        >
          <IconStarFilled size="1em" aria-hidden="true" />
          <b>{{ googleReview.ratingDisplay }}</b>
          <span>({{ googleReview.countDisplay }} Google)</span>
        </a>
        <p v-if="!isMainInformationLocation" class="locationTile__subtitle">
          {{ item.name }}
        </p>
        <div v-if="badgeText" class="locationTile__badge">
          <IconCalendarQuestion v-if="isComingSoon" size="1.5em" stroke="2" />
          <IconCalendarStar v-else size="1.5em" stroke="2" />
          <span>{{ badgeText }}</span>
        </div>
        <p v-if="item.address" class="locationTile__address">
          {{ item.address.street }} {{ item.address.houseNumber }}
          <template v-if="isMainInformationLocation">
            <br />
            {{ item.address.postalCode }} {{ item.address.city }}
          </template>
          <template v-else> ({{ item.address.postalCode }}) </template>
        </p>
      </div>
      <div class="locationTile__actions">
        <UiMoleculeButtonGroup>
          <UiAtomBaseButton
            v-if="item.calendlyUrl"
            size="sm"
            @click="handleBookClick"
          >
            {{ $t("cta.bookAppointment") }}
          </UiAtomBaseButton>
          <!--
            Conversion-Audit #78: Statt eines toten "Nicht buchbar"-Buttons
            bekommt die Lounge ohne Online-Buchung einen Kontaktweg
            (Telefon, sonst WhatsApp). Ohne Kontaktdaten kein Button.
          -->
          <UiAtomBaseButton
            v-else-if="phoneHref"
            as="a"
            size="sm"
            :href="phoneHref"
            @click="handlePhoneClick"
          >
            {{ $t("cta.call") }}
          </UiAtomBaseButton>
          <UiAtomBaseButton
            v-else-if="whatsAppHref"
            as="a"
            size="sm"
            :href="whatsAppHref"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ $t("blocks.locationContact.whatsapp") }}
          </UiAtomBaseButton>
          <UiAtomBaseButton
            size="sm"
            variant="secondary"
            as="nuxt-link-locale"
            :to="buildLocationPath(item)"
            @click="handleDetailsClick"
          >
            {{ $t("cta.details") }}
          </UiAtomBaseButton>
        </UiMoleculeButtonGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IconBuildingStore,
  IconCalendarQuestion,
  IconCalendarStar,
  IconDirectionSign,
  IconStarFilled,
} from "@tabler/icons-vue";
import type { MoleculeLocationItem } from "~/lib/ui/types";
import {
  ImageFormat,
  ImageBreakpoint,
  LocationOpenStatus,
} from "~/lib/strapi/dto/enums";
import { isMediaImage } from "~/utils/media";
import { getGoogleReviewForPlace } from "~/utils/schemaLocation";

const { locale, locales } = useI18n();
const { formatInteger, localeIso } = useFormatInteger();
const { trackPhoneClick } = useGoogleAnalytics();
const emit = defineEmits<{
  book: [];
  navigate: any;
}>();

const props = withDefaults(
  defineProps<{
    item: MoleculeLocationItem;
    mainInformation?: "location" | "city";
    showBuildingImage?: boolean;
    onBook?: () => void;
    onBeforeNavigate?: () => void;
    to?: string;
  }>(),
  {
    mainInformation: "location",
    showBuildingImage: false,
  },
);

const classes = computed(() => {
  return {
    "locationTile--mainInformation-location":
      props.mainInformation === "location",
    "locationTile--showBuildingImage": props.showBuildingImage,
    "locationTile--showDistance":
      props.item.distanceInKilometers !== null &&
      props.item.distanceInKilometers !== undefined,
  };
});

const handleBookClick = () => {
  if (props.onBook) {
    props.onBook();
  } else {
    emit("book");
  }
};

const handleDetailsClick = () => {
  props.onBeforeNavigate?.();
  emit("navigate");
};

// Google-Note je Standort (statische, taeglich aktualisierte Werte, siehe
// GOOGLE_RATINGS). Zeigt nichts, wenn fuer die placeId keine Daten vorliegen.
const googleReview = computed(() => {
  const review = getGoogleReviewForPlace(props.item.googlePlaceId);
  if (!review) return null;
  return {
    ...review,
    ratingDisplay: review.rating.toLocaleString(localeIso.value, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }),
    countDisplay: formatInteger(review.userRatingsTotal),
  };
});

const phoneHref = computed(() => {
  const phone = props.item.contact?.phoneNumber?.trim();
  return phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null;
});

const whatsAppHref = computed(() => {
  const number = props.item.contact?.whatsAppNumber?.trim();
  return number ? `https://wa.me/${number.replace(/[^\d]/g, "")}` : null;
});

const handlePhoneClick = () => {
  trackPhoneClick(props.item.contact?.phoneNumber ?? undefined);
};

const isMainInformationLocation = computed(() => {
  return props.mainInformation === "location";
});

const isComingSoon = computed(
  () => props.item.openingStatus === LocationOpenStatus.COMING_SOON,
);

const title = computed(() => {
  if (isMainInformationLocation.value) {
    return props.item.name;
  }

  return props.item.city.name;
});

const badgeText = computed(() => {
  const { openingStatus, newOpeningDate } = props.item;

  if (openingStatus === LocationOpenStatus.COMING_SOON) {
    return $t("location.comingSoon");
  }

  if (openingStatus === LocationOpenStatus.OPEN_NEW_TODAY) {
    return $t("location.sinceToday");
  }

  if (openingStatus === LocationOpenStatus.OPEN_SOON && newOpeningDate) {
    const currentLocaleObj = locales.value.find(
      (l: any) => l.code === locale.value,
    );
    const localeIso = String(currentLocaleObj?.iso || "de-DE");

    return $t("common.date.fromDate", {
      date: new Date(newOpeningDate).toLocaleDateString(localeIso, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    });
  }

  return null;
});

const buildLocationPath = (item: MoleculeLocationItem) => {
  if (props.to) {
    return props.to;
  }

  return {
    name: "standorte-citySlug-locationSlug",
    params: { citySlug: item.city.slug, locationSlug: item.slug },
  };
};
</script>

<style scoped>
.locationTile {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  color: var(--color-text);
  background: var(--card-color-bg-sub);
  border-radius: var(--border-radius-card-sm);
  overflow: hidden;
}

.locationTile__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
  padding: var(--space-500) var(--space-400) var(--space-400);
}

.locationTitle__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-200);
}

.locationTitle__distance {
  display: inline-flex;
  align-items: center;
  gap: var(--space-200);
  color: var(--color-text-light);
}

.locationTile__rating {
  display: inline-flex;
  align-items: center;
  gap: var(--space-100);
  align-self: flex-start;
  font-size: var(--font-xs);
  line-height: var(--line-xs);
  color: var(--color-text-light);
  text-decoration: none;
}

.locationTile__rating b {
  color: var(--color-text);
}

.locationTile__address,
.locationTile__subtitle {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

.locationTile__badge {
  display: flex;
  align-items: center;
  gap: var(--space-200);
  font-size: var(--font-xs);
  line-height: var(--line-xs);
  font-weight: var(--font-bold);
  margin: var(--space-200) 0;
}

.locationTile__badge span {
  margin-top: var(--space-100);
}

.locationTile__imageLink {
  position: relative;
  display: none;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 5 / 3;
  color: var(--color-text-muted);
}

.locationTile__imageLink :deep(img) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.locationTile--showBuildingImage .locationTile__imageLink {
  display: flex;
}

.locationTile--showBuildingImage .locationTile__badge {
  position: absolute;
  top: var(--space-400);
  right: var(--space-400);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: var(--space-200) var(--space-300) var(--space-200) var(--space-200);
  border-radius: var(--border-radius-400);
  color: var(--color-black);
}
</style>
