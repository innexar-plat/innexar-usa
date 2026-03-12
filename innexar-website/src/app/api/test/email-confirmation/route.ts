import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { getPaymentConfirmationTemplate } from '@/lib/email-payment-confirmation'

/**
 * Test endpoint to send payment confirmation email
 * Usage: POST /api/test/email-confirmation
 * Body: { "email": "test@example.com", "name": "John Doe" }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const testEmail = body.email || 'test@example.com'
        const testName = body.name || 'Test Customer'

        console.log('Testing payment confirmation email to:', testEmail)

        const emailTemplate = getPaymentConfirmationTemplate({
            orderId: 'cs_test_' + Date.now(),
            customerName: testName,
            customerEmail: testEmail,
            amount: 19900, // $199 in cents
            currency: 'USD',
            nextSteps: [
                'Complete the onboarding form with your business details',
                'Our team will start working on your website immediately',
                'You\'ll receive your first draft within 48 hours',
                'Request any revisions (2 included)',
                'Get your final website delivered!'
            ]
        })

        await sendEmail({
            to: testEmail,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text,
        })

        console.log('✅ Test email sent successfully to:', testEmail)

        return NextResponse.json({
            success: true,
            message: 'Test email sent successfully',
            sentTo: testEmail,
        })
    } catch (error) {
        console.error('❌ Error sending test email:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}

export const dynamic = 'force-dynamic'
