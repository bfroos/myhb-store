import { loadRaw } from "~/lib/attribution";
import { rabattBerechtigt } from "#shared/rabattBerechtigt";

/**
 * Darf dieser Besucher den 20-%-Neukundenrabatt sehen? (shared/rabattBerechtigt.ts)
 *
 * Auf dem Server und vor dem Mount immer false: Seiten werden gecacht, und
 * wer den Stempel nicht hat, darf den Knopf auch nicht kurz sehen. Nach dem
 * Mount zählen der gespeicherte Stempel und die Parameter der aktuellen URL
 * (das utm-persist-Plugin hat sie dann meist schon gespeichert, ohne
 * Einwilligung aber nur in der Sitzung).
 */
export function useRabattBerechtigt() {
  const berechtigt = useState<boolean>("myhb_rabatt_berechtigt", () => false);
  onMounted(() => {
    if (berechtigt.value) return;
    const q = new URLSearchParams(window.location.search);
    berechtigt.value = rabattBerechtigt(loadRaw(), {
      utm_source: q.get("utm_source") ?? undefined,
      utm_medium: q.get("utm_medium") ?? undefined,
      fbclid: q.get("fbclid") ?? undefined,
    });
  });
  return berechtigt;
}
