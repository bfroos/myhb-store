(() => {
  const TOL = 1;
  const near = (a, b) => Math.abs(a - b) <= TOL;
  const rect = (el) => el.getBoundingClientRect();
  const results = [];
  const check = (name, ok, detail = "") => results.push({ check: name, result: ok ? "PASS" : "FAIL", detail });

  const reference = document.querySelector(".textContent")?.closest(".card");
  check("reference text block found", !!reference, "needs a text-content block on the page");

  check(
    "no horizontal page scroll",
    document.documentElement.scrollWidth <= innerWidth + TOL,
    `scrollWidth ${document.documentElement.scrollWidth} vs viewport ${innerWidth}`,
  );

  const galleries = [...document.querySelectorAll(".gallery")];
  check("galleries found", galleries.length > 0, `${galleries.length} on page`);

  galleries.forEach((gallery, i) => {
    const name = `gallery ${i + 1} "${gallery.querySelector(".gallery__heading")?.textContent?.trim() ?? ""}"`;
    const card = gallery.closest(".card") ?? gallery;
    const c = rect(card);

    if (reference) {
      const r = rect(reference);
      check(`${name}: same left/right edges as text block`, near(c.left, r.left) && near(c.right, r.right), `gallery ${Math.round(c.left)}-${Math.round(c.right)} vs text ${Math.round(r.left)}-${Math.round(r.right)}`);
    }
    check(`${name}: inside viewport`, c.left >= -TOL && c.right <= innerWidth + TOL, `${Math.round(c.left)}-${Math.round(c.right)} of ${innerWidth}`);

    const track = gallery.querySelector(".slider__track");
    if (track) {
      const t = rect(track);
      const slides = [...track.children];
      check(`${name}: every slide as wide as the track`, slides.every((s) => near(rect(s).width, t.width)), `track ${Math.round(t.width)}, slides ${slides.map((s) => Math.round(rect(s).width)).join("/")}`);
      check(`${name}: track inside card`, t.left >= c.left - TOL && t.right <= c.right + TOL);
    } else {
      const items = [...gallery.querySelectorAll(".gallery__item")];
      check(`${name}: grid items inside card`, items.every((it) => rect(it).right <= c.right + TOL && rect(it).left >= c.left - TOL));
    }

    gallery.querySelectorAll(".frames--pair").forEach((pair, p) => {
      const [before, after] = [...pair.querySelectorAll(".frame__open")].map(rect);
      check(
        `${name}: pair ${p + 1} before/after same size and aligned`,
        !!before && !!after && near(before.width, after.width) && near(before.height, after.height) && near(before.top, after.top),
        before && after ? `${Math.round(before.width)}x${Math.round(before.height)} vs ${Math.round(after.width)}x${Math.round(after.height)}` : "missing frame",
      );
    });
  });

  console.table(results);
  const failed = results.filter((r) => r.result === "FAIL");
  console.log(failed.length ? `FAILED ${failed.length} of ${results.length} at ${innerWidth}px` : `ALL ${results.length} PASSED at ${innerWidth}px`);
  return { width: innerWidth, total: results.length, failed };
})();
