import { NextRequest, NextResponse } from 'next/server'

const CRM_API_URL = process.env.CRM_API_URL || 'https://sales.innexar.app/api'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const email = body.email

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        const response = await fetch(`${CRM_API_URL}/site-customers/resend-verification?email=${encodeURIComponent(email)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('Resend verification error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
