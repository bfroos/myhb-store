import type {
  CardSettingsDto,
  SharedAddressDto,
  SharedVideoSettingsDto,
} from "../strapi/dto/components";
import type { StrapiMedia } from "../strapi/dto/types";
import type { BlogCategoryDto, CityDto } from "../strapi/dto/collections";
import type {
  ImageFormat,
  ImageBreakpoint,
  LocationOpenStatus,
} from "../strapi/dto/enums";
import type {
  OrganismMediaCardLayout,
  OrganismMediaCardContentAlignment,
  OrganismMediaCardMediaAlignment,
} from "./enums";
import type { RouteLocationRaw } from "vue-router";

/*
 * Base Components
 */

export type BaseButtonProps = {
  size?: "lg" | "md" | "sm";
  variant?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "quaternary"
    | "link"
    | "text";
  iconOnly?: boolean;
  isToggle?: boolean;
  ariaLabel?: string;
  as?: "button" | "a" | "nuxt-link" | "nuxt-link-locale";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  to?: RouteLocationRaw;
  prefetch?: boolean;
  external?: boolean;
  fullWidth?: boolean;
};

/*
 * Blocks
 */
export type TableOfContentsItem = {
  anchor: string;
  label: string;
};

/*
 * Organisms
 */
export type OrganismMediaCard = {
  layout: OrganismMediaCardLayout;
  fixedImageAspectRatio?: boolean;
  contentAlignment?: OrganismMediaCardContentAlignment;
  mediaAlignment?: OrganismMediaCardMediaAlignment;
  mediaCaption?: boolean;
  captionTitle?: string;
  captionDescription?: string;
  cardSettings?: CardSettingsDto;
  isMediaVideo?: boolean;
  videoSettings?: SharedVideoSettingsDto;
  fullHeight?: boolean;
};

/*
 * Molecules
 */
export type BreadcrumbItem = {
  title: string;
  to?: string;
};

export type MoleculeLocationItem = {
  name: string;
  slug: string;
  city: CityDto;
  newOpeningDate?: string;
  openingStatus: LocationOpenStatus;
  address?: SharedAddressDto;
  buildingImage?: StrapiMedia;
};

export type LocationItem = {
  name: string;
  slug: string;
  city: CityDto;
  newOpeningDate?: string;
  address?: SharedAddressDto;
  image?: StrapiMedia;
};

export type MoleculeTreatmentTile = {
  title: string;
  shortDescription?: string;
  description?: string;
  image?: StrapiMedia;
  path: string;
  priceInEuroCent?: number;
  isStartingPrice?: boolean;
};

export type MoleculeBlogArticleTeaser = {
  slug: string;
  headline: string;
  intro?: string;
  date?: string | Date;
  cover?: StrapiMedia;
  displayDate?: string;
  category?: BlogCategoryDto;
};

/*
 * Atoms
 */
export type MediaPictureSources = {
  [breakpoint in ImageBreakpoint]?: ImageFormat;
};

export type AtomMediaPicture = {
  media: StrapiMedia;
  sources?: MediaPictureSources;
  defaultFormat?: ImageFormat;
  alt?: string;
  loading?: "lazy" | "eager";
};
