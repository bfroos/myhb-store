import type { LocationDto } from "~/lib/strapi/dto/collections";

type LocationForMapDto = Pick<
  LocationDto,
  "id" | "name" | "slug" | "coordinates" | "newOpeningDate"
>;

export async function useLocationsForMap() {
  const { locale, fallbackLocale } = useI18n();
  const activeLocale = (locale.value || fallbackLocale.value) as string;

  const { data, error } = await useStrapiFetch<any>("/locations", {
    query: {
      locale: activeLocale,
      fields: ["name", "slug", "newOpeningDate"],
      populate: {
        coordinates: {
          fields: ["lat", "long"],
        },
      },
      pagination: {
        page: 1,
        pageSize: 500,
      },
    },
    fetchOptions: {
      key: `locationsForMap:${activeLocale}`,
    },
  });

  if (error.value) {
    return {
      locations: [] as LocationForMapDto[],
    };
  }

  const locations = (data.value?.data ?? []) as LocationForMapDto[];
  return { locations };
}
