import {
  CheckoutRecord,
  CheckoutStatus,
  DepositSettlement,
  DepositDeductionItem,
  CreateCheckoutInput,
  SubmitSettlementInput,
} from "@/types/checkout.types";
import { getTenantActiveStay } from "./stay.service";

// In-Memory Database Store for Checkout Requests & Deposit Settlements
const MOCK_CHECKOUTS: CheckoutRecord[] = [
  {
    id: "chk-9001",
    stayId: "stay-8001",
    tenant: {
      id: "u-101",
      fullName: "Aditya Kumar",
      email: "aditya@example.com",
      phone: "+91 98765 43210",
    },
    owner: {
      id: "owner-1",
      name: "Vikram Malhotra",
      email: "vikram@urbannest.com",
      phone: "+91 98112 23344",
    },
    property: {
      id: "prop-1",
      title: "UrbanNest Executive Co-Living & PG",
      locality: "Indiranagar",
    },
    room: {
      roomNumber: "Room 204-B",
      sharingType: "Double Sharing AC",
    },
    requestedCheckoutDate: "2026-11-05",
    reason: "Course Completion & Relocation to Pune",
    notes: "Requesting move-out inspection on 4th Nov afternoon.",
    status: "SETTLEMENT_PENDING",
    settlement: {
      id: "stl-1001",
      checkoutRequestId: "chk-9001",
      stayId: "stay-8001",
      originalSecurityDeposit: 32000,
      deductions: [
        {
          id: "ded-1",
          category: "DEEP_CLEANING",
          description: "End of tenancy room deep cleaning & mattress sanitization",
          amount: 1500,
          evidenceUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
        },
        {
          id: "ded-2",
          category: "UTILITY_DUES",
          description: "Final October electricity meter usage balance",
          amount: 850,
        },
      ],
      deductionReasons: "Room deep cleaning charge (₹1,500) and final month electricity meter usage (₹850).",
      refundableAmount: 29650, // 32000 - 2350 = 29650
      settlementDate: "2026-10-05T10:00:00Z",
      ownerNotes: "Inspection completed cleanly. Room key handed back. Deducted deep cleaning & final electric bill.",
      userAcknowledgement: false,
    },
    createdAt: "2026-10-04T09:00:00Z",
    updatedAt: "2026-10-05T10:00:00Z",
  },
];

export class CheckoutService {
  async getTenantCheckout(tenantId: string): Promise<CheckoutRecord | null> {
    const record = MOCK_CHECKOUTS.find(
      (c) => c.tenant.id === tenantId || tenantId === "guest" || tenantId === "u-101"
    );
    return record || MOCK_CHECKOUTS[0] || null;
  }

  async getOwnerCheckouts(ownerId?: string): Promise<CheckoutRecord[]> {
    if (!ownerId || ownerId === "all") return MOCK_CHECKOUTS;
    return MOCK_CHECKOUTS.filter((c) => c.owner.id === ownerId || ownerId === "owner-1");
  }

  async getAdminCheckouts(): Promise<CheckoutRecord[]> {
    return MOCK_CHECKOUTS;
  }

  async createCheckoutRequest(input: CreateCheckoutInput): Promise<CheckoutRecord> {
    const stay = await getTenantActiveStay("u-101");
    if (!stay) throw new Error("Active stay not found for checkout request");

    const checkoutId = `chk-${Date.now()}`;
    const now = new Date().toISOString();

    const record: CheckoutRecord = {
      id: checkoutId,
      stayId: input.stayId,
      tenant: {
        id: stay.tenantId,
        fullName: stay.tenantName,
        email: stay.tenantEmail,
        phone: stay.tenantPhone,
      },
      owner: {
        id: stay.owner.id,
        name: stay.owner.name,
        email: stay.owner.email,
        phone: stay.owner.phone,
      },
      property: {
        id: stay.propertyId,
        title: stay.propertyName,
        locality: stay.propertyAddress,
      },
      room: {
        roomNumber: stay.roomNumber,
        sharingType: stay.sharingType,
      },
      requestedCheckoutDate: input.requestedCheckoutDate,
      reason: input.reason,
      notes: input.notes,
      status: "REQUESTED",
      createdAt: now,
      updatedAt: now,
    };

    MOCK_CHECKOUTS.unshift(record);
    stay.status = "CHECKOUT_REQUESTED";
    return record;
  }

  async updateCheckoutStatus(
    checkoutId: string,
    status: CheckoutStatus
  ): Promise<CheckoutRecord> {
    const record = MOCK_CHECKOUTS.find((c) => c.id === checkoutId);
    if (!record) throw new Error("Checkout record not found");

    record.status = status;
    record.updatedAt = new Date().toISOString();
    return record;
  }

  async submitOwnerSettlement(input: SubmitSettlementInput): Promise<CheckoutRecord> {
    const record = MOCK_CHECKOUTS.find((c) => c.id === input.checkoutId);
    if (!record) throw new Error("Checkout record not found");

    const stay = await getTenantActiveStay(record.tenant.id);
    const originalDeposit = stay ? stay.securityDeposit : 32000;

    const formattedDeductions: DepositDeductionItem[] = input.deductions.map((d, index) => ({
      ...d,
      id: `ded-${Date.now()}-${index}`,
    }));

    const totalDeductions = formattedDeductions.reduce((sum, item) => sum + item.amount, 0);

    // Calculate refundable amount: Math.max(0, originalSecurityDeposit - totalDeductions)
    const refundableAmount = Math.max(0, originalDeposit - totalDeductions);

    const deductionSummary = formattedDeductions
      .map((d) => `${d.description} (₹${d.amount.toLocaleString("en-IN")})`)
      .join("; ");

    const now = new Date().toISOString();

    const settlement: DepositSettlement = {
      id: `stl-${Date.now()}`,
      checkoutRequestId: record.id,
      stayId: record.stayId,
      originalSecurityDeposit: originalDeposit,
      deductions: formattedDeductions,
      deductionReasons: deductionSummary || "No deductions applied.",
      refundableAmount,
      settlementDate: now,
      ownerNotes: input.ownerNotes,
      userAcknowledgement: false,
    };

    record.settlement = settlement;
    record.status = "SETTLEMENT_PENDING";
    record.updatedAt = now;

    return record;
  }

  async acknowledgeUserSettlement(checkoutId: string): Promise<CheckoutRecord> {
    const record = MOCK_CHECKOUTS.find((c) => c.id === checkoutId);
    if (!record || !record.settlement) throw new Error("Settlement record not found");

    const now = new Date().toISOString();
    record.settlement.userAcknowledgement = true;
    record.settlement.userAcknowledgedAt = now;
    record.settlement.paymentRefundReference = `rfnd_rzp_${Date.now()}`;
    record.status = "SETTLED";
    record.updatedAt = now;

    // Mutate stay status to CHECKED_OUT and record to CLOSED
    const stay = await getTenantActiveStay(record.tenant.id);
    if (stay) {
      stay.status = "CHECKED_OUT";
    }

    record.status = "CLOSED";

    return record;
  }

  async raiseUserDispute(checkoutId: string, reason: string): Promise<CheckoutRecord> {
    const record = MOCK_CHECKOUTS.find((c) => c.id === checkoutId);
    if (!record || !record.settlement) throw new Error("Settlement record not found");

    const now = new Date().toISOString();
    record.settlement.dispute = {
      id: `dsp-${Date.now()}`,
      raisedBy: "STUDENT",
      userReason: reason,
      status: "OPEN",
      createdAt: now,
    };

    record.updatedAt = now;
    return record;
  }

  async resolveAdminDispute(
    checkoutId: string,
    adjustedDeductions: DepositDeductionItem[],
    adminNotes: string
  ): Promise<CheckoutRecord> {
    const record = MOCK_CHECKOUTS.find((c) => c.id === checkoutId);
    if (!record || !record.settlement || !record.settlement.dispute) {
      throw new Error("Disputed settlement not found");
    }

    const now = new Date().toISOString();
    record.settlement.deductions = adjustedDeductions;
    const totalDeductions = adjustedDeductions.reduce((sum, item) => sum + item.amount, 0);
    record.settlement.refundableAmount = Math.max(
      0,
      record.settlement.originalSecurityDeposit - totalDeductions
    );

    record.settlement.dispute.status = "RESOLVED";
    record.settlement.dispute.adminNotes = adminNotes;
    record.settlement.dispute.resolvedAt = now;

    record.settlement.userAcknowledgement = true;
    record.settlement.userAcknowledgedAt = now;
    record.settlement.paymentRefundReference = `rfnd_rzp_admin_${Date.now()}`;
    record.status = "SETTLED";
    record.updatedAt = now;

    const stay = await getTenantActiveStay(record.tenant.id);
    if (stay) {
      stay.status = "CHECKED_OUT";
    }

    record.status = "CLOSED";
    return record;
  }
}

export const checkoutService = new CheckoutService();
