<template>
  <section id="bewerbung" class="application theme-light">
    <h2 class="application__heading">{{ $t("career.application.headline") }}</h2>
    <p class="application__intro">{{ $t("career.application.intro") }}</p>

    <Message v-if="success" severity="success" class="application__message">
      <strong>{{ $t("career.application.success.headline") }}</strong>
      <br>
      {{ $t("career.application.success.text") }}
    </Message>

    <form v-else class="application__form" novalidate @submit.prevent="handleSubmit">
      <Message v-if="error" severity="error" class="application__message">
        {{ error }}
      </Message>

      <div class="application__row">
        <div class="application__field">
          <label for="bewerbung-vorname">{{ $t("career.application.firstName") }}</label>
          <InputText
            id="bewerbung-vorname"
            v-model="form.vorname"
            autocomplete="given-name"
            required
          />
        </div>
        <div class="application__field">
          <label for="bewerbung-nachname">{{ $t("career.application.lastName") }}</label>
          <InputText
            id="bewerbung-nachname"
            v-model="form.nachname"
            autocomplete="family-name"
            required
          />
        </div>
      </div>

      <div class="application__row">
        <div class="application__field">
          <label for="bewerbung-email">{{ $t("career.application.email") }}</label>
          <InputText
            id="bewerbung-email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            required
          />
        </div>
        <div class="application__field">
          <label for="bewerbung-telefon">{{ $t("career.application.phone") }}</label>
          <InputText
            id="bewerbung-telefon"
            v-model="form.telefon"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            required
          />
        </div>
      </div>

      <div class="application__row">
        <div class="application__field">
          <label for="bewerbung-ausbildungsstand">
            {{ $t("career.application.trainingLevel") }}
          </label>
          <Select
            id="bewerbung-ausbildungsstand"
            v-model="form.ausbildungsstand"
            :options="ausbildungsstandOptionen"
            option-label="label"
            option-value="value"
            :placeholder="$t('career.application.selectPlaceholder')"
          />
        </div>
        <div class="application__field">
          <label for="bewerbung-standort">{{ $t("career.application.location") }}</label>
          <Select
            id="bewerbung-standort"
            v-model="form.wunschstandort"
            :options="standortOptionen"
            :placeholder="$t('career.application.selectPlaceholder')"
          />
        </div>
      </div>

      <div class="application__field">
        <label for="bewerbung-cv">{{ $t("career.application.cv") }}</label>
        <input
          id="bewerbung-cv"
          ref="cvInput"
          type="file"
          class="application__file"
          :accept="cvAccept"
          required
          @change="handleFileChange"
        >
        <small class="application__hint">{{ $t("career.application.cvHint") }}</small>
      </div>

      <div class="application__field">
        <label for="bewerbung-nachricht">{{ $t("career.application.message") }}</label>
        <Textarea
          id="bewerbung-nachricht"
          v-model="form.nachricht"
          rows="4"
          auto-resize
          :maxlength="BEWERBUNG_MAX_NACHRICHT"
        />
      </div>

      <!--
        Honeypot: fuer Menschen unsichtbar, fuer Bots ein Pflichtfeld-Reflex.
        Kein `type="hidden"` — das fuellen Bots gerade nicht aus.
      -->
      <div class="application__honeypot" aria-hidden="true">
        <label for="bewerbung-website">Website</label>
        <input
          id="bewerbung-website"
          v-model="form.website"
          type="text"
          tabindex="-1"
          autocomplete="off"
        >
      </div>

      <div class="application__consent">
        <Checkbox
          v-model="form.datenschutz"
          input-id="bewerbung-datenschutz"
          binary
        />
        <label for="bewerbung-datenschutz">
          {{ $t("career.application.privacyBefore") }}
          <NuxtLinkLocale to="/p/datenschutz" target="_blank">
            {{ $t("career.application.privacyLinkText") }}
          </NuxtLinkLocale>
          {{ $t("career.application.privacyAfter", { months: retentionMonths }) }}
        </label>
      </div>

      <UiAtomBaseButton type="submit" size="lg" :disabled="loading">
        {{ loading ? $t("career.application.submitting") : $t("career.application.submit") }}
      </UiAtomBaseButton>
    </form>
  </section>
</template>

<script setup lang="ts">
/**
 * Bewerbungsformular fuer die Karriereseite Aerzte (bfroos/myhb-store#102).
 *
 * Schickt an /api/karriere/bewerbung, das die Bewerbung in HubSpot anlegt.
 * `career_apply` feuert erst, wenn die Route bestaetigt hat — sonst zaehlt die
 * einzige Conversion-Zahl des Recruiting-Funnels auch fehlgeschlagene Versuche.
 *
 * Sprache: Das Formular duzt, weil die ganze Karriereseite duzt ("Du stehst
 * in der Facharztweiterbildung", "Schick uns deine Bewerbung"). Ein Formular,
 * das mitten auf der Seite ins Sie wechselt, liest sich wie ein fremdes
 * Unternehmen. Wenn die Anrede auf der Seite auf Sie umgestellt wird, gehoeren
 * die Texte unter `career.application` in de.json mit umgestellt.
 */
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Select from "primevue/select";
import Checkbox from "primevue/checkbox";
import {
  AUSBILDUNGSSTAND_OPTIONEN,
  BEWERBUNG_MAX_NACHRICHT,
  CV_ERLAUBTE_ENDUNGEN,
  CV_MAX_BYTES,
  WUNSCHSTANDORT_FLEXIBEL,
} from "#shared/karriere";

const props = withDefaults(
  defineProps<{
    /** Landet als `bewerbung_quelle` am HubSpot-Kontakt. */
    quelle?: string;
  }>(),
  { quelle: "karriere-aerzte" },
);

const { t, locale, fallbackLocale } = useI18n();
const { trackCareerApply } = useGoogleAnalytics();

const retentionMonths = 6;
const cvAccept = CV_ERLAUBTE_ENDUNGEN.join(",");
const ausbildungsstandOptionen = AUSBILDUNGSSTAND_OPTIONEN;

const form = reactive({
  vorname: "",
  nachname: "",
  email: "",
  telefon: "",
  ausbildungsstand: "",
  wunschstandort: "",
  nachricht: "",
  datenschutz: false,
  website: "",
});

const cvInput = ref<HTMLInputElement | null>(null);
const cvDatei = ref<File | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

// Die Standorte kommen aus Strapi, damit eine neue Lounge nicht per Deploy ins
// Dropdown muss. Faellt der Abruf aus, bleibt "Ortsunabhaengig" uebrig — das
// Formular ist dann immer noch absendbar.
const activeLocale = (locale.value || fallbackLocale.value) as string;
const { data: locationData } = await useStrapiFetch<any>("/locations", {
  query: {
    locale: activeLocale,
    fields: ["name"],
    sort: ["name:asc"],
    pagination: { page: 1, pageSize: 100 },
  },
  fetchOptions: { key: `applicationLocations:${activeLocale}` },
});

const standortOptionen = computed<string[]>(() => {
  const namen = ((locationData.value?.data ?? []) as Array<{ name?: string }>)
    .map((location) => location.name)
    .filter((name): name is string => !!name);
  return [...namen, WUNSCHSTANDORT_FLEXIBEL];
});

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  cvDatei.value = input.files?.[0] ?? null;
}

function validiere(): string | null {
  if (!form.vorname.trim() || !form.nachname.trim()) {
    return t("career.application.errors.name");
  }
  if (!/\S+@\S+\.\S+/.test(form.email)) {
    return t("career.application.errors.email");
  }
  if (!form.telefon.trim()) return t("career.application.errors.phone");
  if (!form.ausbildungsstand) {
    return t("career.application.errors.trainingLevel");
  }
  if (!form.wunschstandort) return t("career.application.errors.location");
  if (!cvDatei.value) return t("career.application.errors.cvMissing");

  const name = cvDatei.value.name.toLowerCase();
  const endungOk = CV_ERLAUBTE_ENDUNGEN.some((endung) => name.endsWith(endung));
  if (!endungOk) return t("career.application.errors.cvType");
  if (cvDatei.value.size > CV_MAX_BYTES) {
    return t("career.application.errors.cvSize");
  }
  if (!form.datenschutz) return t("career.application.errors.privacy");
  return null;
}

async function handleSubmit() {
  error.value = null;

  const problem = validiere();
  if (problem) {
    error.value = problem;
    return;
  }

  loading.value = true;
  try {
    const payload = new FormData();
    payload.append("vorname", form.vorname.trim());
    payload.append("nachname", form.nachname.trim());
    payload.append("email", form.email.trim());
    payload.append("telefon", form.telefon.trim());
    payload.append("ausbildungsstand", form.ausbildungsstand);
    payload.append("wunschstandort", form.wunschstandort);
    payload.append(
      "nachricht",
      form.nachricht.trim().slice(0, BEWERBUNG_MAX_NACHRICHT),
    );
    payload.append("datenschutz", String(form.datenschutz));
    payload.append("quelle", props.quelle);
    payload.append("website", form.website);
    if (cvDatei.value) payload.append("cv", cvDatei.value);

    await $fetch("/api/karriere/bewerbung", {
      method: "POST",
      body: payload,
    });

    success.value = true;
    trackCareerApply({
      job_type: "arzt",
      location_slug: form.wunschstandort,
    });
  } catch (requestError: any) {
    // statusMessage traegt die fachliche Meldung der Route (z. B. "Die Datei
    // ist zu gross"). Fehlt sie, bleibt der allgemeine Text.
    error.value =
      requestError?.data?.statusMessage ||
      requestError?.statusMessage ||
      t("career.application.errors.generic");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.application {
  background: var(--card-color-bg);
  color: var(--color-text);
  border-radius: var(--border-radius-card);
  padding: var(--space-card-pad);
  box-shadow: var(--shadow-1);
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
}

.application__heading {
  margin: 0;
  font-size: var(--font-3xl);
  line-height: var(--line-3xl);
  font-weight: var(--font-bold);
  letter-spacing: -0.01em;
}

.application__intro {
  margin: 0;
  color: var(--color-text-light);
  font-size: var(--font-md);
  line-height: var(--line-md);
  max-width: 60ch;
}

.application__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
}

.application__row {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-400);
}

.application__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
  /* Ohne min-width: 0 sprengt ein langer Select-Wert das Grid auf dem Handy. */
  min-width: 0;
}

.application__field label {
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
}

.application__field :deep(.p-inputtext),
.application__field :deep(.p-select),
.application__field :deep(textarea) {
  width: 100%;
}

.application__file {
  font: inherit;
  font-size: var(--font-sm);
  /* Der Dateiname kann beliebig lang sein — hier abschneiden statt ueberlaufen. */
  max-width: 100%;
}

.application__hint {
  color: var(--color-text-light);
  font-size: var(--font-xs);
  line-height: var(--line-xs);
}

.application__consent {
  display: flex;
  align-items: flex-start;
  gap: var(--space-300);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.application__consent a {
  text-decoration: underline;
}

.application__honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.application__message {
  margin: 0;
}

@media (min-width: 900px) {
  .application {
    padding: var(--space-800) var(--space-card-pad);
  }
  .application__row {
    grid-template-columns: 1fr 1fr;
  }
  .application__heading {
    font-size: var(--font-5xl);
    line-height: var(--line-5xl);
  }
}
</style>
