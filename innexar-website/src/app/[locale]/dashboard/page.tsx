'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'

/**
 * Legacy dashboard page - redirects to the new launch dashboard
 */
export default function DashboardPage() {
    const router = useRouter()

    useEffect(() => {
        // Get stored customer credentials
        const token = localStorage.getItem('customer_token')
        const email = localStorage.getItem('customer_email')

        if (!token || !email) {
            // Not logged in - redirect to login
            router.replace('/launch/login')
            return
        }

        // Redirect to the new launch dashboard with login flow
        router.replace('/launch/login')
    }, [router])

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p>Redirecting...</p>
            </div>
        </div>
    )
}
