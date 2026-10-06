export type StayStatus =
  | "UPCOMING"
  | "ACTIVE"
  | "CHECKOUT_REQUESTED"
  | "CHECKED_OUT"
  | "CLOSED";

export type RentPaymentStatus = "PAID" | "DUE" | "OVERDUE";

export type StayDocumentCategory =
  | "AGREEMENT"
  | "RECEIPT"
  | "DEPOSIT"
  | "KYC"
  | "OTHER";

export interface StayDocument {
  id: string;
  title: string;
  category: StayDocumentCategory;
  fileUrl: string;
  fileSize?: string;
  uploadedAt: string;
  isPrivate: boolean;
  accessRoles: ("TENANT" | "OWNER" | "ADMIN")[];
}

export interface RentHistoryItem {
  id: string;
  month: string; // e.g. "October 2026"
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: RentPaymentStatus;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  receiptUrl?: string;
}

export interface RoommateProfile {
  id: string;
  name: string;
  phone: string;
  occupation?: string;
  avatarUrl?: string;
  moveInDate: string;
}

export interface CheckoutRequest {
  id: string;
  requestDate: string;
  expectedCheckoutDate: string;
  reason?: string;
  status: "PENDING" | "APPROVED" | "COMPLETED" | "CANCELLED";
  securityDeposit: number;
  estimatedRefundAmount: number;
  deductions?: number;
  deductionReason?: string;
  refundStatus: "PENDING" | "PROCESSED" | "ON_HOLD";
  inspectionNotes?: string;
  ownerNotes?: string;
}

export interface StayComplaint {
  id: string;
  ticketNumber: string;
  title: string;
  category: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
  updatedAt: string;
}

export interface StayReview {
  id?: string;
  rating: number;
  cleanlinessRating: number;
  maintenanceRating: number;
  ownerRating: number;
  comment: string;
  createdAt: string;
}

export interface StayRecord {
  id: string;
  bookingId: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  coverImage: string;
  roomNumber: string;
  sharingType: string;
  owner: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  moveInDate: string;
  monthlyRent: number;
  securityDeposit: number;
  nextRentDueDate: string;
  paymentStatus: RentPaymentStatus;
  status: StayStatus;
  lockInEndDate: string;
  noticePeriodDays: number;
  roommates: RoommateProfile[];
  rentHistory: RentHistoryItem[];
  documents: StayDocument[];
  complaints: StayComplaint[];
  review?: StayReview;
  checkoutDetails?: CheckoutRequest;
  createdAt: string;
  updatedAt: string;
}
