// Script de teste para envio de email
// Execute: node test-email.js

require('dotenv').config({ path: '.env.local' })
const nodemailer = require('nodemailer')

async function testEmail() {
  console.log('🧪 Testando configuração SMTP...\n')

  // Verificar variáveis de ambiente
  const smtpConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  }

  console.log('📋 Configuração SMTP:')
  console.log(`   Host: ${smtpConfig.host}`)
  console.log(`   Port: ${smtpConfig.port}`)
  console.log(`   Secure: ${smtpConfig.secure}`)
  console.log(`   User: ${smtpConfig.auth.user ? '✅ Configurado' : '❌ Não configurado'}`)
  console.log(`   Password: ${smtpConfig.auth.pass ? '✅ Configurado' : '❌ Não configurado'}\n`)

  if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
    console.error('❌ ERRO: Variáveis SMTP_USER e SMTP_PASSWORD devem estar configuradas no .env.local')
    process.exit(1)
  }

  // Criar transporter
  const transporter = nodemailer.createTransport(smtpConfig)

  // Verificar conexão
  console.log('🔌 Verificando conexão SMTP...')
  try {
    await transporter.verify()
    console.log('✅ Conexão SMTP verificada com sucesso!\n')
  } catch (error) {
    console.error('❌ ERRO ao verificar conexão SMTP:')
    console.error(`   ${error.message}\n`)
    
    if (error.code === 'EAUTH') {
      console.error('💡 Dica: Verifique se:')
      console.error('   - A senha de app está correta (sem espaços)')
      console.error('   - A verificação em 2 etapas está ativada')
      console.error('   - Você está usando App Password, não a senha normal\n')
    }
    
    process.exit(1)
  }

  // Enviar email de teste
  const testEmail = process.env.CONTACT_RECIPIENT_EMAIL || smtpConfig.auth.user
  console.log(`📧 Enviando email de teste para: ${testEmail}`)

  const mailOptions = {
    from: `"Innexar Test" <${smtpConfig.auth.user}>`,
    to: testEmail,
    subject: '🧪 Teste de Email - Innexar',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>✅ Teste de Email Bem-Sucedido!</h2>
    </div>
    <div class="content">
      <p>Parabéns! O sistema de envio de emails está funcionando corretamente.</p>
      <p><strong>Configuração:</strong></p>
      <ul>
        <li>Host: ${smtpConfig.host}</li>
        <li>Porta: ${smtpConfig.port}</li>
        <li>Usuário: ${smtpConfig.auth.user}</li>
      </ul>
      <p>Este é um email de teste enviado automaticamente pelo script de teste.</p>
    </div>
    <div class="footer">
      Sistema de Email Innexar - Teste Automatizado
    </div>
  </div>
</body>
</html>
    `,
    text: `
✅ Teste de Email Bem-Sucedido!

Parabéns! O sistema de envio de emails está funcionando corretamente.

Configuração:
- Host: ${smtpConfig.host}
- Porta: ${smtpConfig.port}
- Usuário: ${smtpConfig.auth.user}

Este é um email de teste enviado automaticamente pelo script de teste.
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email enviado com sucesso!')
    console.log(`   Message ID: ${info.messageId}`)
    console.log(`   Response: ${info.response}\n`)
    console.log('📬 Verifique sua caixa de entrada (e spam) para confirmar o recebimento.\n')
  } catch (error) {
    console.error('❌ ERRO ao enviar email:')
    console.error(`   ${error.message}\n`)
    
    if (error.code === 'EAUTH') {
      console.error('💡 Dica: Verifique as credenciais SMTP no .env.local')
    } else if (error.code === 'ECONNECTION') {
      console.error('💡 Dica: Verifique a conexão com o servidor SMTP')
    }
    
    process.exit(1)
  }
}

// Executar teste
testEmail().catch(console.error)

