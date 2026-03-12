import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://innexar.app'
const SITE_NAME = 'Innexar'

export async function generateMetadata(
  locale: string,
  page: string = 'home'
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'seo' })

  const title = t(`${page}.title`, { defaultValue: t('default.title') })
  const description = t(`${page}.description`, { defaultValue: t('default.description') })
  const keywords = t(`${page}.keywords`, { defaultValue: t('default.keywords') })

  const cleanPath = page === 'home' ? '' : `/${page}`
  const url = `${SITE_URL}/${locale}${cleanPath}`
  const ogImage = `${SITE_URL}/og-image.jpg`

  return {
    title,
    description,
    keywords: keywords.split(',').map(k => k.trim()),
    icons: {
      icon: '/favicon.png',
      shortcut: '/favicon.png',
      apple: '/favicon.png', // Fallback to favicon if apple-touch-icon is missing
    },
    authors: [{ name: 'Innexar' }],
    creator: 'Innexar',
    publisher: 'Innexar',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages: {
        'pt': `${SITE_URL}/pt${cleanPath}`,
        'en': `${SITE_URL}/en${cleanPath}`,
        'es': `${SITE_URL}/es${cleanPath}`,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale,
      url: url,
      title: title,
      description: description,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [ogImage],
      creator: '@innexar',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    },
  }
}

export function generateStructuredData(
  locale: string,
  page: string = 'home'
) {
  const baseUrl = SITE_URL
  const url = `${baseUrl}/${locale}${page !== 'home' ? `/${page}` : ''}`

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Innexar',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/favicon.png`,
      width: '512',
      height: '512'
    },
    image: `${baseUrl}/og-image.jpg`,
    description: 'Elite Software Solutions & Digital Transformation Agency. Professional websites and local SEO for Florida: Orlando, Tampa, Miami, Jacksonville.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Orlando',
      addressRegion: 'FL',
      addressCountry: 'US'
    },
    areaServed: [
      { '@type': 'City', name: 'Orlando', containedInPlace: { '@type': 'State', name: 'Florida' } },
      { '@type': 'City', name: 'Tampa', containedInPlace: { '@type': 'State', name: 'Florida' } },
      { '@type': 'City', name: 'Miami', containedInPlace: { '@type': 'State', name: 'Florida' } },
      { '@type': 'City', name: 'Jacksonville', containedInPlace: { '@type': 'State', name: 'Florida' } },
      { '@type': 'State', name: 'Florida' },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-407-473-6081',
      contactType: 'sales',
      areaServed: ['US', 'Florida', 'Orlando', 'Tampa', 'Miami', 'Jacksonville'],
      availableLanguage: ['Portuguese', 'English', 'Spanish'],
    },
    sameAs: [
      'https://www.linkedin.com/company/innexar',
      'https://twitter.com/innexar',
      'https://www.instagram.com/innexar.app',
    ],
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Innexar',
    url: baseUrl,
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${baseUrl}/${locale}`,
      },
      ...(page !== 'home' ? [{
        '@type': 'ListItem',
        position: 2,
        name: page.charAt(0).toUpperCase() + page.slice(1),
        item: url,
      }] : []),
    ],
  }

  return {
    organization,
    website,
    breadcrumb,
  }
}

