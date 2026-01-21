export interface StrapiBlock {
  id: number;
  __component: string;
}

/**
 * Strapi v5 "Upload file" shape (Media: image/video/audio/...). This matches the objects you get
 * when you populate a media field (e.g. `photo`, `video`, ...).
 */
export interface StrapiMediaFormat {
  url: string;
  name?: string;
  hash?: string;
  ext?: string;
  mime?: string;
  path?: string | null;
  width?: number | null;
  height?: number | null;
  size?: number;
  sizeInBytes?: number;
}

export interface StrapiImageFormats {
  thumbnail?: StrapiMediaFormat;
  small?: StrapiMediaFormat;
  medium?: StrapiMediaFormat;
  large?: StrapiMediaFormat;
  [key: string]: StrapiMediaFormat | undefined;
}

export interface StrapiMedia {
  id: number;
  name: string;
  alternativeText?: string | null;
  caption?: string | null;
  formats?: StrapiImageFormats | null;
  mime: string;
  url: string;
}

export type StrapiMediaImage = StrapiMedia & { mime: `image/${string}` };
export type StrapiMediaVideo = StrapiMedia & { mime: `video/${string}` };
export type StrapiMediaAudio = StrapiMedia & { mime: `audio/${string}` };

/**
 * Backwards compatible alias (most of our image usages are just a Strapi media file with `mime` starting with `image/`).
 * Prefer `StrapiMedia` or `StrapiMediaImage` for new code.
 */
export type StrapiImage = StrapiMediaImage;

/**
 * Strapi v5 Rich Text ("blocks") value.
 *
 * Strapi returns rich text fields as an array of "blocks" (paragraph/heading/list/quote/code/image…).
 * Each block contains "nodes" (text/link/image…) in `children`.
 */
export type StrapiRichText = StrapiRichTextBlock[];

export type StrapiRichTextTextNode = {
  type: "text";
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  [key: string]: unknown;
};

export type StrapiRichTextLinkNode = {
  type: "link";
  url: string;
  children?: StrapiRichTextNode[];
  newTab?: boolean;
  [key: string]: unknown;
};

export type StrapiRichTextImageNode = {
  type: "image";
  image: Pick<StrapiMedia, "url" | "alternativeText" | "caption"> | string;
  children?: StrapiRichTextNode[];
  [key: string]: unknown;
};

export type StrapiRichTextNode =
  | StrapiRichTextTextNode
  | StrapiRichTextLinkNode
  | StrapiRichTextImageNode
  | (Record<string, unknown> & {
      type: string;
      children?: StrapiRichTextNode[];
    });

export type StrapiRichTextListItemBlock = {
  type: "list-item";
  children: StrapiRichTextNode[];
  [key: string]: unknown;
};

export type StrapiRichTextBlock = {
  type:
    | "paragraph"
    | "heading"
    | "quote"
    | "code"
    | "list"
    | "list-item"
    | "image";
  children?: Array<StrapiRichTextNode | StrapiRichTextListItemBlock>;
  level?: number; // heading level 1-6
  format?: "ordered" | "unordered"; // list type
  image?: StrapiRichTextImageNode["image"]; // image block shortcut
  [key: string]: unknown;
};

export interface NavigationItem {
  id: number;
  title: string;
  type: "INTERNAL" | "EXTERNAL" | "WRAPPER";
  path?: string;
  externalPath?: string;
  items?: NavigationItem[];
  related?: {
    __type?: string;
    pathKey?: string;
    slug?: string;
    ancestorSlugs?: string[];
    [key: string]: any;
  };
}

export type IconHubIconDto = {
  [key: string]: unknown;
  name?: string;
  data?: unknown;
  iconName?: string;
  iconData?: string;
  width?: number;
  height?: number;
  isSvgEditable?: boolean;
  isIconNameEditable?: boolean;
};

export type LocalizationDto = {
  locale: string;
  slug: string;
};
