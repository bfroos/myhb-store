import type { StrapiMedia, StrapiBlock } from "./types";
import type { SharedSeoDto } from "./components";
import type {
  BlogArticleDto,
  BlogCategoryDto,
  JobDto,
  LocationDto,
} from "./collections";
import type { CityDto } from "./collections";

export type AboutUsPageDto = {
  id: number;
  blocks: StrapiBlock[];
  seo: SharedSeoDto;
};

export type BlogPageDto = {
  id: number;
  date: string;
  cover: StrapiMedia;
  blocks: StrapiBlock[];
  seo: SharedSeoDto;
};

export type BlogPageWithArticlesAndCategoriesDto = {
  blogPage: BlogPageDto;
  articles: BlogArticleDto[];
  categories: BlogCategoryDto[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
};

export type CareerPageDto = {
  id: number;
  topBlocks: StrapiBlock[];
  bottomBlocks: StrapiBlock[];
  seo: SharedSeoDto;
};

export type CareerPageWithJobsDto = {
  careerPage: CareerPageDto;
  jobs: JobDto[];
};

export type CityPageDto = {
  id: number;
  topBlocks: StrapiBlock[];
  bottomBlocks: StrapiBlock[];
  seo: SharedSeoDto;
};

export type CityPageWithLocationsDto = {
  id: number;
  city: CityDto;
  locations: {
    open: LocationDto[];
    openSoon: LocationDto[];
    comingSoon: LocationDto[];
  };
  cityPage: CityPageDto;
};

export type LocationsPageDto = {
  id: number;
  blocks: StrapiBlock[];
  seo: SharedSeoDto;
};

export type LocationsPageWithLocationsDto = {
  id: number;
  blocks: StrapiBlock[];
  seo: SharedSeoDto;
  locations: {
    open: LocationDto[];
    openSoon: LocationDto[];
    comingSoon: LocationDto[];
  };
  locationsPage: LocationsPageDto;
};
