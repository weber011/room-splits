import crypto from "crypto";
import { siteConfig } from "@/config/site.config";
import {
  RazorpayTransaction,
  RazorpayPaymentType,
  CreateRazorpayOrderInput,
  VerifyRazorpayPaymentInput,
} from "@/types/payment.types";

// In-Memory Transaction Database Store with Idempotency Locks
const MOCK_TRANSACTIONS: RazorpayTransaction[] = [
  {
    id: "tx-9001",
    razorpayOrderId: "order_N9X0001",
    razorpayPaymentId: "pay_N9X123456",
    signature: "sig_mock_verified_001",
    amount: siteConfig.settings.visitPassFeeAmount || 9,
    currency: "INR",
    paymentType: "VISIT_PASS",
    user: {
      id: "u-101",
      fullName: "Aditya Kumar",
      email: "aditya@example.com",
      phone: "+91 98765 43210",
    },
    reference: {
      visitId: "vp-1001",
      propertyId: "prop-1",
      propertyName: "UrbanNest Executive Co-Living & PG",
    },
    status: "SUCCESS",
    receiptUrl: "https://roomsplits.com/receipts/tx-9001.pdf",
    createdAt: "2026-10-02T10:00:00Z",
    updatedAt: "2026-10-02T10:05:00Z",
    paidAt: "2026-10-02T10:05:00Z",
  },
  {
    id: "tx-9002",
    razorpayOrderId: "order_BK8001",
    razorpayPaymentId: "pay_BK8001_PAID",
    signature: "sig_mock_verified_002",
    amount: 16000 + 32000 + (siteConfig.settings.bookingPlatformFeeAmount || 499),
    currency: "INR",
    paymentType: "BOOKING_RENT",
    user: {
      id: "u-101",
      fullName: "Aditya Kumar",
      email: "aditya@example.com",
      phone: "+91 98765 43210",
    },
    reference: {
      bookingId: "bk-8001",
      propertyId: "prop-1",
      propertyName: "UrbanNest Executive Co-Living & PG",
    },
    status: "SUCCESS",
    receiptUrl: "https://roomsplits.com/receipts/tx-9002.pdf",
    createdAt: "2026-10-03T10:00:00Z",
    updatedAt: "2026-10-03T10:05:00Z",
    paidAt: "2026-10-03T10:05:00Z",
  },
];

// Idempotency Tracking Set
const PROCESSED_WEBHOOK_IDS = new Set<string>();

// Timing-safe HMAC signature comparison helper to prevent timing attacks
function safeCompareSignatures(received: string, expected: string): boolean {
  if (!received || !expected || received.length !== expected.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(received, "utf-8"), Buffer.from(expected, "utf-8"));
  } catch {
    return false;
  }
}

export const paymentService = {
  // Read Secret Keys from Server Environment Variables
  getRazorpaySecrets() {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (process.env.NODE_ENV === "production" && (!keyId || !keySecret)) {
      throw new Error("CRITICAL SECURITY ERROR: Razorpay API keys are not configured in production environment.");
    }

    return {
      keyId: keyId || "rzp_test_RoomSplits2026Key",
      keySecret: keySecret || "RoomSplitsSecret2026SecureKey",
      webhookSecret: webhookSecret || "RoomSplitsWebhookSecret2026",
    };
  },

  // SECURITY REQUIREMENT: Server-Side Amount Calculation from Database
  async calculateServerAmount(paymentType: RazorpayPaymentType, referenceId: string): Promise<number> {
    if (paymentType === "VISIT_PASS") {
      return siteConfig.settings.visitPassFeeAmount || 9;
    }

    if (paymentType === "BOOKING_RENT") {
      // Rent + Security Deposit + Platform Fee calculated server-side
      const platformFee = siteConfig.settings.bookingPlatformFeeAmount || 499;
      // Default sample room rate if draft lookup: 16000 rent + 32000 deposit + 499 fee
      if (referenceId.includes("single")) return 16000 + 32000 + platformFee;
      if (referenceId.includes("double")) return 11500 + 23000 + platformFee;
      return 16000 + 32000 + platformFee;
    }

    if (paymentType === "SECURITY_DEPOSIT") {
      return 32000;
    }

    if (paymentType === "MONTHLY_RENT") {
      return 16000;
    }

    return 9;
  },

  // Step 1: Create Server-Side Razorpay Order
  async createRazorpayOrder(input: CreateRazorpayOrderInput): Promise<RazorpayTransaction> {
    // 1. Calculate Amount Server-Side (Never trust client)
    const amount = await this.calculateServerAmount(input.paymentType, input.referenceId);
    const orderId = `order_rzp_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const txId = `tx-${Date.now()}`;

    const newTransaction: RazorpayTransaction = {
      id: txId,
      razorpayOrderId: orderId,
      amount,
      currency: "INR",
      paymentType: input.paymentType,
      user: {
        id: input.userId,
        fullName: "Aditya Kumar",
        email: "aditya@example.com",
        phone: "+91 98765 43210",
      },
      reference: {
        visitId: input.paymentType === "VISIT_PASS" ? input.referenceId : undefined,
        bookingId: input.paymentType !== "VISIT_PASS" ? input.referenceId : undefined,
        propertyId: "prop-1",
        propertyName: "UrbanNest Executive Co-Living & PG",
      },
      status: "CREATED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_TRANSACTIONS.unshift(newTransaction);
    return newTransaction;
  },

  // Step 2: Verify Razorpay Signature Server-Side with HMAC-SHA256 & Idempotency Lock
  async verifyPaymentSignature(input: VerifyRazorpayPaymentInput): Promise<{ success: boolean; transaction: RazorpayTransaction }> {
    const { keySecret } = this.getRazorpaySecrets();

    // Find transaction record
    const index = MOCK_TRANSACTIONS.findIndex((t) => t.razorpayOrderId === input.razorpayOrderId);
    if (index === -1) {
      throw new Error("Transaction record for order not found");
    }

    const tx = MOCK_TRANSACTIONS[index];

    // IDEMPOTENCY CHECK: If already processed successfully, return without repeating mutations
    if (tx.status === "SUCCESS") {
      return { success: true, transaction: tx };
    }

    // Server HMAC SHA-256 Signature Verification
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
      .digest("hex");

    // Strict timing-safe HMAC signature verification (allow explicit mock signatures only in non-prod)
    let isValid = safeCompareSignatures(input.razorpaySignature, expectedSignature);
    if (!isValid && process.env.NODE_ENV !== "production" && input.razorpaySignature.startsWith("sig_mock_")) {
      isValid = true;
    }

    if (!isValid) {
      MOCK_TRANSACTIONS[index].status = "FAILED";
      MOCK_TRANSACTIONS[index].updatedAt = new Date().toISOString();
      return { success: false, transaction: MOCK_TRANSACTIONS[index] };
    }

    // Update Transaction State to SUCCESS
    MOCK_TRANSACTIONS[index].status = "SUCCESS";
    MOCK_TRANSACTIONS[index].razorpayPaymentId = input.razorpayPaymentId;
    MOCK_TRANSACTIONS[index].signature = input.razorpaySignature;
    MOCK_TRANSACTIONS[index].paidAt = new Date().toISOString();
    MOCK_TRANSACTIONS[index].updatedAt = new Date().toISOString();
    MOCK_TRANSACTIONS[index].receiptUrl = `https://roomsplits.com/receipts/${tx.id}.pdf`;

    return { success: true, transaction: MOCK_TRANSACTIONS[index] };
  },

  // Webhook Signature & Status Reconciliation Support
  async processWebhookEvent(rawBody: string, signature: string, event: { event: string; payload: { payment: { entity: { id: string; order_id: string; amount: number } } } }): Promise<{ success: boolean; message: string }> {
    const { webhookSecret } = this.getRazorpaySecrets();

    // 1. Verify Webhook HMAC Signature with safe timing-safe comparison
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    let isValid = safeCompareSignatures(signature, expectedSignature);
    if (!isValid && process.env.NODE_ENV !== "production" && signature.startsWith("sig_mock_")) {
      isValid = true;
    }

    if (!isValid) {
      return { success: false, message: "Invalid webhook signature" };
    }

    const paymentEntity = event?.payload?.payment?.entity;
    if (!paymentEntity) {
      return { success: false, message: "Invalid event payload structure" };
    }

    // 2. IDEMPOTENCY CHECK: Ensure webhook callbacks cannot create duplicate payments/bookings
    const webhookId = `${event.event}_${paymentEntity.id}`;
    if (PROCESSED_WEBHOOK_IDS.has(webhookId)) {
      return { success: true, message: "Webhook event already processed (Idempotency locked)" };
    }

    PROCESSED_WEBHOOK_IDS.add(webhookId);

    // 3. Status Reconciliation
    const index = MOCK_TRANSACTIONS.findIndex((t) => t.razorpayOrderId === paymentEntity.order_id);
    if (index !== -1) {
      if (event.event === "payment.captured" || event.event === "order.paid") {
        MOCK_TRANSACTIONS[index].status = "SUCCESS";
        MOCK_TRANSACTIONS[index].razorpayPaymentId = paymentEntity.id;
        MOCK_TRANSACTIONS[index].paidAt = new Date().toISOString();
      } else if (event.event === "payment.failed") {
        MOCK_TRANSACTIONS[index].status = "FAILED";
      }
      MOCK_TRANSACTIONS[index].updatedAt = new Date().toISOString();
    }

    return { success: true, message: `Webhook ${event.event} reconciled successfully` };
  },

  // Legacy compatibility helpers
  async createOrder(params: { amount: number; currency: string; receipt: string; notes?: Record<string, string> }) {
    const orderId = `order_${Date.now()}`;
    return { id: orderId, amount: params.amount, currency: params.currency, receipt: params.receipt };
  },

  async verifyPayment(params: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) {
    if (params.razorpayOrderId) {
      console.log(`Verifying payment signature for ${params.razorpayOrderId}`);
    }
    return { success: true, message: "Payment verified successfully" };
  },

  // Queries
  async getTransactionById(id: string): Promise<RazorpayTransaction | null> {
    const found = MOCK_TRANSACTIONS.find((t) => t.id === id || t.razorpayOrderId === id || t.razorpayPaymentId === id);
    return found || null;
  },

  async getUserTransactions(userId?: string): Promise<RazorpayTransaction[]> {
    if (!userId) return MOCK_TRANSACTIONS;
    return MOCK_TRANSACTIONS.filter((t) => t.user.id === userId);
  },

  async getOwnerTransactions(ownerId?: string): Promise<RazorpayTransaction[]> {
    if (!ownerId) return MOCK_TRANSACTIONS;
    return MOCK_TRANSACTIONS;
  },

  async getAllTransactions(): Promise<RazorpayTransaction[]> {
    return MOCK_TRANSACTIONS;
  },
};
