<template>
  <div
    class="newsletterSignUpDialog"
    :class="{ 'newsletterSignUpDialog--booking': hasBooking }"
  >
    <!-- Mit Buchung (Behandlungsseiten, go. Variante A): kompakt, damit am
         Handy (375x667) alles bis zum Knopf ohne Scrollen sichtbar ist
         (Benjamin 07.10.2026). Die Ueberschrift steht im Dialogkopf. -->
    <p v-if="hasBooking && !gesichert" class="newsletterSignUpDialog__intro">
      {{ $t("newsletter.marketingText.bookingIntro") }}
    </p>
    <template v-else>
      <h2>
        {{
          $t("newsletter.marketingText.headlineDiscount", {
            newsletterDiscountPercentage:
              globals?.ecommerce?.newsletterDiscountPercentage,
          })
        }}
      </h2>
      <ul class="newsletterSignUpDialog__benefits">
        <li>
          <IconRosetteDiscount size="28" stroke="1.25" />
          {{ $t("newsletter.marketingText.exlusiveOffers") }}
        </li>
        <li>
          <IconMoodSmileBeam size="28" stroke="1.25" />
          {{ $t("newsletter.marketingText.treatmentNews") }}
        </li>
        <li>
          <IconRosetteDiscountCheck size="28" stroke="1.25" />
          {{ $t("newsletter.marketingText.eventInvitations") }}
        </li>
      </ul>
    </template>
    <!-- Schritt 2 (myhb-app/myhb-os#1030, Benjamin 08.10.2026): Gutschein
         gesichert, die naechsten freien Termine als Knoepfe im selben
         Fenster. Wer nicht gleich bucht, bleibt ueber die Mail erreichbar. -->
    <div v-if="gesichert" class="newsletterSignUpDialog__termine" data-testid="rabatt-termine">
      <Message severity="success">
        {{ text.gesichert }}
      </Message>
      <p class="newsletterSignUpDialog__termineTitel">{{ text.naechste }}</p>
      <div class="newsletterSignUpDialog__actions newsletterSignUpDialog__actions--stacked">
        <UiAtomBaseButton
          v-for="t in termine"
          :key="t.date + t.time"
          data-track-placement="newsletter_slot"
          @click="terminBuchen(t)"
        >
          {{ terminText(t, locale) }}
        </UiAtomBaseButton>
        <UiAtomBaseButton
          variant="secondary"
          data-track-placement="newsletter_other_slot"
          @click="anderenTermin"
        >
          {{ text.anderer }}
        </UiAtomBaseButton>
        <button
          type="button"
          class="newsletterSignUpDialog__spaeter"
          data-track-placement="newsletter_later"
          @click="handleClose"
        >
          {{ text.spaeter }}
        </button>
      </div>
    </div>
    <template v-else-if="success">
      <Message severity="success">
        {{
          $t("newsletter.success", { brandNameShort })
        }}
      </Message>
      <div class="newsletterSignUpDialog__actions">
        <UiAtomBaseButton :disabled="loading" @click="handleClose">
          {{ $t("cta.close") }}
        </UiAtomBaseButton>
      </div>
    </template>
    <form
      v-else
      class="newsletterSignUpDialog__form"
      @submit.prevent="handleSubmit"
    >
      <Message v-if="error" severity="error">
        {{ error }}
      </Message>
      <Message v-if="suggestion" severity="warn">
        {{ suggestionPrefix }}
        <button
          type="button"
          class="newsletterSignUpDialog__suggestion"
          @click="applySuggestion"
        >
          {{ suggestion }}
        </button>?
      </Message>
      <label
        for="newsletter-dialog-email"
        class="newsletterSignUpDialog__label"
      >
        {{ $t("newsletter.emailLabel") }}
      </label>
      <InputText
        id="newsletter-dialog-email"
        v-model="email"
        type="email"
        :placeholder="$t('newsletter.emailPlaceholder')"
        class="newsletterSignUpDialog__input"
        autocomplete="email"
        required
      />
      <label
        for="newsletter-dialog-phone"
        class="newsletterSignUpDialog__label"
      >
        {{ phoneLabel }}
      </label>
      <InputText
        id="newsletter-dialog-phone"
        v-model="phone"
        type="tel"
        inputmode="tel"
        :placeholder="phonePlaceholder"
        class="newsletterSignUpDialog__input"
        autocomplete="tel"
        required
      />
      <div
        v-if="hasBooking"
        class="newsletterSignUpDialog__actions newsletterSignUpDialog__actions--stacked"
      >
        <UiAtomBaseButton :disabled="loading" type="submit">
          {{ $t("newsletter.marketingText.submitAndBook") }}
        </UiAtomBaseButton>
        <!-- Wettbewerbsvergleich 08.10.2026: kein Wettbewerber fragt vor dem
             Kalender Kontaktdaten ab. Der Weg ohne Code ist darum ein
             richtiger zweiter Knopf, kein kleiner Link mehr. -->
        <UiAtomBaseButton
          variant="secondary"
          data-track-placement="newsletter_skip_to_booking"
          :disabled="loading"
          @click="skipToBooking"
        >
          {{ skipLabel }}
        </UiAtomBaseButton>
      </div>
      <div v-else class="newsletterSignUpDialog__actions">
        <UiAtomBaseButton variant="secondary" @click="handleClose">
          {{ $t("cta.cancel") }}
        </UiAtomBaseButton>
        <UiAtomBaseButton :disabled="loading" type="submit">
          {{ $t("cta.subscribe") }}
        </UiAtomBaseButton>
      </div>
      <!-- Einwilligungshinweis: Inhalt des Newsletters,
           Abmeldung jederzeit, Datenschutz (07.10.2026). -->
      <p v-if="hasBooking" class="newsletterSignUpDialog__fine">
        <span class="newsletterSignUpDialog__consent">
          {{ $t("newsletter.marketingText.consentHint") }}
          <NuxtLinkLocale to="/p/datenschutz" target="_blank">
            {{ $t("navigation.meta.privacyPolicy") }}
          </NuxtLinkLocale>
        </span>
      </p>
    </form>
  </div>
</template>
<script setup lang="ts">
import {
  IconRosetteDiscount,
  IconMoodSmileBeam,
  IconRosetteDiscountCheck,
} from "@tabler/icons-vue";
import { inject } from "vue";
import InputText from "primevue/inputtext";
import {
  useCalendlyDialog,
  type BookingDialogOptions,
} from "~/composables/useCalendlyDialog";
import { NEUKUNDEN_OFFER } from "~/lib/checkoutAttempt";
import type { TreatmentType } from "~/lib/strapi/dto/enums";
import type { BookingTreatmentContext } from "~/lib/bookingTreatmentContext";
import type { BookingPrefill } from "~/lib/bookingPrefill";
import { createBookingLead } from "~/lib/bookingLead";
import { freieTermine, terminText, type FreierTermin } from "~/lib/rabattTermine";
import { appLocationFromBookingUrl } from "~/composables/useNextSlot";

const globals = useGlobals();
const { brandNameShort } = useBrand();
const { locale } = useI18n();

const dialogRef = inject("dialogRef") as any;
const { openCalendlyDialog } = useCalendlyDialog();

const {
  email,
  phone,
  loading,
  error,
  failure,
  success,
  suggestion,
  applySuggestion,
  submit: submitNewsletter,
} = useNewsletterSignup("discount_cta_20");

// Phone-Feld-Labels inline gehalten (nicht in den locale-JSONs), damit diese
// Aenderung in sich geschlossen bleibt. Fallback = Deutsch.
// Handynummer ist in diesem Dialog Pflicht -> kein "(optional)" mehr.
const phoneLabelByLocale: Record<string, string> = {
  de: "Handynummer",
  en: "Phone number",
  tr: "Telefon numarası",
  ar: "رقم الهاتف",
  fr: "Numéro de téléphone",
  nl: "Telefoonnummer",
};
const phonePlaceholderByLocale: Record<string, string> = {
  de: "+49 …",
  en: "+49 …",
  tr: "+90 …",
  ar: "+49 …",
  fr: "+33 …",
  nl: "+31 …",
};
const phoneErrorByLocale: Record<string, string> = {
  de: "Bitte gib deine Handynummer ein.",
  en: "Please enter your phone number.",
  tr: "Lütfen telefon numaranızı girin.",
  ar: "الرجاء إدخال رقم هاتفك.",
  fr: "Veuillez saisir votre numéro de téléphone.",
  nl: "Voer je telefoonnummer in.",
};
// Gleiches Muster fuer den Tippfehler-Vorschlag der E-Mail-Validierung.
const suggestionPrefixByLocale: Record<string, string> = {
  de: "Meintest du",
  en: "Did you mean",
  tr: "Şunu mu demek istediniz:",
  ar: "هل تقصد",
  fr: "Vouliez-vous dire",
  nl: "Bedoelde je",
};
// "Ohne Code direkt buchen" (Benjamin, 02.10.2026, gekuerzt 07.10.2026)
const skipLabelByLocale: Record<string, string> = {
  de: "Ohne Code direkt buchen",
  en: "Book without the code",
  tr: "Kod olmadan doğrudan randevu al",
  ar: "احجز موعدًا مباشرةً بدون الرمز",
  fr: "Réserver directement sans code",
  nl: "Direct een afspraak maken zonder code",
};
const skipLabel = computed(
  () => skipLabelByLocale[locale.value] ?? skipLabelByLocale.de,
);
const phoneLabel = computed(
  () => phoneLabelByLocale[locale.value] ?? phoneLabelByLocale.de,
);
const phonePlaceholder = computed(
  () => phonePlaceholderByLocale[locale.value] ?? phonePlaceholderByLocale.de,
);
const phoneError = computed(
  () => phoneErrorByLocale[locale.value] ?? phoneErrorByLocale.de,
);
const suggestionPrefix = computed(
  () => suggestionPrefixByLocale[locale.value] ?? suggestionPrefixByLocale.de,
);

const handleClose = () => {
  if (dialogRef) {
    dialogRef.value.close();
  }
};

type BookingData = {
  calendlyUrl?: string;
  appBookingUrl?: string;
  locationSlug?: string;
  treatmentType?: TreatmentType;
  appTreatmentSlug?: string;
  /** #78: Kontextzeile der Behandlungsseite, von der der Knopf kam. */
  treatmentContext?: BookingTreatmentContext;
};

// Buchungsdaten (calendlyUrl/treatmentType) kommen ueber die Dialog-Daten
// (siehe SharedButton.openNewsletterSignUpDialog). Ohne sie (z. B. Footer-
// Knopf ohne Standort) bleibt es bei der Erfolgsmeldung.
const booking = computed<BookingData | undefined>(
  () => dialogRef?.value?.data as BookingData | undefined,
);
const hasBooking = computed(
  () =>
    !!booking.value &&
    !!(
      booking.value.calendlyUrl ||
      booking.value.appBookingUrl ||
      booking.value.treatmentType ||
      booking.value.appTreatmentSlug
    ),
);

/**
 * Rabatt-Dialog schliessen und denselben Buchungsdialog oeffnen, den der
 * "Termin buchen"-Knopf der Seite verwendet (A/B-Split #100 unveraendert).
 * Immer `via_modal`; `offer` nur nach erfolgreicher Anmeldung.
 */
function openBooking(options: BookingDialogOptions): boolean {
  const b = booking.value;
  if (!b || !hasBooking.value) return false;
  if (dialogRef) dialogRef.value.close();
  openCalendlyDialog(
    b.calendlyUrl,
    b.treatmentType,
    b.appTreatmentSlug,
    {
      appBookingUrl: b.appBookingUrl,
      locationSlug: b.locationSlug,
    },
    b.treatmentContext,
    { ...options, viaModal: true },
  );
  return true;
}

function skipToBooking() {
  openBooking({});
}

// Schritt 2 (#1030): Termine schon beim Oeffnen holen, damit nach dem
// Absenden nichts wartet. Ohne Standort/Behandlung oder ohne freie Zeit
// bleibt es beim bisherigen Weg (Buchung oeffnet direkt).
const termine = ref<FreierTermin[]>([]);
const gesichert = ref(false);
let nachAnmeldung: BookingDialogOptions = {};

const schritt2Text: Record<string, { gesichert: string; naechste: string; anderer: string; spaeter: string }> = {
  de: { gesichert: "✓ Dein 20-%-Gutschein ist gesichert. Den Code schicken wir dir per E-Mail.", naechste: "Nächste freie Termine:", anderer: "Anderen Termin wählen", spaeter: "Später buchen" },
  en: { gesichert: "✓ Your 20% voucher is saved. We'll email you the code.", naechste: "Next available times:", anderer: "Choose another time", spaeter: "Book later" },
  tr: { gesichert: "✓ %20 kuponun kaydedildi. Kodu e-posta ile gönderiyoruz.", naechste: "En yakın boş randevular:", anderer: "Başka bir zaman seç", spaeter: "Daha sonra" },
  ar: { gesichert: "✓ تم حفظ قسيمة الخصم 20٪. سنرسل لك الرمز عبر البريد الإلكتروني.", naechste: "أقرب المواعيد المتاحة:", anderer: "اختر موعدًا آخر", spaeter: "لاحقًا" },
  fr: { gesichert: "✓ Ton bon de 20 % est enregistré. Nous t'envoyons le code par e-mail.", naechste: "Prochains créneaux libres :", anderer: "Choisir un autre créneau", spaeter: "Réserver plus tard" },
  nl: { gesichert: "✓ Je kortingsbon van 20% is opgeslagen. We mailen je de code.", naechste: "Eerstvolgende vrije tijden:", anderer: "Andere tijd kiezen", spaeter: "Later boeken" },
};
const text = computed(() => schritt2Text[locale.value] ?? schritt2Text.de);

onMounted(async () => {
  const b = booking.value;
  if (!hasBooking.value || !b?.appBookingUrl || !b.appTreatmentSlug) return;
  const location = appLocationFromBookingUrl(b.appBookingUrl);
  if (!location) return;
  try {
    termine.value = freieTermine(
      await $fetch("/api/naechster-termin", {
        query: { location, treatment: b.appTreatmentSlug, anzahl: 3 },
        timeout: 3000,
      }),
    );
  } catch {
    termine.value = [];
  }
});

function terminBuchen(t: FreierTermin) {
  openBooking({ ...nachAnmeldung, termin: t });
}

function anderenTermin() {
  openBooking(nachAnmeldung);
}

async function handleSubmit() {
  // Handynummer ist jetzt Pflicht (nur in diesem Dialog, nicht im
  // Footer-Formular, das dasselbe Composable ohne Telefonfeld nutzt).
  if (!phone.value?.trim()) {
    error.value = phoneError.value;
    return;
  }

  // Vor dem Absenden festhalten: `submitNewsletter` leert die Felder. Geht
  // nur in die Calendly-URL (Vorbefuellung), nie ins Tracking.
  const prefill: BookingPrefill = {
    email: email.value?.trim() || undefined,
    phone: phone.value?.trim() || undefined,
  };

  // 07.10.2026: Die App-Buchung fuellt E-Mail und Handynummer nur ueber einen
  // Lead-Token vor (lib/bookingLead.ts). Parallel zur Anmeldung angefragt,
  // damit die Buchung nicht spuerbar spaeter aufgeht; ohne Token (Fehler,
  // Zeitlimit) oeffnet sie wie bisher ohne Vorbefuellung.
  const leadAnfrage = hasBooking.value
    ? createBookingLead(prefill)
    : Promise.resolve(undefined);

  const ok = await submitNewsletter();
  if (!ok && failure.value !== "server") return;
  const leadToken = await leadAnfrage;
  if (leadToken) prefill.leadToken = leadToken;

  if (!ok) {
    // Anmeldung selbst gescheitert (Mailchimp/Netz, nicht die Eingabe):
    // trotzdem buchen lassen (Benjamin, 02.10.2026). Ohne Rabattkennung,
    // der Code ist ja nicht unterwegs.
    openBooking({ prefill });
    return;
  }

  // Nach erfolgreicher Anmeldung: mit freien Terminen erst Schritt 2 (#1030),
  // sonst direkt den Terminbuchungs-Dialog. Buchung mit Neukundenrabatt:
  // Wert −20 %, InitiateCheckout erst bei der Standortwahl (useCalendlyDialog).
  nachAnmeldung = { offer: NEUKUNDEN_OFFER, prefill };
  if (termine.value.length > 0) {
    gesichert.value = true;
    return;
  }
  openBooking(nachAnmeldung);
}
</script>
<style scoped>
.newsletterSignUpDialog {
  display: flex;
  flex-direction: column;
  gap: var(--space-500);
}

/* Kompakt mit Buchung (07.10.2026): engere Abstaende, alles bis zum Knopf
   passt am Handy (375x667) ohne Scrollen. */
.newsletterSignUpDialog--booking {
  gap: var(--space-300);
}

.newsletterSignUpDialog__intro {
  margin: 0;
  font-size: var(--font-sm);
  line-height: 1.4;
}

.newsletterSignUpDialog--booking .newsletterSignUpDialog__form {
  gap: var(--space-200);
}

.newsletterSignUpDialog--booking .newsletterSignUpDialog__actions {
  margin-top: var(--space-200);
}

.newsletterSignUpDialog__fine {
  margin: 0;
  font-size: var(--font-xs);
  line-height: 1.4;
  color: var(--color-text-light);
  text-align: center;
}

.newsletterSignUpDialog__fine a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.newsletterSignUpDialog__consent {
  display: block;
}

.newsletterSignUpDialog h2 {
  font-size: var(--font-md);
  line-height: var(--line-md);
  font-weight: var(--font-bold);
}

.newsletterSignUpDialog__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
}

.newsletterSignUpDialog__label {
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  color: var(--color-text);
}

.newsletterSignUpDialog__input {
  width: 100%;
}

.newsletterSignUpDialog__suggestion {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  text-decoration: underline;
  cursor: pointer;
}



.newsletterSignUpDialog__benefits {
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.newsletterSignUpDialog__benefits > li {
  display: flex;
  align-items: center;
  gap: var(--space-200);
}

.newsletterSignUpDialog__termine {
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
}

.newsletterSignUpDialog__termineTitel {
  margin: 0;
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
}

.newsletterSignUpDialog__termine .newsletterSignUpDialog__actions {
  margin-top: 0;
}

.newsletterSignUpDialog__spaeter {
  background: none;
  border: none;
  padding: var(--space-200) 0 0;
  font: inherit;
  font-size: var(--font-sm);
  color: var(--color-text-light);
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
}

.newsletterSignUpDialog__actions {
  display: flex;
  gap: var(--space-300);
  justify-content: flex-end;
  margin-top: var(--space-400);
}

/* Langer Knopftext ("Rabatt sichern & Termin wählen"): untereinander,
   der Hauptknopf oben, damit nichts aus dem Dialog ragt. */
.newsletterSignUpDialog__actions--stacked {
  flex-direction: column;
  gap: var(--space-200);
}

.newsletterSignUpDialog__actions--stacked > :deep(*) {
  width: 100%;
  justify-content: center;
}
</style>
