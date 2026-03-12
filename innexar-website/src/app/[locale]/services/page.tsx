import { generateMetadata as genMeta } from '@/lib/seo'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ServicesHero from '@/components/services/ServicesHero'
import ServiceDetails from '@/components/services/ServiceDetails'
import ProcessSection from '@/components/services/ProcessSection'
import WhyChooseUs from '@/components/services/WhyChooseUs'
import ServicesCTA from '@/components/services/ServicesCTA'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return genMeta(locale, 'services')
}

export default function ServicesPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <ServicesHero />
      <ServiceDetails />
      <ProcessSection />
      <WhyChooseUs />
      <ServicesCTA />
      <Footer />
    </main>
  )
}