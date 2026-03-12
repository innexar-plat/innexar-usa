import { NextRequest, NextResponse } from 'next/server'

// CRM API endpoint
// If running in docker, we want to talk to the backend container
// We can use the service name 'backend' if they are in the same network
const CRM_API_URL = process.env.CRM_API_URL || 'https://sales.innexar.app/api'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    console.log(`[Session API] Request received - sessionId: ${sessionId}, CRM_API_URL: ${CRM_API_URL}`)

    if (!sessionId) {
        console.error('[Session API] Missing session_id parameter')
        return NextResponse.json(
            { error: 'Missing session_id' },
            { status: 400 }
        )
    }

    try {
        console.log(`[Session API] Fetching session via CRM: ${sessionId}`)

        // Add timeout to prevent Cloudflare 524 errors
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 seconds

        try {
            // Call Backend Public API which acts as a proxy/lookup
            // This endpoint was recently added to the backend to support session_id lookup without auth
            const response = await fetch(`${CRM_API_URL}/site-orders/public/${sessionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any necessary headers
                },
                signal: controller.signal
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unknown error')
                console.error(`[Session API] CRM returned ${response.status}: ${errorText}`)
                // If backend returns 404, we return 404
                if (response.status === 404) {
                    return NextResponse.json(
                        { error: 'Session not found in CRM', details: errorText },
                        { status: 404 }
                    )
                }
                // Other errors
                return NextResponse.json(
                    { error: 'Error querying CRM', details: errorText },
                    { status: response.status }
                )
            }

            const order = await response.json()
            console.log(`[Session API] Order found: ${order.id}, Status: ${order.status}`)

            // Mask the stripe session ID for security - show only last 8 chars
            // NOTE: Do NOT use '#' prefix as it breaks URL query parameters (browser treats it as fragment)
            const maskedOrderId = order.stripe_session_id
                ? order.stripe_session_id.slice(-8).toUpperCase()
                : String(order.id).padStart(6, '0')

            // Return the format expected by the frontend
            return NextResponse.json({
                orderId: maskedOrderId,
                realDbId: order.id, // Expose real DB ID for internal API calls (like signing)
                customerEmail: order.customer_email || '',
                total: order.total_price || 399,
                status: order.status, // Use real status from CRM
                crmStatus: order.status,
                addons: order.addons || []
            })
        } catch (fetchError: any) {
            clearTimeout(timeoutId)
            if (fetchError.name === 'AbortError') {
                console.error('[Session API] Request timeout')
                return NextResponse.json(
                    { error: 'Request timeout - please try again' },
                    { status: 408 }
                )
            }
            throw fetchError
        }
    } catch (error: any) {
        console.error('[Session API] Error fetching session:', error)
        console.error('[Session API] Error details:', error.message, error.stack)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
