import { createClient } from "@/lib/supabase/client";
import { verifyServerWebhookSignature } from "@/lib/razorpay";
import { PLATFORM_SETTINGS } from "@/config/business-rules.config";
import { propertyUnlockService } from "./property-unlock.service";
import { paymentService } from "./payment.service";
import { rentPaymentService } from "./rent-payment.service";


/**
 * IN-MEMORY EVENT SET FOR IDEMPOTENCY (Fallback for local dev/testing without active DB connection)
 */
const PROCESSED_WEBHOOK_EVENTS_CACHE = new Set<string>();

export interface WebhookProcessResult {
  success: boolean;
  statusCode: number;
  message: string;
  duplicate?: boolean;
  eventId?: string;
  paymentId?: string;
  unlockActive?: boolean;
}

export const razorpayWebhookService = {
  /**
   * REUSABLE UNLOCK FINALIZATION FUNCTION
   * 
   * Atomically activates a property unlock ONLY when:
   * 1. Payment status is verified CAPTURED.
   * 2. Payment type is PROPERTY_UNLOCK (or VISIT_PASS).
   * 3. User ID and Property ID are sourced strictly from trusted server database payment records.
   */
  async finalizeSuccessfulPropertyUnlock(paymentId: string): Promise<{ success: boolean; isUnlocked: boolean; message: string }> {
    if (!paymentId) {
      return { success: false, isUnlocked: false, message: "Missing payment ID for property unlock finalization." };
    }

    const payment = await paymentService.getPaymentById(paymentId);
    if (!payment) {
      return { success: false, isUnlocked: false, message: `Payment record ${paymentId} not found.` };
    }

    // A. Verify payment type is PROPERTY_UNLOCK or VISIT_PASS
    if (payment.payment_type !== "PROPERTY_UNLOCK" && payment.payment_type !== "VISIT_PASS") {
      return { success: false, isUnlocked: false, message: `Payment ${paymentId} is not a PROPERTY_UNLOCK payment type.` };
    }

    // B. Verify payment status is CAPTURED
    if (payment.status !== "CAPTURED") {
      return { success: false, isUnlocked: false, message: `Payment ${paymentId} status is ${payment.status}, expected CAPTURED.` };
    }

    // C. Extract trusted user ID and property ID from internal payment record
    const targetUserId = payment.user_id || payment.tenant_id;
    const targetPropertyId = payment.related_property_id;

    if (!targetUserId || !targetPropertyId) {
      return { success: false, isUnlocked: false, message: `Payment ${paymentId} is missing target user ID or property ID.` };
    }

    // D. Idempotently trigger property unlock activation
    try {
      await propertyUnlockService.unlockPropertyForUser(
        targetUserId,
        targetPropertyId,
        payment.amount || PLATFORM_SETTINGS.PROPERTY_UNLOCK_PRICE,
        payment.id,
        payment.razorpay_payment_id || undefined
      );

      return {
        success: true,
        isUnlocked: true,
        message: `Property ${targetPropertyId} successfully unlocked for user ${targetUserId}.`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unlock activation failed.";
      console.error(`[Property Unlock Finalization Error] paymentId=${paymentId}:`, msg);
      return { success: false, isUnlocked: false, message: msg };
    }
  },

  /**
   * CANONICAL WEBHOOK PROCESSOR
   * Processes raw Razorpay HTTP webhook body and signature header with cryptographic verification and idempotency protection.
   */
  async processWebhook(rawBody: string, signature: string): Promise<WebhookProcessResult> {
    // 1. Signature Header Check
    if (!rawBody || !signature) {
      console.warn("[Razorpay Webhook Warning] Webhook request missing raw body or signature header.");
      return {
        success: false,
        statusCode: 400,
        message: "Missing required raw request body or x-razorpay-signature header.",
      };
    }

    // 2. HMAC SHA-256 Signature Verification against RAZORPAY_WEBHOOK_SECRET
    const isValidSignature = verifyServerWebhookSignature({ rawBody, signature });
    if (!isValidSignature) {
      console.error("[Razorpay Webhook Security Alert] Invalid HMAC signature received for webhook.");
      return {
        success: false,
        statusCode: 400,
        message: "Invalid Razorpay webhook cryptographic signature.",
      };
    }

    // 3. Parse JSON Body securely
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return {
        success: false,
        statusCode: 400,
        message: "Malformed JSON payload in webhook body.",
      };
    }

    const eventName = (payload.event as string) || "unknown";
    const innerPayload = payload.payload as Record<string, unknown> | undefined;
    const paymentObj = innerPayload?.payment as Record<string, unknown> | undefined;
    const paymentEntity = paymentObj?.entity as Record<string, unknown> | undefined;

    const orderObj = innerPayload?.order as Record<string, unknown> | undefined;
    const orderEntity = orderObj?.entity as Record<string, unknown> | undefined;

    const razorpayPaymentId = (paymentEntity?.id as string) || "";
    const razorpayOrderId = (paymentEntity?.order_id as string) || (orderEntity?.id as string) || "";
    const razorpayAmountInPaise = Number(paymentEntity?.amount || orderEntity?.amount || 0);
    const razorpayCurrency = (paymentEntity?.currency as string) || (orderEntity?.currency as string) || "INR";

    const eventId = (payload.event_id as string) || `${eventName}_${razorpayPaymentId || razorpayOrderId || Date.now()}`;

    // 4. ATOMIC WEBHOOK IDEMPOTENCY CHECK via payment_events Table
    const isDuplicate = await this.recordAndCheckIdempotency(eventId, eventName, payload);
    if (isDuplicate) {
      console.info(`[Razorpay Webhook Idempotency] Event ${eventId} (${eventName}) already processed. Skipping duplicate execution.`);
      return {
        success: true,
        statusCode: 200,
        duplicate: true,
        eventId,
        message: "Webhook event already processed (Idempotency locked).",
      };
    }

    console.info(`[Razorpay Webhook Received] eventId=${eventId}, eventName=${eventName}, razorpayOrderId=${razorpayOrderId}, razorpayPaymentId=${razorpayPaymentId}`);

    // 5. HANDLE RAZORPAY EVENT TYPES
    if (eventName === "payment.captured" || eventName === "order.paid") {
      return this.handlePaymentSuccessEvent({
        eventId,
        eventName,
        razorpayOrderId,
        razorpayPaymentId,
        razorpayAmountInPaise,
        razorpayCurrency,
      });
    }

    if (eventName === "payment.failed") {
      return this.handlePaymentFailedEvent({
        eventId,
        eventName,
        razorpayOrderId,
        razorpayPaymentId,
      });
    }

    // 6. UNSUPPORTED BUT VALID EVENTS (Verify signature, record in audit log, return HTTP 200)
    return {
      success: true,
      statusCode: 200,
      eventId,
      message: `Webhook event ${eventName} verified and logged successfully (No state change required).`,
    };
  },

  /**
   * Handle payment.captured and order.paid Events
   */
  async handlePaymentSuccessEvent(params: {
    eventId: string;
    eventName: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpayAmountInPaise: number;
    razorpayCurrency: string;
  }): Promise<WebhookProcessResult> {
    const { razorpayOrderId, razorpayPaymentId, razorpayAmountInPaise, razorpayCurrency, eventId, eventName } = params;

    if (!razorpayOrderId && !razorpayPaymentId) {
      return {
        success: true,
        statusCode: 200,
        eventId,
        message: `Webhook ${eventName} logged, but missing order/payment identifiers to map to internal payment.`,
      };
    }

    // A. Locate internal payment by Razorpay Order ID or Payment ID
    let internalPayment = razorpayOrderId ? await paymentService.getPaymentByRazorpayOrderId(razorpayOrderId) : null;
    if (!internalPayment && razorpayPaymentId) {
      internalPayment = await paymentService.getPaymentByRazorpayPaymentId(razorpayPaymentId);
    }

    if (!internalPayment) {
      console.warn(`[Razorpay Webhook Warning] No matching internal payment found for order ${razorpayOrderId} / payment ${razorpayPaymentId}.`);
      return {
        success: true,
        statusCode: 200,
        eventId,
        message: "No matching internal payment found. Event logged without modifying database state.",
      };
    }

    // B. MONOTONIC STATE MACHINE CHECK: If already CAPTURED, maintain state and trigger idempotent unlock finalization
    if (internalPayment.status === "CAPTURED") {
      let unlockActive = false;
      if (internalPayment.payment_type === "PROPERTY_UNLOCK" || internalPayment.payment_type === "VISIT_PASS") {
        const unlockRes = await this.finalizeSuccessfulPropertyUnlock(internalPayment.id);
        unlockActive = unlockRes.isUnlocked;
      } else if (internalPayment.payment_type === "ROOM_BOOKING" || internalPayment.payment_type === "BOOKING_RENT") {
        await paymentService.finalizeSuccessfulBookingPayment(internalPayment.id);
      } else if (internalPayment.payment_type === "MONTHLY_RENT") {
        await rentPaymentService.finalizeSuccessfulRentPayment(internalPayment.id);
      }

      return {
        success: true,
        statusCode: 200,
        eventId,
        paymentId: internalPayment.id,
        unlockActive,
        message: "Internal payment is already CAPTURED. Verified idempotency state.",
      };
    }

    // C. AMOUNT & CURRENCY VALIDATION (Prevent price tampering)
    const expectedAmountInRupees = internalPayment.amount;
    const expectedAmountInPaise = Math.round(expectedAmountInRupees * 100);

    if (razorpayAmountInPaise > 0 && Math.abs(razorpayAmountInPaise - expectedAmountInPaise) > 1) {
      console.error(`[Razorpay Security Alert] Webhook amount mismatch! Expected ${expectedAmountInPaise} paise, received ${razorpayAmountInPaise} paise.`);
      return {
        success: false,
        statusCode: 400,
        eventId,
        message: "Webhook payment amount mismatch with internal order record.",
      };
    }

    if (razorpayCurrency && razorpayCurrency.toUpperCase() !== "INR") {
      console.error(`[Razorpay Security Alert] Webhook currency mismatch! Expected INR, received ${razorpayCurrency}.`);
      return {
        success: false,
        statusCode: 400,
        eventId,
        message: "Webhook currency mismatch.",
      };
    }

    // D. TRANSITION STATUS TO CAPTURED
    const updatedPayment = await paymentService.updatePaymentStatus(internalPayment.id, "CAPTURED", {
      razorpay_payment_id: razorpayPaymentId || internalPayment.razorpay_payment_id || undefined,
      razorpay_order_id: razorpayOrderId || internalPayment.razorpay_order_id || undefined,
      paid_at: new Date().toISOString(),
    });

    // E. TRIGGER PROPERTY UNLOCK OR BOOKING PAYMENT FINALIZATION
    let unlockActive = false;
    if (updatedPayment.payment_type === "PROPERTY_UNLOCK" || updatedPayment.payment_type === "VISIT_PASS") {
      const unlockRes = await this.finalizeSuccessfulPropertyUnlock(updatedPayment.id);
      unlockActive = unlockRes.isUnlocked;
    } else if (updatedPayment.payment_type === "ROOM_BOOKING" || updatedPayment.payment_type === "BOOKING_RENT") {
      await paymentService.finalizeSuccessfulBookingPayment(updatedPayment.id);
    } else if (updatedPayment.payment_type === "MONTHLY_RENT") {
      await rentPaymentService.finalizeSuccessfulRentPayment(updatedPayment.id);
    }

    console.info(`[Razorpay Webhook Success] Reconciled payment ${updatedPayment.id} to CAPTURED for event ${eventId}.`);

    return {
      success: true,
      statusCode: 200,
      eventId,
      paymentId: updatedPayment.id,
      unlockActive,
      message: `Webhook ${eventName} processed successfully. Payment ${updatedPayment.id} CAPTURED.`,
    };
  },

  /**
   * Handle payment.failed Event
   */
  async handlePaymentFailedEvent(params: {
    eventId: string;
    eventName: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
  }): Promise<WebhookProcessResult> {
    const { razorpayOrderId, razorpayPaymentId, eventId } = params;

    let internalPayment = razorpayOrderId ? await paymentService.getPaymentByRazorpayOrderId(razorpayOrderId) : null;
    if (!internalPayment && razorpayPaymentId) {
      internalPayment = await paymentService.getPaymentByRazorpayPaymentId(razorpayPaymentId);
    }

    if (!internalPayment) {
      return {
        success: true,
        statusCode: 200,
        eventId,
        message: "Failed payment event received for non-existent internal payment. Event logged.",
      };
    }

    // MONOTONIC STATE MACHINE RULE: NEVER DOWNGRADE CAPTURED TO FAILED
    if (internalPayment.status === "CAPTURED") {
      console.warn(`[Razorpay State Machine Guard] Ignored late payment.failed event for payment ${internalPayment.id} because status is already CAPTURED.`);
      return {
        success: true,
        statusCode: 200,
        eventId,
        paymentId: internalPayment.id,
        message: "Payment is already CAPTURED. Ignored late failure event.",
      };
    }

    // Transition pre-success states (CREATED, ORDER_CREATED, PENDING) to FAILED
    await paymentService.updatePaymentStatus(internalPayment.id, "FAILED", {
      razorpay_payment_id: razorpayPaymentId || undefined,
    });

    console.info(`[Razorpay Webhook Failure Recorded] Payment ${internalPayment.id} transitioned to FAILED.`);

    return {
      success: true,
      statusCode: 200,
      eventId,
      paymentId: internalPayment.id,
      message: `Payment ${internalPayment.id} transitioned to FAILED.`,
    };
  },

  /**
   * Atomic Event Recording & Idempotency Check in payment_events Table
   */
  async recordAndCheckIdempotency(eventId: string, eventType: string, payload: unknown): Promise<boolean> {
    // 1. In-Memory Cache Check
    if (PROCESSED_WEBHOOK_EVENTS_CACHE.has(eventId)) {
      return true;
    }
    PROCESSED_WEBHOOK_EVENTS_CACHE.add(eventId);

    // 2. Database Unique Constraint Record Insertion
    try {
      const supabase = createClient();
      
      // Try fetching first
      const { data: existing } = await supabase
        .from("payment_events")
        .select("id")
        .eq("event_id", eventId)
        .maybeSingle();

      if (existing) {
        return true;
      }

      // Atomic insert
      const { error } = await supabase.from("payment_events").insert({
        provider: "razorpay",
        event_id: eventId,
        event_type: eventType,
        payload: payload as Record<string, unknown>,
      });

      // Postgres Unique Violation Error Code 23505
      if (error && (error.code === "23505" || error.message?.includes("unique constraint"))) {
        return true;
      }
    } catch {
      // Fallback
    }

    return false;
  },
};
