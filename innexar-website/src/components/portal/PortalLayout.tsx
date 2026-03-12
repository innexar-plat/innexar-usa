'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    FolderOpen,
    MessageSquare,
    PlusCircle,
    Receipt,
    User,
    LogOut,
    ChevronLeft,
    Bell,
    Menu,
    X
} from 'lucide-react';

interface NavItem {
    key: string;
    label: string;
    icon: React.ElementType;
    href: string;
    badge?: number;
}

interface PortalLayoutProps {
    children: React.ReactNode;
    customerName?: string;
    projectName?: string;
}

export default function PortalLayout({ children, customerName, projectName }: PortalLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();

    const navItems: NavItem[] = [
        { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: `/${locale}/portal` },
        { key: 'projects', label: 'Projects', icon: FolderOpen, href: `/${locale}/portal/projects` },
        { key: 'support', label: 'Support', icon: MessageSquare, href: `/${locale}/portal/support`, badge: 0 },
        { key: 'new-project', label: 'New Project', icon: PlusCircle, href: `/${locale}/portal/new-project` },
        { key: 'billing', label: 'Billing', icon: Receipt, href: `/${locale}/portal/billing` },
        { key: 'profile', label: 'Profile', icon: User, href: `/${locale}/portal/profile` },
    ];

    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_email');
        localStorage.removeItem('customer_id');
        router.push(`/${locale}/portal/login`);
    };

    const isActive = (href: string) => {
        if (href === `/${locale}/portal`) {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    width: sidebarOpen ? 280 : 80,
                    x: mobileMenuOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? -280 : 0)
                }}
                className={`fixed top-0 left-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-white/5 z-50 flex flex-col
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* Logo Section */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
                    <Link href={`/${locale}`} className="flex items-center">
                        <motion.div
                            animate={{ width: sidebarOpen ? 'auto' : '40px' }}
                            className="overflow-hidden"
                        >
                            {sidebarOpen ? (
                                <Image
                                    src="/logo-header-white.png"
                                    alt="Innexar"
                                    width={360}
                                    height={90}
                                    className="h-24 w-auto"
                                />
                            ) : (
                                <Image
                                    src="/favicon.png"
                                    alt="Innexar"
                                    width={40}
                                    height={40}
                                    className="rounded-xl"
                                />
                            )}
                        </motion.div>
                    </Link>

                    {/* Collapse Button - Desktop */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }}>
                            <ChevronLeft className="w-4 h-4 text-slate-400" />
                        </motion.div>
                    </button>

                    {/* Close Button - Mobile */}
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10"
                    >
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 overflow-y-auto">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <li key={item.key}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${active
                                                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`flex-shrink-0 ${active ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'}`}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </motion.div>

                                        <AnimatePresence>
                                            {sidebarOpen && (
                                                <motion.span
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -10 }}
                                                    className="flex-1 font-medium"
                                                >
                                                    {item.label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>

                                        {item.badge !== undefined && item.badge > 0 && sidebarOpen && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full"
                                            >
                                                {item.badge}
                                            </motion.span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Logout Section */}
                <div className="p-3 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        <AnimatePresence>
                            {sidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="font-medium"
                                >
                                    Logout
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-20'}`}>
                {/* Top Header */}
                <header className="sticky top-0 z-30 h-20 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
                    <div className="h-full px-4 lg:px-8 flex items-center justify-between">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <Menu className="w-5 h-5 text-white" />
                        </button>

                        {/* Page Title / Breadcrumb */}
                        <div className="hidden lg:flex items-center gap-2">
                            <h1 className="text-xl font-bold text-white">
                                {projectName || customerName || 'Client Portal'}
                            </h1>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            {/* Notifications */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <Bell className="w-5 h-5 text-slate-400" />
                                {/* Notification dot */}
                                {/* <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" /> */}
                            </motion.button>

                            {/* User Avatar */}
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer"
                            >
                                <span className="text-sm font-bold text-white">
                                    {(customerName || 'C')[0].toUpperCase()}
                                </span>
                            </motion.div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
