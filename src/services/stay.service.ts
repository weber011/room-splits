import { createClient } from "@/lib/supabase/client";
import {
  StayRecord,
  CheckoutRequest,
  StayReview,
  StayStatus,
} from "@/types/stay.types";
import { Booking } from "@/types/booking.types";
import { bookingService } from "./booking.service";

// Mock Active Stay Database Store (Fallback & Local Execution)
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

export interface ConfirmMoveInParams {
  bookingId: string;
  userId?: string;
  userRole?: string;
  moveInDate?: string;
}

export interface MoveInResult {
  success: boolean;
  statusCode: number;
  message: string;
  stay?: StayRecord;
}

export async function getTenantActiveStay(tenantId: string): Promise<StayRecord | null> {
  if (!tenantId) return null;

  try {
    const supabase = createClient();
    const { data: dbStay, error } = await supabase
      .from("stays")
      .select(`
        *,
        properties (id, title, locality, city, cover_image, address_line, owner_id),
        rooms (id, room_number, sharing_type),
        users (id, full_name, email, phone)
      `)
      .eq("tenant_id", tenantId)
      .in("status", ["active", "ACTIVE"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && dbStay) {
      return mapDbRowToStayRecord(dbStay);
    }
  } catch {
    // Database query error or timeout -> proceed to mock fallback
  }

  // Fallback to mock store
  const mockMatch = MOCK_STAYS.find(
    (s) => (s.tenantId === tenantId || tenantId === "guest" || tenantId === "u-101") && (s.status === "ACTIVE" || s.status === "active" as StayStatus)
  );

  return mockMatch || null;
}

export async function getStayByBookingId(bookingId: string): Promise<StayRecord | null> {
  if (!bookingId) return null;

  try {
    const supabase = createClient();
    const { data: dbStay, error } = await supabase
      .from("stays")
      .select(`
        *,
        properties (id, title, locality, city, cover_image, address_line, owner_id),
        rooms (id, room_number, sharing_type),
        users (id, full_name, email, phone)
      `)
      .eq("booking_id", bookingId)
      .maybeSingle();

    if (!error && dbStay) {
      return mapDbRowToStayRecord(dbStay);
    }
  } catch {
    // Fallback
  }

  const mock = MOCK_STAYS.find((s) => s.bookingId === bookingId);
  return mock || null;
}

export async function getOwnerStays(ownerUserId: string): Promise<StayRecord[]> {
  if (!ownerUserId) return [];

  try {
    const supabase = createClient();
    const { data: dbStays, error } = await supabase
      .from("stays")
      .select(`
        *,
        properties!inner (id, title, locality, city, cover_image, address_line, owner_id),
        rooms (id, room_number, sharing_type),
        users (id, full_name, email, phone)
      `);

    if (!error && dbStays && dbStays.length > 0) {
      return dbStays.map(mapDbRowToStayRecord);
    }
  } catch {
    // Fallback
  }

  return MOCK_STAYS.filter((s) => s.owner.id === ownerUserId || ownerUserId === "owner-1" || ownerUserId === "u-owner-101");
}

export async function confirmMoveIn(params: ConfirmMoveInParams): Promise<MoveInResult> {
  const { bookingId, userId, userRole, moveInDate } = params;

  if (!bookingId) {
    return {
      success: false,
      statusCode: 400,
      message: "Booking ID is required to confirm move-in.",
    };
  }

  // 1. Fetch booking record
  const booking = await bookingService.getBookingById(bookingId);
  if (!booking) {
    return {
      success: false,
      statusCode: 404,
      message: `Booking record ${bookingId} not found.`,
    };
  }

  // 2. Authorization Verification
  if (userId) {
    const isTenant = booking.user.id === userId;
    const isOwner = booking.owner.id === userId || (booking.property as unknown as { ownerId?: string })?.ownerId === userId;
    const isAdmin = userRole === "admin";

    if (!isTenant && !isOwner && !isAdmin) {
      return {
        success: false,
        statusCode: 403,
        message: "Unauthorized: You do not have permission to confirm move-in for this booking.",
      };
    }
  }

  // 3. Payment Status Check
  if (booking.paymentStatus !== "PAID") {
    return {
      success: false,
      statusCode: 400,
      message: "Booking payment (monthly rent + security deposit) must be completed before move-in.",
    };
  }

  // 4. Booking Status Check
  if (booking.bookingStatus === "CANCELLED" || booking.bookingStatus === "EXPIRED") {
    return {
      success: false,
      statusCode: 400,
      message: `Cannot confirm move-in for a ${booking.bookingStatus.toLowerCase()} booking.`,
    };
  }

  // 5. Existing Stay Check (Race condition & Double-Stay Protection)
  const existingStay = await getStayByBookingId(bookingId);
  if (existingStay && (existingStay.status === "ACTIVE" || (existingStay.status as string) === "active")) {
    return {
      success: false,
      statusCode: 409,
      stay: existingStay,
      message: "Stay has already been activated for this booking.",
    };
  }

  // 6. Target Move-In Date Resolution
  const targetMoveInDate = moveInDate || booking.moveInDate || new Date().toISOString().split("T")[0];

  // 7. Calculate lock-in end date (3 months default lock-in)
  const lockInDateObj = new Date(`${targetMoveInDate}T00:00:00+05:30`);
  if (!isNaN(lockInDateObj.getTime())) {
    lockInDateObj.setMonth(lockInDateObj.getMonth() + 3);
  }
  const lockInEndDate = !isNaN(lockInDateObj.getTime())
    ? lockInDateObj.toISOString().split("T")[0]
    : "2027-01-15";

  // 8. Create Stay Record
  const newStay: StayRecord = {
    id: `stay-${Date.now()}`,
    bookingId: booking.id,
    tenantId: booking.user.id,
    tenantName: booking.user.fullName,
    tenantEmail: booking.user.email,
    tenantPhone: booking.user.phone,
    propertyId: booking.property.id,
    propertyName: booking.property.title,
    propertyAddress: booking.property.address || `${booking.property.locality}, ${booking.property.city}`,
    coverImage: booking.property.coverImage || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    roomNumber: booking.room.roomNumber || "Room 101",
    sharingType: booking.room.sharingType,
    owner: {
      id: booking.owner.id,
      name: booking.owner.name,
      phone: booking.owner.phone,
      email: booking.owner.email,
    },
    moveInDate: targetMoveInDate,
    monthlyRent: booking.monthlyRent,
    securityDeposit: booking.securityDeposit,
    nextRentDueDate: getNextMonthRentDueDate(targetMoveInDate),
    paymentStatus: "PAID",
    status: "ACTIVE",
    lockInEndDate,
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
        razorpayPaymentId: booking.razorpayPaymentId,
        razorpayOrderId: booking.razorpayOrderId,
      },
    ],
    documents: [
      {
        id: `doc-${Date.now()}-1`,
        title: "Rental Agreement (Official)",
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
        fileUrl: booking.razorpayPaymentId ? `/payments/${booking.razorpayPaymentId}` : "#",
        uploadedAt: new Date().toISOString().split("T")[0],
        isPrivate: true,
        accessRoles: ["TENANT", "OWNER", "ADMIN"],
      },
    ],
    complaints: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 9. Persist to Supabase Database (if available)
  try {
    const supabase = createClient();
    const { data: insertedStay, error } = await supabase
      .from("stays")
      .insert({
        booking_id: booking.id,
        property_id: booking.property.id,
        room_id: booking.room.id,
        tenant_id: booking.user.id,
        start_date: targetMoveInDate,
        move_in_date: targetMoveInDate,
        lock_in_end_date: lockInEndDate,
        monthly_rent: booking.monthlyRent,
        security_deposit: booking.securityDeposit,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") { // Unique constraint violation on booking_id
        return {
          success: false,
          statusCode: 409,
          stay: existingStay || newStay,
          message: "Move-in already completed for this booking (Database Unique Constraint).",
        };
      }
    } else if (insertedStay) {
      newStay.id = insertedStay.id;
    }

    // 10. Update booking status to completed
    await supabase.from("bookings").update({ status: "completed", updated_at: new Date().toISOString() }).eq("id", booking.id);
  } catch {
    // Database fallback
  }

  // 11. Update booking service state & MOCK_STAYS
  await bookingService.completeBooking(booking.id);
  MOCK_STAYS.unshift(newStay);

  return {
    success: true,
    statusCode: 200,
    stay: newStay,
    message: "Move-in confirmed successfully! Your stay is now ACTIVE.",
  };
}

export async function createStayFromConfirmedBooking(booking: Booking): Promise<StayRecord> {
  const existing = await getStayByBookingId(booking.id);
  if (existing) return existing;

  const result = await confirmMoveIn({ bookingId: booking.id });
  if (result.stay) return result.stay;

  return MOCK_STAYS[0];
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

export async function getStayById(stayId: string, callerUserId?: string): Promise<StayRecord | null> {
  void callerUserId;
  if (!stayId) return null;

  try {
    const supabase = createClient();
    const { data: dbStay, error } = await supabase
      .from("stays")
      .select(`
        *,
        properties (id, title, locality, city, cover_image, address_line, owner_id),
        rooms (id, room_number, sharing_type),
        users (id, full_name, email, phone)
      `)
      .eq("id", stayId)
      .maybeSingle();

    if (!error && dbStay) {
      return mapDbRowToStayRecord(dbStay);
    }
  } catch {
    // Fallback
  }

  const mock = MOCK_STAYS.find((s) => s.id === stayId);
  return mock || null;
}

export const stayService = {
  getTenantActiveStay,
  getStayByBookingId,
  getStayById,
  getOwnerStays,
  confirmMoveIn,
  createStayFromConfirmedBooking,
  requestStayCheckout,
  submitStayReview,
  recordRentPaymentSuccess,
};

function getNextMonthRentDueDate(moveInDateStr: string): string {
  try {
    const d = new Date(`${moveInDateStr}T00:00:00+05:30`);
    if (isNaN(d.getTime())) return "2026-11-05";
    d.setMonth(d.getMonth() + 1);
    d.setDate(5);
    return d.toISOString().split("T")[0];
  } catch {
    return "2026-11-05";
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbRowToStayRecord(row: any): StayRecord {
  const statusStr = (row.status?.toUpperCase() || "ACTIVE") as StayStatus;

  return {
    id: row.id,
    bookingId: row.booking_id,
    tenantId: row.tenant_id,
    tenantName: row.users?.full_name || "Tenant Resident",
    tenantEmail: row.users?.email || "tenant@example.com",
    tenantPhone: row.users?.phone || "+91 98765 43210",
    propertyId: row.property_id,
    propertyName: row.properties?.title || "UrbanNest Executive PG",
    propertyAddress: row.properties?.address_line || `${row.properties?.locality || "Indiranagar"}, ${row.properties?.city || "Bengaluru"}`,
    coverImage: row.properties?.cover_image || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    roomNumber: row.rooms?.room_number || "Room 101",
    sharingType: row.rooms?.sharing_type || "Single Sharing AC",
    owner: {
      id: row.properties?.owner_id || "owner-1",
      name: "Property Owner",
      phone: "+91 98000 00000",
      email: "owner@roomsplits.com",
    },
    moveInDate: row.move_in_date || row.start_date || "2026-10-03",
    monthlyRent: Number(row.monthly_rent) || 16000,
    securityDeposit: Number(row.security_deposit) || 32000,
    nextRentDueDate: getNextMonthRentDueDate(row.move_in_date || row.start_date || "2026-10-03"),
    paymentStatus: "PAID",
    status: statusStr,
    lockInEndDate: row.lock_in_end_date || "2027-01-15",
    noticePeriodDays: 30,
    roommates: [],
    rentHistory: [
      {
        id: `rent-${row.id}`,
        month: "Initial Move-in Rent",
        amount: Number(row.monthly_rent) || 16000,
        dueDate: row.start_date || "2026-10-01",
        paidDate: row.created_at || new Date().toISOString(),
        status: "PAID",
      },
    ],
    documents: [
      {
        id: `doc-${row.id}-1`,
        title: "Rental Agreement (Official)",
        category: "AGREEMENT",
        fileUrl: "#",
        uploadedAt: row.created_at?.split("T")[0] || "2026-10-03",
        isPrivate: true,
        accessRoles: ["TENANT", "OWNER", "ADMIN"],
      },
    ],
    complaints: [],
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}
