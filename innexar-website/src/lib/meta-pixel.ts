/**
 * Meta Pixel (Facebook Pixel) Tracking Module
 * Provides type-safe functions for tracking conversion events.
 *
 * Events tracked:
 * - PageView: Automatically on page load
 * - ViewContent: When user views landing page content
 * - InitiateCheckout: When user clicks checkout button
 * - Purchase: When checkout is completed
 * - Lead: When onboarding is submitted
 * - CompleteRegistration: When onboarding is completed
 */

// Declare Facebook Pixel types
declare global {
    interface Window {
        fbq: (...args: unknown[]) => void
        _fbq: unknown
    }
}

// Default Pixel ID (can be overridden from SystemConfig)
const DEFAULT_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || ''

/**
 * Initialize Meta Pixel
 * Should be called once in the root layout
 */
export function initMetaPixel(pixelId?: string): void {
    const id = pixelId || DEFAULT_PIXEL_ID

    if (!id) {
        console.warn('Meta Pixel ID not configured')
        return
    }

    // Prevent duplicate initialization
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        return
    }

    // Facebook Pixel base code
    const f = window
    const b = document
    const e = 'script'

    if (!f.fbq) {
        const n: any = f.fbq = function (...args: unknown[]) {
            n.callMethod ?
                n.callMethod.apply(n, args) :
                n.queue.push(args)
        }

        if (!f._fbq) f._fbq = n
        n.push = n
        n.loaded = true
        n.version = '2.0'
        n.queue = []

        const t = b.createElement(e) as HTMLScriptElement
        t.async = true
        t.src = 'https://connect.facebook.net/en_US/fbevents.js'

        const s = b.getElementsByTagName(e)[0]
        s?.parentNode?.insertBefore(t, s)
    }

    // Initialize with pixel ID
    window.fbq('init', id)
    window.fbq('track', 'PageView')
}

/**
 * Track a standard event
 */
function trackEvent(eventName: string, params?: Record<string, unknown>): void {
    if (typeof window !== 'undefined' && window.fbq) {
        if (params) {
            window.fbq('track', eventName, params)
        } else {
            window.fbq('track', eventName)
        }
    }
}

/**
 * Track a custom event
 */
function trackCustomEvent(eventName: string, params?: Record<string, unknown>): void {
    if (typeof window !== 'undefined' && window.fbq) {
        if (params) {
            window.fbq('trackCustom', eventName, params)
        } else {
            window.fbq('trackCustom', eventName)
        }
    }
}

// ========== STANDARD EVENTS ==========

/**
 * Track PageView event
 * Automatically called by initMetaPixel, but can be called manually for SPAs
 */
export function trackPageView(): void {
    trackEvent('PageView')
}

/**
 * Track ViewContent event
 * Call when user views important content (e.g., landing page sections)
 */
export function trackViewContent(params: {
    content_name?: string
    content_category?: string
    content_ids?: string[]
    content_type?: string
    value?: number
    currency?: string
}): void {
    trackEvent('ViewContent', {
        content_name: params.content_name,
        content_category: params.content_category,
        content_ids: params.content_ids,
        content_type: params.content_type,
        value: params.value,
        currency: params.currency || 'USD',
    })
}

/**
 * Track AddToCart event
 * Call when user selects add-ons
 */
export function trackAddToCart(params: {
    content_name: string
    content_ids?: string[]
    content_type?: string
    value: number
    currency?: string
}): void {
    trackEvent('AddToCart', {
        content_name: params.content_name,
        content_ids: params.content_ids,
        content_type: params.content_type || 'product',
        value: params.value,
        currency: params.currency || 'USD',
    })
}

/**
 * Track InitiateCheckout event
 * Call when user clicks the checkout button
 */
export function trackInitiateCheckout(params: {
    value: number
    currency?: string
    content_ids?: string[]
    content_type?: string
    num_items?: number
}): void {
    trackEvent('InitiateCheckout', {
        value: params.value,
        currency: params.currency || 'USD',
        content_ids: params.content_ids,
        content_type: params.content_type || 'product',
        num_items: params.num_items,
    })
}

/**
 * Track Purchase event
 * Call when checkout is completed successfully
 */
export function trackPurchase(params: {
    value: number
    currency?: string
    content_ids?: string[]
    content_type?: string
    content_name?: string
    num_items?: number
    order_id?: string
}): void {
    trackEvent('Purchase', {
        value: params.value,
        currency: params.currency || 'USD',
        content_ids: params.content_ids,
        content_type: params.content_type || 'product',
        content_name: params.content_name,
        num_items: params.num_items,
        order_id: params.order_id,
    })
}

/**
 * Track Lead event
 * Call when user starts onboarding
 */
export function trackLead(params?: {
    content_name?: string
    content_category?: string
    value?: number
    currency?: string
}): void {
    trackEvent('Lead', {
        content_name: params?.content_name || 'Site Onboarding',
        content_category: params?.content_category || 'Website',
        value: params?.value,
        currency: params?.currency || 'USD',
    })
}

/**
 * Track CompleteRegistration event
 * Call when onboarding is completed
 */
export function trackCompleteRegistration(params?: {
    content_name?: string
    status?: string
    value?: number
    currency?: string
}): void {
    trackEvent('CompleteRegistration', {
        content_name: params?.content_name || 'Site Onboarding Complete',
        status: params?.status || 'success',
        value: params?.value,
        currency: params?.currency || 'USD',
    })
}

// ========== CUSTOM EVENTS ==========

/**
 * Track when user views pricing section
 */
export function trackViewPricing(): void {
    trackCustomEvent('ViewPricing', {
        content_name: 'Site Pricing',
    })
}

/**
 * Track when user selects an addon
 */
export function trackSelectAddon(addonName: string, price: number): void {
    trackCustomEvent('SelectAddon', {
        addon_name: addonName,
        value: price,
        currency: 'USD',
    })
}

/**
 * Track onboarding step completion
 */
export function trackOnboardingStep(step: number, stepName: string): void {
    trackCustomEvent('OnboardingStep', {
        step_number: step,
        step_name: stepName,
    })
}

/**
 * Track when user views their dashboard
 */
export function trackViewDashboard(orderId: string): void {
    trackCustomEvent('ViewDashboard', {
        order_id: orderId,
    })
}

// Export all functions
export const MetaPixel = {
    init: initMetaPixel,
    pageView: trackPageView,
    viewContent: trackViewContent,
    addToCart: trackAddToCart,
    initiateCheckout: trackInitiateCheckout,
    purchase: trackPurchase,
    lead: trackLead,
    completeRegistration: trackCompleteRegistration,
    viewPricing: trackViewPricing,
    selectAddon: trackSelectAddon,
    onboardingStep: trackOnboardingStep,
    viewDashboard: trackViewDashboard,
    trackCustom: trackCustomEvent, // Add custom event tracking
}

export default MetaPixel

