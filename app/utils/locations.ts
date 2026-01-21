import type { ComputedRef } from "vue";
import type { LocationItem } from "~/lib/ui/types";
import {
  getLocationStatus,
  getLocationStatusRaw,
} from "~/utils/locationStatus";
import { LocationOpenStatus } from "~/lib/strapi/dto/enums";

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
