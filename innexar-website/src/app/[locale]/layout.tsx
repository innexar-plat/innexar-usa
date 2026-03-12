import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import { generateMetadata as genMeta } from '@/lib/seo'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import PerformanceMeasureGuard from '@/components/PerformanceMeasureGuard'
import StructuredData from '@/components/StructuredData'
import AIChat from '@/components/ai-chat/AIChat'
import CookieConsent from '@/components/CookieConsent'
import MetaPixelProvider from '@/components/providers/MetaPixelProvider'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

const locales = ['en', 'pt', 'es']

type Props = {
  readonly children: React.ReactNode
  readonly params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return genMeta(locale, 'default')
}

export default async function RootLayout({
  children,
  params
}: Props) {
  const { locale } = await params

  // Validate locale
  if (!locales.includes(locale)) {
    notFound()
  }

  const messages = await getMessages({ locale })
  const { generateStructuredData } = await import('@/lib/seo')
  // No layout level we use default/organization data
  const structuredData = generateStructuredData(locale, 'home')

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(typeof performance==="undefined"||!performance.measure)return;var o=performance.measure.bind(performance);performance.measure=function(n,s,e){try{return arguments.length===1?o(n):typeof e==="string"?o(n,s,e):o(n,s)}catch(err){if(err instanceof TypeError&&/negative time stamp|RootNotFound|NotFound/.test(String(err.message)))return undefined;throw err}};})();`,
          }}
        />
        <StructuredData
          organization={structuredData.organization}
          website={structuredData.website}
        />
        <PerformanceMeasureGuard />
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <MetaPixelProvider pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID}>
          <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
            <AIChat />
            <CookieConsent />
          </NextIntlClientProvider>
        </MetaPixelProvider>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'pt' }, { locale: 'es' }]
}
