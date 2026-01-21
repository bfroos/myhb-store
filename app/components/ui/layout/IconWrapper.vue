<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="computedViewBox"
    fill="none"
    stroke="currentColor"
    stroke-width="1"
    stroke-linecap="round"
    stroke-linejoin="round"
    :width="size"
    :height="size"
    aria-hidden="true"
  >
    <slot />
  </svg>
</template>
<script setup lang="ts">
type IconHubLike = {
  width?: number | string | null;
  height?: number | string | null;
};

const props = defineProps<{
  size?: number;
  /**
   * Optional: pass Iconhub payload so the wrapper can derive a correct viewBox
   * (Iconhub can emit icons with different intrinsic sizes, e.g. 24x24 or 640x640).
   */
  icon?: IconHubLike | null;
  /**
   * Optional override, e.g. "0 0 640 640". Takes precedence over `icon`.
   */
  viewBox?: string;
}>();

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
  stroke-width: 1;
}
</style>
