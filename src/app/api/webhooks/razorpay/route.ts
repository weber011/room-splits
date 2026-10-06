import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "@/services/payment.service";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    if (!signature) {
      return NextResponse.json({ error: "Missing x-razorpay-signature header" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);

    // Process Webhook Event with HMAC Verification & Idempotency Lock
    const result = await paymentService.processWebhookEvent(rawBody, signature, payload);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ status: "ok", message: result.message });
  } catch (error) {
    console.error("Error handling Razorpay webhook event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
