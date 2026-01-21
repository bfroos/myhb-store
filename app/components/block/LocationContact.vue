<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="locationContact">
        <div class="locationContact__map">
          <div class="locationContact__mapInner">
            <iframe
              v-if="mapUrl"
              :src="mapUrl"
              width="100%"
              height="100%"
              style="border: 0"
              :allowfullscreen="true"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              :title="$t('blocks.locationContact.map.title')"
            ></iframe>
          </div>
        </div>
        <div class="locationContact__contact">
          <div v-if="address" class="locationContact__row">
            <IconMapPin size="1.75em" stroke="1.5" />
            <div :aria-label="$t('blocks.locationContact.address')">
              {{ address?.street }} {{ address?.houseNumber }} <br />{{
                address?.postalCode
              }}
              {{ address?.city }}
            </div>
          </div>
          <div class="locationContact__actions">
            <div
              v-if="coordinates?.lat && coordinates?.long"
              class="locationContact__row"
            >
              <IconNavigation size="1.75em" stroke="1.5" />
              <div>
                <UiAtomBaseButton
                  variant="secondary"
                  size="sm"
                  as="a"
                  :href="`https://www.google.com/maps/dir/?api=1&destination=${coordinates?.lat},${coordinates?.long}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  fullWidth
                >
                  {{ $t("blocks.locationContact.directions") }}
                </UiAtomBaseButton>
              </div>
            </div>
            <div v-if="contact?.phoneNumber" class="locationContact__row">
              <IconPhone size="1.75em" stroke="1.5" />
              <div>
                <UiAtomBaseButton
                  variant="secondary"
                  size="sm"
                  :href="`tel:${contact?.phoneNumber}`"
                  fullWidth
                >
                  {{ contact?.phoneNumber }}
                </UiAtomBaseButton>
              </div>
            </div>
            <div v-if="contact?.whatsAppNumber" class="locationContact__row">
              <IconBrandWhatsapp size="1.75em" stroke="1.5" />
              <div>
                <UiAtomBaseButton
                  variant="secondary"
                  size="sm"
                  :href="`https://wa.me/${contact?.whatsAppNumber}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  fullWidth
                >
                  {{ $t("blocks.locationContact.whatsapp") }}
                </UiAtomBaseButton>
              </div>
            </div>
          </div>
        </div>
        <div v-if="openingHours" class="locationContact__openingHours">
          <div class="locationContact__row">
            <IconClock size="1.75em" stroke="1.5" />
            <div>
              <h3>
                <template v-if="openingHoursStatusText">
                  {{ openingHoursStatusText }}:
                </template>
                <template v-else>
                  {{ $t("blocks.locationContact.openingHours") }}
                </template>
              </h3>
              <dl class="locationContact__openingHoursList">
                <div v-for="day in openingHoursDays" :key="day.day">
                  <dt>{{ $t(`common.week.${day.day}`) }}</dt>
                  <dd>
                    <template
                      v-if="
                        day.intervals?.[0]?.opens && day.intervals?.[0]?.closes
                      "
                    >
                      {{ day.intervals?.[0]?.opens }} –
                      {{ day.intervals?.[0]?.closes }}
                    </template>
                    <template v-else>
                      {{ $t("common.openingHours.closed") }}
                    </template>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import {
  IconBrandWhatsapp,
  IconNavigation,
  IconClock,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-vue";
import type {
  CardSettingsDto,
  LocationContactDto,
  SharedCoordinatesDto,
  SharedOpeningHoursDto,
} from "~/lib/strapi/dto/components";
import type { SharedAddressDto } from "~/lib/strapi/dto/components";
import { WeekDay, LocationOpenStatus } from "~/lib/strapi/dto/enums";

const props = defineProps<{
  cardSettings?: CardSettingsDto;
  address?: SharedAddressDto;
  coordinates?: SharedCoordinatesDto | null;
  contact?: LocationContactDto;
  openingHours?: SharedOpeningHoursDto;
  newOpeningDate?: Date | string;
  timezone: string;
}>();

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
    props.openingHours?.week?.map((day) => [day.day, day.intervals ?? []]) ??
      [],
  );

  return allDays.map((day) => ({
    day,
    intervals: daysMap.get(day) ?? [],
  }));
});

const locationStatus = computed(() => {
  return getLocationOpenStatus(props.newOpeningDate, props.timezone);
});

// Helper function: Current time in the timezone of the location
const getCurrentTimeInTimezone = (timezone: string = "Europe/Berlin") => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    day: "numeric",
    weekday: "long",
  });

  const parts = formatter.formatToParts(now);
  const hours = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minutes = parts.find((p) => p.type === "minute")?.value ?? "00";
  const dayName = parts.find((p) => p.type === "weekday")?.value ?? "";

  return {
    time: `${hours}:${minutes}`,
    dayName,
  };
};

const currentDay = computed((): number => {
  const timezone = props.timezone ?? "Europe/Berlin";
  const { dayName } = getCurrentTimeInTimezone(timezone);

  const dayMap: Record<string, number> = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6,
  };

  return dayMap[dayName] ?? 0;
});

const currentTime = computed(() => {
  const timezone = props.timezone ?? "Europe/Berlin";
  return getCurrentTimeInTimezone(timezone).time;
});

const todayOpeningHours = computed(() => {
  const dayIndex = currentDay.value;
  if (dayIndex < 0 || dayIndex >= openingHoursDays.value.length) return null;
  const todayDay = openingHoursDays.value[dayIndex];
  return todayDay?.intervals?.[0] ?? null;
});

const isCurrentlyOpen = computed(() => {
  if (locationStatus.value !== LocationOpenStatus.OPEN) return false;
  if (!todayOpeningHours.value) return false;

  const opens = todayOpeningHours.value.opens;
  const closes = todayOpeningHours.value.closes;
  const current = currentTime.value;

  return current >= opens && current < closes;
});

const openingHoursStatusText = computed(() => {
  const { t, locale, localeProperties } = useI18n();
  const dateLocale = computed<string>(() => {
    const iso = localeProperties.value?.iso as string | undefined;
    return iso ?? locale.value;
  });

  // Coming Soon: No newOpeningDate
  if (locationStatus.value === LocationOpenStatus.COMING_SOON) {
    return t("blocks.locationContact.openingHoursComingSoon");
  }

  // Open Soon: newOpeningDate in the future
  if (locationStatus.value === LocationOpenStatus.OPEN_SOON) {
    const date = formatDate(props.newOpeningDate, dateLocale.value);
    return t("blocks.locationContact.openingHoursOpenSoon", { date });
  }

  // Location is open
  if (locationStatus.value === LocationOpenStatus.OPEN) {
    // If currently open
    if (isCurrentlyOpen.value && todayOpeningHours.value?.closes) {
      return t("blocks.locationContact.openingHoursDescription", {
        hours: todayOpeningHours.value.closes,
      });
    }

    // If today opens (but not yet opened)
    if (todayOpeningHours.value?.opens && todayOpeningHours.value?.closes) {
      const current = currentTime.value;
      if (current < todayOpeningHours.value.opens) {
        return t("blocks.locationContact.openingHoursToday", {
          opens: todayOpeningHours.value.opens,
          closes: todayOpeningHours.value.closes,
        });
      }
    }

    // If today is closed, show next opening day
    // Start search from tomorrow (i = 1), not today
    for (let i = 1; i < 7; i++) {
      const dayIndex = (currentDay.value + i) % 7;
      const day = openingHoursDays.value[dayIndex];
      if (day?.intervals?.[0]?.opens && day?.intervals?.[0]?.closes) {
        const dayName = t(`common.week.${day.day}`);
        return t("blocks.locationContact.openingHoursNext", {
          day: dayName,
          time: day.intervals[0].opens,
        });
      }
    }
  }

  return null;
});

const mapUrl = computed(() => {
  if (props.coordinates?.lat && props.coordinates?.long) {
    const lat = Number(props.coordinates.lat);
    const long = Number(props.coordinates.long);
    if (!isNaN(lat) && !isNaN(long)) {
      return `https://www.google.com/maps?q=${lat},${long}&output=embed`;
    }
  }

  if (props.address) {
    const addressParts = [
      props.address.street,
      props.address.houseNumber,
      props.address.postalCode,
      props.address.city,
    ]
      .filter(Boolean)
      .join(" ");
    if (addressParts) {
      return `https://www.google.com/maps?q=${encodeURIComponent(
        addressParts,
      )}&output=embed`;
    }
  }

  return null;
});
</script>
<style scoped>
.locationContact__map {
  flex: 1;
  min-height: 260px;
  padding: var(--space-card-figure-pad);
}

.locationContact__mapInner {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: var(--border-radius-card-figure);
}

.locationContact__map iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.locationContact__contact,
.locationContact__openingHours {
  padding: var(--space-card-pad);
  flex: 1;
}

.locationContact__contact {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-500);
}

.locationContact__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-500);
}

.locationContact__row {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: var(--space-500);
}

.locationContact__openingHoursList {
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
  color: var(--color-text-light);
}
.locationContact__openingHoursList > div {
  display: grid;
  grid-template-columns: 120px 1fr;
}
.locationContact__openingHours h3 {
  font-size: var(--font-md);
  line-height: var(--line-md);
  font-weight: var(--font-regular);
  margin: 0 0 var(--space-500);
}

@media screen and (min-width: 900px) {
  .locationContact {
    display: grid;
    grid-template-columns: 5fr 3fr 3fr;
  }
  .locationContact__mapInner {
    aspect-ratio: unset;
    height: 100%;
  }
}
</style>
