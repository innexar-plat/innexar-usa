import { NextRequest, NextResponse } from 'next/server'

const CRM_API_URL = process.env.CRM_API_URL || 'https://sales.innexar.app/api'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { domain, order_id, duration_years } = body

        if (!domain || !order_id) {
            return NextResponse.json({ error: 'Domain and order_id are required' }, { status: 400 })
        }

        const response = await fetch(`${CRM_API_URL}/public-domain/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                domain,
                order_id,
                duration_years: duration_years || 1
            }),
        })

        if (!response.ok) {
            const errorData = await response.text()
            return NextResponse.json(
                { error: 'Error purchasing domain', details: errorData },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error purchasing domain:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
