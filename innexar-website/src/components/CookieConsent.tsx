'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X, Settings, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'

type CookiePreferences = {
    essential: boolean
    analytics: boolean
    marketing: boolean
}

const COOKIE_CONSENT_KEY = 'innexar_cookie_consent'

export default function CookieConsent() {
    const t = useTranslations('cookies')
    const [isVisible, setIsVisible] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [preferences, setPreferences] = useState<CookiePreferences>({
        essential: true, // Always required
        analytics: false,
        marketing: false
    })

    useEffect(() => {
        // Check if user has already consented
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
        if (!consent) {
            // Show banner after short delay
            const timer = setTimeout(() => setIsVisible(true), 1500)
            return () => clearTimeout(timer)
        } else {
            // Load saved preferences
            try {
                const saved = JSON.parse(consent)
                setPreferences(saved)
                applyConsent(saved)
            } catch (e) {
                console.error('Error parsing cookie consent:', e)
            }
        }
    }, [])

    const applyConsent = (prefs: CookiePreferences) => {
        // Enable/disable analytics based on consent
        if (typeof window !== 'undefined') {
            (window as any).cookieConsent = prefs

            // Dispatch event for other scripts to listen
            window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: prefs }))
        }
    }

    const saveConsent = (prefs: CookiePreferences) => {
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs))
        setPreferences(prefs)
        applyConsent(prefs)
        setIsVisible(false)
    }

    const acceptAll = () => {
        saveConsent({ essential: true, analytics: true, marketing: true })
    }

    const acceptSelected = () => {
        saveConsent(preferences)
    }

    const rejectNonEssential = () => {
        saveConsent({ essential: true, analytics: false, marketing: false })
    }

    if (!isVisible) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
            >
                <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 pb-4">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                <Cookie className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {t('title')}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {t('description')}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* Settings Panel */}
                    <AnimatePresence>
                        {showSettings && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-gray-200 dark:border-slate-700"
                            >
                                <div className="p-6 space-y-4">
                                    {/* Essential */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">{t('essential')}</h4>
                                            <p className="text-sm text-gray-500">{t('essentialDesc')}</p>
                                        </div>
                                        <div className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                                            <span className="text-sm text-green-700 dark:text-green-400">{t('required')}</span>
                                        </div>
                                    </div>

                                    {/* Analytics */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">{t('analytics')}</h4>
                                            <p className="text-sm text-gray-500">{t('analyticsDesc')}</p>
                                        </div>
                                        <button
                                            onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                                            className={`w-12 h-6 rounded-full transition-colors ${preferences.analytics ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${preferences.analytics ? 'translate-x-6' : 'translate-x-0.5'
                                                }`} />
                                        </button>
                                    </div>

                                    {/* Marketing */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">{t('marketing')}</h4>
                                            <p className="text-sm text-gray-500">{t('marketingDesc')}</p>
                                        </div>
                                        <button
                                            onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                                            className={`w-12 h-6 rounded-full transition-colors ${preferences.marketing ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${preferences.marketing ? 'translate-x-6' : 'translate-x-0.5'
                                                }`} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Actions */}
                    <div className="p-6 pt-4 bg-gray-50 dark:bg-slate-800/50 flex flex-wrap gap-3 justify-end">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            {t('settings')}
                        </button>
                        <button
                            onClick={rejectNonEssential}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            {t('rejectAll')}
                        </button>
                        {showSettings ? (
                            <button
                                onClick={acceptSelected}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                <Check className="w-4 h-4" />
                                {t('savePreferences')}
                            </button>
                        ) : (
                            <button
                                onClick={acceptAll}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                {t('acceptAll')}
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
