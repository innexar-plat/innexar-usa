/**
 * Maps next-intl locale to Intl locale string for Date/Number formatting.
 */
const LOCALE_TO_INTL: Record<string, string> = {
  pt: "pt-BR",
  en: "en-US",
  es: "es",
};

export function getIntlLocale(locale: string): string {
  return LOCALE_TO_INTL[locale] ?? "en-US";
}
