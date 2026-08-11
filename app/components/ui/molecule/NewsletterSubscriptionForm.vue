<template>
  <div class="newsletterSubscriptionForm theme-strong">
    <ul class="newsletterSubscriptionForm__benefits">
      <li>
        <IconRosetteDiscount size="32" stroke="1.25" />
        {{ $t("newsletter.marketingText.exlusiveOffers") }}
      </li>
      <li>
        <IconMoodSmileBeam size="32" stroke="1.25" />
        {{ $t("newsletter.marketingText.treatmentNews") }}
      </li>
      <li>
        <IconRosetteDiscountCheck size="32" stroke="1.25" />
        {{ $t("newsletter.marketingText.eventInvitations") }}
      </li>
    </ul>
    <Message v-if="success" severity="success">
      {{ $t("newsletter.success", { brandNameShort }) }}
    </Message>
    <form v-else class="newsletterSubscriptionForm__form" @submit="submit">
      <Message v-if="error" severity="error">
        {{ error }}
      </Message>
      <Message v-if="suggestion" severity="warn">
        {{ suggestionPrefix }}
        <button
          type="button"
          class="newsletterSubscriptionForm__suggestion"
          @click="applySuggestion"
        >
          {{ suggestion }}
        </button>?
      </Message>
      <label for="newsletter-footer-email" class="sr-only">
        {{ $t("newsletter.emailLabel") }}
      </label>
      <div class="newsletterSubscriptionForm__form__controls">
        <InputText
          id="newsletter-footer-email"
          v-model="email"
          type="email"
          autocomplete="email"
          :placeholder="$t('newsletter.emailPlaceholder')"
          required
        />
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
import type { NewsletterSignupSource } from "~/composables/useNewsletterSignup";

const props = withDefaults(
  defineProps<{ source?: NewsletterSignupSource }>(),
  { source: "newsletter_footer" },
);

const route = useRoute();
const { brandNameShort } = useBrand();
const { locale } = useI18n();
const {
  email,
  loading,
  success,
  error,
  suggestion,
  applySuggestion,
  submit: submitNewsletter,
} = useNewsletterSignup(props.source);

// Inline gehalten wie die Phone-Labels im NewsletterSignUpDialog, damit die
// Aenderung in sich geschlossen bleibt und keine sechs locale-JSONs
// angefasst werden muessen. Fallback = Deutsch.
const suggestionPrefixByLocale: Record<string, string> = {
  de: "Meintest du",
  en: "Did you mean",
  tr: "Şunu mu demek istediniz:",
  ar: "هل تقصد",
  fr: "Vouliez-vous dire",
  nl: "Bedoelde je",
};
const suggestionPrefix = computed(
  () => suggestionPrefixByLocale[locale.value] ?? suggestionPrefixByLocale.de,
);

async function submit(event: SubmitEvent) {
  event.preventDefault();

  const form = event.currentTarget as HTMLFormElement | null;
  if (form && !form.reportValidity()) {
    return;
  }

  await submitNewsletter();
}

function resetFormState() {
  success.value = null;
  error.value = null;
  suggestion.value = null;
  email.value = "";
}

watch(
  () => route.fullPath,
  () => {
    resetFormState();
  },
);
</script>
<style scoped>
.newsletterSubscriptionForm {
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
}

.newsletterSubscriptionForm__benefits {
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
  margin: 0 0 var(--space-400);
}

.newsletterSubscriptionForm__benefits > li {
  display: flex;
  align-items: center;
  gap: var(--space-200);
}

.newsletterSubscriptionForm__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
}

.newsletterSubscriptionForm__form__controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
}

.newsletterSubscriptionForm__suggestion {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: inherit;
  text-decoration: underline;
  cursor: pointer;
}

@media screen and (min-width: 900px) {
  .newsletterSubscriptionForm__benefits {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-400);
  }
  .newsletterSubscriptionForm__form__controls {
    flex-direction: row;
  }
  .newsletterSubscriptionForm__form__controls > input {
    max-width: 40ch;
  }
}
</style>
