import type { LocationDto } from "~/lib/strapi/dto/collections";
import type { SchemaOrgContext } from "~/utils/schemaShared";
import { toAbsoluteUrl } from "~/utils/schemaShared";
import type { SharedOpeningHoursDayDto } from "~/lib/strapi/dto/components";

type LocalBusinessSchemaContext = SchemaOrgContext & {
  brandName?: string;
  // Ads mode (go.*): suppress the generic offer catalog (Botox/Hyaluron/PRP/...)
  // so an Ads landing page only advertises its own treatment in the HTML/JSON-LD.
  isAdsMode?: boolean;
  // When provided in ads mode, the offer catalog lists only this treatment.
  // When omitted in ads mode, the offer catalog is dropped entirely.
  offerCatalogTreatmentName?: string | null;
  /**
   * Behandlungen, die DIESER Standort bedient (Namen der Hauptkategorien).
   * Fuer Kliniken (type "clinic") ersetzt das den generischen Lounge-Katalog
   * (Botox/Hyaluron/PRP/Fettwegspritze), damit die MediaPark Klinik nicht als
   * Anbieter nichtoperativer Leistungen ausgezeichnet wird.
   */
  offerCatalogNames?: string[] | null;
  /**
   * @id der MedicalProcedure dieser Seite (Standort-Behandlungsseite). Wird
   * als availableService verknuepft, damit die Behandlung eindeutig an dieser
   * Einrichtung haengt (Köln: OPs -> MediaPark, nichtoperativ -> Arcaden).
   */
  availableServiceId?: string | null;
};

/**
 * Stabile Entitaets-ID eines Standorts: immer die Standort-URL, unabhaengig
 * davon, auf welcher Unterseite das Schema ausgegeben wird.
 */
export function locationEntityId(
  publicUrl: string | undefined,
  location: Pick<LocationDto, "slug" | "city"> | null | undefined,
): string | null {
  const citySlug = location?.city?.slug;
  if (!location?.slug || !citySlug) return null;
  return `${toAbsoluteUrl(publicUrl || "", `/standorte/${citySlug}/${location.slug}`)}#clinic`;
}

const WEEKDAY_TO_SCHEMA: Record<string, string> = {
  monday: "Mo",
  tuesday: "Tu",
  wednesday: "We",
  thursday: "Th",
  friday: "Fr",
  saturday: "Sa",
  sunday: "Su",
};

export const GOOGLE_RATINGS: Record<string, { rating: string; count: string }> = {
  "ChIJoesgRlglv0cRh0fAgCZ9MTk": {
    "rating": "4.9",
    "count": "480"
  },
  "ChIJoct0O2RTqEcRZthU8Tn5dGs": {
    "rating": "4.8",
    "count": "237"
  },
  "ChIJYyPheE7LuEcRAIgZkPAOJyU": {
    "rating": "4.9",
    "count": "191"
  },
  "ChIJ_7Xx1HetuEcRUE0rtbPlvEQ": {
    "rating": "4.9",
    "count": "181"
  },
  "ChIJr60IH9PjuEcRdVPR8YiTgSo": {
    "rating": "4.9",
    "count": "180"
  },
  "ChIJf4C6OSkTlkcRpTMm00E5JLE": {
    "rating": "4.7",
    "count": "98"
  },
  "ChIJ-S5ezxr5pkcRqzaZzf4jdDQ": {
    "rating": "5.0",
    "count": "166"
  },
  "ChIJuVWkFmyZwEcRM9nuZ1SejT4": {
    "rating": "4.9",
    "count": "50"
  }
};

/**
 * Gewichtete Durchschnittsnote über alle Standorte mit Google-Daten
 * (Conversion-Audit #80). Grundlage für den globalen Bewertungs-Badge:
 * "4,9" neben "1.538+ 5-Sterne" statt einer Sterne-Behauptung ohne Note.
 *
 * Gewichtung nach Anzahl der Bewertungen, eine Nachkommastelle. Gibt null
 * zurück, wenn keine Standortdaten vorliegen.
 */
export function getGoogleReviewAggregate(): {
  rating: number;
  userRatingsTotal: number;
  locations: number;
} | null {
  let weighted = 0;
  let total = 0;
  let locations = 0;
  for (const entry of Object.values(GOOGLE_RATINGS)) {
    const rating = Number(entry.rating);
    const count = Number(entry.count);
    if (!Number.isFinite(rating) || !Number.isFinite(count) || count <= 0) {
      continue;
    }
    weighted += rating * count;
    total += count;
    locations += 1;
  }
  if (total === 0) return null;
  return {
    rating: Math.round((weighted / total) * 10) / 10,
    userRatingsTotal: total,
    locations,
  };
}

/**
 * Liefert die statisch hinterlegten Google-Rating-Daten für einen Standort.
 *
 * Diese Werte werden täglich per GitHub Action ("Update Google Ratings")
 * über scripts/update-google-ratings.ts aktualisiert (≈ 9 API-Aufrufe/Tag).
 * Dadurch muss die Website die (teure) Google Places "Place Details"-API
 * NICHT mehr pro Seitenaufruf abfragen – die Anzeige nutzt diese Werte direkt.
 *
 * Gibt null zurück, wenn für die placeId keine Daten vorliegen. Der Aufrufer
 * fällt in dem Fall auf die generischen Marken-Reviews zurück.
 */
export function getGoogleReviewForPlace(
  placeId: string | null | undefined,
): { rating: number; userRatingsTotal: number; placeUrl: string } | null {
  if (!placeId) return null;
  const entry = GOOGLE_RATINGS[placeId];
  if (!entry) return null;
  const rating = Number(entry.rating);
  if (!Number.isFinite(rating)) return null;
  const userRatingsTotal = Number(entry.count);
  return {
    rating,
    userRatingsTotal: Number.isFinite(userRatingsTotal) ? userRatingsTotal : 0,
    placeUrl: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
  };
}

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
  // Standort-URL statt Seiten-URL: Auf Behandlungsseiten war "url" bisher die
  // Behandlungs-URL - die Einrichtung ist aber die Standortseite.
  const locationUrl =
    location.slug && location.city?.slug
      ? toAbsoluteUrl(
          ctx.publicUrl,
          `/standorte/${location.city.slug}/${location.slug}`,
        )
      : pageUrl;
  const entityId = locationEntityId(ctx.publicUrl, location);

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

  // Shopping-Center-Standorte bekommen zusätzlich "HealthAndBeautyBusiness".
  // Kliniken (MediaPark Köln) bleiben reine MedicalClinic. Vorher hing das an
  // einer falschen Place-ID (ChIJiV6-…), die MediaPark-Seite bekam dadurch
  // ebenfalls HealthAndBeautyBusiness.
  const isClinic = location.type === "clinic";
  const schemaTypes = isClinic
    ? ["LocalBusiness", "MedicalClinic"]
    : ["LocalBusiness", "MedicalClinic", "HealthAndBeautyBusiness"];

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": schemaTypes,
    ...(entityId && { "@id": entityId }),
    name: businessName,
    url: locationUrl,
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
    // Note: priceRange removed - we use concrete prices per treatment in MedicalProcedure schema
    // Currencies and payment
    currenciesAccepted: "EUR",
    paymentAccepted: "Cash, Credit Card, Debit Card",
    // Image
    ...(imageUrl && { image: imageUrl }),
    // Aggregate rating — echte Google-Daten pro Standort
    ...(location.googlePlaceId && GOOGLE_RATINGS[location.googlePlaceId] && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: GOOGLE_RATINGS[location.googlePlaceId]?.rating ?? "4.9",
        bestRating: "5",
        worstRating: "1",
        ratingCount: GOOGLE_RATINGS[location.googlePlaceId]?.count ?? "100",
      },
    }),
    // Offer Catalog mit Hauptleistungen
    ...buildOfferCatalog(ctx, isClinic),
    ...(ctx.availableServiceId && {
      availableService: [{ "@id": ctx.availableServiceId }],
    }),
  };

  appendParentOrganization(schema, ctx);

  return schema;
}

/**
 * Offer catalog for the LocalBusiness schema.
 * - SEO mode (www.): generic catalog with the lounge's main treatments
 *   (Botox®, Hyaluron, PRP, Fettwegspritze) — strong relevance signal.
 * - Ads mode (go.*): only the page's own treatment, or no catalog at all,
 *   so generic treatment names never leak into an Ads landing page's HTML.
 */
function offerCatalogOf(names: string[]): Record<string, unknown> {
  return {
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Ästhetische Behandlungen",
      itemListElement: names.map((name) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "MedicalProcedure",
          name,
        },
      })),
    },
  };
}

function buildOfferCatalog(
  ctx: LocalBusinessSchemaContext,
  isClinic = false,
): Record<string, unknown> {
  // Klinik: nur die tatsaechlich dort angebotenen Leistungen (Köln: OPs);
  // ohne Liste lieber kein Katalog als ein falscher (Botox in der Klinik).
  if (!ctx.isAdsMode && isClinic) {
    const names = (ctx.offerCatalogNames ?? [])
      .map((name) => name?.trim())
      .filter((name): name is string => Boolean(name));
    return names.length ? offerCatalogOf(Array.from(new Set(names))) : {};
  }
  if (ctx.isAdsMode) {
    const name = ctx.offerCatalogTreatmentName?.trim();
    if (!name) {
      // No specific treatment — omit the offer catalog entirely.
      return {};
    }
    return {
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Ästhetische Behandlungen",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "MedicalProcedure",
              name,
            },
          },
        ],
      },
    };
  }

  return {
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Ästhetische Behandlungen",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "MedicalProcedure",
            name: "Botox®",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "MedicalProcedure",
            name: "Hyaluron Filler",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "MedicalProcedure",
            name: "PRP-Therapie",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "MedicalProcedure",
            name: "Fettwegspritze",
          },
        },
      ],
    },
  };
}

function appendParentOrganization(
  schema: Record<string, unknown>,
  ctx: LocalBusinessSchemaContext,
): void {
  if (ctx.brandName) {
    const baseUrl = ctx.publicUrl?.replace(/\/+$/, "") ?? "";
    schema.parentOrganization = {
      "@type": "Organization",
      // Gleiche @id wie buildOrganizationSchema: beide Standorte haengen an
      // derselben Organisation, bleiben aber eigene Einrichtungen (@id je
      // Standort-URL).
      "@id": `${toAbsoluteUrl(ctx.publicUrl, "/")}#organization`,
      name: ctx.brandName,
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/favicon/favicon.svg`,
      },
    };
  }
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
