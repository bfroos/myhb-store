import type {
  LocationContactDto,
  SharedCoordinatesDto,
  LocationAboutDto,
  SharedOpeningHoursDto,
  SharedSeoDto,
  SharedAddressDto,
  BlockDirectionsDto,
  ProductVariantDto,
  TreatmentPageAboutDto,
  TreatmentPageTreatmentPlanDto,
  TreatmentPageTreatmentDetailsDto,
  TreatmentPageTableOfContentsDto,
  TreatmentPageReviewsDto,
  TreatmentPageRelatedTreatmentsDto,
  TreatmentPageMedicalTeamHighlightDto,
  TreatmentPageTeaserDto,
  TreatmentPageHeroDto,
  EmployeeVitaEntryDto,
  EmployeeQualificationGroupDto,
  TreatmentPageBenefitsDto,
  TreatmentPageSuitabilityDto,
  TreatmentPageTreatmentProcessStepsDto,
  TreatmentPageFaqDto,
} from "~/lib/strapi/dto/components";
import type { StrapiMedia, StrapiRichText, StrapiBlock } from "./types";
import type {
  FederalState,
  EmployeeType,
  LocationType,
  ReviewSource,
  TreatmentType,
  LocationOpenStatus,
  JobEmploymentType,
  JobContractType,
  JobApplyTarget,
} from "./enums";
import type { LocalizationDto } from "~/lib/strapi/dto/types";

export type BlogArticleDto = {
  id: number | string;
  slug: string;
  headline: string;
  intro: string;
  cover: StrapiMedia;
  category?: BlogCategoryDto;
  components: StrapiBlock[];
  seo: SharedSeoDto;
  listOfSources: StrapiRichText;
  footnotes: StrapiRichText;
  localizations: LocalizationDto[];
  displayDate: string;
};

export type BlogCategoryDto = {
  name: string;
  slug: string;
  localizations: LocalizationDto[];
};

export type CityDto = {
  id: number | string;
  name: string;
  slug: string;
  federalState: FederalState;
  locations: LocationDto[];
  localizations: LocalizationDto[];
};

export type EmployeeDto = {
  id: number | string;
  firstName: string;
  lastName: string;
  slug: string;
  academicTitle?: string;
  role?: string;
  department?: string;
  employeeType: EmployeeType;
  aboutText?: StrapiRichText;
  qualificationGroups?: EmployeeQualificationGroupDto[];
  vitaEntries?: EmployeeVitaEntryDto[];
  photo?: StrapiMedia;
  locations?: LocationDto[];
  reviews?: ReviewDto[];
  treatmentSpecialties?: TreatmentPageDto[];
  isActive: boolean;
  hideFromPublic: boolean;
  localizations: LocalizationDto[];
};

export type FaqDto = {
  id: number | string;
  question: string;
  answer: StrapiRichText;
  isActive: boolean;
};

export type FaqSetDto = {
  id: number | string;
  faqs: FaqDto[];
};

export type GeneralPageDto = {
  id: number | string;
  slug: string;
  name: string;
  blocks: StrapiBlock[];
  seo: SharedSeoDto;
  localizations: LocalizationDto[];
};

export type JobDto = {
  id: number | string;
  title: string;
  slug: string;
  isActive: boolean;
  genderHint: string;
  startDate?: string;
  applyTarget: JobApplyTarget;
  url?: string;
  email?: string;
  locations?: LocationDto[];
  content?: StrapiBlock[];
  employmentTypes?: JobEmploymentType[];
  contractTypes?: JobContractType[];
  hourlyRateMinInEuroCent?: number;
  hourlyRateMaxInEuroCent?: number;
  cover: StrapiMedia;
  recruiter?: EmployeeDto;
  updatedAt?: string;
};

export type LocationDto = {
  id: number | string;
  slug: string;
  name: string;
  googlePlaceId?: string;
  type: LocationType;
  description?: string;
  buildingImage?: StrapiMedia;
  isBookingAllowed: boolean;
  showDiscount: boolean;
  timezone: string;
  newOpeningDate?: string;
  openingStatus: LocationOpenStatus;
  city: CityDto;
  employees?: EmployeeDto[];
  reviews?: ReviewDto[];
  coordinates?: SharedCoordinatesDto;
  address?: SharedAddressDto;
  contact?: LocationContactDto;
  openingHours?: SharedOpeningHoursDto;
  about?: LocationAboutDto;
  directions?: BlockDirectionsDto;
  calendlyUrl?: string;
};

export type ProductDto = {
  id: number | string;
  name: string;
  slug: string;
  images?: StrapiMedia[];
  description?: StrapiRichText;
  variants?: ProductVariantDto[];
  manufacturer?: ProductManufacturerDto;
  category?: ProductCategoryDto;
  treatments?: TreatmentDto[];
};

export type ProductCategoryDto = {
  id: number | string;
  name: string;
  slug: string;
  products?: ProductDto[];
  treatments?: TreatmentDto[];
};

export type ProductManufacturerDto = {
  id: number | string;
  name: string;
  logo?: StrapiMedia;
  products?: ProductDto[];
};

export type ReviewDto = {
  id: number | string;
  author: string;
  rating: number;
  text?: string;
  source: ReviewSource;
  sourceUrl?: string;
  relatedTreatments?: TreatmentDto[];
  location?: LocationDto;
};

export type StoryDto = {
  id: number | string;
  title?: string;
  subtitle?: string;
  video: StrapiMedia;
};

export type TreatmentDto = {
  id: number | string;
  name: string;
  description?: string;
  products?: ProductDto[];
  type: TreatmentType;
  priceInEuroCent?: number;
  cheapestPriceInEuroCent?: number;
  isStartingPrice: boolean;
  reviews?: ReviewDto[];
  treatmentPage?: TreatmentPageDto;
};

export type TreatmentPageDto = {
  id: number | string;
  slug: string;
  ancestorSlugs: string[];
  ancestors: { slug: string; name: string }[];
  pathKey: string;
  showInMenu: boolean;
  name: string;
  faq?: TreatmentPageFaqDto;
  treatment?: TreatmentDto;
  blocks?: StrapiBlock[];
  seo?: SharedSeoDto;
  hero?: TreatmentPageHeroDto;
  teaser?: TreatmentPageTeaserDto;
  about?: TreatmentPageAboutDto;
  medicalTeamHighlight?: TreatmentPageMedicalTeamHighlightDto;
  relatedTreatments?: TreatmentPageRelatedTreatmentsDto;
  reviews?: TreatmentPageReviewsDto;
  tableOfContents?: TreatmentPageTableOfContentsDto;
  treatmentDetails?: TreatmentPageTreatmentDetailsDto;
  treatmentPlan?: TreatmentPageTreatmentPlanDto;
  treatmentProcess?: TreatmentPageTreatmentProcessStepsDto;
  suitability?: TreatmentPageSuitabilityDto;
  benefits?: TreatmentPageBenefitsDto;
};

export type TreatmentTeaserDto = {
  id: number | string;
  title: string;
  shortDescription?: string;
  longDescription?: string;
  image?: any;
};

export type TreatmentPageListItemDto = TreatmentPageDto & {
  id: number | string;
  parent?: Pick<TreatmentPageDto, "slug" | "name" | "pathKey">;
  teaser?: TreatmentTeaserDto;
  image?: any;
  treatment?: TreatmentDto;
};
