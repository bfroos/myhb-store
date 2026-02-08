<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="computedViewBox"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    :width="size"
    :height="size"
    aria-hidden="true"
    :class="{ 'icon-wrapper--rotate': rotate }"
  >
    <slot />
  </svg>
</template>
<script setup lang="ts">
type IconHubLike = {
  width?: number | string | null;
  height?: number | string | null;
};

const props = withDefaults(
  defineProps<{
    size?: number;
    strokeWidth?: number;
    /**
     * Optional: pass Iconhub payload so the wrapper can derive a correct viewBox
     * (Iconhub can emit icons with different intrinsic sizes, e.g. 24x24 or 640x640).
     */
    icon?: IconHubLike | null;
    /**
     * Optional override, e.g. "0 0 640 640". Takes precedence over `icon`.
     */
    viewBox?: string;
    /**
     * Continuous rotation, e.g. for loader icons.
     */
    rotate?: boolean;
  }>(),
  {
    strokeWidth: 1.25,
    rotate: false,
  },
);

const size = computed(() => props.size || 42);

function asFiniteNumber(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : (v as number);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const computedViewBox = computed(() => {
  if (props.viewBox && props.viewBox.trim()) return props.viewBox.trim();

  const w = asFiniteNumber(props.icon?.width);
  const h = asFiniteNumber(props.icon?.height);
  if (w && h) return `0 0 ${w} ${h}`;

  // default fallback (common icon grid)
  return "0 0 24 24";
});
</script>
<style scoped>
svg :deep(*) {
  stroke-width: v-bind(strokeWidth);
}

.icon-wrapper--rotate {
  animation: icon-wrapper-rotate 3s linear infinite;
}

@keyframes icon-wrapper-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
