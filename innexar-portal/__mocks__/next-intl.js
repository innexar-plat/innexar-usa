/**
 * Jest mock for next-intl (ESM) so tests can run without transforming node_modules.
 * useTranslations returns (key) => key so tests assert on translation keys.
 */
const useLocale = () => "en";
const useTranslations = () => (key) => key;
const NextIntlClientProvider = ({ children }) => children;

module.exports = {
  useLocale,
  useTranslations,
  useFormatter: () => ({ formatDateTime: (d) => String(d), formatNumber: (n) => String(n) }),
  useMessages: () => ({}),
  useNow: () => new Date(),
  useTimeZone: () => "UTC",
  NextIntlClientProvider,
};
