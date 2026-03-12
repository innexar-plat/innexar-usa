// Teste detalhado do Google Workspace SMTP
require('dotenv').config({ path: '.env.local' })
const nodemailer = require('nodemailer')

async function testGoogleWorkspace() {
  console.log('🔍 Teste Detalhado do Google Workspace SMTP\n')
  console.log('=' .repeat(60))

  // 1. Verificar variáveis de ambiente
  console.log('\n📋 1. Verificando Variáveis de Ambiente:')
  console.log('-'.repeat(60))
  
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
  }

  console.log(`   Host: ${config.host}`)
  console.log(`   Port: ${config.port}`)
  console.log(`   Secure: ${config.secure}`)
  console.log(`   User: ${config.user ? '✅ Configurado' : '❌ Não configurado'}`)
  console.log(`   Password: ${config.password ? `✅ Configurado (${config.password.length} caracteres)` : '❌ Não configurado'}`)

  if (!config.user || !config.password) {
    console.error('\n❌ ERRO: Variáveis SMTP_USER e SMTP_PASSWORD devem estar configuradas!')
    process.exit(1)
  }

  // 2. Verificar formato da senha
  console.log('\n📋 2. Verificando Formato da Senha:')
  console.log('-'.repeat(60))
  
  const passwordNoSpaces = config.password.replace(/\s/g, '')
  const hasSpaces = config.password !== passwordNoSpaces
  const is16Chars = passwordNoSpaces.length === 16
  
  console.log(`   Tem espaços: ${hasSpaces ? '❌ SIM (remova!)' : '✅ Não'}`)
  console.log(`   Tamanho: ${passwordNoSpaces.length} caracteres ${is16Chars ? '✅' : '❌ (deve ser 16)'}`)
  console.log(`   Primeiros 4: ${passwordNoSpaces.substring(0, 4)}`)
  
  if (hasSpaces) {
    console.error('\n❌ ERRO: A senha contém espaços! Remova todos os espaços.')
    console.error(`   Use: ${passwordNoSpaces}`)
    process.exit(1)
  }
  
  if (!is16Chars) {
    console.error('\n❌ ERRO: A senha deve ter exatamente 16 caracteres!')
    process.exit(1)
  }

  // 3. Testar diferentes configurações SMTP
  console.log('\n📋 3. Testando Configurações SMTP:')
  console.log('-'.repeat(60))

  const testConfigs = [
    {
      name: 'Configuração 1: TLS (Porta 587)',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: config.user,
          pass: passwordNoSpaces,
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
    },
    {
      name: 'Configuração 2: SSL (Porta 465)',
      config: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: config.user,
          pass: passwordNoSpaces,
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
    },
    {
      name: 'Configuração 3: TLS com timeout aumentado',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: config.user,
          pass: passwordNoSpaces,
        },
        connectionTimeout: 20000,
        greetingTimeout: 20000,
        socketTimeout: 20000,
        tls: {
          rejectUnauthorized: false,
        },
      },
    },
  ]

  for (const test of testConfigs) {
    console.log(`\n   Testando: ${test.name}`)
    try {
      const transporter = nodemailer.createTransport(test.config)
      
      // Verificar conexão
      await transporter.verify()
      console.log(`   ✅ Conexão verificada com sucesso!`)
      
      // Tentar enviar email de teste
      const testEmail = process.env.CONTACT_RECIPIENT_EMAIL || config.user
      console.log(`   📧 Enviando email de teste para: ${testEmail}`)
      
      const info = await transporter.sendMail({
        from: `"Innexar Test" <${config.user}>`,
        to: testEmail,
        subject: '🧪 Teste Google Workspace - ' + test.name,
        html: `
          <h2>✅ Teste Bem-Sucedido!</h2>
          <p>Esta configuração funcionou:</p>
          <pre>${JSON.stringify(test.config, null, 2)}</pre>
        `,
        text: `Teste bem-sucedido! Configuração: ${test.name}`,
      })
      
      console.log(`   ✅ Email enviado! Message ID: ${info.messageId}`)
      console.log(`\n🎉 SUCESSO! Use esta configuração no .env.local:`)
      console.log(`   SMTP_HOST=${test.config.host}`)
      console.log(`   SMTP_PORT=${test.config.port}`)
      console.log(`   SMTP_SECURE=${test.config.secure}`)
      console.log(`   SMTP_USER=${config.user}`)
      console.log(`   SMTP_PASSWORD=${passwordNoSpaces}`)
      
      process.exit(0)
    } catch (error) {
      console.log(`   ❌ Falhou: ${error.message}`)
      
      // Análise detalhada do erro
      if (error.code === 'EAUTH') {
        console.log(`   💡 Erro de autenticação. Verifique:`)
        console.log(`      - Senha de app está correta?`)
        console.log(`      - Verificação em 2 etapas está ativada?`)
        console.log(`      - Email é do Google Workspace?`)
      } else if (error.code === 'ECONNECTION') {
        console.log(`   💡 Erro de conexão. Verifique:`)
        console.log(`      - Firewall bloqueando porta ${test.config.port}?`)
        console.log(`      - Internet funcionando?`)
      } else if (error.code === 'ETIMEDOUT') {
        console.log(`   💡 Timeout. Tente aumentar os timeouts.`)
      }
      
      // Continuar para próxima configuração
      continue
    }
  }

  // Se chegou aqui, nenhuma configuração funcionou
  console.error('\n❌ Nenhuma configuração funcionou!')
  console.error('\n💡 Próximos passos:')
  console.error('   1. Verifique se a verificação em 2 etapas está ATIVADA')
  console.error('   2. Gere uma NOVA senha de app: https://myaccount.google.com/apppasswords')
  console.error('   3. Verifique se o email é do Google Workspace (não Gmail pessoal)')
  console.error('   4. Se for admin, verifique permissões no Admin Console')
  
  process.exit(1)
}

testGoogleWorkspace().catch(console.error)

