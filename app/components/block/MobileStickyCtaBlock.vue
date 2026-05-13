<template>
  <div class="sticky" :class="[themeClass]" role="region" aria-label="Schnellaktionen">
    <a v-if="phone" :href="`tel:${phone}`" class="sticky__btn sticky__btn--quaternary" @click="handlePhoneClick">
      <IconPhone :size="20" stroke="1.75" aria-hidden="true" />
      <span>{{ callLabel }}</span>
    </a>
    <button type="button" class="sticky__btn sticky__btn--primary" @click="handleBookClick">
      <IconCalendar :size="20" stroke="1.75" aria-hidden="true" />
      <span>{{ bookLabel }}</span>
    </button>
    <a v-if="whatsapp" :href="whatsapp" target="_blank" rel="noopener" class="sticky__btn sticky__btn--quaternary">
      <IconBrandWhatsapp :size="20" stroke="1.75" aria-hidden="true" />
      <span>{{ whatsappLabel }}</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { IconPhone, IconCalendar, IconBrandWhatsapp } from "@tabler/icons-vue";

const props = withDefaults(defineProps<{
  phone?: string;
  whatsapp?: string;
  callLabel?: string;
  bookLabel?: string;
  whatsappLabel?: string;
  themeClass?: "theme-light" | "theme-soft" | "theme-neutral" | "theme-strong";
}>(), {
  themeClass: "theme-light",
  callLabel: "Anrufen",
  bookLabel: "Termin buchen",
  whatsappLabel: "WhatsApp",
});

const emit = defineEmits<{ book: [] }>();

const { trackPhoneClick, trackBookingClick } = useGoogleAnalytics();

const handlePhoneClick = () => {
  trackPhoneClick(props.phone);
};

const handleBookClick = () => {
  trackBookingClick();
  emit('book');
};
</script>

<style scoped>
.sticky {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: grid;
  grid-template-columns: 1fr 1.4fr 1fr;
  gap: var(--space-200);
  padding: var(--space-300);
  background: var(--card-color-bg);
  border-top: 1px solid var(--color-border-mute);
  box-shadow: 0 -4px 12px rgba(0,0,0,0.08);
}
.sticky__btn {
  height: 56px;
  border-radius: var(--border-radius-card-sm);
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  text-decoration: none;
  border: 0;
  cursor: pointer;
  transition: all 0.15s linear;
  font-family: inherit;
}
.sticky__btn--quaternary {
  background: var(--color-gray-100);
  color: var(--color-text);
}
.sticky__btn--quaternary:hover { background: var(--color-gray-200); }
.sticky__btn--primary {
  background: var(--button-primary-color-bg, #000);
  color: var(--button-primary-color-text, #fff);
}
.sticky__btn--primary:hover { background: var(--button-primary-color-bg-hover, #292a2c); }
.sticky__btn:active { transform: scale(0.97); }
@media (min-width: 900px) { .sticky { display: none; } }
</style>
