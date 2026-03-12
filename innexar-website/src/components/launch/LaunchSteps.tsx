'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'

const STEP_KEYS = [
    { title: 'step1', desc: 'step1Desc' },
    { title: 'step2', desc: 'step2Desc' },
    { title: 'step3', desc: 'step3Desc' },
    { title: 'step4', desc: 'step4Desc' },
] as const

export default function LaunchSteps() {
    const t = useTranslations('launch.process')

    return (
        <section className="relative z-10 py-24">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-sm mb-4">
                        {t('title')}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white">{t('title')}</h2>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {STEP_KEYS.map((step, i) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="relative"
                        >
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full hover:border-blue-400/30 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center text-xl font-bold text-blue-300 mb-4">
                                    {i + 1}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{t(step.title)}</h3>
                                <p className="text-slate-400 text-sm">{t(step.desc)}</p>
                            </div>
                            {i < STEP_KEYS.length - 1 && (
                                <div className="hidden lg:block absolute top-1/2 -right-3 z-10 transform -translate-y-1/2">
                                    <ArrowRight className="w-6 h-6 text-white/20" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
