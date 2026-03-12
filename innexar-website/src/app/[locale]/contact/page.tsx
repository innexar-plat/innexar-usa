import { generateMetadata as genMeta } from '@/lib/seo'
import Header from '@/components/Header'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import ContactHero from '@/components/contact/ContactHero'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return genMeta(locale, 'contact')
}

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <ContactHero />
      <div className="bg-white">
        <Contact />
      </div>
      <Footer />
    </main>
  )
}