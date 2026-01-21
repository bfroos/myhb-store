/**
 * Replaces placeholders in a string or StrapiRichText content.
 *
 * @param value - The value to replace the placeholder in (string or StrapiRichText).
 * @param replacements - Array of replacement objects with placeholder and replacement strings.
 * @returns The value with all placeholders replaced.
 */
import type {
  StrapiRichText,
  StrapiRichTextBlock,
  StrapiRichTextNode,
  StrapiRichTextTextNode,
} from "~/lib/strapi/dto/types";

type Replacement = {
  placeholder: string;
  replacement: string;
};

function replaceInString(text: string, replacements: Replacement[]): string {
  let result = text;
  for (const { placeholder, replacement } of replacements) {
    result = result.replace(
      new RegExp(escapeRegExp(placeholder), "g"),
      replacement
    );
  }
  return result;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceInTextNode(
  node: StrapiRichTextTextNode,
  replacements: Replacement[]
): StrapiRichTextTextNode {
  return {
    ...node,
    text: replaceInString(node.text, replacements),
  };
}

function replaceInNode(
  node: StrapiRichTextNode,
  replacements: Replacement[]
): StrapiRichTextNode {
  if (node.type === "text" && "text" in node) {
    return replaceInTextNode(node as StrapiRichTextTextNode, replacements);
  }

  if (node.type === "link" && "url" in node && typeof node.url === "string") {
    return {
      ...node,
      url: replaceInString(node.url, replacements),
      children: node.children?.map((child) =>
        replaceInNode(child, replacements)
      ),
    };
  }

  if (node.children && Array.isArray(node.children)) {
    return {
      ...node,
      children: node.children.map((child) =>
        replaceInNode(child, replacements)
      ),
    };
  }

  return node;
}

function replaceInBlock(
  block: StrapiRichTextBlock,
  replacements: Replacement[]
): StrapiRichTextBlock {
  if (block.children && Array.isArray(block.children)) {
    return {
      ...block,
      children: block.children.map((child) =>
        replaceInNode(child, replacements)
      ),
    };
  }
  return block;
}

export function replacePlaceholderString(
  value: string | StrapiRichText | null | undefined,
  replacements: Replacement[]
): string | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    return replaceInString(value, replacements);
  }

  return undefined;
}

export function replacePlaceholderRichtext(
  value: StrapiRichText | null | undefined,
  replacements: Replacement[]
): StrapiRichText | undefined {
  if (!value || !Array.isArray(value)) {
    return undefined;
  }

  return value.map((block) => replaceInBlock(block, replacements));
}
