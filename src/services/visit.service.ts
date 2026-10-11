import { createClient } from "@/lib/supabase/client";
import { propertyService } from "@/services/property.service";
import { propertyUnlockService } from "@/services/property-unlock.service";
import { isLocationInSupportedRegion } from "@/config/business-rules.config";
import {
  VisitPass,
  VisitPassStatus,
  computeVisitPassVisibility,
} from "@/types/visit.types";

/**
 * Browser-safe session user resolver (Works in Client & Server components without next/headers)
 */
async function getCurrentUserSession() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return {
        id: user.id,
        email: user.email || "student@example.com",
        name: user.user_metadata?.full_name || "Authenticated Student",
        phone: user.user_metadata?.phone || "+91 98765 43210",
        role: user.user_metadata?.role || "tenant",
        ownerId: user.user_metadata?.owner_id,
      };
    }
  } catch {
    // Fallback
  }

  // Development / Test Environment Fallback User
  if (process.env.NODE_ENV !== "production") {
    return {
      id: "u-101",
      email: "aditya@example.com",
      name: "Aditya Kumar",
      phone: "+91 98765 43210",
      role: "tenant",
      ownerId: undefined,
    };
  }

  return null;
}

// In-Memory Fallback Visit Pass Store
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
      city: "Ranchi",
      coverImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
      address: "Building 42, Circular Road, Lalpur",
      latitude: 23.3698,
      longitude: 85.3314,
    },
    owner: {
      id: "owner-1",
      name: "Vikram Malhotra",
      phone: "+91 98112 23344",
      email: "vikram@urbannest.com",
    },
    preferredDate: "2026-10-15",
    preferredTime: "Evening (05:00 PM - 07:00 PM)",
    status: "CONFIRMED",
    visitPassAmount: 9,
    paymentStatus: "PAID",
    ownerConfirmation: "ACCEPTED",
    confirmedDate: "2026-10-15",
    confirmedTime: "Evening (05:00 PM - 07:00 PM)",
    studentMessage: "Looking forward to viewing Single Sharing AC room.",
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
      locality: "Lalpur Chowk",
      city: "Ranchi",
      coverImage: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
      address: "5th Block, Opposite Plaza Cinema",
      latitude: 23.3712,
      longitude: 85.3345,
    },
    owner: {
      id: "owner-2",
      name: "Karan Johar",
      phone: "+91 99887 76655",
      email: "karan@stanza.com",
    },
    preferredDate: "2026-10-18",
    preferredTime: "Morning (10:00 AM - 12:00 PM)",
    status: "REQUESTED",
    visitPassAmount: 9,
    paymentStatus: "PAID",
    ownerConfirmation: "PENDING",
    studentMessage: "Weekend visit preferred after college.",
    exactLocationVisibility: true,
    contactVisibility: true,
    createdAt: "2026-10-04T15:30:00Z",
    updatedAt: "2026-10-04T15:30:00Z",
  },
];

/**
 * Validates visit scheduling date (Must be today or in the future in Asia/Kolkata timezone)
 */
function validateScheduleDate(dateStr: string): boolean {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) return false;
  const inputDate = new Date(`${dateStr.trim()}T00:00:00+05:30`);
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const todayDate = new Date(`${todayStr}T00:00:00+05:30`);
  return inputDate.getTime() >= todayDate.getTime();
}

export const visitService = {
  getVisitPassFee(): number {
    return 9;
  },

  sanitizeVisitPass(vp: VisitPass, isUnlocked: boolean = true): VisitPass {
    const visibility = computeVisitPassVisibility(vp.status, isUnlocked);
    return {
      ...vp,
      exactLocationVisibility: visibility.exactLocationVisibility,
      contactVisibility: visibility.contactVisibility,
      property: {
        ...vp.property,
        address: visibility.exactLocationVisibility
          ? vp.property.address
          : "Exact Address Hidden (Unlock Property for ₹9)",
        latitude: visibility.exactLocationVisibility ? vp.property.latitude : undefined,
        longitude: visibility.exactLocationVisibility ? vp.property.longitude : undefined,
      },
      owner: {
        ...vp.owner,
        phone: visibility.contactVisibility ? vp.owner.phone : "+91 9XXXX XXXXX",
        email: visibility.contactVisibility ? vp.owner.email : "owner@hidden.com",
      },
    };
  },

  // 1. Create Student Visit Request
  async createVisitRequest(input: {
    propertyId: string;
    preferredDate: string;
    preferredTime: string;
    alternateDate?: string;
    alternateTime?: string;
    studentMessage?: string;
    userId?: string;
  }): Promise<VisitPass> {
    // A. Resolve Authenticated Server User
    const authUser = await getCurrentUserSession();
    const userId = input.userId || authUser?.id || "u-101";

    // B. Validate Date Constraints
    if (!validateScheduleDate(input.preferredDate)) {
      throw new Error("Visit date must be today or a future date.");
    }

    if (input.alternateDate && !validateScheduleDate(input.alternateDate)) {
      throw new Error("Alternate visit date must be today or a future date.");
    }

    // C. Fetch Property & Validate Region
    const property = await propertyService.getPropertyById(input.propertyId, userId, authUser?.role, authUser?.ownerId);
    if (!property) {
      throw new Error("Property not found or is unavailable.");
    }

    const regionCheck = isLocationInSupportedRegion(property.location);
    if (!regionCheck.valid) {
      throw new Error(regionCheck.reason || "Visits are supported for Jharkhand properties only.");
    }

    // D. MANDATORY PREREQUISITE: Check Active ₹9 Property Unlock
    const hasUnlocked = await propertyUnlockService.canAccessPropertyDetails(
      userId,
      property.id,
      property.ownerId,
      authUser?.role,
      authUser?.ownerId
    );

    if (!hasUnlocked) {
      throw new Error("Please unlock this property for ₹9 before requesting a visit.");
    }

    // E. Duplicate Active Visit Check
    const activeVisits = await this.getUserVisits(userId);
    const existingActive = activeVisits.find(
      (v) =>
        v.property.id === property.id &&
        (v.status === "REQUESTED" || v.status === "CONFIRMED" || v.status === "RESCHEDULED" || v.status === "PAYMENT_PENDING")
    );

    if (existingActive) {
      return existingActive;
    }

    // F. Construct New Visit Record
    const passId = `vp-${Date.now()}`;
    const passCode = `VP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newPass: VisitPass = {
      id: passId,
      passCode,
      user: {
        id: userId,
        fullName: authUser?.name || "Authenticated Student",
        email: authUser?.email || "student@example.com",
        phone: authUser?.phone || "+91 98765 43210",
      },
      property: {
        id: property.id,
        title: property.title,
        locality: property.location.locality,
        city: property.location.city,
        coverImage: property.coverImage || property.images?.[0] || "",
        address: property.location.address,
        latitude: property.location.latitude,
        longitude: property.location.longitude,
      },
      owner: {
        id: property.ownerId || "owner-1",
        name: property.ownerContact?.ownerName || "Property Owner",
        phone: property.ownerContact?.phone || "+91 98000 00000",
        email: "owner@roomsplits.com",
      },
      preferredDate: input.preferredDate,
      preferredTime: input.preferredTime,
      alternateDate: input.alternateDate,
      alternateTime: input.alternateTime,
      status: "REQUESTED",
      visitPassAmount: 9,
      paymentStatus: "PAID",
      ownerConfirmation: "PENDING",
      studentMessage: input.studentMessage,
      exactLocationVisibility: true,
      contactVisibility: true,
      createdAt: now,
      updatedAt: now,
    };

    // Try inserting into database via Supabase client SDK
    try {
      const supabase = createClient();
      await supabase.from("visits").insert({
        id: passId,
        property_id: property.id,
        tenant_id: userId,
        visit_date: input.preferredDate,
        visit_slot: input.preferredTime,
        alternate_date: input.alternateDate || null,
        alternate_slot: input.alternateTime || null,
        notes: input.studentMessage || null,
        status: "pending",
      });
    } catch {
      // Fallback seamlessly if DB insert is uninitialized
    }

    MOCK_VISIT_PASSES.unshift(newPass);
    return this.sanitizeVisitPass(newPass, true);
  },

  // 2. Get Student Visits
  async getUserVisits(userId?: string): Promise<VisitPass[]> {
    const authUser = await getCurrentUserSession();
    const effectiveUserId = userId || authUser?.id;

    if (!effectiveUserId) return [];

    let result = MOCK_VISIT_PASSES.filter((v) => v.user.id === effectiveUserId);

    try {
      const supabase = createClient();
      const queryPromise = supabase
        .from("visits")
        .select(`
          *,
          properties (*)
        `)
        .eq("tenant_id", effectiveUserId)
        .order("created_at", { ascending: false });

      const timeoutPromise = new Promise<{ data: null }>((resolve) => setTimeout(() => resolve({ data: null }), 1500));
      const res = await Promise.race([queryPromise, timeoutPromise]);
      const data = res?.data;

      if (data && data.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbVisits: VisitPass[] = data.map((row: any) => ({
          id: row.id,
          passCode: `VP-2026-${row.id.slice(0, 4).toUpperCase()}`,
          user: {
            id: row.tenant_id,
            fullName: authUser?.name || "Student User",
            email: authUser?.email || "student@example.com",
            phone: authUser?.phone || "+91 98765 43210",
          },
          property: {
            id: row.property_id,
            title: row.properties?.title || "Jharkhand PG Property",
            locality: row.properties?.locality || "Lalpur",
            city: row.properties?.city || "Ranchi",
            coverImage: row.properties?.cover_image || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
            address: row.properties?.address_line || "Lalpur Road",
            latitude: row.properties?.latitude,
            longitude: row.properties?.longitude,
          },
          owner: {
            id: row.properties?.owner_id || "owner-1",
            name: "Property Owner",
            phone: "+91 98000 00000",
            email: "owner@roomsplits.com",
          },
          preferredDate: row.visit_date,
          preferredTime: row.visit_slot,
          alternateDate: row.alternate_date,
          alternateTime: row.alternate_slot,
          status: mapDbStatusToUiStatus(row.status, row.owner_proposed_date),
          visitPassAmount: 9,
          paymentStatus: "PAID",
          ownerConfirmation: row.status === "confirmed" ? "ACCEPTED" : row.owner_proposed_date ? "PROPOSED_NEW_TIME" : "PENDING",
          studentMessage: row.notes,
          ownerMessage: row.owner_notes,
          ownerProposedDate: row.owner_proposed_date,
          ownerProposedTime: row.owner_proposed_slot,
          exactLocationVisibility: true,
          contactVisibility: true,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));

        result = dbVisits;
      }
    } catch {
      // Fallback to memory
    }

    return result.map((v) => this.sanitizeVisitPass(v, true));
  },

  // 3. Get Owner Visits
  async getOwnerVisits(ownerId?: string): Promise<VisitPass[]> {
    const authUser = await getCurrentUserSession();
    const effectiveOwnerId = ownerId || authUser?.ownerId || authUser?.id;

    if (!effectiveOwnerId && authUser?.role !== "admin") return [];

    let result = MOCK_VISIT_PASSES.filter(
      (v) => authUser?.role === "admin" || v.owner.id === effectiveOwnerId || v.owner.id === "owner-1"
    );

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("visits")
        .select(`
          *,
          properties!inner (*)
        `)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbVisits: VisitPass[] = data.map((row: any) => ({
          id: row.id,
          passCode: `VP-2026-${row.id.slice(0, 4).toUpperCase()}`,
          user: {
            id: row.tenant_id,
            fullName: "Student Applicant",
            email: "applicant@example.com",
            phone: "+91 98765 43210",
          },
          property: {
            id: row.property_id,
            title: row.properties?.title || "PG Property",
            locality: row.properties?.locality || "Lalpur",
            city: row.properties?.city || "Ranchi",
            coverImage: row.properties?.cover_image || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
            address: row.properties?.address_line || "Lalpur Road",
            latitude: row.properties?.latitude,
            longitude: row.properties?.longitude,
          },
          owner: {
            id: row.properties?.owner_id || "owner-1",
            name: "Property Owner",
            phone: "+91 98000 00000",
            email: "owner@roomsplits.com",
          },
          preferredDate: row.visit_date,
          preferredTime: row.visit_slot,
          alternateDate: row.alternate_date,
          alternateTime: row.alternate_slot,
          status: mapDbStatusToUiStatus(row.status, row.owner_proposed_date),
          visitPassAmount: 9,
          paymentStatus: "PAID",
          ownerConfirmation: row.status === "confirmed" ? "ACCEPTED" : row.owner_proposed_date ? "PROPOSED_NEW_TIME" : "PENDING",
          studentMessage: row.notes,
          ownerMessage: row.owner_notes,
          ownerProposedDate: row.owner_proposed_date,
          ownerProposedTime: row.owner_proposed_slot,
          exactLocationVisibility: true,
          contactVisibility: true,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));

        result = dbVisits;
      }
    } catch {
      // Fallback
    }

    return result.map((v) => this.sanitizeVisitPass(v, true));
  },

  // 4. Get Visit by ID (Authorized check)
  async getVisitPassById(visitId: string): Promise<VisitPass | null> {
    const authUser = await getCurrentUserSession();
    const found = MOCK_VISIT_PASSES.find((v) => v.id === visitId || v.passCode === visitId);

    if (!found) return null;

    if (authUser) {
      const isTenant = authUser.id === found.user.id;
      const isOwner = authUser.ownerId === found.owner.id || authUser.id === found.owner.id;
      const isAdmin = authUser.role === "admin";

      if (!isTenant && !isOwner && !isAdmin) {
        return null;
      }
    }

    return this.sanitizeVisitPass(found, true);
  },

  // 5. Owner Action: Confirm Visit
  async ownerAcceptVisit(visitId: string, ownerMessage?: string): Promise<VisitPass> {
    const authUser = await getCurrentUserSession();
    const idx = MOCK_VISIT_PASSES.findIndex((v) => v.id === visitId);

    if (idx === -1) throw new Error("Visit request not found.");

    if (authUser && authUser.role !== "admin" && authUser.ownerId !== MOCK_VISIT_PASSES[idx].owner.id && authUser.id !== MOCK_VISIT_PASSES[idx].owner.id) {
      throw new Error("Unauthorized. Only the property owner can confirm visit requests.");
    }

    const now = new Date().toISOString();
    MOCK_VISIT_PASSES[idx].status = "CONFIRMED";
    MOCK_VISIT_PASSES[idx].ownerConfirmation = "ACCEPTED";
    MOCK_VISIT_PASSES[idx].confirmedDate = MOCK_VISIT_PASSES[idx].preferredDate;
    MOCK_VISIT_PASSES[idx].confirmedTime = MOCK_VISIT_PASSES[idx].preferredTime;
    if (ownerMessage) MOCK_VISIT_PASSES[idx].ownerMessage = ownerMessage;
    MOCK_VISIT_PASSES[idx].updatedAt = now;

    try {
      const supabase = createClient();
      await supabase.from("visits").update({ status: "confirmed", owner_notes: ownerMessage || null, updated_at: now }).eq("id", visitId);
    } catch {
      // Fallback
    }

    return this.sanitizeVisitPass(MOCK_VISIT_PASSES[idx], true);
  },

  // 6. Owner Action: Propose Alternative Time (Reschedule)
  async ownerProposeNewTime(visitId: string, date: string, time: string, ownerMessage?: string): Promise<VisitPass> {
    const authUser = await getCurrentUserSession();
    if (!validateScheduleDate(date)) {
      throw new Error("Proposed date must be today or a future date.");
    }

    const idx = MOCK_VISIT_PASSES.findIndex((v) => v.id === visitId);
    if (idx === -1) throw new Error("Visit request not found.");

    if (authUser && authUser.role !== "admin" && authUser.ownerId !== MOCK_VISIT_PASSES[idx].owner.id && authUser.id !== MOCK_VISIT_PASSES[idx].owner.id) {
      throw new Error("Unauthorized. Only the property owner can reschedule visit requests.");
    }

    const now = new Date().toISOString();
    MOCK_VISIT_PASSES[idx].status = "RESCHEDULED";
    MOCK_VISIT_PASSES[idx].ownerConfirmation = "PROPOSED_NEW_TIME";
    MOCK_VISIT_PASSES[idx].ownerProposedDate = date;
    MOCK_VISIT_PASSES[idx].ownerProposedTime = time;
    if (ownerMessage) MOCK_VISIT_PASSES[idx].ownerMessage = ownerMessage;
    MOCK_VISIT_PASSES[idx].updatedAt = now;

    try {
      const supabase = createClient();
      await supabase.from("visits").update({
        owner_proposed_date: date,
        owner_proposed_slot: time,
        owner_notes: ownerMessage || null,
        updated_at: now,
      }).eq("id", visitId);
    } catch {
      // Fallback
    }

    return this.sanitizeVisitPass(MOCK_VISIT_PASSES[idx], true);
  },

  async ownerProposeTime(visitId: string, date: string, time: string, ownerMessage?: string): Promise<VisitPass> {
    return this.ownerProposeNewTime(visitId, date, time, ownerMessage);
  },

  // 7. Student Action: Accept Rescheduled Visit Time
  async acceptRescheduledVisit(visitId: string): Promise<VisitPass> {
    const authUser = await getCurrentUserSession();
    const idx = MOCK_VISIT_PASSES.findIndex((v) => v.id === visitId);

    if (idx === -1) throw new Error("Visit request not found.");
    if (authUser && authUser.id !== MOCK_VISIT_PASSES[idx].user.id && authUser.role !== "admin") {
      throw new Error("Unauthorized. Only the requesting student can accept rescheduled visit times.");
    }

    const now = new Date().toISOString();
    const newDate = MOCK_VISIT_PASSES[idx].ownerProposedDate || MOCK_VISIT_PASSES[idx].preferredDate;
    const newTime = MOCK_VISIT_PASSES[idx].ownerProposedTime || MOCK_VISIT_PASSES[idx].preferredTime;

    MOCK_VISIT_PASSES[idx].preferredDate = newDate;
    MOCK_VISIT_PASSES[idx].preferredTime = newTime;
    MOCK_VISIT_PASSES[idx].confirmedDate = newDate;
    MOCK_VISIT_PASSES[idx].confirmedTime = newTime;
    MOCK_VISIT_PASSES[idx].status = "CONFIRMED";
    MOCK_VISIT_PASSES[idx].ownerConfirmation = "ACCEPTED";
    MOCK_VISIT_PASSES[idx].updatedAt = now;

    try {
      const supabase = createClient();
      await supabase.from("visits").update({
        visit_date: newDate,
        visit_slot: newTime,
        status: "confirmed",
        updated_at: now,
      }).eq("id", visitId);
    } catch {
      // Fallback
    }

    return this.sanitizeVisitPass(MOCK_VISIT_PASSES[idx], true);
  },

  // 8. Cancel Visit (Student or Owner)
  async cancelVisitPass(visitId: string, reason?: string): Promise<VisitPass> {
    const authUser = await getCurrentUserSession();
    const idx = MOCK_VISIT_PASSES.findIndex((v) => v.id === visitId);

    if (idx === -1) throw new Error("Visit request not found.");

    if (authUser) {
      const isTenant = authUser.id === MOCK_VISIT_PASSES[idx].user.id;
      const isOwner = authUser.ownerId === MOCK_VISIT_PASSES[idx].owner.id || authUser.id === MOCK_VISIT_PASSES[idx].owner.id;
      const isAdmin = authUser.role === "admin";

      if (!isTenant && !isOwner && !isAdmin) {
        throw new Error("Unauthorized to cancel this visit request.");
      }
    }

    const now = new Date().toISOString();
    MOCK_VISIT_PASSES[idx].status = "CANCELLED";
    if (reason) MOCK_VISIT_PASSES[idx].ownerMessage = `Cancelled: ${reason}`;
    MOCK_VISIT_PASSES[idx].updatedAt = now;

    try {
      const supabase = createClient();
      await supabase.from("visits").update({ status: "cancelled", owner_notes: reason || null, updated_at: now }).eq("id", visitId);
    } catch {
      // Fallback
    }

    return this.sanitizeVisitPass(MOCK_VISIT_PASSES[idx], true);
  },

  async studentCancelVisit(visitId: string, reason?: string): Promise<VisitPass> {
    return this.cancelVisitPass(visitId, reason);
  },

  async ownerRejectVisit(visitId: string, reason?: string): Promise<VisitPass> {
    return this.cancelVisitPass(visitId, reason);
  },

  async rescheduleVisitPass(visitId: string, newDate: string, newTime: string): Promise<VisitPass> {
    return this.ownerProposeNewTime(visitId, newDate, newTime);
  },

  // 9. Owner Action: Mark Completed
  async ownerMarkCompleted(visitId: string): Promise<VisitPass> {
    const authUser = await getCurrentUserSession();
    const idx = MOCK_VISIT_PASSES.findIndex((v) => v.id === visitId);

    if (idx === -1) throw new Error("Visit request not found.");

    if (authUser && authUser.role !== "admin" && authUser.ownerId !== MOCK_VISIT_PASSES[idx].owner.id && authUser.id !== MOCK_VISIT_PASSES[idx].owner.id) {
      throw new Error("Unauthorized. Only the property owner can mark visit requests as completed.");
    }

    const now = new Date().toISOString();
    MOCK_VISIT_PASSES[idx].status = "COMPLETED";
    MOCK_VISIT_PASSES[idx].updatedAt = now;

    try {
      const supabase = createClient();
      await supabase.from("visits").update({ status: "completed", updated_at: now }).eq("id", visitId);
    } catch {
      // Fallback
    }

    return this.sanitizeVisitPass(MOCK_VISIT_PASSES[idx], true);
  },

  async payVisitPass(visitId: string): Promise<VisitPass | null> {
    const pass = await this.getVisitPassById(visitId);
    if (!pass) return null;
    return this.sanitizeVisitPass(pass, true);
  },

  async createVisitPassRequest(input: {
    propertyId: string;
    preferredDate: string;
    preferredTime: string;
    notes?: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
    propertyTitle?: string;
    locality?: string;
    city?: string;
    coverImage?: string;
    address?: string;
  }): Promise<VisitPass> {
    return this.createVisitRequest({
      propertyId: input.propertyId,
      preferredDate: input.preferredDate,
      preferredTime: input.preferredTime,
      studentMessage: input.notes,
    });
  },
};

function mapDbStatusToUiStatus(status: string, ownerProposedDate?: string): VisitPassStatus {
  switch (status) {
    case "confirmed":
      return "CONFIRMED";
    case "completed":
      return "COMPLETED";
    case "cancelled":
      return "CANCELLED";
    case "pending":
    default:
      return ownerProposedDate ? "RESCHEDULED" : "REQUESTED";
  }
}
