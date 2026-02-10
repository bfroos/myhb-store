<template>
  <UiLayoutSectionBlock v-if="hasContent">
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="contact">
        <div class="contact__map">
          <div class="contact__map-inner">
            <UiMoleculeLocationMap
              v-if="mapLocation"
              :locations="[mapLocation]"
            />
          </div>
        </div>
        <div v-if="hasAddressOrActions" class="contact__section">
          <address v-if="address" class="contact__address">
            <span
              class="contact__row"
              :aria-label="t('blocks.locationContact.address')"
            >
              <IconMapPin size="1.75em" stroke="1.5" aria-hidden="true" />
              <span class="contact__address-text">
                {{ formatAddressLine1(address) }}<br />
                {{ formatAddressLine2(address) }}
              </span>
            </span>
          </address>
          <div v-if="actionItems.length > 0" class="contact__actions">
            <div
              v-for="item in actionItems"
              :key="item.key"
              class="contact__row"
            >
              <component
                :is="item.icon"
                size="1.75em"
                stroke="1.5"
                aria-hidden="true"
              />
              <UiAtomBaseButton
                variant="secondary"
                size="sm"
                as="a"
                :href="item.href"
                :target="item.target"
                :rel="item.rel"
                fullWidth
              >
                {{ item.label }}
              </UiAtomBaseButton>
            </div>
          </div>
        </div>
        <section v-if="hasOpeningHours" class="contact__hours">
          <div class="contact__row">
            <IconClock size="1.75em" stroke="1.5" aria-hidden="true" />
            <div>
              <h3 class="contact__hours-heading">
                {{ openingHoursHeading }}
              </h3>
              <dl class="contact__hours-list">
                <div
                  v-for="day in openingHoursDays"
                  :key="day.day"
                  class="contact__hours-item"
                >
                  <dt>{{ t(`common.week.${day.day}`) }}</dt>
                  <dd>{{ getDayHours(day) }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import {
  IconBrandWhatsapp,
  IconClock,
  IconMapPin,
  IconNavigation,
  IconPhone,
} from "@tabler/icons-vue";

const UiMoleculeLocationMap = defineAsyncComponent(
  () => import("~/components/ui/molecule/LocationMap.vue"),
);
import { formatDate } from "~/utils/date";
import { getLocationOpenStatus } from "~/utils/locations";
import type {
  CardSettingsDto,
  LocationContactDto,
  SharedAddressDto,
  SharedCoordinatesDto,
  SharedOpeningHoursDto,
} from "~/lib/strapi/dto/components";
import { LocationOpenStatus, WeekDay } from "~/lib/strapi/dto/enums";

const props = defineProps<{
  cardSettings?: CardSettingsDto;
  address?: SharedAddressDto;
  coordinates?: SharedCoordinatesDto | null;
  contact?: LocationContactDto;
  openingHours?: SharedOpeningHoursDto;
  newOpeningDate?: Date | string;
  timezone: string;
}>();

const { t, locale, localeProperties } = useI18n();

const dateLocale = computed(
  () => (localeProperties.value?.iso as string | undefined) ?? locale.value,
);

const hasContent = computed(
  () =>
    !!props.address ||
    !!props.coordinates ||
    !!props.contact?.phoneNumber ||
    !!props.contact?.whatsAppNumber ||
    !!props.openingHours,
);

const hasAddressOrActions = computed(
  () =>
    !!props.address ||
    hasDirections.value ||
    !!props.contact?.phoneNumber ||
    !!props.contact?.whatsAppNumber,
);

const hasDirections = computed(
  () =>
    !!props.coordinates?.lat &&
    !!props.coordinates?.long &&
    Number.isFinite(Number(props.coordinates.lat)) &&
    Number.isFinite(Number(props.coordinates.long)),
);

const hasOpeningHours = computed(() => !!props.openingHours?.week?.length);

const mapLocation = computed(() => {
  const coords = props.coordinates;
  if (!coords || coords.lat == null || coords.long == null) return null;

  const lat = typeof coords.lat === "number" ? coords.lat : Number(coords.lat);
  const long =
    typeof coords.long === "number" ? coords.long : Number(coords.long);
  if (!Number.isFinite(lat) || !Number.isFinite(long)) return null;

  return {
    id: "current",
    name: props.address?.city ?? "Standort",
    slug: "",
    coordinates: { lat, long },
  };
});

const phoneNumber = computed(
  () => props.contact?.phoneNumber?.replace(/\D/g, "") ?? "",
);

const openingHoursDays = computed(() => {
  const allDays = [
    WeekDay.MONDAY,
    WeekDay.TUESDAY,
    WeekDay.WEDNESDAY,
    WeekDay.THURSDAY,
    WeekDay.FRIDAY,
    WeekDay.SATURDAY,
    WeekDay.SUNDAY,
  ];
  const daysMap = new Map(
    props.openingHours?.week?.map((d) => [d.day, d.intervals ?? []]) ?? [],
  );
  return allDays.map((day) => ({
    day,
    intervals: daysMap.get(day) ?? [],
  }));
});

const locationStatus = computed(() =>
  getLocationOpenStatus(props.newOpeningDate, props.timezone),
);

function getCurrentTimeInTimezone(tz: string = "Europe/Berlin") {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "long",
  });
  const parts = formatter.formatToParts(new Date());
  return {
    time: `${parts.find((p) => p.type === "hour")?.value ?? "00"}:${
      parts.find((p) => p.type === "minute")?.value ?? "00"
    }`,
    dayName: parts.find((p) => p.type === "weekday")?.value ?? "",
  };
}

const currentDay = computed(() => {
  const dayMap: Record<string, number> = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6,
  };
  return (
    dayMap[
      getCurrentTimeInTimezone(props.timezone ?? "Europe/Berlin").dayName
    ] ?? 0
  );
});

const currentTime = computed(
  () => getCurrentTimeInTimezone(props.timezone ?? "Europe/Berlin").time,
);

const todayOpeningHours = computed(() => {
  const day = openingHoursDays.value[currentDay.value];
  return day?.intervals?.[0] ?? null;
});

const isCurrentlyOpen = computed(() => {
  if (
    locationStatus.value !== LocationOpenStatus.OPEN ||
    !todayOpeningHours.value
  )
    return false;
  const { opens, closes } = todayOpeningHours.value;
  const current = currentTime.value;
  return current >= opens && current < closes;
});

const openingHoursStatusText = computed(() => {
  if (locationStatus.value === LocationOpenStatus.COMING_SOON) {
    return t("blocks.locationContact.openingHoursComingSoon");
  }
  if (locationStatus.value === LocationOpenStatus.OPEN_SOON) {
    return t("blocks.locationContact.openingHoursOpenSoon", {
      date: formatDate(props.newOpeningDate, dateLocale.value),
    });
  }
  if (locationStatus.value === LocationOpenStatus.OPEN) {
    if (isCurrentlyOpen.value && todayOpeningHours.value?.closes) {
      return t("blocks.locationContact.openingHoursDescription", {
        hours: todayOpeningHours.value.closes,
      });
    }
    if (todayOpeningHours.value?.opens && todayOpeningHours.value?.closes) {
      if (currentTime.value < todayOpeningHours.value.opens) {
        return t("blocks.locationContact.openingHoursToday", {
          opens: todayOpeningHours.value.opens,
          closes: todayOpeningHours.value.closes,
        });
      }
    }
    for (let i = 1; i < 7; i++) {
      const day = openingHoursDays.value[(currentDay.value + i) % 7];
      const interval = day?.intervals?.[0];
      if (interval?.opens && interval?.closes) {
        return t("blocks.locationContact.openingHoursNext", {
          day: t(`common.week.${day!.day}`),
          time: interval.opens,
        });
      }
    }
  }
  return null;
});

const openingHoursHeading = computed(() =>
  openingHoursStatusText.value
    ? `${openingHoursStatusText.value}:`
    : t("blocks.locationContact.openingHours"),
);

type ActionItem = {
  key: string;
  icon: typeof IconNavigation;
  href: string;
  label: string;
  target?: string;
  rel?: string;
};

const actionItems = computed((): ActionItem[] => {
  const items: ActionItem[] = [];
  if (hasDirections.value && props.coordinates) {
    items.push({
      key: "directions",
      icon: IconNavigation,
      href: `https://www.google.com/maps/dir/?api=1&destination=${props.coordinates.lat},${props.coordinates.long}`,
      target: "_blank",
      rel: "noopener noreferrer",
      label: t("blocks.locationContact.directions"),
    });
  }
  if (props.contact?.phoneNumber) {
    items.push({
      key: "phone",
      icon: IconPhone,
      href: `tel:${phoneNumber.value}`,
      label: props.contact.phoneNumber,
    });
  }
  if (props.contact?.whatsAppNumber) {
    items.push({
      key: "whatsapp",
      icon: IconBrandWhatsapp,
      href: `https://wa.me/${props.contact.whatsAppNumber}`,
      target: "_blank",
      rel: "noopener noreferrer",
      label: t("blocks.locationContact.whatsapp"),
    });
  }
  return items;
});

function formatAddressLine1(addr: SharedAddressDto): string {
  return [addr.street, addr.houseNumber].filter(Boolean).join(" ") || "";
}

function formatAddressLine2(addr: SharedAddressDto): string {
  return [addr.postalCode, addr.city].filter(Boolean).join(" ") || "";
}

function getDayHours(day: {
  intervals?: Array<{ opens?: string; closes?: string }>;
}): string {
  const interval = day.intervals?.[0];
  if (interval?.opens && interval?.closes) {
    return `${interval.opens} – ${interval.closes}`;
  }
  return t("common.openingHours.closed");
}
</script>

<style scoped>
.contact {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.contact__map {
  flex: 1;
  min-height: 260px;
  padding: var(--space-card-figure-pad);
}

.contact__map-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  aspect-ratio: 16 / 9;
  min-height: 260px;
  overflow: hidden;
  border-radius: var(--border-radius-card-figure);
}

.contact__map-inner > * {
  flex: 1;
  min-height: 0;
}

.contact__map-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 200px;
  color: var(--color-text-light);
}

.contact__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-500);
  padding: var(--space-card-pad);
}

.contact__address {
  font-style: normal;
}

.contact__row {
  display: grid;
  grid-template-columns: max-content 1fr;
  align-items: flex-start;
  gap: var(--space-500);
}

.contact__address-text {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.contact__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-500);
}

.contact__hours {
  padding: var(--space-card-pad);
  padding-top: 0;
}

.contact__hours-heading {
  font-size: var(--font-md);
  line-height: var(--line-md);
  font-weight: var(--font-regular);
  margin: 0 0 var(--space-500);
}

.contact__hours-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
  margin: 0;
  color: var(--color-text-light);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.contact__hours-item {
  display: grid;
  grid-template-columns: 90px 1fr;
  margin: 0;
}

.contact__hours-item dt {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 100%;
}

.contact__hours-item dt,
.contact__hours-item dd {
  margin: 0;
}

@media (min-width: 900px) {
  .contact {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: max-content max-content;
  }

  .contact__map {
    grid-column: 1;
    grid-row: 1 / 3;
  }

  .contact__section {
    grid-column: 2;
  }

  .contact__hours {
    grid-column: 2;
  }

  .contact__map-inner {
    aspect-ratio: unset;
    height: 100%;
  }
}

@media (min-width: 1340px) {
  .contact {
    grid-template-columns: 6fr 3fr 3fr;
    grid-template-rows: max-content;
  }

  .contact__map {
    grid-column: 1 / 2;
  }

  .contact__section {
    grid-column: 2 / 3;
  }

  .contact__hours {
    grid-column: 3 / 4;
    padding: var(--space-card-pad) var(--space-card-pad-sm)
      var(--space-card-pad) 0;
  }
}
</style>
