import { NextRequest, NextResponse } from 'next/server';

const CRM_API_URL = process.env.CRM_API_URL || 'http://localhost:8000';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
        return NextResponse.json({ error: 'Token required' }, { status: 401 });
    }

    try {
        const body = await request.json();

        const response = await fetch(`${CRM_API_URL}/api/customer-auth/me/tickets/${id}/reply`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error replying to ticket:', error);
        return NextResponse.json({ error: 'Failed to reply' }, { status: 500 });
    }
}
