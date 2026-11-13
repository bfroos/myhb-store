<template>
  <div class="bookingLocationDialog__root">
    <!-- #78: Kontextzeile „<Behandlung> · ab <Preis>", wenn der Dialog von
         einer Behandlungsseite kommt. Bleibt beim Standortwechsel stehen. -->
    <UiMoleculeBookingTreatmentContext
      v-if="params.treatmentContext"
      v-bind="params.treatmentContext"
    />
    <div ref="contentRef" class="bookingLocationDialog__content">
      <div class="bookingLocationDialog__search">
        <IconField>
          <InputIcon>
            <IconSearch size="16" aria-hidden="true" />
          </InputIcon>
          <AutoComplete
            :model-value="cityInput"
            :suggestions="citySuggestions"
            :placeholder="t('blocks.locationFinder.searchPlaceholder')"
            option-label="label"
            :empty-search-message="t('blocks.locationFinder.noResults')"
            :loading="cityLoading"
            fluid
            show-clear
            @complete="onSearch"
            @item-select="onItemSelect"
            @update:model-value="onInputUpdate"
          />
        </IconField>
        <div class="bookingLocationDialog__geo">
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
          <span v-if="sortiertNachSeitenOrt" class="bookingLocationDialog__geoHint">
            {{ t("dialogs.locationSearch.sortedByPageLocation", { name: seitenOrt?.name ?? "" }) }}
          </span>
          <span v-else-if="selectedCity" class="bookingLocationDialog__geoHint">
            {{ t("dialogs.locationSearch.sortedByDistance") }}
          </span>
          <span
            v-else-if="geoDenied"
            class="bookingLocationDialog__geoHint"
            role="status"
          >
            {{ t("dialogs.locationSearch.locationDenied") }}
          </span>
        </div>
      </div>
      <div class="bookingLocationDialog__results">
        <span v-if="cityError">{{ cityError }}</span>
        <!-- #182: Seitenstandort ohne Online-Buchung (MediaPark Klinik):
             naechste buchbare Lounge direkt anbieten, dazu das Telefon. -->
        <div
          v-if="showResults && ersatzHinweis"
          class="bookingLocationDialog__fallback"
          data-booking-fallback
        >
          <p class="bookingLocationDialog__fallbackText">
            {{ t("dialogs.locationSearch.fallbackUnavailable", { name: ersatzHinweis.von }) }}
          </p>
          <div class="bookingLocationDialog__fallbackActions">
            <UiAtomBaseButton
              v-if="ersatzHinweis.naechste"
              type="button"
              variant="primary"
              size="sm"
              @click="handleLocationBook(ersatzHinweis.naechste)"
            >
              {{ t("dialogs.locationSearch.fallbackNearest", { name: ersatzHinweis.naechste.name, km: ersatzHinweis.km }) }}
            </UiAtomBaseButton>
            <a
              v-if="ersatzHinweis.telHref"
              class="bookingLocationDialog__fallbackTel"
              :href="ersatzHinweis.telHref"
              @click="trackPhoneClick(ersatzHinweis.telefon ?? undefined)"
            >
              <IconPhone size="16" aria-hidden="true" />
              {{ t("dialogs.locationSearch.fallbackCall", { name: ersatzHinweis.von }) }}
              · {{ ersatzHinweis.telefon }}
            </a>
          </div>
        </div>
        <UiMoleculeLocationSearchResults
          v-if="showResults"
          :locations="dialogLocations"
          :on-book="handleLocationBook"
          :on-navigate="handleLocationNavigate"
        />
        <div v-else class="bookingLocationDialog__results-loading">
          <UiLayoutIconWrapper :size="40" rotate>
            <IconLoader />
          </UiLayoutIconWrapper>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  IconCurrentLocation,
  IconLoader,
  IconPhone,
  IconSearch,
} from "@tabler/icons-vue";
import AutoComplete from "primevue/autocomplete";
import type { CitySuggestion } from "~/composables/useGoogleCitySearch";
import {
  isAppBookingUrl,
  useAppBookingDialog,
  withAppTreatmentSlug,
} from "~/composables/useAppBookingDialog";
import type { TreatmentType } from "~/lib/strapi/dto/enums";
import { bookingUrlsOf } from "~/lib/strapi/bookingUrls";
import { istOnlineBuchbar } from "~/lib/bookingAbTest";
const { t } = useI18n();
const dialogRef = inject("dialogRef") as any;
const params = ref<any>({});
const { seitenBehandlung } = useSeitenBehandlung();

/**
 * Messung zu elanagency/myhb-os#205 (Abbruch "Klick -> App geladen"): Ueber
 * die Haelfte der Klicks im App-Arm oeffnet erst diese Standortsuche
 * (`booking_type: location_search`), und GA4 sah bisher nicht, wer sie ohne
 * Auswahl wieder zumacht. `booking_dialog_closed` schliesst die Luecke; die
 * Uebergabe an den App-Dialog und der Sprung auf eine Standortseite zaehlen
 * nicht als Abbruch.
 */
const uebergeben = ref(false);
const mountedAt = ref<number | null>(null);
onBeforeUnmount(() => {
  if (uebergeben.value) return;
  const start = params.value?.openedAt ?? mountedAt.value;
  trackEvent("booking_dialog_closed", {
    ...trackingContext(),
    booking_type: "location_search",
    event_label: "no_location",
    dialog_open_ms:
      typeof start === "number"
        ? Math.round(performance.now() - start)
        : undefined,
  });
});
const { openAppBookingDialog } = useAppBookingDialog();
const { resolveBooking } = useBookingAbTest();
const {
  trackEvent,
  trackBookingClick,
  trackBookingLocationSelected,
} = useGoogleAnalytics();

/** Standort, den der Nutzer im Dialog gewaehlt hat (falls er hier waehlt). */
const bookedLocationSlug = ref<string | undefined>(undefined);

function trackingContext() {
  return {
    location_slug: bookedLocationSlug.value,
    treatment_type: params.value?.treatmentType,
    // #100: Die Variante gehoert an jede Stufe des Funnels — sonst laesst sich
    // `booking_confirmed` nicht gegen den Nenner aus `ab_assigned` stellen.
    ab_variant: params.value?.abVariant,
    ab_fallback: params.value?.abFallback,
    ab_source: params.value?.abSource,
    // #78: Dialog kam von einer Behandlungsseite (Kontextzeile im Kopf).
    treatment_context: !!params.value?.treatmentContext,
  };
}

function handleLocationBook(location: {
  appBookingUrl?: string;
  slug?: string;
}) {
  if (!location.appBookingUrl) return;
  // #100: Auf den Meta-Landingpages steht der Standort erst hier fest — der
  // Bucket dagegen schon seit dem Seitenaufruf. Hier wird er angewendet.
  // #78: `bookingUrlsOf` wertet die Sperre der Redaktion aus. Der Knopf dazu
  // wird zwar gar nicht mehr gerendert, aber die Sperre gehoert an die Stelle,
  // die die URL herausgibt, nicht nur an die, die sie anzeigt.
  const erlaubt = bookingUrlsOf(location as any);
  const { url: targetUrl, abVariant, abFallback, abSource } = resolveBooking({
    appBookingUrl: erlaubt.appBookingUrl,
  });
  // Deeplink #66: Wurde der Dialog von einer Behandlungsseite geoeffnet, haengt
  // der Behandlungs-Slug auch an der App-URL des erst hier gewaehlten
  // Standorts, damit die Behandlung in der App vorausgewaehlt ist.
  // Standorte ohne App-URL zeigen in der Liste ohnehin keinen Knopf
  // (istOnlineBuchbar).
  const bookingUrl = withAppTreatmentSlug(
    targetUrl,
    params.value?.appTreatmentSlug,
  );
  if (!bookingUrl || !isAppBookingUrl(bookingUrl)) return;
  trackBookingLocationSelected("app", location.slug, {
    ab_variant: abVariant,
    ab_fallback: abFallback,
    ab_source: abSource,
    treatment_context: !!params.value?.treatmentContext,
    // #182: Buchung an einer anderen Lounge, weil der Seitenstandort keine
    // Online-Buchung hat.
    ...(ersatzHinweis.value?.vonSlug &&
    location.slug !== ersatzHinweis.value.vonSlug
      ? { fallback_from: ersatzHinweis.value.vonSlug }
      : {}),
  });
  bookedLocationSlug.value = location.slug;
  // Rabattweg (useBookingDialog): Erst hier beginnt der Buchungsversuch.
  // Vor openAppBookingDialog, damit die App dieselbe checkout_id bekommt.
  if (params.value?.deferCheckout) {
    trackBookingClick("app", {
      treatment_type: params.value?.treatmentType,
      location_slug: location.slug,
      ab_variant: abVariant,
      ab_fallback: abFallback,
      ab_source: abSource,
      treatment_context: !!params.value?.treatmentContext,
      booking_value: params.value?.bookingValue,
      offer: params.value?.offer,
      via_modal: params.value?.viaModal || undefined,
    });
    params.value = { ...params.value, deferCheckout: false };
  }
  uebergeben.value = true;
  dialogRef.value.close();
  // #78: Die Kontextzeile wandert mit in den App-Dialog.
  openAppBookingDialog(t("cta.bookAppointment"), bookingUrl, {
    abVariant,
    abSource,
    treatmentContext: params.value?.treatmentContext,
    offer: params.value?.offer,
    lead: params.value?.prefill?.leadToken,
  });
}

function handleLocationNavigate() {
  uebergeben.value = true;
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

// #182 (go.): Kennt die Seite ihren Standort, sortiert die Liste ohne
// Standortfreigabe nach Entfernung zu diesem Ort. Vorher blieb sie unsortiert
// und Koeln MediaPark zeigte Berlin zuoberst.
const { isAdsMode } = useSiteModeFlags();
const { seitenOrt } = useSeitenStandort();
const { trackPhoneClick } = useGoogleAnalytics();
const SEITEN_ORT_ID = "seiten-ort";
const sortiertNachSeitenOrt = computed(
  () =>
    !!seitenOrt.value &&
    !!selectedCity.value &&
    selectedCity.value.placeId === SEITEN_ORT_ID,
);
function sortiereNachSeitenOrt(): boolean {
  const ort = seitenOrt.value;
  if (!isAdsMode.value || !ort) return false;
  selectedCity.value = {
    label: ort.name ?? "",
    placeId: SEITEN_ORT_ID,
    formattedAddress: ort.name ?? "",
    lat: ort.lat,
    lng: ort.long,
  };
  return true;
}

/** Ohne den Seitenstandort selbst, wenn er nicht online buchbar ist. */
const dialogLocations = computed(() => {
  const ort = seitenOrt.value;
  const list = sortedLocations.value ?? [];
  if (!isAdsMode.value || !ort || ort.buchbar || !ort.slug) return list;
  return list.filter((loc) => loc.slug !== ort.slug);
});

const ersatzHinweis = computed(() => {
  const ort = seitenOrt.value;
  if (!isAdsMode.value || !ort || ort.buchbar) return null;
  const naechste = sortiertNachSeitenOrt.value
    ? (dialogLocations.value.find(
        (loc: any) => istOnlineBuchbar(bookingUrlsOf(loc)),
      ) as any)
    : null;
  const km = naechste?.distanceInKilometers;
  const digits = (ort.phoneNumber ?? "").replace(/[^\d+]/g, "");
  return {
    von: ort.name ?? "",
    vonSlug: ort.slug,
    naechste: naechste ?? null,
    km:
      typeof km === "number"
        ? new Intl.NumberFormat("de-DE", { maximumFractionDigits: km < 10 ? 1 : 0 }).format(km)
        : "",
    telefon: ort.phoneNumber ?? null,
    telHref: digits ? `tel:${digits}` : null,
  };
});

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
  mountedAt.value = performance.now();

  {
    showResults.value = false;
    // pathKey nur, wenn der Dialog fuer die Behandlung DIESER Seite offen ist
    // (gleicher Typ). Dann blendet myhb-cms Standorte aus, die die Behandlung
    // in ihrer Stadt abgeben (Köln: Facelift nur MediaPark, Botox nur Arcaden).
    const seite = seitenBehandlung.value;
    const pathKey =
      seite?.pathKey && seite.treatmentType === params.value?.treatmentType
        ? seite.pathKey
        : undefined;
    await fetchLocations({
      treatmentType: params.value?.treatmentType as TreatmentType,
      pathKey,
      force: true,
    });
    showResults.value = true;
    if (!sortiereNachSeitenOrt()) sortByLocationIfPermitted();
  }
});

watch(selectedCity, (city) => {
  if (city) scrollContentToTop();
});
</script>
<style scoped>
.bookingLocationDialog__root {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.bookingLocationDialog__content {
  overflow-y: auto;
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.bookingLocationDialog__search {
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

.bookingLocationDialog__geo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-200) var(--space-400);
}

.bookingLocationDialog__geoHint {
  font-size: var(--font-xs);
  line-height: var(--line-xs);
  color: var(--color-text-light);
}

.bookingLocationDialog__results {
  position: relative;
  padding: var(--space-400) var(--space-card-pad-xs) var(--space-card-pad-xs)
    var(--space-card-pad-xs);
}

.bookingLocationDialog__fallback {
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
  margin-bottom: var(--space-400);
  padding: var(--space-400);
  border-radius: var(--border-radius-200);
  background: linear-gradient(to right, #f6eef6, #fff5f1);
}

.bookingLocationDialog__fallbackText {
  margin: 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  font-weight: var(--font-bold);
}

.bookingLocationDialog__fallbackActions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-300) var(--space-500);
}

.bookingLocationDialog__fallbackTel {
  display: inline-flex;
  align-items: center;
  gap: var(--space-200);
  font-size: var(--font-sm);
  color: var(--color-text);
}

.bookingLocationDialog__results-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
