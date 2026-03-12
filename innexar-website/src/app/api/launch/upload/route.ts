import { NextRequest, NextResponse } from "next/server";

// CRM API endpoint
const CRM_API_URL = process.env.CRM_API_URL || "https://sales.innexar.app/api";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const orderId = formData.get("orderId") as string;

        if (!file || !orderId) {
            return NextResponse.json(
                { error: "Missing file or order ID" },
                { status: 400 },
            );
        }

        const uploadForm = new FormData();
        uploadForm.append('file', file);

        // Use the new public onboarding upload endpoint
        const response = await fetch(`${CRM_API_URL}/site-orders/${orderId}/onboarding/upload`, {
            method: 'POST',
            body: uploadForm
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('CRM Upload Failed:', response.status, errorText);

            // Try to parse error as JSON
            try {
                const errorJson = JSON.parse(errorText);
                return NextResponse.json(
                    { error: errorJson.detail || "Failed to upload file to CRM" },
                    { status: response.status }
                );
            } catch {
                return NextResponse.json(
                    { error: "Failed to upload file to CRM" },
                    { status: response.status }
                );
            }
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            url: data.url,
            name: data.name,
            type: data.type
        });

    } catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
