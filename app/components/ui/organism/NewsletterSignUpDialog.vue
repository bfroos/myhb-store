<template>
  <div class="newsletterSignUpDialog">
    <p class="newsletterSignUpDialog__text">
      Melden Sie sich für unseren Newsletter an, um über aktuelle Angebote und
      Neuigkeiten informiert zu bleiben.
    </p>
    <div class="newsletterSignUpDialog__form">
      <label for="newsletter-email" class="newsletterSignUpDialog__label">
        E-Mail-Adresse
      </label>
      <InputText
        id="newsletter-email"
        v-model="email"
        type="email"
        placeholder="ihre@email.de"
        class="newsletterSignUpDialog__input"
        autocomplete="email"
      />
    </div>
    <div class="newsletterSignUpDialog__actions">
      <UiAtomBaseButton variant="secondary" size="sm" @click="handleClose">
        Abbrechen
      </UiAtomBaseButton>
      <UiAtomBaseButton size="sm" @click="handleSubmit">
        Anmelden
      </UiAtomBaseButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import { inject, ref } from "vue";
import InputText from "primevue/inputtext";

// Inject dialogRef from DynamicDialog
const dialogRef = inject("dialogRef") as any;

const email = ref("");

const handleClose = () => {
  if (dialogRef) {
    dialogRef.value.close();
  }
};

const handleSubmit = () => {
  // TODO: Implement newsletter signup logic
  console.log("Newsletter signup for:", email.value);
  handleClose();
};
</script>
<style scoped>
.newsletterSignUpDialog {
  display: flex;
  flex-direction: column;
  gap: var(--space-500);
}

.newsletterSignUpDialog__text {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-muted);
  margin: 0;
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

.newsletterSignUpDialog__actions {
  display: flex;
  gap: var(--space-300);
  justify-content: flex-end;
  margin-top: var(--space-400);
}
</style>
