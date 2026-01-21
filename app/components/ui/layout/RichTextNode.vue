<template>
  <!-- Text Node -->
  <span v-if="node.type === 'text' && hasFormatting" :class="textClasses">
    {{ node.text }}
  </span>
  <template v-else-if="node.type === 'text'">
    {{ node.text }}
  </template>
  <!-- Link Node -->
  <a
    v-else-if="node.type === 'link'"
    :href="linkUrl"
    :target="node.newTab ? '_blank' : undefined"
    :rel="node.newTab ? 'noopener noreferrer' : undefined"
    class="richText__link"
  >
    <template v-if="node.children && node.children.length > 0">
      <RichTextNode
        v-for="(child, index) in node.children"
        :key="index"
        :node="child"
      />
    </template>
    <template v-else>
      {{ node.url }}
    </template>
  </a>
  <!-- Image Node (nested in blocks) -->
  <img
    v-else-if="node.type === 'image'"
    :src="getImageUrl(node)"
    :alt="getImageAlt(node)"
    class="richText__image"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import type {
  StrapiRichTextNode as StrapiNode,
  StrapiRichTextTextNode as StrapiTextNode,
  StrapiRichTextLinkNode as StrapiLinkNode,
  StrapiRichTextImageNode as StrapiImageNode,
} from "~/lib/strapi/dto/types";

const props = defineProps<{
  node: StrapiNode;
}>();

const config = useRuntimeConfig();
const localePath = useLocalePath();

// Check if URL is internal (starts with / and not http)
const isInternalLink = computed(() => {
  if (props.node.type !== "link") return false;
  const url = (props.node as any).url;
  if (typeof url !== "string") return false;
  return (
    url &&
    url.startsWith("/") &&
    !url.startsWith("//") &&
    !url.startsWith("http")
  );
});

// Get the correct URL - use localePath for internal links
const linkUrl = computed(() => {
  if (props.node.type !== "link") return "";
  const url = (props.node as any).url;
  if (typeof url !== "string") return "";
  if (isInternalLink.value) return localePath(url);
  return url;
});

const hasFormatting = computed(() => {
  if (props.node.type !== "text") return false;
  return !!(
    props.node.bold ||
    props.node.italic ||
    props.node.underline ||
    props.node.strikethrough ||
    props.node.code
  );
});

const textClasses = computed(() => {
  if (props.node.type !== "text") return "";
  const classes: string[] = [];
  if (props.node.bold) classes.push("richText__text--bold");
  if (props.node.italic) classes.push("richText__text--italic");
  if (props.node.underline) classes.push("richText__text--underline");
  if (props.node.strikethrough) classes.push("richText__text--strikethrough");
  if (props.node.code) classes.push("richText__text--code");
  return classes.join(" ");
});

const getImageUrl = (node: StrapiNode): string => {
  if (node.type !== "image") return "";
  const image = (node as any).image as StrapiImageNode["image"] | undefined;
  if (!image) return "";
  const url = typeof image === "string" ? image : image.url;
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${config.public.strapiUrl}${url}`;
};

const getImageAlt = (node: StrapiNode): string => {
  if (node.type !== "image") return "";
  const image = (node as any).image as StrapiImageNode["image"] | undefined;
  if (!image || typeof image === "string") return "";
  return image.alternativeText || "";
};
</script>

<style scoped>
.richText__link {
  color: var(--color-black);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: opacity 0.2s;
}

.richText__link:hover {
  opacity: 0.8;
}

.richText__image {
  max-width: 100%;
  height: auto;
  display: block;
}
</style>
