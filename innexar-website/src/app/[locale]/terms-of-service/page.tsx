import { generateMetadata as genMeta } from '@/lib/seo'
import TermsOfServicePageClient from '@/components/legal/TermsOfServicePageClient'

type Props = {
    params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
    const { locale } = await params
    return genMeta(locale, 'terms-of-service')
}

export default function TermsOfServicePage() {
    return <TermsOfServicePageClient />
}
