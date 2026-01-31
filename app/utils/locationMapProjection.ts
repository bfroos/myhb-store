import { getLocationStatusRaw } from "~/utils/locationStatus";

/** SVG viewBox for the Germany map */
export const LOCATION_MAP_VIEWBOX = {
  width: 347,
  height: 471,
} as const;

/** Geo bounds for Germany (equirectangular) */
export const LOCATION_MAP_GEO_BOUNDS = {
  minLon: 5.5,
  maxLon: 15.3,
  minLat: 47.0,
  maxLat: 55.2,
} as const;

export type LocationMapPointStatus = "open" | "openSoon" | "comingSoon";

export type LocationMapPoint = {
  id: string | number;
  name: string;
  x: number;
  y: number;
  status: LocationMapPointStatus;
  statusLabelKey: string;
};

/** Minimal location object for map projection */
export type LocationForMapInput = {
  id?: string | number;
  name?: string;
  slug?: string;
  coordinates?: { lat?: unknown; long?: unknown };
  newOpeningDate?: string | null;
};

const { width: VIEWBOX_WIDTH, height: VIEWBOX_HEIGHT } = LOCATION_MAP_VIEWBOX;
const { minLon, maxLon, minLat, maxLat } = LOCATION_MAP_GEO_BOUNDS;

function toNumber(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : (v as number);
  return Number.isFinite(n) ? n : null;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Projects lat/lon (WGS84) to SVG coordinates of the map viewBox.
 */
export function projectLatLonToSvg(lat: number, lon: number) {
  const x =
    ((lon - minLon) / (maxLon - minLon)) * VIEWBOX_WIDTH;
  const y =
    ((maxLat - lat) / (maxLat - minLat)) * VIEWBOX_HEIGHT;
  return {
    x: clamp(x, 0, VIEWBOX_WIDTH),
    y: clamp(y, 0, VIEWBOX_HEIGHT),
  };
}

function toDisplayStatus(
  status: ReturnType<typeof getLocationStatusRaw>,
): LocationMapPointStatus {
  return status === "openNewToday" ? "open" : status;
}

function statusLabelKey(status: LocationMapPointStatus) {
  return `blocks.locationMap.status.${status}`;
}

/** Marker geometry for the map */
export const LOCATION_MAP_MARKER = {
  circleR: 3 * 1.2,
  squareSize: 6 * 0.9 * 1.1,
  triangleSize: 4 * 0.8,
} as const;

/**
 * SVG polygon points for an upward-pointing triangle (tip at top).
 */
export function trianglePoints(cx: number, cy: number, size: number) {
  const top = `${cx},${cy - size}`;
  const left = `${cx - size},${cy + size}`;
  const right = `${cx + size},${cy + size}`;
  return `${top} ${right} ${left}`;
}

/**
 * Maps locations (with coordinates, newOpeningDate) to map points
 * (x, y, status) for SVG rendering.
 */
export function getLocationMapPoints(
  locations: LocationForMapInput[],
): LocationMapPoint[] {
  const points = locations.map((loc) => {
    const lat = toNumber(loc?.coordinates?.lat);
    const lon = toNumber(loc?.coordinates?.long);
    if (lat == null || lon == null) return null;

    const { x, y } = projectLatLonToSvg(lat, lon);
    const status = toDisplayStatus(
      getLocationStatusRaw(loc?.newOpeningDate ?? null),
    );

    return {
      id: loc?.id ?? loc?.slug ?? loc?.name ?? "location",
      name: loc?.name ?? loc?.slug ?? "Location",
      x,
      y,
      status,
      statusLabelKey: statusLabelKey(status),
    };
  });

  return points.filter(
    (p): p is LocationMapPoint => p !== null,
  );
}
