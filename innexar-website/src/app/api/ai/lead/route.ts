import { NextRequest, NextResponse } from 'next/server'

const CRM_API_URL = process.env.CRM_API_URL || 'https://sales.innexar.app/api'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, phone, interest, conversation_summary, language } = body

        if (!name || !email) {
            return NextResponse.json(
                { error: 'Nome e email são obrigatórios' },
                { status: 400 }
            )
        }

        // Enviar lead para o CRM
        const response = await fetch(`${CRM_API_URL}/ai/public/lead`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                phone,
                interest,
                conversation_summary,
                language: language || 'pt'
            }),
        })

        if (!response.ok) {
            const errorData = await response.text()
            console.error('Erro ao capturar lead:', errorData)
            return NextResponse.json(
                { error: 'Erro ao salvar contato' },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error: any) {
        console.error('Erro ao processar lead:', error)
        return NextResponse.json(
            { error: 'Erro ao processar sua solicitação.' },
            { status: 500 }
        )
    }
}
