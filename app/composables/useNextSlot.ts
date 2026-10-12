/**
 * Naechster freier Termin live aus der App (/api/naechster-termin, 60 s
 * Cache, Benjamin 08.10./12.10.2026). Im Browser nachgeladen, weil die Seiten
 * ISR-gecacht sind - so steht nie ein veralteter Termin im HTML. Laedt alle
 * 60 Sekunden neu, solange die Seite offen ist.
 *
 * `appBookingUrl` ist die Buchungs-URL des Standorts aus Strapi; der
 * Parameter location= ist der Standort-Slug der App.
 */
export function appLocationFromBookingUrl(appBookingUrl: string | null | undefined): string {
  try {
    return new URL(String(appBookingUrl ?? ""), "https://x").searchParams.get("location") ?? "";
  } catch {
    return "";
  }
}

export function formatNextSlot(s: { date?: string; time?: string } | null | undefined): string | null {
  if (!s?.date || !s.time) return null;
  const fmt = (offset: number) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date(Date.now() + offset));
  const day =
    s.date === fmt(0)
      ? "heute"
      : s.date === fmt(86_400_000)
        ? "morgen"
        : new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(
            new Date(`${s.date}T12:00:00Z`),
          );
  return `${day} ab ${s.time} Uhr`;
}

export function useNextSlot(appBookingUrl: () => string | null | undefined, treatmentSlug: () => string) {
  const slot = ref<{ date?: string; time?: string; none?: boolean } | null>(null);
  const loaded = ref(false);
  async function load() {
    const location = appLocationFromBookingUrl(appBookingUrl());
    const treatment = treatmentSlug();
    if (!location || !treatment) {
      loaded.value = true;
      return;
    }
    try {
      slot.value = await $fetch("/api/naechster-termin", { query: { location, treatment } });
    } catch {
      slot.value = null;
    }
    loaded.value = true;
  }
  let timer: ReturnType<typeof setInterval> | null = null;
  onMounted(() => {
    load();
    timer = setInterval(load, 60_000);
  });
  onBeforeUnmount(() => {
    if (timer) clearInterval(timer);
  });
  const label = computed(() => formatNextSlot(slot.value));
  return { slot, label, loaded };
}
