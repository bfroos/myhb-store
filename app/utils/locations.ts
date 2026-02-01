import type { ComputedRef } from "vue";
import type { LocationItem } from "~/lib/ui/types";
import {
  getLocationStatus,
  getLocationStatusRaw,
} from "~/utils/locationStatus";
import { LocationOpenStatus } from "~/lib/strapi/dto/enums";
import type { SharedCoordinatesDto } from "~/lib/strapi/dto/components";

/**
 * Distance between two coordinates in km (Haversine formula).
 */
export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Erdradius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Filter LocationItems by opening status.
 *
 * @param locationItems - Computed ref with LocationItems
 * @returns Filtered lists: open, openSoon, comingSoon
 */
export function useLocationFilters(
  locationItems: ComputedRef<LocationItem[] | undefined>,
) {
  const toDisplayStatus = (status: ReturnType<typeof getLocationStatusRaw>) =>
    status === "openNewToday" ? "open" : status;

  const getStatus = (date?: string | null) =>
    toDisplayStatus(getLocationStatusRaw(date ?? null));

  const locationItemsOpen = computed(() =>
    (locationItems.value ?? []).filter(
      (location) => getStatus(location.newOpeningDate) === "open",
    ),
  );

  const locationItemsOpenSoon = computed(() =>
    (locationItems.value ?? []).filter(
      (location) => getStatus(location.newOpeningDate) === "openSoon",
    ),
  );

  const locationItemsComingSoon = computed(() =>
    (locationItems.value ?? []).filter(
      (location) => getStatus(location.newOpeningDate) === "comingSoon",
    ),
  );

  return {
    locationItemsOpen,
    locationItemsOpenSoon,
    locationItemsComingSoon,
  };
}

/**
 * Map CMS opening status to UI-level enum.
 * Treats "openNewToday" as OPEN and honors the optional timezone.
 */
export function getLocationOpenStatus(
  date: string | Date | undefined,
  timezone?: string,
): LocationOpenStatus {
  const status = getLocationStatus(date ?? null, timezone);

  switch (status) {
    case "open":
    case "openNewToday":
      return LocationOpenStatus.OPEN;
    case "openSoon":
      return LocationOpenStatus.OPEN_SOON;
    default:
      return LocationOpenStatus.COMING_SOON;
  }
}

export type LocationItemWithCoordinates = LocationItem & {
  coordinates: { lat: number; lng: number };
};

export function getLocationDistance(
  coordinatesFrom: SharedCoordinatesDto,
  coordinatesTo: SharedCoordinatesDto,
): number {
  if (
    !coordinatesFrom.lat ||
    !coordinatesFrom.long ||
    !coordinatesTo.lat ||
    !coordinatesTo.long
  ) {
    return Infinity;
  }
  return getDistanceKm(
    coordinatesFrom.lat,
    coordinatesFrom.long,
    coordinatesTo.lat,
    coordinatesTo.long,
  );
}
