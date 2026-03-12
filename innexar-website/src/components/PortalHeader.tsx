'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { LogOut, User, Globe } from 'lucide-react';

interface PortalHeaderProps {
    customerName?: string;
    projectName?: string;
}

export default function PortalHeader({ customerName, projectName }: PortalHeaderProps) {
    const router = useRouter();
    const locale = useLocale();

    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_email');
        localStorage.removeItem('customer_id');
        router.push(`/${locale}/launch/login`);
    };

    const handleBackToSite = () => {
        router.push(`/${locale}`);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <motion.button
                        onClick={handleBackToSite}
                        className="flex items-center gap-3 group"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Image
                            src="/logo-header-white.png"
                            alt="Innexar"
                            width={140}
                            height={35}
                            className="h-8 w-auto"
                            priority
                        />
                    </motion.button>

                    {/* Center - Project/Customer Info */}
                    {(projectName || customerName) && (
                        <div className="hidden md:flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-300 font-medium">
                                {projectName || customerName}
                            </span>
                        </div>
                    )}

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        {/* Back to Site */}
                        <motion.button
                            onClick={handleBackToSite}
                            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Globe className="w-4 h-4" />
                            <span>Visit Site</span>
                        </motion.button>

                        {/* Logout Button */}
                        <motion.button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </header>
    );
}
