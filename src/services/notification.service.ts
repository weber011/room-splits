import {
  AppNotification,
  CreateNotificationInput,
  ExternalNotificationPayload,
} from "@/types/notification.types";

// In-Memory Database Store for In-App Notifications
const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1001",
    recipient: "u-101",
    type: "RENT_DUE",
    title: "Monthly Rent Billing Reminder",
    message: "Your rent of ₹16,000 for UrbanNest Executive Co-Living is due on 5th Nov 2026.",
    relatedEntity: "stay",
    relatedEntityId: "stay-8001",
    read: false,
    created_at: "2026-10-05T09:00:00Z",
  },
  {
    id: "notif-1002",
    recipient: "u-101",
    type: "PAYMENT_SUCCESS",
    title: "Razorpay Booking Rent Payment Verified",
    message: "Payment of ₹48,499 received successfully (Order order_BK8001). Tax receipt generated.",
    relatedEntity: "payment",
    relatedEntityId: "tx-9002",
    read: false,
    created_at: "2026-10-03T10:05:00Z",
  },
  {
    id: "notif-1003",
    recipient: "u-101",
    type: "COMPLAINT_UPDATED",
    title: "Maintenance Ticket Status: IN_PROGRESS",
    message: "Landlord Vikram Malhotra updated status on TKT-2026-9001 (Electrician scheduled for 4 PM).",
    relatedEntity: "complaint",
    relatedEntityId: "cmp-1001",
    read: false,
    created_at: "2026-10-04T14:30:00Z",
  },
  {
    id: "notif-1004",
    recipient: "u-101",
    type: "VISIT_CONFIRMED",
    title: "Property Visit Pass Confirmed!",
    message: "Your scheduled visit pass for UrbanNest Executive Co-Living is confirmed for Oct 10 at 11:00 AM.",
    relatedEntity: "visit",
    relatedEntityId: "vp-1001",
    read: true,
    created_at: "2026-10-02T10:00:00Z",
  },
  {
    id: "notif-1005",
    recipient: "u-101",
    type: "DEPOSIT_SETTLEMENT",
    title: "Security Deposit Statement Available",
    message: "Landlord issued deposit settlement statement. Net refundable amount: ₹29,650.",
    relatedEntity: "checkout",
    relatedEntityId: "chk-9001",
    read: true,
    created_at: "2026-10-05T10:00:00Z",
  },
];

// Extensible Multi-Channel Notification Provider Adapters
export const notificationProviders = {
  async emailProvider(payload: ExternalNotificationPayload): Promise<{ success: boolean; provider: string }> {
    console.log(`[Email Provider Mock] Sending Email to ${payload.recipientEmail}: "${payload.subject}"`);
    return { success: true, provider: "SendGrid / AWS SES Adapter" };
  },

  async smsProvider(payload: ExternalNotificationPayload): Promise<{ success: boolean; provider: string }> {
    console.log(`[SMS Provider Mock] Sending SMS to ${payload.recipientPhone}: "${payload.body}"`);
    return { success: true, provider: "Twilio / MSG91 Adapter" };
  },

  async whatsAppProvider(payload: ExternalNotificationPayload): Promise<{ success: boolean; provider: string }> {
    console.log(`[WhatsApp Provider Mock] Sending WhatsApp message to ${payload.recipientPhone}: "${payload.body}"`);
    return { success: true, provider: "Meta WhatsApp Business API Adapter" };
  },
};

export class NotificationService {
  async getNotifications(recipientId: string): Promise<AppNotification[]> {
    return MOCK_NOTIFICATIONS.filter(
      (n) => n.recipient === recipientId || recipientId === "guest" || recipientId === "u-101"
    );
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    const list = await this.getNotifications(recipientId);
    return list.filter((n) => !n.read).length;
  }

  async markAsRead(notificationId: string): Promise<AppNotification | null> {
    const notif = MOCK_NOTIFICATIONS.find((n) => n.id === notificationId);
    if (notif) {
      notif.read = true;
      return notif;
    }
    return null;
  }

  async markAllAsRead(recipientId: string): Promise<boolean> {
    const list = MOCK_NOTIFICATIONS.filter(
      (n) => n.recipient === recipientId || recipientId === "guest" || recipientId === "u-101"
    );
    list.forEach((n) => {
      n.read = true;
    });
    return true;
  }

  async createNotification(input: CreateNotificationInput): Promise<AppNotification> {
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      recipient: input.recipient,
      type: input.type,
      title: input.title,
      message: input.message,
      relatedEntity: input.relatedEntity,
      relatedEntityId: input.relatedEntityId,
      read: false,
      created_at: new Date().toISOString(),
    };

    MOCK_NOTIFICATIONS.unshift(notif);

    // Dispatch via external providers if specified
    const channels = input.channels || ["IN_APP"];
    const payload: ExternalNotificationPayload = {
      recipientEmail: "aditya@example.com",
      recipientPhone: "+91 98765 43210",
      subject: input.title,
      body: input.message,
    };

    if (channels.includes("EMAIL")) {
      await notificationProviders.emailProvider(payload);
    }
    if (channels.includes("SMS")) {
      await notificationProviders.smsProvider(payload);
    }
    if (channels.includes("WHATSAPP")) {
      await notificationProviders.whatsAppProvider(payload);
    }

    return notif;
  }
}

export const notificationService = new NotificationService();
