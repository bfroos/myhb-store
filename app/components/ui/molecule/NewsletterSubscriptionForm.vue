&lt;template&gt;
  &lt;div class="newsletterSubscriptionForm theme-strong"&gt;
    &lt;ul class="newsletterSubscriptionForm__benefits"&gt;
      &lt;li&gt;
        &lt;IconRosetteDiscount size="32" stroke="1.25" /&gt;
        {{ $t("newsletter.marketingText.exlusiveOffers") }}
      &lt;/li&gt;
      &lt;li&gt;
        &lt;IconMoodSmileBeam size="32" stroke="1.25" /&gt;
        {{ $t("newsletter.marketingText.treatmentNews") }}
      &lt;/li&gt;
      &lt;li&gt;
        &lt;IconRosetteDiscountCheck size="32" stroke="1.25" /&gt;
        {{ $t("newsletter.marketingText.eventInvitations") }}
      &lt;/li&gt;
    &lt;/ul&gt;
    &lt;Message v-if="success" severity="success"&gt;
      {{ $t("newsletter.success", { brandNameShort }) }}
    &lt;/Message&gt;
    &lt;form v-else class="newsletterSubscriptionForm__form" @submit="submit"&gt;
      &lt;Message v-if="error" severity="error"&gt;
        {{ error }}
      &lt;/Message&gt;
      &lt;Message v-if="suggestion" severity="warn"&gt;
        {{ suggestionPrefix }}
        &lt;button
          type="button"
          class="newsletterSubscriptionForm__suggestion"
          @click="applySuggestion"
        &gt;
          {{ suggestion }}
        &lt;/button&gt;?
      &lt;/Message&gt;
      &lt;label for="newsletter-footer-email" class="sr-only"&gt;
        {{ $t("newsletter.emailLabel") }}
      &lt;/label&gt;
      &lt;div class="newsletterSubscriptionForm__form__controls"&gt;
        &lt;InputText
          id="newsletter-footer-email"
          v-model="email"
          type="email"
          autocomplete="email"
          :placeholder="$t('newsletter.emailPlaceholder')"
          required
        /&gt;
        &lt;UiAtomBaseButton :disabled="loading" type="submit"&gt;
          {{ $t("cta.subscribe") }}
        &lt;/UiAtomBaseButton&gt;
      &lt;/div&gt;
    &lt;/form&gt;
  &lt;/div&gt;
&lt;/template&gt;
&lt;script setup lang="ts"&gt;
import {
  IconRosetteDiscount,
  IconMoodSmileBeam,
  IconRosetteDiscountCheck,
} from "@tabler/icons-vue";
import type { NewsletterSignupSource } from "~/composables/useNewsletterSignup";

const props = withDefaults(
  defineProps&lt;{ source?: NewsletterSignupSource }&gt;(),
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
const suggestionPrefixByLocale: Record&lt;string, string&gt; = {
  de: "Meintest du",
  en: "Did you mean",
  tr: "Şunu mu demek istediniz:",
  ar: "هل تقصد",
  fr: "Vouliez-vous dire",
  nl: "Bedoelde je",
};
const suggestionPrefix = computed(
  () =&gt; suggestionPrefixByLocale[locale.value] ?? suggestionPrefixByLocale.de,
);

async function submit(event: SubmitEvent) {
  event.preventDefault();

  const form = event.currentTarget as HTMLFormElement | null;
  if (form &amp;&amp; !form.reportValidity()) {
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
  () =&gt; route.fullPath,
  () =&gt; {
    resetFormState();
  },
);
&lt;/script&gt;
&lt;style scoped&gt;
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

.newsletterSubscriptionForm__benefits &gt; li {
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
  .newsletterSubscriptionForm__form__controls &gt; input {
    max-width: 40ch;
  }
}
&lt;/style&gt;
