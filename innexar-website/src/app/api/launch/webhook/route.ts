import { NextRequest, NextResponse } from 'next/server'
import { getStripeSecretKey, getStripeWebhookSecret } from '@/lib/system-config'

// CRM API endpoint
const CRM_API_URL = process.env.CRM_API_URL || 'https://sales.innexar.app/api'

// Dynamically import Stripe only at runtime
async function getStripe() {
    const Stripe = (await import('stripe')).default
    const key = await getStripeSecretKey()
    return new Stripe(key, {
        apiVersion: '2025-12-15.clover' as const,
    })
}

export async function POST(request: NextRequest) {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
        console.error('Webhook: No signature provided')
        return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    console.log('Webhook: Received request with signature')

    const webhookSecret = await getStripeWebhookSecret()
    console.log('Webhook: Got secret, length:', webhookSecret?.length || 0)

    try {
        const stripe = await getStripe()
        const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
        console.log('Webhook: Event verified -', event.type)

        // Handle events
        // Forward checkout.session.completed to backend webhook for order creation
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object
                console.log('Checkout session completed:', session.id)
                console.log('Forwarding to backend webhook for order creation...')

                // Forward the event to backend webhook
                try {
                    const backendResponse = await fetch(`${CRM_API_URL}/site-orders/webhook`, {
                        method: 'POST',
                        headers: {
                            'stripe-signature': signature || '',
                        },
                        body: body, // Send raw body as received from Stripe
                    })

                    if (backendResponse.ok) {
                        console.log('Backend webhook processed successfully')

                        // Send confirmation email to customer
                        try {
                            const { sendEmail } = await import('@/lib/email')
                            const { getPaymentConfirmationTemplate } = await import('@/lib/email-payment-confirmation')

                            const customerEmail = session.customer_details?.email || session.customer_email
                            const customerName = session.customer_details?.name || 'Customer'

                            if (customerEmail) {
                                const emailTemplate = getPaymentConfirmationTemplate({
                                    orderId: session.id,
                                    customerName: customerName,
                                    customerEmail: customerEmail,
                                    amount: session.amount_total || 0,
                                    currency: (session.currency || 'USD').toUpperCase(),
                                    nextSteps: [
                                        'Complete the onboarding form with your business details',
                                        'Our team will start working on your website immediately',
                                        'You\'ll receive your first draft within 48 hours',
                                        'Request any revisions (2 included)',
                                        'Get your final website delivered!'
                                    ]
                                })

                                await sendEmail({
                                    to: customerEmail,
                                    subject: emailTemplate.subject,
                                    html: emailTemplate.html,
                                    text: emailTemplate.text,
                                })

                                console.log('Confirmation email sent to:', customerEmail)
                            } else {
                                console.warn('No customer email found in session')
                            }
                        } catch (emailError) {
                            console.error('Error sending confirmation email:', emailError)
                            // Don't fail the webhook if email fails
                        }
                    } else {
                        const errorText = await backendResponse.text()
                        console.error('Backend webhook error:', backendResponse.status, errorText)
                    }
                } catch (error) {
                    console.error('Error forwarding to backend webhook:', error)
                }
                break
            }

            case 'payment_intent.succeeded': {
                console.log('Payment succeeded:', event.data.object.id)
                break
            }

            case 'payment_intent.payment_failed': {
                console.log('Payment failed:', event.data.object.id)
                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (err) {
        console.error('Webhook error:', err)
        return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
    }
}

function parseAddons(addonsString: string): number[] {
    if (!addonsString) return []

    // Valid addon mapping based on seeded data
    const ADDON_MAP: Record<string, number> = {
        'logo': 1,              // 1: Logo Design
        'seo': 2,               // 2: SEO Local Pro
        'extra-page': 3,        // 3: Extra Page
        'whatsapp': 4,          // 4: WhatsApp Widget
        'google-business': 5,   // 5: Google Business Setup
    }

    return addonsString.split(',')
        .map(slug => slug.trim())
        .filter(slug => ADDON_MAP[slug])
        .map(slug => ADDON_MAP[slug])
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
