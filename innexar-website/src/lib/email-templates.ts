// Templates de email com suporte multi-idioma
// As traduções vêm dos arquivos messages/{locale}.json

type EmailTranslations = {
  contactSubject: string
  contactHeader: string
  contactInfo: string
  contactProject: string
  contactMessage: string
  contactFooter: string
  autoReplySubject: string
  autoReplyHeader: string
  autoReplyGreeting: string
  autoReplyThanks: string
  autoReplyReceived: string
  autoReplyWhile: string
  autoReplyVisit: string
  autoReplyServices: string
  autoReplyPortfolio: string
  autoReplySignature: string
  autoReplyTeam: string
  autoReplyFooter: string
  autoReplyAdvantages: string
  autoReplyAdvantage1: string
  autoReplyAdvantage2: string
  autoReplyAdvantage3: string
  autoReplyAdvantage4: string
  autoReplyAdvantage5: string
  autoReplyAdvantage6: string
  autoReplyContactTitle: string
  autoReplyContactEmail: string
  autoReplyContactPhone: string
  autoReplyContactWebsite: string
  autoReplyCta: string
  autoReplyCtaButton: string
  labels: {
    name: string
    email: string
    phone: string
    company: string
    type: string
    budget: string
    timeline: string
  }
  notInformed: string
}

// Template de email principal (para você receber) - com logo e design profissional
export function getContactEmailTemplate(
  data: {
    name: string
    email: string
    phone: string
    company: string
    projectType: string
    budget: string
    timeline: string
    message: string
  },
  translations: EmailTranslations
) {
  return {
    subject: translations.contactSubject.replace('{{name}}', data.name),
    html: `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      line-height: 1.6; 
      color: #1f2937; 
      background-color: #f3f4f6;
    }
    .email-wrapper { 
      max-width: 650px; 
      margin: 0 auto; 
      background-color: #ffffff;
    }
    .header { 
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%); 
      padding: 40px 30px;
      text-align: center;
    }
    .logo { 
      color: #ffffff; 
      font-size: 32px; 
      font-weight: 700; 
      letter-spacing: -0.5px;
      margin-bottom: 10px;
    }
    .header-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      color: #ffffff;
      margin-top: 10px;
    }
    .content { 
      padding: 40px 30px; 
      background: #ffffff;
    }
    .section { 
      margin-bottom: 30px; 
      padding-bottom: 30px;
      border-bottom: 1px solid #e5e7eb;
    }
    .section:last-child {
      border-bottom: none;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .info-row {
      display: flex;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f7;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label { 
      font-weight: 600; 
      color: #4b5563;
      min-width: 120px;
      font-size: 14px;
    }
    .info-value {
      color: #1f2937;
      font-size: 14px;
    }
    .info-value a {
      color: #3b82f6;
      text-decoration: none;
    }
    .info-value a:hover {
      text-decoration: underline;
    }
    .message-box { 
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
      padding: 25px; 
      border-left: 4px solid #3b82f6; 
      border-radius: 8px;
      margin-top: 15px;
      font-size: 15px;
      line-height: 1.8;
      color: #1f2937;
    }
    .footer { 
      background: #1f2937; 
      padding: 30px; 
      text-align: center; 
      color: #9ca3af; 
      font-size: 12px;
    }
    .footer-links {
      margin-top: 15px;
    }
    .footer-links a {
      color: #60a5fa;
      text-decoration: none;
      margin: 0 10px;
    }
    .footer-links a:hover {
      text-decoration: underline;
    }
    @media only screen and (max-width: 600px) {
      .content { padding: 30px 20px; }
      .header { padding: 30px 20px; }
      .info-row { flex-direction: column; gap: 5px; }
      .info-label { min-width: auto; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="logo">INNEXAR</div>
      <div class="header-badge">📧 Novo Contato do Site</div>
    </div>
    <div class="content">
      <div class="section">
        <div class="section-title">👤 ${translations.contactInfo}</div>
        <div class="info-row">
          <div class="info-label">${translations.labels.name}:</div>
          <div class="info-value">${data.name}</div>
        </div>
        <div class="info-row">
          <div class="info-label">${translations.labels.email}:</div>
          <div class="info-value"><a href="mailto:${data.email}">${data.email}</a></div>
        </div>
        <div class="info-row">
          <div class="info-label">${translations.labels.phone}:</div>
          <div class="info-value"><a href="tel:${data.phone}">${data.phone}</a></div>
        </div>
        <div class="info-row">
          <div class="info-label">${translations.labels.company}:</div>
          <div class="info-value">${data.company || translations.notInformed}</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">💼 ${translations.contactProject}</div>
        <div class="info-row">
          <div class="info-label">${translations.labels.type}:</div>
          <div class="info-value">${data.projectType || translations.notInformed}</div>
        </div>
        <div class="info-row">
          <div class="info-label">${translations.labels.budget}:</div>
          <div class="info-value">${data.budget || translations.notInformed}</div>
        </div>
        <div class="info-row">
          <div class="info-label">${translations.labels.timeline}:</div>
          <div class="info-value">${data.timeline || translations.notInformed}</div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">💬 ${translations.contactMessage}</div>
        <div class="message-box">
          ${data.message.replace(/\n/g, '<br>')}
        </div>
      </div>
    </div>
    <div class="footer">
      <p>${translations.contactFooter}</p>
      <div class="footer-links">
        <a href="https://innexar.app">Website</a> | 
        <a href="mailto:comercial@innexar.app">Email</a> | 
        <a href="tel:+551151085266">Telefone</a>
      </div>
      <p style="margin-top: 15px; color: #6b7280;">© 2025 Innexar. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
${translations.contactHeader}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 ${translations.contactInfo}

${translations.labels.name}: ${data.name}
${translations.labels.email}: ${data.email}
${translations.labels.phone}: ${data.phone}
${translations.labels.company}: ${data.company || translations.notInformed}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💼 ${translations.contactProject}

${translations.labels.type}: ${data.projectType || translations.notInformed}
${translations.labels.budget}: ${data.budget || translations.notInformed}
${translations.labels.timeline}: ${data.timeline || translations.notInformed}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 ${translations.contactMessage}

${data.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${translations.contactFooter}

Website: https://innexar.app
Email: comercial@innexar.app
Telefone: +55 11 5108-5266
    `,
  }
}

// Template de resposta automática - MODERNO e PROFISSIONAL
export function getAutoReplyTemplate(
  data: { name: string; email: string },
  translations: EmailTranslations
) {
  // Detectar idioma baseado nas traduções
  const detectedLang = translations.autoReplyGreeting.includes('Hello') ? 'en'
    : translations.autoReplyGreeting.includes('Hola') ? 'es'
      : 'pt'

  return {
    subject: translations.autoReplySubject,
    html: `
<!DOCTYPE html>
<html lang="${detectedLang}">
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
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
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
      background: linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #3b82f6 100%); 
      padding: 60px 40px 50px;
      text-align: center;
      position: relative;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6);
    }
    .logo { 
      color: #ffffff; 
      font-size: 48px; 
      font-weight: 800; 
      letter-spacing: 2px;
      margin-bottom: 12px;
      text-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .header-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      color: #ffffff;
      padding: 8px 20px;
      border-radius: 50px;
      font-size: 14px;
      font-weight: 600;
      margin-top: 15px;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .content { 
      padding: 50px 40px; 
      background: #ffffff;
    }
    .greeting {
      font-size: 24px;
      color: #0f172a;
      margin-bottom: 24px;
      font-weight: 700;
      line-height: 1.3;
    }
    .message {
      font-size: 17px;
      color: #475569;
      margin-bottom: 32px;
      line-height: 1.8;
    }
    .highlight-box {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border-left: 4px solid #3b82f6;
      padding: 24px;
      border-radius: 12px;
      margin: 32px 0;
    }
    .highlight-text {
      font-size: 16px;
      color: #1e40af;
      font-weight: 600;
      line-height: 1.6;
    }
    .next-steps {
      background: #f8fafc;
      padding: 32px;
      border-radius: 12px;
      margin: 32px 0;
      border: 1px solid #e2e8f0;
    }
    .next-steps-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .next-steps-list {
      list-style: none;
      padding: 0;
    }
    .next-steps-list li {
      padding: 12px 0;
      color: #475569;
      font-size: 15px;
      line-height: 1.6;
      padding-left: 28px;
      position: relative;
    }
    .next-steps-list li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #3b82f6;
      font-weight: 700;
      font-size: 18px;
    }
    .cta-section {
      text-align: center;
      margin: 40px 0;
      padding: 40px 30px;
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      border-radius: 16px;
      box-shadow: 0 8px 16px rgba(30, 64, 175, 0.2);
    }
    .cta-text {
      color: #ffffff;
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .cta-button {
      display: inline-block;
      background: #ffffff;
      color: #1e40af;
      padding: 16px 40px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 700;
      font-size: 16px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }
    .contact-section {
      background: #ffffff;
      padding: 32px;
      border-radius: 12px;
      margin: 32px 0;
      border: 2px solid #e2e8f0;
    }
    .contact-title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 24px;
      text-align: center;
    }
    .contact-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 16px;
    }
    .contact-item {
      display: flex;
      align-items: center;
      padding: 16px;
      background: #f8fafc;
      border-radius: 10px;
      transition: all 0.2s ease;
    }
    .contact-item:hover {
      background: #f1f5f9;
      transform: translateX(4px);
    }
    .contact-icon {
      font-size: 24px;
      margin-right: 16px;
      width: 40px;
      text-align: center;
    }
    .contact-info {
      flex: 1;
    }
    .contact-label {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .contact-value {
      font-size: 15px;
      color: #1e40af;
      font-weight: 600;
      text-decoration: none;
    }
    .contact-value:hover {
      text-decoration: underline;
    }
    .signature {
      margin-top: 40px;
      padding-top: 32px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
    }
    .signature-text {
      color: #475569;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 8px;
    }
    .signature-name {
      font-weight: 700;
      color: #1e40af;
      font-size: 17px;
      margin-top: 12px;
    }
    .footer { 
      background: #0f172a; 
      padding: 40px 30px; 
      text-align: center; 
      color: #94a3b8; 
      font-size: 13px;
    }
    .footer-text {
      margin-bottom: 20px;
      line-height: 1.6;
    }
    .footer-links {
      margin: 24px 0;
      display: flex;
      justify-content: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    .footer-links a {
      color: #60a5fa;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.2s ease;
    }
    .footer-links a:hover {
      color: #93c5fd;
      text-decoration: underline;
    }
    .footer-copyright {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #1e293b;
      color: #64748b;
      font-size: 12px;
    }
    @media only screen and (max-width: 600px) {
      .email-container { margin: 20px; border-radius: 12px; }
      .content { padding: 32px 24px; }
      .header { padding: 40px 24px 36px; }
      .logo { font-size: 40px; }
      .greeting { font-size: 22px; }
      .message { font-size: 16px; }
      .cta-section { padding: 32px 24px; }
      .contact-section { padding: 24px; }
      .footer-links { gap: 16px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">INNEXAR</div>
      <div class="header-badge">${translations.autoReplyHeader}</div>
    </div>
    <div class="content">
      <div class="greeting">
        ${translations.autoReplyGreeting} ${data.name}!
      </div>
      
      <div class="message">
        ${translations.autoReplyThanks} <strong style="color: #1e40af;">Innexar</strong>!
      </div>
      
      <div class="highlight-box">
        <div class="highlight-text">
          ${translations.autoReplyReceived}
        </div>
      </div>

      <div class="next-steps">
        <div class="next-steps-title">
          <span>📋</span>
          <span>${translations.autoReplyWhile}</span>
        </div>
        <ul class="next-steps-list">
          <li>${translations.autoReplyVisit}</li>
          <li>${translations.autoReplyServices}</li>
          <li>${translations.autoReplyPortfolio}</li>
        </ul>
      </div>

      <div class="cta-section">
        <div class="cta-text">${translations.autoReplyCta}</div>
        <a href="https://innexar.app" class="cta-button">${translations.autoReplyCtaButton}</a>
      </div>

      <div class="contact-section">
        <div class="contact-title">${translations.autoReplyContactTitle}</div>
        <div class="contact-grid">
          <div class="contact-item">
            <div class="contact-icon">📧</div>
            <div class="contact-info">
              <div class="contact-label">Email</div>
              <a href="mailto:comercial@innexar.app" class="contact-value">comercial@innexar.app</a>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">📞</div>
            <div class="contact-info">
              <div class="contact-label">Telefone</div>
              <a href="tel:+551151085266" class="contact-value">+55 11 5108-5266</a>
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-icon">🌐</div>
            <div class="contact-info">
              <div class="contact-label">Website</div>
              <a href="https://innexar.app" class="contact-value">innexar.app</a>
            </div>
          </div>
        </div>
      </div>

      <div class="signature">
        <div class="signature-text">${translations.autoReplySignature}</div>
        <div class="signature-name">${translations.autoReplyTeam}</div>
      </div>
    </div>
    <div class="footer">
      <div class="footer-text">${translations.autoReplyFooter}</div>
      <div class="footer-links">
        <a href="https://innexar.app">Website</a>
        <a href="mailto:comercial@innexar.app">Email</a>
        <a href="tel:+551151085266">Telefone</a>
      </div>
      <div class="footer-copyright">
        © 2026 Innexar.
      </div>
    </div>
  </div>
</body>
</html>
    `,
    text: `
${translations.autoReplyHeader}

${translations.autoReplyGreeting} ${data.name}!

${translations.autoReplyThanks} Innexar!

${translations.autoReplyReceived}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${translations.autoReplyAdvantages}

⚡ ${translations.autoReplyAdvantage1}
🔒 ${translations.autoReplyAdvantage2}
👥 ${translations.autoReplyAdvantage3}
💡 ${translations.autoReplyAdvantage4}
📈 ${translations.autoReplyAdvantage5}
✅ ${translations.autoReplyAdvantage6}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${translations.autoReplyContactTitle}

📧 ${translations.autoReplyContactEmail}: comercial@innexar.app
📞 ${translations.autoReplyContactPhone}: +55 11 5108-5266
🌐 ${translations.autoReplyContactWebsite}: https://innexar.app

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${translations.autoReplySignature}
${translations.autoReplyTeam}

${translations.autoReplyFooter}
    `,
  }
}

// Template de email para checklist
export function getChecklistEmailTemplate(
  data: {
    name: string
    email: string
    phone: string
    company: string
    [key: string]: string
  },
  translations: {
    checklistSubject: string
    checklistHeader: string
    checklistInfo: string
    checklistData: string
    checklistFooter: string
    labels: {
      name: string
      email: string
      phone: string
      company: string
    }
    notInformed: string
  }
) {
  const checklistFields = [
    { key: 'currentChallenges', label: 'Desafios Atuais' },
    { key: 'targetAudience', label: 'Público-Alvo' },
    { key: 'businessGoals', label: 'Objetivos de Negócio' },
    { key: 'technicalRequirements', label: 'Requisitos Técnicos' },
    { key: 'budgetRange', label: 'Faixa de Orçamento' },
    { key: 'timeline', label: 'Prazo' },
    { key: 'teamSize', label: 'Tamanho da Equipe' },
    { key: 'existingTools', label: 'Ferramentas Existentes' },
    { key: 'successMetrics', label: 'Métricas de Sucesso' },
    { key: 'additionalNotes', label: 'Observações Adicionais' },
  ]

  const checklistItems = checklistFields
    .map(field => {
      const value = data[field.key] || translations.notInformed
      return `<tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151; width: 200px;">${field.label}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${value}</td>
      </tr>`
    })
    .join('')

  return {
    subject: translations.checklistSubject.replace('{{name}}', data.name),
    html: `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      line-height: 1.6; 
      color: #1f2937; 
      background-color: #f3f4f6;
    }
    .email-wrapper { 
      max-width: 650px; 
      margin: 0 auto; 
      background-color: #ffffff;
    }
    .header { 
      background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%); 
      padding: 40px 30px;
      text-align: center;
    }
    .logo { 
      color: #ffffff; 
      font-size: 32px; 
      font-weight: 700; 
      letter-spacing: -0.5px;
      margin-bottom: 10px;
    }
    .content { padding: 40px 30px; }
    .section { margin-bottom: 30px; }
    .section-title { 
      font-size: 20px; 
      font-weight: 700; 
      color: #1f2937; 
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    .info-table, .checklist-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .info-table td, .checklist-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-table td:first-child {
      font-weight: 600;
      color: #374151;
      width: 150px;
    }
    .footer { 
      background-color: #f9fafb; 
      padding: 30px; 
      text-align: center; 
      color: #6b7280; 
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="logo">📋 Checklist Recebido</div>
    </div>
    <div class="content">
      <div class="section">
        <div class="section-title">${translations.checklistHeader}</div>
        <table class="info-table">
          <tr>
            <td>${translations.labels.name}</td>
            <td>${data.name}</td>
          </tr>
          <tr>
            <td>${translations.labels.email}</td>
            <td>${data.email}</td>
          </tr>
          <tr>
            <td>${translations.labels.phone}</td>
            <td>${data.phone || translations.notInformed}</td>
          </tr>
          <tr>
            <td>${translations.labels.company}</td>
            <td>${data.company || translations.notInformed}</td>
          </tr>
        </table>
      </div>

      <div class="section">
        <div class="section-title">${translations.checklistData}</div>
        <table class="checklist-table">
          ${checklistItems}
        </table>
      </div>
    </div>
    <div class="footer">
      ${translations.checklistFooter}
    </div>
  </div>
</body>
</html>
    `,
    text: `
${translations.checklistHeader}

${translations.labels.name}: ${data.name}
${translations.labels.email}: ${data.email}
${translations.labels.phone}: ${data.phone || translations.notInformed}
${translations.labels.company}: ${data.company || translations.notInformed}

${translations.checklistData}

${checklistFields.map(field => `${field.label}: ${data[field.key] || translations.notInformed}`).join('\n')}

${translations.checklistFooter}
    `,
  }
}

// Template de resposta automática para checklist
export function getChecklistAutoReplyTemplate(
  data: { name: string; email: string },
  translations: {
    autoReplySubject: string
    autoReplyHeader: string
    autoReplyGreeting: string
    autoReplyThanks: string
    autoReplyReceived: string
    autoReplyWhile: string
    autoReplyVisit: string
    autoReplySignature: string
    autoReplyTeam: string
    autoReplyFooter: string
  }
) {
  return {
    subject: translations.autoReplySubject,
    html: `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
      line-height: 1.6; 
      color: #1f2937; 
      background-color: #f3f4f6;
    }
    .email-wrapper { 
      max-width: 650px; 
      margin: 0 auto; 
      background-color: #ffffff;
    }
    .header { 
      background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%); 
      padding: 40px 30px;
      text-align: center;
    }
    .logo { 
      color: #ffffff; 
      font-size: 32px; 
      font-weight: 700; 
      letter-spacing: -0.5px;
    }
    .content { padding: 40px 30px; }
    .greeting { 
      font-size: 24px; 
      font-weight: 700; 
      color: #1f2937; 
      margin-bottom: 20px;
    }
    .message { 
      color: #4b5563; 
      margin-bottom: 30px; 
      line-height: 1.8;
    }
    .footer { 
      background-color: #f9fafb; 
      padding: 30px; 
      text-align: center; 
      color: #6b7280; 
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="logo">${translations.autoReplyHeader}</div>
    </div>
    <div class="content">
      <div class="greeting">${translations.autoReplyGreeting} ${data.name}!</div>
      <div class="message">
        <p>${translations.autoReplyThanks}</p>
        <p style="margin-top: 20px;">${translations.autoReplyReceived}</p>
        <p style="margin-top: 20px;">${translations.autoReplyWhile}</p>
      </div>
    </div>
    <div class="footer">
      <p>${translations.autoReplySignature}</p>
      <p style="margin-top: 10px; font-weight: 600;">${translations.autoReplyTeam}</p>
      <p style="margin-top: 20px;">${translations.autoReplyFooter}</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
${translations.autoReplyHeader}

${translations.autoReplyGreeting} ${data.name}!

${translations.autoReplyThanks}

${translations.autoReplyReceived}

${translations.autoReplyWhile}

${translations.autoReplySignature}
${translations.autoReplyTeam}

${translations.autoReplyFooter}
    `,
  }
}
