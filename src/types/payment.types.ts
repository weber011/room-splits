/**
 * Centralized Razorpay Payment Architecture Types for RoomSplits
 * Supports: PROPERTY_UNLOCK (₹9), ROOM_BOOKING, SECURITY_DEPOSIT, MONTHLY_RENT
 */

export type PaymentType =
  | "PROPERTY_UNLOCK"
  | "ROOM_BOOKING"
  | "SECURITY_DEPOSIT"
  | "MONTHLY_RENT"
  | "VISIT_PASS" // Legacy alias
  | "BOOKING_RENT"; // Legacy alias

export type RazorpayPaymentType = PaymentType;

export type PaymentStatus =
  | "CREATED"
  | "ORDER_CREATED"
  | "PENDING"
  | "AUTHORIZED"
  | "CAPTURED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "initiated" // Database enum fallback
  | "success" // Legacy fallback
  | "SUCCESS"; // Legacy fallback

export type RazorpayPaymentStatus = PaymentStatus;

export interface PaymentUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface PaymentReference {
  visitId?: string;
  bookingId?: string;
  propertyId?: string;
  propertyName?: string;
  stayId?: string;
}

export interface RazorpayTransaction {
  id: string;
  userId?: string;
  tenantId?: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  signature?: string;
  amount: number;
  currency: string;
  paymentType: PaymentType;
  user: PaymentUser;
  reference: PaymentReference;
  status: PaymentStatus;
  receiptUrl?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PaymentTransaction = RazorpayTransaction;

export interface PaymentRecord {
  id: string;
  user_id: string;
  tenant_id: string;
  amount: number;
  currency: string;
  payment_type: PaymentType;
  provider: string;
  status: PaymentStatus;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  razorpay_signature?: string | null;
  related_property_id?: string | null;
  related_booking_id?: string | null;
  booking_id?: string | null;
  related_stay_id?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  paid_at?: string | null;
}

export interface CreateRazorpayOrderInput {
  paymentType: PaymentType;
  userId: string;
  relatedPropertyId?: string;
  relatedBookingId?: string;
  bookingId?: string;
  relatedStayId?: string;
  referenceId?: string; // Legacy fallback
  metadata?: Record<string, unknown>;
}

export interface VerifyRazorpayPaymentInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  userId?: string;
}

export interface RazorpayOrderCheckoutResponse {
  paymentId: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number; // in INR rupees
  amountInPaise: number;
  currency: string;
}

export interface RentPaymentRecord {
  id: string;
  stay_id: string;
  payment_id?: string | null;
  tenant_id?: string | null;
  billing_month: string;
  period_start?: string | null;
  period_end?: string | null;
  rent_amount: number;
  utility_charges: number;
  late_fine: number;
  total_due: number;
  due_date: string;
  status: PaymentStatus | "DUE" | "PAID";
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  paid_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRentPaymentOrderInput {
  stayId: string;
  billingMonth?: string;
  userId?: string;
}

export interface RentOrderCheckoutResponse extends RazorpayOrderCheckoutResponse {
  rentPaymentId: string;
  stayId: string;
  billingMonth: string;
  dueDate: string;
}

export interface WebhookProcessingResult {
  success: boolean;
  duplicate?: boolean;
  message: string;
  eventId?: string;
}

