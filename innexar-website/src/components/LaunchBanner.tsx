'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { motion } from 'framer-motion'
import { Rocket, Clock, Check, ArrowRight, Sparkles } from 'lucide-react'

export default function LaunchBanner() {
    const t = useTranslations('launchBanner')

    const features = [
        { icon: Clock, text: t('feature1') },
        { icon: Check, text: t('feature2') },
        { icon: Sparkles, text: t('feature3') },
    ]

    return (
        <section className="relative py-16 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500" />

            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-10 left-10 w-72 h-72 bg-white/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                    {/* Left Content */}
                    <motion.div
                        className="text-center lg:text-left max-w-2xl"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
                            <Rocket className="w-4 h-4" />
                            {t('badge')}
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                            {t('title')} <span className="text-yellow-300">{t('highlight')}</span>
                        </h2>

                        {/* Subtitle */}
                        <p className="text-lg text-white/90 mb-6">
                            {t('subtitle')}
                        </p>

                        {/* Features */}
                        <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-6">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2 text-white/90">
                                    <feature.icon className="w-5 h-5 text-yellow-300" />
                                    <span className="text-sm font-medium">{feature.text}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right - Price Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-2xl shadow-2xl p-8 text-center min-w-[280px]"
                    >
                        {/* Original Price */}
                        <div className="text-gray-400 line-through text-lg mb-1">
                            {t('originalPrice')}
                        </div>

                        {/* Current Price */}
                        <div className="text-5xl font-bold text-gray-900 mb-2">
                            {t('price')}
                        </div>

                        {/* Savings Badge */}
                        <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
                            {t('savings')}
                        </div>

                        {/* CTA Button */}
                        <Link
                            href="/launch"
                            className="group flex items-center justify-center gap-2 w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            {t('cta')}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        {/* Guarantee */}
                        <p className="text-xs text-gray-500 mt-3">
                            {t('guarantee')}
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
