<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface>
      <article class="blogArticle">
        <header class="blogArticle__header">
          <div class="blogArticle__header__text">
            <h1 v-if="headline">{{ headline }}</h1>
            <p v-if="intro">{{ intro }}</p>
          </div>
          <div v-if="cover" class="blogArticle__header__image">
            <UiAtomMediaPicture :media="cover" />
          </div>
        </header>
        <aside class="blogArticle__aside">
          <UiAtomDateTag v-if="displayDate" :date="displayDate" />
          <div class="blogArticle__share">
            <UiAtomBaseButton
              icon-only
              variant="tertiary"
              @click="copyLinkToClipboard"
              v-tooltip.right="copyTooltip"
              :aria-label="$t('blog.article.share.copy')"
            >
              <IconLink v-if="!copyTooltipSuccess" />
              <IconCheck v-else />
            </UiAtomBaseButton>
            <UiAtomBaseButton
              icon-only
              variant="tertiary"
              @click="shareOnWhatsApp"
              v-tooltip.right="{
                value: $t('blog.article.share.whatsapp'),
              }"
              :aria-label="$t('blog.article.share.whatsapp')"
            >
              <IconBrandWhatsapp />
            </UiAtomBaseButton>
            <UiAtomBaseButton
              icon-only
              variant="tertiary"
              @click="shareOnFacebook"
              v-tooltip.right="{
                value: $t('blog.article.share.facebook'),
              }"
              :aria-label="$t('blog.article.share.facebook')"
            >
              <IconBrandFacebook />
            </UiAtomBaseButton>
          </div>
        </aside>
        <main
          v-if="components && components.length > 0"
          class="blogArticle__main"
        >
          <BlockRenderer :blocks="components" />
        </main>
        <footer
          v-if="footnotes && footnotes.length > 0"
          class="blogArticle__footer"
        >
          <UiLayoutRichText :blocks="footnotes" />
        </footer>
      </article>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import {
  IconBrandFacebook,
  IconBrandWhatsapp,
  IconLink,
  IconCheck,
} from "@tabler/icons-vue";
import type { StrapiMedia } from "~/lib/strapi/dto/types";
import type { StrapiBlock, StrapiRichText } from "~/lib/strapi/dto/types";

const props = defineProps<{
  headline?: string;
  intro?: string;
  cover?: StrapiMedia;
  components?: StrapiBlock[];
  displayDate?: string;
  footnotes?: StrapiRichText;
}>();

const copyTooltipSuccess = ref(false);
const copyTooltipLabel = computed(() =>
  copyTooltipSuccess.value
    ? $t("blog.article.share.copied")
    : $t("blog.article.share.copy"),
);
const copyTooltip = computed(() => ({
  value: copyTooltipLabel.value,
}));

async function copyLinkToClipboard() {
  const currentUrl = window.location.href;
  await navigator.clipboard.writeText(currentUrl);
  copyTooltipSuccess.value = true;
  setTimeout(() => {
    copyTooltipSuccess.value = false;
  }, 1500);
}

function shareOnWhatsApp() {
  const currentUrl = window.location.href;
  const shareText = props.headline
    ? `${props.headline} ${currentUrl}`
    : currentUrl;
  const encodedText = encodeURIComponent(shareText);
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

function shareOnFacebook() {
  const currentUrl = window.location.href;
  const encodedUrl = encodeURIComponent(currentUrl);
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  window.open(facebookUrl, "_blank", "noopener,noreferrer");
}
</script>
<style scoped>
.blogArticle__header {
  /* REFACTOR: THEMING */
  --card-color-bg: var(--color-card-bg-strong);
  --card-color-text: var(--color-text-on-dark);
  --card-color-bg-item-hover: var(--color-gray-800);

  --color-text: var(--strong-color-text);
  --color-text-light: var(--strong-color-text-light);
  --color-text-muted: var(--strong-color-text-muted);
  --color-border-light: var(--strong-color-border-light);
  --color-border-mute: var(--strong-color-border-mute);

  display: flex;
  flex-direction: column-reverse;

  background: var(--card-color-bg);
  color: var(--color-text);
  border-radius: var(--border-radius-card) var(--border-radius-card) 0 0;
}

.blogArticle__header__text {
  padding: var(--space-card-pad);
}

.blogArticle__header__text > h1 {
  margin: 0 0 var(--space-600);
  font-size: var(--font-5xl);
  line-height: var(--line-5xl);
}

.blogArticle__header__text > p {
  margin: 0 0 var(--space-600);
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  color: var(--color-text-light);
}

.blogArticle__header__image {
  padding: var(--space-card-figure-pad);
}

.blogArticle__header__image picture {
  position: relative;
  display: block;
  height: 400px;
}

.blogArticle__header__image :deep(img) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--border-radius-card-figure);
}

.blogArticle__aside {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-400);
  padding: var(--space-card-pad);
  border-bottom: 1px solid var(--color-border-mute);
}

.blogArticle__share {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-400);
}

.blogArticle__main {
  padding: var(--space-card-pad);
}

.blogArticle__footer {
  grid-area: footer;
  padding: var(--space-card-pad);
  border-top: 1px solid var(--color-border-mute);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

@media screen and (min-width: 900px) {
  .blogArticle {
    display: grid;
    grid-template-columns: 1fr calc(60ch + calc(var(--space-card-pad) * 2));
    grid-template-rows: repeat(4, max-content);
    grid-template-areas:
      "header header"
      "aside main"
      "aside main"
      "footer footer";
  }

  .blogArticle__header {
    grid-area: header;
    flex-direction: row;
  }

  .blogArticle__header__image {
    flex: 1 0 50%;
    padding: var(--space-card-pad) 0 0 0;
  }

  .blogArticle__header__image :deep(img) {
    border-radius: var(--border-radius-card-sm) 0 0 0;
  }

  .blogArticle__aside {
    grid-area: aside;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: var(--space-card-pad);
  }

  .blogArticle__share {
    flex-direction: column;
  }

  .blogArticle__main {
    position: relative;
    grid-area: main;
    margin-top: calc(var(--space-card-pad) * -1);
    padding-top: calc(var(--space-card-pad) * 1.5);
    background: var(--color-card-bg-light);
    border-radius: var(--border-radius-card-sm) var(--border-radius-card-sm) 0 0;
  }

  .blogArticle__header__text {
    flex: 1 0 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: calc(var(--space-card-pad) * 1.5) calc(var(--space-card-pad) * 2)
      calc(var(--space-card-pad) * 1.5) var(--space-card-pad);
  }

  .blogArticle__header__image picture {
    height: 100%;
    min-height: 480px;
  }
}

@media screen and (min-width: 1100px) {
  .blogArticle {
    display: grid;
    grid-template-columns: 1fr calc(70ch + calc(var(--space-card-pad) * 2)) 1fr;
    grid-template-rows: repeat(4, max-content);
    grid-template-areas:
      "header header header"
      "aside main ."
      "aside main ."
      "footer footer footer";
  }
}
</style>
