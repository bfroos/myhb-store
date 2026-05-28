/**
 * Update Google Business Ratings Script
 * 
 * Holt aktuelle Ratings von Google Places API (New) für alle MY HEALTH & BEAUTY Standorte
 * und aktualisiert:
 * 1. GOOGLE_RATINGS in app/utils/schemaLocation.ts (standort-spezifisch)
 * 2. app.config.ts aggregateRating (global für Treatment-Seiten)
 * 
 * Usage:
 *   npx tsx scripts/update-google-ratings.ts
 * 
 * Requirements:
 *   - GOOGLE_PLACES_API_KEY in .env
 *   - Places API (New) aktiviert in Google Cloud Console
 */

import https from 'https';
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
  // 'ChIJiV6-12Z6hUcR3d5X8yL6b5Q', // Duisburg Forum - Place ID ungültig (404), muss aktualisiert werden
];

interface LocationRating {
  placeId: string;
  rating: number;
  userRatingsTotal: number;
}

function fetchPlaceDetails(placeId: string, apiKey: string): Promise<LocationRating | null> {
  return new Promise((resolve) => {
    const options = {
      hostname: 'places.googleapis.com',
      path: `/v1/places/${placeId}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'rating,userRatingCount',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          console.warn(`⚠️  Failed to fetch ${placeId}: HTTP ${res.statusCode}`);
          console.warn(`   Response: ${data.substring(0, 200)}`);
          resolve(null);
          return;
        }

        try {
          const result = JSON.parse(data);

          if (!result.rating || !result.userRatingCount) {
            console.warn(`⚠️  No rating data for ${placeId}`);
            resolve(null);
            return;
          }

          resolve({
            placeId,
            rating: result.rating,
            userRatingsTotal: result.userRatingCount,
          });
        } catch (error) {
          console.error(`❌ Parse error for ${placeId}:`, error);
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Request error for ${placeId}:`, error.message);
      resolve(null);
    });

    req.end();
  });
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

  const ratings: LocationRating[] = [];

  for (const placeId of LOCATION_PLACE_IDS) {
    const rating = await fetchPlaceDetails(placeId, apiKey);
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
