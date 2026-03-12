import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

const LOCALES = routing.locales as readonly ['en', 'pt', 'es']

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !LOCALES.includes(locale as 'en' | 'pt' | 'es')) {
    locale = routing.defaultLocale
  }

  try {
    const messages = (await import(`../../messages/${locale}.json`)).default
    return { locale, messages }
  } catch {
    const messages = (await import(`../../messages/${routing.defaultLocale}.json`)).default
    return { locale: routing.defaultLocale, messages }
  }
})