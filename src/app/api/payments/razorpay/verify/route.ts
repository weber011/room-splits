import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { paymentService } from "@/services/payment.service";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate User Session
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to verify payment." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required Razorpay verification parameters: razorpay_order_id, razorpay_payment_id, and razorpay_signature." },
        { status: 400 }
      );
    }

    // 2. Cryptographic Signature Verification & Status Update (Server-Controlled)
    const payment = await paymentService.verifyRazorpayPaymentSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      userId: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Razorpay payment verified successfully.",
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[Razorpay Verification API Error]:", error);
    const errorMessage = error instanceof Error ? error.message : "Payment signature verification failed.";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
