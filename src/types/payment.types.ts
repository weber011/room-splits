export type RazorpayPaymentType =
  | "VISIT_PASS"
  | "BOOKING_RENT"
  | "SECURITY_DEPOSIT"
  | "MONTHLY_RENT";

export type RazorpayPaymentStatus =
  | "CREATED"
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

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
}

export interface RazorpayTransaction {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  signature?: string;
  amount: number;
  currency: string;
  paymentType: RazorpayPaymentType;
  user: PaymentUser;
  reference: PaymentReference;
  status: RazorpayPaymentStatus;
  receiptUrl?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PaymentTransaction = RazorpayTransaction;

export interface CreateRazorpayOrderInput {
  paymentType: RazorpayPaymentType;
  userId: string;
  referenceId: string; // visitId or bookingId
}

export interface VerifyRazorpayPaymentInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
