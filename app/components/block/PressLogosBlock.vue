<template>
  <section v-if="hasContent" class="block press" :class="[themeClass, { 'block--elevated': elevated }]">
    <p v-if="eyebrow" class="press__eyebrow">{{ eyebrow }}</p>
    <ul class="press__list" role="list">
      <li v-for="logo in displayLogos" :key="logo.name" class="press__item">
        <component
          :is="logo.link ? 'a' : 'span'"
          class="press__link"
          v-bind="logo.link
            ? {
                href: logo.link,
                target: logo.openInNewWindow ? '_blank' : undefined,
                rel: [
                  logo.openInNewWindow ? 'noopener' : '',
                  logo.noFollow ? 'nofollow' : '',
                ]
                  .filter(Boolean)
                  .join(' ') || undefined,
              }
            : {}"
        >
          <img
            v-if="logo.src"
            class="press__logo"
            :src="logo.src"
            :alt="logo.alt ?? logo.name"
            loading="lazy"
          />
          <span v-else class="press__name">{{ logo.name }}</span>
        </component>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { StrapiMedia } from "~/lib/strapi/dto/types";
import { mediaUrl } from "~/utils/landingBlockMedia";

interface Logo { name: string; src?: string; alt?: string; link?: string; openInNewWindow?: boolean; noFollow?: boolean }
interface LogoItem { name: string; logo?: StrapiMedia; link?: string; openInNewWindow?: boolean; noFollow?: boolean }

const props = withDefaults(defineProps<{
  eyebrow?: string;
  logoItems?: LogoItem[];
  elevated?: boolean;
  themeClass?: "theme-light" | "theme-soft" | "theme-neutral" | "theme-strong";
}>(), {
  elevated: true,
  themeClass: "theme-light",
});

const displayLogos = computed<Logo[]>(() =>
  (props.logoItems ?? []).map((item) => ({
    name: item.name,
    src: mediaUrl(item.logo),
    alt: item.logo?.alternativeText ?? item.name,
    link: item.link || undefined,
    openInNewWindow: item.openInNewWindow,
    noFollow: item.noFollow,
  })),
);

const hasContent = computed(() => displayLogos.value.length > 0);
</script>

<style scoped>
.block {
  background: var(--card-color-bg);
  color: var(--color-text);
  border-radius: var(--border-radius-card);
  padding: var(--space-card-pad-sm) var(--space-card-pad);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-400);
}
.block--elevated { box-shadow: var(--shadow-1); }
.press__eyebrow {
  margin: 0;
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-text-light);
}
.press__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-500) var(--space-700);
  width: 100%;
}
.press__item {
  display: inline-flex;
  align-items: center;
}
.press__link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  transition: opacity 0.2s ease;
}
a.press__link:hover {
  opacity: 1;
}
a.press__link:hover .press__logo,
a.press__link:hover .press__name {
  filter: grayscale(0);
  opacity: 1;
}
.press__name {
  font-family: "Times New Roman", "Times", serif;
  font-style: italic;
  font-weight: 700;
  font-size: 22px;
  letter-spacing: 0.02em;
  color: var(--color-text-light);
  filter: grayscale(1);
  opacity: 0.85;
}
.press__logo {
  display: block;
  max-width: 130px;
  max-height: 36px;
  object-fit: contain;
  filter: grayscale(1);
  opacity: 0.85;
}
</style>
