'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Check, Sparkles, Rocket, Clock, Shield,
    Star, Zap, Palette, Search, MessageCircle,
    Award, Globe, ArrowRight, Phone, Play, DollarSign, Wifi, Smartphone, Target
} from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { MetaPixel } from '@/lib/meta-pixel'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TrustSealSection from '@/components/launch/TrustSealSection'
import LaunchSteps from '@/components/launch/LaunchSteps'
import ExplanationSection from '@/components/launch/ExplanationSection'
import LaunchTestimonials from '@/components/launch/LaunchTestimonials'

const API_WAAS_PRODUCTS = process.env.NEXT_PUBLIC_WORKSPACE_API_URL
    ? `${process.env.NEXT_PUBLIC_WORKSPACE_API_URL}/api/public/products/waas`
    : ''

const FALLBACK_PLANS = [
    {
        slug: 'starter', name: 'Starter', price: 129, currency: 'USD',
        features: [
            'Up to 5 pages',
            '1 revision per month',
            'Email support',
            'SSL & hosting included',
            'Mobile responsive',
            'Basic SEO setup',
            'Contact form',
        ],
    },
    {
        slug: 'business', name: 'Business', price: 199, currency: 'USD',
        features: [
            'Up to 10 pages',
            '3 revisions per month',
            'Priority support',
            'Advanced SEO optimization',
            'Google Analytics setup',
            'Blog section',
            'Social media integration',
            'Speed optimization',
        ],
    },
    {
        slug: 'pro', name: 'Pro', price: 299, currency: 'USD',
        features: [
            'Up to 20 pages',
            'Unlimited revisions (priority)',
            'Dedicated account manager',
            'Premium SEO & local SEO',
            'Custom integrations',
            'E-commerce ready',
            'A/B testing & analytics',
            'Monthly performance report',
        ],
    },
] as const

// Animated counter
function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let start = 0
        const increment = target / (duration / 16)
        const timer = setInterval(() => {
            start += increment
            if (start >= target) {
                setCount(target)
                clearInterval(timer)
            } else {
                setCount(Math.floor(start))
            }
        }, 16)
        return () => clearInterval(timer)
    }, [target, duration])

    return <span>{count}</span>
}

// Typing effect
function TypingText({ text, speed = 50 }: { text: string; speed?: number }) {
    const [displayText, setDisplayText] = useState('')
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        if (currentIndex < text.length) {
            const timer = setTimeout(() => {
                setDisplayText(prev => prev + text[currentIndex])
                setCurrentIndex(prev => prev + 1)
            }, speed)
            return () => clearTimeout(timer)
        }
    }, [currentIndex, text, speed])

    return (
        <span>
            {displayText}
            <span className="animate-pulse">|</span>
        </span>
    )
}

type WaasPlan = { slug: string; name: string; price: number; currency: string; features: string[] }

export default function LaunchPageClient() {
    const t = useTranslations('launch')
    const locale = useLocale()
    const router = useRouter()
    const [plans, setPlans] = useState<WaasPlan[]>(FALLBACK_PLANS.map(p => ({ ...p, features: [...p.features] })))
    const [isLoaded, setIsLoaded] = useState(false)
    const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null)

    useEffect(() => {
        setIsLoaded(true)
        MetaPixel.viewContent({
            content_name: 'WaaS Launch - Professional Website from $129/mo',
            content_category: 'Website Services',
            content_type: 'product',
            value: 129,
            currency: 'USD',
        })
    }, [])

    useEffect(() => {
        if (!API_WAAS_PRODUCTS) return
        fetch(API_WAAS_PRODUCTS)
            .then(res => res.ok ? res.json() : null)
            .then((data: { slug: string; name: string; price: number; currency: string; features?: string[] }[] | null) => {
                if (Array.isArray(data) && data.length > 0) {
                    setPlans(data.map(p => ({
                        slug: p.slug,
                        name: p.name,
                        price: p.price,
                        currency: p.currency || 'USD',
                        features: p.features ?? [],
                    })))
                }
            })
            .catch(() => { /* keep fallback */ })
    }, [])

    const handleStartPlan = (planSlug: string) => {
        MetaPixel.initiateCheckout({ value: 129, currency: 'USD', content_ids: [planSlug], content_type: 'product', num_items: 1 })
        setIsCheckingOut(planSlug)
        router.push(`/launch/checkout?plan=${encodeURIComponent(planSlug)}`)
    }

    const benefits = [
        { icon: DollarSign, titleKey: 'benefits.noUpfront' as const, descKey: 'benefits.noUpfrontDesc' as const },
        { icon: Wifi, titleKey: 'benefits.hostingIncluded' as const, descKey: 'benefits.hostingIncludedDesc' as const },
        { icon: Smartphone, titleKey: 'benefits.mobileOptimized' as const, descKey: 'benefits.mobileOptimizedDesc' as const },
        { icon: Target, titleKey: 'benefits.builtForLeads' as const, descKey: 'benefits.builtForLeadsDesc' as const },
    ]

    const testimonials = [
        {
            name: 'Michael Rodriguez',
            business: 'Rodriguez Plumbing LLC',
            location: 'Orlando, FL',
            text: 'The site looks amazing and I started getting calls within the first week. Best investment I made for my business this year. The team was professional and delivered exactly what they promised.',
            rating: 5,
        },
        {
            name: 'Sarah Johnson',
            business: 'Johnson Law Firm',
            location: 'Dallas, TX',
            text: 'Professional, fast, and they actually listened to what I wanted. My clients love the new website. It establishes our credibility immediately.',
            rating: 5,
        },
        {
            name: 'David Chen',
            business: 'Chen Dental Care',
            location: 'Seattle, WA',
            text: 'The onboarding process was so easy. I just answered a few questions and they built exactly what I envisioned. Exceeded my expectations.',
            rating: 5,
        },
        {
            name: 'Maria Garcia',
            business: 'Garcia Landscaping',
            location: 'Phoenix, AZ',
            text: 'Had my website up in 4 days. The design is modern and my customers always compliment it. Getting way more leads now.',
            rating: 5,
        },
        {
            name: 'James Wilson',
            business: 'Wilson Electric',
            location: 'Denver, CO',
            text: 'Finally a website that actually works on mobile! The quality is incredible for the price. Highly recommend.',
            rating: 5,
        },
        {
            name: 'Lisa Thompson',
            business: "Lisa's Cleaning Service",
            location: 'Miami, FL',
            text: 'The team was responsive and made changes quickly. My site looks like I paid ten times what I actually paid. Worth every penny.',
            rating: 5,
        },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden">
            <Header />

            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-blue-500/10 to-transparent rounded-full" />
            </div>

            <section className="relative z-10 min-h-screen flex items-center justify-center pt-[140px] pb-20">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 rounded-full text-sm mb-8 backdrop-blur-sm"
                        >
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <span className="text-slate-300">{t('hero.badge')}</span>
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                                {t('hero.title')}
                            </span>
                            <br />
                            <span className="text-blue-400">
                                {t('hero.titleHighlight')}
                            </span>
                        </h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-xl md:text-2xl text-slate-300 mb-4 max-w-2xl mx-auto"
                        >
                            {t('hero.subtitle')}
                        </motion.p>
                        <p className="text-lg text-blue-300 font-medium mb-12">{t('hero.fromPrice')}</p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <motion.a
                                href="#plans"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                className="group px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg shadow-2xl shadow-white/10 hover:shadow-white/20 transition-all flex items-center gap-2"
                            >
                                {t('hero.cta')}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </motion.a>
                            <motion.a
                                href="#examples"
                                whileHover={{ scale: 1.02 }}
                                className="px-8 py-4 bg-white/10 border border-white/20 rounded-xl font-medium text-lg hover:bg-white/20 transition-all flex items-center gap-2"
                            >
                                <Play className="w-5 h-5" />
                                {t('hero.ctaSecondary')}
                            </motion.a>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                            className="flex flex-wrap justify-center gap-8 mt-16"
                        >
                            {[
                                { value: '200+', label: 'Sites Delivered' },
                                { value: '4.9', label: 'Star Rating' },
                                { value: '5 Days', label: 'Avg. Delivery' },
                            ].map((stat, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                                    <div className="text-sm text-slate-400">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
                >
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                        <div className="w-2 h-3 bg-white/50 rounded-full mt-2 animate-bounce" />
                    </div>
                </motion.div>
            </section>

            <section className="relative z-10 py-20 border-y border-white/10 bg-white/5">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: 200, suffix: '+', label: 'Websites Built', icon: Globe },
                            { value: 98, suffix: '%', label: 'Client Satisfaction', icon: Award },
                            { value: 5, suffix: ' Days', label: 'Average Delivery', icon: Clock },
                            { value: 24, suffix: '/7', label: 'Support Available', icon: MessageCircle },
                        ].map((stat, i) => {
                            const StatIcon = stat.icon
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                        <StatIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-4xl font-bold mb-1">
                                        <AnimatedCounter target={stat.value} />
                                        {stat.suffix}
                                    </div>
                                    <div className="text-slate-400">{stat.label}</div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </section>

            <section className="relative z-10 py-24">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block px-4 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-sm mb-4">
                            {t('benefits.title')}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">{t('benefits.title')}</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">{t('hero.subtitle')}</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {benefits.map((b, i) => {
                            const BIcon = b.icon
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                    className="group p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-blue-400/50 hover:bg-white/[0.08] transition-all"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <BIcon className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{t(b.titleKey)}</h3>
                                    <p className="text-slate-400">{t(b.descKey)}</p>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </section>

            <ExplanationSection />

            <LaunchSteps />

            <TrustSealSection />

            <LaunchTestimonials testimonials={testimonials} />

            <section className="relative z-10 py-12 border-t border-white/10">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-wrap justify-center gap-8"
                    >
                        {[
                            { icon: Check, text: '200+ Sites Delivered' },
                            { icon: Star, text: '4.9/5 Average Rating' },
                            { icon: Clock, text: '5-Day Delivery' },
                            { icon: Shield, text: '100% Satisfaction' },
                        ].map((badge, i) => {
                            const BadgeIcon = badge.icon
                            return (
                                <div key={i} className="flex items-center gap-2 text-slate-400">
                                    <BadgeIcon className="w-5 h-5 text-green-400" />
                                    <span>{badge.text}</span>
                                </div>
                            )
                        })}
                    </motion.div>
                </div>
            </section>

            <section id="included" className="relative z-10 py-20 bg-white/5 border-y border-white/10">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{t('included.title')}</h2>
                        <p className="text-slate-400 max-w-xl mx-auto">{t('included.subtitle')}</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto"
                    >
                        {[
                            'hosting', 'ssl', 'seo', 'maintenance', 'support',
                            'mobile', 'security', 'backups', 'speed', 'content',
                        ].map((key) => (
                            <div
                                key={key}
                                className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 py-3 hover:border-white/20 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                                    <Check className="w-5 h-5 text-emerald-400" />
                                </div>
                                <span className="text-slate-200 text-sm font-medium">{t(`included.${key}`)}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            <section id="plans" className="relative z-10 py-24">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block px-4 py-1 bg-green-500/20 border border-green-400/30 rounded-full text-green-300 text-sm mb-4">
                            {t('plans.title')}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">{t('plans.title')}</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">{t('hero.subtitle')}</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {plans.map((plan, i) => (
                            <motion.div
                                key={plan.slug}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative rounded-2xl border p-6 flex flex-col ${plan.slug === 'business' ? 'bg-white/10 border-blue-400/50 ring-2 ring-blue-400/30' : 'bg-white/5 border-white/10'}`}
                            >
                                {plan.slug === 'business' && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                                        {t('plans.mostPopular')}
                                    </span>
                                )}
                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-1">
                                    <span className="text-4xl font-bold">${plan.price}</span>
                                    <span className="text-slate-400">{t('plans.perMonth')}</span>
                                </div>
                                <p className="text-xs text-slate-500 mb-6">{t('plans.contractTerm')}</p>
                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className="flex items-center gap-3 text-slate-300 text-sm">
                                            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleStartPlan(plan.slug)}
                                    disabled={isCheckingOut === plan.slug}
                                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${plan.slug === 'business' ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-white/10 border border-white/20 hover:bg-white/20'}`}
                                >
                                    {isCheckingOut === plan.slug ? (
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Rocket className="w-4 h-4" />
                                            {t('plans.selectPlan')}
                                        </>
                                    )}
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-10 text-center"
                    >
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-500/10 border border-green-400/30 rounded-xl">
                            <Shield className="w-5 h-5 text-green-400" />
                            <span className="text-green-300 font-medium">{t('guaranteeSection.title')}</span>
                        </div>
                        <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">{t('guaranteeSection.description')}</p>
                    </motion.div>
                </div>
            </section>

            <section className="relative z-10 py-24 bg-gradient-to-b from-transparent to-slate-900/50">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">{t('faq.title')}</h2>
                    </motion.div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {[
                            { q: t('faq.q1'), a: t('faq.a1') },
                            { q: t('faq.q2'), a: t('faq.a2') },
                            { q: t('faq.q3'), a: t('faq.a3') },
                            { q: t('faq.q4'), a: t('faq.a4') },
                            { q: t('faq.q5'), a: t('faq.a5') },
                        ].map((faq, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
                            >
                                <h3 className="font-bold text-lg mb-2">{faq.q}</h3>
                                <p className="text-slate-400">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative z-10 py-24">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto text-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 rounded-3xl p-12 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10" />
                        <div className="relative">
                            <h2 className="text-4xl md:text-5xl font-bold mb-4">{t('ctaFinal.title')}</h2>
                            <p className="text-xl text-slate-300 mb-8">
                                {t('ctaFinal.subtitle')}
                            </p>
                            <motion.a
                                href="#plans"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-flex items-center gap-3 bg-white text-slate-900 px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-white/10 hover:shadow-white/20 transition-all"
                            >
                                <Rocket className="w-5 h-5" />
                                {t('ctaFinal.cta')}
                            </motion.a>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
