import nodemailer from 'nodemailer'
import { getSMTPConfig } from './system-config'

// Configuração do transporter SMTP
export async function createTransporter() {
  // Fetch SMTP config from CRM database
  const config = await getSMTPConfig()

  // Remover espaços da senha (caso tenha)
  const password = (config.smtp_password || '').replace(/\s/g, '')

  const smtpConfig = {
    host: config.smtp_host || 'smtp.gmail.com',
    port: parseInt(config.smtp_port || '587'),
    secure: config.smtp_secure === 'true', // true para 465, false para outras portas
    auth: {
      user: config.smtp_user || '',
      pass: password, // App Password do Google Workspace (sem espaços)
    },
    // Timeout aumentado para evitar erros de conexão
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000,
    // TLS config para Google Workspace
    tls: {
      rejectUnauthorized: false, // Aceita certificados auto-assinados
    },
  }

  if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
    throw new Error('SMTP credentials not configured in CRM Settings. Please configure SMTP in the admin panel.')
  }

  // Validar que a senha não está vazia (removida validação de 16 caracteres para suportar Mailcow)
  if (password.length === 0) {
    console.warn(`⚠️ Aviso: SMTP_PASSWORD está vazia. Verifique a configuração.`)
  }

  return nodemailer.createTransport(smtpConfig)
}

// Template de email principal (para você receber)
export function getContactEmailTemplate(data: {
  name: string
  email: string
  phone: string
  company: string
  projectType: string
  budget: string
  timeline: string
  message: string
}) {
  return {
    subject: `Novo contato do site - ${data.name}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .section { margin-bottom: 25px; }
    .label { font-weight: bold; color: #1e40af; }
    .message-box { background: white; padding: 20px; border-left: 4px solid #3b82f6; margin-top: 15px; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>📧 Novo Contato do Site Innexar</h2>
    </div>
    <div class="content">
      <div class="section">
        <h3>👤 Informações do Contato</h3>
        <p><span class="label">Nome:</span> ${data.name}</p>
        <p><span class="label">Email:</span> <a href="mailto:${data.email}">${data.email}</a></p>
        <p><span class="label">Telefone:</span> <a href="tel:${data.phone}">${data.phone}</a></p>
        <p><span class="label">Empresa:</span> ${data.company || 'Não informado'}</p>
      </div>
      
      <div class="section">
        <h3>💼 Detalhes do Projeto</h3>
        <p><span class="label">Tipo:</span> ${data.projectType || 'Não informado'}</p>
        <p><span class="label">Orçamento:</span> ${data.budget || 'Não informado'}</p>
        <p><span class="label">Prazo:</span> ${data.timeline || 'Não informado'}</p>
      </div>
      
      <div class="section">
        <h3>💬 Mensagem</h3>
        <div class="message-box">
          ${data.message.replace(/\n/g, '<br>')}
        </div>
      </div>
    </div>
    <div class="footer">
      Este email foi enviado automaticamente através do formulário de contato do site Innexar.
    </div>
  </div>
</body>
</html>
    `,
    text: `
Olá,

Você recebeu uma nova mensagem através do formulário de contato do site Innexar:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 INFORMAÇÕES DO CONTATO

Nome: ${data.name}
Email: ${data.email}
Telefone: ${data.phone}
Empresa: ${data.company || 'Não informado'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💼 DETALHES DO PROJETO

Tipo de Projeto: ${data.projectType || 'Não informado'}
Orçamento: ${data.budget || 'Não informado'}
Prazo: ${data.timeline || 'Não informado'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 MENSAGEM

${data.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Este email foi enviado automaticamente através do formulário de contato do site.
    `,
  }
}

// Template de resposta automática
export function getAutoReplyTemplate(data: { name: string; email: string }) {
  return {
    subject: 'Recebemos sua mensagem - Innexar',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>✅ Mensagem Recebida</h2>
    </div>
    <div class="content">
      <p>Olá <strong>${data.name}</strong>,</p>
      
      <p>Obrigado por entrar em contato com a <strong>Innexar</strong>!</p>
      
      <p>Recebemos sua mensagem e nossa equipe entrará em contato em breve.</p>
      
      <p>Enquanto isso, você pode:</p>
      <ul>
        <li>Visitar nosso site: <a href="https://innexar.app">innexar.app</a></li>
        <li>Conhecer nossos serviços e soluções</li>
        <li>Ver nosso portfólio de projetos</li>
      </ul>
      
      <p>Atenciosamente,<br>
      <strong>Equipe Innexar</strong></p>
    </div>
    <div class="footer">
      Este é um email automático. Por favor, não responda este email.
    </div>
  </div>
</body>
</html>
    `,
    text: `
Olá ${data.name},

Obrigado por entrar em contato com a Innexar!

Recebemos sua mensagem e nossa equipe entrará em contato em breve.

Atenciosamente,
Equipe Innexar
    `,
  }
}

// Função para enviar email
export async function sendEmail(options: {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}) {
  const transporter = await createTransporter()
  const smtpConfig = await getSMTPConfig()
  const fromEmail = smtpConfig.smtp_from_email || smtpConfig.smtp_user || ''

  const mailOptions = {
    from: `"Innexar" <${fromEmail}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo,
  }

  return await transporter.sendMail(mailOptions)
}

