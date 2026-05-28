# Video Sitemap - Google Video Indexing

**Status:** ✅ Implemented (2026-05-28)

## Problem

Videos were rendered as `<video>` tags on the site, but Google Search Console reported: **"Videos not indexed"**.

**Root Cause:** Missing VideoObject Schema.org markup and no video sitemap.

---

## Solution

### Semi-Automatic Video Sitemap Generation

**Route:** `/sitemap-videos.xml`

This sitemap automatically extracts videos from Strapi and generates a Google Video Sitemap-compliant XML file.

### Sources

Videos are extracted from:
1. **Treatment Pages** (`treatment-pages` collection)
2. **Location Pages** (`locations` collection)
3. **Blog Articles** (`blog-articles` collection)

### Video Data per Entry

Each video in the sitemap includes:

- `<video:thumbnail_loc>` - Poster frame (via Cloudflare media transformations)
- `<video:title>` - From block `heading`, `title`, or `headline`
- `<video:description>` - From block `content` (rich text)
- `<video:content_loc>` - Direct `.mp4` URL
- `<video:player_loc>` - Page URL where video is embedded
- `<video:upload_date>` - ISO 8601 date from `media.createdAt`

### Example Output

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <url>
    <loc>https://www.myhealthandbeauty.com/behandlungen/botox/kraehenfuesse</loc>
    <video:video>
      <video:thumbnail_loc>https://media.myhb.app/.../poster.jpg</video:thumbnail_loc>
      <video:title>Krähenfüße Behandlung - Ablauf</video:title>
      <video:description>So läuft die Botox-Behandlung gegen Krähenfüße ab...</video:description>
      <video:content_loc>https://media.myhb.app/.../video.mp4</video:content_loc>
      <video:player_loc>https://www.myhealthandbeauty.com/behandlungen/botox/kraehenfuesse</video:player_loc>
      <video:upload_date>2026-05-15T10:30:00.000Z</video:upload_date>
    </video:video>
  </url>
</urlset>
```

---

## How It Works

### 1. Route: `server/routes/sitemap-videos.xml.ts`

- Fetches all Treatment Pages, Location Pages, Blog Articles from Strapi
- Populates `blocks.media` and `blocks.medias`
- Filters blocks where `media.mime` starts with `video/`
- Generates XML with `<video:video>` tags

### 2. Extraction Logic

```typescript
function extractVideosFromBlocks(blocks, pageUrl, pageName) {
  // Check blocks[].media for video MIME type
  // Check blocks[].medias[] for multiple videos
  // Build VideoEntry with:
  //   - pageUrl (where video is embedded)
  //   - videoUrl (direct .mp4)
  //   - thumbnailUrl (poster via Cloudflare)
  //   - title (from block heading)
  //   - description (from block content)
  //   - uploadDate (from media.createdAt)
}
```

### 3. Cloudflare Poster Generation

Uses `buildVideoPosterUrl()` from `app/utils/media.ts`:
- Generates poster frame at 1 second (`#t=1`)
- Falls back to video URL if transformations unavailable

---

## Integration

### robots.txt

```txt
Sitemap: https://www.myhealthandbeauty.com/sitemap.xml
Sitemap: https://www.myhealthandbeauty.com/sitemap-videos.xml
```

### Google Search Console

1. Go to [Search Console](https://search.google.com/search-console)
2. Select `www.myhealthandbeauty.com` property
3. Navigate to **Sitemaps** (left sidebar)
4. Add new sitemap: `https://www.myhealthandbeauty.com/sitemap-videos.xml`
5. Submit

**Expected:** Google will crawl and index videos within 1-2 weeks.

---

## Caching

- **Cache-Control:** `public, max-age=3600, s-maxage=3600`
- Sitemap refreshes every 1 hour
- Videos update automatically when Strapi content changes

---

## Monitoring

### Check Video Indexing Status

1. **Google Search Console** → Video Enhancement Report
2. **Rich Results Test:** https://search.google.com/test/rich-results
3. **Manual search:** `site:myhealthandbeauty.com inurl:video`

### Debugging

Test the sitemap locally:
```bash
curl https://www.myhealthandbeauty.com/sitemap-videos.xml
```

Check video count:
```bash
curl -s https://www.myhealthandbeauty.com/sitemap-videos.xml | grep -c "<video:video>"
```

---

## Future Improvements (Optional)

### Option 3: Per-Page VideoObject Schema

For even better SEO, add VideoObject schema to individual pages:

1. Use `app/utils/schemaVideo.ts` utility (already created)
2. Extract videos in `useTreatmentPage()`, `useLocationPage()`, etc.
3. Call `useSchemaOrg(videoSchema)` on each page

**Benefit:** More granular control, better indexing  
**Effort:** Medium (requires changes to multiple page composables)

---

## References

- [Google Video Sitemap Spec](https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps)
- [Schema.org VideoObject](https://schema.org/VideoObject)
- [Google Video SEO Best Practices](https://developers.google.com/search/docs/appearance/video)

---

**Last Updated:** 2026-05-28  
**Commit:** `c8c3658` - "feat(seo): add video sitemap for Google video indexing"
