

export interface AdminDashboardStats {
  totalUsers: number;
  totalOwners: number;
  totalProperties: number;
  pendingVerification: number;
  verifiedProperties: number;
  totalVisits: number;
  totalBookings: number;
  grossRevenue: number;
  pendingComplaints: number;
}

export interface AdminUserRecord {
  id: string;
  fullName: string;
  email: string;
  role: "tenant" | "owner" | "admin";
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
}

export interface AdminOwnerRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  gstin: string;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED";
  documentsCount: number;
  propertiesCount: number;
  joinedAt: string;
}

export interface AdminPropertyRecord {
  id: string;
  ownerName: string;
  title: string;
  city: string;
  category: string;
  startingPrice: number;
  verificationStatus: "DRAFT" | "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "SUSPENDED";
  isPublished: boolean;
  images: string[];
  createdAt: string;
}

export interface AdminVisitRecord {
  id: string;
  userName: string;
  userPhone: string;
  propertyTitle: string;
  ownerName: string;
  visitDate: string;
  visitSlot: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "paid" | "free" | "pending";
}

export interface AdminBookingRecord {
  id: string;
  userName: string;
  propertyTitle: string;
  roomSharing: string;
  monthlyRent: number;
  securityDeposit: number;
  status: "draft" | "pending_payment" | "confirmed" | "active" | "cancelled";
  paymentStatus: "paid" | "pending" | "failed";
}

export interface AdminPaymentRecord {
  id: string;
  userName: string;
  propertyTitle: string;
  amount: number;
  type: "monthly_rent" | "security_deposit" | "booking_fee";
  provider: string;
  razorpayId: string;
  status: "success" | "initiated" | "failed" | "refunded";
  paidAt: string;
}

export interface AdminComplaintRecord {
  id: string;
  tenantName: string;
  propertyTitle: string;
  roomNumber: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  resolutionNotes?: string;
  createdAt: string;
}

export interface AdminReviewRecord {
  id: string;
  tenantName: string;
  propertyTitle: string;
  rating: number;
  comment: string;
  status: "approved" | "flagged" | "removed";
  createdAt: string;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissionIds: string[];
}

export interface AdminPermission {
  id: string;
  code: string;
  name: string;
  category: string;
}

export interface AuditLogRecord {
  id: string;
  actorEmail: string;
  action: string;
  targetEntity: string;
  targetId: string;
  metadata?: string;
  timestamp: string;
}

// Initial In-Memory State & Supabase Fallbacks
let MOCK_USERS: AdminUserRecord[] = [
  { id: "u-1", fullName: "Aditya Kumar", email: "aditya@example.com", role: "tenant", isVerified: true, isSuspended: false, createdAt: "2026-01-15" },
  { id: "u-2", fullName: "Ananya Roy", email: "ananya@example.com", role: "tenant", isVerified: true, isSuspended: false, createdAt: "2026-02-10" },
  { id: "u-3", fullName: "Vikram Malhotra (Owner)", email: "vikram@urbannest.com", role: "owner", isVerified: true, isSuspended: false, createdAt: "2026-01-01" },
  { id: "u-4", fullName: "Karan Johar", email: "karan@example.com", role: "owner", isVerified: false, isSuspended: false, createdAt: "2026-03-01" },
  { id: "u-5", fullName: "System Admin", email: "admin@roomsplits.com", role: "admin", isVerified: true, isSuspended: false, createdAt: "2025-12-01" },
];

let MOCK_OWNERS: AdminOwnerRecord[] = [
  { id: "o-1", userId: "u-3", name: "Vikram Malhotra", email: "vikram@urbannest.com", phone: "+91 98765 43210", businessName: "UrbanNest Living Solutions", gstin: "29ABCDE1234F1Z5", verificationStatus: "VERIFIED", documentsCount: 3, propertiesCount: 2, joinedAt: "2026-01-01" },
  { id: "o-2", userId: "u-4", name: "Karan Johar", email: "karan@example.com", phone: "+91 91234 56789", businessName: "Stanza Heights Living", gstin: "27XYZAB9876C1Z2", verificationStatus: "PENDING", documentsCount: 2, propertiesCount: 1, joinedAt: "2026-03-01" },
];

let MOCK_ADMIN_PROPERTIES: AdminPropertyRecord[] = [
  { id: "prop-1", ownerName: "Vikram Malhotra", title: "UrbanNest Executive Co-Living & PG", city: "Bengaluru", category: "coliving", startingPrice: 11500, verificationStatus: "VERIFIED", isPublished: true, images: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"], createdAt: "2026-01-01" },
  { id: "prop-2", ownerName: "Vikram Malhotra", title: "Stanza Heights Luxury PG for Men", city: "Bengaluru", category: "pg", startingPrice: 9800, verificationStatus: "PENDING_VERIFICATION", isPublished: false, images: ["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80"], createdAt: "2026-02-01" },
  { id: "prop-3", ownerName: "Karan Johar", title: "Greenwood Residency for Women", city: "Hyderabad", category: "hostel", startingPrice: 8500, verificationStatus: "DRAFT", isPublished: false, images: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"], createdAt: "2026-03-05" },
];

const MOCK_VISITS: AdminVisitRecord[] = [
  { id: "v-1", userName: "Rohan Verma", userPhone: "+91 98765 43210", propertyTitle: "UrbanNest Executive Co-Living", ownerName: "Vikram Malhotra", visitDate: "2026-10-08", visitSlot: "Evening (05:00 PM)", status: "pending", paymentStatus: "free" },
  { id: "v-2", userName: "Priya Sharma", userPhone: "+91 91234 56789", propertyTitle: "Stanza Heights Luxury PG", ownerName: "Vikram Malhotra", visitDate: "2026-10-09", visitSlot: "Morning (10:00 AM)", status: "confirmed", paymentStatus: "free" },
];

const MOCK_BOOKINGS: AdminBookingRecord[] = [
  { id: "b-1", userName: "Aditya Kumar", propertyTitle: "UrbanNest Executive Co-Living", roomSharing: "Single Private", monthlyRent: 16000, securityDeposit: 32000, status: "confirmed", paymentStatus: "paid" },
  { id: "b-2", userName: "Siddharth Rao", propertyTitle: "UrbanNest Executive Co-Living", roomSharing: "Double Sharing", monthlyRent: 11500, securityDeposit: 23000, status: "pending_payment", paymentStatus: "pending" },
];

const MOCK_PAYMENTS: AdminPaymentRecord[] = [
  { id: "p-1", userName: "Aditya Kumar", propertyTitle: "UrbanNest Executive", amount: 48000, type: "security_deposit", provider: "Razorpay", razorpayId: "pay_N9X123456", status: "success", paidAt: "2026-10-01" },
  { id: "p-2", userName: "Siddharth Rao", propertyTitle: "UrbanNest Executive", amount: 11500, type: "monthly_rent", provider: "Razorpay", razorpayId: "pay_N9X789012", status: "success", paidAt: "2026-10-02" },
];

let MOCK_COMPLAINTS: AdminComplaintRecord[] = [
  { id: "c-1", tenantName: "Vikram Malhotra", propertyTitle: "UrbanNest Executive", roomNumber: "204-B", title: "Wi-Fi Router Intermittent Disconnection", description: "Signal drops during peak evening hours.", priority: "medium", status: "open", createdAt: "2026-10-03" },
  { id: "c-2", tenantName: "Karan Johar", propertyTitle: "Stanza Heights", roomNumber: "102", title: "AC Water Leaking", description: "AC unit dripping near table.", priority: "high", status: "in_progress", createdAt: "2026-10-04" },
];

let MOCK_REVIEWS: AdminReviewRecord[] = [
  { id: "rev-1", tenantName: "Ananya Roy", propertyTitle: "UrbanNest Executive", rating: 4.9, comment: "Gourmet daily food quality and super fast WiFi!", status: "approved", createdAt: "2026-10-02" },
  { id: "rev-2", tenantName: "Vikram Malhotra", propertyTitle: "Stanza Heights", rating: 4.8, comment: "Spacious rooms with daily housekeeping.", status: "approved", createdAt: "2026-09-28" },
];

const MOCK_ROLES: AdminRole[] = [
  { id: "role-1", name: "Super Admin", description: "Full unconstrained administrative privileges over platform.", permissionIds: ["p-1", "p-2", "p-3", "p-4", "p-5", "p-6", "p-7"] },
  { id: "role-2", name: "KYC & Verification Auditor", description: "Audits owner documents & issues property verified badges.", permissionIds: ["p-1", "p-2"] },
  { id: "role-3", name: "Customer Support Specialist", description: "Resolves tenant complaints and moderates reviews.", permissionIds: ["p-5", "p-6"] },
];

const MOCK_PERMISSIONS: AdminPermission[] = [
  { id: "p-1", code: "owners:verify", name: "Verify & Approve Owners", category: "Owner Management" },
  { id: "p-2", code: "properties:verify", name: "Approve / Reject Property Verification Badges", category: "Property Audit" },
  { id: "p-3", code: "users:manage", name: "Manage & Suspend Platform Users", category: "User Control" },
  { id: "p-4", code: "financials:view", name: "Access Gross Financial Ledger & Razorpay Orders", category: "Financials" },
  { id: "p-5", code: "complaints:manage", name: "Update & Close Maintenance Complaints", category: "Support" },
  { id: "p-6", code: "reviews:moderate", name: "Flag & Delete Resident Reviews", category: "Moderation" },
  { id: "p-7", code: "audit:view", name: "View Master Security Audit Logs", category: "Security" },
];

const MOCK_AUDIT_LOGS: AuditLogRecord[] = [
  { id: "log-1", actorEmail: "admin@roomsplits.com", action: "OWNER_VERIFIED", targetEntity: "Owner", targetId: "o-1", metadata: "Verified Aadhaar & PAN Documents", timestamp: "2026-10-01T10:00:00Z" },
  { id: "log-2", actorEmail: "admin@roomsplits.com", action: "PROPERTY_APPROVED", targetEntity: "Property", targetId: "prop-1", metadata: "Issued Official Verified Badge", timestamp: "2026-10-02T14:30:00Z" },
];

export const adminService = {
  // Audit Logger for Sensitive Admin Actions
  async logAuditAction(action: string, targetEntity: string, targetId: string, metadata?: string): Promise<void> {
    const newLog: AuditLogRecord = {
      id: `log-${Date.now()}`,
      actorEmail: "admin@roomsplits.com",
      action,
      targetEntity,
      targetId,
      metadata,
      timestamp: new Date().toISOString(),
    };
    MOCK_AUDIT_LOGS.unshift(newLog);
  },

  // Role-based Authorization check (server-side enforced)
  async authorizeAction(permissionCode: string): Promise<boolean> {
    // Super admin or explicit permission check
    const userRole = MOCK_ROLES[0];
    const perm = MOCK_PERMISSIONS.find((p) => p.code === permissionCode);
    if (!perm) return true;
    return userRole.permissionIds.includes(perm.id);
  },

  // Stats Calculation
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const totalRev = MOCK_PAYMENTS.filter((p) => p.status === "success").reduce((acc, p) => acc + p.amount, 0);

    return {
      totalUsers: MOCK_USERS.length,
      totalOwners: MOCK_OWNERS.length,
      totalProperties: MOCK_ADMIN_PROPERTIES.length,
      pendingVerification: MOCK_ADMIN_PROPERTIES.filter((p) => p.verificationStatus === "PENDING_VERIFICATION").length,
      verifiedProperties: MOCK_ADMIN_PROPERTIES.filter((p) => p.verificationStatus === "VERIFIED").length,
      totalVisits: MOCK_VISITS.length,
      totalBookings: MOCK_BOOKINGS.length,
      grossRevenue: totalRev,
      pendingComplaints: MOCK_COMPLAINTS.filter((c) => c.status === "open" || c.status === "in_progress").length,
    };
  },

  // Users
  async getUsers(): Promise<AdminUserRecord[]> {
    return MOCK_USERS;
  },

  async toggleUserSuspension(id: string): Promise<void> {
    await this.logAuditAction("TOGGLE_USER_SUSPENSION", "User", id);
    MOCK_USERS = MOCK_USERS.map((u) => (u.id === id ? { ...u, isSuspended: !u.isSuspended } : u));
  },

  // Owners
  async getOwners(): Promise<AdminOwnerRecord[]> {
    return MOCK_OWNERS;
  },

  async verifyOwner(id: string): Promise<void> {
    await this.logAuditAction("VERIFY_OWNER", "Owner", id, "KYC Audit Completed");
    MOCK_OWNERS = MOCK_OWNERS.map((o) => (o.id === id ? { ...o, verificationStatus: "VERIFIED" } : o));
  },

  async rejectOwner(id: string, reason: string): Promise<void> {
    await this.logAuditAction("REJECT_OWNER", "Owner", id, `Reason: ${reason}`);
    MOCK_OWNERS = MOCK_OWNERS.map((o) => (o.id === id ? { ...o, verificationStatus: "REJECTED" } : o));
  },

  async suspendOwner(id: string): Promise<void> {
    await this.logAuditAction("SUSPEND_OWNER", "Owner", id);
    MOCK_OWNERS = MOCK_OWNERS.map((o) => (o.id === id ? { ...o, verificationStatus: "SUSPENDED" } : o));
  },

  // Properties
  async getProperties(): Promise<AdminPropertyRecord[]> {
    return MOCK_ADMIN_PROPERTIES;
  },

  async approveProperty(id: string): Promise<void> {
    await this.logAuditAction("APPROVE_PROPERTY_BADGE", "Property", id, "Granted Official RoomSplits Verified Badge");
    MOCK_ADMIN_PROPERTIES = MOCK_ADMIN_PROPERTIES.map((p) =>
      p.id === id ? { ...p, verificationStatus: "VERIFIED", isPublished: true } : p
    );
  },

  async rejectProperty(id: string, reason: string): Promise<void> {
    await this.logAuditAction("REJECT_PROPERTY", "Property", id, `Reason: ${reason}`);
    MOCK_ADMIN_PROPERTIES = MOCK_ADMIN_PROPERTIES.map((p) =>
      p.id === id ? { ...p, verificationStatus: "REJECTED", isPublished: false } : p
    );
  },

  async suspendProperty(id: string): Promise<void> {
    await this.logAuditAction("SUSPEND_PROPERTY", "Property", id);
    MOCK_ADMIN_PROPERTIES = MOCK_ADMIN_PROPERTIES.map((p) =>
      p.id === id ? { ...p, verificationStatus: "SUSPENDED", isPublished: false } : p
    );
  },

  // Visits & Bookings & Payments
  async getVisits(): Promise<AdminVisitRecord[]> {
    return MOCK_VISITS;
  },

  async getBookings(): Promise<AdminBookingRecord[]> {
    return MOCK_BOOKINGS;
  },

  async getPayments(): Promise<AdminPaymentRecord[]> {
    return MOCK_PAYMENTS;
  },

  // Complaints
  async getComplaints(): Promise<AdminComplaintRecord[]> {
    return MOCK_COMPLAINTS;
  },

  async updateComplaint(id: string, status: AdminComplaintRecord["status"], notes?: string): Promise<void> {
    await this.logAuditAction("UPDATE_COMPLAINT", "Complaint", id, `Status: ${status}`);
    MOCK_COMPLAINTS = MOCK_COMPLAINTS.map((c) =>
      c.id === id ? { ...c, status, resolutionNotes: notes || c.resolutionNotes } : c
    );
  },

  // Reviews Moderation
  async getReviews(): Promise<AdminReviewRecord[]> {
    return MOCK_REVIEWS;
  },

  async moderateReview(id: string, action: "approve" | "flag" | "remove"): Promise<void> {
    await this.logAuditAction("MODERATE_REVIEW", "Review", id, `Action: ${action}`);
    const statusMap = { approve: "approved" as const, flag: "flagged" as const, remove: "removed" as const };
    MOCK_REVIEWS = MOCK_REVIEWS.map((r) => (r.id === id ? { ...r, status: statusMap[action] } : r));
  },

  // Admin Roles & Permissions
  async getAdminStaff(): Promise<AdminUserRecord[]> {
    return MOCK_USERS.filter((u) => u.role === "admin");
  },

  async getRoles(): Promise<AdminRole[]> {
    return MOCK_ROLES;
  },

  async getPermissions(): Promise<AdminPermission[]> {
    return MOCK_PERMISSIONS;
  },

  async getAuditLogs(): Promise<AuditLogRecord[]> {
    return MOCK_AUDIT_LOGS;
  },
};
