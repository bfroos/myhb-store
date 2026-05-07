<template>
  <span
    class="stamp"
    :class="[`stamp--${variant}`, `stamp--${size}`]"
    :style="{ '--rot': `${rotate}deg` }"
    role="img"
    :aria-label="ariaLabel || `${value} ${label}`"
  >
    <span class="stamp__inner">
      <strong v-if="value" class="stamp__value">{{ value }}</strong>
      <span v-if="label" class="stamp__label">{{ label }}</span>
      <span v-if="sub" class="stamp__sub">{{ sub }}</span>
    </span>
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  value?: string;
  label?: string;
  sub?: string;
  variant?: "red" | "ink" | "soft";
  size?: "sm" | "md" | "lg";
  rotate?: number;
  ariaLabel?: string;
}>(), {
  value: "20%",
  label: "RABATT",
  sub: "für Neukunden",
  variant: "red",
  size: "md",
  rotate: -8,
});
</script>

<style scoped>
/* The "Störer" — a rotated round seal. The only red in the system; used sparingly. */
.stamp {
  --stamp-bg: oklch(0.55 0.18 25);          /* muted brand red */
  --stamp-bg-edge: oklch(0.45 0.16 25);     /* deeper ring */
  --stamp-fg: #fff;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size, 96px);
  height: var(--size, 96px);
  border-radius: 999px;
  background: var(--stamp-bg);
  color: var(--stamp-fg);
  text-align: center;
  transform: rotate(var(--rot, -8deg));
  box-shadow:
    0 0 0 2px var(--stamp-bg) inset,
    0 0 0 3px var(--stamp-fg) inset,
    0 0 0 5px var(--stamp-bg) inset,
    var(--shadow-3);
  user-select: none;
  font-family: var(--font-family-base);
  letter-spacing: 0;
}
.stamp--sm { --size: 72px; }
.stamp--md { --size: 96px; }
.stamp--lg { --size: 128px; }

.stamp--ink {
  --stamp-bg: var(--color-gray-950);
  --stamp-bg-edge: var(--color-gray-900);
}
.stamp--soft {
  --stamp-bg: oklch(0.92 0.04 25);
  --stamp-fg: oklch(0.45 0.16 25);
}

.stamp__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1;
  gap: 2px;
  padding: 8px;
}
.stamp__value {
  font-size: calc(var(--size) * 0.32);
  font-weight: var(--font-bold);
  letter-spacing: -0.02em;
  line-height: 1;
}
.stamp__label {
  font-size: calc(var(--size) * 0.105);
  font-weight: var(--font-bold);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  line-height: 1;
}
.stamp__sub {
  font-size: calc(var(--size) * 0.095);
  letter-spacing: 0.04em;
  opacity: 0.92;
  margin-top: 2px;
  line-height: 1.1;
}
</style>
