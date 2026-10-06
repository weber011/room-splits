export type NotificationType =
  | "VISIT_CONFIRMED"
  | "VISIT_RESCHEDULED"
  | "BOOKING_CONFIRMED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "RENT_DUE"
  | "COMPLAINT_UPDATED"
  | "REVIEW_REQUEST"
  | "CHECKOUT_UPDATED"
  | "DEPOSIT_SETTLEMENT"
  | "SYSTEM";

export type NotificationChannel = "IN_APP" | "EMAIL" | "SMS" | "WHATSAPP";

export interface AppNotification {
  id: string;
  recipient: string; // User ID or Role (e.g. "u-101", "owner-1", "admin")
  type: NotificationType;
  title: string;
  message: string;
  relatedEntity: "visit" | "booking" | "payment" | "complaint" | "stay" | "checkout" | "system";
  relatedEntityId: string;
  read: boolean;
  created_at: string;
}

export interface CreateNotificationInput {
  recipient: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntity: "visit" | "booking" | "payment" | "complaint" | "stay" | "checkout" | "system";
  relatedEntityId: string;
  channels?: NotificationChannel[];
}

export interface ExternalNotificationPayload {
  recipientEmail?: string;
  recipientPhone?: string;
  subject: string;
  body: string;
}
