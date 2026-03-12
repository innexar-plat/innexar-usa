// Teste de email via API do Next.js
// Execute: npm run dev (em outro terminal) e depois: node test-email-api.js
// Requer Node.js 18+ (fetch nativo)

async function testEmailAPI() {
  console.log('🧪 Testando envio de email via API do Next.js...\n')
  
  const testData = {
    name: 'Teste Automatizado',
    email: 'teste@example.com',
    phone: '+55 11 99999-9999',
    company: 'Innexar',
    projectType: 'Web Development',
    budget: 'R$ 50.000 - R$ 100.000',
    timeline: '3-6 meses',
    message: 'Este é um email de teste automatizado para verificar o funcionamento do sistema de envio de emails.',
    locale: 'pt'
  }

  console.log('📤 Enviando dados de teste...')
  console.log(`   Nome: ${testData.name}`)
  console.log(`   Email: ${testData.email}`)
  console.log(`   Locale: ${testData.locale}\n`)

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
      console.log('✅ Email enviado com sucesso!')
      console.log(`   Status: ${response.status}`)
      console.log(`   Mensagem: ${data.message}\n`)
      console.log('📬 Verifique:')
      console.log(`   - Email principal: ${process.env.CONTACT_RECIPIENT_EMAIL || 'comercial@innexar.app'}`)
      console.log(`   - Email de resposta automática: ${testData.email}\n`)
    } else {
      console.error('❌ ERRO ao enviar email:')
      console.error(`   Status: ${response.status}`)
      console.error(`   Erro: ${data.error}`)
      if (data.details) {
        console.error(`   Detalhes:`, data.details)
      }
      console.error('\n💡 Verifique:')
      console.error('   1. O servidor está rodando? (npm run dev)')
      console.error('   2. As variáveis SMTP estão configuradas no .env.local?')
      console.error('   3. A senha de app está correta?')
    }
  } catch (error) {
    console.error('❌ ERRO de conexão:')
    console.error(`   ${error.message}\n`)
    console.error('💡 Certifique-se de que o servidor está rodando:')
    console.error('   npm run dev')
  }
}

testEmailAPI()

