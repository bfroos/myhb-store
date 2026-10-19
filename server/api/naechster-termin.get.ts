/**
 * Naechster freier Termin fuer go.-Landingpages (Benjamin 08.10.2026).
 *
 * Fragt die oeffentlichen Buchungs-RPCs der App ab (get_available_dates /
 * get_available_slots, SECURITY DEFINER, fuer anon freigegeben) - dieselben
 * Regeln wie bei der Buchung selbst: Arztschichten, Termine, Blocker,
 * Kapazitaet, Mindestvorlauf. Liefert nur Datum + Uhrzeit, nie Personendaten.
 *
 *   GET /api/naechster-termin?location=<venues.url_slug>&treatment=<slug>
 *   -> { date: "2026-10-09", time: "10:15" } | { none: true }
 *
 * Mit `&anzahl=3` (myhb-app/myhb-os#1030, Rabatt-Fenster Schritt 2) kommen
 * zusaetzlich bis zu drei Termine als `termine`, hoechstens zwei je Tag,
 * damit der Kunde auch einen anderen Tag sieht. `date`/`time` bleiben der
 * erste Termin, bestehende Aufrufer merken nichts.
 */
const SUPABASE_URL = "https://forgsirmbzkxbblepscr.supabase.co";
// Oeffentlicher anon/publishable Key der App (steht auch im App-Bundle).
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcmdzaXJtYnpreGJibGVwc2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1Mjc0MTQsImV4cCI6MjA3NjEwMzQxNH0.NuNxl2r3Y2_l777CojJ5TaYgOsEi2pPc2d0TigIZv_I";

const SLUG = /^[a-z0-9-]{2,80}$/;
const WINDOW_DAYS = 14;

function berlinDate(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(d);
}

async function rest<T>(path: string, init?: RequestInit): Promise<T> {
  const config = useRuntimeConfig();
  const key = (config.appSupabaseAnonKey as string | undefined) || SUPABASE_ANON_KEY;
  return await $fetch<T>(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...(init as any),
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    timeout: 2500,
  });
}

export default defineCachedEventHandler(
  async (event) => {
    const q = getQuery(event);
    const location = String(q.location ?? "");
    const treatment = String(q.treatment ?? "");
    const anzahl = Math.min(4, Math.max(1, Number.parseInt(String(q.anzahl ?? "1"), 10) || 1));
    if (!SLUG.test(location) || !SLUG.test(treatment)) {
      throw createError({ statusCode: 400, statusMessage: "Bad Request" });
    }
    try {
      const [venues, treatments] = await Promise.all([
        rest<{ id: string }[]>(`venues?select=id&url_slug=eq.${location}&limit=1`),
        rest<{ id: string; duration: number | null }[]>(
          `treatments?select=id,duration&is_bookable=eq.true&or=(url_slug.eq.${treatment},website_slugs.cs.%7B${treatment}%7D)&limit=1`,
        ),
      ]);
      const venueId = venues[0]?.id;
      const t = treatments[0];
      if (!venueId || !t) return { none: true };
      const duration = t.duration || 30;

      const dates = await rest<string[]>("rpc/get_available_dates", {
        method: "POST",
        body: JSON.stringify({
          p_venue_id: venueId,
          p_from: berlinDate(0),
          p_to: berlinDate(WINDOW_DAYS),
          p_duration_minutes: duration,
          p_treatment_id: t.id,
        }),
      });
      const termine: { date: string; time: string }[] = [];
      for (const date of (dates ?? []).slice(0, 3)) {
        const slots = await rest<{ slot_start: string; free_capacity: number }[]>("rpc/get_available_slots", {
          method: "POST",
          body: JSON.stringify({
            p_venue_id: venueId,
            p_date: date,
            p_duration_minutes: duration,
            p_treatment_id: t.id,
          }),
        });
        const frei = (slots ?? []).filter((s) => (s.free_capacity ?? 1) > 0);
        for (const s of frei.slice(0, anzahl > 1 ? 2 : 1)) {
          termine.push({ date, time: s.slot_start.slice(0, 5) });
        }
        if (termine.length >= anzahl) break;
      }
      if (termine.length === 0) return { none: true };
      const [erster] = termine;
      return anzahl > 1 ? { ...erster, termine: termine.slice(0, anzahl) } : erster;
    } catch {
      // Lieber nichts anzeigen als etwas Falsches.
      return { none: true };
    }
  },
  {
    maxAge: 60,
    swr: true,
    name: "naechster-termin",
    getKey: (event) => {
      const q = getQuery(event);
      return `${q.location}:${q.treatment}:${q.anzahl ?? 1}`;
    },
  },
);
