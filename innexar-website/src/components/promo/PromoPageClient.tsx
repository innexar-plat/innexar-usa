'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Check, Shield, ArrowRight } from 'lucide-react'
import { MetaPixel } from '@/lib/meta-pixel'
import Footer from '@/components/Footer'

// Base price for the promo
const BASE_PRICE = 199

export default function PromoPageClient() {
    const t = useTranslations('promo')
    const [isLoading, setIsLoading] = useState(false)
    const [couponCode, setCouponCode] = useState('')

    // Track page view on mount
    useEffect(() => {
        try {
            MetaPixel.viewContent({
                content_ids: ['promo-199'],
                content_type: 'product',
                value: BASE_PRICE,
                currency: 'USD',
            })
        } catch (error) {
            console.error('Meta Pixel tracking error:', error)
        }
    }, [])

    const handleCheckout = async () => {
        if (isLoading) return

        setIsLoading(true)

        try {
            // Track InitiateCheckout event
            MetaPixel.initiateCheckout({
                content_ids: ['promo-199'],
                content_type: 'product',
                value: BASE_PRICE,
                currency: 'USD',
                num_items: 1,
            })

            const response = await fetch(`/api/launch/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    addons: [],
                    source: 'promo-page-simplified',
                    couponCode: couponCode.trim() || undefined,
                }),
            })

            if (!response.ok) {
                throw new Error('Checkout failed')
            }

            const { url } = await response.json()

            if (url) {
                window.location.href = url
            }
        } catch (error) {
            console.error('Checkout error:', error)
            alert('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Included items checklist
    const includedItems = [
        t('included.item1'),
        t('included.item2'),
        t('included.item3'),
        t('included.item4'),
        t('included.item5'),
        t('included.item6'),
    ]

    // How it works steps
    const steps = [
        { number: '1', text: t('howItWorks.step1') },
        { number: '2', text: t('howItWorks.step2') },
        { number: '3', text: t('howItWorks.step3') },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
            {/* Hero Section - Above the Fold */}
            <section className="relative px-6 py-24 text-center">
                <div className="mx-auto max-w-3xl">
                    {/* Headline */}
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                        {t('hero.headline')}
                    </h1>

                    {/* Subheadline */}
                    <p className="mt-4 text-xl text-gray-300 sm:text-2xl">
                        {t('hero.subheadline')}
                    </p>

                    {/* Coupon (optional) */}
                    <div className="mt-6 mx-auto max-w-xs">
                        <label htmlFor="promo-coupon" className="sr-only">
                            {t('hero.couponCode')}
                        </label>
                        <input
                            id="promo-coupon"
                            type="text"
                            value={couponCode}
                            onChange={e => setCouponCode(e.target.value)}
                            placeholder={t('hero.couponPlaceholder')}
                            className="w-full rounded-lg border border-gray-600 bg-gray-800/50 px-4 py-2.5 text-center text-white placeholder:text-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            disabled={isLoading}
                            autoComplete="off"
                        />
                    </div>

                    {/* Primary CTA */}
                    <motion.button
                        onClick={handleCheckout}
                        disabled={isLoading}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-8 py-4 text-lg font-semibold text-white shadow-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLoading ? 'Processing...' : t('hero.cta')}
                        {!isLoading && <ArrowRight className="h-5 w-5" />}
                    </motion.button>

                    {/* Trust microcopy */}
                    <p className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
                        <Shield className="h-4 w-4" />
                        {t('hero.trust')}
                    </p>
                </div>
            </section>

            {/* Visual Proof - 3 Mockups (Placeholder for now) */}
            <section className="px-6 py-12">
                <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-3">
                    <img
                        src="/images/promo/website_mockup_1_1770088373318.png"
                        alt="Restaurant website mockup"
                        className="w-full rounded-lg shadow-2xl"
                    />
                    <img
                        src="/images/promo/website_mockup_2_1770088388813.png"
                        alt="Law firm website mockup"
                        className="w-full rounded-lg shadow-2xl"
                    />
                    <img
                        src="/images/promo/website_mockup_3_1770088404479.png"
                        alt="Dental clinic website mockup"
                        className="w-full rounded-lg shadow-2xl"
                    />
                </div>
            </section>

            {/* What's Included */}
            <section className="px-6 py-16">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold text-white">{t('included.title')}</h2>
                    <ul className="mt-8 space-y-3 text-left text-lg text-gray-200">
                        {includedItems.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                                <Check className="h-6 w-6 flex-shrink-0 text-emerald-400" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-6 text-sm text-gray-400">{t('included.note')}</p>
                </div>
            </section>

            {/* How It Works */}
            <section className="px-6 py-16">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold text-white">{t('howItWorks.title')}</h2>
                    <div className="mt-10 space-y-6">
                        {steps.map((step) => (
                            <div key={step.number} className="flex items-center gap-4 text-left">
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xl font-bold text-white">
                                    {step.number}
                                </div>
                                <p className="text-lg text-gray-200">{step.text}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-8 text-gray-400">{t('howItWorks.subtitle')}</p>
                </div>
            </section>

            {/* Guarantee */}
            <section className="px-6 py-16">
                <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 p-8 text-center shadow-xl backdrop-blur">
                    <Shield className="mx-auto h-16 w-16 text-emerald-400" />
                    <h3 className="mt-4 text-2xl font-bold text-white">{t('guarantee.title')}</h3>
                    <p className="mt-2 text-lg text-gray-300">{t('guarantee.subtitle')}</p>
                </div>
            </section>

            {/* Final CTA */}
            <section className="px-6 py-24 text-center">
                <div className="mx-auto max-w-2xl">
                    <motion.button
                        onClick={handleCheckout}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-10 py-5 text-xl font-semibold text-white shadow-2xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLoading ? 'Processing...' : t('finalCta.button')}
                        {!isLoading && <ArrowRight className="h-6 w-6" />}
                    </motion.button>
                    <p className="mt-4 text-sm font-medium uppercase tracking-wide text-emerald-400">
                        {t('finalCta.subtitle')}
                    </p>
                </div>
            </section>
            <Footer />
        </div>
    )
}
