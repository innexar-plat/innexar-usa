// Teste de envio de email via OAuth2
require('dotenv').config({ path: '.env.local' })

async function testOAuth2() {
  console.log('🧪 Testando envio de email via OAuth2 (Gmail API)...\n')

  // Verificar variáveis
  console.log('📋 Verificando Variáveis:')
  console.log('-'.repeat(60))
  console.log(`   Client ID: ${process.env.GOOGLE_CLIENT_ID ? '✅ Configurado' : '❌ Não configurado'}`)
  console.log(`   Client Secret: ${process.env.GOOGLE_CLIENT_SECRET ? '✅ Configurado' : '❌ Não configurado'}`)
  console.log(`   Refresh Token: ${process.env.GOOGLE_REFRESH_TOKEN ? '✅ Configurado' : '❌ Não configurado'}`)
  console.log(`   From Email: ${process.env.GOOGLE_FROM_EMAIL || process.env.SMTP_USER || 'Não configurado'}\n`)

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
    console.error('❌ ERRO: Variáveis OAuth2 não configuradas!')
    process.exit(1)
  }

  // Testar via API do Next.js
  console.log('📤 Testando via API do Next.js...\n')
  
  const testData = {
    name: 'Teste OAuth2',
    email: process.env.CONTACT_RECIPIENT_EMAIL || 'comercial@innexar.app',
    phone: '+55 11 99999-9999',
    company: 'Innexar',
    projectType: 'Teste',
    budget: 'Teste',
    timeline: 'Teste',
    message: 'Este é um teste de envio de email via OAuth2 (Gmail API).',
    locale: 'pt'
  }

  try {
    const response = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    })

    const data = await response.json()

    if (response.ok) {
      console.log('✅ Email enviado com sucesso via OAuth2!')
      console.log(`   Status: ${response.status}`)
      console.log(`   Mensagem: ${data.message}\n`)
      console.log('📬 Verifique sua caixa de entrada!\n')
    } else {
      console.error('❌ ERRO ao enviar email:')
      console.error(`   Status: ${response.status}`)
      console.error(`   Erro: ${data.error}`)
      if (data.details) {
        console.error(`   Detalhes:`, data.details)
      }
    }
  } catch (error) {
    console.error('❌ ERRO de conexão:')
    console.error(`   ${error.message}\n`)
    console.error('💡 Certifique-se de que o servidor está rodando:')
    console.error('   npm run dev')
  }
}

// Verificar se fetch está disponível (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ Node.js 18+ é necessário para este teste')
  process.exit(1)
}

testOAuth2().catch(console.error)

