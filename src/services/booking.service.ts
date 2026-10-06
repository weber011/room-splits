import { siteConfig } from "@/config/site.config";
import { Booking, CreateBookingInput } from "@/types/booking.types";
import { paymentService } from "./payment.service";

// In-Memory Room Inventory state for double-booking guard & atomic updates
export interface RoomInventoryItem {
  id: string;
  propertyId: string;
  sharingType: string;
  roomNumber: string;
  monthlyRent: number;
  securityDeposit: number;
  totalBeds: number;
  availableBeds: number;
  isAvailable: boolean;
}

const MOCK_ROOM_INVENTORY: Record<string, RoomInventoryItem> = {
  "r-single": {
    id: "r-single",
    propertyId: "prop-1",
    sharingType: "Single Sharing AC",
    roomNumber: "A-101",
    monthlyRent: 16000,
    securityDeposit: 32000,
    totalBeds: 2,
    availableBeds: 1,
    isAvailable: true,
  },
  "r-double": {
    id: "r-double",
    propertyId: "prop-1",
    sharingType: "Double Sharing Non-AC",
    roomNumber: "B-204",
    monthlyRent: 11500,
    securityDeposit: 23000,
    totalBeds: 6,
    availableBeds: 3,
    isAvailable: true,
  },
  "r-full-room": {
    id: "r-full-room",
    propertyId: "prop-2",
    sharingType: "Private Executive Room",
    roomNumber: "C-305",
    monthlyRent: 22000,
    securityDeposit: 44000,
    totalBeds: 1,
    availableBeds: 0, // Fully booked test case
    isAvailable: false,
  },
};

// In-Memory Booking Database Store
const MOCK_BOOKINGS: Booking[] = [
  {
    id: "bk-8001",
    bookingCode: "BK-2026-9901",
    user: {
      id: "u-101",
      fullName: "Aditya Kumar",
      email: "aditya@example.com",
      phone: "+91 98765 43210",
    },
    owner: {
      id: "owner-1",
      name: "Vikram Malhotra",
      phone: "+91 98112 23344",
      email: "vikram@urbannest.com",
    },
    property: {
      id: "prop-1",
      title: "UrbanNest Executive Co-Living & PG",
      locality: "HSR Layout, Sector 3",
      city: "Bengaluru",
      coverImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
      address: "Building 42, 100 Feet Road, Indiranagar, Sector 3",
    },
    room: {
      id: "r-single",
      roomNumber: "A-101",
      sharingType: "Single Sharing AC",
      totalBeds: 2,
      availableBeds: 1,
    },
    bookingDate: "2026-10-03",
    moveInDate: "2026-10-15",
    monthlyRent: 16000,
    securityDeposit: 32000,
    platformCharges: siteConfig.settings.bookingPlatformFeeAmount || 499,
    totalAmount: 16000 + 32000 + (siteConfig.settings.bookingPlatformFeeAmount || 499),
    paymentStatus: "PAID",
    bookingStatus: "CONFIRMED",
    razorpayOrderId: "order_BK8001",
    razorpayPaymentId: "pay_BK8001_PAID",
    createdAt: "2026-10-03T10:00:00Z",
    updatedAt: "2026-10-03T10:05:00Z",
  },
];

export const bookingService = {
  getPlatformFee(): number {
    return siteConfig.settings.bookingPlatformFeeAmount || 499;
  },

  getRoomInventory(roomId: string): RoomInventoryItem | null {
    return MOCK_ROOM_INVENTORY[roomId] || null;
  },

  async getBookingById(id: string): Promise<Booking | null> {
    const found = MOCK_BOOKINGS.find((b) => b.id === id || b.bookingCode === id);
    return found || null;
  },

  async getUserBookings(userId?: string): Promise<Booking[]> {
    if (!userId) return MOCK_BOOKINGS;
    return MOCK_BOOKINGS.filter((b) => b.user.id === userId);
  },

  async getOwnerBookings(ownerId?: string): Promise<Booking[]> {
    if (!ownerId) return MOCK_BOOKINGS;
    return MOCK_BOOKINGS.filter((b) => b.owner.id === ownerId);
  },

  async getAllBookings(): Promise<Booking[]> {
    return MOCK_BOOKINGS;
  },

  // Step 1: Create Booking Draft (Double Booking Guard)
  async createBookingDraft(input: CreateBookingInput): Promise<Booking> {
    const room = MOCK_ROOM_INVENTORY[input.roomId];

    // Double Booking Prevention Guard
    if (!room || room.availableBeds <= 0 || !room.isAvailable) {
      throw new Error("DOUBLE_BOOKING_PREVENTED: This room or bed is already fully booked and unavailable.");
    }

    const platformFee = this.getPlatformFee();
    const monthlyRent = room.monthlyRent;
    const securityDeposit = room.securityDeposit;
    const totalAmount = monthlyRent + securityDeposit + platformFee;

    const bookingId = `bk-${Date.now()}`;
    const bookingCode = `BK-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: Booking = {
      id: bookingId,
      bookingCode,
      user: {
        id: input.userId,
        fullName: input.userName,
        email: input.userEmail,
        phone: input.userPhone,
      },
      owner: {
        id: "owner-1",
        name: "Vikram Malhotra",
        phone: "+91 98112 23344",
        email: "vikram@urbannest.com",
      },
      property: {
        id: input.propertyId,
        title: "UrbanNest Executive Co-Living & PG",
        locality: "HSR Layout, Sector 3",
        city: "Bengaluru",
        coverImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
        address: "Building 42, 100 Feet Road, Indiranagar",
      },
      room: {
        id: room.id,
        roomNumber: room.roomNumber,
        sharingType: room.sharingType,
        totalBeds: room.totalBeds,
        availableBeds: room.availableBeds,
      },
      bookingDate: new Date().toISOString().split("T")[0],
      moveInDate: input.moveInDate,
      monthlyRent,
      securityDeposit,
      platformCharges: platformFee,
      totalAmount,
      paymentStatus: "UNPAID",
      bookingStatus: "DRAFT",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_BOOKINGS.unshift(newBooking);
    return newBooking;
  },

  // Step 2: Initiate Payment Order
  async initiateBookingPayment(bookingId: string): Promise<{ orderId: string; amount: number; booking: Booking }> {
    const booking = await this.getBookingById(bookingId);
    if (!booking) throw new Error("Booking not found");

    // Double booking guard check before payment
    const room = MOCK_ROOM_INVENTORY[booking.room.id];
    if (room && room.availableBeds <= 0) {
      throw new Error("DOUBLE_BOOKING_PREVENTED: Room is no longer available.");
    }

    const order = await paymentService.createOrder({
      amount: booking.totalAmount,
      currency: "INR",
      receipt: `receipt_${booking.id}`,
      notes: { bookingId: booking.id, bookingCode: booking.bookingCode },
    });

    const index = MOCK_BOOKINGS.findIndex((b) => b.id === bookingId);
    if (index !== -1) {
      MOCK_BOOKINGS[index].bookingStatus = "PAYMENT_PENDING";
      MOCK_BOOKINGS[index].paymentStatus = "PAYMENT_PENDING";
      MOCK_BOOKINGS[index].razorpayOrderId = order.id;
      MOCK_BOOKINGS[index].updatedAt = new Date().toISOString();
    }

    return {
      orderId: order.id,
      amount: booking.totalAmount,
      booking: MOCK_BOOKINGS[index],
    };
  },

  // Step 3: Complete Payment & Confirm Booking (Atomic Inventory Lock)
  async confirmBookingPayment(
    bookingId: string,
    paymentId: string,
    signature: string
  ): Promise<Booking> {
    const index = MOCK_BOOKINGS.findIndex((b) => b.id === bookingId);
    if (index === -1) throw new Error("Booking not found");

    const booking = MOCK_BOOKINGS[index];
    const roomId = booking.room.id;
    const room = MOCK_ROOM_INVENTORY[roomId];

    // Atomic Double Booking Check
    if (!room || room.availableBeds <= 0) {
      MOCK_BOOKINGS[index].bookingStatus = "CANCELLED";
      MOCK_BOOKINGS[index].paymentStatus = "FAILED";
      throw new Error("DOUBLE_BOOKING_PREVENTED: Room beds sold out before payment confirmation.");
    }

    const orderId = booking.razorpayOrderId || `order_${bookingId}`;
    const verification = await paymentService.verifyPayment({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
    });

    if (!verification.success) {
      MOCK_BOOKINGS[index].paymentStatus = "FAILED";
      throw new Error("Payment verification failed");
    }

    // Atomic Operation: Update room availability inventory
    room.availableBeds = Math.max(0, room.availableBeds - 1);
    if (room.availableBeds === 0) {
      room.isAvailable = false;
    }

    // Update booking state
    MOCK_BOOKINGS[index].bookingStatus = "CONFIRMED";
    MOCK_BOOKINGS[index].paymentStatus = "PAID";
    MOCK_BOOKINGS[index].razorpayPaymentId = paymentId;
    MOCK_BOOKINGS[index].updatedAt = new Date().toISOString();

    return MOCK_BOOKINGS[index];
  },

  // Direct Pay Booking Helper (Simulation for abstraction)
  async payBooking(bookingId: string): Promise<Booking> {
    const paymentId = `pay_bk_${Date.now()}`;
    const signature = `sig_bk_${Date.now()}`;
    await this.initiateBookingPayment(bookingId);
    return this.confirmBookingPayment(bookingId, paymentId, signature);
  },

  // Action: Cancel Booking
  async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    const idx = MOCK_BOOKINGS.findIndex((b) => b.id === bookingId);
    if (idx === -1) throw new Error("Booking not found");

    if (reason) {
      console.log(`Booking ${bookingId} cancelled for reason: ${reason}`);
    }

    // If booking was confirmed, restore room bed availability
    if (MOCK_BOOKINGS[idx].bookingStatus === "CONFIRMED") {
      const roomId = MOCK_BOOKINGS[idx].room.id;
      if (MOCK_ROOM_INVENTORY[roomId]) {
        MOCK_ROOM_INVENTORY[roomId].availableBeds += 1;
        MOCK_ROOM_INVENTORY[roomId].isAvailable = true;
      }
    }

    MOCK_BOOKINGS[idx].bookingStatus = "CANCELLED";
    MOCK_BOOKINGS[idx].updatedAt = new Date().toISOString();

    return MOCK_BOOKINGS[idx];
  },

  // Action: Complete Booking / Move-in
  async completeBooking(bookingId: string): Promise<Booking> {
    const idx = MOCK_BOOKINGS.findIndex((b) => b.id === bookingId);
    if (idx === -1) throw new Error("Booking not found");

    MOCK_BOOKINGS[idx].bookingStatus = "COMPLETED";
    MOCK_BOOKINGS[idx].updatedAt = new Date().toISOString();

    return MOCK_BOOKINGS[idx];
  },
};
