import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { paymentService } from "@/services/payment.service";
import { PaymentType } from "@/types/payment.types";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user session (NEVER trust user ID passed in request body)
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to create a payment order." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { paymentType, relatedPropertyId, relatedBookingId, relatedStayId, metadata } = body;

    // 2. Validate Payment Type
    const validTypes: PaymentType[] = [
      "PROPERTY_UNLOCK",
      "ROOM_BOOKING",
      "SECURITY_DEPOSIT",
      "MONTHLY_RENT",
      "VISIT_PASS",
      "BOOKING_RENT",
    ];

    if (!paymentType || !validTypes.includes(paymentType)) {
      return NextResponse.json(
        { error: `Invalid payment type provided. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // 3. Create Server-Side Razorpay Order (Server calculates amount; NEVER trusts client amount)
    const checkoutData = await paymentService.createRazorpayOrder({
      userId: user.id,
      paymentType,
      relatedPropertyId,
      relatedBookingId,
      relatedStayId,
      metadata,
    });

    // 4. Return SAFE Checkout Information (NEVER RETURN RAZORPAY_KEY_SECRET)
    return NextResponse.json(checkoutData, { status: 200 });
  } catch (error: unknown) {
    console.error("[Razorpay Order API Error]:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create payment order.";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
