# Video Sitemap & VideoObject — Google Video Indexing

**Status:** Reworked 2026-08-20. Requires a `poster` image per video (see "Prerequisite").

## Problem

Google Search Console reported **"Video isn't on a watch page"** and no videos were indexed.

A first implementation (2026-05-28) added `/sitemap-videos.xml`, but it never worked. Verified
against production on 2026-08-20:

| Symptom | Cause |
|---|---|
| 22 sitemap entries, all `<loc>` = homepage | Story clips are carousel tiles; no page is "the" page for them |
| 22/22 `<video:thumbnail_loc>` pointed at an `.mp4` | `buildVideoPosterUrl()` is a stub returning `""`, so the code fell back to the video URL |
| All entries shared one `upload_date` = request time | `media.createdAt` was not populated, so `new Date()` was used |
| 0 treatment/location videos in the sitemap | `populate=deep` is Strapi **4** syntax and returns **HTTP 400** on Strapi 5; the error was swallowed |
| Homepage HTML contained no `<video>` at all | `VideoTile` gated rendering on an `IntersectionObserver` in `onMounted` (client-only) |

Net effect: the sitemap advertised only the videos that could never qualify, and none of the ones
that could.

## Prerequisite — a poster image

Google requires `thumbnail_loc` / `VideoObject.thumbnailUrl` to be an **image**. Nothing in the
system produced one (Cloudflare Media Transformations are not activated, the poster-mapping JSON is
empty, and the Canvas fallback produced client-only base64 data URLs).

So a `poster` media field (images only, optional) was added in `myhb-cms`:

- `api::story.story`
- `treatment-page.about` (used by treatment-page, treatment-ads-page, location-treatment-page)
- `location.about-item`

**Without a poster, a video is deliberately skipped** — no sitemap entry, no `VideoObject`. An empty
sitemap is better than one Google rejects wholesale.

## What is indexed

Only videos that can pass Google's "watch page" rule — the video must be the primary content of the
page `player_loc` points at.

| Source | In sitemap? | Why |
|---|---|---|
| `treatment-page.about` media | yes | one video, one topically-matched page |
| `location.about-item` media | yes | same |
| `blocks.stories` clips | **no** | carousel tiles repeated across pages; no dedicated page |

Story videos still render (and take a poster for UX), they are simply not advertised as indexable.

## Where things live

- `server/routes/sitemap-videos.xml.ts` — one `<url>` per page, poster required, real `upload_date`
- `app/utils/schemaVideo.ts` — `buildVideoObjectSchema()`, returns `null` unless media is a video
  **and** a poster image exists **and** a stable date is available
- `app/components/ui/atom/MediaVideo.vue` / `ui/molecule/VideoTile.vue` — render `<video>`
  server-side with a real `poster`; `preload="none"` when a poster exists
- CMS populate: `src/utils/queries/treatmentPagePopulate.ts`, `locationPopulate.ts`
  (`mediaWithDatePopulate` supplies `createdAt` for `uploadDate`)

## Gotchas

- **Never name `poster` in a frontend populate query** before the CMS schema is deployed — Strapi
  returns 400 for unknown fields. The sitemap uses `populate=*` so it works before *and* after.
- `populate=deep` does not exist in Strapi 5. Do not reintroduce it.
- The sitemap mixes two media hosts (`media.myhb.app`, `media.myhealthandbeauty.app`). Google needs
  one canonical host — unresolved.

## Verifying

```bash
curl -s https://www.myhealthandbeauty.com/sitemap-videos.xml | grep -c "<video:video>"
```

Then Search Console → Video indexing report, and the Rich Results Test on a page with a video.
Expect weeks, not days.

## Dead code

`scripts/generate-video-posters.js` and `public/posters/video-poster-mapping.json` belonged to the
abandoned auto-poster approach. `VideoTile` no longer reads the mapping. Left in place, not wired up.
