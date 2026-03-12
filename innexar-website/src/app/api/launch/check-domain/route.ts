import { NextRequest, NextResponse } from 'next/server'

const CRM_API_URL = process.env.CRM_API_URL || 'https://sales.innexar.app/api'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { domain } = body

        if (!domain) {
            return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
        }

        // Add timeout to prevent hanging (increased to 45s to allow Dynadot API to respond)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 45000) // 45 seconds

        try {
            console.log(`[Check Domain] Requesting check for domain: ${domain}`)
            const response = await fetch(`${CRM_API_URL}/public-domain/check`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ domain }),
                signal: controller.signal
            })
            console.log(`[Check Domain] Response status: ${response.status}`)

            clearTimeout(timeoutId)

            // Even if response is not ok, try to parse JSON to get error details
            let data
            try {
                data = await response.json()
            } catch {
                const errorText = await response.text()
                return NextResponse.json(
                    { 
                        success: false,
                        error: errorText || 'Error checking domain',
                        result: {
                            available: false,
                            error: errorText || 'Error checking domain',
                            domain: domain
                        }
                    },
                    { status: response.status || 500 }
                )
            }

            // Return data as-is (backend handles success/error in result)
            return NextResponse.json(data)
        } catch (fetchError: any) {
            clearTimeout(timeoutId)
            if (fetchError.name === 'AbortError') {
                return NextResponse.json(
                    { 
                        success: false,
                        error: 'Request timeout - please try again',
                        result: {
                            available: false,
                            error: 'Request timeout - please try again',
                            domain: domain
                        }
                    },
                    { status: 408 }
                )
            }
            throw fetchError
        }
    } catch (error: any) {
        console.error('Error checking domain:', error)
        return NextResponse.json(
            { 
                success: false,
                error: error.message || 'Internal server error',
                result: {
                    available: false,
                    error: error.message || 'Internal server error',
                    domain: null
                }
            },
            { status: 500 }
        )
    }
}
