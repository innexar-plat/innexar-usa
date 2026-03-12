import { NextRequest, NextResponse } from 'next/server'
import { getStripeSecretKey } from '@/lib/system-config'

/**
 * Legacy one-time checkout (Stripe payment mode: payment).
 * For WaaS monthly plans (starter/business/pro), use POST /api/waas/checkout instead,
 * which proxies to the workspace API (api3.innexar.app) and uses plan_slug.
 * This route remains for the promo page ($199 one-time) and legacy launch addons flow.
 */

// Base product pricing
const DEFAULT_BASE_PRICE = 19900 // $199 (promo page)
const LAUNCH_BASE_PRICE = 39900 // $399 (launch page with addons)


// Add-ons
const ADDONS: Record<string, { name: string; price: number; description: string }> = {
    logo: { name: 'Logo Design', price: 9900, description: 'Professional logo with 3 concepts' },
    seo: { name: 'SEO Local Pro', price: 14900, description: 'Advanced local SEO optimization' },
    'extra-page': { name: 'Extra Page', price: 7900, description: 'Additional custom page' },
    whatsapp: { name: 'WhatsApp Widget', price: 4900, description: 'Direct WhatsApp integration' },
    'google-business': { name: 'Google Business Setup', price: 4900, description: 'Complete GMB optimization' },
}

// Dynamically import Stripe only at runtime
async function getStripe() {
    const Stripe = (await import('stripe')).default
    const key = await getStripeSecretKey()
    return new Stripe(key, {
        apiVersion: '2025-12-15.clover' as const,
    })
}

/** Resolve coupon code to Stripe discounts: supports coupon id (co_xxx) or promotion code (e.g. SAVE50). */
async function resolveStripeDiscount(
    stripe: Awaited<ReturnType<typeof getStripe>>,
    couponCode: string | null | undefined
): Promise<Array<{ coupon: string } | { promotion_code: string }> | null> {
    const code = couponCode?.trim()
    if (!code) return null
    try {
        if (code.startsWith('co_')) {
            await stripe.coupons.retrieve(code)
            return [{ coupon: code }]
        }
        const promos = await stripe.promotionCodes.list({ code, active: true, limit: 1 })
        if (promos.data.length > 0) {
            return [{ promotion_code: promos.data[0].id }]
        }
        return null
    } catch {
        return null
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { addons = [], customerEmail, couponCode, basePrice } = body


        // Build line items
        const lineItems: Array<{
            price_data: {
                currency: string
                product_data: { name: string; description: string }
                unit_amount: number
            }
            quantity: number
        }> = [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Professional Website',
                            description: 'Professional website delivered in 48 hours',
                        },
                        unit_amount: basePrice || DEFAULT_BASE_PRICE,
                    },
                    quantity: 1,
                },
            ]

        // Add selected add-ons
        for (const addonId of addons) {
            const addon = ADDONS[addonId]
            if (addon) {
                lineItems.push({
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: addon.name,
                            description: addon.description,
                        },
                        unit_amount: addon.price,
                    },
                    quantity: 1,
                })
            }
        }

        const stripe = await getStripe()

        // Prepare session config
        const sessionConfig: any = {
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${request.headers.get('origin')}/${body.locale || 'en'}/launch/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.headers.get('origin')}/${body.locale || 'en'}/launch`,
            customer_email: customerEmail || undefined,
            metadata: {
                addons: addons.join(','),
                product: 'launch_site',
                coupon_code: couponCode || '',
            },
            // Collect billing address
            billing_address_collection: 'required',
            // Phone number
            phone_number_collection: {
                enabled: true,
            },
        }

        // Apply coupon if provided (supports coupon id co_xxx or promotion code e.g. SAVE50)
        const discounts = await resolveStripeDiscount(stripe, couponCode)
        if (discounts) {
            sessionConfig.discounts = discounts
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create(sessionConfig)

        return NextResponse.json({
            sessionId: session.id,
            url: session.url,
        })
    } catch (error) {
        console.error('Stripe checkout error:', error)
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        basePrice: DEFAULT_BASE_PRICE / 100,
        addons: Object.entries(ADDONS).map(([id, addon]) => ({
            id,
            name: addon.name,
            price: addon.price / 100,
            description: addon.description,
        })),
    })
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
