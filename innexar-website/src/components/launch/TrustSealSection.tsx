'use client'

import { motion } from 'framer-motion'
import { Lock, Shield, CreditCard } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function TrustSealSection() {
    const t = useTranslations('launch.trustSeal')

    const items = [
        { icon: Lock, key: 'ssl' },
        { icon: CreditCard, key: 'securePayment' },
        { icon: Shield, key: 'title' },
    ] as const

    return (
        <section className="relative z-10 py-12 border-y border-white/10 bg-white/[0.03]">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-wrap justify-center items-center gap-8 md:gap-12"
                >
                    {items.map(({ icon: Icon, key }, i) => (
                        <div
                            key={key}
                            className="flex items-center gap-3 text-slate-300"
                        >
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                                <Icon className="w-5 h-5 text-emerald-400" />
                            </div>
                            <span className="text-sm font-medium">
                                {key === 'title' ? t('title') : t(key as 'ssl' | 'securePayment')}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
