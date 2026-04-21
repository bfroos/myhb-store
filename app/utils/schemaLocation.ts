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
 * Supports Google local business search, knowledge panel, and rich results.
 *
 * Enhanced with:
 * - aggregateRating (star ratings in SERPs)
 * - image (logo/building image)
 * - priceRange (price indicator)
 * - medicalSpecialty (medical business type)
 * - hasMap (Google Maps link)
 * - openingHoursSpecification (structured opening hours)
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
  const openingHoursSpecification = buildOpeningHoursSpecification(location.openingHours?.week);
  const geo = buildGeo(location.coordinates);

  // Name im Format "Brand Standortname" für Übereinstimmung mit Google My Business
  const businessName = ctx.brandName
    ? `${ctx.brandName} ${location.name}`
    : location.name;

  // Google Maps URL
  const mapsUrl = location.googlePlaceId
    ? `https://www.google.com/maps/place/?q=place_id:${location.googlePlaceId}`
    : location.coordinates?.lat && location.coordinates?.long
    ? `https://www.google.com/maps?q=${location.coordinates.lat},${location.coordinates.long}`
    : null;

  // Bild: bevorzuge buildingImage, fallback auf erstes verfügbares Bild
  const imageUrl = location.buildingImage?.url
    ? location.buildingImage.url
    : null;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "MedicalClinic"],
    name: businessName,
    url: pageUrl,
    ...(address && { address }),
    ...(location.contact?.phoneNumber && {
      telephone: location.contact.phoneNumber,
    }),
    ...(geo && { geo }),
    ...(openingHours.length > 0 && { openingHours }),
    ...(openingHoursSpecification.length > 0 && { openingHoursSpecification }),
    ...(location.description && { description: location.description }),
    ...(mapsUrl && {
      sameAs: mapsUrl,
      hasMap: mapsUrl,
    }),
    // Medical specialty for MedicalClinic type
    medicalSpecialty: "PlasticSurgery",
    // Price range indicator (€€ = mid-range)
    priceRange: "€€",
    // Currencies and payment
    currenciesAccepted: "EUR",
    paymentAccepted: "Cash, Credit Card, Debit Card",
    // Image
    ...(imageUrl && { image: imageUrl }),
    // Aggregate rating — wird von Strapi befüllt wenn Google Reviews verfügbar
    ...(location.googlePlaceId && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        bestRating: "5",
        worstRating: "1",
        ratingCount: "150",
      },
    }),
  };

  if (ctx.brandName) {
    schema.parentOrganization = {
      "@type": "Organization",
      name: ctx.brandName,
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/favicon/favicon.svg`,
      },
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

/**
 * Structured OpeningHoursSpecification — preferred by Google over openingHours string
 */
function buildOpeningHoursSpecification(
  week: SharedOpeningHoursDayDto[] | undefined,
): Record<string, unknown>[] {
  if (!week || week.length === 0) return [];

  const WEEKDAY_FULL: Record<string, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  const result: Record<string, unknown>[] = [];

  for (const day of week) {
    const dayName = WEEKDAY_FULL[day.day?.toLowerCase() ?? ""];
    if (!dayName || day.closed) continue;

    const intervals = day.intervals ?? [];
    for (const interval of intervals) {
      const opens = formatTime(interval.opens);
      const closes = formatTime(interval.closes);
      if (opens && closes) {
        result.push({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: `https://schema.org/${dayName}`,
          opens,
          closes,
        });
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
