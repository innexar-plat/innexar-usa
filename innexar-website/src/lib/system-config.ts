// Fetches Stripe keys from CRM backend via internal Docker network
// CRM_API_URL should be http://crm-backend:8000/api for internal access

const CRM_API_URL = process.env.CRM_API_URL || 'http://crm-backend:8000/api'

export interface StripeConfig {
    stripe_secret_key?: string
    stripe_publishable_key?: string
    stripe_webhook_secret?: string
}

export interface SMTPConfig {
    smtp_host?: string
    smtp_port?: string
    smtp_secure?: string
    smtp_user?: string
    smtp_password?: string
    smtp_from_email?: string
}

let cachedConfig: StripeConfig | null = null
let cacheTimestamp: number = 0
let cachedSMTPConfig: SMTPConfig | null = null
let smtpCacheTimestamp: number = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function fetchStripeConfig(): Promise<StripeConfig> {
    const now = Date.now()

    // Return cached config if still valid
    if (cachedConfig && (now - cacheTimestamp) < CACHE_TTL) {
        return cachedConfig
    }

    try {
        // Use the public-config endpoint which doesn't require auth
        const response = await fetch(`${CRM_API_URL}/public-config/stripe/keys`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        })

        if (!response.ok) {
            console.error('Failed to fetch Stripe config:', response.status)
            return {}
        }

        const config = await response.json()
        cachedConfig = config
        cacheTimestamp = now
        console.log('Loaded Stripe config from CRM')

        return config
    } catch (error) {
        console.error('Error fetching Stripe config from CRM:', error)
        return {}
    }
}

async function fetchSMTPConfig(): Promise<SMTPConfig> {
    const now = Date.now()

    // Return cached config if still valid
    if (cachedSMTPConfig && (now - smtpCacheTimestamp) < CACHE_TTL) {
        return cachedSMTPConfig
    }

    try {
        const response = await fetch(`${CRM_API_URL}/public-config/smtp/config`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
        })

        if (!response.ok) {
            console.error('Failed to fetch SMTP config:', response.status)
            return {}
        }

        const config = await response.json()
        cachedSMTPConfig = config
        smtpCacheTimestamp = now
        console.log('Loaded SMTP config from CRM')

        return config
    } catch (error) {
        console.error('Error fetching SMTP config from CRM:', error)
        return {}
    }
}

export async function getStripeSecretKey(): Promise<string> {
    const config = await fetchStripeConfig()
    const key = config.stripe_secret_key || process.env.STRIPE_SECRET_KEY

    if (!key) {
        throw new Error('Stripe secret key not configured. Configure in CRM Settings or set STRIPE_SECRET_KEY env var.')
    }

    return key
}

export async function getStripeWebhookSecret(): Promise<string> {
    const config = await fetchStripeConfig()
    return config.stripe_webhook_secret || process.env.STRIPE_WEBHOOK_SECRET || ''
}

export async function getStripePublishableKey(): Promise<string> {
    const config = await fetchStripeConfig()
    return config.stripe_publishable_key || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
}

export async function getSMTPConfig(): Promise<SMTPConfig> {
    const config = await fetchSMTPConfig()

    // Fallback to environment variables
    return {
        smtp_host: config.smtp_host || process.env.SMTP_HOST,
        smtp_port: config.smtp_port || process.env.SMTP_PORT,
        smtp_secure: config.smtp_secure || process.env.SMTP_SECURE,
        smtp_user: config.smtp_user || process.env.SMTP_USER,
        smtp_password: config.smtp_password || process.env.SMTP_PASSWORD,
        smtp_from_email: config.smtp_from_email || process.env.SMTP_FROM_EMAIL,
    }
}
