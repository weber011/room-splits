import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { rentPaymentService } from "@/services/rent-payment.service";

export async function POST(req: NextRequest) {
  try {
    // 1. Server-side session authentication check
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to create rent payment order." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { stayId, billingMonth } = body;

    if (!stayId || typeof stayId !== "string") {
      return NextResponse.json(
        { success: false, error: "Stay ID is required." },
        { status: 400 }
      );
    }

    // 2. Create Razorpay rent order with server-side authorization & amount calculation
    const orderData = await rentPaymentService.createRentPaymentOrder({
      stayId,
      billingMonth,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      ...orderData,
    });
  } catch (error: unknown) {
    console.error("[Rent Order API Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to create rent payment order.";
    const status = msg.includes("Unauthorized") ? 403 : msg.includes("already paid") ? 409 : 400;
    return NextResponse.json(
      { success: false, error: msg },
      { status }
    );
  }
}
