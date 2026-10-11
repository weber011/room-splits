import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { paymentService } from "@/services/payment.service";
import { razorpayWebhookService } from "@/services/razorpay-webhook.service";
import { PLATFORM_SETTINGS } from "@/config/business-rules.config";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user session
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to verify property unlock payment." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required Razorpay verification parameters." },
        { status: 400 }
      );
    }

    // 2. Cryptographic HMAC SHA-256 Signature Verification & State Update to CAPTURED
    const payment = await paymentService.verifyRazorpayPaymentSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      userId: user.id,
    });

    // 3. Server-side Amount & Currency Verification
    if (payment.amount !== PLATFORM_SETTINGS.PROPERTY_UNLOCK_PRICE) {
      console.error(`[Razorpay Security Alert] Verified payment amount mismatch: ${payment.amount}, expected ${PLATFORM_SETTINGS.PROPERTY_UNLOCK_PRICE}`);
      return NextResponse.json({ error: "Payment amount mismatch." }, { status: 400 });
    }

    if (payment.currency && payment.currency.toUpperCase() !== "INR") {
      return NextResponse.json({ error: "Payment currency mismatch." }, { status: 400 });
    }

    // 4. Finalize Property Unlock Record Transactionally / Idempotently via Reusable Service
    const unlockResult = await razorpayWebhookService.finalizeSuccessfulPropertyUnlock(payment.id);

    if (!unlockResult.isUnlocked) {
      return NextResponse.json(
        { error: unlockResult.message || "Failed to finalize property unlock." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        isUnlocked: true,
        message: "Property unlocked successfully. You now have access to exact location and landlord contact details.",
        paymentId: payment.id,
        propertyId: payment.related_property_id,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[Property Unlock Verification API Error]:", error);
    const msg = error instanceof Error ? error.message : "Payment signature verification failed.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
