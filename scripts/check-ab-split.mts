/**
 * Prueft app/lib/bookingAbTest.ts ohne Browser (#100).
 *
 * Aufruf: npm run check:ab-split
 *
 * Stubt window/document und spielt die Faelle durch, an denen der A/B-Split
 * haengt: Auslieferungszustand (alles Calendly), Einwilligungspflicht,
 * Erzwingen per ?ab=, 50/50-Verteilung, Bestaendigkeit des Buckets, die Quelle
 * der Zuweisung (ads|seo) und den sichtbaren Rueckfall, wenn einer Location die
 * appBookingUrl fehlt.
 *
 * Das Repo hat keinen Test-Runner; diese Datei ist bewusst ein eigenstaendiges
 * Skript statt einer halben Test-Infrastruktur.
 */

function setupDom(
  search: string,
  opts?: { marketing?: boolean | null; pathname?: string },
) {
  let cookies = "";
  const consent =
    opts?.marketing === null || opts?.marketing === undefined
      ? undefined
      : { marketing: opts.marketing };
  (globalThis as any).window = {
    location: {
      search,
      hostname: "go.myhealthandbeauty.com",
      pathname: opts?.pathname ?? "/",
    },
    ...(consent ? { Cookiebot: { consent } } : {}),
  };
  (globalThis as any).document = {
    get cookie() {
      return cookies;
    },
    set cookie(v: string) {
      const [pair] = v.split(";");
      const name = pair!.split("=")[0];
      cookies = cookies
        .split("; ")
        .filter((c) => c && !c.startsWith(name + "="))
        .concat(pair!)
        .join("; ");
    },
  };
  return { cookies: () => cookies };
}

const CAL = "https://calendly.com/koeln-arcaden";
const APP =
  "https://app.myhealthandbeauty.com/book-appointment?location=koeln-aracden";

let failed = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  console.log(
    `${ok ? "ok  " : "FAIL"}  ${name}${ok ? "" : `  -> ${JSON.stringify(detail)}`}`,
  );
  if (!ok) failed++;
}

const mod = await import("../app/lib/bookingAbTest.ts");
const {
  assignAbBucket,
  readAbBucket,
  readAbSource,
  readAbBookingConfig,
  resolveBookingTarget,
  istNachBuchungsSeite,
} = mod;

// --- Auslieferungszustand: Split aus ---------------------------------------
{
  setupDom("", { marketing: true });
  const cfg = readAbBookingConfig({});
  check("Default-Config ist aus", cfg.splitPercent === 0, cfg);
  const r = assignAbBucket(cfg, "ads");
  check("keine Zuweisung ohne Anteil", !r.variant && !r.assigned, r);
  check(
    "ohne Bucket -> Calendly, keine Variante",
    (() => {
      const b = resolveBookingTarget({ calendlyUrl: CAL, appBookingUrl: APP });
      return b.url === CAL && !b.abVariant && !b.abFallback;
    })(),
  );
}

// --- Einwilligung ist Pflicht ---------------------------------------------
{
  setupDom("", { marketing: false });
  const r = assignAbBucket(readAbBookingConfig({ abBookingSplit: "50" }), "ads");
  check("Marketing abgelehnt -> keine Zuweisung", !r.variant, r);
}
{
  setupDom("", { marketing: null }); // Banner noch unbeantwortet / kein Cookiebot
  const r = assignAbBucket(readAbBookingConfig({ abBookingSplit: "50" }), "ads");
  check("ohne Cookiebot-Antwort -> keine Zuweisung", !r.variant, r);
}

// --- ?ab= erzwingt, auch ohne Einwilligung und ohne Anteil -----------------
{
  const dom = setupDom("?ab=app", { marketing: false });
  const r = assignAbBucket(readAbBookingConfig({}), "ads");
  check("?ab=app weist zu", r.variant === "app" && r.assigned, r);
  check("?ab=app schreibt das Cookie", dom.cookies().includes("myhb_ab_booking=app"), dom.cookies());
  const again = assignAbBucket(readAbBookingConfig({}), "ads");
  check("?ab=app zweiter Aufruf meldet keine neue Zuweisung", again.variant === "app" && !again.assigned, again);
}
{
  setupDom("?ab=calendly", { marketing: true });
  assignAbBucket(readAbBookingConfig({ abBookingSplit: "100" }), "ads");
  check("?ab=calendly schlaegt den 100%-Anteil", readAbBucket() === "calendly", readAbBucket());
}

// --- Verteilung und Bestaendigkeit ----------------------------------------
{
  const cfg = readAbBookingConfig({ abBookingSplit: "50" });
  let app = 0;
  const N = 4000;
  for (let i = 0; i < N; i++) {
    setupDom("", { marketing: true });
    if (assignAbBucket(cfg, "ads").variant === "app") app++;
  }
  const share = (app / N) * 100;
  check(`50/50 (gemessen ${share.toFixed(1)} %)`, Math.abs(share - 50) < 5, share);

  setupDom("", { marketing: true });
  const first = assignAbBucket(cfg, "ads").variant;
  const again = Array.from({ length: 20 }, () => assignAbBucket(cfg, "ads"));
  check(
    "Bucket bleibt ueber weitere Seitenaufrufe gleich",
    again.every((r) => r.variant === first && !r.assigned),
    { first, again: again.map((r) => r.variant) },
  );
  check("ab_assigned faellt nur beim ersten Mal", again.every((r) => !r.assigned));
}

// --- Anwendung ------------------------------------------------------------
{
  const b = resolveBookingTarget({ calendlyUrl: CAL, appBookingUrl: APP }, "app");
  check("Arm app -> App-URL", b.url === APP && b.abVariant === "app" && !b.abFallback, b);
}
{
  const b = resolveBookingTarget({ calendlyUrl: CAL, appBookingUrl: APP }, "calendly");
  check("Arm calendly -> Calendly-URL", b.url === CAL && b.abVariant === "calendly", b);
}
{
  const b = resolveBookingTarget({ calendlyUrl: CAL }, "app");
  check(
    "Arm app ohne appBookingUrl -> Calendly MIT ab_fallback",
    b.url === CAL && b.abVariant === "app" && b.abFallback === true,
    b,
  );
}

{
  // Buchungs-Button ohne Standort (Meta-Landingpage): oeffnet die
  // Standortsuche, es gibt nichts anzuwenden — und keinen Rueckfall.
  const b = resolveBookingTarget({}, "app");
  check(
    "ohne Standort -> kein ab_fallback",
    b.url === undefined && b.abVariant === "app" && !b.abFallback,
    b,
  );
}

// --- Quelle der Zuweisung -------------------------------------------------
{
  setupDom("", { marketing: true });
  const cfg = readAbBookingConfig({ abBookingSplit: "100" });
  const r = assignAbBucket(cfg, "seo");
  check("SEO-Zuweisung merkt sich die Quelle", r.source === "seo" && readAbSource() === "seo", r);
  // Derselbe Besucher spaeter im Ads-Deployment: Bucket UND Quelle bleiben.
  const spaeter = assignAbBucket(cfg, "ads");
  check(
    "Deployment-Wechsel aendert die Quelle nicht",
    spaeter.source === "seo" && spaeter.variant === r.variant && !spaeter.assigned,
    spaeter,
  );
}
{
  setupDom("?ab=app", { marketing: false });
  const r = assignAbBucket(readAbBookingConfig({}), "seo");
  check("?ab= schreibt die Quelle mit", r.source === "seo" && readAbSource() === "seo", r);
}

// --- Unsinnige Env-Werte schalten ab, nicht auf ----------------------------
{
  for (const bad of ["abc", "-5", "500", ""]) {
    const cfg = readAbBookingConfig({ abBookingSplit: bad });
    check(`Anteil "${bad}" -> 0`, cfg.splitPercent === 0, cfg);
  }
}

// --- Dankesseite teilt niemanden mehr zu (elanagency/myhb-os#272) ----------
{
  check(
    "Dankesseite wird erkannt",
    istNachBuchungsSeite("/p/danke-fuer-deine-terminbuchung") === true &&
      istNachBuchungsSeite("/p/danke-fuer-deine-terminbuchung/") === true &&
      istNachBuchungsSeite("/P/Danke-Fuer-Deine-Terminbuchung") === true,
  );
  check(
    "normale Seiten nicht",
    istNachBuchungsSeite("/") === false &&
      istNachBuchungsSeite("/p/botox-meta-rabatt") === false &&
      istNachBuchungsSeite("/standorte/koeln/koeln-arcaden/botox") === false &&
      istNachBuchungsSeite(undefined) === false,
  );
  // Keine halbe Uebereinstimmung: eine Seite, die nur so anfaengt, ist keine.
  check(
    "kein Praefix-Treffer auf einer fremden Seite",
    istNachBuchungsSeite("/p/danke-fuer-deine-terminbuchung-alt") === false,
  );

  setupDom("", {
    marketing: true,
    pathname: "/p/danke-fuer-deine-terminbuchung",
  });
  const cfg = readAbBookingConfig({ abBookingSplit: "50" });
  const r = assignAbBucket(cfg, "seo");
  check(
    "auf der Dankesseite wird kein Bucket gezogen",
    !r.variant && !r.assigned && !readAbBucket(),
    r,
  );

  // Wer VOR der Buchung zugeteilt wurde, behaelt seinen Arm — sonst faende die
  // Auswertung die Buchung nicht mehr wieder.
  setupDom("", { marketing: true, pathname: "/p/botox-meta-rabatt" });
  const vorher = assignAbBucket(readAbBookingConfig({ abBookingSplit: "50" }), "seo");
  const bucket = vorher.variant;
  (globalThis as any).window.location.pathname = "/p/danke-fuer-deine-terminbuchung";
  const danach = assignAbBucket(readAbBookingConfig({ abBookingSplit: "50" }), "seo");
  check(
    "bestehender Bucket gilt auf der Dankesseite weiter",
    !!bucket && danach.variant === bucket && !danach.assigned,
    { bucket, danach },
  );
}

console.log(
  failed === 0
    ? "\nAlle Pruefungen bestanden."
    : `\n${failed} Pruefung(en) fehlgeschlagen.`,
);
process.exit(failed === 0 ? 0 : 1);
