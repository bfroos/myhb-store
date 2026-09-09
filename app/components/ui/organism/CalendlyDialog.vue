<template>
  <CalendlyInlineWidget
    v-if="params.url"
    :url="params.url"
    class="calendlyDialog"
    :page-settings="{
      hideLandingPageDetails: true,
      hideEventTypeDetails: true,
      hideGdprBanner: true,
    }"
  />
  <template v-else>
    <div ref="contentRef" class="calendlyDialog__content">
      <div class="calendlyDialog__search">
        <IconField>
          <InputIcon>
            <IconSearch size="16" aria-hidden="true" />
          </InputIcon>
          <AutoComplete
            :model-value="cityInput"
            :suggestions="citySuggestions"
            :placeholder="t('blocks.locationFinder.searchPlaceholder')"
            option-label="label"
            :loading="cityLoading"
            fluid
            show-clear
            @complete="onSearch"
            @item-select="onItemSelect"
            @update:model-value="onInputUpdate"
          />
        </IconField>
        <div class="calendlyDialog__geo">
          <UiAtomBaseButton
            type="button"
            variant="secondary"
            size="sm"
            :disabled="geolocationLoading"
            @click="handleUseMyLocation"
          >
            <template #prefix>
              <IconCurrentLocation size="16" aria-hidden="true" />
            </template>
            {{ t("blocks.locationFinder.useMyLocation") }}
          </UiAtomBaseButton>
          <span v-if="selectedCity" class="calendlyDialog__geoHint">
            {{ t("dialogs.calendly.sortedByDistance") }}
          </span>
          <span
            v-else-if="geoDenied"
            class="calendlyDialog__geoHint"
            role="status"
          >
            {{ t("dialogs.calendly.locationDenied") }}
          </span>
        </div>
      </div>
      <div class="calendlyDialog__results">
        <span v-if="cityError">{{ cityError }}</span>
        <UiMoleculeLocationSearchResults
          v-if="showResults"
          :locations="sortedLocations"
          :on-book="handleLocationBook"
          :on-navigate="handleLocationNavigate"
        />
        <div v-else class="calendlyDialog__results-loading">
          <UiLayoutIconWrapper :size="40" rotate>
            <IconLoader />
          </UiLayoutIconWrapper>
        </div>
      </div>
    </div>
  </template>
</template>
<script setup lang="ts">
import { IconCurrentLocation, IconLoader, IconSearch } from "@tabler/icons-vue";
import AutoComplete from "primevue/autocomplete";
import type { CitySuggestion } from "~/composables/useGoogleCitySearch";
import {
  isAppBookingUrl,
  useAppBookingDialog,
  withAppTreatmentSlug,
} from "~/composables/useAppBookingDialog";
import type { TreatmentType } from "~/lib/strapi/dto/enums";

const { t } = useI18n();
const dialogRef = inject("dialogRef") as any;
const params = ref<any>({});
const { openAppBookingDialog } = useAppBookingDialog();
const {
  trackBookingLocationSelected,
  trackCalendlyDateTimeSelected,
  trackCalendlyBookingConfirmed,
} = useGoogleAnalytics();

/** Standort, den der Nutzer im Dialog gewaehlt hat (falls er hier waehlt). */
const bookedLocationSlug = ref<string | undefined>(undefined);

/**
 * Calendly-Nutzername aus der Buchungs-URL, z. B.
 * "https://calendly.com/aquis-plaza-aachen" -> "aquis-plaza-aachen". Dient als
 * Standort-Kennung, wenn der Dialog schon mit einer URL geoeffnet wurde (also
 * von einer Standortseite) und es hier keine Auswahl gab.
 */
function calendlyUserFromUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    return new URL(url).pathname.split("/").filter(Boolean)[0];
  } catch {
    return undefined;
  }
}

function trackingContext() {
  return {
    location_slug: bookedLocationSlug.value ?? calendlyUserFromUrl(params.value?.url),
    treatment_type: params.value?.treatmentType,
  };
}

// Conversion-Messung fuer Calendly (#67). Bis hierher wurde nur getrackt, dass
// das Widget *aufgeht* – nicht, dass jemand bucht. Ohne diesen Zaehler laesst
// sich die Conversion Rate von Calendly nicht gegen die der App stellen.
//
// Die Message kommt aus dem Calendly-iFrame; `embed_domain` setzt nuxt-calendly
// selbst, sonst kaeme sie gar nicht an. Der Origin-Check gehoert dazu, weil der
// Listener der Library auf `window` haengt und jede Seite `event`-Nachrichten
// schicken koennte – sonst liessen sich Conversions faken.
const CALENDLY_ORIGIN = "https://calendly.com";
const seenScheduledIds = new Set<string>();

function isFromCalendly(e: MessageEvent) {
  return e.origin === CALENDLY_ORIGIN;
}

useCalendlyEventListener({
  onDateAndTimeSelected: (e: MessageEvent) => {
    if (!isFromCalendly(e)) return;
    trackCalendlyDateTimeSelected(trackingContext());
  },
  onEventScheduled: (e: MessageEvent) => {
    if (!isFromCalendly(e)) return;
    // Die Invitee-URI identifiziert die Buchung eindeutig; das Widget schickt
    // die Nachricht gelegentlich doppelt.
    const inviteeUri = (e.data as any)?.payload?.invitee?.uri as
      | string
      | undefined;
    if (inviteeUri) {
      if (seenScheduledIds.has(inviteeUri)) return;
      seenScheduledIds.add(inviteeUri);
    }
    trackCalendlyBookingConfirmed({
      ...trackingContext(),
      event_id: inviteeUri,
    });
  },
});

function handleLocationBook(location: { calendlyUrl?: string; slug?: string }) {
  if (!location.calendlyUrl) return;
  // Deeplink #66: Wurde der Dialog von einer Behandlungsseite geoeffnet, haengt
  // der Behandlungs-Slug auch an der App-URL des erst hier gewaehlten
  // Standorts, damit die Behandlung in der App vorausgewaehlt ist.
  const bookingUrl =
    withAppTreatmentSlug(
      location.calendlyUrl,
      params.value?.appTreatmentSlug,
    ) ?? location.calendlyUrl;
  const isApp = isAppBookingUrl(bookingUrl);
  // Conversion-Audit #67: Standortwahl im Dialog tracken, aufgeteilt nach
  // Buchungssystem (Calendly vs. App), damit die Migration messbar ist.
  trackBookingLocationSelected(isApp ? "app" : "calendly", location.slug);
  bookedLocationSlug.value = location.slug;
  // If the picked location already uses the in-app booking flow, close this
  // Calendly dialog and open the in-app iframe dialog instead. Calendly
  // locations keep rendering the inline widget in place as before.
  if (isApp) {
    dialogRef.value.close();
    openAppBookingDialog(t("cta.bookAppointment"), bookingUrl);
    return;
  }
  params.value = { ...params.value, url: bookingUrl };
}

function handleLocationNavigate() {
  dialogRef.value.close();
}

const {
  citySuggestions,
  cityLoading,
  cityError,
  cityInput,
  selectedCity,
  sortedLocations,
  onSearch,
  onSelect,
  fetchLocations,
  useMyLocation,
  geolocationLoading,
} = useLocationFinder();

const contentRef = ref<HTMLElement | null>(null);
const showResults = ref(false);
const geoDenied = ref(false);

// Conversion-Audit #78: Ohne Standortfreigabe war die Liste unsortiert
// (Leipzig zuerst). Der Button fragt die Position an und sortiert nach
// Entfernung; bei bereits erteilter Berechtigung passiert das automatisch
// beim Oeffnen, ohne erneuten Browser-Prompt.
async function handleUseMyLocation() {
  geoDenied.value = false;
  await useMyLocation();
  if (!selectedCity.value) geoDenied.value = true;
}

async function sortByLocationIfPermitted() {
  if (!import.meta.client) return;
  try {
    const perms = (navigator as any).permissions;
    if (!perms?.query) return;
    const status = await perms.query({ name: "geolocation" });
    if (status?.state === "granted") await useMyLocation();
  } catch {
    // Permissions API nicht verfuegbar (Safari < 16) -> nur per Button
  }
}

function scrollContentToTop() {
  nextTick(() => {
    setTimeout(() => {
      contentRef.value?.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  });
}

function onInputUpdate(val: string | CitySuggestion | null) {
  cityInput.value = val;
}

function onItemSelect(event: { value: CitySuggestion }) {
  onSelect({ value: event.value });
}

onMounted(async () => {
  params.value = dialogRef.value.data;

  if (!params.value?.url) {
    showResults.value = false;
    await fetchLocations({
      treatmentType: params.value?.treatmentType as TreatmentType,
      force: true,
    });
    showResults.value = true;
    sortByLocationIfPermitted();
  }
});

watch(selectedCity, (city) => {
  if (city) scrollContentToTop();
});
</script>
<style scoped>
.calendlyDialog {
  width: 100% !important;
  height: 100% !important;
  overflow: hidden;
}

.calendlyDialog__content {
  overflow-y: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.calendlyDialog__search {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--color-card-bg-light);
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
  padding: var(--space-400) var(--space-card-pad-xs);
  border-bottom: 1px var(--color-border-mute) solid;
  backdrop-filter: blur(10px);
}

.calendlyDialog__geo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-200) var(--space-400);
}

.calendlyDialog__geoHint {
  font-size: var(--font-xs);
  line-height: var(--line-xs);
  color: var(--color-text-light);
}

.calendlyDialog__results {
  position: relative;
  padding: var(--space-400) var(--space-card-pad-xs) var(--space-card-pad-xs)
    var(--space-card-pad-xs);
}

.calendlyDialog__results-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
