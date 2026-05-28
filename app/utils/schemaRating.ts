/**
 * Schema.org AggregateRating für Behandlungen/Locations.
 * Zeigt Sternebewertungen in Google Search Results.
 */
export function buildAggregateRatingSchema(
  ratingValue: number | string | null | undefined,
  reviewCount: number | string | null | undefined,
): Record<string, unknown> | null {
  // Konvertiere zu Zahlen
  const rating = typeof ratingValue === "string" ? parseFloat(ratingValue) : ratingValue;
  const count = typeof reviewCount === "string" ? parseInt(reviewCount, 10) : reviewCount;

  // Validierung
  if (
    rating == null ||
    count == null ||
    isNaN(rating) ||
    isNaN(count) ||
    rating < 1 ||
    rating > 5 ||
    count < 1
  ) {
    return null;
  }

  return {
    "@type": "AggregateRating",
    ratingValue: rating.toString(),
    reviewCount: count.toString(),
    bestRating: "5",
    worstRating: "1",
  };
}
