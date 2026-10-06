import { siteConfig } from "@/config/site.config";
import {
  VisitPass,
  computeVisitPassVisibility,
} from "@/types/visit.types";
import { paymentService } from "./payment.service";

// In-Memory Visit Pass Database Store
const MOCK_VISIT_PASSES: VisitPass[] = [
  {
    id: "vp-1001",
    passCode: "VP-2026-8819",
    user: {
      id: "u-101",
      fullName: "Aditya Kumar",
      email: "aditya@example.com",
      phone: "+91 98765 43210",
    },
    property: {
      id: "prop-1",
      title: "UrbanNest Executive Co-Living & PG",
      locality: "HSR Layout, Sector 3",
      city: "Bengaluru",
      coverImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
      address: "Building 42, 100 Feet Road, Indiranagar, Sector 3",
      latitude: 12.9121,
      longitude: 77.6446,
    },
    owner: {
      id: "owner-1",
      name: "Vikram Malhotra",
      phone: "+91 98112 23344",
      email: "vikram@urbannest.com",
    },
    preferredDate: "2026-10-08",
    preferredTime: "Evening (05:00 PM - 07:00 PM)",
    status: "CONFIRMED",
    visitPassAmount: siteConfig.settings.visitPassFeeAmount,
    paymentStatus: "PAID",
    paymentId: "pay_N9X123456",
    razorpayOrderId: "order_N9X0001",
    ownerConfirmation: "ACCEPTED",
    visitNotes: "Looking forward to viewing Single Sharing AC room.",
    exactLocationVisibility: true,
    contactVisibility: true,
    createdAt: "2026-10-02T10:00:00Z",
    updatedAt: "2026-10-02T10:05:00Z",
  },
  {
    id: "vp-1002",
    passCode: "VP-2026-9912",
    user: {
      id: "u-101",
      fullName: "Aditya Kumar",
      email: "aditya@example.com",
      phone: "+91 98765 43210",
    },
    property: {
      id: "prop-2",
      title: "Stanza Heights Luxury PG for Men",
      locality: "Koramangala 5th Block",
      city: "Bengaluru",
      coverImage: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
      address: "5th Block, Opposite Jyoti Nivas College",
      latitude: 12.9352,
      longitude: 77.6245,
    },
    owner: {
      id: "owner-2",
      name: "Karan Johar",
      phone: "+91 99887 76655",
      email: "karan@stanza.com",
    },
    preferredDate: "2026-10-10",
    preferredTime: "Morning (10:00 AM - 12:00 PM)",
    status: "REQUESTED",
    visitPassAmount: siteConfig.settings.visitPassFeeAmount,
    paymentStatus: "PENDING",
    ownerConfirmation: "PENDING",
    visitNotes: "Weekend visit preferred.",
    exactLocationVisibility: false,
    contactVisibility: false,
    createdAt: "2026-10-04T15:30:00Z",
    updatedAt: "2026-10-04T15:30:00Z",
  },
];

export const visitService = {
  // Configurable Platform Visit Pass Fee
  getVisitPassFee(): number {
    return siteConfig.settings.visitPassFeeAmount || 9;
  },

  // Apply Security Rule for Location/Contact Visibility
  sanitizeVisitPass(vp: VisitPass): VisitPass {
    const visibility = computeVisitPassVisibility(vp.status, vp.paymentStatus);
    return {
      ...vp,
      exactLocationVisibility: visibility.exactLocationVisibility,
      contactVisibility: visibility.contactVisibility,
    };
  },

  async getVisitPassById(id: string): Promise<VisitPass | null> {
    const found = MOCK_VISIT_PASSES.find((v) => v.id === id || v.passCode === id);
    if (!found) return null;
    return this.sanitizeVisitPass(found);
  },

  async getUserVisits(userId?: string): Promise<VisitPass[]> {
    const list = userId ? MOCK_VISIT_PASSES.filter((v) => v.user.id === userId) : MOCK_VISIT_PASSES;
    return (list.length > 0 ? list : MOCK_VISIT_PASSES).map((v) => this.sanitizeVisitPass(v));
  },

  async getOwnerVisits(ownerId?: string): Promise<VisitPass[]> {
    const list = ownerId ? MOCK_VISIT_PASSES.filter((v) => v.owner.id === ownerId) : MOCK_VISIT_PASSES;
    return (list.length > 0 ? list : MOCK_VISIT_PASSES).map((v) => this.sanitizeVisitPass(v));
  },

  // Step 1: Create Visit Pass Request (Status: REQUESTED)
  async createVisitPassRequest(input: {
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    propertyId: string;
    propertyTitle: string;
    locality: string;
    city: string;
    coverImage: string;
    address: string;
    preferredDate: string;
    preferredTime: string;
    notes?: string;
  }): Promise<VisitPass> {
    const fee = this.getVisitPassFee();
    const passId = `vp-${Date.now()}`;
    const passCode = `VP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPass: VisitPass = {
      id: passId,
      passCode,
      user: {
        id: input.userId,
        fullName: input.userName,
        email: input.userEmail,
        phone: input.userPhone,
      },
      property: {
        id: input.propertyId,
        title: input.propertyTitle,
        locality: input.locality,
        city: input.city,
        coverImage: input.coverImage,
        address: input.address,
        latitude: 12.9121,
        longitude: 77.6446,
      },
      owner: {
        id: "owner-1",
        name: "RoomSplits Verified Manager",
        phone: "+91 98000 12345",
        email: "manager@roomsplits.com",
      },
      preferredDate: input.preferredDate,
      preferredTime: input.preferredTime,
      status: "REQUESTED",
      visitPassAmount: fee,
      paymentStatus: "PENDING",
      ownerConfirmation: "PENDING",
      visitNotes: input.notes,
      exactLocationVisibility: false,
      contactVisibility: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_VISIT_PASSES.unshift(newPass);
    return this.sanitizeVisitPass(newPass);
  },

  // Step 2: Initiate Payment Order (Status: PAYMENT_PENDING)
  async initiatePayment(visitId: string): Promise<{ orderId: string; amount: number; pass: VisitPass }> {
    const pass = await this.getVisitPassById(visitId);
    if (!pass) throw new Error("Visit pass not found");

    const order = await paymentService.createOrder({
      amount: pass.visitPassAmount,
      currency: "INR",
      receipt: `receipt_${pass.id}`,
      notes: { visitId: pass.id, passCode: pass.passCode },
    });

    const index = MOCK_VISIT_PASSES.findIndex((v) => v.id === visitId);
    if (index !== -1) {
      MOCK_VISIT_PASSES[index].status = "PAYMENT_PENDING";
      MOCK_VISIT_PASSES[index].razorpayOrderId = order.id;
      MOCK_VISIT_PASSES[index].updatedAt = new Date().toISOString();
    }

    return {
      orderId: order.id,
      amount: pass.visitPassAmount,
      pass: this.sanitizeVisitPass(MOCK_VISIT_PASSES[index]),
    };
  },

  // Step 3: Complete Payment (Status: CONFIRMED & paymentStatus: PAID)
  async completePayment(
    visitId: string,
    paymentId: string,
    signature: string
  ): Promise<VisitPass> {
    const index = MOCK_VISIT_PASSES.findIndex((v) => v.id === visitId);
    if (index === -1) throw new Error("Visit pass not found");

    const orderId = MOCK_VISIT_PASSES[index].razorpayOrderId || `order_${visitId}`;
    const verification = await paymentService.verifyPayment({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
    });

    if (!verification.success) {
      MOCK_VISIT_PASSES[index].paymentStatus = "FAILED";
      throw new Error("Payment verification failed");
    }

    MOCK_VISIT_PASSES[index].status = "CONFIRMED";
    MOCK_VISIT_PASSES[index].paymentStatus = "PAID";
    MOCK_VISIT_PASSES[index].paymentId = paymentId;
    MOCK_VISIT_PASSES[index].ownerConfirmation = "ACCEPTED";
    MOCK_VISIT_PASSES[index].updatedAt = new Date().toISOString();

    return this.sanitizeVisitPass(MOCK_VISIT_PASSES[index]);
  },

  // Owner Action 1: Accept Visit
  async ownerAcceptVisit(visitId: string): Promise<VisitPass> {
    const idx = MOCK_VISIT_PASSES.findIndex((v) => v.id === visitId);
    if (idx === -1) throw new Error("Visit not found");

    MOCK_VISIT_PASSES[idx].ownerConfirmation = "ACCEPTED";
    MOCK_VISIT_PASSES[idx].status = "CONFIRMED";
    MOCK_VISIT_PASSES[idx].updatedAt = new Date().toISOString();

    return this.sanitizeVisitPass(MOCK_VISIT_PASSES[idx]);
  },

  // Owner Action 2: Propose Another Time
  async ownerProposeTime(visitId: string, date: string, time: string): Promise<VisitPass> {
    return this.ownerProposeNewTime(visitId, date, time);
  },

  async ownerProposeNewTime(visitId: string, date: string, time: string): Promise<VisitPass> {
    const idx = MOCK_VISIT_PASSES.findIndex((v) => v.id === visitId);
    if (idx === -1) throw new Error("Visit not found");

    MOCK_VISIT_PASSES[idx].ownerConfirmation = "PROPOSED_NEW_TIME";
    MOCK_VISIT_PASSES[idx].status = "RESCHEDULED";
    MOCK_VISIT_PASSES[idx].ownerProposedDate = date;
    MOCK_VISIT_PASSES[idx].ownerProposedTime = time;
    MOCK_VISIT_PASSES[idx].updatedAt = new Date().toISOString();

    return this.sanitizeVisitPass(MOCK_VISIT_PASSES[idx]);
  },

  // Direct Pay Visit Pass Simulation Helper
  async payVisitPass(visitId: string): Promise<VisitPass> {
    const paymentId = `pay_${Date.now()}`;
    const signature = `sig_${Date.now()}`;
    await this.initiatePayment(visitId);
    return this.completePayment(visitId, paymentId, signature);
  },

  // Owner Action 3: Reject Visit
  async ownerRejectVisit(visitId: string, reason?: string): Promise<VisitPass> {
    const idx = MOCK_VISIT_PASSES.findIndex((v) => v.id === visitId);
    if (idx === -1) throw new Error("Visit not found");

    MOCK_VISIT_PASSES[idx].ownerConfirmation = "REJECTED";
    MOCK_VISIT_PASSES[idx].status = "CANCELLED";
    if (reason) MOCK_VISIT_PASSES[idx].visitNotes = `Rejected by Owner: ${reason}`;
    MOCK_VISIT_PASSES[idx].updatedAt = new Date().toISOString();

    return this.sanitizeVisitPass(MOCK_VISIT_PASSES[idx]);
  },

  // Owner Action 4: Mark Completed
  async ownerMarkCompleted(visitId: string): Promise<VisitPass> {
    const idx = MOCK_VISIT_PASSES.findIndex((v) => v.id === visitId);
    if (idx === -1) throw new Error("Visit not found");

    MOCK_VISIT_PASSES[idx].status = "COMPLETED";
    MOCK_VISIT_PASSES[idx].updatedAt = new Date().toISOString();

    return this.sanitizeVisitPass(MOCK_VISIT_PASSES[idx]);
  },

  // Student Action 1: Reschedule Visit
  async rescheduleVisitPass(visitId: string, newDate: string, newTime: string): Promise<VisitPass> {
    return this.studentRescheduleVisit(visitId, newDate, newTime);
  },

  async studentRescheduleVisit(visitId: string, newDate: string, newTime: string): Promise<VisitPass> {
    const idx = MOCK_VISIT_PASSES.findIndex((v) => v.id === visitId);
    if (idx === -1) throw new Error("Visit not found");

    MOCK_VISIT_PASSES[idx].preferredDate = newDate;
    MOCK_VISIT_PASSES[idx].preferredTime = newTime;
    MOCK_VISIT_PASSES[idx].status = "RESCHEDULED";
    MOCK_VISIT_PASSES[idx].updatedAt = new Date().toISOString();

    return this.sanitizeVisitPass(MOCK_VISIT_PASSES[idx]);
  },

  // Student Action 2: Cancel Visit
  async cancelVisitPass(visitId: string, reason?: string): Promise<VisitPass> {
    return this.studentCancelVisit(visitId, reason);
  },

  async studentCancelVisit(visitId: string, reason?: string): Promise<VisitPass> {
    const idx = MOCK_VISIT_PASSES.findIndex((v) => v.id === visitId);
    if (idx === -1) throw new Error("Visit not found");

    MOCK_VISIT_PASSES[idx].status = "CANCELLED";
    if (reason) MOCK_VISIT_PASSES[idx].visitNotes = `Cancelled by Student: ${reason}`;
    MOCK_VISIT_PASSES[idx].updatedAt = new Date().toISOString();

    return this.sanitizeVisitPass(MOCK_VISIT_PASSES[idx]);
  },
};
