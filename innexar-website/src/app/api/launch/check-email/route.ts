import { NextRequest, NextResponse } from 'next/server'

const CRM_API_URL = process.env.CRM_API_URL || 'https://sales.innexar.app/api'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
        return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    try {
        const response = await fetch(`${CRM_API_URL}/site-customers/check-email?email=${encodeURIComponent(email)}`)
        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error checking email:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
