import { NextRequest, NextResponse } from 'next/server'

const CRM_API_URL = process.env.CRM_API_URL || 'https://api.sales.innexar.app/api'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const authHeader = request.headers.get('Authorization')
        const token = request.nextUrl.searchParams.get('token')

        const headers: HeadersInit = { 'Content-Type': 'application/json' }
        if (authHeader) {
            headers['Authorization'] = authHeader
        }

        const url = token
            ? `${CRM_API_URL}/customer-auth/me/orders/${id}/deliverables?token=${token}`
            : `${CRM_API_URL}/customer-auth/me/orders/${id}/deliverables`

        const response = await fetch(url, { headers })
        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('Get order deliverables error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

