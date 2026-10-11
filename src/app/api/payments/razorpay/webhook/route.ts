import { NextRequest, NextResponse } from "next/server";
import { razorpayWebhookService } from "@/services/razorpay-webhook.service";

/**
 * COMPATIBILITY RAZORPAY WEBHOOK ROUTE
 * POST /api/payments/razorpay/webhook
 * 
 * Delegates directly to the canonical razorpayWebhookService handler.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    if (!signature) {
      return NextResponse.json({ error: "Missing x-razorpay-signature header." }, { status: 400 });
    }

    const result = await razorpayWebhookService.processWebhook(rawBody, signature);

    return NextResponse.json(
      {
        status: result.success ? "ok" : "error",
        message: result.message,
        duplicate: result.duplicate || false,
        eventId: result.eventId,
        paymentId: result.paymentId,
        unlockActive: result.unlockActive,
      },
      { status: result.statusCode }
    );
  } catch (error: unknown) {
    console.error("[Razorpay Webhook Compatibility API Route Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
