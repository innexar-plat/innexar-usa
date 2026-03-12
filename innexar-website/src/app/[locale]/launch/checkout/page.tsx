'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import Header from '@/components/Header'

const API_WAAS_PRODUCTS = process.env.NEXT_PUBLIC_WORKSPACE_API_URL
    ? `${process.env.NEXT_PUBLIC_WORKSPACE_API_URL}/api/public/products/waas`
    : ''

const FALLBACK_PLANS: { slug: string; name: string; price: number; currency: string; features: string[] }[] = [
    {
        slug: 'starter', name: 'Starter', price: 129, currency: 'USD',
        features: ['Up to 5 pages', '1 revision per month', 'Email support', 'SSL & hosting included', 'Mobile responsive', 'Basic SEO setup', 'Contact form'],
    },
    {
        slug: 'business', name: 'Business', price: 199, currency: 'USD',
        features: ['Up to 10 pages', '3 revisions per month', 'Priority support', 'Advanced SEO optimization', 'Google Analytics setup', 'Blog section', 'Social media integration', 'Speed optimization'],
    },
    {
        slug: 'pro', name: 'Pro', price: 299, currency: 'USD',
        features: ['Up to 20 pages', 'Unlimited revisions (priority)', 'Dedicated account manager', 'Premium SEO & local SEO', 'Custom integrations', 'E-commerce ready', 'A/B testing & analytics', 'Monthly performance report'],
    },
]

type WaasPlan = { slug: string; name: string; price: number; currency: string; features: string[] }

function LaunchCheckoutContent() {
    const t = useTranslations('launch')
    const tCheckout = useTranslations('launch.checkout')
    const tPage = useTranslations('launch.checkoutPage')
    const locale = useLocale()
    const router = useRouter()
    const searchParams = useSearchParams()
    const planSlug = (searchParams.get('plan') || '').trim().toLowerCase()

    const [plan, setPlan] = useState<WaasPlan | null>(null)
    const [plansLoaded, setPlansLoaded] = useState(false)
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [companyName, setCompanyName] = useState('')
    const [couponCode, setCouponCode] = useState('')
    const [agreeTerms, setAgreeTerms] = useState(false)

    const formatPhone = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 10)
        if (digits.length <= 3) return digits
        if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(formatPhone(e.target.value))
    }

    const validSlugs = ['starter', 'business', 'pro']
    const slugValid = validSlugs.includes(planSlug)

    useEffect(() => {
        if (!slugValid && planSlug !== '') {
            router.replace('/launch')
            return
        }
    }, [slugValid, planSlug, router])

    useEffect(() => {
        if (!slugValid) return
        if (API_WAAS_PRODUCTS) {
            fetch(API_WAAS_PRODUCTS)
                .then(res => res.ok ? res.json() : null)
                .then((data: { slug: string; name: string; price: number; currency: string; features?: string[] }[] | null) => {
                    if (Array.isArray(data) && data.length > 0) {
                        const found = data.find(p => (p.slug || '').toLowerCase() === planSlug)
                        if (found) {
                            setPlan({
                                slug: found.slug,
                                name: found.name,
                                price: found.price,
                                currency: found.currency || 'USD',
                                features: found.features ?? [],
                            })
                        } else {
                            setPlan(FALLBACK_PLANS.find(p => p.slug === planSlug) ?? null)
                        }
                    } else {
                        setPlan(FALLBACK_PLANS.find(p => p.slug === planSlug) ?? null)
                    }
                })
                .catch(() => setPlan(FALLBACK_PLANS.find(p => p.slug === planSlug) ?? null))
                .finally(() => setPlansLoaded(true))
        } else {
            setPlan(FALLBACK_PLANS.find(p => p.slug === planSlug) ?? null)
            setPlansLoaded(true)
        }
    }, [planSlug, slugValid])

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault()
            setError(null)
            const trimmedEmail = email.trim()
            if (!trimmedEmail) {
                setError(tCheckout('error'))
                return
            }
            if (!agreeTerms) {
                setError(tPage('contractRequired'))
                return
            }
            setSubmitting(true)
            try {
                const res = await fetch('/api/waas/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        plan_slug: planSlug,
                        customer_email: trimmedEmail,
                        customer_name: name.trim() || undefined,
                        customer_phone: phone.replace(/\D/g, '').trim() || undefined,
                        company_name: companyName.trim() || undefined,
                        coupon_code: couponCode.trim() || undefined,
                        locale,
                    }),
                })
                const data = await res.json().catch(() => ({}))
                if (!res.ok) {
                    setError((data.error as string) ?? tCheckout('error'))
                    setSubmitting(false)
                    return
                }
                const paymentUrl = data.payment_url as string | undefined
                if (paymentUrl) {
                    window.location.href = paymentUrl
                    return
                }
                setError(tCheckout('error'))
            } catch {
                setError(tCheckout('error'))
            } finally {
                setSubmitting(false)
            }
        },
        [email, name, phone, companyName, couponCode, agreeTerms, planSlug, locale, tCheckout, tPage]
    )

    if (!slugValid) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
                <Header />
                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const steps = [
        { label: tPage('stepInfo'), active: true },
        { label: tPage('stepPayment'), active: false },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
            <Header />
            <div className="relative z-10 pt-[120px] pb-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <button
                            type="button"
                            onClick={() => router.push('/launch')}
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {tPage('backToPlans')}
                        </button>
                    </motion.div>

                    {/* Progress Steps */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.02 }}
                        className="flex items-center justify-center gap-4 mb-8"
                    >
                        {steps.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step.active ? 'bg-blue-500 text-white' : 'bg-white/10 text-slate-500'}`}>
                                    {idx + 1}
                                </div>
                                <span className={`text-sm font-medium ${step.active ? 'text-white' : 'text-slate-500'}`}>{step.label}</span>
                                {idx < steps.length - 1 && <div className="w-12 h-px bg-white/20 mx-2" />}
                            </div>
                        ))}
                    </motion.div>

                    <div className="grid md:grid-cols-5 gap-8">
                        {/* Form - Left Side */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="md:col-span-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 md:p-8"
                        >
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">
                                {tPage('title')}
                            </h1>

                            {!plansLoaded || !plan ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="checkout-email" className="mb-1 block text-sm font-medium text-slate-300">
                                            {tCheckout('email')} <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            id="checkout-email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder={tCheckout('emailPlaceholder')}
                                            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                            disabled={submitting}
                                            autoComplete="email"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="checkout-name" className="mb-1 block text-sm font-medium text-slate-300">
                                            {tCheckout('name')}
                                        </label>
                                        <input
                                            id="checkout-name"
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder={tCheckout('namePlaceholder')}
                                            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                            disabled={submitting}
                                            autoComplete="name"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="checkout-company" className="mb-1 block text-sm font-medium text-slate-300">
                                            {tPage('companyName')}
                                        </label>
                                        <input
                                            id="checkout-company"
                                            type="text"
                                            value={companyName}
                                            onChange={e => setCompanyName(e.target.value)}
                                            placeholder={tPage('companyPlaceholder')}
                                            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                            disabled={submitting}
                                            autoComplete="organization"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="checkout-phone" className="mb-1 block text-sm font-medium text-slate-300">
                                            {tCheckout('phone')}
                                        </label>
                                        <input
                                            id="checkout-phone"
                                            type="tel"
                                            value={phone}
                                            onChange={handlePhoneChange}
                                            placeholder="(555) 123-4567"
                                            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                            disabled={submitting}
                                            autoComplete="tel"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="checkout-coupon" className="mb-1 block text-sm font-medium text-slate-300">
                                            {tPage('couponCode')}
                                        </label>
                                        <input
                                            id="checkout-coupon"
                                            type="text"
                                            value={couponCode}
                                            onChange={e => setCouponCode(e.target.value)}
                                            placeholder={tPage('couponPlaceholder')}
                                            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                            disabled={submitting}
                                            autoComplete="off"
                                        />
                                    </div>

                                    {/* Contract Agreement */}
                                    <div className="pt-2 pb-1">
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={agreeTerms}
                                                onChange={e => setAgreeTerms(e.target.checked)}
                                                className="mt-1 w-5 h-5 rounded border-white/30 bg-white/5 text-blue-500 focus:ring-blue-400 focus:ring-offset-0 cursor-pointer"
                                                disabled={submitting}
                                            />
                                            <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
                                                {tPage('contractAgreement')}{' '}
                                                <a href={`/${locale}/terms-of-service`} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">
                                                    {tPage('termsLink')}
                                                </a>
                                            </span>
                                        </label>
                                    </div>

                                    {error && (
                                        <p className="text-sm text-red-400" role="alert">
                                            {error}
                                        </p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={submitting || !agreeTerms}
                                        className="w-full rounded-xl bg-white py-3.5 font-bold text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                {tCheckout('loading')}
                                            </>
                                        ) : (
                                            tPage('continueToPayment')
                                        )}
                                    </button>

                                    {/* Security badges */}
                                    <div className="flex items-center justify-center gap-4 pt-2 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            {tPage('securitySSL')}
                                        </span>
                                        <span>•</span>
                                        <span>{tPage('securityStripe')}</span>
                                    </div>
                                </form>
                            )}
                        </motion.div>

                        {/* Plan Summary - Right Side */}
                        {plan && plansLoaded && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="md:col-span-2"
                            >
                                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 sticky top-32">
                                    <p className="text-sm text-slate-400 mb-1">{tPage('yourPlan')}</p>
                                    <p className="text-xl font-bold text-white">{plan.name}</p>
                                    <p className="text-3xl font-bold text-blue-400 mt-1">
                                        ${plan.price}<span className="text-base font-normal text-slate-400">/mo</span>
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">{t('plans.contractTerm')}</p>

                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <p className="text-sm text-slate-400 mb-2">{tPage('planBenefits')}</p>
                                        <ul className="space-y-2">
                                            {plan.features.map((f, i) => (
                                                <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                                                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <p className="text-xs text-slate-500">{tPage('contractTerms')}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function LaunchCheckoutPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
            }
        >
            <LaunchCheckoutContent />
        </Suspense>
    )
}
