import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { paymentService } from "@/services/payment.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to view payment records." },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const paymentId = resolvedParams.id;

    if (!paymentId) {
      return NextResponse.json({ error: "Missing payment ID parameter." }, { status: 400 });
    }

    // Security: Fetch payment record with authorization check
    const payment = await paymentService.getPaymentById(paymentId, user.role === "admin" ? undefined : user.id);

    if (!payment) {
      return NextResponse.json(
        { error: "Payment record not found or access denied." },
        { status: 404 }
      );
    }

    // Sanitize sensitive metadata if any
    return NextResponse.json(
      {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        paymentType: payment.payment_type,
        status: payment.status,
        provider: payment.provider,
        razorpayOrderId: payment.razorpay_order_id,
        relatedPropertyId: payment.related_property_id,
        relatedBookingId: payment.related_booking_id,
        relatedStayId: payment.related_stay_id,
        paidAt: payment.paid_at,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[Payment Fetch API Error]:", error);
    return NextResponse.json({ error: "Failed to retrieve payment record." }, { status: 500 });
  }
}
