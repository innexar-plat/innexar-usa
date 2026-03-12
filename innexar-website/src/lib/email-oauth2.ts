// Email service usando OAuth2 (Gmail API) - Alternativa ao SMTP
import { google } from 'googleapis'

// Configurar OAuth2 Client
function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://developers.google.com/oauthplayground'

  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET devem estar configurados')
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

// Obter access token usando refresh token
async function getAccessToken() {
  const oauth2Client = getOAuth2Client()
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (!refreshToken) {
    throw new Error('GOOGLE_REFRESH_TOKEN deve estar configurado')
  }

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  })

  try {
    const { credentials } = await oauth2Client.refreshAccessToken()
    return credentials.access_token
  } catch (error: any) {
    throw new Error(`Erro ao obter access token: ${error.message}`)
  }
}

// Enviar email via Gmail API
export async function sendEmailOAuth2(options: {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}) {
  const accessToken = await getAccessToken()
  const fromEmail = process.env.GOOGLE_FROM_EMAIL || process.env.SMTP_USER || 'comercial@innexar.app'

  // Criar mensagem MIME multipart (HTML + texto)
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const message = [
    `From: Innexar <${fromEmail}>`,
    `To: ${options.to}`,
    `Subject: ${options.subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    options.replyTo ? `Reply-To: ${options.replyTo}` : '',
    '',
    `--${boundary}`,
    `Content-Type: text/plain; charset=utf-8`,
    `Content-Transfer-Encoding: 7bit`,
    '',
    options.text,
    '',
    `--${boundary}`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: 7bit`,
    '',
    options.html,
    '',
    `--${boundary}--`,
  ]
    .filter(Boolean)
    .join('\r\n')

  // Codificar em base64url (Gmail API requer)
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  // Enviar via Gmail API
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: encodedMessage,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(`Gmail API error: ${error.error?.message || response.statusText}`)
  }

  return await response.json()
}

// Verificar se OAuth2 está configurado
export function isOAuth2Configured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  )
}

