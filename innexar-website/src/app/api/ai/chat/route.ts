import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, session_id, language, context } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      )
    }

    // URL da API do CRM (endpoint público)
    const crmApiUrl = process.env.CRM_API_URL || 'https://sales.innexar.app/api'

    // Add timeout to prevent Cloudflare 524 errors (60s for AI responses)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 seconds

    try {
      // Fazer requisição para o CRM (endpoint público)
      const response = await fetch(`${crmApiUrl}/ai/public/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          session_id,
          language: language || 'pt',
          context: {
            ...context,
            source: 'website',
            timestamp: new Date().toISOString()
          }
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Erro na API do CRM:', errorData)
        return NextResponse.json(
          { error: 'Erro ao comunicar com a IA' },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        console.error('Chat request timeout')
        return NextResponse.json(
          { error: 'Tempo de resposta excedido. Por favor, tente novamente.' },
          { status: 408 }
        )
      }
      throw fetchError
    }
  } catch (error: any) {
    console.error('Erro ao processar chat:', error)
    return NextResponse.json(
      { error: 'Erro ao processar sua mensagem. Tente novamente.' },
      { status: 500 }
    )
  }
}

