<template>
  <div class="newsletterSignUpDialog">
    <h2>
      {{
        $t(
          hasBooking
            ? "newsletter.marketingText.headlineFirstTreatment"
            : "newsletter.marketingText.headlineDiscount",
          {
            newsletterDiscountPercentage:
              globals?.ecommerce?.newsletterDiscountPercentage,
          },
        )
      }}
    </h2>
    <!-- Mit Buchung (Behandlungsseiten): erst Rabatt sichern, dann direkt
         die erste Behandlung buchen (Benjamin 07.10.2026) -->
    <ol v-if="hasBooking && !success" class="newsletterSignUpDialog__steps">
      <li>{{ $t("newsletter.marketingText.stepSecure") }}</li>
      <li>{{ $t("newsletter.marketingText.stepBook") }}</li>
    </ol>
    <p v-if="hasBooking && !success" class="newsletterSignUpDialog__also">
      {{ $t("newsletter.marketingText.alsoNewsletter") }}
    </p>
    <ul class="newsletterSignUpDialog__benefits" :class="{ 'newsletterSignUpDialog__benefits--small': hasBooking }">
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
    <template v-if="success">
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
        class="newsletterSignUpDialog__actions"
        :class="{ 'newsletterSignUpDialog__actions--stacked': hasBooking }"
      >
        <UiAtomBaseButton variant="secondary" @click="handleClose">
          {{ $t("cta.cancel") }}
        </UiAtomBaseButton>
        <UiAtomBaseButton :disabled="loading" type="submit">
          {{ hasBooking ? $t("newsletter.marketingText.submitAndBook") : $t("cta.subscribe") }}
        </UiAtomBaseButton>
      </div>
      <!-- go. Variante A (02.10.2026): niemand bleibt am Formular haengen -->
      <button
        v-if="hasBooking"
        type="button"
        class="newsletterSignUpDialog__skip"
        data-track-placement="newsletter_skip_to_booking"
        :disabled="loading"
        @click="skipToBooking"
      >
        {{ skipLabel }}
      </button>
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
// "ohne Code direkt Termin buchen" (Benjamin, 02.10.2026)
const skipLabelByLocale: Record<string, string> = {
  de: "Ohne Code direkt Termin buchen",
  en: "Book an appointment without the code",
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

async function handleSubmit() {
  // Handynummer ist jetzt Pflicht (nur in diesem Dialog, nicht im
  // Footer-Formular, das dasselbe Composable ohne Telefonfeld nutzt).
  if (!phone.value?.trim()) {
    error.value = phoneError.value;
    return;
  }

  const ok = await submitNewsletter();
  if (!ok) {
    // Anmeldung selbst gescheitert (Mailchimp/Netz, nicht die Eingabe):
    // trotzdem buchen lassen (Benjamin, 02.10.2026). Ohne Rabattkennung,
    // der Code ist ja nicht unterwegs.
    if (failure.value === "server") openBooking({});
    return;
  }

  // Nach erfolgreicher Anmeldung direkt den Terminbuchungs-Dialog oeffnen.
  // Buchung mit Neukundenrabatt: Wert −20 %, InitiateCheckout erst bei der
  // Standortwahl (useCalendlyDialog).
  openBooking({ offer: NEUKUNDEN_OFFER });
}
</script>
<style scoped>
.newsletterSignUpDialog {
  display: flex;
  flex-direction: column;
  gap: var(--space-500);
}

.newsletterSignUpDialog__steps {
  display: grid;
  gap: var(--space-200);
  margin: calc(-1 * var(--space-200)) 0 0;
  padding-left: 1.25em;
  list-style: decimal;
  font-size: var(--font-sm);
  line-height: 1.4;
}

.newsletterSignUpDialog__steps li::marker {
  font-weight: var(--font-bold);
}

.newsletterSignUpDialog__also {
  margin: 0 0 calc(-1 * var(--space-300));
  font-size: var(--font-xs);
  color: var(--color-text-light);
}

.newsletterSignUpDialog__benefits--small {
  font-size: var(--font-xs);
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

.newsletterSignUpDialog__skip {
  align-self: center;
  background: none;
  border: none;
  padding: var(--space-200);
  font: inherit;
  font-size: var(--font-sm);
  color: var(--color-text);
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
}

.newsletterSignUpDialog__skip:disabled {
  opacity: 0.6;
  cursor: default;
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

.newsletterSignUpDialog__actions {
  display: flex;
  gap: var(--space-300);
  justify-content: flex-end;
  margin-top: var(--space-400);
}

/* Langer Knopftext ("Rabatt sichern & Termin wählen"): untereinander,
   der Hauptknopf oben, damit nichts aus dem Dialog ragt. */
.newsletterSignUpDialog__actions--stacked {
  flex-direction: column-reverse;
  gap: var(--space-200);
}

.newsletterSignUpDialog__actions--stacked > :deep(*) {
  width: 100%;
  justify-content: center;
}
</style>
