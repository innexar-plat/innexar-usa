import { NextRequest, NextResponse } from "next/server";

// CRM API endpoint
const CRM_API_URL = process.env.CRM_API_URL || "https://sales.innexar.app/api";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.json(
      { error: "Missing order_id parameter" },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();

    // Add timeout to prevent Cloudflare 524 errors
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 seconds

    try {
      // Submit onboarding data to CRM
      const response = await fetch(
        `${CRM_API_URL}/site-orders/${orderId}/onboarding`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        let error: any;
        try {
          error = await response.json();
        } catch {
          error = { detail: "Unknown error occurred" };
        }
        console.error("CRM API Error:", JSON.stringify(error, null, 2));

        // Extract a readable error message
        let errorMessage = "Error submitting onboarding";
        if (error.detail) {
          if (typeof error.detail === "string") {
            errorMessage = error.detail;
          } else if (Array.isArray(error.detail)) {
            // Pydantic validation errors
            const firstError = error.detail[0];
            if (firstError && firstError.msg) {
              const field =
                firstError.loc?.filter((l: any) => l !== "body").join(".") ||
                "Field";
              errorMessage = `${field}: ${firstError.msg}`;
            } else {
              errorMessage = "Validation error";
            }
          } else if (typeof error.detail === "object") {
            errorMessage =
              error.detail.msg || error.detail.message || "Validation error";
          }
        } else if (error.error) {
          errorMessage =
            typeof error.error === "string"
              ? error.error
              : error.error.message || "Error occurred";
        } else if (error.message) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }

        return NextResponse.json(
          { error: errorMessage, fullError: error },
          { status: response.status },
        );
      }

      const result = await response.json();

      // Send onboarding complete email with locale from request
      try {
        const url = new URL(request.url);
        const locale = url.pathname.split("/")[1] || "en"; // Extract locale from path like /pt/launch/onboarding
        await fetch(
          `${CRM_API_URL}/emails/send-onboarding-complete/${orderId}?locale=${locale}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          },
        );
        console.log("Onboarding complete email sent for order:", orderId);
      } catch (emailError) {
        console.error("Failed to send onboarding complete email:", emailError);
      }

      return NextResponse.json({
        success: true,
        message: "Onboarding submitted successfully",
        onboarding: result,
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        return NextResponse.json(
          { error: "Request timeout - please try again" },
          { status: 408 },
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("Error submitting onboarding:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.json(
      { error: "Missing order_id parameter" },
      { status: 400 },
    );
  }

  try {
    // Add timeout to prevent Cloudflare 524 errors
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

    try {
      // Get order details from CRM (using public endpoint)
      // This supports both integer IDs and Stripe Session IDs
      console.log(`[Onboarding API] Fetching order: ${orderId}`);
      const response = await fetch(
        `${CRM_API_URL}/site-orders/public/${orderId}`,
        {
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(
          `[Onboarding API] Error fetching order: ${response.status}`,
        );
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const order = await response.json();

      return NextResponse.json({
        order_id: order.id,
        business_name: order.onboarding?.business_name || "",
        is_complete: order.onboarding?.is_complete || false,
        status: order.status,
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        return NextResponse.json(
          { error: "Request timeout - please try again" },
          { status: 408 },
        );
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("Error fetching onboarding:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
