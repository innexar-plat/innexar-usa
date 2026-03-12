import { NextRequest, NextResponse } from "next/server";

const CRM_API_URL = process.env.CRM_API_URL || "https://api.sales.innexar.app/api";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(`${CRM_API_URL}/site-contracts/sign`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json(error, { status: response.status });
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error signing contract proxy:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('order_id');

    if (!orderId) {
        return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    }

    try {
        const response = await fetch(`${CRM_API_URL}/site-contracts/order/${orderId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (response.status === 404) {
            return NextResponse.json({ signed: false }, { status: 200 });
        }

        if (!response.ok) {
            return NextResponse.json(
                { error: "Error checking contract" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json({ signed: true, ...data });

    } catch (error) {
        console.error("Error checking contract status:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
