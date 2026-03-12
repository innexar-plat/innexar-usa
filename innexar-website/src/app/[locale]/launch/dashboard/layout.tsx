'use client';

import PortalHeader from '@/components/PortalHeader';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
            <PortalHeader />
            <main className="pt-16">
                {children}
            </main>
        </div>
    );
}
