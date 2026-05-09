<template>
  <form @submit.prevent="submitForm" class="booking-form">
    <div class="form-grid">
      <div class="form-group">
        <label for="name">Dein Name *</label>
        <input 
          v-model="formData.name"
          type="text" 
          id="name" 
          placeholder="z.B. Claire Schmidt"
          required
        />
      </div>

      <div class="form-group">
        <label for="email">E-Mail *</label>
        <input 
          v-model="formData.email"
          type="email" 
          id="email" 
          placeholder="deine@email.de"
          required
        />
      </div>

      <div class="form-group">
        <label for="phone">Telefon *</label>
        <input 
          v-model="formData.phone"
          type="tel" 
          id="phone" 
          placeholder="+49 123 456789"
          required
        />
      </div>

      <div class="form-group">
        <label for="location">Bevorzugter Standort *</label>
        <select v-model="formData.location" id="location" required>
          <option value="">-- Bitte wählen --</option>
          <option value="berlin">Berlin</option>
          <option value="munich">München</option>
          <option value="frankfurt">Frankfurt</option>
          <option value="hamburg">Hamburg</option>
          <option value="cologne">Köln</option>
        </select>
      </div>

      <div class="form-group">
        <label for="preferred-filler">Interessiert an *</label>
        <select v-model="formData.fillerAmount" id="preferred-filler" required>
          <option value="">-- Bitte wählen --</option>
          <option value="0.5ml">Subtle Hydration (0.5 mL)</option>
          <option value="1ml">Full Volume (1 mL) - Empfohlen</option>
          <option value="1.5ml">Ultimate Fuller (1.5 mL)</option>
          <option value="consultation">Nur Beratung</option>
        </select>
      </div>

      <div class="form-group">
        <label for="preferred-date">Bevorzugtes Datum</label>
        <input 
          v-model="formData.preferredDate"
          type="date" 
          id="preferred-date"
        />
      </div>
    </div>

    <div class="form-group form-group-full">
      <label for="message">Nachricht (optional)</label>
      <textarea 
        v-model="formData.message"
        id="message"
        placeholder="Hast du noch Fragen oder Bedenken?"
        rows="4"
      ></textarea>
    </div>

    <div class="form-consent">
      <input 
        v-model="formData.consent"
        type="checkbox" 
        id="consent"
        required
      />
      <label for="consent" class="consent-label">
        Ich stimme zu, dass meine Daten für die Beratung verwendet werden. 
        <NuxtLink to="/datenschutz" target="_blank">Datenschutz</NuxtLink>
      </label>
    </div>

    <div v-if="submitMessage" class="form-message" :class="submitMessageType">
      {{ submitMessage }}
    </div>

    <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
      {{ isSubmitting ? 'Wird gesendet...' : 'Kostenlose Beratung buchen' }}
    </button>

    <p class="form-footer">
      ✓ Keine Verpflichtung | ✓ Antwort innerhalb 24h | ✓ 100% sicher
    </p>
  </form>
</template>

<script setup lang="ts">
defineProps({
  treatment: String,
  personas: Array
});

const formData = reactive({
  name: '',
  email: '',
  phone: '',
  location: '',
  fillerAmount: '',
  preferredDate: '',
  message: '',
  consent: false
});

const isSubmitting = ref(false);
const submitMessage = ref('');
const submitMessageType = ref('');

const submitForm = async () => {
  isSubmitting.value = true;
  submitMessage.value = '';

  try {
    // Simulate form submission (replace with actual API call)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Track event for analytics
    gtag.event('form_submit', {
      treatment: 'Lippenaufpolsterung',
      location: formData.location,
      filler_amount: formData.fillerAmount
    });

    // Send to backend (or CRM)
    // const response = await $fetch('/api/bookings', {
    //   method: 'POST',
    //   body: formData
    // });

    submitMessage.value = '✓ Danke! Wir kontaktieren dich in Kürze.';
    submitMessageType.value = 'success';

    // Reset form
    Object.keys(formData).forEach(key => {
      if (typeof formData[key as keyof typeof formData] === 'string') {
        formData[key as keyof typeof formData] = '';
      } else if (typeof formData[key as keyof typeof formData] === 'boolean') {
        formData[key as keyof typeof formData] = false;
      }
    });
  } catch (error) {
    submitMessage.value = '✗ Fehler beim Absenden. Bitte versuche es später.';
    submitMessageType.value = 'error';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.booking-form {
  background: white;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 20px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 24px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;

    &.form-group-full {
      grid-column: 1 / -1;
    }

    label {
      margin-bottom: 8px;
      font-weight: 500;
      color: #2C2C2C;
      font-size: 14px;
    }

    input,
    select,
    textarea {
      padding: 12px;
      border: 1px solid #D0D0D0;
      border-radius: 4px;
      font-size: 14px;
      font-family: inherit;
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: #D4A574;
        box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
      }

      &::placeholder {
        color: #BDBDBD;
      }
    }

    textarea {
      resize: vertical;
      font-family: inherit;
    }
  }

  .form-consent {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 24px;

    input[type="checkbox"] {
      margin-top: 4px;
      cursor: pointer;
    }

    .consent-label {
      font-size: 12px;
      color: #757575;
      margin: 0;
      line-height: 1.4;

      a {
        color: #D4A574;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .form-message {
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 16px;
    font-size: 14px;
    font-weight: 500;

    &.success {
      background: #E8F5E9;
      color: #2E7D32;
      border-left: 4px solid #2E7D32;
    }

    &.error {
      background: #FFEBEE;
      color: #C62828;
      border-left: 4px solid #C62828;
    }
  }

  .btn {
    width: 100%;
    padding: 14px 24px;
    background: #E8424F;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      background: #D63039;
      box-shadow: 0 4px 12px rgba(232, 66, 79, 0.3);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  .form-footer {
    text-align: center;
    color: #757575;
    font-size: 12px;
    margin-top: 16px;
    margin-bottom: 0;
  }
}
</style>
