import { NextRequest, NextResponse } from 'next/server'

const WORKSPACE_API_URL =
  process.env.NEXT_PUBLIC_WORKSPACE_API_URL || 'https://api3.innexar.app'
const PORTAL_URL =
  process.env.NEXT_PUBLIC_PORTAL_URL || 'https://panel.innexar.app'
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://innexar.app'

type Body = {
  plan_slug: string
  customer_email: string
  customer_name?: string
  customer_phone?: string
  company_name?: string
  coupon_code?: string
  locale: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body
    const {
      plan_slug,
      customer_email,
      customer_name,
      customer_phone,
      company_name,
      coupon_code,
      locale = 'en',
    } = body

    if (!plan_slug || !customer_email?.trim()) {
      return NextResponse.json(
        { error: 'plan_slug and customer_email are required' },
        { status: 400 }
      )
    }

    const success_url = `${SITE_URL.replace(/\/$/, '')}/${locale}/waas/success`
    const cancel_url = `${SITE_URL.replace(/\/$/, '')}/${locale}/waas`

    const payload = {
      plan_slug: String(plan_slug).trim().toLowerCase(),
      customer_email: String(customer_email).trim().toLowerCase(),
      customer_name: customer_name?.trim() || undefined,
      customer_phone: customer_phone?.trim() || undefined,
      company_name: company_name?.trim() || undefined,
      coupon_code: coupon_code?.trim() || undefined,
      success_url,
      cancel_url,
      locale: (locale || 'en').trim().toLowerCase(),
    }

    const res = await fetch(`${WORKSPACE_API_URL.replace(/\/$/, '')}/api/public/checkout/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail ?? data.message ?? 'Checkout failed' },
        { status: res.status }
      )
    }

    const payment_url = data.payment_url ?? null
    if (!payment_url) {
      return NextResponse.json(
        { error: 'No payment URL returned' },
        { status: 502 }
      )
    }

    return NextResponse.json({ payment_url })
  } catch (err) {
    console.error('WaaS checkout proxy error:', err)
    return NextResponse.json(
      { error: 'Checkout failed' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
