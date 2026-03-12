import { generateMetadata as genMeta } from '@/lib/seo'
import LaunchPageClient from '@/components/launch/LaunchPageClient'

type Props = {
    params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
    const { locale } = await params
    return genMeta(locale, 'launch')
}

export default function LaunchPage() {
    return <LaunchPageClient />
}
