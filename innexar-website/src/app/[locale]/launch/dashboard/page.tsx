'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import {
    CheckCircle2, Clock, Palette, Send, Eye, Rocket,
    MessageSquare, FileText, Calendar, ExternalLink, ArrowRight,
    Sparkles, Shield, Phone, Mail, AlertCircle, RefreshCw
} from 'lucide-react'
import { useTranslations } from 'next-intl'
// Header removed - using PortalHeader from layout

// Status icons mapping (labels will be translated inside component)
const statusIcons = {
    pending_payment: { icon: Clock, color: 'yellow', step: 0 },
    paid: { icon: CheckCircle2, color: 'blue', step: 1 },
    onboarding_pending: { icon: FileText, color: 'orange', step: 1 },
    building: { icon: Palette, color: 'purple', step: 2 },
    review: { icon: Eye, color: 'cyan', step: 3 },
    delivered: { icon: Rocket, color: 'green', step: 4 },
    cancelled: { icon: AlertCircle, color: 'red', step: -1 },
}

interface Order {
    id: number
    customer_name: string
    customer_email: string
    status: string
    total_price: number
    created_at: string
    expected_delivery_date: string | null
    site_url: string | null
    revisions_included: number
    revisions_used: number
    onboarding: {
        business_name: string
        primary_city: string
        state: string
        primary_color: string
        is_complete: boolean
    } | null
}

function DashboardContent() {
    const t = useTranslations('launch')
    const searchParams = useSearchParams()
    const orderId = searchParams.get('order_id')
    const email = searchParams.get('email')

    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Status labels with translations
    const getStatusLabel = (status: string) => {
        const labels: Record<string, { label: string; description: string }> = {
            pending_payment: { label: t('dashboard.statuses.pending'), description: t('dashboard.subtitle') },
            paid: { label: t('success.title'), description: t('success.message') },
            onboarding_pending: { label: t('onboarding.title'), description: t('onboarding.subtitle') },
            building: { label: t('dashboard.statuses.development'), description: t('dashboard.subtitle') },
            review: { label: t('dashboard.statuses.review'), description: t('dashboard.subtitle') },
            delivered: { label: t('dashboard.statuses.delivered'), description: t('dashboard.subtitle') },
            cancelled: { label: t('dashboard.statuses.pending'), description: t('dashboard.subtitle') },
        }
        return labels[status] || labels.building
    }

    // Timeline with translations
    const timelineSteps = [
        { step: 1, title: t('dashboard.timeline.payment'), desc: t('dashboard.timeline.onboarding') },
        { step: 2, title: t('dashboard.timeline.design'), desc: t('dashboard.timeline.development') },
        { step: 3, title: t('dashboard.timeline.review'), desc: t('dashboard.actions.requestChanges') },
        { step: 4, title: t('dashboard.timeline.launch'), desc: t('dashboard.statuses.delivered') },
    ]

    useEffect(() => {
        const fetchOrder = async () => {
            // First try URL params
            let currentOrderId = orderId
            let currentEmail = email

            // If no URL params, try localStorage (logged-in customer)
            if (!currentOrderId || !currentEmail) {
                const token = localStorage.getItem('customer_token')
                const storedEmail = localStorage.getItem('customer_email')

                if (token) {
                    try {
                        // Fetch customer's orders using token
                        const ordersResponse = await fetch(`/api/launch/customer/orders?token=${token}`)
                        if (ordersResponse.ok) {
                            const ordersData = await ordersResponse.json()
                            if (ordersData.orders && ordersData.orders.length > 0) {
                                setOrder(ordersData.orders[0])
                                setLoading(false)
                                return
                            }
                        }
                    } catch (err) {
                        console.error('Error fetching orders by token:', err)
                    }
                }

                // No valid token or orders found
                setError('Missing order information. Please check your email for the correct link.')
                setLoading(false)
                return
            }

            try {
                // In production, this would verify email matches order
                const response = await fetch(`/api/launch/order-status?order_id=${currentOrderId}&email=${encodeURIComponent(currentEmail)}`)
                if (response.ok) {
                    const data = await response.json()
                    setOrder(data)
                } else {
                    const errorData = await response.json().catch(() => ({}))
                    // Extract error message safely
                    const errorMsg = typeof errorData === 'string'
                        ? errorData
                        : errorData?.error || errorData?.detail || errorData?.message || 'Order not found. Please check your link or contact support.'
                    setError(errorMsg)
                }
            } catch (err: any) {
                const errorMsg = err?.message || (typeof err === 'string' ? err : 'Unable to load order. Please try again later.')
                setError(errorMsg)
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()
    }, [orderId, email])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <RefreshCw className="w-10 h-10 text-blue-400 mx-auto mb-4 animate-spin" />
                    <p className="text-slate-400">Loading your project...</p>
                </motion.div>
            </div>
        )
    }

    if (error || !order) {
        // Ensure error is always a string
        const errorMessage = typeof error === 'string'
            ? error
            : 'Unable to load project'

        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10"
                >
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Unable to Load Project</h1>
                    <p className="text-slate-400 mb-6">{errorMessage}</p>
                    <a
                        href="mailto:support@innexar.com"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 rounded-xl text-white font-medium hover:bg-blue-600 transition-colors"
                    >
                        <Mail className="w-5 h-5" />
                        Contact Support
                    </a>
                </motion.div>
            </div>
        )
    }

    const statusIcon = statusIcons[order.status as keyof typeof statusIcons] || statusIcons.building
    const statusLabels = getStatusLabel(order.status)
    const StatusIcon = statusIcon.icon
    const currentStep = statusIcon.step

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        })
    }

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; border: string; text: string }> = {
            yellow: { bg: 'bg-yellow-500/20', border: 'border-yellow-400/30', text: 'text-yellow-400' },
            blue: { bg: 'bg-blue-500/20', border: 'border-blue-400/30', text: 'text-blue-400' },
            orange: { bg: 'bg-orange-500/20', border: 'border-orange-400/30', text: 'text-orange-400' },
            purple: { bg: 'bg-purple-500/20', border: 'border-purple-400/30', text: 'text-purple-400' },
            cyan: { bg: 'bg-cyan-500/20', border: 'border-cyan-400/30', text: 'text-cyan-400' },
            green: { bg: 'bg-green-500/20', border: 'border-green-400/30', text: 'text-green-400' },
            red: { bg: 'bg-red-500/20', border: 'border-red-400/30', text: 'text-red-400' },
        }
        return colors[color] || colors.blue
    }

    const statusColors = getColorClasses(statusIcon.color)

    return (
        <div className="min-h-screen text-white">
            <div className="py-10 px-4 md:px-6 pt-8">
                {/* Animated Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                </div>

                <div className="max-w-4xl mx-auto relative z-10">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-10"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm mb-4">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <span className="text-slate-400">{t('dashboard.title')}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            {order.onboarding?.business_name || order.customer_name}
                        </h1>
                        <p className="text-slate-400">Order #{order.id} • {formatDate(order.created_at)}</p>
                    </motion.div>

                    {/* Status Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`${statusColors.bg} ${statusColors.border} border rounded-3xl p-8 mb-8`}
                    >
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className={`w-20 h-20 ${statusColors.bg} rounded-2xl flex items-center justify-center`}>
                                <StatusIcon className={`w-10 h-10 ${statusColors.text}`} />
                            </div>
                            <div className="text-center md:text-left flex-1">
                                <div className={`text-sm font-medium ${statusColors.text} mb-1`}>Current Status</div>
                                <h2 className="text-2xl font-bold text-white mb-2">{statusLabels.label}</h2>
                                <p className="text-slate-300">{statusLabels.description}</p>
                            </div>
                            {order.status === 'onboarding_pending' && (
                                <a
                                    href={`/launch/onboarding?order_id=${order.id}`}
                                    className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-100 transition-colors"
                                >
                                    Complete Onboarding
                                    <ArrowRight className="w-5 h-5" />
                                </a>
                            )}
                            {order.status === 'review' && order.site_url && (
                                <a
                                    href={order.site_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-100 transition-colors"
                                >
                                    View Preview
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </motion.div>

                    {/* Timeline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8"
                    >
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-400" />
                            {t('dashboard.timeline.title')}
                        </h3>
                        <div className="relative">
                            {timelineSteps.map((item, i) => {
                                const isComplete = currentStep > item.step
                                const isCurrent = currentStep === item.step
                                const isPending = currentStep < item.step

                                return (
                                    <div key={item.step} className="flex gap-4 mb-8 last:mb-0">
                                        {/* Step indicator */}
                                        <div className="relative flex flex-col items-center">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.3 + i * 0.1 }}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${isComplete
                                                    ? 'bg-green-500'
                                                    : isCurrent
                                                        ? 'bg-blue-500 ring-4 ring-blue-500/30'
                                                        : 'bg-white/10'
                                                    }`}
                                            >
                                                {isComplete ? (
                                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                                ) : (
                                                    <span className={`font-bold ${isPending ? 'text-slate-500' : 'text-white'}`}>
                                                        {item.step}
                                                    </span>
                                                )}
                                            </motion.div>
                                            {i < timelineSteps.length - 1 && (
                                                <div className={`w-0.5 h-full absolute top-10 ${isComplete ? 'bg-green-500' : 'bg-white/10'
                                                    }`} />
                                            )}
                                        </div>
                                        {/* Content */}
                                        <div className={`pt-2 ${isPending ? 'opacity-50' : ''}`}>
                                            <h4 className="font-semibold text-white">{item.title}</h4>
                                            <p className="text-sm text-slate-400">{item.desc}</p>
                                            {isCurrent && (
                                                <span className="inline-block mt-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs text-blue-300">
                                                    In Progress
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>

                    {/* Project Details Grid */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* Order Summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6"
                        >
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-400" />
                                Order Summary
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Package</span>
                                    <span className="font-medium">Professional Website</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Total Paid</span>
                                    <span className="font-bold text-green-400">${order.total_price}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Revisions</span>
                                    <span>{order.revisions_used} / {order.revisions_included} used</span>
                                </div>
                                {order.expected_delivery_date && (
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Expected Delivery</span>
                                        <span>{formatDate(order.expected_delivery_date)}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/5 border border-white/10 rounded-3xl p-6"
                        >
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-blue-400" />
                                Need Help?
                            </h3>
                            <div className="space-y-3">
                                <a
                                    href="mailto:support@innexar.com"
                                    className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-colors"
                                >
                                    <Mail className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <div className="font-medium">Email Support</div>
                                        <div className="text-xs text-slate-400">support@innexar.com</div>
                                    </div>
                                </a>
                                <a
                                    href="https://wa.me/1234567890"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-colors"
                                >
                                    <Phone className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <div className="font-medium">WhatsApp</div>
                                        <div className="text-xs text-slate-400">Quick response</div>
                                    </div>
                                </a>
                            </div>
                        </motion.div>
                    </div>

                    {/* Site Preview (when available) */}
                    {order.site_url && order.status === 'delivered' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-3xl p-8 text-center"
                        >
                            <Rocket className="w-12 h-12 text-green-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold mb-2">Your Website is Live!</h3>
                            <p className="text-slate-300 mb-6">Congratulations! Your professional website is now online.</p>
                            <a
                                href={order.site_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                            >
                                <ExternalLink className="w-5 h-5" />
                                Visit Your Website
                            </a>
                        </motion.div>
                    )}

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center mt-12 pt-8 border-t border-white/10"
                    >
                        <div className="flex items-center justify-center gap-2 text-slate-400 mb-4">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm">Your project is in good hands</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5 text-blue-400" />
                            <span className="font-bold">Innexar</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    )
}
