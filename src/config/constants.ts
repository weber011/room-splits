export const USER_ROLES = {
  TENANT: "tenant",
  OWNER: "owner",
  ADMIN: "admin",
} as const;

export const PROPERTY_TYPES = {
  PG: "pg",
  HOSTEL: "hostel",
  COLIVING: "coliving",
  FLAT: "flat",
} as const;

export const SHARING_TYPES = {
  SINGLE: "single",
  DOUBLE: "double",
  TRIPLE: "triple",
  FOUR_PLUS: "four_plus",
} as const;

export const VISIT_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const BOOKING_STATUSES = {
  DRAFT: "draft",
  PENDING_PAYMENT: "pending_payment",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  ACTIVE: "active",
  EXPIRED: "expired",
} as const;

export const PAYMENT_STATUSES = {
  INITIATED: "initiated",
  SUCCESS: "success",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export const COMPLAINT_STATUSES = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  CLOSED: "closed",
} as const;

export const GENDER_PREFERENCES = {
  MALE: "boys",
  FEMALE: "girls",
  UNISEX: "unisex",
} as const;
