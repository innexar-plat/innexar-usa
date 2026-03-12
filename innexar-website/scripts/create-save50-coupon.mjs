import Stripe from 'stripe'
import dotenv from 'dotenv'

dotenv.config()

async function createSave50Coupon() {
    const apiKey = process.env.STRIPE_SECRET_KEY

    if (!apiKey) {
        console.error('❌ STRIPE_SECRET_KEY not found in .env file')
        process.exit(1)
    }

    const stripe = new Stripe(apiKey, {
        apiVersion: '2025-12-15.clover',
    })

    try {
        // Check if coupon already exists
        try {
            const existingCoupon = await stripe.coupons.retrieve('SAVE50')
            console.log('✅ Coupon SAVE50 already exists:')
            console.log(`- ID: ${existingCoupon.id}`)
            console.log(`- Amount Off: $${existingCoupon.amount_off / 100}`)
            console.log(`- Currency: ${existingCoupon.currency}`)
            console.log(`- Duration: ${existingCoupon.duration}`)
            return
        } catch (e) {
            // Coupon doesn't exist, create it
            console.log('Creating SAVE50 coupon...')
        }

        // Create the coupon
        const coupon = await stripe.coupons.create({
            id: 'SAVE50',
            name: 'Exit Intent Special - Save $50',
            amount_off: 5000, // $50 in cents
            currency: 'usd',
            duration: 'once',
            metadata: {
                source: 'promo-exit-intent',
                description: 'Special $50 discount for users who triggered exit intent popup'
            }
        })

        console.log('✅ Successfully created SAVE50 coupon!')
        console.log(`- ID: ${coupon.id}`)
        console.log(`- Amount Off: $${coupon.amount_off / 100}`)
        console.log(`- Currency: ${coupon.currency}`)
        console.log(`- Duration: ${coupon.duration}`)
    } catch (error) {
        console.error('❌ Error creating coupon:', error.message)
        process.exit(1)
    }
}

createSave50Coupon()

