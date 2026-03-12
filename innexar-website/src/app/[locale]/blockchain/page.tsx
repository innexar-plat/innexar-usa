import { generateMetadata as genMeta } from '@/lib/seo'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BlockchainHero from '@/components/blockchain/BlockchainHero'
import BlockchainServices from '@/components/blockchain/BlockchainServices'
import BlockchainTechnologies from '@/components/blockchain/BlockchainTechnologies'
import BlockchainConsulting from '@/components/blockchain/BlockchainConsulting'
import BlockchainCTA from '@/components/blockchain/BlockchainCTA'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return genMeta(locale, 'blockchain')
}

export default function BlockchainPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <BlockchainHero />
      <BlockchainServices />
      <BlockchainTechnologies />
      <BlockchainConsulting />
      <BlockchainCTA />
      <Footer />
    </main>
  )
}

