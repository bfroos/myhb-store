#!/usr/bin/env node
/**
 * Vorschaubilder fuer die Videoseiten /videos/<slug> (E24).
 *
 * Zieht aus jedem Story-MP4 ein Standbild bei 1 s, 720 px breit, als JPG nach
 * public/videos/thumbs/<slug>.jpg (unter 80 KB) und schreibt die Liste der
 * vorhandenen Bilder nach shared/storyVideoThumbs.json. Nur Stories mit Bild
 * bekommen eine Seite. Vorhandene Bilder bleiben, ausser mit --neu.
 *
 * Aufruf (ffmpeg im PATH oder per FFMPEG=/pfad/zu/ffmpeg):
 *   node --experimental-strip-types scripts/video-thumbs.mjs [--neu]
 * Ohne installiertes ffmpeg: `npm i --prefix /tmp/ff ffmpeg-static` und
 *   FFMPEG=/tmp/ff/node_modules/ffmpeg-static/ffmpeg
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import qs from "qs";
import { buildStoryVideos, STORIES_QUERY } from "../shared/storyVideos.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public/videos/thumbs");
const manifest = join(root, "shared/storyVideoThumbs.json");
const ffmpeg = process.env.FFMPEG || "ffmpeg";
const strapi = (process.env.NUXT_PUBLIC_STRAPI_URL || "https://striking-bear-e5a15ddc94.strapiapp.com").replace(/\/+$/, "");
const neu = process.argv.includes("--neu");
const MAX_BYTES = 80 * 1024;

const res = await fetch(`${strapi}/api/stories?${qs.stringify(STORIES_QUERY, { encodeValuesOnly: true })}`);
if (!res.ok) throw new Error(`Strapi ${res.status}`);
const { data } = await res.json();
const videos = buildStoryVideos(data);
mkdirSync(outDir, { recursive: true });

for (const v of videos) {
  const file = join(outDir, `${v.slug}.jpg`);
  if (existsSync(file) && !neu) continue;
  // qscale 2 (beste) bis 31; so lange groeber, bis das Bild unter 80 KB liegt.
  for (const q of [6, 8, 10, 12, 15, 18]) {
    execFileSync(ffmpeg, ["-v", "error", "-y", "-ss", "1", "-i", v.videoUrl, "-frames:v", "1", "-vf", "scale=720:-2", "-q:v", String(q), file]);
    if (statSync(file).size <= MAX_BYTES) break;
  }
  console.log(`${v.slug}.jpg ${Math.round(statSync(file).size / 1024)} KB`);
}

const slugs = readdirSync(outDir)
  .filter((f) => f.endsWith(".jpg"))
  .map((f) => f.slice(0, -4))
  .filter((s) => videos.some((v) => v.slug === s))
  .sort();
writeFileSync(manifest, JSON.stringify(slugs, null, 2) + "\n");
console.log(`${slugs.length} von ${videos.length} Videos mit Vorschaubild -> shared/storyVideoThumbs.json`);
