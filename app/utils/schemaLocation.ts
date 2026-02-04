import type { LocationDto } from "~/lib/strapi/dto/collections";
import type { SchemaOrgContext } from "~/utils/schemaShared";
import { toAbsoluteUrl } from "~/utils/schemaShared";
import type { SharedOpeningHoursDayDto } from "~/lib/strapi/dto/components";

type LocalBusinessSchemaContext = SchemaOrgContext & { brandName?: string };

const WEEKDAY_TO_SCHEMA: Record<string, string> = {
  monday: "Mo",
  tuesday: "Tu",
  wednesday: "We",
  thursday: "Th",
  friday: "Fr",
  saturday: "Sa",
  sunday: "Su",
};

/**
 * Schema.org LocalBusiness for location pages.
 * Supports Google local business search and knowledge panel.
 */
export function buildLocalBusinessSchema(
  location: LocationDto | null | undefined,
  ctx: LocalBusinessSchemaContext,
): Record<string, unknown> | null {
  if (!location) return null;

  const pageUrl = toAbsoluteUrl(ctx.publicUrl, ctx.path);
  const baseUrl = ctx.publicUrl?.replace(/\/+$/, "") ?? "";

  const address = buildPostalAddress(location);
  const openingHours = buildOpeningHours(location.openingHours?.week);
  const geo = buildGeo(location.coordinates);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: location.name,
    url: pageUrl,
    ...(address && { address }),
    ...(location.contact?.phoneNumber && {
      telephone: location.contact.phoneNumber,
    }),
    ...(geo && { geo }),
    ...(openingHours.length > 0 && { openingHours }),
    ...(location.description && { description: location.description }),
    ...(location.googlePlaceId && {
      sameAs: `https://www.google.com/maps/place/?q=place_id:${location.googlePlaceId}`,
    }),
  };

  if (ctx.brandName) {
    schema.parentOrganization = {
      "@type": "Organization",
      name: ctx.brandName,
      url: baseUrl,
    };
  }

  return schema;
}

function buildPostalAddress(
  location: LocationDto,
): Record<string, unknown> | null {
  const addr = location.address;
  const cityName = location.city?.name ?? addr?.city ?? "";
  const streetAddress = [addr?.street, addr?.houseNumber]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (!streetAddress && !cityName && !addr?.postalCode) return null;

  return {
    "@type": "PostalAddress",
    ...(streetAddress && { streetAddress }),
    ...(cityName && { addressLocality: cityName }),
    ...(addr?.postalCode && { postalCode: addr.postalCode }),
    addressCountry: "DE",
  };
}

function buildOpeningHours(
  week: SharedOpeningHoursDayDto[] | undefined,
): string[] {
  if (!week || week.length === 0) return [];

  const result: string[] = [];

  for (const day of week) {
    const schemaDay = WEEKDAY_TO_SCHEMA[day.day?.toLowerCase() ?? ""];
    if (!schemaDay) continue;

    if (day.closed) {
      result.push(`${schemaDay} closed`);
      continue;
    }

    const intervals = day.intervals ?? [];
    if (intervals.length === 0) continue;

    for (const interval of intervals) {
      const opens = formatTime(interval.opens);
      const closes = formatTime(interval.closes);
      if (opens && closes) {
        result.push(`${schemaDay} ${opens}-${closes}`);
      }
    }
  }

  return result;
}

function formatTime(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 5 && /^\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.length === 8 && /^\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed.slice(0, 5);
  }
  return trimmed || undefined;
}

function buildGeo(
  coordinates: { lat?: number; long?: number } | undefined,
): Record<string, unknown> | null {
  if (
    !coordinates ||
    coordinates.lat == null ||
    coordinates.long == null ||
    !Number.isFinite(coordinates.lat) ||
    !Number.isFinite(coordinates.long)
  ) {
    return null;
  }

  return {
    "@type": "GeoCoordinates",
    latitude: coordinates.lat,
    longitude: coordinates.long,
  };
}
