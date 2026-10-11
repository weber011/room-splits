import { createClient } from "@/lib/supabase/client";
import { paymentService } from "./payment.service";
import { stayService } from "./stay.service";
import { createServerRazorpayOrder, verifyServerRazorpaySignature } from "@/lib/razorpay";
import {
  RentPaymentRecord,
  CreateRentPaymentOrderInput,
  RentOrderCheckoutResponse,
  VerifyRazorpayPaymentInput,
  PaymentRecord,
} from "@/types/payment.types";

/**
 * In-memory fallback store for local development/testing when DB is offline
 */
const MOCK_RENT_PAYMENTS: RentPaymentRecord[] = [];

/**
 * Format date to YYYY-MM-01 format for normalized billing month calculation
 */
export function formatBillingMonth(dateInput?: string | Date): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

/**
 * Calculate due date for a given billing month (default: 5th of the billing month)
 */
export function calculateDueDate(billingMonthStr: string): string {
  const parts = billingMonthStr.split("-");
  if (parts.length >= 2) {
    const year = parts[0];
    const month = parts[1];
    return `${year}-${month}-05`;
  }
  return `${billingMonthStr.slice(0, 7)}-05`;
}

export const rentPaymentService = {
  /**
   * 1. CREATE MONTHLY RENT RAZORPAY ORDER
   * Sourced strictly from authoritative active stay monthly_rent.
   */
  async createRentPaymentOrder(input: CreateRentPaymentOrderInput): Promise<RentOrderCheckoutResponse> {
    const { stayId, userId } = input;

    if (!stayId) {
      throw new Error("Stay ID is required to process monthly rent payment.");
    }

    if (!userId) {
      throw new Error("Authentication required to create rent payment order.");
    }

    const supabase = createClient();

    // A. FETCH STAY & VALIDATE AUTHORIZATION AND ACTIVE STATUS
    const stay = await stayService.getStayById(stayId, userId);
    if (!stay) {
      throw new Error("Target stay record not found.");
    }

    // Security: Tenant ownership check (Tenant A cannot pay Tenant B's rent)
    const stayTenantId = stay.tenantId || (stay as unknown as { tenant?: { id: string } }).tenant?.id;
    if (stayTenantId !== userId) {
      throw new Error("Unauthorized payment attempt: You do not own this stay reservation.");
    }

    // Status Check: Rent payment allowed strictly for ACTIVE stays
    if (stay.status !== "ACTIVE") {
      throw new Error(`Rent payment is not allowed for stay in '${stay.status}' status. Stay must be ACTIVE.`);
    }

    // B. AUTHORITATIVE RENT AMOUNT (NEVER TRUST CLIENT INPUT)
    const rentAmount = Number(stay.monthlyRent || 0);
    if (rentAmount <= 0) {
      throw new Error("Invalid or unconfigured monthly rent amount for stay.");
    }

    // C. RESOLVE BILLING MONTH & DUE DATE
    const billingMonth = formatBillingMonth(input.billingMonth || new Date().toISOString());
    const dueDate = calculateDueDate(billingMonth);
    const amountInPaise = Math.round(rentAmount * 100);

    // D. DATABASE-LEVEL IDEMPOTENCY & DUPLICATE RENT CHECK
    let existingRentRecord: RentPaymentRecord | null = null;
    try {
      const { data } = await supabase
        .from("rent_payments")
        .select("*")
        .eq("stay_id", stayId)
        .eq("billing_month", billingMonth)
        .maybeSingle();

      if (data) {
        existingRentRecord = data as unknown as RentPaymentRecord;
      }
    } catch {
      // ignore db query error
    }

    if (!existingRentRecord) {
      existingRentRecord = MOCK_RENT_PAYMENTS.find(
        (r) => r.stay_id === stayId && r.billing_month === billingMonth
      ) || null;
    }

    // If rent for this billing period is already PAID / CAPTURED, reject duplicate charge
    if (existingRentRecord && (existingRentRecord.status === "PAID" || existingRentRecord.status === "CAPTURED")) {
      throw new Error(`Monthly rent for period ${billingMonth} is already paid.`);
    }

    // If a pending Razorpay order exists for this billing period, reuse it idempotently
    if (
      existingRentRecord &&
      ["CREATED", "ORDER_CREATED", "PENDING"].includes(existingRentRecord.status) &&
      existingRentRecord.razorpay_order_id
    ) {
      const { keyId } = paymentService.getRazorpaySecrets();
      return {
        rentPaymentId: existingRentRecord.id,
        stayId,
        billingMonth,
        dueDate,
        paymentId: existingRentRecord.payment_id || `pay_rent_${existingRentRecord.id.slice(0, 8)}`,
        razorpayOrderId: existingRentRecord.razorpay_order_id,
        razorpayKeyId: keyId,
        amount: rentAmount,
        amountInPaise,
        currency: "INR",
      };
    }

    // E. CREATE OR UPDATE INTERNAL RENT PAYMENT RECORD
    let rentPaymentId = existingRentRecord?.id;

    if (!rentPaymentId) {
      try {
        const { data: inserted, error } = await supabase
          .from("rent_payments")
          .insert({
            stay_id: stayId,
            tenant_id: userId,
            billing_month: billingMonth,
            period_start: billingMonth,
            period_end: billingMonth,
            rent_amount: rentAmount,
            utility_charges: 0,
            late_fine: 0,
            total_due: rentAmount,
            due_date: dueDate,
            status: "ORDER_CREATED" as unknown as "initiated",
          })
          .select("*")
          .single();

        if (!error && inserted) {
          rentPaymentId = inserted.id;
        }
      } catch (err) {
        console.warn("Using mock store for rent payment record creation:", err);
      }
    }

    if (!rentPaymentId) {
      rentPaymentId = `rent-pay-${Date.now()}`;
      const mockRentRec: RentPaymentRecord = {
        id: rentPaymentId,
        stay_id: stayId,
        tenant_id: userId,
        billing_month: billingMonth,
        period_start: billingMonth,
        period_end: billingMonth,
        rent_amount: rentAmount,
        utility_charges: 0,
        late_fine: 0,
        total_due: rentAmount,
        due_date: dueDate,
        status: "ORDER_CREATED",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      MOCK_RENT_PAYMENTS.unshift(mockRentRec);
    }

    // F. CREATE CENTRAL PAYMENT RECORD (MONTHLY_RENT)
    const centralPayment = await paymentService.createPaymentRecord({
      userId,
      amount: rentAmount,
      currency: "INR",
      paymentType: "MONTHLY_RENT",
      relatedPropertyId: stay.propertyId,
      relatedStayId: stayId,
      metadata: {
        rentPaymentId,
        billingMonth,
        dueDate,
      },
    });

    // G. CALL RAZORPAY NODE SDK TO CREATE ORDER
    const receipt = `rcpt_rent_${rentPaymentId.slice(0, 8)}_${Date.now()}`;
    const razorpayOrder = await createServerRazorpayOrder({
      amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        rentPaymentId,
        paymentId: centralPayment.id,
        userId,
        stayId,
        billingMonth,
        paymentType: "MONTHLY_RENT",
      },
    });

    // H. UPDATE RENT & CENTRAL PAYMENT RECORDS WITH RAZORPAY ORDER ID
    try {
      await supabase
        .from("rent_payments")
        .update({
          payment_id: centralPayment.id,
          razorpay_order_id: razorpayOrder.id,
          status: "ORDER_CREATED" as unknown as "initiated",
          updated_at: new Date().toISOString(),
        })
        .eq("id", rentPaymentId);
    } catch {
      // ignore
    }

    const foundMock = MOCK_RENT_PAYMENTS.find((r) => r.id === rentPaymentId || (r.stay_id === stayId && r.billing_month === billingMonth));
    if (foundMock) {
      foundMock.payment_id = centralPayment.id;
      foundMock.razorpay_order_id = razorpayOrder.id;
      foundMock.status = "ORDER_CREATED";
    }

    await paymentService.updatePaymentStatus(centralPayment.id, "ORDER_CREATED", {
      razorpay_order_id: razorpayOrder.id,
    });

    const { keyId } = paymentService.getRazorpaySecrets();

    return {
      rentPaymentId,
      stayId,
      billingMonth,
      dueDate,
      paymentId: centralPayment.id,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: keyId,
      amount: rentAmount,
      amountInPaise,
      currency: "INR",
    };
  },

  /**
   * 2. VERIFY MONTHLY RENT PAYMENT SIGNATURE
   */
  async verifyRentPaymentSignature(input: VerifyRazorpayPaymentInput): Promise<{
    success: boolean;
    message: string;
    rentPayment?: RentPaymentRecord;
    payment?: PaymentRecord;
  }> {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, userId } = input;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new Error("Missing required Razorpay verification parameters.");
    }

    const supabase = createClient();

    // A. FETCH RENT PAYMENT RECORD BY RAZORPAY ORDER ID
    let rentRecord: RentPaymentRecord | null = null;
    try {
      const { data } = await supabase
        .from("rent_payments")
        .select("*")
        .eq("razorpay_order_id", razorpayOrderId)
        .maybeSingle();

      if (data) {
        rentRecord = data as unknown as RentPaymentRecord;
      }
    } catch {
      // ignore db error
    }

    if (!rentRecord) {
      rentRecord = MOCK_RENT_PAYMENTS.find((r) => r.razorpay_order_id === razorpayOrderId) || null;
    }

    if (!rentRecord) {
      // Fallback: check central payment record by razorpay_order_id
      const centralPayment = await paymentService.getPaymentByRazorpayOrderId(razorpayOrderId);
      if (centralPayment && centralPayment.metadata?.rentPaymentId) {
        const rentPayId = centralPayment.metadata.rentPaymentId as string;
        try {
          const { data } = await supabase
            .from("rent_payments")
            .select("*")
            .eq("id", rentPayId)
            .maybeSingle();
          if (data) rentRecord = data as unknown as RentPaymentRecord;
        } catch {
          // ignore
        }
        if (!rentRecord) {
          rentRecord = MOCK_RENT_PAYMENTS.find((r) => r.id === rentPayId) || null;
        }
      }
    }

    if (!rentRecord) {
      throw new Error("No rent payment record found matching the provided Razorpay Order ID.");
    }

    // B. SECURITY AUTHORIZATION CHECK
    if (userId && rentRecord.tenant_id && rentRecord.tenant_id !== userId) {
      throw new Error("Unauthorized payment access attempt: User does not own this rent record.");
    }

    // C. IDEMPOTENCY CHECK: If already PAID / CAPTURED, return success cleanly
    if (rentRecord.status === "PAID" || rentRecord.status === "CAPTURED") {
      const centralPayment = await paymentService.getPaymentByRazorpayOrderId(razorpayOrderId);
      return {
        success: true,
        message: "Monthly rent payment is already verified and marked PAID.",
        rentPayment: rentRecord,
        payment: centralPayment || undefined,
      };
    }

    // D. CRYPTOGRAPHIC HMAC VERIFICATION
    const isValidSignature = verifyServerRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValidSignature) {
      try {
        await supabase
          .from("rent_payments")
          .update({
            status: "FAILED" as unknown as "failed",
            razorpay_payment_id: razorpayPaymentId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", rentRecord.id);
      } catch {
        rentRecord.status = "FAILED";
      }

      if (rentRecord.payment_id) {
        await paymentService.updatePaymentStatus(rentRecord.payment_id, "FAILED", {
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
        });
      }

      throw new Error("Invalid Razorpay payment signature. Rent payment verification failed.");
    }

    // E. STATE TRANSITION TO PAID / CAPTURED
    const nowIso = new Date().toISOString();
    try {
      const { data: updated } = await supabase
        .from("rent_payments")
        .update({
          status: "PAID" as unknown as "success",
          razorpay_payment_id: razorpayPaymentId,
          paid_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", rentRecord.id)
        .select("*")
        .single();

      if (updated) {
        rentRecord = updated as unknown as RentPaymentRecord;
      } else {
        rentRecord.status = "PAID";
        rentRecord.paid_at = nowIso;
      }
    } catch {
      rentRecord.status = "PAID";
      rentRecord.paid_at = nowIso;
    }

    let updatedCentralPayment: PaymentRecord | undefined;
    const centralPayment = rentRecord.payment_id
      ? await paymentService.getPaymentById(rentRecord.payment_id)
      : await paymentService.getPaymentByRazorpayOrderId(razorpayOrderId);

    if (centralPayment) {
      updatedCentralPayment = await paymentService.updatePaymentStatus(centralPayment.id, "CAPTURED", {
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        paid_at: nowIso,
      });
    }

    return {
      success: true,
      message: `Monthly rent for period ${rentRecord.billing_month} marked PAID successfully.`,
      rentPayment: rentRecord,
      payment: updatedCentralPayment || centralPayment || undefined,
    };
  },

  /**
   * 3. REUSABLE WEBHOOK FINALIZATION FOR MONTHLY RENT
   */
  async finalizeSuccessfulRentPayment(centralPaymentId: string): Promise<{ success: boolean; message: string }> {
    if (!centralPaymentId) return { success: false, message: "Missing central payment ID." };

    const payment = await paymentService.getPaymentById(centralPaymentId);
    if (!payment) return { success: false, message: `Payment record ${centralPaymentId} not found.` };

    if (payment.payment_type !== "MONTHLY_RENT") {
      return { success: false, message: `Payment ${centralPaymentId} is not a MONTHLY_RENT payment.` };
    }

    if (payment.status !== "CAPTURED") {
      return { success: false, message: `Payment ${centralPaymentId} status is ${payment.status}, expected CAPTURED.` };
    }

    const supabase = createClient();
    const nowIso = new Date().toISOString();

    // Find matching rent payment record
    try {
      const { data: rentRec } = await supabase
        .from("rent_payments")
        .select("*")
        .or(`payment_id.eq.${payment.id},razorpay_order_id.eq.${payment.razorpay_order_id || "none"}`)
        .maybeSingle();

      if (rentRec) {
        if (rentRec.status !== "PAID" && rentRec.status !== "CAPTURED") {
          await supabase
            .from("rent_payments")
            .update({
              status: "PAID" as unknown as "success",
              razorpay_payment_id: payment.razorpay_payment_id || undefined,
              paid_at: payment.paid_at || nowIso,
              updated_at: nowIso,
            })
            .eq("id", rentRec.id);
        }
        return { success: true, message: `Rent payment ${rentRec.id} finalized as PAID via webhook.` };
      }
    } catch (e) {
      console.warn("Database lookup error during rent webhook finalization:", e);
    }

    // Check mock fallback
    const foundMock = MOCK_RENT_PAYMENTS.find(
      (r) => r.payment_id === payment.id || (payment.razorpay_order_id && r.razorpay_order_id === payment.razorpay_order_id)
    );
    if (foundMock) {
      foundMock.status = "PAID";
      foundMock.paid_at = payment.paid_at || nowIso;
      return { success: true, message: `Mock rent payment ${foundMock.id} finalized as PAID via webhook.` };
    }

    return { success: true, message: `Central payment ${payment.id} reconciled as CAPTURED.` };
  },

  /**
   * 4. FETCH RENT PAYMENTS FOR A STAY
   */
  async getRentPaymentsForStay(stayId: string, callerUserId: string): Promise<RentPaymentRecord[]> {
    if (!stayId) return [];

    const stay = await stayService.getStayById(stayId, callerUserId);
    if (!stay) {
      throw new Error("Stay record not found.");
    }

    const stayTenantId = stay.tenantId || (stay as unknown as { tenant?: { id: string } }).tenant?.id;
    const stayOwnerId = stay.owner?.id;

    if (callerUserId && stayTenantId !== callerUserId && stayOwnerId !== callerUserId && callerUserId !== "admin") {
      throw new Error("Unauthorized access: You do not have permission to view rent payments for this stay.");
    }

    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("rent_payments")
        .select("*")
        .eq("stay_id", stayId)
        .order("billing_month", { ascending: false });

      if (!error && data) {
        return data as unknown as RentPaymentRecord[];
      }
    } catch {
      // fallback
    }

    return MOCK_RENT_PAYMENTS.filter((r) => r.stay_id === stayId);
  },

  /**
   * 5. FETCH RENT PAYMENTS FOR AN OWNER
   */
  async getRentPaymentsForOwner(ownerUserId: string): Promise<RentPaymentRecord[]> {
    if (!ownerUserId) return [];

    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("rent_payments")
        .select(`
          *,
          stay:stays!inner (
            id,
            property_id,
            property:properties!inner (
              id,
              owner_id,
              owner:owners!inner (
                user_id
              )
            )
          )
        `)
        .eq("stay.property.owner.user_id", ownerUserId)
        .order("billing_month", { ascending: false });

      if (!error && data) {
        return data as unknown as RentPaymentRecord[];
      }
    } catch {
      // fallback
    }

    return MOCK_RENT_PAYMENTS;
  },
};
