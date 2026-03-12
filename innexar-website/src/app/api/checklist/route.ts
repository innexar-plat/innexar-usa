import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, createTransporter } from '@/lib/email'
import { sendEmailResend, isResendConfigured } from '@/lib/email-resend'
import { sendEmailOAuth2, isOAuth2Configured } from '@/lib/email-oauth2'
import { getChecklistEmailTemplate, getChecklistAutoReplyTemplate } from '@/lib/email-templates'
import { getTranslations } from 'next-intl/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validação
    const { name, email, phone, company, ...checklistData } = body
    const locale = body.locale || 'pt'
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: name, email' },
        { status: 400 }
      )
    }

    // Verificar qual serviço de email usar (prioridade: OAuth2 > Resend > SMTP)
    const useOAuth2 = isOAuth2Configured()
    const useResend = !useOAuth2 && isResendConfigured()
    
    if (!useOAuth2 && !useResend) {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.error('Variáveis de email não configuradas')
        return NextResponse.json(
          { error: 'Configuração de email não encontrada.' },
          { status: 500 }
        )
      }
    }

    const recipientEmail = process.env.CONTACT_RECIPIENT_EMAIL || 'comercial@innexar.app'
    const sendAutoReply = process.env.ENABLE_AUTO_REPLY !== 'false'

    // Traduções
    const translations = await getTranslations({ locale, namespace: 'checklist.email' }).then(t => ({
      checklistSubject: t('checklistSubject'),
      checklistHeader: t('checklistHeader'),
      checklistInfo: t('checklistInfo'),
      checklistData: t('checklistData'),
      checklistFooter: t('checklistFooter'),
      autoReplySubject: t('autoReplySubject'),
      autoReplyHeader: t('autoReplyHeader'),
      autoReplyGreeting: t('autoReplyGreeting'),
      autoReplyThanks: t('autoReplyThanks'),
      autoReplyReceived: t('autoReplyReceived'),
      autoReplyWhile: t('autoReplyWhile'),
      autoReplyVisit: t('autoReplyVisit'),
      autoReplySignature: t('autoReplySignature'),
      autoReplyTeam: t('autoReplyTeam'),
      autoReplyFooter: t('autoReplyFooter'),
      labels: {
        name: t('labels.name'),
        email: t('labels.email'),
        phone: t('labels.phone'),
        company: t('labels.company'),
      },
      notInformed: t('notInformed'),
    }))

    // Template do email principal
    const checklistEmail = getChecklistEmailTemplate({
      name,
      email,
      phone: phone || '',
      company: company || '',
      ...checklistData,
    }, translations)

    // Função helper para enviar email
    const sendEmailFunction = useOAuth2 ? sendEmailOAuth2 : (useResend ? sendEmailResend : sendEmail)

    // Enviar email principal
    await sendEmailFunction({
      to: recipientEmail,
      subject: checklistEmail.subject,
      html: checklistEmail.html,
      text: checklistEmail.text,
      replyTo: email,
    })

    // Enviar resposta automática
    if (sendAutoReply) {
      try {
        const autoReply = getChecklistAutoReplyTemplate({ name, email }, translations)
        await sendEmailFunction({
          to: email,
          subject: autoReply.subject,
          html: autoReply.html,
          text: autoReply.text,
        })
      } catch (autoReplyError) {
        console.warn('Erro ao enviar resposta automática:', autoReplyError)
      }
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
        source: 'checklist',
        ...checklistData
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
        console.error('Erro ao enviar checklist para CRM (não crítico):', err)
      })
    } catch (webhookError) {
      console.error('Erro ao preparar webhook para CRM (não crítico):', webhookError)
    }

    return NextResponse.json(
      { message: 'Checklist enviado com sucesso!' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Erro ao processar checklist:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar checklist. Tente novamente mais tarde.' },
      { status: 500 }
    )
  }
}

