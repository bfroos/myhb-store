import type { ComputedRef, InjectionKey, MaybeRefOrGetter } from "vue";

/**
 * Klinik-Regel (E28, myhb-app/myhb-os#1636) fuer Strapi-Bloecke einer Seite.
 *
 * Die Seite meldet, dass sie eine OP zeigt, und wohin Knoepfe fuehren sollen
 * (Funnel-Seite oder `#anfrage`). Der BlockRenderer blendet dann die
 * 20-%-Bloecke aus und leitet "Termin buchen" dorthin um. `null` = normale
 * Seite.
 */
const KLINIK_SEITE: InjectionKey<ComputedRef<string | null>> =
  Symbol("klinikSeite");

export function provideKlinikSeite(ziel: MaybeRefOrGetter<string | null>) {
  provide(
    KLINIK_SEITE,
    computed(() => toValue(ziel) || null),
  );
}

export function useKlinikSeite(): ComputedRef<string | null> {
  return inject(
    KLINIK_SEITE,
    computed(() => null),
  );
}
