export type CheckoutStatus =
  | "REQUESTED"
  | "OWNER_REVIEW"
  | "INSPECTION"
  | "SETTLEMENT_PENDING"
  | "SETTLED"
  | "REJECTED"
  | "CLOSED";

export type DeductionCategory =
  | "PENDING_RENT"
  | "DAMAGE_REPAIR"
  | "DEEP_CLEANING"
  | "KEY_REPLACEMENT"
  | "NOTICE_DEFICIT"
  | "UTILITY_DUES"
  | "OTHER";

export interface DepositDeductionItem {
  id: string;
  category: DeductionCategory;
  description: string;
  amount: number;
  evidenceUrl?: string;
}

export interface CheckoutDispute {
  id: string;
  raisedBy: "STUDENT";
  userReason: string;
  adminNotes?: string;
  status: "OPEN" | "RESOLVED";
  createdAt: string;
  resolvedAt?: string;
}

export interface DepositSettlement {
  id: string;
  checkoutRequestId: string;
  stayId: string;
  originalSecurityDeposit: number;
  deductions: DepositDeductionItem[];
  deductionReasons: string;
  refundableAmount: number; // Math.max(0, originalSecurityDeposit - sum(deductions))
  settlementDate: string;
  ownerNotes: string;
  userAcknowledgement: boolean;
  userAcknowledgedAt?: string;
  dispute?: CheckoutDispute;
  paymentRefundReference?: string;
}

export interface CheckoutRecord {
  id: string;
  stayId: string;
  tenant: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  property: {
    id: string;
    title: string;
    locality: string;
  };
  room: {
    roomNumber: string;
    sharingType: string;
  };
  requestedCheckoutDate: string;
  reason: string;
  notes?: string;
  status: CheckoutStatus;
  settlement?: DepositSettlement;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCheckoutInput {
  stayId: string;
  requestedCheckoutDate: string;
  reason: string;
  notes?: string;
}

export interface SubmitSettlementInput {
  checkoutId: string;
  deductions: Omit<DepositDeductionItem, "id">[];
  ownerNotes: string;
}
