import { test } from "node:test";
import assert from "node:assert/strict";
import { isBlockedAdsVideo, stripBlockedAdsVideos } from "./adsMedia.ts";

const vid = (id: number, url: string, name = "x.mp4") => ({ id, url, name, mime: "video/mp4" });
const img = (id: number, url: string) => ({ id, url, name: "p.jpg", mime: "image/jpeg" });

test("Sperre nach Dateiname, Name und Media-ID", () => {
  assert.equal(isBlockedAdsVideo(vid(1, "https://m/DI_Christine_Botox_Zornesfalte.mp4")), true);
  assert.equal(isBlockedAdsVideo(vid(34, "https://m/MO_Aachen_Video_Browlift.mp4", "Browlift_mit_BTX_Aachen.mp4")), true);
  assert.equal(isBlockedAdsVideo(vid(273, "https://m/neutral.mp4")), true);
  assert.equal(isBlockedAdsVideo(vid(5, "https://m/Lippen.mp4")), false);
  assert.equal(isBlockedAdsVideo(img(6, "https://m/Botox.jpg")), false);
});

test("Video wird durch Poster ersetzt, ohne Poster entfernt", () => {
  const out = stripBlockedAdsVideos({
    about: {
      mediaItems: [vid(257, "https://m/a.mp4"), img(9, "https://m/b.jpg")],
      poster: img(10, "https://m/poster.jpg"),
    },
    benefits: { media: vid(2, "https://m/Botox_ab_30.mp4") },
    stories: [{ video: vid(3, "https://m/BTX_mit_50.mp4") }, { video: vid(4, "https://m/Lippen.mp4") }],
  });
  assert.deepEqual(out.about.mediaItems.map((m: any) => m.id), [10, 9]);
  assert.equal(out.benefits.media, null);
  assert.equal(out.stories[0].video, null);
  assert.equal(out.stories[1].video.id, 4);
});

test("Poster mit dem Begriff im Dateinamen faellt weg", () => {
  const out = stripBlockedAdsVideos({ media: vid(5, "https://m/Lippen.mp4"), poster: img(1, "https://m/Botox_poster.jpg") });
  assert.equal(out.poster, null);
  assert.equal(out.media.id, 5);
});

test("Eingebrannter Markenname (Texterkennung 30.09.2026) ist gesperrt", () => {
  for (const id of [224, 277, 280, 286]) {
    assert.equal(isBlockedAdsVideo(vid(id, "https://m/neutral.mp4")), true);
  }
  assert.equal(isBlockedAdsVideo(vid(546, "https://m/Lippenergebnisse.mp4")), false);
});

test("#199: Bild mit dem Begriff in der Datei-URL wird ausgeblendet, Alt-Text allein nicht", () => {
  const bad = { id: 1044, url: "https://m/Kopie_von_BOTOX_OT_NEU_45_2ff25e5fae.png", mime: "image/png" };
  const altOnly = { id: 2, url: "https://m/lippen.png", alternativeText: "Botox", mime: "image/png" };
  const out: any = stripBlockedAdsVideos({
    details: { image: bad, text: "x" },
    gallery: [bad, altOnly],
    other: altOnly,
  });
  assert.equal(out.details.image, null);
  assert.equal(out.details.text, "x");
  assert.deepEqual(out.gallery, [altOnly]);
  assert.equal(out.other, altOnly);
});
