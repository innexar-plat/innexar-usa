import { NextRequest, NextResponse } from 'next/server'

const CRM_API_URL = process.env.CRM_API_URL || 'http://crm-backend:8000/api'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
        return NextResponse.json({ error: 'Token missing' }, { status: 400 })
    }

    try {
        // First get customer info
        const customerResponse = await fetch(`${CRM_API_URL}/site-customers/me?token=${token}`, {
            headers: { 'Content-Type': 'application/json' },
        })

        if (!customerResponse.ok) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const customer = await customerResponse.json()

        // Then get order info
        const orderResponse = await fetch(`${CRM_API_URL}/site-orders/public/${customer.order_id}?order_id=${customer.order_id}`, {
            headers: { 'Content-Type': 'application/json' },
        })

        if (!orderResponse.ok) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            )
        }

        const order = await orderResponse.json()

        return NextResponse.json({
            customer,
            order,
        })
    } catch (error) {
        console.error('Me error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
