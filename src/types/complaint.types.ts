export type ComplaintCategory =
  | "MAINTENANCE"
  | "ELECTRICITY"
  | "WATER"
  | "CLEANLINESS"
  | "SECURITY"
  | "ROOM"
  | "PAYMENT"
  | "OWNER"
  | "OTHER";

export type ComplaintStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_FOR_USER"
  | "RESOLVED"
  | "CLOSED";

export type ComplaintPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface ComplaintUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface ComplaintOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface ComplaintProperty {
  id: string;
  title: string;
  locality: string;
  city: string;
}

export interface ComplaintRoom {
  id: string;
  roomNumber: string;
  sharingType: string;
}

export interface ComplaintStay {
  id: string;
  moveInDate: string;
}

export interface ComplaintResponse {
  id: string;
  senderRole: "STUDENT" | "OWNER" | "ADMIN";
  senderName: string;
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface ComplaintNotification {
  id: string;
  recipientRole: "STUDENT" | "OWNER" | "ADMIN";
  message: string;
  createdAt: string;
  read: boolean;
}

export interface ComplaintTicket {
  id: string;
  ticketNumber: string;
  user: ComplaintUser;
  owner: ComplaintOwner;
  property: ComplaintProperty;
  room: ComplaintRoom;
  stay: ComplaintStay;
  category: ComplaintCategory;
  title: string;
  description: string;
  attachments: string[];
  priority: ComplaintPriority;
  status: ComplaintStatus;
  responses: ComplaintResponse[];
  resolution?: string;
  notifications?: ComplaintNotification[];
  created_at: string;
  resolved_at?: string;
  updated_at: string;
}

export interface CreateComplaintInput {
  userId: string;
  stayId: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  title: string;
  description: string;
  attachments?: string[];
}
