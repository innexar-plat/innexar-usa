// Email service usando Resend (alternativa mais simples ao SMTP)
import { Resend } from 'resend'

// Função para obter instância do Resend (lazy initialization)
function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY não configurada')
  }
  return new Resend(apiKey)
}

// Função para enviar email via Resend
export async function sendEmailResend(options: {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}) {
  const resend = getResend()
  const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.CONTACT_RECIPIENT_EMAIL || 'comercial@innexar.app'

  const { data, error } = await resend.emails.send({
    from: `Innexar <${fromEmail}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo,
  })

  if (error) {
    throw new Error(`Resend error: ${error.message}`)
  }

  return data
}

// Verificar se Resend está configurado
export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

