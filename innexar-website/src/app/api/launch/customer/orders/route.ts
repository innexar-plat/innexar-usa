import { NextRequest, NextResponse } from 'next/server'

const CRM_API_URL = process.env.CRM_API_URL || 'https://sales.innexar.app/api'

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization')
        const token = request.nextUrl.searchParams.get('token')

        const headers: HeadersInit = { 'Content-Type': 'application/json' }

        if (authHeader) {
            headers['Authorization'] = authHeader
        }

        const url = token
            ? `${CRM_API_URL}/customer-auth/me/orders?token=${token}`
            : `${CRM_API_URL}/customer-auth/me/orders`

        const response = await fetch(url, { headers })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('Get orders error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
