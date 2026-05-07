<template>
  <section class="block live" :class="[themeClass, { 'block--elevated': elevated }]">
    <span class="live__pulse" aria-hidden="true"></span>
    <div class="live__body">
      <strong class="live__count">{{ formatted }}</strong>
      <span class="live__label">{{ label }}</span>
    </div>
    <span class="live__sub">{{ sub }}</span>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

const props = withDefaults(defineProps<{
  start?: number;
  perDay?: number;
  label?: string;
  sub?: string;
  elevated?: boolean;
  themeClass?: "theme-light" | "theme-soft" | "theme-neutral" | "theme-strong";
}>(), {
  start: 41284,
  perDay: 38,
  label: "Behandlungen",
  sub: "Live-Zähler · aktualisiert in Echtzeit",
  elevated: true,
  themeClass: "theme-light",
});

const ticker = ref(props.start);
let timer: number | undefined;
const intervalMs = computed(() => Math.max(800, Math.round((24 * 3600 * 1000) / props.perDay)));

onMounted(() => { timer = window.setInterval(() => { ticker.value += 1; }, intervalMs.value); });
onUnmounted(() => { if (timer) clearInterval(timer); });

const formatted = computed(() => ticker.value.toLocaleString("de-DE"));
</script>

<style scoped>
.block {
  background: var(--card-color-bg);
  color: var(--color-text);
  border-radius: var(--border-radius-card);
  padding: var(--space-card-pad);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-300);
}
.block--elevated { box-shadow: var(--shadow-1); }
.live__pulse {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: oklch(0.62 0.16 145);
  box-shadow: 0 0 0 0 oklch(0.62 0.16 145 / 0.55);
  animation: pulse 1.6s ease-out infinite;
}
@keyframes pulse {
  0%   { box-shadow: 0 0 0 0   oklch(0.62 0.16 145 / 0.55); }
  70%  { box-shadow: 0 0 0 12px oklch(0.62 0.16 145 / 0); }
  100% { box-shadow: 0 0 0 0   oklch(0.62 0.16 145 / 0); }
}
.live__body { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.live__count {
  font-size: var(--font-3xl);
  line-height: 1;
  font-weight: var(--font-bold);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.live__label {
  font-size: var(--font-sm);
  color: var(--color-text-light);
  letter-spacing: 0.02em;
}
.live__sub {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
  letter-spacing: 0.02em;
}
</style>
