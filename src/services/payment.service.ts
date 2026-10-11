import { createClient } from "@/lib/supabase/client";
import { env } from "@/config/env";
import { PLATFORM_SETTINGS } from "@/config/business-rules.config";
import { propertyUnlockService } from "./property-unlock.service";
import { bookingService } from "./booking.service";
import { stayService } from "./stay.service";
import {
  createServerRazorpayOrder,
  verifyServerRazorpaySignature,
  verifyServerWebhookSignature,
} from "@/lib/razorpay";
import {
  PaymentType,
  PaymentStatus,
  PaymentRecord,
  CreateRazorpayOrderInput,
  VerifyRazorpayPaymentInput,
  RazorpayOrderCheckoutResponse,
  WebhookProcessingResult,
  RazorpayTransaction,
} from "@/types/payment.types";

/**
 * In-Memory Fallback Store for Local Testing when Supabase DB is offline
 */
const MOCK_PAYMENTS: PaymentRecord[] = [
  {
    id: "pay-9001",
    user_id: "u-101",
    tenant_id: "u-101",
    amount: 9,
    currency: "INR",
    payment_type: "PROPERTY_UNLOCK",
    provider: "razorpay",
    status: "CAPTURED",
    razorpay_order_id: "order_N9X0001",
    razorpay_payment_id: "pay_N9X123456",
    razorpay_signature: "sig_mock_verified_001",
    related_property_id: "prop-1",
    metadata: { propertyName: "UrbanNest Executive Co-Living & PG" },
    created_at: "2026-10-02T10:00:00Z",
    updated_at: "2026-10-02T10:05:00Z",
    paid_at: "2026-10-02T10:05:00Z",
  },
];

const PROCESSED_WEBHOOK_EVENTS = new Set<string>();

export const paymentService = {
  /**
   * Safe Server Environment Credentials Check
   */
  getRazorpaySecrets() {
    const keyId = env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
    const keySecret = env.RAZORPAY_KEY_SECRET;
    const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;

    if (process.env.NODE_ENV === "production" && (!keyId || !keySecret)) {
      throw new Error("CRITICAL SECURITY ERROR: Razorpay credentials are not configured in production environment.");
    }

    return {
      keyId: keyId || "rzp_test_RoomSplits2026Key",
      keySecret: keySecret || "RoomSplitsSecret2026SecureKey",
      webhookSecret: webhookSecret || "RoomSplitsWebhookSecret2026",
    };
  },

  /**
   * CRITICAL SECURITY REQUIREMENT: Server-Side Amount Calculation
   * The browser must NEVER decide the payment amount.
   */
  async calculateServerAmount(
    paymentType: PaymentType,
    relatedPropertyId?: string,
    relatedBookingId?: string,
    relatedStayId?: string
  ): Promise<number> {
    try {
      const supabase = createClient();

      if (paymentType === "PROPERTY_UNLOCK" || paymentType === "VISIT_PASS") {
        // Fetch setting from database if available, fall back to centralized constant
        const { data } = await supabase
          .from("platform_settings")
          .select("value")
          .eq("key", "property_unlock_price")
          .single();

        if (data?.value) {
          const parsed = Number(data.value);
          if (!isNaN(parsed) && parsed > 0) return parsed;
        }
        return PLATFORM_SETTINGS.PROPERTY_UNLOCK_PRICE; // ₹9
      }

      if (paymentType === "ROOM_BOOKING" || paymentType === "BOOKING_RENT") {
        if (relatedBookingId) {
          const bk = await bookingService.getBookingById(relatedBookingId);
          if (bk) {
            const rent = Number(bk.monthlyRent || 0);
            const deposit = Number(bk.securityDeposit || 0);
            const fee = Number(bk.platformCharges || 0);
            const total = rent + deposit + fee;
            if (total > 0) return total;
          }

          const { data: booking } = await supabase
            .from("bookings")
            .select("monthly_rent, security_deposit, platform_charges, total_amount_due")
            .eq("id", relatedBookingId)
            .single();

          if (booking) {
            const rent = Number(booking.monthly_rent || 0);
            const deposit = Number(booking.security_deposit || 0);
            const fee = Number(booking.platform_charges || PLATFORM_SETTINGS.BOOKING_PLATFORM_FEE);
            if (rent > 0 || deposit > 0) {
              return rent + deposit + fee;
            }
            if (booking.total_amount_due) {
              return Number(booking.total_amount_due);
            }
          }
        }
        return 16000 + 32000 + PLATFORM_SETTINGS.BOOKING_PLATFORM_FEE;
      }

      if (paymentType === "SECURITY_DEPOSIT") {
        if (relatedBookingId) {
          const { data: booking } = await supabase
            .from("bookings")
            .select("security_deposit")
            .eq("id", relatedBookingId)
            .single();

          if (booking?.security_deposit) {
            return Number(booking.security_deposit);
          }
        }
        return 32000;
      }

      if (paymentType === "MONTHLY_RENT") {
        if (relatedStayId) {
          const stayRecord = await stayService.getStayById(relatedStayId);
          if (stayRecord?.monthlyRent) {
            return stayRecord.monthlyRent;
          }

          const { data: stay } = await supabase
            .from("stays")
            .select("monthly_rent, room_id")
            .eq("id", relatedStayId)
            .single();

          if (stay?.monthly_rent) {
            return Number(stay.monthly_rent);
          }

          if (stay?.room_id) {
            const { data: room } = await supabase
              .from("rooms")
              .select("monthly_rent")
              .eq("id", stay.room_id)
              .single();

            if (room?.monthly_rent) {
              return Number(room.monthly_rent);
            }
          }
        }
        return 16000;
      }

      return PLATFORM_SETTINGS.PROPERTY_UNLOCK_PRICE;
    } catch {
      if (paymentType === "PROPERTY_UNLOCK" || paymentType === "VISIT_PASS") {
        return PLATFORM_SETTINGS.PROPERTY_UNLOCK_PRICE;
      }
      return 16000;
    }
  },

  /**
   * 1. Create Internal Payment Record
   */
  async createPaymentRecord(input: {
    userId: string;
    amount: number;
    currency?: string;
    paymentType: PaymentType;
    relatedPropertyId?: string;
    relatedBookingId?: string;
    relatedStayId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<PaymentRecord> {
    const supabase = createClient();
    const currency = input.currency || "INR";

    try {
      const { data, error } = await supabase
        .from("payments")
        .insert({
          user_id: input.userId,
          tenant_id: input.userId,
          amount: input.amount,
          currency,
          payment_type: input.paymentType as unknown as "security_deposit" | "monthly_rent" | "booking_fee" | "maintenance" | "deposit_refund",
          provider: "razorpay",
          status: "CREATED" as unknown as "initiated" | "success" | "failed" | "refunded",
          related_property_id: input.relatedPropertyId,
          booking_id: input.relatedBookingId,
          related_stay_id: input.relatedStayId,
          metadata: input.metadata || {},
        })
        .select("*")
        .single();

      if (!error && data) {
        return data as unknown as PaymentRecord;
      }
    } catch (e) {
      console.warn("Using fallback mock for payment creation:", e);
    }

    const mockRec: PaymentRecord = {
      id: `pay-${Date.now()}`,
      user_id: input.userId,
      tenant_id: input.userId,
      amount: input.amount,
      currency,
      payment_type: input.paymentType,
      provider: "razorpay",
      status: "CREATED",
      related_property_id: input.relatedPropertyId,
      related_booking_id: input.relatedBookingId,
      related_stay_id: input.relatedStayId,
      metadata: input.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    MOCK_PAYMENTS.unshift(mockRec);
    return mockRec;
  },

  /**
   * 2. Server-Side Razorpay Order Creation Architecture
   * Performs idempotency checks, server-side amount calculation, internal payment record creation,
   * calls Razorpay Node SDK, and returns safe checkout configuration ONLY.
   */
  async createRazorpayOrder(input: CreateRazorpayOrderInput): Promise<RazorpayOrderCheckoutResponse> {
    if (!input.userId) {
      throw new Error("Authentication required for payment creation.");
    }

    const targetPropertyId = input.relatedPropertyId || input.referenceId;
    const targetBookingId = input.relatedBookingId || input.bookingId;
    const targetStayId = input.relatedStayId;

    // A. IDEMPOTENCY CHECK: Ensure user does not create duplicate order if already active unlock exists
    if (input.paymentType === "PROPERTY_UNLOCK" && targetPropertyId) {
      const alreadyUnlocked = await propertyUnlockService.hasUserUnlockedProperty(input.userId, targetPropertyId);
      if (alreadyUnlocked) {
        throw new Error("User already holds an active access pass for this property.");
      }
    }

    // A2. AUTHORIZATION & IDEMPOTENCY CHECK: Room Booking
    if (input.paymentType === "ROOM_BOOKING" || input.paymentType === "BOOKING_RENT") {
      if (!targetBookingId) {
        throw new Error("Booking ID is required to create a room booking payment order.");
      }
      const bk = await bookingService.getBookingById(targetBookingId);
      if (!bk) {
        throw new Error("Target booking reservation not found.");
      }
      if (input.userId !== bk.user.id) {
        throw new Error("Unauthorized payment attempt: User does not own this booking.");
      }
      if (bk.bookingStatus === "CANCELLED") {
        throw new Error("Cannot process payment for a cancelled booking.");
      }
      if (bk.paymentStatus === "PAID") {
        throw new Error("Booking payment is already complete.");
      }

      // Check existing pending order for idempotency
      const existingPending = await this.getPendingPaymentForBooking(targetBookingId, input.userId);
      if (existingPending && existingPending.razorpay_order_id) {
        const { keyId } = this.getRazorpaySecrets();
        return {
          paymentId: existingPending.id,
          razorpayOrderId: existingPending.razorpay_order_id,
          razorpayKeyId: keyId,
          amount: existingPending.amount,
          amountInPaise: Math.round(existingPending.amount * 100),
          currency: "INR",
        };
      }
    }

    // B. Calculate Amount Server-Side (NEVER trust client amount)
    const amount = await this.calculateServerAmount(
      input.paymentType,
      targetPropertyId,
      targetBookingId,
      targetStayId
    );

    const amountInPaise = Math.round(amount * 100);

    // C. Create Internal Payment Record (Status: CREATED)
    const internalPayment = await this.createPaymentRecord({
      userId: input.userId,
      amount,
      currency: "INR",
      paymentType: input.paymentType,
      relatedPropertyId: targetPropertyId,
      relatedBookingId: targetBookingId,
      relatedStayId: targetStayId,
      metadata: input.metadata,
    });

    // D. Call Server-Side Razorpay SDK
    const receipt = `rcpt_${internalPayment.id.slice(0, 10)}_${Date.now()}`;
    const razorpayOrder = await createServerRazorpayOrder({
      amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        paymentId: internalPayment.id,
        userId: input.userId,
        paymentType: input.paymentType,
        propertyId: targetPropertyId || "",
        bookingId: targetBookingId || "",
      },
    });

    // E. Update Internal Payment Record with Razorpay Order ID & ORDER_CREATED Status
    await this.updatePaymentStatus(internalPayment.id, "ORDER_CREATED", {
      razorpay_order_id: razorpayOrder.id,
    });

    const { keyId } = this.getRazorpaySecrets();

    // F. Return SAFE Checkout Configuration ONLY (NEVER RETURN SECRET)
    return {
      paymentId: internalPayment.id,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: keyId,
      amount,
      amountInPaise,
      currency: "INR",
    };
  },

  /**
   * Helper: Check for existing pending payment attempt for booking
   */
  async getPendingPaymentForBooking(bookingId: string, userId: string): Promise<PaymentRecord | null> {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("payments")
        .select("*")
        .or(`user_id.eq.${userId},tenant_id.eq.${userId}`)
        .or(`booking_id.eq.${bookingId},related_booking_id.eq.${bookingId}`)
        .in("status", ["CREATED", "ORDER_CREATED", "PENDING"])
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (data) return data as unknown as PaymentRecord;
    } catch {
      // Fallback
    }

    const found = MOCK_PAYMENTS.find(
      (p) =>
        (p.user_id === userId || p.tenant_id === userId) &&
        (p.related_booking_id === bookingId || p.booking_id === bookingId) &&
        ["CREATED", "ORDER_CREATED", "PENDING"].includes(p.status)
    );
    return found || null;
  },

  /**
   * Reusable Booking Finalization Method
   */
  async finalizeSuccessfulBookingPayment(paymentId: string): Promise<{ success: boolean; message: string }> {
    if (!paymentId) return { success: false, message: "Missing payment ID" };
    const payment = await this.getPaymentById(paymentId);
    if (!payment) return { success: false, message: "Payment record not found" };

    if (payment.status !== "CAPTURED") return { success: false, message: "Payment status is not CAPTURED" };

    const targetBookingId = payment.related_booking_id || payment.booking_id;
    if (!targetBookingId) return { success: false, message: "Missing related booking ID" };

    await bookingService.markBookingAsPaid(
      targetBookingId,
      payment.razorpay_order_id || undefined,
      payment.razorpay_payment_id || undefined
    );

    return { success: true, message: `Booking ${targetBookingId} marked PAID successfully.` };
  },

  /**
   * 3. Server-Side Signature Verification & Status Transition to CAPTURED + Unlock Creation / Booking Finalization
   */
  async verifyRazorpayPaymentSignature(input: VerifyRazorpayPaymentInput): Promise<PaymentRecord> {
    if (!input.razorpayOrderId || !input.razorpayPaymentId || !input.razorpaySignature) {
      throw new Error("Missing required Razorpay verification parameters.");
    }

    // A. Locate Payment Record by Razorpay Order ID
    const payment = await this.getPaymentByRazorpayOrderId(input.razorpayOrderId);
    if (!payment) {
      throw new Error("No payment record found matching the provided Razorpay Order ID.");
    }

    // B. Security: Verify User Ownership
    if (input.userId && payment.user_id !== input.userId && payment.tenant_id !== input.userId) {
      throw new Error("Unauthorized payment access attempt.");
    }

    // C. IDEMPOTENCY CHECK: If already finalized, finalize unlock or booking payment if needed and return
    if (payment.status === "CAPTURED") {
      if ((payment.payment_type === "PROPERTY_UNLOCK" || payment.payment_type === "VISIT_PASS") && payment.related_property_id) {
        await propertyUnlockService.unlockPropertyForUser(
          payment.user_id || payment.tenant_id,
          payment.related_property_id,
          payment.amount,
          payment.id,
          payment.razorpay_payment_id || undefined
        );
      } else if (payment.payment_type === "ROOM_BOOKING" || payment.payment_type === "BOOKING_RENT") {
        await this.finalizeSuccessfulBookingPayment(payment.id);
      }
      return payment;
    }

    // D. Cryptographic HMAC SHA-256 Signature Verification
    const isValid = verifyServerRazorpaySignature({
      razorpayOrderId: input.razorpayOrderId,
      razorpayPaymentId: input.razorpayPaymentId,
      razorpaySignature: input.razorpaySignature,
    });

    if (!isValid) {
      await this.updatePaymentStatus(payment.id, "FAILED", {
        razorpay_payment_id: input.razorpayPaymentId,
        razorpay_signature: input.razorpaySignature,
      });
      throw new Error("Invalid Razorpay payment signature. Payment verification failed.");
    }

    // E. State Transition: Update to CAPTURED
    const updatedPayment = await this.updatePaymentStatus(payment.id, "CAPTURED", {
      razorpay_payment_id: input.razorpayPaymentId,
      razorpay_signature: input.razorpaySignature,
      paid_at: new Date().toISOString(),
    });

    // F. AUTOMATIC PROPERTY UNLOCK OR BOOKING PAYMENT FINALIZATION
    if ((updatedPayment.payment_type === "PROPERTY_UNLOCK" || updatedPayment.payment_type === "VISIT_PASS") && updatedPayment.related_property_id) {
      await propertyUnlockService.unlockPropertyForUser(
        updatedPayment.user_id || updatedPayment.tenant_id,
        updatedPayment.related_property_id,
        updatedPayment.amount,
        updatedPayment.id,
        updatedPayment.razorpay_payment_id || undefined
      );
    } else if (updatedPayment.payment_type === "ROOM_BOOKING" || updatedPayment.payment_type === "BOOKING_RENT") {
      await this.finalizeSuccessfulBookingPayment(updatedPayment.id);
    }

    return updatedPayment;
  },

  /**
   * 4. Razorpay Webhook Processing & Reconciliation (Raw Body Verification + Webhook Idempotency)
   */
  async handleRazorpayWebhook(rawBody: string, signature: string): Promise<WebhookProcessingResult> {
    if (!rawBody || !signature) {
      return { success: false, message: "Missing raw body or webhook signature." };
    }

    // A. Verify Webhook HMAC Signature against RAZORPAY_WEBHOOK_SECRET
    const isValidSignature = verifyServerWebhookSignature({ rawBody, signature });
    if (!isValidSignature) {
      return { success: false, message: "Invalid Razorpay webhook signature." };
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return { success: false, message: "Invalid JSON webhook payload." };
    }

    const eventName = (payload.event as string) || "";
    const innerPayload = payload.payload as Record<string, unknown> | undefined;
    const paymentObj = innerPayload?.payment as Record<string, unknown> | undefined;
    const paymentEntity = paymentObj?.entity as Record<string, unknown> | undefined;

    const orderObj = innerPayload?.order as Record<string, unknown> | undefined;
    const orderEntity = orderObj?.entity as Record<string, unknown> | undefined;

    const paymentEntityId = (paymentEntity?.id as string) || "";
    const eventId = (payload.event_id as string) || `${eventName}_${paymentEntityId || Date.now()}`;
    const orderId = (paymentEntity?.order_id as string) || (orderEntity?.id as string) || "";

    // B. WEBHOOK IDEMPOTENCY: Check payment_events table
    const isDuplicate = await this.recordWebhookEvent(eventId, eventName, payload);
    if (isDuplicate) {
      return {
        success: true,
        duplicate: true,
        message: "Webhook event already processed (Idempotency locked).",
        eventId,
      };
    }

    // C. Reconcile Payment Status & Property Unlock in Database
    if (orderId) {
      const payment = await this.getPaymentByRazorpayOrderId(orderId);
      if (payment) {
        if ((eventName === "payment.captured" || eventName === "order.paid") && payment.status !== "CAPTURED") {
          const updated = await this.updatePaymentStatus(payment.id, "CAPTURED", {
            razorpay_payment_id: paymentEntityId,
            paid_at: new Date().toISOString(),
          });

          if ((updated.payment_type === "PROPERTY_UNLOCK" || updated.payment_type === "VISIT_PASS") && updated.related_property_id) {
            await propertyUnlockService.unlockPropertyForUser(
              updated.user_id || updated.tenant_id,
              updated.related_property_id,
              updated.amount,
              updated.id,
              paymentEntityId
            );
          }
        } else if (eventName === "payment.authorized" && payment.status !== "CAPTURED") {
          await this.updatePaymentStatus(payment.id, "AUTHORIZED");
        } else if (eventName === "payment.failed" && payment.status !== "CAPTURED") {
          await this.updatePaymentStatus(payment.id, "FAILED");
        }
      }
    }

    return {
      success: true,
      message: `Webhook ${eventName} processed successfully.`,
      eventId,
    };
  },

  /**
   * Record Webhook Event for Idempotency Protection
   */
  async recordWebhookEvent(eventId: string, eventType: string, payload: unknown): Promise<boolean> {
    if (PROCESSED_WEBHOOK_EVENTS.has(eventId)) {
      return true;
    }
    PROCESSED_WEBHOOK_EVENTS.add(eventId);

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("payment_events")
        .select("id")
        .eq("event_id", eventId)
        .single();

      if (data) {
        return true;
      }

      await supabase.from("payment_events").insert({
        provider: "razorpay",
        event_id: eventId,
        event_type: eventType,
        payload: payload as Record<string, unknown>,
      });
    } catch {
      // Fallback
    }

    return false;
  },

  /**
   * Helper: Update Payment Record Status & Razorpay Mapping
   */
  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    updates?: {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
      paid_at?: string;
    }
  ): Promise<PaymentRecord> {
    const supabase = createClient();
    const patchData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
      ...updates,
    };

    try {
      const { data, error } = await supabase
        .from("payments")
        .update(patchData)
        .eq("id", paymentId)
        .select("*")
        .single();

      if (!error && data) {
        return data as unknown as PaymentRecord;
      }
    } catch (e) {
      console.warn("DB update failed, mutating local fallback:", e);
    }

    const idx = MOCK_PAYMENTS.findIndex((p) => p.id === paymentId);
    if (idx !== -1) {
      MOCK_PAYMENTS[idx] = {
        ...MOCK_PAYMENTS[idx],
        status,
        updated_at: new Date().toISOString(),
        ...(updates?.razorpay_order_id ? { razorpay_order_id: updates.razorpay_order_id } : {}),
        ...(updates?.razorpay_payment_id ? { razorpay_payment_id: updates.razorpay_payment_id } : {}),
        ...(updates?.razorpay_signature ? { razorpay_signature: updates.razorpay_signature } : {}),
        ...(updates?.paid_at ? { paid_at: updates.paid_at } : {}),
      };
      return MOCK_PAYMENTS[idx];
    }

    throw new Error(`Payment record ${paymentId} not found.`);
  },

  /**
   * Lookups
   */
  async getPaymentById(id: string, userId?: string): Promise<PaymentRecord | null> {
    try {
      const supabase = createClient();
      let query = supabase.from("payments").select("*").eq("id", id);
      if (userId) {
        query = query.or(`user_id.eq.${userId},tenant_id.eq.${userId}`);
      }
      const { data } = await query.single();
      if (data) return data as unknown as PaymentRecord;
    } catch {
      // Fallback
    }

    const found = MOCK_PAYMENTS.find((p) => p.id === id);
    if (found && (!userId || found.user_id === userId || found.tenant_id === userId)) {
      return found;
    }
    return null;
  },

  async getPaymentByRazorpayOrderId(orderId: string): Promise<PaymentRecord | null> {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("razorpay_order_id", orderId)
        .single();

      if (data) return data as unknown as PaymentRecord;
    } catch {
      // Fallback
    }

    return MOCK_PAYMENTS.find((p) => p.razorpay_order_id === orderId) || null;
  },

  async getPaymentByRazorpayPaymentId(paymentId: string): Promise<PaymentRecord | null> {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("razorpay_payment_id", paymentId)
        .single();

      if (data) return data as unknown as PaymentRecord;
    } catch {
      // Fallback
    }

    return MOCK_PAYMENTS.find((p) => p.razorpay_payment_id === paymentId) || null;
  },

  async getUserPayments(userId: string): Promise<PaymentRecord[]> {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("payments")
        .select("*")
        .or(`user_id.eq.${userId},tenant_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (data) return data as unknown as PaymentRecord[];
    } catch {
      // Fallback
    }

    return MOCK_PAYMENTS.filter((p) => p.user_id === userId || p.tenant_id === userId);
  },

  // Legacy compatibility helpers to preserve Prompt 1-32 code
  async processWebhookEvent(rawBody: string, signature: string) {
    const res = await this.handleRazorpayWebhook(rawBody, signature);
    return res;
  },

  async verifyPayment(params: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) {
    try {
      const payment = await this.verifyRazorpayPaymentSignature({
        razorpayOrderId: params.razorpayOrderId,
        razorpayPaymentId: params.razorpayPaymentId,
        razorpaySignature: params.razorpaySignature,
      });
      return { success: true, message: "Payment verified successfully", payment };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed";
      return { success: false, message: msg };
    }
  },

  async createOrder(params: { amount: number; currency: string; receipt: string; notes?: Record<string, string> }) {
    const orderId = `order_${Date.now()}`;
    return { id: orderId, amount: params.amount, currency: params.currency, receipt: params.receipt };
  },

  async getTransactionById(id: string): Promise<RazorpayTransaction | null> {
    const p = await this.getPaymentById(id);
    if (!p) return null;
    return {
      id: p.id,
      userId: p.user_id,
      tenantId: p.tenant_id,
      razorpayOrderId: p.razorpay_order_id || "",
      razorpayPaymentId: p.razorpay_payment_id || undefined,
      signature: p.razorpay_signature || undefined,
      amount: p.amount,
      currency: p.currency,
      paymentType: p.payment_type,
      user: { id: p.user_id, fullName: "User", email: "", phone: "" },
      reference: { propertyId: p.related_property_id || undefined },
      status: p.status,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      paidAt: p.paid_at || undefined,
    };
  },

  async getUserTransactions(userId?: string): Promise<RazorpayTransaction[]> {
    const list = userId ? await this.getUserPayments(userId) : MOCK_PAYMENTS;
    return list.map((p) => ({
      id: p.id,
      userId: p.user_id,
      tenantId: p.tenant_id,
      razorpayOrderId: p.razorpay_order_id || "",
      razorpayPaymentId: p.razorpay_payment_id || undefined,
      signature: p.razorpay_signature || undefined,
      amount: p.amount,
      currency: p.currency,
      paymentType: p.payment_type,
      user: { id: p.user_id, fullName: "User", email: "", phone: "" },
      reference: { propertyId: p.related_property_id || undefined },
      status: p.status,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      paidAt: p.paid_at || undefined,
    }));
  },

  async getOwnerTransactions(ownerId?: string): Promise<RazorpayTransaction[]> {
    return this.getUserTransactions(ownerId);
  },

  async getAllTransactions(): Promise<RazorpayTransaction[]> {
    return this.getUserTransactions();
  },
};
