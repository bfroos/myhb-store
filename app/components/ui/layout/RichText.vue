<template>
  <div class="richText">
    <template v-for="(block, index) in blocks" :key="index">
      <!-- Image Block -->
      <img
        v-if="block.type === 'image'"
        :src="getImageUrl(block)"
        :alt="getImageAlt(block)"
        :class="'richText__image'"
      />
      <!-- Code Block -->
      <pre v-else-if="block.type === 'code'" class="richText__code">
        <code>{{ getCodeContent(block) }}</code>
      </pre>
      <!-- List Block -->
      <component
        v-else-if="block.type === 'list'"
        :is="getListTag(block)"
        :class="getBlockClass(block.type)"
      >
        <template v-if="block.children">
          <template
            v-for="(listItem, listItemIndex) in block.children"
            :key="listItemIndex"
          >
            <li v-if="isListItemBlock(listItem)">
              <RichTextNode
                v-for="(child, childIndex) in (listItem as StrapiRichTextListItemBlock).children"
                :key="childIndex"
                :node="child"
              />
            </li>
          </template>
        </template>
      </component>
      <!-- Heading Block -->
      <component
        v-else-if="block.type === 'heading'"
        :is="getHeadingTag(block)"
        :class="getBlockClass(block.type, block.level)"
      >
        <template v-if="block.children">
          <RichTextNode
            v-for="(child, childIndex) in getNodeChildren(block.children)"
            :key="childIndex"
            :node="child"
          />
        </template>
      </component>
      <!-- Other Blocks (paragraph, quote, etc.) -->
      <component
        v-else
        :is="getBlockTag(block.type)"
        :class="getBlockClass(block.type, block.level)"
      >
        <template v-if="block.children">
          <RichTextNode
            v-for="(child, childIndex) in getNodeChildren(block.children)"
            :key="childIndex"
            :node="child"
          />
        </template>
      </component>
    </template>
  </div>
</template>

<script setup lang="ts">
import RichTextNode from "./RichTextNode.vue";
import type {
  StrapiRichText,
  StrapiRichTextNode,
  StrapiRichTextBlock,
  StrapiRichTextListItemBlock,
} from "~/lib/strapi/dto/types";

const props = defineProps<{
  blocks: StrapiRichText | undefined;
}>();

const config = useRuntimeConfig();

const getBlockTag = (type: string): string => {
  const tagMap: Record<string, string> = {
    paragraph: "p",
    quote: "blockquote",
  };
  return tagMap[type] || "div";
};

const getHeadingTag = (block: StrapiRichTextBlock): string => {
  const level = block.level || 1;
  return `h${Math.min(Math.max(level, 1), 6)}`;
};

const getListTag = (block: StrapiRichTextBlock): string => {
  return block.format === "ordered" ? "ol" : "ul";
};

const getBlockClass = (type: string, level?: number): string | undefined => {
  if (type === "quote") {
    return "richText__quote";
  }
  if (type === "heading" && level) {
    return `richText__heading richText__heading--${level}`;
  }
  return undefined;
};

const getImageUrl = (block: StrapiRichTextBlock): string => {
  if (!block.image) return "";
  const url = typeof block.image === "string" ? block.image : block.image.url;
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${config.public.strapiUrl}${url}`;
};

const getImageAlt = (block: StrapiRichTextBlock): string => {
  if (!block.image || typeof block.image === "string") return "";
  return block.image.alternativeText || "";
};

const getCodeContent = (block: StrapiRichTextBlock): string => {
  if (!block.children || block.children.length === 0) return "";
  // Code blocks can have text nodes as children
  return block.children
    .map((child) => {
      if (child.type === "text") {
        return child.text;
      }
      return "";
    })
    .join("");
};

const isListItemBlock = (
  item: StrapiRichTextNode | StrapiRichTextListItemBlock
): item is StrapiRichTextListItemBlock => {
  // Check if it's a list-item block
  return (
    typeof item === "object" &&
    "type" in item &&
    item.type === "list-item" &&
    "children" in item
  );
};

const getNodeChildren = (
  children: (StrapiRichTextNode | StrapiRichTextListItemBlock)[] | undefined
): StrapiRichTextNode[] => {
  if (!children) return [];
  // Filter out list-item blocks and return only nodes
  return children.filter(
    (child): child is StrapiRichTextNode => !isListItemBlock(child)
  );
};
</script>

<style scoped>
.richText {
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
}

.richText p {
  margin: 0;
}

.richText blockquote {
  margin: 0;
  padding-left: var(--space-600);
  border-left: 3px solid var(--color-border-light);
  font-style: italic;
  color: var(--color-text-light);
}

.richText ul,
.richText ol {
  padding-left: var(--space-600);
  margin: 0;
  list-style-position: outside;
}

.richText ol {
  list-style-type: decimal;
}

.richText ul {
  list-style-type: none;
  position: relative;
}

.richText ul li::before {
  content: "▶";
  position: absolute;
  left: calc(-1 * var(--space-600) + var(--space-200));
  top: 0.25em;
  font-size: 0.7em;
  color: var(--color-text);
}

.richText li {
  margin: var(--space-200) 0;
  position: relative;
  padding-left: var(--space-100);
}

.richText__code {
  margin: 0;
  padding: var(--space-400);
  background: var(--color-gray-100);
  border-radius: var(--border-radius-100);
  overflow-x: auto;
  font-family: monospace;
}

.richText__code code {
  display: block;
  font-family: inherit;
  white-space: pre;
}

.richText h1,
.richText h2,
.richText h3,
.richText h4,
.richText h5,
.richText h6 {
  margin: 0;
  font-weight: var(--font-bold);
}

.richText__heading {
  margin-top: var(--space-600);
  margin-bottom: var(--space-400);
}

.richText__heading--1 {
  font-size: var(--font-2xl);
  line-height: var(--line-2xl);
}

.richText__heading--2 {
  font-size: var(--font-xl);
  line-height: var(--line-xl);
}

.richText__heading--3 {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
}

.richText__heading--4 {
  font-size: var(--font-md);
  line-height: var(--line-md);
}

.richText__heading--5 {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.richText__heading--6 {
  font-size: var(--font-xs);
  line-height: var(--line-xs);
}

.richText__image {
  max-width: 100%;
  height: auto;
  margin: var(--space-600) 0;
  border-radius: var(--border-radius-100);
}

.richText__text--bold {
  font-weight: var(--font-bold);
}

.richText__text--italic {
  font-style: italic;
}

.richText__text--underline {
  text-decoration: underline;
}

.richText__text--strikethrough {
  text-decoration: line-through;
}

.richText__text--code {
  font-family: monospace;
  font-size: 0.9em;
  padding: 2px 4px;
  background: var(--color-gray-100);
  border-radius: 2px;
}

.richText__link {
  color: var(--color-black);
  text-decoration: underline;
  text-underline-offset: 2px;
}
</style>
