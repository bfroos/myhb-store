<template>
  <div
    class="locationTile"
    :class="{ 'locationTile--list': layout === 'list' }"
  >
    <NuxtLinkLocale
      :to="buildLocationPath(item)"
      class="locationTile__imageLink"
    >
      <div class="locationTile__image">
        <UiAtomMediaPicture
          v-if="item.buildingImage && isMediaImage(item.buildingImage)"
          :media="item.buildingImage"
          :sources="{
            [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
          }"
        />
        <IconBuildingStore v-else size="50%" stroke="1" />
      </div>
    </NuxtLinkLocale>
    <div class="locationTile__content">
      <b v-if="item.city">{{ item.city.name }}</b>
      <p v-if="item.name" class="locationTile__name">{{ item.name }}</p>
      <p v-if="item.address" class="locationTile__address">
        {{ item.address.street }} {{ item.address.houseNumber }} ({{
          item.address.postalCode
        }})
      </p>
      <div v-if="badgeText" class="locationTile__badge">
        <IconCalendarQuestion v-if="isComingSoon" size="1.75em" stroke="2" />
        <IconCalendarStar v-else size="1.75em" stroke="2" />
        <span>{{ badgeText }}</span>
      </div>
    </div>
    <div class="locationTile__actions">
      <UiAtomBaseButton size="sm" @click="handleBookClick">
        {{ $t("cta.bookAppointment") }}
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
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IconBuildingStore,
  IconCalendarQuestion,
  IconCalendarStar,
} from "@tabler/icons-vue";
import type { MoleculeLocationItem } from "~/lib/ui/types";
import {
  ImageFormat,
  ImageBreakpoint,
  LocationOpenStatus,
} from "~/lib/strapi/dto/enums";
import { isMediaImage } from "~/utils/media";

const props = defineProps<{
  item: MoleculeLocationItem;
  layout?: "card" | "list";
  onBook?: () => void;
}>();

const emit = defineEmits<{
  book: [];
  close: any;
}>();

const { locale, locales } = useI18n();

const handleBookClick = () => {
  if (props.onBook) {
    props.onBook();
  } else {
    emit("book");
  }
};

const handleDetailsClick = () => {
  emit("close");
};

const isComingSoon = computed(
  () => props.item.openingStatus === LocationOpenStatus.COMING_SOON
);

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
      (l: any) => l.code === locale.value
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
  flex-direction: column;
  gap: var(--space-200);
  border-radius: var(--border-radius-500);
  overflow: hidden;
  background: var(--color-gray-100);
  color: var(--color-text);
}

.locationTile__content {
  flex: 1;
  padding: var(--space-400);
}

.locationTile__image {
  position: relative;
  aspect-ratio: 5 / 3;
  overflow: hidden;
  background: var(--color-gray-300);
  color: var(--color-gray-500);
}

.locationTile__image :deep(img) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.locationTile__image :deep(svg) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.locationTile__name {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.locationTile__address {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

.locationTile__actions {
  display: flex;
  gap: var(--space-300);
  padding: 0 var(--space-400) var(--space-400) var(--space-400);
}

.locationTile__badge {
  position: absolute;
  top: var(--space-400);
  right: var(--space-400);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: var(--space-200) var(--space-300) var(--space-200) var(--space-200);
  border-radius: var(--border-radius-400);
  display: flex;
  align-items: center;
  gap: var(--space-300);
  font-size: var(--font-xs);
  line-height: var(--line-xs);
  font-weight: var(--font-bold);
  color: var(--color-black);
}

.locationTile--list {
  display: grid;
  grid-template-columns: 90px 1fr max-content;
  align-items: center;
}

.locationTile--list .locationTile__imageLink {
  display: block;
  width: 100%;
  height: 100%;
}

.locationTile--list .locationTile__image {
  aspect-ratio: auto;
  height: 100%;
}

.locationTile--list .locationTile__actions {
  flex-direction: column;
  padding: var(--space-300);
}

.card--neutral .locationTile {
  background: var(--color-gray-900);
}

.card--neutral .locationTile__image {
  background: var(--color-gray-950);
}

.card--strong .locationTile {
  background: var(--color-gray-900);
}

.card--strong .locationTile__image {
  background: var(--color-black);
}
</style>
