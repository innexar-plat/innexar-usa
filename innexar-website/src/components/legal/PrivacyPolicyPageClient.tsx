'use client'

import { useTranslations } from 'next-intl'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { ShieldCheck, Clock } from 'lucide-react'

export default function PrivacyPolicyPageClient() {
    const t = useTranslations('legal.privacy')

    return (
        <main className="min-h-screen bg-slate-50">
            <Header />

            <div className="pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 md:p-12 overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-50" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-200">
                                    <ShieldCheck className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                                        {t('title')}
                                    </h1>
                                    <p className="text-slate-500 mt-1 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {t('lastUpdated')}
                                    </p>
                                </div>
                            </div>

                            <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-ul:text-slate-600">
                                <section className="mb-10">
                                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                                        1. {t('sections.dataCollection.title')}
                                    </h2>
                                    <p>{t('sections.dataCollection.content')}</p>
                                </section>

                                <section className="mb-10">
                                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                                        2. {t('sections.dataUsage.title')}
                                    </h2>
                                    <p>{t('sections.dataUsage.content')}</p>
                                </section>

                                <section className="mb-10">
                                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                                        3. {t('sections.dataSharing.title')}
                                    </h2>
                                    <p>{t('sections.dataSharing.content')}</p>
                                </section>

                                <section className="mb-10">
                                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                                        4. {t('sections.cookies.title')}
                                    </h2>
                                    <p>{t('sections.cookies.content')}</p>
                                </section>

                                <section className="mb-10">
                                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                                        5. {t('sections.security.title')}
                                    </h2>
                                    <p>{t('sections.security.content')}</p>
                                </section>

                                <section className="mb-10">
                                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                                        6. {t('sections.rights.title')}
                                    </h2>
                                    <p>{t('sections.rights.content')}</p>
                                </section>

                                <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-500 text-sm">
                                    {t('footerNote')}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <Footer />
        </main>
    )
}
