import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, createTransporter } from '@/lib/email'
import { sendEmailResend, isResendConfigured } from '@/lib/email-resend'
import { sendEmailOAuth2, isOAuth2Configured } from '@/lib/email-oauth2'
import { getContactEmailTemplate, getAutoReplyTemplate } from '@/lib/email-templates'
import { getTranslations } from 'next-intl/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validação
    const { name, email, phone, company, projectType, budget, timeline, message, locale = 'pt' } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: name, email, message' },
        { status: 400 }
      )
    }

    // Verificar qual serviço de email usar (prioridade: OAuth2 > Resend > SMTP)
    const useOAuth2 = isOAuth2Configured()
    const useResend = !useOAuth2 && isResendConfigured()

    if (!useOAuth2 && !useResend) {
      // Validar variáveis de ambiente SMTP (se não usar OAuth2 ou Resend)
      if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.error('Variáveis de email não configuradas:', {
          hasOAuth2: !!process.env.GOOGLE_REFRESH_TOKEN,
          hasResend: !!process.env.RESEND_API_KEY,
          hasUser: !!process.env.SMTP_USER,
          hasPassword: !!process.env.SMTP_PASSWORD,
          nodeEnv: process.env.NODE_ENV,
        })
        return NextResponse.json(
          {
            error: 'Configuração de email não encontrada. Configure GOOGLE_REFRESH_TOKEN, RESEND_API_KEY ou SMTP_USER/SMTP_PASSWORD.',
            details: process.env.NODE_ENV === 'development' ? {
              hasOAuth2: !!process.env.GOOGLE_REFRESH_TOKEN,
              hasResend: !!process.env.RESEND_API_KEY,
              hasUser: !!process.env.SMTP_USER,
              hasPassword: !!process.env.SMTP_PASSWORD,
            } : undefined
          },
          { status: 500 }
        )
      }
    }

    // Carregar traduções baseado no locale
    let t
    try {
      t = await getTranslations({ locale, namespace: 'contact.email' })
    } catch (translationError) {
      console.error('Erro ao carregar traduções:', translationError)
      // Fallback para português se houver erro
      t = await getTranslations({ locale: 'pt', namespace: 'contact.email' })
    }

    const translations = {
      contactSubject: t('contactSubject'),
      contactHeader: t('contactHeader'),
      contactInfo: t('contactInfo'),
      contactProject: t('contactProject'),
      contactMessage: t('contactMessage'),
      contactFooter: t('contactFooter'),
      autoReplySubject: t('autoReplySubject'),
      autoReplyHeader: t('autoReplyHeader'),
      autoReplyGreeting: t('autoReplyGreeting'),
      autoReplyThanks: t('autoReplyThanks'),
      autoReplyReceived: t('autoReplyReceived'),
      autoReplyWhile: t('autoReplyWhile'),
      autoReplyVisit: t('autoReplyVisit'),
      autoReplyServices: t('autoReplyServices'),
      autoReplyPortfolio: t('autoReplyPortfolio'),
      autoReplySignature: t('autoReplySignature'),
      autoReplyTeam: t('autoReplyTeam'),
      autoReplyFooter: t('autoReplyFooter'),
      autoReplyAdvantages: t('autoReplyAdvantages'),
      autoReplyAdvantage1: t('autoReplyAdvantage1'),
      autoReplyAdvantage2: t('autoReplyAdvantage2'),
      autoReplyAdvantage3: t('autoReplyAdvantage3'),
      autoReplyAdvantage4: t('autoReplyAdvantage4'),
      autoReplyAdvantage5: t('autoReplyAdvantage5'),
      autoReplyAdvantage6: t('autoReplyAdvantage6'),
      autoReplyContactTitle: t('autoReplyContactTitle'),
      autoReplyContactEmail: t('autoReplyContactEmail'),
      autoReplyContactPhone: t('autoReplyContactPhone'),
      autoReplyContactWebsite: t('autoReplyContactWebsite'),
      autoReplyCta: t('autoReplyCta'),
      autoReplyCtaButton: t('autoReplyCtaButton'),
      labels: {
        name: t('labels.name'),
        email: t('labels.email'),
        phone: t('labels.phone'),
        company: t('labels.company'),
        type: t('labels.type'),
        budget: t('labels.budget'),
        timeline: t('labels.timeline'),
      },
      notInformed: t('notInformed'),
    }

    // Email de destino (do Google Workspace)
    const recipientEmail = process.env.CONTACT_RECIPIENT_EMAIL || 'comercial@innexar.app'
    const sendAutoReply = process.env.ENABLE_AUTO_REPLY !== 'false' // Default: true

    // Log de debug para identificar o problema
    console.log('📧 Configuração de Email:', {
      recipientEmail,
      useOAuth2,
      useResend,
      hasResendKey: !!process.env.RESEND_API_KEY,
      resendFromEmail: process.env.RESEND_FROM_EMAIL,
      smtpUser: process.env.SMTP_USER,
      nodeEnv: process.env.NODE_ENV,
    })

    // Template do email principal (sempre em português para você)
    const contactEmailPt = getContactEmailTemplate({
      name,
      email,
      phone: phone || '',
      company: company || '',
      projectType: projectType || '',
      budget: budget || '',
      timeline: timeline || '',
      message,
    }, await getTranslations({ locale: 'pt', namespace: 'contact.email' }).then(t => ({
      contactSubject: t('contactSubject'),
      contactHeader: t('contactHeader'),
      contactInfo: t('contactInfo'),
      contactProject: t('contactProject'),
      contactMessage: t('contactMessage'),
      contactFooter: t('contactFooter'),
      autoReplySubject: t('autoReplySubject'),
      autoReplyHeader: t('autoReplyHeader'),
      autoReplyGreeting: t('autoReplyGreeting'),
      autoReplyThanks: t('autoReplyThanks'),
      autoReplyReceived: t('autoReplyReceived'),
      autoReplyWhile: t('autoReplyWhile'),
      autoReplyVisit: t('autoReplyVisit'),
      autoReplyServices: t('autoReplyServices'),
      autoReplyPortfolio: t('autoReplyPortfolio'),
      autoReplySignature: t('autoReplySignature'),
      autoReplyTeam: t('autoReplyTeam'),
      autoReplyFooter: t('autoReplyFooter'),
      autoReplyAdvantages: t('autoReplyAdvantages'),
      autoReplyAdvantage1: t('autoReplyAdvantage1'),
      autoReplyAdvantage2: t('autoReplyAdvantage2'),
      autoReplyAdvantage3: t('autoReplyAdvantage3'),
      autoReplyAdvantage4: t('autoReplyAdvantage4'),
      autoReplyAdvantage5: t('autoReplyAdvantage5'),
      autoReplyAdvantage6: t('autoReplyAdvantage6'),
      autoReplyContactTitle: t('autoReplyContactTitle'),
      autoReplyContactEmail: t('autoReplyContactEmail'),
      autoReplyContactPhone: t('autoReplyContactPhone'),
      autoReplyContactWebsite: t('autoReplyContactWebsite'),
      autoReplyCta: t('autoReplyCta'),
      autoReplyCtaButton: t('autoReplyCtaButton'),
      labels: {
        name: t('labels.name'),
        email: t('labels.email'),
        phone: t('labels.phone'),
        company: t('labels.company'),
        type: t('labels.type'),
        budget: t('labels.budget'),
        timeline: t('labels.timeline'),
      },
      notInformed: t('notInformed'),
    })))

    // Função helper para enviar email (prioridade: OAuth2 > Resend > SMTP)
    const sendEmailFunction = useOAuth2 ? sendEmailOAuth2 : (useResend ? sendEmailResend : sendEmail)

    // Enviar email principal para você (sempre em português)
    console.log(`📤 Enviando email para: ${recipientEmail}`)
    try {
      const emailResult = await sendEmailFunction({
        to: recipientEmail,
        subject: contactEmailPt.subject,
        html: contactEmailPt.html,
        text: contactEmailPt.text,
        replyTo: email, // Permite responder diretamente ao cliente
      })
      console.log('✅ Email enviado com sucesso:', emailResult)
    } catch (emailError: any) {
      console.error('❌ Erro ao enviar email principal:', {
        message: emailError.message,
        stack: emailError.stack,
        to: recipientEmail,
        service: useOAuth2 ? 'OAuth2' : (useResend ? 'Resend' : 'SMTP'),
      })
      throw emailError
    }

    // Enviar resposta automática para o cliente (no idioma dele)
    if (sendAutoReply) {
      console.log(`📧 Enviando resposta automática para cliente: ${email}`)
      try {
        const autoReply = getAutoReplyTemplate({ name, email }, translations)
        console.log(`📤 Resposta automática - Para: ${email}, Assunto: ${autoReply.subject}`)
        const autoReplyResult = await sendEmailFunction({
          to: email,
          subject: autoReply.subject,
          html: autoReply.html,
          text: autoReply.text,
        })
        console.log('✅ Resposta automática enviada com sucesso:', autoReplyResult)
      } catch (autoReplyError: any) {
        // Não falhar se a resposta automática der erro
        console.error('❌ Erro ao enviar resposta automática:', {
          message: autoReplyError.message,
          stack: autoReplyError.stack,
          to: email,
          service: useOAuth2 ? 'OAuth2' : (useResend ? 'Resend' : 'SMTP'),
        })
      }
    } else {
      console.log('⚠️ Resposta automática desabilitada (ENABLE_AUTO_REPLY=false)')
    }

    // Enviar para o CRM via webhook (opcional, não bloqueia o envio do email)
    const crmWebhookUrl = process.env.CRM_WEBHOOK_URL || 'https://api.sales.innexar.app/api/webhooks/contact'
    const webhookSecret = process.env.CRM_WEBHOOK_SECRET

    try {
      const webhookPayload: any = {
        name,
        email,
        phone: phone || '',
        company: company || '',
        message,
        source: 'website',
        projectType: projectType || '',
        budget: budget || '',
        timeline: timeline || ''
      }

      const webhookHeaders: any = {
        'Content-Type': 'application/json'
      }

      if (webhookSecret) {
        webhookHeaders['Authorization'] = `Bearer ${webhookSecret}`
      }

      // Fazer chamada assíncrona (não aguardar resposta)
      fetch(crmWebhookUrl, {
        method: 'POST',
        headers: webhookHeaders,
        body: JSON.stringify(webhookPayload)
      }).catch(err => {
        console.error('Erro ao enviar para CRM (não crítico):', err)
      })
    } catch (webhookError) {
      console.error('Erro ao preparar webhook para CRM (não crítico):', webhookError)
    }

    return NextResponse.json(
      { message: 'Mensagem enviada com sucesso!' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Erro ao processar formulário de contato:', error)
    console.error('Stack trace:', error.stack)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
    })

    // Erro de configuração SMTP
    if (error.code === 'EAUTH' || error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      return NextResponse.json(
        {
          error: 'Erro de configuração de email. Verifique as credenciais SMTP no Vercel.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      )
    }

    // Erro de parsing JSON
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Erro ao processar os dados do formulário.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Erro ao processar a mensagem. Tente novamente.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

