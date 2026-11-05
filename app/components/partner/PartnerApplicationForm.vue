<template>
  <section id="bewerbung" class="pp__formular" aria-labelledby="bewerbung-titel">
    <p class="pp__eyebrow">Bewerbung</p>
    <h2 id="bewerbung-titel">Werde Partner</h2>
    <p class="pp__text">
      Erzähl uns kurz von dir und deinen Plänen. Wir melden uns innerhalb von fünf Werktagen.
    </p>

    <Message v-if="erfolg" severity="success" class="pp__meldung">
      <strong>Danke, {{ form.vorname }}!</strong>
      <br>
      Deine Bewerbung ist bei uns angekommen. Wir melden uns innerhalb von fünf Werktagen bei dir.
    </Message>

    <form v-else class="pp__form" novalidate @submit.prevent="absenden">
      <Message v-if="fehler" severity="error" class="pp__meldung">{{ fehler }}</Message>

      <div class="pp__reihe">
        <div class="pp__feld">
          <label for="partner-vorname">Vorname</label>
          <InputText id="partner-vorname" v-model="form.vorname" autocomplete="given-name" required />
        </div>
        <div class="pp__feld">
          <label for="partner-nachname">Nachname</label>
          <InputText id="partner-nachname" v-model="form.nachname" autocomplete="family-name" required />
        </div>
      </div>

      <div class="pp__reihe">
        <div class="pp__feld">
          <label for="partner-email">E-Mail</label>
          <InputText id="partner-email" v-model="form.email" type="email" autocomplete="email" required />
        </div>
        <div class="pp__feld">
          <label for="partner-telefon">Telefon</label>
          <InputText id="partner-telefon" v-model="form.telefon" type="tel" inputmode="tel" autocomplete="tel" required />
        </div>
      </div>

      <div class="pp__reihe">
        <div class="pp__feld">
          <label for="partner-stadt">Wunschregion oder Stadt</label>
          <InputText id="partner-stadt" v-model="form.stadt" autocomplete="address-level2" required />
        </div>
        <div class="pp__feld">
          <label for="partner-fachrichtung">Fachrichtung</label>
          <Select id="partner-fachrichtung" v-model="form.fachrichtung" :options="FACHRICHTUNGEN" placeholder="Bitte wählen" />
        </div>
      </div>

      <div class="pp__reihe">
        <div class="pp__feld">
          <label for="partner-situation">Aktuelle Situation</label>
          <Select id="partner-situation" v-model="form.situation" :options="SITUATIONEN" placeholder="Bitte wählen" />
        </div>
        <div class="pp__feld">
          <label for="partner-erfahrung">Erfahrung in der Ästhetik</label>
          <Select id="partner-erfahrung" v-model="form.erfahrung" :options="ERFAHRUNG" placeholder="Bitte wählen" />
        </div>
      </div>

      <div class="pp__reihe">
        <div class="pp__feld">
          <label for="partner-standortweg">Standort</label>
          <Select id="partner-standortweg" v-model="form.standortweg" :options="STANDORTWEG_OPTIONEN" placeholder="Bitte wählen" />
        </div>
        <div class="pp__feld">
          <label for="partner-start">Wann möchtest du starten?</label>
          <Select id="partner-start" v-model="form.start" :options="START" placeholder="Bitte wählen" />
        </div>
      </div>

      <fieldset class="pp__feld pp__pakete">
        <legend>Welche Zusatzpakete interessieren dich? (freiwillig)</legend>
        <div class="pp__paketListe">
          <label v-for="(p, i) in PAKET_NAMEN" :key="p" class="pp__haken">
            <Checkbox v-model="form.pakete" :input-id="`partner-paket-${i}`" :value="p" />
            <span>{{ p }}</span>
          </label>
        </div>
      </fieldset>

      <div class="pp__feld">
        <label for="partner-nachricht">Was sollen wir noch wissen? (freiwillig)</label>
        <Textarea id="partner-nachricht" v-model="form.nachricht" rows="4" auto-resize :maxlength="PARTNER_MAX_NACHRICHT" />
      </div>

      <!-- Honeypot: fuer Menschen unsichtbar, kein type="hidden" (das fuellen Bots nicht). -->
      <div class="pp__honeypot" aria-hidden="true">
        <label for="partner-website">Website</label>
        <input id="partner-website" v-model="form.website" type="text" tabindex="-1" autocomplete="off">
      </div>

      <div class="pp__einwilligung">
        <Checkbox v-model="form.datenschutz" input-id="partner-datenschutz" binary />
        <label for="partner-datenschutz">
          Ich bin einverstanden, dass MY HEALTH & BEAUTY meine Angaben speichert, um mit mir über das
          Partnerprogramm zu sprechen. Mehr in der
          <NuxtLinkLocale to="/p/datenschutz" target="_blank">Datenschutzerklärung</NuxtLinkLocale>.
        </label>
      </div>

      <button type="submit" class="pp__knopf" :disabled="laedt">
        {{ laedt ? "Wird gesendet …" : "Bewerbung absenden" }}
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
/**
 * Bewerbungsformular Partnerprogramm (E32, #403). Schickt an
 * /api/partner/anfrage, das an die Edge Function partner-anfrage weitergibt.
 * `partner_apply` feuert erst nach der Bestaetigung der Route, damit die
 * Zahl nur echte Bewerbungen zaehlt.
 */
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Select from "primevue/select";
import Checkbox from "primevue/checkbox";
import Message from "primevue/message";
import {
  ERFAHRUNG,
  FACHRICHTUNGEN,
  PAKET_NAMEN,
  PARTNER_MAX_NACHRICHT,
  SITUATIONEN,
  STANDORTWEG_OPTIONEN,
  START,
  pruefePartnerEingabe,
} from "#shared/partnerProgramm";

const { trackEvent } = useGoogleAnalytics();

const form = reactive({
  vorname: "",
  nachname: "",
  email: "",
  telefon: "",
  stadt: "",
  fachrichtung: "",
  situation: "",
  erfahrung: "",
  standortweg: "",
  start: "",
  pakete: [] as string[],
  nachricht: "",
  datenschutz: false,
  website: "",
});

const laedt = ref(false);
const fehler = ref<string | null>(null);
const erfolg = ref(false);

/** UTM, Klick-IDs und Referrer, damit wir sehen, woher Bewerbungen kommen. */
function herkunft(): Record<string, string> {
  const h: Record<string, string> = { seite: "partnerpraxis" };
  if (!import.meta.client) return h;
  const q = new URLSearchParams(window.location.search);
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"]) {
    const v = q.get(k);
    if (v) h[k] = v;
  }
  if (document.referrer) h.referrer = document.referrer;
  return h;
}

async function absenden() {
  fehler.value = null;
  const eingabe = { ...form, herkunft: herkunft() };
  const pruefung = pruefePartnerEingabe(eingabe);
  if (!pruefung.ok) {
    fehler.value = pruefung.fehler;
    return;
  }
  laedt.value = true;
  try {
    await $fetch("/api/partner/anfrage", { method: "POST", body: eingabe });
    erfolg.value = true;
    trackEvent("partner_apply", {
      event_category: "conversion",
      standortweg: form.standortweg || undefined,
    });
  } catch (e: any) {
    fehler.value =
      e?.data?.statusMessage || e?.statusMessage || "Das hat nicht geklappt. Bitte versuch es gleich noch einmal.";
  } finally {
    laedt.value = false;
  }
}
</script>
