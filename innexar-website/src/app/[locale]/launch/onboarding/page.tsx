'use client'

import { useState, useEffect, Suspense, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import confetti from 'canvas-confetti'
import {
    Building2, MapPin, Briefcase, Target, Palette, Clock, Star,
    Phone, Mail, Globe, Check, ChevronRight, ChevronLeft, Rocket,
    Plus, X, Facebook, Instagram, Linkedin, Youtube, MessageCircle,
    ArrowRight, Sparkles, Users, FileText, Image, HelpCircle, DollarSign,
    Utensils, Scale, Stethoscope, Home, Wrench, Zap, TreeDeciduous, Sparkle,
    Send, Calendar, LayoutDashboard, PartyPopper, Loader2, AlertCircle, LogIn, FileSignature, Upload, File
} from 'lucide-react'
import { CONTRACT_TEMPLATES } from '@/lib/contracts'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { MetaPixel } from '@/lib/meta-pixel'
import Header from '@/components/Header'

// ============ CONFIGURATION ============
const TOTAL_STEPS = 9

// Steps, niches, pages etc. will be defined inside component to use translations

// Icons mapping for niches (labels will be translated inside component)
const nicheIcons = {
    restaurant: Utensils,
    lawyer: Scale,
    dentist: Stethoscope,
    real_estate: Home,
    plumber: Wrench,
    electrician: Zap,
    landscaping: TreeDeciduous,
    cleaning: Sparkle,
    general: Briefcase,
    other: Building2,
}

// Page options (labels will be translated)
const pageOptions = ['home', 'about', 'services', 'contact', 'gallery', 'testimonials', 'faq', 'pricing', 'team', 'blog']

// Objective icons
const objectiveIcons = {
    generate_leads: Phone,
    show_portfolio: Image,
    build_trust: Users,
    inform: FileText,
}

// CTA icons
const ctaIcons = {
    call: Phone,
    whatsapp: MessageCircle,
    form: FileText,
    book_online: Calendar,
}

const colorPalettes = [
    { id: 'blue', primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6', name: 'Professional Blue' },
    { id: 'green', primary: '#059669', secondary: '#047857', accent: '#10b981', name: 'Trust Green' },
    { id: 'purple', primary: '#7c3aed', secondary: '#6d28d9', accent: '#8b5cf6', name: 'Creative Purple' },
    { id: 'red', primary: '#dc2626', secondary: '#b91c1c', accent: '#ef4444', name: 'Bold Red' },
    { id: 'orange', primary: '#ea580c', secondary: '#c2410c', accent: '#f97316', name: 'Energy Orange' },
    { id: 'teal', primary: '#0d9488', secondary: '#0f766e', accent: '#14b8a6', name: 'Fresh Teal' },
    { id: 'slate', primary: '#475569', secondary: '#334155', accent: '#64748b', name: 'Modern Slate' },
    { id: 'custom', primary: '', secondary: '', accent: '', name: 'Custom Colors' },
]

const usStates = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
]

interface Testimonial {
    name: string
    text: string
    role?: string
}

interface FormData {
    businessName: string
    businessEmail: string
    businessPhone: string
    hasWhatsapp: boolean
    businessAddress: string
    niche: string
    customNiche: string
    primaryCity: string
    state: string
    serviceAreas: string[]
    services: string[]
    primaryService: string
    siteObjective: string
    siteDescription: string
    selectedPages: string[]
    tone: string
    primaryCta: string
    ctaText: string
    colorPalette: string
    primaryColor: string
    secondaryColor: string
    accentColor: string
    referenceSites: string[]
    designNotes: string
    businessHours: Record<string, string>
    socialFacebook: string
    socialInstagram: string
    socialLinkedin: string
    socialYoutube: string
    testimonials: Testimonial[]
    googleReviewsLink: string
    aboutOwner: string
    yearsInBusiness: string
    desiredDomain: string
    hasExistingDomain: boolean
    existingDomain: string
    domainToPurchase: string
    domainPurchased: boolean
    password?: string
    confirmPassword?: string
    orderId?: string
    realDbId?: number // Added for internal API calls requiring integer ID
    uploadedFiles: { name: string, url: string, type: string }[]
}

function OnboardingContent() {
    const t = useTranslations('launch')
    const locale = useLocale()
    const searchParams = useSearchParams()
    const orderId = searchParams.get('order_id')
    const router = useRouter()

    // Translated configuration arrays
    const steps = [
        { id: 1, title: t('onboarding.steps.step1'), icon: Building2, description: t('onboarding.steps.step1Desc') },
        { id: 2, title: t('onboarding.steps.step2'), icon: MapPin, description: t('onboarding.steps.step2Desc') },
        { id: 3, title: t('onboarding.steps.step3'), icon: Briefcase, description: t('onboarding.steps.step3Desc') },
        { id: 4, title: t('onboarding.steps.step4'), icon: Target, description: t('onboarding.steps.step4Desc') },
        { id: 5, title: t('onboarding.steps.step5'), icon: Palette, description: t('onboarding.steps.step5Desc') },
        { id: 6, title: t('onboarding.steps.step6'), icon: Clock, description: t('onboarding.steps.step6Desc') },
        { id: 7, title: t('onboarding.steps.step7'), icon: Star, description: t('onboarding.steps.step7Desc') },
        { id: 8, title: t('onboarding.steps.step8'), icon: FileSignature, description: t('onboarding.steps.step8Desc') },
        { id: 9, title: t('onboarding.steps.step9'), icon: Upload, description: t('onboarding.steps.step9Desc') },
    ]

    const objectives = [
        { id: 'generate_leads', label: t('onboarding.form.objectives.leads'), desc: t('onboarding.form.objectives.leadsDesc'), icon: objectiveIcons.generate_leads },
        { id: 'show_portfolio', label: t('onboarding.form.objectives.info'), desc: t('onboarding.form.objectives.infoDesc'), icon: objectiveIcons.show_portfolio },
        { id: 'build_trust', label: t('onboarding.form.objectives.credibility'), desc: t('onboarding.form.objectives.credibilityDesc'), icon: objectiveIcons.build_trust },
        { id: 'inform', label: t('onboarding.form.objectives.bookings'), desc: t('onboarding.form.objectives.bookingsDesc'), icon: objectiveIcons.inform },
    ]

    // Translated niches
    const niches = [
        { id: 'restaurant', label: t('onboarding.form.niches.restaurant'), icon: nicheIcons.restaurant },
        { id: 'lawyer', label: t('onboarding.form.niches.lawyer'), icon: nicheIcons.lawyer },
        { id: 'dentist', label: t('onboarding.form.niches.dentist'), icon: nicheIcons.dentist },
        { id: 'real_estate', label: t('onboarding.form.niches.realEstate'), icon: nicheIcons.real_estate },
        { id: 'plumber', label: t('onboarding.form.niches.plumber'), icon: nicheIcons.plumber },
        { id: 'electrician', label: t('onboarding.form.niches.electrician'), icon: nicheIcons.electrician },
        { id: 'landscaping', label: t('onboarding.form.niches.landscaping'), icon: nicheIcons.landscaping },
        { id: 'cleaning', label: t('onboarding.form.niches.cleaning'), icon: nicheIcons.cleaning },
        { id: 'general', label: t('onboarding.form.niches.general'), icon: nicheIcons.general },
        { id: 'other', label: t('onboarding.form.niches.other'), icon: nicheIcons.other },
    ]

    // Translated pages
    const pages = [
        { id: 'home', label: t('onboarding.form.pages.home'), required: true },
        { id: 'about', label: t('onboarding.form.pages.about') },
        { id: 'services', label: t('onboarding.form.pages.services') },
        { id: 'contact', label: t('onboarding.form.pages.contact'), required: true },
        { id: 'gallery', label: t('onboarding.form.pages.gallery') },
        { id: 'testimonials', label: t('onboarding.form.pages.testimonials') },
        { id: 'faq', label: t('onboarding.form.pages.faq') },
        { id: 'pricing', label: t('onboarding.form.pages.pricing') },
        { id: 'team', label: t('onboarding.form.pages.team') },
        { id: 'blog', label: t('onboarding.form.pages.blog') },
    ]

    // Translated tones
    const tones = [
        { id: 'professional', label: t('onboarding.form.tones.professional'), desc: t('onboarding.form.tones.professionalDesc') },
        { id: 'friendly', label: t('onboarding.form.tones.friendly'), desc: t('onboarding.form.tones.friendlyDesc') },
        { id: 'premium', label: t('onboarding.form.tones.premium'), desc: t('onboarding.form.tones.premiumDesc') },
    ]

    // Translated CTA options
    const ctaOptions = [
        { id: 'call', label: t('onboarding.form.cta.call'), icon: ctaIcons.call },
        { id: 'whatsapp', label: t('onboarding.form.cta.whatsapp'), icon: ctaIcons.whatsapp },
        { id: 'form', label: t('onboarding.form.cta.form'), icon: ctaIcons.form },
        { id: 'book_online', label: t('onboarding.form.cta.bookOnline'), icon: ctaIcons.book_online },
    ]

    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isComplete, setIsComplete] = useState(false)
    const [serviceInput, setServiceInput] = useState('')
    const [referenceInput, setReferenceInput] = useState('')
    const [serviceAreaInput, setServiceAreaInput] = useState('')
    const [isSigned, setIsSigned] = useState(false)
    const [signatureName, setSignatureName] = useState('')
    const [orderAddons, setOrderAddons] = useState<any[]>([])
    const [allowedPages, setAllowedPages] = useState(5) // Default 5 pages

    const [formData, setFormData] = useState<FormData>({
        businessName: '',
        businessEmail: '',
        businessPhone: '',
        hasWhatsapp: false,
        businessAddress: '',
        niche: '',
        customNiche: '',
        primaryCity: '',
        state: '',
        serviceAreas: [],
        services: [],
        primaryService: '',
        siteObjective: 'generate_leads',
        siteDescription: '',
        selectedPages: ['home', 'about', 'services', 'contact'],
        tone: 'professional',
        primaryCta: 'call',
        ctaText: '',
        colorPalette: 'blue',
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
        accentColor: '#3b82f6',
        referenceSites: [],
        designNotes: '',
        businessHours: {
            mon: '9:00 AM - 5:00 PM',
            tue: '9:00 AM - 5:00 PM',
            wed: '9:00 AM - 5:00 PM',
            thu: '9:00 AM - 5:00 PM',
            fri: '9:00 AM - 5:00 PM',
            sat: 'Closed',
            sun: 'Closed',
        },
        socialFacebook: '',
        socialInstagram: '',
        socialLinkedin: '',
        socialYoutube: '',
        testimonials: [],
        googleReviewsLink: '',
        aboutOwner: '',
        yearsInBusiness: '',
        desiredDomain: '',
        hasExistingDomain: false,
        existingDomain: '',
        domainToPurchase: '',
        domainPurchased: false,
        password: '',
        confirmPassword: '',
        orderId: orderId || '',
        realDbId: undefined,
        uploadedFiles: [],
    })

    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        const files = Array.from(e.target.files)
        // Check size (e.g. 5MB limit) or type if needed

        setIsUploading(true)
        const uploaded = []

        try {
            for (const file of files) {
                const formDataUpload = new FormData()
                formDataUpload.append('file', file)
                formDataUpload.append('orderId', formData.orderId || orderId || 'draft')

                const response = await fetch('/api/launch/upload', {
                    method: 'POST',
                    body: formDataUpload
                })

                if (response.ok) {
                    const data = await response.json()
                    uploaded.push({
                        name: data.name,
                        url: data.url,
                        type: file.type.startsWith('image/') ? 'image' : 'doc'
                    })
                }
            }

            if (uploaded.length > 0) {
                updateField('uploadedFiles', [...formData.uploadedFiles, ...uploaded])
            }
        } catch (error) {
            console.error('Upload failed:', error)
            alert(t('onboarding.form.fileUpload.error'))
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const removeFile = (index: number) => {
        const newFiles = [...formData.uploadedFiles]
        newFiles.splice(index, 1)
        updateField('uploadedFiles', newFiles)
    }

    const [newTestimonial, setNewTestimonial] = useState<Testimonial>({ name: '', text: '', role: '' })

    // Email verification state
    const [isCheckingEmail, setIsCheckingEmail] = useState(false)
    const [emailExists, setEmailExists] = useState(false)
    const [showLoginModal, setShowLoginModal] = useState(false)

    // Domain verification state
    const [isCheckingDomain, setIsCheckingDomain] = useState(false)
    const [isPurchasingDomain, setIsPurchasingDomain] = useState(false)
    const [domainCheckAbortController, setDomainCheckAbortController] = useState<AbortController | null>(null)
    const [domainCheckResult, setDomainCheckResult] = useState<{
        available?: boolean
        price?: number
        is_free?: boolean
        error?: string
        suggestions?: Array<{
            domain: string
            price: number
            is_free: boolean
            available: boolean
        }>
    } | null>(null)

    const cancelDomainCheck = () => {
        if (domainCheckAbortController) {
            domainCheckAbortController.abort()
            setDomainCheckAbortController(null)
        }
        setIsCheckingDomain(false)
        setDomainCheckResult(null)
    }

    const hasTrackedLead = useRef(false)
    const hasLoadedFromStorage = useRef(false)

    // Storage key based on orderId
    const storageKey = orderId ? `onboarding_${orderId}` : 'onboarding_draft'

    // Load saved progress from localStorage on mount
    useEffect(() => {
        if (hasLoadedFromStorage.current) return
        hasLoadedFromStorage.current = true

        try {
            const saved = localStorage.getItem(storageKey)
            if (saved) {
                const { formData: savedFormData, currentStep: savedStep } = JSON.parse(saved)
                if (savedFormData) {
                    setFormData(prev => ({ ...prev, ...savedFormData }))
                }
                if (savedStep && savedStep > 0 && savedStep <= TOTAL_STEPS) {
                    setCurrentStep(savedStep)
                }
                console.log('Restored onboarding progress from step', savedStep)
            }
        } catch (error) {
            console.error('Error loading saved progress:', error)
        }
    }, [storageKey])

    // Save progress to localStorage whenever formData or currentStep changes
    useEffect(() => {
        if (!hasLoadedFromStorage.current) return // Don't save during initial load

        try {
            const dataToSave = {
                formData,
                currentStep,
                savedAt: new Date().toISOString(),
            }
            localStorage.setItem(storageKey, JSON.stringify(dataToSave))
        } catch (error) {
            console.error('Error saving progress:', error)
        }
    }, [formData, currentStep, storageKey])

    useEffect(() => {
        if (orderId && orderId !== formData.orderId) {
            updateField('orderId', orderId)
        }
    }, [orderId, formData.orderId])

    useEffect(() => {
        const finalOrderId = orderId || formData.orderId
        if (!finalOrderId) return

        const fetchOrderDetails = async () => {
            try {
                const response = await fetch(`/api/launch/session-order?session_id=${finalOrderId}`)
                if (response.ok) {
                    const data = await response.json()
                    // Capture realDbId if available
                    if (data.realDbId) {
                        updateField('realDbId', data.realDbId)
                    }
                    if (data.addons) {
                        setOrderAddons(data.addons)
                        // Calculate limit: 5 base + 1 for each 'extra-page' addon
                        const extraPages = data.addons.filter((a: any) =>
                            (a.addon?.slug === 'extra-page' || a.slug === 'extra-page')
                        ).length
                        setAllowedPages(5 + extraPages)
                    }
                }
            } catch (error) {
                console.error('Error fetching order addons:', error)
            }
        }

        fetchOrderDetails()
    }, [orderId, formData.orderId])

    // Check if onboarding is already completed in the backend
    useEffect(() => {
        const finalOrderId = orderId || formData.orderId
        if (!finalOrderId) return

        const checkOnboardingStatus = async () => {
            try {
                const response = await fetch(`/api/launch/onboarding?order_id=${finalOrderId}`)
                if (response.ok) {
                    const data = await response.json()
                    if (data.is_complete) {
                        localStorage.removeItem(storageKey)
                        const email = formData.businessEmail || ''
                        router.push(`/launch/dashboard?order_id=${finalOrderId}&email=${encodeURIComponent(email)}`)
                    }
                }
            } catch (error) {
                console.error('[Onboarding] Error checking onboarding status:', error)
            }
        }

        checkOnboardingStatus()
    }, [orderId, formData.orderId, storageKey, router, formData.businessEmail])

    // Check if contract is already signed
    useEffect(() => {
        // We need realDbId to check status correctly if the API expects DB ID
        // Use realDbId if available, otherwise skip (we'll check after fetchOrderDetails populates it)
        const checkId = formData.realDbId
        if (!checkId) return

        const checkContractStatus = async () => {
            try {
                const response = await fetch(`/api/launch/sign-contract?order_id=${checkId}`)
                if (response.ok) {
                    const data = await response.json()
                    if (data.signed) {
                        setIsSigned(true)
                        if (data.signed_name) {
                            setSignatureName(data.signed_name)
                        }
                    }
                }
            } catch (error) {
                console.error('Error checking contract status:', error)
            }
        }

        checkContractStatus()
    }, [orderId, formData.orderId, formData.realDbId])

    // Track Lead event on page load
    useEffect(() => {
        if (!hasTrackedLead.current) {
            hasTrackedLead.current = true
            MetaPixel.lead({
                content_name: 'Site Onboarding Started',
                content_category: 'Website Services',
            })
        }
    }, [])

    const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Reset email exists error when email changes
        if (field === 'businessEmail') {
            setEmailExists(false)
        }
    }

    const checkEmail = async () => {
        if (!formData.businessEmail || !formData.businessEmail.includes('@')) return

        setIsCheckingEmail(true)
        try {
            const response = await fetch(`/api/launch/check-email?email=${encodeURIComponent(formData.businessEmail)}`)
            const data = await response.json()

            if (data.exists) {
                setEmailExists(true)
                setShowLoginModal(true)
            } else {
                setEmailExists(false)
            }
        } catch (error) {
            console.error('Error checking email:', error)
        } finally {
            setIsCheckingEmail(false)
        }
    }

    const checkDomain = async () => {
        if (!formData.domainToPurchase || !formData.domainToPurchase.trim()) {
            setDomainCheckResult(null)
            return
        }

        setIsCheckingDomain(true)
        setDomainCheckResult(null)

        // Create abort controller for cancellation (must be outside try to use in catch)
        const controller = new AbortController()
        setDomainCheckAbortController(controller)

        let timeoutId: NodeJS.Timeout | null = null
        let isTimeout = false

        try {
            // Set timeout to abort request if it takes too long
            // Increased to 50s to match Next.js API route (45s) + margin
            timeoutId = setTimeout(() => {
                if (!controller.signal.aborted) {
                    isTimeout = true
                    controller.abort()
                }
            }, 50000) // 50 segundos timeout

            const response = await fetch('/api/launch/check-domain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: formData.domainToPurchase.trim() }),
                signal: controller.signal
            })

            if (timeoutId) {
                clearTimeout(timeoutId)
                timeoutId = null
            }
            // Only clear if this is still the current controller
            if (domainCheckAbortController === controller) {
                setDomainCheckAbortController(null)
            }

            // Parse response JSON
            let data
            try {
                data = await response.json()
            } catch (parseError) {
                const errorText = await response.text()
                setDomainCheckResult({ error: errorText || t('onboarding.form.domainCheckError') })
                setIsCheckingDomain(false)
                return
            }

            // Handle non-ok responses
            if (!response.ok) {
                const errorMsg = data.result?.error || data.error || data.details || t('onboarding.form.domainCheckError')
                setDomainCheckResult({ error: errorMsg })
                setIsCheckingDomain(false)
                return
            }

            // Handle both success and error responses
            // Check if there's an error first
            if (data.success === false || data.error) {
                const errorMsg = data.result?.error || data.error || data.details || t('onboarding.form.domainCheckError')
                setDomainCheckResult({ error: errorMsg })
            } else if (data.result) {
                // Success case - check if result has error
                if (data.result.error) {
                    // Start of Change: Preserve suggestions even if there is an error
                    setDomainCheckResult({
                        error: data.result.error,
                        suggestions: data.result.suggestions
                    })
                    // End of Change
                } else {
                    setDomainCheckResult(data.result)
                }
            } else {
                // Unexpected format
                setDomainCheckResult({ error: data.error || t('onboarding.form.domainCheckError') })
            }
        } catch (error: any) {
            if (timeoutId) {
                clearTimeout(timeoutId)
                timeoutId = null
            }

            // Don't log AbortError to console (it's expected for timeouts/cancellations)
            if (error.name !== 'AbortError') {
                console.error('Error checking domain:', error)
            }

            // Handle abort/timeout errors
            if (error.name === 'AbortError') {
                if (isTimeout) {
                    // Timeout - show user-friendly message
                    setDomainCheckResult({ error: t('onboarding.form.domainCheckError') + ' (Timeout - verifique sua conexão)' })
                } else {
                    // User cancelled - don't show error
                    setIsCheckingDomain(false)
                    if (domainCheckAbortController === controller) {
                        setDomainCheckAbortController(null)
                    }
                    return
                }
            } else {
                // Other errors
                let errorMessage = t('onboarding.form.domainCheckError')
                if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
                    errorMessage = t('onboarding.form.domainCheckError') + ' (Timeout - verifique sua conexão)'
                } else if (error.message) {
                    errorMessage = error.message
                }
                setDomainCheckResult({ error: errorMessage })
            }
        } finally {
            // Always reset loading state, even if there was an error
            setIsCheckingDomain(false)
            // Only clear if this is still the current controller
            if (domainCheckAbortController === controller) {
                setDomainCheckAbortController(null)
            }
        }
    }

    const purchaseDomain = async () => {
        if (!formData.domainToPurchase || !formData.domainToPurchase.trim() || !orderId) {
            return
        }

        if (!domainCheckResult?.available) {
            alert(t('onboarding.form.domainNotAvailable'))
            return
        }

        setIsPurchasingDomain(true)
        try {
            const response = await fetch('/api/launch/purchase-domain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    domain: formData.domainToPurchase.trim(),
                    order_id: orderId,
                    duration_years: 1
                }),
            })
            const data = await response.json()

            if (data.success) {
                updateField('domainPurchased', true)
                updateField('desiredDomain', formData.domainToPurchase.trim())
                alert(t('onboarding.form.domainPurchased', { domain: formData.domainToPurchase.trim() }))
            } else {
                alert(data.error || t('onboarding.form.domainPurchaseError'))
            }
        } catch (error) {
            console.error('Error purchasing domain:', error)
            alert(t('onboarding.form.domainPurchaseError'))
        } finally {
            setIsPurchasingDomain(false)
        }
    }

    const selectColorPalette = (paletteId: string) => {
        const palette = colorPalettes.find(p => p.id === paletteId)
        if (palette && palette.id !== 'custom') {
            updateField('colorPalette', paletteId)
            updateField('primaryColor', palette.primary)
            updateField('secondaryColor', palette.secondary)
            updateField('accentColor', palette.accent)
        } else {
            updateField('colorPalette', 'custom')
        }
    }

    const addService = () => {
        if (serviceInput.trim() && formData.services.length < 15) {
            const newService = serviceInput.trim()
            const newServices = [...formData.services, newService]
            updateField('services', newServices)
            // Auto-select first service as primary if none selected
            if (!formData.primaryService) {
                updateField('primaryService', newService)
            }
            setServiceInput('')
        }
    }

    const removeService = (index: number) => {
        const newServices = formData.services.filter((_, i) => i !== index)
        updateField('services', newServices)
        if (formData.primaryService === formData.services[index]) {
            updateField('primaryService', newServices[0] || '')
        }
    }

    const addServiceArea = () => {
        if (serviceAreaInput.trim() && formData.serviceAreas.length < 10) {
            updateField('serviceAreas', [...formData.serviceAreas, serviceAreaInput.trim()])
            setServiceAreaInput('')
        }
    }

    const addReference = () => {
        if (referenceInput.trim() && formData.referenceSites.length < 5) {
            updateField('referenceSites', [...formData.referenceSites, referenceInput.trim()])
            setReferenceInput('')
        }
    }

    const addTestimonial = () => {
        if (newTestimonial.name && newTestimonial.text && formData.testimonials.length < 10) {
            updateField('testimonials', [...formData.testimonials, { ...newTestimonial }])
            setNewTestimonial({ name: '', text: '', role: '' })
        }
    }

    const togglePage = (pageId: string) => {
        const page = pages.find(p => p.id === pageId)
        if (page?.required) return

        if (formData.selectedPages.includes(pageId)) {
            updateField('selectedPages', formData.selectedPages.filter(p => p !== pageId))
        } else {
            // Check limit
            if (formData.selectedPages.length >= allowedPages) {
                alert(`You have reached the limit of ${allowedPages} pages for your package. Delete a page or add "Extra Page" to your order.`)
                return
            }
            updateField('selectedPages', [...formData.selectedPages, pageId])
        }
    }

    const canProceed = () => {
        switch (currentStep) {
            case 1: return formData.businessName && formData.businessEmail && formData.businessPhone &&
                !emailExists && !isCheckingEmail &&
                formData.password && formData.password.length >= 8 &&
                formData.password === formData.confirmPassword
            case 2: return formData.niche && formData.primaryCity && formData.state && (formData.niche !== 'other' || formData.customNiche)
            case 3: return formData.services.length > 0 && formData.primaryService
            case 4: return formData.siteObjective && formData.selectedPages.length >= 2
            case 5: return formData.primaryColor
            case 6: return true
            case 7: return true
            case 8: return isSigned
            case 9: return true // File upload is optional
            default: return false
        }
    }

    const getContractText = () => {
        const template = CONTRACT_TEMPLATES[locale as keyof typeof CONTRACT_TEMPLATES] || CONTRACT_TEMPLATES.en
        return template.replace('{{business_name}}', formData.businessName || 'Client')
    }

    const handleSignContract = async () => {
        // Use realDbId if available, otherwise try to use orderId but it might be masked
        const dbId = formData.realDbId
        const finalOrderId = formData.orderId || orderId

        if (!dbId) {
            // Optimization: If we don't have dbId, try to fetch it again or alert
            // But usually we should have it if fetchOrderDetails ran.
            // If finalOrderId looks like an int (legacy), use it.
            if (finalOrderId && !isNaN(parseInt(finalOrderId)) && !finalOrderId.startsWith('#')) {
                // It's a legacy int ID
            } else {
                alert(t('onboarding.form.contract.orderIdError'))
                return
            }
        }

        const idToSend = dbId || (finalOrderId ? parseInt(finalOrderId, 10) : 0)

        if (!idToSend) {
            alert(t('onboarding.form.contract.orderIdError'))
            return
        }

        if (!signatureName.trim()) {
            alert(t('onboarding.form.contract.nameRequired'))
            return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch('/api/launch/sign-contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_id: idToSend,
                    content: getContractText(),
                    signed_name: signatureName,
                    language: locale
                })
            })

            const data = await response.json()

            if (response.ok) {
                setIsSigned(true)
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.7 }
                })
            } else {
                throw new Error(data.error || data.detail || 'Failed to sign contract')
            }
        } catch (error: any) {
            console.error('Error signing contract:', error)
            alert(`Error: ${error.message}`)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSubmit = async () => {
        if (!canProceed()) return
        setIsSubmitting(true)

        try {
            const payload = {
                business_name: formData.businessName,
                business_email: formData.businessEmail,
                business_phone: formData.businessPhone,
                has_whatsapp: formData.hasWhatsapp,
                business_address: formData.businessAddress,
                niche: formData.niche,
                custom_niche: formData.customNiche,
                primary_city: formData.primaryCity,
                state: formData.state,
                service_areas: formData.serviceAreas,
                services: formData.services,
                primary_service: formData.primaryService,
                site_objective: formData.siteObjective,
                site_description: formData.siteDescription,
                selected_pages: formData.selectedPages,
                total_pages: formData.selectedPages.length,
                tone: formData.tone,
                primary_cta: formData.primaryCta,
                cta_text: formData.ctaText,
                primary_color: formData.primaryColor,
                secondary_color: formData.secondaryColor,
                accent_color: formData.accentColor,
                reference_sites: formData.referenceSites,
                design_notes: formData.designNotes,
                business_hours: formData.businessHours,
                social_facebook: formData.socialFacebook,
                social_instagram: formData.socialInstagram,
                social_linkedin: formData.socialLinkedin,
                social_youtube: formData.socialYoutube,
                testimonials: formData.testimonials,
                google_reviews_link: formData.googleReviewsLink,
                about_owner: formData.aboutOwner,
                years_in_business: formData.yearsInBusiness ? parseInt(formData.yearsInBusiness) : null,
                desired_domain: formData.desiredDomain?.trim() || null,
                has_existing_domain: formData.hasExistingDomain,
                existing_domain: formData.hasExistingDomain ? formData.existingDomain?.trim() || null : null,
                domain_to_purchase: !formData.hasExistingDomain && formData.domainPurchased ? formData.domainToPurchase?.trim() || null : null,
                uploaded_files: formData.uploadedFiles,
                password: formData.password,
                is_complete: true,
                completed_steps: TOTAL_STEPS,
                locale: locale, // Send browser locale to backend
            }

            const finalOrderId = formData.orderId || orderId
            const response = await fetch(`/api/launch/onboarding?order_id=${finalOrderId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                // Onboarding OK - auto login customer and send to portal dashboard
                try {
                    const loginResponse = await fetch('/api/launch/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: formData.businessEmail,
                            password: formData.password,
                        }),
                    })

                    if (loginResponse.ok) {
                        const loginData = await loginResponse.json()
                        // Persist customer session for portal
                        if (loginData.access_token) {
                            localStorage.setItem('customer_token', loginData.access_token)
                            localStorage.setItem('customer_email', formData.businessEmail)
                            if (loginData.customer_id) {
                                localStorage.setItem('customer_id', String(loginData.customer_id))
                            }
                        }
                        // Redirect to client portal dashboard (locale-aware via i18n router)
                        router.push('/portal')
                    } else {
                        // If auto-login fails, just keep completion state and let customer use manual login
                        console.error('Auto-login after onboarding failed', await loginResponse.text())
                    }
                } catch (e) {
                    console.error('Error during auto-login after onboarding:', e)
                }

                // Track CompleteRegistration
                MetaPixel.completeRegistration({
                    content_name: 'Site Onboarding Complete',
                    status: 'success',
                })
                // Clear saved progress from localStorage
                localStorage.removeItem(storageKey)
                setIsComplete(true)
            } else {
                const errorData = await response.json()
                console.error('Onboarding error response:', errorData)

                // Extract error message from various error formats
                let errorMessage = 'Failed to submit'

                if (errorData.error) {
                    if (typeof errorData.error === 'string') {
                        errorMessage = errorData.error
                    } else if (errorData.error.message) {
                        errorMessage = errorData.error.message
                    } else if (errorData.error.msg) {
                        errorMessage = errorData.error.msg
                    } else if (Array.isArray(errorData.error)) {
                        // Pydantic validation errors
                        const firstError = errorData.error[0]
                        if (firstError && firstError.msg) {
                            errorMessage = firstError.msg
                        } else {
                            errorMessage = JSON.stringify(errorData.error)
                        }
                    } else if (typeof errorData.error === 'object') {
                        // Try to extract a meaningful message
                        errorMessage = errorData.error.msg || errorData.error.message || errorData.error.detail || 'Validation error'
                    }
                } else if (errorData.detail) {
                    if (typeof errorData.detail === 'string') {
                        errorMessage = errorData.detail
                    } else if (Array.isArray(errorData.detail)) {
                        // Pydantic validation errors array
                        const firstError = errorData.detail[0]
                        if (firstError && firstError.msg) {
                            errorMessage = `${firstError.loc?.join('.') || 'Field'}: ${firstError.msg}`
                        } else {
                            errorMessage = 'Validation error'
                        }
                    } else if (errorData.detail.msg) {
                        errorMessage = errorData.detail.msg
                    }
                } else if (errorData.message) {
                    errorMessage = errorData.message
                }

                throw new Error(errorMessage)
            }
        } catch (error: any) {
            console.error('Error submitting onboarding:', error)
            const displayMessage = typeof error === 'string' ? error : 'Something went wrong. Please try again.'
            alert(displayMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Fire confetti celebration
    const fireConfetti = useCallback(() => {
        const duration = 3000
        const animationEnd = Date.now() + duration
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now()
            if (timeLeft <= 0) {
                return clearInterval(interval)
            }
            const particleCount = 50 * (timeLeft / duration)
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            })
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            })
        }, 250)
    }, [])

    // Trigger confetti when complete and redirect after delay
    useEffect(() => {
        if (isComplete) {
            fireConfetti()
            // Auto-redirect to dashboard after 5 seconds
            const redirectTimer = setTimeout(() => {
                router.push(`/launch/dashboard?order_id=${orderId}&email=${encodeURIComponent(formData.businessEmail)}`)
            }, 5000)
            return () => clearTimeout(redirectTimer)
        }
    }, [isComplete, fireConfetti, orderId, formData.businessEmail, router])

    // ============ COMPLETION SCREEN ============
    if (isComplete) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-6">
                {/* Animated background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/20 rounded-full blur-3xl"
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-lg text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 relative z-10"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"
                    >
                        <motion.div
                            initial={{ rotate: -180, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <PartyPopper className="w-12 h-12 text-white" />
                        </motion.div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold text-white mb-2"
                    >
                        {t('onboarding.complete.title')}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg text-green-400 font-medium mb-4"
                    >
                        {t('onboarding.complete.subtitle')}
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-slate-300 mb-4"
                    >
                        {t('onboarding.complete.message')}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.55 }}
                        className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 mb-8"
                    >
                        <div className="flex items-center gap-3 text-green-300">
                            <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                            <span className="font-medium">{t('onboarding.complete.loadingMessage')}</span>
                        </div>
                        <p className="text-sm text-green-200/70 mt-2">
                            {t('onboarding.complete.loadingDescription')}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-5 text-left mb-6"
                    >
                        <p className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                            <Rocket className="w-5 h-5" />
                            {t('onboarding.complete.nextSteps')}
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-3 text-slate-300">
                                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span>{t('onboarding.complete.step1')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span>{t('onboarding.complete.step2')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span>{t('onboarding.complete.step3')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span>{t('onboarding.complete.step4')}</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="space-y-3"
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-center text-sm text-slate-400 mb-2"
                        >
                            Redirecionando para o dashboard em 5 segundos...
                        </motion.div>
                        <a
                            href={`/launch/dashboard?order_id=${orderId}&email=${encodeURIComponent(formData.businessEmail)}`}
                            className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl font-bold text-white shadow-lg shadow-blue-500/25 transition-all"
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            {t('onboarding.complete.dashboardButton')}
                        </a>
                        <a
                            href="/"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 border border-white/10 hover:border-white/20 rounded-xl font-medium text-slate-300 transition-all"
                        >
                            {t('onboarding.form.backHome')}
                        </a>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-8 pt-6 border-t border-white/10"
                    >
                        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                            <Sparkles className="w-4 h-4" />
                            Trusted by 200+ local businesses
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        )
    }

    // ============ MAIN FORM ============
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
            <Header />
            <div className="py-8 px-4 md:px-6 pt-40">
                <div className="max-w-4xl mx-auto">
                    {/* Progress Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
                            {steps.map((step, index) => {
                                const StepIcon = step.icon
                                return (
                                    <div key={step.id} className="flex items-center">
                                        <motion.button
                                            onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                                            disabled={currentStep < step.id}
                                            animate={{ scale: currentStep === step.id ? 1.1 : 1 }}
                                            className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-colors ${currentStep > step.id
                                                ? 'bg-green-500 cursor-pointer'
                                                : currentStep === step.id
                                                    ? 'bg-blue-500'
                                                    : 'bg-white/10'
                                                }`}
                                        >
                                            {currentStep > step.id ? (
                                                <Check className="w-5 h-5" />
                                            ) : (
                                                <StepIcon className="w-5 h-5" />
                                            )}
                                        </motion.button>
                                        {index < steps.length - 1 && (
                                            <div className={`w-8 md:w-12 h-1 mx-1 rounded-full ${currentStep > step.id ? 'bg-green-500' : 'bg-white/10'
                                                }`} />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <div className="text-center">
                            <span className="text-blue-400 font-semibold">Step {currentStep} of {TOTAL_STEPS}:</span>{' '}
                            <span className="text-white">{steps[currentStep - 1].title}</span>
                            <p className="text-slate-400 text-sm mt-1">{steps[currentStep - 1].description}</p>
                        </div>
                    </div>

                    {/* Login Modal */}
                    {showLoginModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                            >
                                <div className="flex items-center gap-3 text-amber-400 mb-4">
                                    <AlertCircle className="w-8 h-8" />
                                    <h3 className="text-xl font-bold text-white">{t('onboarding.form.loginModal.title')}</h3>
                                </div>
                                <p className="text-slate-300 mb-6">
                                    {t('onboarding.form.loginModal.message')}
                                </p>
                                <div className="flex gap-3">
                                    <Link
                                        href="/launch/login"
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        {t('onboarding.form.loginModal.loginButton')}
                                    </Link>
                                    <button
                                        onClick={() => setShowLoginModal(false)}
                                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-semibold transition-colors"
                                    >
                                        {t('onboarding.form.loginModal.cancelButton')}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Form Card */}
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8"
                    >
                        {/* ============ STEP 1: Business Info ============ */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.form.businessName')} *</label>
                                    <input
                                        type="text"
                                        value={formData.businessName}
                                        onChange={e => updateField('businessName', e.target.value)}
                                        placeholder={t('onboarding.form.businessNamePlaceholder')}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.form.email')} *</label>
                                        <input
                                            type="email"
                                            value={formData.businessEmail}
                                            onChange={e => updateField('businessEmail', e.target.value)}
                                            onBlur={checkEmail}
                                            placeholder={t('onboarding.form.emailPlaceholder')}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                        />
                                        {isCheckingEmail && (
                                            <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                {t('onboarding.form.emailCheck.checking')}
                                            </p>
                                        )}
                                        {emailExists && (
                                            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {t('onboarding.form.emailCheck.exists')}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.form.phone')} *</label>
                                        <input
                                            type="tel"
                                            value={formData.businessPhone}
                                            onChange={e => updateField('businessPhone', e.target.value)}
                                            placeholder={t('onboarding.form.phonePlaceholder')}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.hasWhatsapp}
                                        onChange={e => updateField('hasWhatsapp', e.target.checked)}
                                        className="w-5 h-5 rounded border-white/20 bg-white/10"
                                    />
                                    <span className="text-slate-300">{t('onboarding.form.hasWhatsApp')}</span>
                                </label>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.form.address')}</label>
                                    <input
                                        type="text"
                                        value={formData.businessAddress}
                                        onChange={e => updateField('businessAddress', e.target.value)}
                                        placeholder={t('onboarding.form.addressPlaceholder')}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                {/* Domain Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-slate-400" />
                                        {t('onboarding.form.domainQuestion')}
                                    </label>

                                    {/* Domain choice radio buttons */}
                                    <div className="flex gap-4 mb-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="hasDomain"
                                                checked={formData.hasExistingDomain}
                                                onChange={() => {
                                                    updateField('hasExistingDomain', true)
                                                    updateField('domainToPurchase', '')
                                                    setDomainCheckResult(null)
                                                }}
                                                className="w-4 h-4 text-blue-500"
                                            />
                                            <span className="text-slate-300">{t('onboarding.form.hasDomain')}</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="hasDomain"
                                                checked={!formData.hasExistingDomain}
                                                onChange={() => {
                                                    updateField('hasExistingDomain', false)
                                                    updateField('existingDomain', '')
                                                }}
                                                className="w-4 h-4 text-blue-500"
                                            />
                                            <span className="text-slate-300">{t('onboarding.form.noDomain')}</span>
                                        </label>
                                    </div>

                                    {/* If has existing domain */}
                                    {formData.hasExistingDomain && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.form.existingDomain')}</label>
                                            <input
                                                type="text"
                                                value={formData.existingDomain}
                                                onChange={e => updateField('existingDomain', e.target.value)}
                                                placeholder={t('onboarding.form.existingDomainPlaceholder')}
                                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">
                                                {t('onboarding.form.existingDomainHelp')}
                                            </p>
                                        </div>
                                    )}

                                    {/* If wants to purchase */}
                                    {!formData.hasExistingDomain && (
                                        <div>
                                            <div className="flex gap-2 mb-2">
                                                <input
                                                    type="text"
                                                    value={formData.domainToPurchase}
                                                    onChange={e => {
                                                        updateField('domainToPurchase', e.target.value)
                                                        setDomainCheckResult(null)
                                                    }}
                                                    placeholder={t('onboarding.form.domainToPurchasePlaceholder')}
                                                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={checkDomain}
                                                        disabled={isCheckingDomain || !formData.domainToPurchase?.trim() || formData.domainPurchased}
                                                        className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap"
                                                    >
                                                        {isCheckingDomain ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                <span className="hidden sm:inline">{t('onboarding.form.checkingDomain')}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Globe className="w-4 h-4" />
                                                                <span className="hidden sm:inline">{t('onboarding.form.checkDomain')}</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    {isCheckingDomain && (
                                                        <button
                                                            type="button"
                                                            onClick={cancelDomainCheck}
                                                            className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors flex items-center gap-2"
                                                            title="Cancelar verificação"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Domain check result */}
                                            {domainCheckResult && !domainCheckResult.error && domainCheckResult.available && (
                                                <div className="mb-3">
                                                    <div className={`p-3 rounded-lg border ${domainCheckResult.is_free
                                                        ? 'bg-green-900/20 border-green-500/50'
                                                        : 'bg-blue-900/20 border-blue-500/50'
                                                        }`}>
                                                        <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
                                                            <Check className="w-4 h-4" />
                                                            <span>
                                                                {domainCheckResult.is_free ? (
                                                                    <>{t('onboarding.form.domainAvailableFree')}</>
                                                                ) : (
                                                                    <>{t('onboarding.form.domainAvailablePrice', { price: (domainCheckResult.price ?? 0).toFixed(2) })}</>
                                                                )}
                                                            </span>
                                                        </div>
                                                        {!formData.domainPurchased && (
                                                            <button
                                                                type="button"
                                                                onClick={purchaseDomain}
                                                                disabled={isPurchasingDomain}
                                                                className="w-full mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                {isPurchasingDomain ? (
                                                                    <>
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                        <span>{t('onboarding.form.purchasingDomain')}</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <DollarSign className="w-4 h-4" />
                                                                        <span>{t('onboarding.form.purchaseDomain')}</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {domainCheckResult && domainCheckResult.error && (
                                                <div className="mb-3 p-3 rounded-lg border bg-red-900/20 border-red-500/50">
                                                    <div className="flex items-center gap-2 text-red-400 text-sm">
                                                        <AlertCircle className="w-4 h-4" />
                                                        <span>{domainCheckResult.error}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {domainCheckResult && !domainCheckResult.error && !domainCheckResult.available && (
                                                <div className="mb-3 p-3 rounded-lg border bg-yellow-900/20 border-yellow-500/50">
                                                    <div className="flex items-center gap-2 text-yellow-400 text-sm">
                                                        <AlertCircle className="w-4 h-4" />
                                                        <span>{t('onboarding.form.domainNotAvailable')}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Suggestions List */}
                                            {domainCheckResult && domainCheckResult.suggestions && domainCheckResult.suggestions.length > 0 && (
                                                <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <p className="text-sm text-slate-400 mb-2 font-medium flex items-center gap-2">
                                                        <Sparkles className="w-3 h-3 text-amber-400" />
                                                        Suggestion for you:
                                                    </p>
                                                    <div className="space-y-2">
                                                        {domainCheckResult.suggestions.slice(0, 3).map((suggestion, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium text-white">{suggestion.domain}</span>
                                                                    <span className="text-xs text-green-400">
                                                                        {suggestion.is_free ? 'Included (Free)' : `$${suggestion.price}`}
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        updateField('domainToPurchase', suggestion.domain)
                                                                        setDomainCheckResult(suggestion)
                                                                    }}
                                                                    className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 text-xs font-medium rounded-lg border border-blue-500/30 transition-colors"
                                                                >
                                                                    Select
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {formData.domainPurchased && (
                                                <div className="mb-3 p-3 rounded-lg border bg-green-900/20 border-green-500/50">
                                                    <div className="flex items-center gap-2 text-green-400 text-sm">
                                                        <Check className="w-4 h-4" />
                                                        <span>{t('onboarding.form.domainPurchased', { domain: formData.domainToPurchase })}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Account Creation Section */}
                                <div className="pt-6 border-t border-white/10">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-400" />
                                        {t('onboarding.form.password')}
                                    </h3>
                                    <p className="text-sm text-slate-400 mb-6">
                                        {t('onboarding.form.passwordHelp')}
                                    </p>
                                    <form id="password-form" onSubmit={(e) => e.preventDefault()}>
                                        {/* Hidden username field for accessibility */}
                                        <input
                                            type="text"
                                            autoComplete="username"
                                            value={formData.businessEmail || ''}
                                            readOnly
                                            tabIndex={-1}
                                            aria-hidden="true"
                                            style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
                                        />
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.form.password')} *</label>
                                                <input
                                                    type="password"
                                                    autoComplete="new-password"
                                                    value={formData.password}
                                                    onChange={e => updateField('password', e.target.value)}
                                                    placeholder={t('onboarding.form.passwordPlaceholder')}
                                                    className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-slate-500 focus:outline-none ${formData.password && formData.password.length < 8 ? 'border-red-500/50' : 'border-white/20 focus:border-blue-500'
                                                        }`}
                                                />
                                                {formData.password && formData.password.length < 8 && (
                                                    <p className="text-xs text-red-400 mt-1">{t('onboarding.form.errors.minPassword')}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.form.confirmPassword')} *</label>
                                                <input
                                                    type="password"
                                                    autoComplete="new-password"
                                                    value={formData.confirmPassword}
                                                    onChange={e => updateField('confirmPassword', e.target.value)}
                                                    placeholder="••••••••"
                                                    className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-slate-500 focus:outline-none ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-500/50' : 'border-white/20 focus:border-blue-500'
                                                        }`}
                                                />
                                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                                    <p className="text-xs text-red-400 mt-1">{t('onboarding.form.errors.mismatch')}</p>
                                                )}
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* ============ STEP 2: Location & Niche ============ */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3">{t('onboarding.form.niche')} *</label>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {niches.map(niche => {
                                            const NicheIcon = niche.icon
                                            return (
                                                <motion.button
                                                    key={niche.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => updateField('niche', niche.id)}
                                                    className={`p-3 rounded-xl border text-center transition-colors ${formData.niche === niche.id
                                                        ? 'bg-blue-500/20 border-blue-400'
                                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                                        }`}
                                                >
                                                    <NicheIcon className="w-6 h-6 mx-auto mb-1" />
                                                    <div className="text-xs">{niche.label}</div>
                                                </motion.button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Custom Niche Input - shows when "other" is selected */}
                                {formData.niche === 'other' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            {t('onboarding.form.customNiche')} *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.customNiche}
                                            onChange={e => updateField('customNiche', e.target.value)}
                                            placeholder={t('onboarding.form.customNichePlaceholder')}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.form.city')} *</label>
                                        <input
                                            type="text"
                                            value={formData.primaryCity}
                                            onChange={e => updateField('primaryCity', e.target.value)}
                                            placeholder="e.g., Orlando"
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.form.state')} *</label>
                                        <select
                                            value={formData.state}
                                            onChange={e => updateField('state', e.target.value)}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="" className="bg-slate-800">Select state</option>
                                            {usStates.map(state => (
                                                <option key={state} value={state} className="bg-slate-800">{state}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.form.serviceAreas')}</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={serviceAreaInput}
                                            onChange={e => setServiceAreaInput(e.target.value)}
                                            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addServiceArea())}
                                            placeholder="Add nearby cities..."
                                            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                        />
                                        <button onClick={addServiceArea} className="px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors">
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                    {formData.serviceAreas.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {formData.serviceAreas.map((area, i) => (
                                                <span key={i} className="px-3 py-1 bg-white/10 rounded-lg flex items-center gap-2">
                                                    {area}
                                                    <button onClick={() => updateField('serviceAreas', formData.serviceAreas.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-400">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ============ STEP 3: Services ============ */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.form.services')} *</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={serviceInput}
                                            onChange={e => setServiceInput(e.target.value)}
                                            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addService())}
                                            placeholder="e.g., Emergency Repairs"
                                            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                        />
                                        <button onClick={addService} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-medium transition-colors flex items-center gap-2">
                                            <Plus className="w-5 h-5" /> Add
                                        </button>
                                    </div>
                                </div>
                                {formData.services.length > 0 && (
                                    <div>
                                        <p className="text-sm text-slate-400 mb-2">Click to select your PRIMARY service:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.services.map((service, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${formData.primaryService === service
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                                                        }`}
                                                    onClick={() => updateField('primaryService', service)}
                                                >
                                                    {formData.primaryService === service && <Star className="w-4 h-4" />}
                                                    <span>{service}</span>
                                                    <button
                                                        onClick={e => { e.stopPropagation(); removeService(index) }}
                                                        className="ml-1 text-slate-400 hover:text-red-400"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ============ STEP 4: Site Goals & Pages ============ */}
                        {currentStep === 4 && (
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3">{t('onboarding.form.siteObjective')} *</label>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        {objectives.map(obj => {
                                            const ObjIcon = obj.icon
                                            return (
                                                <motion.button
                                                    key={obj.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    onClick={() => updateField('siteObjective', obj.id)}
                                                    className={`p-4 rounded-xl border text-left transition-colors ${formData.siteObjective === obj.id
                                                        ? 'bg-blue-500/20 border-blue-400'
                                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <ObjIcon className="w-6 h-6" />
                                                        <div>
                                                            <div className="font-medium">{obj.label}</div>
                                                            <div className="text-xs text-slate-400">{obj.desc}</div>
                                                        </div>
                                                    </div>
                                                </motion.button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3">{t('onboarding.form.selectPages')}</label>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                        {pages.map(page => (
                                            <motion.button
                                                key={page.id}
                                                whileHover={{ scale: page.required ? 1 : 1.02 }}
                                                onClick={() => togglePage(page.id)}
                                                className={`p-3 rounded-xl border text-sm transition-colors flex items-center justify-center gap-1 ${formData.selectedPages.includes(page.id)
                                                    ? 'bg-blue-500/20 border-blue-400'
                                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                                    } ${page.required ? 'opacity-70 cursor-default' : ''}`}
                                            >
                                                {page.label}
                                                {page.required && <Check className="w-3 h-3 text-blue-300" />}
                                            </motion.button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">Selected: {formData.selectedPages.length} pages</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.form.siteDescription')}</label>
                                    <textarea
                                        value={formData.siteDescription}
                                        onChange={e => updateField('siteDescription', e.target.value)}
                                        placeholder="Tell us about your business, what makes you different..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-3">Website Tone</label>
                                        <div className="space-y-2">
                                            {tones.map(tone => (
                                                <button
                                                    key={tone.id}
                                                    onClick={() => updateField('tone', tone.id)}
                                                    className={`w-full p-3 rounded-xl border text-left transition-colors ${formData.tone === tone.id
                                                        ? 'bg-blue-500/20 border-blue-400'
                                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                                        }`}
                                                >
                                                    <div className="font-medium">{tone.label}</div>
                                                    <div className="text-xs text-slate-400">{tone.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-3">Main Call to Action</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {ctaOptions.map(cta => {
                                                const CtaIcon = cta.icon
                                                return (
                                                    <button
                                                        key={cta.id}
                                                        onClick={() => updateField('primaryCta', cta.id)}
                                                        className={`p-3 rounded-xl border text-center transition-colors ${formData.primaryCta === cta.id
                                                            ? 'bg-blue-500/20 border-blue-400'
                                                            : 'bg-white/5 border-white/10 hover:border-white/20'
                                                            }`}
                                                    >
                                                        <CtaIcon className="w-5 h-5 mx-auto mb-1" />
                                                        <div className="text-sm">{cta.label}</div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.ctaText}
                                            onChange={e => updateField('ctaText', e.target.value)}
                                            placeholder="Custom CTA text (e.g., Get Free Quote)"
                                            className="w-full mt-3 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ============ STEP 5: Design & Colors ============ */}
                        {currentStep === 5 && (
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3">{t('onboarding.form.colorPalette')}</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {colorPalettes.filter(p => p.id !== 'custom').map(palette => (
                                            <motion.button
                                                key={palette.id}
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => selectColorPalette(palette.id)}
                                                className={`p-4 rounded-xl border transition-all ${formData.colorPalette === palette.id
                                                    ? 'border-white ring-2 ring-white/50'
                                                    : 'border-white/10 hover:border-white/30'
                                                    }`}
                                            >
                                                <div className="flex gap-1 mb-2">
                                                    <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: palette.primary }} />
                                                    <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: palette.secondary }} />
                                                    <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: palette.accent }} />
                                                </div>
                                                <div className="text-xs">{palette.name}</div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3">Or Choose Custom Colors</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {['primary', 'secondary', 'accent'].map(colorType => (
                                            <div key={colorType}>
                                                <label className="text-xs text-slate-400 capitalize">{colorType}</label>
                                                <div className="flex gap-2 items-center mt-1">
                                                    <input
                                                        type="color"
                                                        value={formData[`${colorType}Color` as keyof FormData] as string}
                                                        onChange={e => {
                                                            updateField(`${colorType}Color` as keyof FormData, e.target.value as never)
                                                            updateField('colorPalette', 'custom')
                                                        }}
                                                        className="w-12 h-12 rounded-lg cursor-pointer border-0"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={formData[`${colorType}Color` as keyof FormData] as string}
                                                        onChange={e => {
                                                            updateField(`${colorType}Color` as keyof FormData, e.target.value as never)
                                                            updateField('colorPalette', 'custom')
                                                        }}
                                                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-mono"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Reference Sites (Optional)</label>
                                    <p className="text-xs text-slate-400 mb-2">Add URLs of websites you like for design inspiration</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={referenceInput}
                                            onChange={e => setReferenceInput(e.target.value)}
                                            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addReference())}
                                            placeholder="https://example.com"
                                            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                        />
                                        <button onClick={addReference} className="px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors">
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                    {formData.referenceSites.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {formData.referenceSites.map((site, i) => (
                                                <span key={i} className="px-3 py-1 bg-white/10 rounded-lg flex items-center gap-2 text-sm">
                                                    <Globe className="w-3 h-3" />
                                                    {site.length > 25 ? site.substring(0, 25) + '...' : site}
                                                    <button onClick={() => updateField('referenceSites', formData.referenceSites.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-400">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Additional Design Notes (Optional)</label>
                                    <textarea
                                        value={formData.designNotes}
                                        onChange={e => updateField('designNotes', e.target.value)}
                                        placeholder="Any specific design preferences, elements you want, or things to avoid..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ============ STEP 6: Business Details ============ */}
                        {currentStep === 6 && (
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3">{t('onboarding.form.businessHours')}</label>
                                    <div className="grid gap-2">
                                        {[
                                            { key: 'mon', label: 'Monday' },
                                            { key: 'tue', label: 'Tuesday' },
                                            { key: 'wed', label: 'Wednesday' },
                                            { key: 'thu', label: 'Thursday' },
                                            { key: 'fri', label: 'Friday' },
                                            { key: 'sat', label: 'Saturday' },
                                            { key: 'sun', label: 'Sunday' },
                                        ].map(day => (
                                            <div key={day.key} className="flex items-center gap-3">
                                                <span className="w-24 text-sm text-slate-400">{day.label}</span>
                                                <input
                                                    type="text"
                                                    value={formData.businessHours[day.key] || ''}
                                                    onChange={e => updateField('businessHours', { ...formData.businessHours, [day.key]: e.target.value })}
                                                    placeholder="e.g., 9am - 5pm or Closed"
                                                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3">{t('onboarding.form.socialMedia')}</label>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-slate-400 flex items-center gap-2 mb-1"><Facebook className="w-4 h-4" /> Facebook</label>
                                            <input
                                                type="url"
                                                value={formData.socialFacebook}
                                                onChange={e => updateField('socialFacebook', e.target.value)}
                                                placeholder="https://facebook.com/yourpage"
                                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 flex items-center gap-2 mb-1"><Instagram className="w-4 h-4" /> Instagram</label>
                                            <input
                                                type="url"
                                                value={formData.socialInstagram}
                                                onChange={e => updateField('socialInstagram', e.target.value)}
                                                placeholder="https://instagram.com/yourhandle"
                                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 flex items-center gap-2 mb-1"><Linkedin className="w-4 h-4" /> LinkedIn</label>
                                            <input
                                                type="url"
                                                value={formData.socialLinkedin}
                                                onChange={e => updateField('socialLinkedin', e.target.value)}
                                                placeholder="https://linkedin.com/in/yourprofile"
                                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 flex items-center gap-2 mb-1"><Youtube className="w-4 h-4" /> YouTube</label>
                                            <input
                                                type="url"
                                                value={formData.socialYoutube}
                                                onChange={e => updateField('socialYoutube', e.target.value)}
                                                placeholder="https://youtube.com/@yourchannel"
                                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ============ STEP 7: Testimonials & About ============ */}
                        {currentStep === 7 && (
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-3">{t('onboarding.form.testimonials')}</label>
                                    <p className="text-xs text-slate-400 mb-3">Add reviews from happy customers to display on your site</p>

                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                                        <input
                                            type="text"
                                            value={newTestimonial.name}
                                            onChange={e => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                                            placeholder="Customer name"
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                                        />
                                        <input
                                            type="text"
                                            value={newTestimonial.role || ''}
                                            onChange={e => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
                                            placeholder="Role (e.g., Homeowner, Business Owner)"
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                                        />
                                        <textarea
                                            value={newTestimonial.text}
                                            onChange={e => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                                            placeholder="Their review or testimonial..."
                                            rows={2}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                                        />
                                        <button
                                            onClick={addTestimonial}
                                            className="w-full py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-300 hover:bg-blue-500/30 flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" /> Add Testimonial
                                        </button>
                                    </div>

                                    {formData.testimonials.length > 0 && (
                                        <div className="mt-4 space-y-3">
                                            {formData.testimonials.map((t, i) => (
                                                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 relative">
                                                    <button
                                                        onClick={() => updateField('testimonials', formData.testimonials.filter((_, j) => j !== i))}
                                                        className="absolute top-2 right-2 text-slate-400 hover:text-red-400"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                    <div className="font-medium">{t.name}</div>
                                                    {t.role && <div className="text-xs text-slate-400">{t.role}</div>}
                                                    <div className="text-sm text-slate-300 mt-2">"{t.text}"</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.form.googleReviews')}</label>
                                    <input
                                        type="url"
                                        value={formData.googleReviewsLink}
                                        onChange={e => updateField('googleReviewsLink', e.target.value)}
                                        placeholder="https://g.page/yourbusiness/review"
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.form.aboutOwner')}</label>
                                    <textarea
                                        value={formData.aboutOwner}
                                        onChange={e => updateField('aboutOwner', e.target.value)}
                                        placeholder="Share your story, experience, and what makes your business special..."
                                        rows={4}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.form.yearsInBusiness')}</label>
                                    <input
                                        type="number"
                                        value={formData.yearsInBusiness}
                                        onChange={e => updateField('yearsInBusiness', e.target.value)}
                                        placeholder="e.g., 10"
                                        className="w-32 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ============ STEP 8: Contract & Signature ============ */}
                        {currentStep === 8 && (
                            <div className="space-y-6">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-h-[400px] overflow-y-auto text-sm text-slate-300 prose prose-invert prose-blue max-w-none">
                                    <div className="whitespace-pre-line">
                                        {getContractText()}
                                    </div>
                                </div>

                                {!isSigned ? (
                                    <div className="space-y-4 pt-4 border-t border-white/10">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">{t('onboarding.form.contract.signatureLabel')}</label>
                                            <input
                                                type="text"
                                                value={signatureName}
                                                onChange={e => setSignatureName(e.target.value)}
                                                placeholder={t('onboarding.form.contract.signaturePlaceholder')}
                                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSignContract}
                                            disabled={isSubmitting || !signatureName.trim()}
                                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <FileSignature className="w-5 h-5" />
                                            )}
                                            {t('onboarding.form.contract.signButton')}
                                        </button>
                                        <p className="text-[10px] text-slate-500 text-center uppercase tracking-wider">
                                            {t('onboarding.form.contract.signingDisclaimer')}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center animate-in zoom-in-95 duration-500">
                                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Check className="w-10 h-10 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-1">{t('onboarding.form.contract.signedTitle')}</h3>
                                        <p className="text-sm text-green-400">
                                            {t('onboarding.form.contract.signedAs', {
                                                name: signatureName,
                                                date: new Date().toLocaleDateString()
                                            })}
                                        </p>
                                        <p className="text-sm text-slate-400 mt-4">{t('onboarding.form.contract.proceedMessage')}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ============ STEP 9: File Upload ============ */}
                        {currentStep === 9 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-white mb-2">{t('onboarding.form.fileUpload.title')}</h3>
                                    <p className="text-slate-400">{t('onboarding.form.fileUpload.subtitle')}</p>
                                </div>

                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isUploading ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 hover:border-blue-400 hover:bg-white/5'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        multiple
                                        accept="image/*,.pdf,.doc,.docx"
                                    />

                                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        {isUploading ? (
                                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                                        ) : (
                                            <Upload className="w-8 h-8 text-blue-400" />
                                        )}
                                    </div>

                                    <p className="text-lg font-medium text-white mb-2">
                                        {isUploading ? t('onboarding.form.fileUpload.uploading') : t('onboarding.form.fileUpload.dropzone')}
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        JPG, PNG, PDF, DOC (Max 50MB)
                                    </p>
                                </div>

                                {formData.uploadedFiles.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium text-slate-300">{t('onboarding.form.fileUpload.filesUploaded')}</h4>
                                        {formData.uploadedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    {file.type === 'image' ? (
                                                        <Image className="w-5 h-5 text-blue-400" />
                                                    ) : (
                                                        <File className="w-5 h-5 text-purple-400" />
                                                    )}
                                                    <span className="text-sm text-white truncate max-w-[200px]">{file.name}</span>
                                                </div>
                                                <button
                                                    onClick={() => removeFile(index)}
                                                    className="text-slate-500 hover:text-red-400 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <p className="text-xs text-center text-slate-500">
                                    {t('onboarding.form.fileUpload.skip')}
                                </p>
                            </div>
                        )}

                        {/* ============ Navigation ============ */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                            <motion.button
                                whileHover={{ scale: currentStep > 1 ? 1.02 : 1 }}
                                whileTap={{ scale: currentStep > 1 ? 0.98 : 1 }}
                                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                                disabled={currentStep === 1}
                                className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20'
                                    }`}
                            >
                                <ChevronLeft className="w-5 h-5" />{t('onboarding.navigation.previous')}
                            </motion.button>

                            {currentStep < TOTAL_STEPS ? (
                                <motion.button
                                    whileHover={{ scale: canProceed() ? 1.02 : 1 }}
                                    whileTap={{ scale: canProceed() ? 0.98 : 1 }}
                                    onClick={() => canProceed() && setCurrentStep(prev => prev + 1)}
                                    className={`px-8 py-3 rounded-xl font-medium flex items-center gap-2 ${canProceed() ? 'bg-blue-500 hover:bg-blue-600' : 'bg-slate-700 cursor-not-allowed'
                                        }`}
                                >
                                    {t('onboarding.navigation.next')} <ChevronRight className="w-5 h-5" />
                                </motion.button>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className={`px-8 py-3 rounded-xl font-medium flex items-center gap-2 ${isSubmitting
                                        ? 'bg-slate-700 cursor-wait'
                                        : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            {t('onboarding.navigation.submitting')}
                                        </>
                                    ) : (
                                        <>
                                            <Rocket className="w-5 h-5" />
                                            {t('onboarding.navigation.submit')}
                                        </>
                                    )}
                                </motion.button>
                            )}
                        </div>
                    </motion.div>

                    {/* Progress indicator */}
                    <div className="mt-6 text-center text-slate-400 text-sm">
                        Progress: {Math.round((currentStep / TOTAL_STEPS) * 100)}% complete
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <OnboardingContent />
        </Suspense>
    )
}
