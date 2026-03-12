import { generateMetadata as genMeta } from '@/lib/seo'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ChecklistForm from '@/components/checklist/ChecklistForm'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return genMeta(locale, 'checklist')
}

export default function ChecklistPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <ChecklistForm />
      <Footer />
    </main>
  )
}

