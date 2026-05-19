#!/usr/bin/env node

/**
 * Generate Video Posters Script (Simplified Version)
 * 
 * Fetches all videos from Strapi and creates a mapping file.
 * For now, this just prepares the infrastructure - actual poster generation
 * will be added in a follow-up with proper video processing tools.
 * 
 * Usage:
 *   node scripts/generate-video-posters.js
 *   npm run generate:posters
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRAPI_URL = process.env.NUXT_PUBLIC_STRAPI_URL || 'https://striking-bear-e5a15ddc94.strapiapp.com';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || 'e181d9dd55da8f81fe4c7ac3e97241dd690e7f32a1b84bb5f54d0ab55e09c1ffc9c3978ac6ffb5e08882c2c92d19edecf5ef9ea487cbaac0471bbea05aafc785d83423d13c3443af0593b7a270e5a60fb96931f5f1b3eee7df3eabf3067676acc318e129ce20959e42ad2a00d528fd23452c44ba5aa9583808e1d5c1252190b5';

const OUTPUT_DIR = path.join(__dirname, '../public/posters');
const MAPPING_FILE = path.join(OUTPUT_DIR, 'video-poster-mapping.json');

/**
 * Fetch videos from Strapi
 */
async function fetchVideosFromStrapi() {
  console.log('🔍 Fetching videos from Strapi...');
  
  try {
    const response = await fetch(`${STRAPI_URL}/api/upload/files?filters[mime][$startsWith]=video`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Found ${data.length} videos in Strapi`);
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch videos from Strapi:', error.message);
    return [];
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting video poster generation (infrastructure setup)...\n');

  // Create output directory
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  console.log(`📁 Output directory: ${OUTPUT_DIR}\n`);

  // Fetch videos from Strapi
  const videos = await fetchVideosFromStrapi();

  if (videos.length === 0) {
    console.log('⚠️  No videos found. Creating empty mapping file.');
    await fs.writeFile(MAPPING_FILE, JSON.stringify({}, null, 2));
    return;
  }

  // Create mapping (for now just log the videos, poster generation comes next)
  const mapping = {};
  
  console.log('\n📹 Videos found:');
  for (const video of videos) {
    console.log(`   - ID ${video.id}: ${video.name || video.url}`);
    console.log(`     URL: ${video.url}`);
    console.log(`     Size: ${(video.size / 1024 / 1024).toFixed(2)} MB`);
    
    // For now, no poster URL (will be generated in follow-up)
    // mapping[video.id] = `/posters/video-${video.id}-poster.jpg`;
  }

  // Save mapping file (empty for now, but structure is ready)
  await fs.writeFile(MAPPING_FILE, JSON.stringify(mapping, null, 2));
  console.log(`\n✅ Mapping file saved: ${MAPPING_FILE}`);

  // Summary
  console.log('\n📊 Summary:');
  console.log(`   Total videos: ${videos.length}`);
  console.log(`   Mapping created: Yes`);
  console.log(`   Posters generated: 0 (infrastructure only, generation coming next)`);
  console.log('\n💡 Next step: Add actual poster generation (ffmpeg or Playwright)');
  console.log('   For now, the clientside Canvas fallback will handle poster generation.\n');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
