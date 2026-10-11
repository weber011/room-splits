import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { rentPaymentService } from "@/services/rent-payment.service";

export async function POST(req: NextRequest) {
  try {
    // 1. Server-side session authentication check
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to verify rent payment." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { success: false, error: "Missing required Razorpay verification parameters." },
        { status: 400 }
      );
    }

    // 2. Perform HMAC verification & transition status to PAID
    const verification = await rentPaymentService.verifyRentPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: verification.message,
      rentPayment: verification.rentPayment,
      payment: verification.payment,
    });
  } catch (error: unknown) {
    console.error("[Rent Verify API Error]:", error);
    const msg = error instanceof Error ? error.message : "Failed to verify rent payment.";
    const status = msg.includes("Unauthorized") ? 403 : 400;
    return NextResponse.json(
      { success: false, error: msg },
      { status }
    );
  }
}
