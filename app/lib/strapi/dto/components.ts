import type { IconHubIconDto, StrapiMedia, StrapiRichText } from "./types";
import type {
  FaqDto,
  ReviewDto,
  TreatmentDto,
  TreatmentPageDto,
  GeneralPageDto,
  LocationDto,
  ProductDto,
  EmployeeDto,
  FaqSetDto,
  ProductCategoryDto,
  StoryDto,
  JobDto,
} from "./collections";
import {
  CardElevation,
  ColorTheme,
  TreatmentPlanStepType,
  TrustGridIconPosition,
  TrustGridItemsPosition,
  WeekDay,
  SharedButtonAction,
  SharedButtonMethod,
  SharedButtonTargetType,
  SharedButtonSingleType,
  SharedButtonVariant,
  SharedButtonCollection,
  BlockPageHeaderLayout,
  BlockHighlightsStripType,
  ProductVolumeUnit,
} from "./enums";
import {
  OrganismMediaCardContentAlignment,
  OrganismMediaCardLayout,
  OrganismMediaCardMediaAlignment,
} from "~/lib/ui/enums";

/*
 * ==============================
 * Blocks
 * ==============================
 */

export type BlockBenefitsListDto = {
  headline?: string;
  items?: SharedIconHeadingContentDto[];
  media?: StrapiMedia;
  links?: SharedButtonDto[];
  cardSettings?: CardSettingsDto;
  videoSettings?: SharedVideoSettingsDto;
};

export type BlockComparisonBlockDto = {
  firstItem?: SharedIconHeadingContentDto;
  secondItem?: SharedIconHeadingContentDto;
  cardSettings?: CardSettingsDto;
};

export type BlockDirectionsDto = {
  headline?: string;
  content?: StrapiRichText;
  image?: StrapiMedia;
  walkDirections?: StrapiRichText;
  publicTransportDirections?: StrapiRichText;
  carDirections?: StrapiRichText;
  fixedImageAspectRatio: boolean;
  cardSettings?: CardSettingsDto;
};

export type BlockEmployeeDto = {
  headline?: string;
  intro?: string;
  content?: StrapiRichText;
  employee?: EmployeeDto;
  layout: OrganismMediaCardLayout;
  links?: SharedButtonDto[];
  cardSettings?: CardSettingsDto;
};

export type BlockEmployeeListDto = {
  headline?: string;
  content?: StrapiRichText;
  employees?: EmployeeDto[];
  cardSettings?: CardSettingsDto;
};

export type BlockFaqBlockDto = {
  headline?: string;
  faqs?: FaqDto[];
  faqSets?: FaqSetDto[];
  cardSettings?: CardSettingsDto;
};

export type BlockHighlightsStripDto = {
  headline?: string;
  type: BlockHighlightsStripType;
  numberItems?: SharedKeyValueDto[];
  iconItems?: SharedIconTextPairDto[];
  showDivider: boolean;
  cardSettings?: CardSettingsDto;
};

export type BlockJobTeasersDto = {
  headline?: string;
  showFilters?: boolean;
  jobs?: JobDto[];
  cardSettings?: CardSettingsDto;
};

export type BlockLocationMapDto = {
  headline?: string;
  list?: SharedIconTextPairDto[];
  links: SharedButtonDto[];
  cardSettings?: CardSettingsDto;
};

export type BlockLocationTeasersDto = {
  headline?: string;
  locations?: LocationDto[];
  cardSettings?: CardSettingsDto;
  showFilters?: boolean;
};

export type BlockMediaBentoDto = {
  headline?: string;
  intro?: string;
  content?: StrapiRichText;
  mediaItems?: StrapiMedia[];
  layout: OrganismMediaCardLayout;
  cardSettings?: CardSettingsDto;
  videoSettings?: SharedVideoSettingsDto;
};

export type BlockMediaCardDto = {
  headline?: string;
  intro?: string;
  content?: StrapiRichText;
  media?: StrapiMedia;
  contentAlignment?: OrganismMediaCardContentAlignment;
  mediaAlignment?: OrganismMediaCardMediaAlignment;
  layout: OrganismMediaCardLayout;
  fixedImageAspectRatio?: boolean;
  mediaCaption?: boolean;
  captionTitle?: string;
  captionDescription?: string;
  cardSettings?: CardSettingsDto;
  videoSettings?: SharedVideoSettingsDto;
  links?: SharedButtonDto[];
};

export type BlockPageHeaderDto = {
  headline?: string;
  intro?: string;
  layout: BlockPageHeaderLayout;
  media?: StrapiMedia;
  fixedImageAspectRatio?: boolean;
  cardSettings?: CardSettingsDto;
  videoSettings?: SharedVideoSettingsDto;
};

export type BlockProcessStepsDto = {
  headline?: string;
  content?: StrapiRichText;
  steps?: SharedImageHeadingTextDto[];
  links?: SharedButtonDto[];
  cardSettings?: CardSettingsDto;
};

export type BlockProductCategoryPriceOverviewDto = {
  showProducts?: boolean;
  showTreatments?: boolean;
  productCategories?: ProductCategoryDto[];
};

export type BlockProductHeroDto = {
  manufacturerName: string;
  productName: string;
  variants: ProductVariantDto[];
  cardSettings?: CardSettingsDto;
};

export type BlockReviewsDto = {
  headline?: string;
  reviews?: ReviewDto[];
  localReviews: boolean;
  googlePlaceId?: string;
  oddItemsTheme?: ColorTheme;
  evenItemsTheme?: ColorTheme;
};

export type BlockStoriesDto = {
  headline?: string;
  stories?: StoryDto[];
  cardSettings?: CardSettingsDto;
};

export type BlockTableOfContentsDto = {
  headline?: string;
  intro?: string;
  content?: StrapiRichText;
  index?: SharedKeyValueDto[];
  links?: SharedButtonDto[];
  cardSettings?: CardSettingsDto;
};

export type BlockTextContentDto = {
  headline?: string;
  intro?: string;
  content?: StrapiRichText;
  columnCount?: 1 | 2;
  links?: SharedButtonDto[];
  cardSettings?: CardSettingsDto;
};

export type BlockTreatmentDetailsDto = {
  headline?: string;
  image?: StrapiMedia;
  price?: string;
  duration?: string;
  aftercareSummary?: string;
  anesthesia?: string;
  effect?: string;
  effectDuration?: string;
  finalResults?: string;
  followUpTreatments?: string;
  initialResults?: string;
  medication?: string;
  treatment?: TreatmentDto;
  cardSettings?: CardSettingsDto;
};

export type BlockTreatmentHeroDto = {
  announcementText?: string;
  eyebrow?: string;
  headlinePrefix?: string;
  headline?: string;
  headlineSuffix?: string;
  subline?: string;
  text?: string;
  showPrice?: boolean;
  showGlobalDiscount?: boolean;
  showReviews?: boolean;
  showCompanyLogos?: boolean;
  cover?: StrapiMedia;
  cta?: SharedButtonDto;
  treatment?: TreatmentDto;
  cardSettings?: CardSettingsDto;
  calendlyUrl?: string;
};

export type BlockTreatmentPlanDto = {
  headline?: string;
  content?: StrapiRichText;
  additionalInfos?: SharedCollapsibleItemDto[];
  personaAge?: number;
  personaPhoto?: StrapiMedia;
  personaTreatmentGoal?: string;
  steps?: TreatmentPlanStepDto[];
  links?: SharedButtonDto[];
  cardSettings?: CardSettingsDto;
};

export type BlockTreatmentTeasersDto = {
  headline?: string;
  showShortDescriptions: boolean;
  showPrices: boolean;
  showDescriptions: boolean;
  treatmentPages?: TreatmentPageDto[];
  locationPathKey?: string;
  cardSettings?: CardSettingsDto;
};

export type BlockTrustGridDto = {
  headline?: string;
  items?: SharedIconHeadingContentDto[];
  itemsPosition: TrustGridItemsPosition;
  iconPosition: TrustGridIconPosition;
  cardSettings?: CardSettingsDto;
};

export type BlockQualificationsBlockDto = {
  headline?: string;
  qualifications?: EmployeeQualificationGroupDto[];
  vitaEntries?: EmployeeVitaEntryDto[];
  cardSettings?: CardSettingsDto;
};

/*
 * ==============================
 * Employee
 * ==============================
 */

export type EmployeeQualificationGroupDto = {
  label: string;
  items: EmployeeTextItemDto[];
};

export type EmployeeVitaEntryDto = {
  fromYear: number;
  toYear?: number;
  text: string;
};

export type EmployeeTextItemDto = {
  text: string;
};

/*
 * ==============================
 * Global
 * ==============================
 */

export type GlobalSeoDto = {
  defaultTitle?: string;
  defaultDescription?: string;
  titleSeparator?: string;
  titleSuffix?: string;
};

/*
 * ==============================
 * Location
 * ==============================
 */

export type LocationAboutItemDto = {
  headline?: string;
  intro?: string;
  content?: StrapiRichText;
  media?: StrapiMedia;
};

export type LocationContactDto = {
  phoneNumber?: string | null;
  whatsAppNumber?: string | null;
};

export type LocationAboutDto = {
  comingSoon?: LocationAboutItemDto;
  openSoon?: LocationAboutItemDto;
  open?: LocationAboutItemDto;
};

/*
 * ==============================
 * Product
 * ==============================
 */

export type ProductVariantDto = {
  label: string;
  slug: string;
  priceInEuroCent: number;
  isActive: boolean;
  volume: ProductVolumeDto;
  images: StrapiMedia[];
  description: StrapiRichText;
};

export type ProductVolumeDto = {
  quantity: number;
  unit: ProductVolumeUnit;
};

/*
 * ==============================
 * Shared
 * ==============================
 */

export type SharedAddressDto = {
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
};

export type SharedButtonDto = {
  id?: number;
  label: string;
  method: SharedButtonMethod;
  action?: SharedButtonAction;
  variant?: SharedButtonVariant;

  // internal link method
  targetType?: SharedButtonTargetType;
  singleType?: SharedButtonSingleType;
  collection?: SharedButtonCollection;
  page?: GeneralPageDto;
  treatment?: TreatmentPageDto;
  location?: LocationDto;
  product?: ProductDto;

  // external link target
  url?: string;

  // internal/external
  anchor?: string;
  openInNewWindow?: boolean;
  noFollow?: boolean;

  // data
  data?: any;
};

export type CardSettingsDto = {
  colorTheme?: ColorTheme;
  elevation?: CardElevation;
};

export type SharedKeyValueDto = {
  key: string;
  value: string;
};

export type SharedCollapsibleItemDto = {
  id: number;
  title: string;
  content: StrapiRichText;
  isOpenByDefault: boolean;
  icon?: IconHubIconDto;
};

export type SharedCoordinatesDto = {
  lat?: number | string;
  long?: number | string;
};

export type SharedHeadingContentItemDto = {
  heading?: string;
  content?: StrapiRichText;
};

export type SharedIconHeadingContentDto = {
  heading?: string;
  content?: StrapiRichText;
  icon?: IconHubIconDto;
};

export type SharedIconHeadingTextDto = {
  heading?: string;
  icon: IconHubIconDto;
  text?: string;
};

export type SharedIconTextPairDto = {
  id?: number;
  icon?: IconHubIconDto;
  text?: string;
};

export type SharedImageHeadingTextDto = {
  heading?: string;
  text?: StrapiRichText;
  image?: StrapiMedia;
};

export type SharedOpenGraphDto = {
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: StrapiMedia;
};

export type SharedOpeningHoursDto = {
  week?: SharedOpeningHoursDayDto[];
  exceptions?: SharedOpeningHoursExceptionsDto[];
};

export type SharedOpeningHoursDayDto = {
  day: WeekDay;
  closed: boolean;
  intervals?: SharedOpeningHoursIntervalDto[];
};

export type SharedOpeningHoursIntervalDto = {
  opens: string;
  closes: string;
};

export type SharedOpeningHoursExceptionsDto = {
  date: string;
  closedAllDay: boolean;
  intervals?: SharedOpeningHoursIntervalDto[];
  note?: string;
};

export type SharedSeoDto = {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  metaRobots?: string;
  openGraph?: SharedOpenGraphDto;
};

export type SharedVideoSettingsDto = {
  autoplay?: boolean;
  playsInline?: boolean;
  preload?: boolean;
};

/*
 * ==============================
 * Treatment Page
 * ==============================
 */

export type TreatmentPageAboutDto = {
  headline?: string;
  intro?: string;
  content?: StrapiRichText;
  media?: StrapiMedia;
};

export type TreatmentPageFaqDto = {
  headline?: string;
  faqs?: FaqDto[];
};

export type TreatmentPageHeroDto = {
  headline?: string;
  headlineSuffix?: string;
  subline?: string;
  text?: string;
  cover?: StrapiMedia;
  showDiscount?: boolean;
  showPrice?: boolean;
};

export type TreatmentPageMedicalTeamHighlightDto = {
  headline: string;
  intro?: string;
  content?: StrapiRichText;
  employee?: EmployeeDto;
};

export type TreatmentPageRelatedTreatmentsDto = {
  headline?: string;
  treatmentPages?: TreatmentPageDto[];
};

export type TreatmentPageReviewsDto = {
  headline?: string;
  reviews?: ReviewDto[];
};

export type TreatmentPageTableOfContentsDto = {
  headline?: string;
  intro?: string;
  content?: StrapiRichText;
};

export type TreatmentPageTeaserDto = {
  title?: string;
  shortDescription?: string;
  description?: string;
  image?: StrapiMedia;
};

export type TreatmentPageTreatmentDetailsDto = {
  headline?: string;
  image?: StrapiMedia;
  aftercareSummary?: string;
  anesthesia?: string;
  duration?: string;
  effect?: string;
  effectDuration?: string;
  finalResults?: string;
  followUpTreatments?: string;
  initialResults?: string;
  medication?: string;
  price?: string;
};

export type TreatmentPageTreatmentPlanDto = {
  headline?: string;
  content?: StrapiRichText;
  additionalInfos?: SharedCollapsibleItemDto[];
  personaAge?: number;
  personaPhoto?: StrapiMedia;
  personaTreatmentGoal?: string;
  steps?: TreatmentPlanStepDto[];
};

export type TreatmentPageTreatmentProcessStepsDto = {
  headline?: string;
  content?: StrapiRichText;
  steps?: SharedImageHeadingTextDto[];
};

export type TreatmentPageBenefitsDto = {
  headline?: string;
  items?: SharedHeadingContentItemDto[];
  media?: StrapiMedia;
};

export type TreatmentPageSuitabilityDto = {
  notSuitableFor?: SharedHeadingContentItemDto;
  suitableFor?: SharedHeadingContentItemDto;
};

/*
 * ==============================
 * Treatment Plan
 * ==============================
 */

export type TreatmentPlanStepDto = {
  type: TreatmentPlanStepType;
  week?: number;
  description?: string;
  treatments?: TreatmentDto[];
  followUpPlanText?: string;
  endOfPlanText?: string;
};
