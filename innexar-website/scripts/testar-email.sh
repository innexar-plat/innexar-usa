#!/bin/bash

# Script para testar envio de email do formulário de contato
# Uso: ./testar-email.sh [email-do-cliente]

echo "═══════════════════════════════════════════════════════════════"
echo "  TESTE DE ENVIO DE EMAIL - FORMULÁRIO DE CONTATO"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Obter email do cliente (ou usar padrão)
CLIENT_EMAIL="${1:-teste@example.com}"

if [ "$CLIENT_EMAIL" == "teste@example.com" ]; then
    echo "⚠️  Usando email de teste padrão: $CLIENT_EMAIL"
    echo "   Para testar com email real, use: ./testar-email.sh seu-email@gmail.com"
    echo ""
fi

# URL da API
API_URL="https://innexar.app/api/contact"

echo "📧 Enviando email de teste..."
echo "   Para: comercial@innexar.app"
echo "   Resposta automática para: $CLIENT_EMAIL"
echo ""

# Dados do teste
JSON_DATA=$(cat <<EOF
{
  "name": "Teste Automatizado",
  "email": "$CLIENT_EMAIL",
  "phone": "+55 11 99999-9999",
  "company": "Teste de Sistema",
  "projectType": "website",
  "budget": "R$ 5.000 - R$ 10.000",
  "timeline": "1-3 meses",
  "message": "Este é um email de teste automático para verificar se o sistema de envio de emails está funcionando corretamente.\n\nData: $(date)\n\nSe você recebeu este email, o sistema está funcionando! ✅",
  "locale": "pt"
}
EOF
)

# Enviar requisição
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$JSON_DATA")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "📤 Resposta do servidor:"
echo "   Código HTTP: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ SUCESSO! Email enviado com sucesso!"
    echo ""
    echo "📋 Verifique:"
    echo "   1. Email em comercial@innexar.app (deve chegar em alguns segundos)"
    if [ "$CLIENT_EMAIL" != "teste@example.com" ]; then
        echo "   2. Resposta automática em $CLIENT_EMAIL (pode levar alguns minutos)"
    else
        echo "   2. Resposta automática não será enviada (email de teste inválido)"
    fi
    echo ""
    echo "📊 Logs do servidor:"
    echo "   docker logs innexar-website --tail 20"
    echo ""
    echo "📊 Logs do Mailcow:"
    echo "   cd /projetos/mailcow && docker compose logs postfix-mailcow --tail 30"
else
    echo "❌ ERRO! Falha ao enviar email"
    echo ""
    echo "Resposta:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo ""
    echo "🔍 Verifique os logs:"
    echo "   docker logs innexar-website --tail 50"
fi

echo "═══════════════════════════════════════════════════════════════"

