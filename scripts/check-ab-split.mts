/**
 * Prueft app/lib/bookingAbTest.ts ohne Browser (#100).
 *
 * Aufruf: npm run check:ab-split
 *
 * Stubt window/document/sessionStorage und spielt die Faelle durch, an denen
 * der A/B-Split haengt: Auslieferungszustand (alles Calendly), Erzwingen per
 * ?ab=, Freigabe je Standort, 50/50-Verteilung, Bestaendigkeit der Variante
 * und die Frage, ob ein Bucket auf nicht freigegebene Standorte abfaerbt.
 *
 * Das Repo hat keinen Test-Runner; diese Datei ist bewusst ein eigenstaendiges
 * Skript statt einer halben Test-Infrastruktur.
 */
type Store = Record<string, string>;

function setupDom(search: string) {
  const session: Store = {};
  let cookies = "";
  (globalThis as any).window = {
    location: { search, hostname: "www.myhealthandbeauty.com" },
  };
  (globalThis as any).document = {
    get cookie() {
      return cookies;
    },
    set cookie(v: string) {
      const [pair] = v.split(";");
      cookies = cookies ? `${cookies}; ${pair}` : pair!;
    },
  };
  (globalThis as any).sessionStorage = {
    getItem: (k: string) => (k in session ? session[k]! : null),
    setItem: (k: string, v: string) => {
      session[k] = v;
    },
    removeItem: (k: string) => {
      delete session[k];
    },
  };
  return { session, cookies: () => cookies };
}

const CAL = "https://calendly.com/koeln-arcaden";
const APP = "https://app.myhealthandbeauty.com/book-appointment?location=koeln-aracden";

let failed = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  console.log(`${ok ? "ok  " : "FAIL"}  ${name}${ok ? "" : `  -> ${JSON.stringify(detail)}`}`);
  if (!ok) failed++;
}

const mod = await import(
  "../app/lib/bookingAbTest.ts"
);
const { resolveBookingTarget, readAbBookingConfig, readActiveAbVariant } = mod;

// --- Auslieferungszustand: kein Split konfiguriert -------------------------
{
  setupDom("");
  const cfg = readAbBookingConfig({});
  check("Default-Config ist aus", cfg.splitPercent === 0 && cfg.locations.length === 0, cfg);
  const r = resolveBookingTarget(
    { calendlyUrl: CAL, appBookingUrl: APP, locationSlug: "koeln-arcaden" },
    cfg,
  );
  check("ohne Freigabe -> Calendly, keine Variante", r.url === CAL && !r.abVariant, r);
  check("ohne Split kein ab_variant an den Events", readActiveAbVariant() === undefined);
}

// --- Standort freigegeben, aber Anteil 0 ----------------------------------
{
  setupDom("");
  const cfg = readAbBookingConfig({ abBookingSplit: "0", abBookingLocations: "koeln-arcaden" });
  const r = resolveBookingTarget(
    { calendlyUrl: CAL, appBookingUrl: APP, locationSlug: "koeln-arcaden" },
    cfg,
  );
  check("Anteil 0 -> Calendly", r.url === CAL && !r.abVariant, r);
}

// --- ?ab=app erzwingt, auch ohne Freigabe ---------------------------------
{
  setupDom("?ab=app");
  const cfg = readAbBookingConfig({});
  const r = resolveBookingTarget(
    { calendlyUrl: CAL, appBookingUrl: APP, locationSlug: "koeln-arcaden" },
    cfg,
  );
  check("?ab=app -> App-URL + Variante app", r.url === APP && r.abVariant === "app", r);
  check("?ab=app setzt ab_variant fuer die Events", readActiveAbVariant() === "app");
}
{
  setupDom("?ab=calendly");
  const r = resolveBookingTarget(
    { calendlyUrl: CAL, appBookingUrl: APP, locationSlug: "koeln-arcaden" },
    readAbBookingConfig({ abBookingSplit: "100", abBookingLocations: "koeln-arcaden" }),
  );
  check("?ab=calendly schlaegt den 100%-Anteil", r.url === CAL && r.abVariant === "calendly", r);
}

// --- ohne zweite URL gibt es nichts zu splitten ---------------------------
{
  setupDom("?ab=app");
  const r = resolveBookingTarget(
    { calendlyUrl: CAL, locationSlug: "koeln-arcaden" },
    readAbBookingConfig({ abBookingSplit: "50", abBookingLocations: "koeln-arcaden" }),
  );
  check("ohne appBookingUrl -> Calendly, keine Variante", r.url === CAL && !r.abVariant, r);
}

// --- Freigegeben + 50 %: Verteilung und Bestaendigkeit --------------------
{
  const cfg = readAbBookingConfig({ abBookingSplit: "50", abBookingLocations: "koeln-arcaden" });
  let app = 0;
  const N = 4000;
  for (let i = 0; i < N; i++) {
    setupDom("");
    const r = resolveBookingTarget(
      { calendlyUrl: CAL, appBookingUrl: APP, locationSlug: "koeln-arcaden" },
      cfg,
    );
    if (r.abVariant === "app") app++;
  }
  const share = (app / N) * 100;
  check(`50/50 (gemessen ${share.toFixed(1)} %)`, Math.abs(share - 50) < 5, share);

  // Derselbe Besucher bekommt bei jedem weiteren Klick dasselbe
  setupDom("");
  const first = resolveBookingTarget(
    { calendlyUrl: CAL, appBookingUrl: APP, locationSlug: "koeln-arcaden" },
    cfg,
  );
  const again = Array.from({ length: 20 }, () =>
    resolveBookingTarget(
      { calendlyUrl: CAL, appBookingUrl: APP, locationSlug: "koeln-arcaden" },
      cfg,
    ).abVariant,
  );
  check(
    "Variante bleibt ueber weitere Klicks gleich",
    again.every((v) => v === first.abVariant),
    { first: first.abVariant, again },
  );

  // Anderer Standort ohne Freigabe: kein ab_variant, obwohl Bucket existiert
  const other = resolveBookingTarget(
    { calendlyUrl: "https://calendly.com/leipzig", appBookingUrl: APP, locationSlug: "leipzig-hoefe" },
    cfg,
  );
  check(
    "nicht freigegebener Standort faerbt nicht ab",
    other.url === "https://calendly.com/leipzig" && !other.abVariant && readActiveAbVariant() === undefined,
    other,
  );
}

// --- Cookie wird gesetzt (30 Tage) ---------------------------------------
{
  const dom = setupDom("?ab=app");
  resolveBookingTarget(
    { calendlyUrl: CAL, appBookingUrl: APP, locationSlug: "koeln-arcaden" },
    readAbBookingConfig({}),
  );
  check("Cookie myhb_ab_booking=app gesetzt", dom.cookies().includes("myhb_ab_booking=app"), dom.cookies());
}

// --- Unsinnige Env-Werte schalten ab, nicht auf -----------------------------
{
  for (const bad of ["abc", "-5", "500", ""]) {
    const cfg = readAbBookingConfig({ abBookingSplit: bad, abBookingLocations: "koeln-arcaden" });
    check(`Anteil "${bad}" -> 0`, cfg.splitPercent === 0, cfg);
  }
}

console.log(failed === 0 ? "\nAlle Pruefungen bestanden." : `\n${failed} Pruefung(en) fehlgeschlagen.`);
process.exit(failed === 0 ? 0 : 1);
