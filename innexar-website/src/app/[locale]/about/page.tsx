import { generateMetadata as genMeta } from '@/lib/seo'
import Header from '@/components/Header'
import About from '@/components/About'
import Footer from '@/components/Footer'
import AboutHero from '@/components/about/AboutHero'
import AboutContent from '@/components/about/AboutContent'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return genMeta(locale, 'about')
}

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <AboutHero />
      <About />
      <AboutContent />
      <Footer />
    </main>
  )
}