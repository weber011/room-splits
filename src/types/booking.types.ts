export type BookingStatus =
  | "DRAFT"
  | "PAYMENT_PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "EXPIRED"
  | "COMPLETED";

export type BookingPaymentStatus =
  | "UNPAID"
  | "PAYMENT_PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export interface BookingUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface BookingOwner {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface BookingProperty {
  id: string;
  title: string;
  locality: string;
  city: string;
  coverImage?: string;
  address?: string;
}

export interface BookingRoom {
  id: string;
  roomNumber?: string;
  sharingType: string;
  availableBeds: number;
  totalBeds: number;
}

export interface Booking {
  id: string;
  bookingCode: string;
  user: BookingUser;
  owner: BookingOwner;
  property: BookingProperty;
  room: BookingRoom;
  bookingDate: string;
  moveInDate: string;
  moveOutDate: string;
  monthlyRent: number;
  securityDeposit: number;
  platformCharges: number;
  totalAmount: number;
  paymentStatus: BookingPaymentStatus;
  bookingStatus: BookingStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  agreementUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingInput {
  userId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  propertyId: string;
  roomId: string;
  moveInDate: string;
  moveOutDate: string;
  monthlyRent?: number;
  securityDeposit?: number;
  platformCharges?: number;
  totalAmount?: number;
  notes?: string;
}
