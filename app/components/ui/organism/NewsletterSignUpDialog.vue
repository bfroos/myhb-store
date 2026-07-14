<template>
  <div class="newsletterSignUpDialog">
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
      <div class="newsletterSignUpDialog__actions">
        <UiAtomBaseButton variant="secondary" @click="handleClose">
          {{ $t("cta.cancel") }}
        </UiAtomBaseButton>
        <UiAtomBaseButton :disabled="loading" type="submit">
          {{ $t("cta.subscribe") }}
        </UiAtomBaseButton>
      </div>
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
import { useCalendlyDialog } from "~/composables/useCalendlyDialog";
import type { TreatmentType } from "~/lib/strapi/dto/enums";

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
  success,
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
const phoneLabel = computed(
  () => phoneLabelByLocale[locale.value] ?? phoneLabelByLocale.de,
);
const phonePlaceholder = computed(
  () => phonePlaceholderByLocale[locale.value] ?? phonePlaceholderByLocale.de,
);
const phoneError = computed(
  () => phoneErrorByLocale[locale.value] ?? phoneErrorByLocale.de,
);

const handleClose = () => {
  if (dialogRef) {
    dialogRef.value.close();
  }
};

async function handleSubmit() {
  // Handynummer ist jetzt Pflicht (nur in diesem Dialog, nicht im
  // Footer-Formular, das dasselbe Composable ohne Telefonfeld nutzt).
  if (!phone.value?.trim()) {
    error.value = phoneError.value;
    return;
  }

  const ok = await submitNewsletter();
  if (!ok) return;

  // Nach erfolgreicher Anmeldung direkt den Terminbuchungs-Dialog oeffnen –
  // denselben, den der "Termin buchen"-Button der Seite verwendet. Die
  // Buchungsdaten (calendlyUrl/treatmentType) werden ueber die Dialog-Daten
  // durchgereicht (siehe SharedButton.openNewsletterSignUpDialog).
  const booking = dialogRef?.value?.data as
    | { calendlyUrl?: string; treatmentType?: TreatmentType }
    | undefined;
  if (booking && (booking.calendlyUrl || booking.treatmentType)) {
    if (dialogRef) dialogRef.value.close();
    openCalendlyDialog(booking.calendlyUrl, booking.treatmentType);
  }
}
</script>
<style scoped>
.newsletterSignUpDialog {
  display: flex;
  flex-direction: column;
  gap: var(--space-500);
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
</style>
