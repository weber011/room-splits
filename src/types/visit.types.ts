export type VisitPassStatus =
  | "REQUESTED"
  | "PAYMENT_PENDING"
  | "CONFIRMED"
  | "RESCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED";

export type VisitPaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type OwnerConfirmationStatus = "PENDING" | "ACCEPTED" | "PROPOSED_NEW_TIME" | "REJECTED";

export interface VisitUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface VisitPropertyInfo {
  id: string;
  title: string;
  locality: string;
  city: string;
  coverImage: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface VisitOwnerInfo {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface VisitPass {
  id: string;
  passCode: string;
  user: VisitUser;
  property: VisitPropertyInfo;
  owner: VisitOwnerInfo;
  preferredDate: string;
  preferredTime: string;
  status: VisitPassStatus;
  visitPassAmount: number;
  paymentStatus: VisitPaymentStatus;
  paymentId?: string;
  razorpayOrderId?: string;
  ownerConfirmation: OwnerConfirmationStatus;
  ownerProposedDate?: string;
  ownerProposedTime?: string;
  visitNotes?: string;
  exactLocationVisibility: boolean;
  contactVisibility: boolean;
  createdAt: string;
  updatedAt: string;
}

// Security rule helper for computed visibility
export function computeVisitPassVisibility(status: VisitPassStatus, paymentStatus: VisitPaymentStatus): {
  exactLocationVisibility: boolean;
  contactVisibility: boolean;
} {
  const isPaid = paymentStatus === "PAID";
  const isValidStatus = status === "CONFIRMED" || status === "RESCHEDULED" || status === "COMPLETED";

  const isVisible = isPaid && isValidStatus;

  return {
    exactLocationVisibility: isVisible,
    contactVisibility: isVisible,
  };
}
