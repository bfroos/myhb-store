/**
 * Update Google Business Ratings Script
 * 
 * Holt aktuelle Ratings von Google Places API für alle MY HEALTH & BEAUTY Standorte
 * und aktualisiert:
 * 1. GOOGLE_RATINGS in app/utils/schemaLocation.ts (standort-spezifisch)
 * 2. app.config.ts aggregateRating (global für Treatment-Seiten)
 * 
 * Usage:
 *   npx tsx scripts/update-google-ratings.ts
 * 
 * Requirements:
 *   - GOOGLE_PLACES_API_KEY in .env
 *   - npm install @googlemaps/google-maps-services-js
 */

import { Client } from '@googlemaps/google-maps-services-js';
import fs from 'fs';
import path from 'path';

// Google Place IDs der aktiven Standorte
const LOCATION_PLACE_IDS = [
  'ChIJoesgRlglv0cRh0fAgCZ9MTk', // Köln Arcaden
  'ChIJoct0O2RTqEcRZthU8Tn5dGs', // Berlin Gesundbrunnen
  'ChIJYyPheE7LuEcRAIgZkPAOJyU', // Düsseldorf Arcaden
  'ChIJ_7Xx1HetuEcRUE0rtbPlvEQ', // Mönchengladbach Minto
  'ChIJr60IH9PjuEcRdVPR8YiTgSo', // Recklinghausen Palais Vest
  'ChIJf4C6OSkTlkcRpTMm00E5JLE', // Kaiserslautern K in Lautern
  'ChIJ-S5ezxr5pkcRqzaZzf4jdDQ', // Leipzig Höfe am Brühl
  'ChIJuVWkFmyZwEcRM9nuZ1SejT4', // Aachen Aquis Plaza
  'ChIJiV6-12Z6hUcR3d5X8yL6b5Q', // Duisburg Forum
];

interface LocationRating {
  placeId: string;
  rating: number;
  userRatingsTotal: number;
}

async function fetchPlaceDetails(client: Client, placeId: string, apiKey: string): Promise<LocationRating | null> {
  try {
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        fields: ['rating', 'user_ratings_total'],
        key: apiKey,
      },
    });

    if (response.data.status !== 'OK' || !response.data.result) {
      console.warn(`⚠️  Failed to fetch ${placeId}: ${response.data.status}`);
      return null;
    }

    const { rating, user_ratings_total } = response.data.result;

    if (!rating || !user_ratings_total) {
      console.warn(`⚠️  No rating data for ${placeId}`);
      return null;
    }

    return {
      placeId,
      rating,
      userRatingsTotal: user_ratings_total,
    };
  } catch (error) {
    console.error(`❌ Error fetching ${placeId}:`, error);
    return null;
  }
}

function calculateAggregateRating(ratings: LocationRating[]): { ratingValue: number; reviewCount: number } {
  let totalReviews = 0;
  let weightedSum = 0;

  for (const location of ratings) {
    totalReviews += location.userRatingsTotal;
    weightedSum += location.rating * location.userRatingsTotal;
  }

  const averageRating = totalReviews > 0 ? weightedSum / totalReviews : 0;

  return {
    ratingValue: Math.round(averageRating * 10) / 10, // 1 Dezimalstelle
    reviewCount: totalReviews,
  };
}

function updateSchemaLocationFile(ratings: LocationRating[]) {
  const filePath = path.join(process.cwd(), 'app/utils/schemaLocation.ts');
  let content = fs.readFileSync(filePath, 'utf-8');

  // Build GOOGLE_RATINGS object
  const ratingsObject = ratings.reduce((acc, r) => {
    acc[r.placeId] = {
      rating: r.rating.toFixed(1),
      count: r.userRatingsTotal.toString(),
    };
    return acc;
  }, {} as Record<string, { rating: string; count: string }>);

  const ratingsCode = `const GOOGLE_RATINGS: Record<string, { rating: string; count: string }> = ${JSON.stringify(ratingsObject, null, 2)};`;

  // Replace GOOGLE_RATINGS block
  const regex = /const GOOGLE_RATINGS: Record<string, { rating: string; count: string }> = \{[\s\S]*?\};/;
  
  if (regex.test(content)) {
    content = content.replace(regex, ratingsCode);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('✅ Updated app/utils/schemaLocation.ts');
  } else {
    console.error('❌ Could not find GOOGLE_RATINGS block in schemaLocation.ts');
  }
}

function updateAppConfigFile(aggregate: { ratingValue: number; reviewCount: number }) {
  const filePath = path.join(process.cwd(), 'app.config.ts');
  let content = fs.readFileSync(filePath, 'utf-8');

  const today = new Date().toISOString().split('T')[0];

  // Replace aggregateRating block
  const newAggregateRating = `aggregateRating: {
      ratingValue: ${aggregate.ratingValue},
      reviewCount: ${aggregate.reviewCount},
      source: "Google Business Profile (aggregated)",
      lastUpdated: "${today}",
    }`;

  const regex = /aggregateRating: \{[\s\S]*?\},/;
  
  if (regex.test(content)) {
    content = content.replace(regex, newAggregateRating + ',');
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('✅ Updated app.config.ts');
  } else {
    console.error('❌ Could not find aggregateRating block in app.config.ts');
  }
}

async function main() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.error('❌ GOOGLE_PLACES_API_KEY not found in environment');
    console.log('Set it in .env file or run:');
    console.log('export GOOGLE_PLACES_API_KEY="your-api-key"');
    process.exit(1);
  }

  console.log('🔄 Fetching ratings for 9 active locations...\n');

  const client = new Client({});
  const ratings: LocationRating[] = [];

  for (const placeId of LOCATION_PLACE_IDS) {
    const rating = await fetchPlaceDetails(client, placeId, apiKey);
    if (rating) {
      ratings.push(rating);
      console.log(`✅ ${placeId}: ${rating.rating} ⭐ (${rating.userRatingsTotal} reviews)`);
    }
    // Rate limiting: 50 requests/second
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (ratings.length === 0) {
    console.error('\n❌ No ratings fetched. Aborting.');
    process.exit(1);
  }

  console.log(`\n📊 Fetched ${ratings.length}/${LOCATION_PLACE_IDS.length} locations\n`);

  // Calculate aggregate
  const aggregate = calculateAggregateRating(ratings);
  console.log('📈 Aggregated Rating:');
  console.log(`   ${aggregate.ratingValue} ⭐ (${aggregate.reviewCount} reviews)\n`);

  // Update files
  updateSchemaLocationFile(ratings);
  updateAppConfigFile(aggregate);

  console.log('\n✅ All done! Commit the changes and deploy.');
  console.log('📝 Next: git add . && git commit -m "chore: update Google ratings" && git push');
}

main().catch(console.error);
