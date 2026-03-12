'use client'

import { useEffect } from 'react'
import { initMetaPixel } from '@/lib/meta-pixel'

interface MetaPixelProviderProps {
    pixelId?: string
    children: React.ReactNode
}

export function MetaPixelProvider({ pixelId, children }: MetaPixelProviderProps) {
    useEffect(() => {
        initMetaPixel(pixelId)
    }, [pixelId])

    return <>{children}</>
}

export default MetaPixelProvider
