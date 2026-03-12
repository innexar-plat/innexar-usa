'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import PortalLayout from '@/components/portal/PortalLayout';

interface CustomerData {
    name: string;
    email: string;
}

export default function PortalLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const locale = useLocale();
    const pathname = usePathname();
    const [customerData, setCustomerData] = useState<CustomerData | null>(null);
    const [loading, setLoading] = useState(true);

    // Skip auth check for login page
    const isLoginPage = pathname?.includes('/portal/login');

    useEffect(() => {
        // Skip auth check for login page
        if (isLoginPage) {
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('customer_token');

        if (!token) {
            router.push(`/${locale}/portal/login`);
            return;
        }

        // For now, just use stored email as customer name
        const storedEmail = localStorage.getItem('customer_email');
        if (storedEmail) {
            setCustomerData({ name: storedEmail.split('@')[0], email: storedEmail });
        }
        setLoading(false);
    }, [router, locale, isLoginPage]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Login page renders without the full portal layout
    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <PortalLayout customerName={customerData?.name}>
            {children}
        </PortalLayout>
    );
}
