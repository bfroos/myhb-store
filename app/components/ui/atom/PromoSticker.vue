<template>
  <span
    class="sticker"
    :class="[`sticker--${size}`]"
    :style="{ '--rot': `${rotate}deg` }"
    role="img"
    :aria-label="ariaLabel"
  >
    <img
      :src="src"
      alt=""
      class="sticker__img"
      draggable="false"
    />
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  /** Path to the official sticker asset */
  src?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  rotate?: number;
  ariaLabel?: string;
}>(), {
  src: "/img/promo/promo-sticker-20.jpg",
  size: "md",
  rotate: -8,
  ariaLabel: "20 % auf Deine erste Behandlung",
});
</script>

<style scoped>
.sticker {
  --size: 96px;
  display: inline-flex;
  width: var(--size);
  height: var(--size);
  border-radius: 999px;
  overflow: hidden;
  transform: rotate(var(--rot, -8deg));
  filter: drop-shadow(0 8px 18px rgba(0,0,0,0.18));
  user-select: none;
  flex-shrink: 0;
}
.sticker--xs { --size: 56px; }
.sticker--sm { --size: 72px; }
.sticker--md { --size: 96px; }
.sticker--lg { --size: 128px; }
.sticker--xl { --size: 168px; }
.sticker__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}
</style>
