import { formatInteger as formatIntegerUtil } from "~/utils/formatInteger";

/**
 * Composable for formatting integers according to the current locale.
 * Uses the current i18n locale (e.g. de-DE, en-US) for thousands separators.
 */
export function useFormatInteger() {
  const { locale, locales } = useI18n();

  const localeIso = computed(() => {
    const current = locales.value.find(
      (l: { code: string }) => l.code === locale.value,
    ) as { iso?: string } | undefined;
    return current?.iso ?? "de-DE";
  });

  function formatInteger(
    value: number,
    options?: Intl.NumberFormatOptions,
  ): string {
    return formatIntegerUtil(value, localeIso.value, options);
  }

  return { formatInteger, localeIso };
}
