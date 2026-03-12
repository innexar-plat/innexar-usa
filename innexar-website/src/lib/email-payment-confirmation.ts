/**
 * Payment Confirmation Email Template — i18n (en/pt/es)
 * Sent to customer after successful payment
 */

type PaymentEmailStrings = {
  subject: string
  headerTitle: string
  headerSubtitle: string
  greeting: string
  message: string
  orderTitle: string
  customerEmail: string
  amountPaid: string
  deliveryTime: string
  deliveryValue: string
  packageLabel: string
  packageValue: string
  nextStepsTitle: string
  ctaLabel: string
  questions: string
  thanks: string
  copyright: string
}

const PAYMENT_STRINGS: Record<string, PaymentEmailStrings> = {
  en: {
    subject: 'Order Confirmed #{orderId} — Your Website is Coming!',
    headerTitle: 'Payment Confirmed!',
    headerSubtitle: 'Your website journey begins now',
    greeting: 'Hi {name}! 👋',
    message: "We've received your payment and your order is confirmed! We're excited to build your professional website.",
    orderTitle: 'Your Order ID',
    customerEmail: 'Customer Email',
    amountPaid: 'Amount Paid',
    deliveryTime: 'Delivery Time',
    deliveryValue: '48 hours',
    packageLabel: 'Package',
    packageValue: 'Professional Website',
    nextStepsTitle: 'What happens next?',
    ctaLabel: 'Complete Onboarding Form →',
    questions: 'Questions? Reply to this email or contact us at',
    thanks: 'Thank you for choosing Innexar!',
    copyright: '© 2026 Innexar. All rights reserved.',
  },
  pt: {
    subject: 'Pedido Confirmado #{orderId} — Seu Site Está a Caminho!',
    headerTitle: 'Pagamento Confirmado!',
    headerSubtitle: 'Sua jornada digital começa agora',
    greeting: 'Olá {name}! 👋',
    message: 'Recebemos seu pagamento e seu pedido está confirmado! Estamos animados para construir seu site profissional.',
    orderTitle: 'Número do Pedido',
    customerEmail: 'E-mail do Cliente',
    amountPaid: 'Valor Pago',
    deliveryTime: 'Prazo de Entrega',
    deliveryValue: '48 horas',
    packageLabel: 'Pacote',
    packageValue: 'Site Profissional',
    nextStepsTitle: 'O que acontece agora?',
    ctaLabel: 'Preencher Formulário de Onboarding →',
    questions: 'Dúvidas? Responda este e-mail ou entre em contato em',
    thanks: 'Obrigado por escolher a Innexar!',
    copyright: '© 2026 Innexar. Todos os direitos reservados.',
  },
  es: {
    subject: 'Pedido Confirmado #{orderId} — ¡Su Sitio Web Está en Camino!',
    headerTitle: '¡Pago Confirmado!',
    headerSubtitle: 'Su viaje digital comienza ahora',
    greeting: '¡Hola {name}! 👋',
    message: '¡Hemos recibido su pago y su pedido está confirmado! Estamos emocionados de construir su sitio web profesional.',
    orderTitle: 'ID del Pedido',
    customerEmail: 'Correo del Cliente',
    amountPaid: 'Monto Pagado',
    deliveryTime: 'Tiempo de Entrega',
    deliveryValue: '48 horas',
    packageLabel: 'Paquete',
    packageValue: 'Sitio Web Profesional',
    nextStepsTitle: '¿Qué sucede ahora?',
    ctaLabel: 'Completar Formulario de Onboarding →',
    questions: '¿Preguntas? Responda este correo o contáctenos en',
    thanks: '¡Gracias por elegir Innexar!',
    copyright: '© 2026 Innexar. Todos los derechos reservados.',
  },
}

function getPaymentStrings(locale: string): PaymentEmailStrings {
  return PAYMENT_STRINGS[locale] || PAYMENT_STRINGS.en
}

export function getPaymentConfirmationTemplate(data: {
  orderId: string
  customerName: string
  customerEmail: string
  amount: number
  currency: string
  nextSteps: string[]
  locale?: string
}) {
  const locale = data.locale || 'en'
  const s = getPaymentStrings(locale)
  const lang = locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es' : 'en'
  const subject = s.subject.replace('{orderId}', data.orderId)
  const greeting = s.greeting.replace('{name}', data.customerName)
  const formattedAmount = `${data.currency} $${(data.amount / 100).toFixed(2)}`

  return {
    subject,
    html: `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      line-height: 1.7; 
      color: #1a1a1a; 
      background-color: #f5f7fa;
    }
    .email-container { 
      max-width: 600px; 
      margin: 40px auto; 
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header { 
      background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
      padding: 50px 40px;
      text-align: center;
    }
    .success-icon { font-size: 64px; margin-bottom: 16px; }
    .header-title { color: #ffffff; font-size: 32px; font-weight: 800; margin-bottom: 8px; }
    .header-subtitle { color: rgba(255, 255, 255, 0.9); font-size: 16px; font-weight: 500; }
    .content { padding: 40px; }
    .greeting { font-size: 20px; color: #111827; margin-bottom: 20px; font-weight: 600; }
    .message { font-size: 16px; color: #4b5563; margin-bottom: 24px; line-height: 1.6; }
    .order-box {
      background: #f9fafb;
      border: 2px solid #10b981;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    .order-title { font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; font-weight: 600; }
    .order-id { font-size: 24px; color: #10b981; font-weight: 700; font-family: 'Courier New', monospace; }
    .details-section { margin: 32px 0; }
    .details-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .details-row:last-child { border-bottom: none; }
    .details-label { color: #6b7280; font-size: 14px; font-weight: 500; }
    .details-value { color: #111827; font-size: 14px; font-weight: 600; }
    .next-steps {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border-left: 4px solid #3b82f6;
      padding: 24px;
      border-radius: 8px;
      margin: 32px 0;
    }
    .next-steps-title { font-size: 18px; font-weight: 700; color: #1e40af; margin-bottom: 16px; }
    .next-steps-list { list-style: none; padding: 0; }
    .next-steps-list li { padding: 10px 0; color: #475569; font-size: 15px; padding-left: 28px; position: relative; }
    .next-steps-list li::before { content: '→'; position: absolute; left: 0; color: #3b82f6; font-weight: 700; font-size: 18px; }
    .cta-button {
      display: inline-block; background: #10b981; color: #ffffff;
      padding: 16px 32px; border-radius: 8px; text-decoration: none;
      font-weight: 700; font-size: 16px; margin: 24px 0; text-align: center;
    }
    .footer { 
      background: #f9fafb; padding: 32px; text-align: center; 
      color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb;
    }
    .footer-links { margin: 16px 0; }
    .footer-links a { color: #3b82f6; text-decoration: none; margin: 0 12px; font-weight: 500; }
    @media only screen and (max-width: 600px) {
      .content { padding: 24px; }
      .header { padding: 32px 24px; }
      .details-row { flex-direction: column; gap: 4px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="success-icon">✅</div>
      <div class="header-title">${s.headerTitle}</div>
      <div class="header-subtitle">${s.headerSubtitle}</div>
    </div>
    <div class="content">
      <div class="greeting">${greeting}</div>
      <div class="message">${s.message}</div>

      <div class="order-box">
        <div class="order-title">${s.orderTitle}</div>
        <div class="order-id">#${data.orderId}</div>
      </div>

      <div class="details-section">
        <div class="details-row">
          <span class="details-label">${s.customerEmail}</span>
          <span class="details-value">${data.customerEmail}</span>
        </div>
        <div class="details-row">
          <span class="details-label">${s.amountPaid}</span>
          <span class="details-value">${formattedAmount}</span>
        </div>
        <div class="details-row">
          <span class="details-label">${s.deliveryTime}</span>
          <span class="details-value">${s.deliveryValue}</span>
        </div>
        <div class="details-row">
          <span class="details-label">${s.packageLabel}</span>
          <span class="details-value">${s.packageValue}</span>
        </div>
      </div>

      <div class="next-steps">
        <div class="next-steps-title">${s.nextStepsTitle}</div>
        <ul class="next-steps-list">
${data.nextSteps.map(step => `          <li>${step}</li>`).join('\n')}
        </ul>
      </div>

      <div style="text-align: center;">
        <a href="https://innexar.app/${locale}/launch/success?session_id=${data.orderId}" class="cta-button">
          ${s.ctaLabel}
        </a>
      </div>

      <div class="message" style="margin-top: 32px; font-size: 14px;">
        <strong>${s.questions}</strong> <a href="mailto:support@innexar.app" style="color: #3b82f6;">support@innexar.app</a>
      </div>
    </div>
    <div class="footer">
      <p>${s.thanks}</p>
      <div class="footer-links">
        <a href="https://innexar.app">Website</a>
        <a href="mailto:support@innexar.app">Support</a>
      </div>
      <p style="margin-top: 16px; color: #9ca3af;">${s.copyright}</p>
    </div>
  </div>
</body>
</html>
        `,
    text: `
✅ ${s.headerTitle.toUpperCase()}

${greeting}

${s.message}

${s.orderTitle}: #${data.orderId}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${s.customerEmail}: ${data.customerEmail}
${s.amountPaid}: ${formattedAmount}
${s.deliveryTime}: ${s.deliveryValue}
${s.packageLabel}: ${s.packageValue}

${s.nextStepsTitle}
${data.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

${s.ctaLabel}
https://innexar.app/${locale}/launch/success?session_id=${data.orderId}

${s.questions}
support@innexar.app

${s.thanks}
        `,
  }
}
