import {
  StayRecord,
  CheckoutRequest,
  StayReview,
} from "@/types/stay.types";
import { Booking } from "@/types/booking.types";

// Mock Active Stay Database Store
const MOCK_STAYS: StayRecord[] = [
  {
    id: "stay-8001",
    bookingId: "bk-8001",
    tenantId: "u-101",
    tenantName: "Aditya Kumar",
    tenantEmail: "aditya@example.com",
    tenantPhone: "+91 98765 43210",
    propertyId: "prop-1",
    propertyName: "UrbanNest Executive Co-Living & PG",
    propertyAddress: "Plot 42, 100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038",
    coverImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    roomNumber: "Room 204-B",
    sharingType: "Double Sharing AC",
    owner: {
      id: "owner-1",
      name: "Vikram Malhotra",
      phone: "+91 98112 23344",
      email: "vikram@urbannest.com",
    },
    moveInDate: "2026-10-03",
    monthlyRent: 16000,
    securityDeposit: 32000,
    nextRentDueDate: "2026-11-05",
    paymentStatus: "DUE",
    status: "ACTIVE",
    lockInEndDate: "2027-01-03",
    noticePeriodDays: 30,
    roommates: [
      {
        id: "rm-1",
        name: "Rohan Das",
        phone: "+91 97123 45678",
        occupation: "Software Engineer at Google",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        moveInDate: "2026-08-01",
      },
    ],
    rentHistory: [
      {
        id: "rent-101",
        month: "October 2026",
        amount: 16000,
        dueDate: "2026-10-05",
        paidDate: "2026-10-03T10:05:00Z",
        status: "PAID",
        razorpayPaymentId: "pay_BK8001_PAID",
        razorpayOrderId: "order_BK8001",
        receiptUrl: "/payments/tx-9002",
      },
      {
        id: "rent-102",
        month: "November 2026",
        amount: 16000,
        dueDate: "2026-11-05",
        status: "DUE",
      },
    ],
    documents: [
      {
        id: "doc-1",
        title: "Rental Agreement (11 Months Registered)",
        category: "AGREEMENT",
        fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        fileSize: "2.4 MB",
        uploadedAt: "2026-10-03",
        isPrivate: true,
        accessRoles: ["TENANT", "OWNER", "ADMIN"],
      },
      {
        id: "doc-2",
        title: "Security Deposit Receipt (₹32,000)",
        category: "DEPOSIT",
        fileUrl: "/payments/tx-9002",
        fileSize: "1.1 MB",
        uploadedAt: "2026-10-03",
        isPrivate: true,
        accessRoles: ["TENANT", "OWNER", "ADMIN"],
      },
      {
        id: "doc-3",
        title: "Initial Move-in Rent Receipt (₹16,000)",
        category: "RECEIPT",
        fileUrl: "/payments/tx-9002",
        fileSize: "980 KB",
        uploadedAt: "2026-10-03",
        isPrivate: true,
        accessRoles: ["TENANT", "OWNER", "ADMIN"],
      },
      {
        id: "doc-4",
        title: "Tenant Government KYC (Aadhaar Verified)",
        category: "KYC",
        fileUrl: "#",
        fileSize: "1.8 MB",
        uploadedAt: "2026-10-02",
        isPrivate: true,
        accessRoles: ["TENANT", "OWNER", "ADMIN"],
      },
    ],
    complaints: [
      {
        id: "cmp-201",
        ticketNumber: "TKT-2026-8801",
        title: "High 5GHz Wi-Fi latency in Room 204",
        category: "Wi-Fi & Internet",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        createdAt: "2026-10-04T14:30:00Z",
        updatedAt: "2026-10-05T09:00:00Z",
      },
    ],
    createdAt: "2026-10-03T10:00:00Z",
    updatedAt: "2026-10-05T10:00:00Z",
  },
];

export async function getTenantActiveStay(tenantId: string): Promise<StayRecord | null> {
  const stay = MOCK_STAYS.find((s) => s.tenantId === tenantId || tenantId === "guest" || tenantId === "u-101");
  return stay || MOCK_STAYS[0] || null;
}

export async function createStayFromConfirmedBooking(booking: Booking): Promise<StayRecord> {
  const existing = MOCK_STAYS.find((s) => s.bookingId === booking.id);
  if (existing) return existing;

  const newStay: StayRecord = {
    id: `stay-${Date.now()}`,
    bookingId: booking.id,
    tenantId: booking.user.id,
    tenantName: booking.user.fullName,
    tenantEmail: booking.user.email,
    tenantPhone: booking.user.phone,
    propertyId: booking.property.id,
    propertyName: booking.property.title,
    propertyAddress: `${booking.property.locality}, ${booking.property.city}`,
    coverImage: booking.property.coverImage || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    roomNumber: booking.room.roomNumber || "Room 101",
    sharingType: booking.room.sharingType,
    owner: {
      id: booking.owner.id,
      name: booking.owner.name,
      phone: booking.owner.phone,
      email: booking.owner.email,
    },
    moveInDate: booking.moveInDate,
    monthlyRent: booking.monthlyRent,
    securityDeposit: booking.securityDeposit,
    nextRentDueDate: "2026-11-05",
    paymentStatus: "PAID",
    status: "UPCOMING",
    lockInEndDate: "2027-01-15",
    noticePeriodDays: 30,
    roommates: [],
    rentHistory: [
      {
        id: `rent-${Date.now()}`,
        month: "Initial Move-in Rent",
        amount: booking.monthlyRent,
        dueDate: booking.bookingDate,
        paidDate: new Date().toISOString(),
        status: "PAID",
      },
    ],
    documents: [
      {
        id: `doc-${Date.now()}-1`,
        title: "Rental Agreement (Draft)",
        category: "AGREEMENT",
        fileUrl: "#",
        uploadedAt: new Date().toISOString().split("T")[0],
        isPrivate: true,
        accessRoles: ["TENANT", "OWNER", "ADMIN"],
      },
      {
        id: `doc-${Date.now()}-2`,
        title: `Security Deposit Receipt (₹${booking.securityDeposit.toLocaleString("en-IN")})`,
        category: "DEPOSIT",
        fileUrl: "#",
        uploadedAt: new Date().toISOString().split("T")[0],
        isPrivate: true,
        accessRoles: ["TENANT", "OWNER", "ADMIN"],
      },
    ],
    complaints: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  MOCK_STAYS.unshift(newStay);
  return newStay;
}

export async function requestStayCheckout(
  stayId: string,
  expectedDate: string,
  reason: string
): Promise<{ success: boolean; stay: StayRecord }> {
  const stay = MOCK_STAYS.find((s) => s.id === stayId);
  if (!stay) throw new Error("Stay record not found");

  const checkoutReq: CheckoutRequest = {
    id: `chk-${Date.now()}`,
    requestDate: new Date().toISOString().split("T")[0],
    expectedCheckoutDate: expectedDate,
    reason,
    status: "PENDING",
    securityDeposit: stay.securityDeposit,
    estimatedRefundAmount: stay.securityDeposit,
    refundStatus: "PENDING",
    inspectionNotes: "Pending move-out inspection by property owner.",
    ownerNotes: "Notice received. Inspection will be scheduled 2 days prior to move-out date.",
  };

  stay.status = "CHECKOUT_REQUESTED";
  stay.checkoutDetails = checkoutReq;
  stay.updatedAt = new Date().toISOString();

  return { success: true, stay };
}

export async function submitStayReview(
  stayId: string,
  reviewData: {
    rating: number;
    cleanlinessRating: number;
    maintenanceRating: number;
    ownerRating: number;
    comment: string;
  }
): Promise<StayReview> {
  const stay = MOCK_STAYS.find((s) => s.id === stayId);
  if (!stay) throw new Error("Stay record not found");

  const review: StayReview = {
    ...reviewData,
    createdAt: new Date().toISOString(),
  };

  stay.review = review;
  stay.updatedAt = new Date().toISOString();
  return review;
}

export async function recordRentPaymentSuccess(
  stayId: string,
  monthId: string,
  paymentDetails: {
    razorpayPaymentId: string;
    razorpayOrderId: string;
    paidAt: string;
  }
): Promise<StayRecord> {
  const stay = MOCK_STAYS.find((s) => s.id === stayId);
  if (!stay) throw new Error("Stay record not found");

  const rentItem = stay.rentHistory.find((r) => r.id === monthId || r.status === "DUE");
  if (rentItem) {
    rentItem.status = "PAID";
    rentItem.paidDate = paymentDetails.paidAt;
    rentItem.razorpayPaymentId = paymentDetails.razorpayPaymentId;
    rentItem.razorpayOrderId = paymentDetails.razorpayOrderId;
    rentItem.receiptUrl = `/payments/${paymentDetails.razorpayOrderId}`;
  }

  stay.paymentStatus = "PAID";
  stay.updatedAt = new Date().toISOString();

  return stay;
}
