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
      {{
        $t("newsletter.success", { brandNameShort })
      }}
    </Message>
    <form v-else class="newsletterSubscriptionForm__form" @submit="submit">
      <Message v-if="error" severity="error">
        {{ error }}
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

const { brandNameShort } = useBrand();
const {
  email,
  loading,
  success,
  error,
  submit: submitNewsletter,
} = useNewsletterSignup();

async function submit(event: SubmitEvent) {
  event.preventDefault();

  const form = event.currentTarget as HTMLFormElement | null;
  if (form && !form.reportValidity()) {
    return;
  }

  await submitNewsletter();
}
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
