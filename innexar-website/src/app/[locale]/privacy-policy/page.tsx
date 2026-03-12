import { generateMetadata as genMeta } from '@/lib/seo'
import PrivacyPolicyPageClient from '@/components/legal/PrivacyPolicyPageClient'

type Props = {
    params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
    const { locale } = await params
    return genMeta(locale, 'privacy-policy')
}

export default function PrivacyPolicyPage() {
    return <PrivacyPolicyPageClient />
}
