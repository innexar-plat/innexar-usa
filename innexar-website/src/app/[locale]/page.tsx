import Header from '@/components/Header'
import NewWebsiteSystemSection from '@/components/NewWebsiteSystemSection'
import Hero from '@/components/Hero'
import Services from '@/components/Services'
import SuccessStories from '@/components/SuccessStories'
import ProcessSection from '@/components/ProcessSection'
import Technologies from '@/components/Technologies'
import EngagementModels from '@/components/EngagementModels'
import Testimonials from '@/components/Testimonials'
import LeadMagnet from '@/components/LeadMagnet'
import About from '@/components/About'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import { generateMetadata as genMeta, generateStructuredData } from '@/lib/seo'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return genMeta(locale, 'home')
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <main className="min-h-screen">
      <Header />
      <NewWebsiteSystemSection />
      <Hero />
      <Services />
      <SuccessStories />
      <ProcessSection />
      <Technologies />
      <EngagementModels />
      <Testimonials />
      <LeadMagnet />
      <About />
      <Contact />
      <Footer />
    </main>
  )
}
