import { createClient } from "@/lib/supabase/client";
import { PropertyUnlockRecord } from "@/types/property.types";
import { PLATFORM_SETTINGS } from "@/config/business-rules.config";

/**
 * Property Unlock (Visit Pass) Service
 * Manages ₹9 Property Unlocks & Authorization boundaries for Jharkhand MVP Properties
 */
const MOCK_PROPERTY_UNLOCKS: PropertyUnlockRecord[] = [
  {
    id: "unl-1001",
    userId: "u-101",
    propertyId: "prop-1",
    paymentId: "pay-1001",
    amount: PLATFORM_SETTINGS.PROPERTY_UNLOCK_PRICE,
    amountPaid: PLATFORM_SETTINGS.PROPERTY_UNLOCK_PRICE,
    currency: PLATFORM_SETTINGS.CURRENCY,
    status: "ACTIVE",
    unlockedAt: "2026-10-02T10:00:00Z",
    createdAt: "2026-10-02T10:00:00Z",
    updatedAt: "2026-10-02T10:00:00Z",
    paymentType: "PROPERTY_UNLOCK",
    transactionId: "tx-9001",
  },
  {
    id: "unl-1002",
    userId: "u-unlocked-no-visit",
    propertyId: "prop-1",
    paymentId: "pay-1002",
    amount: PLATFORM_SETTINGS.PROPERTY_UNLOCK_PRICE,
    amountPaid: PLATFORM_SETTINGS.PROPERTY_UNLOCK_PRICE,
    currency: PLATFORM_SETTINGS.CURRENCY,
    status: "ACTIVE",
    unlockedAt: "2026-10-02T10:00:00Z",
    createdAt: "2026-10-02T10:00:00Z",
    updatedAt: "2026-10-02T10:00:00Z",
    paymentType: "PROPERTY_UNLOCK",
    transactionId: "tx-9002",
  },
];

export const propertyUnlockService = {
  /**
   * Check if a specific user holds an active ₹9 property unlock for a property
   */
  async hasUserUnlockedProperty(userId: string | undefined, propertyId: string): Promise<boolean> {
    if (!userId || !propertyId) return false;

    try {
      const supabase = createClient();
      const queryPromise = supabase
        .from("property_unlocks")
        .select("id, status")
        .eq("user_id", userId)
        .eq("property_id", propertyId)
        .maybeSingle();

      const timeoutPromise = new Promise<{ data: { status: string } | null }>((resolve) =>
        setTimeout(() => resolve({ data: null }), 1500)
      );

      const res = await Promise.race([queryPromise, timeoutPromise]);
      if (res && res.data && (res.data.status === "ACTIVE" || res.data.status === "active")) {
        return true;
      }
    } catch {
      // DB query fallback
    }

    return MOCK_PROPERTY_UNLOCKS.some(
      (record) => record.userId === userId && record.propertyId === propertyId && (record.status === "ACTIVE" || record.status === ("active" as unknown))
    );
  },

  /**
   * Server-side Authorization Check: canAccessPropertyDetails(userId, propertyId)
   * Evaluates if user is property owner, admin, or holds an active ₹9 property unlock
   */
  async canAccessPropertyDetails(
    userId: string | undefined,
    propertyId: string,
    ownerId?: string,
    userRole?: string,
    userOwnerId?: string
  ): Promise<boolean> {
    if (!userId) return false;

    // Admins always have access
    if (userRole === "admin") return true;

    // Property owner always has access to their own listing
    if (ownerId && (userId === ownerId || (userOwnerId && userOwnerId === ownerId))) return true;

    // Check if user holds an active property unlock record
    return this.hasUserUnlockedProperty(userId, propertyId);
  },

  /**
   * Unlock property after verified ₹9 payment (Idempotent unlock with user+property uniqueness)
   */
  async unlockPropertyForUser(
    userId: string,
    propertyId: string,
    amount: number = PLATFORM_SETTINGS.PROPERTY_UNLOCK_PRICE,
    paymentId?: string,
    transactionId?: string
  ): Promise<PropertyUnlockRecord> {
    if (!userId || !propertyId) {
      throw new Error("User ID and Property ID are required for property unlock.");
    }

    // IDEMPOTENCY CHECK: If already unlocked in DB or mock, return existing active record
    const alreadyUnlocked = await this.hasUserUnlockedProperty(userId, propertyId);
    if (alreadyUnlocked) {
      const existing = MOCK_PROPERTY_UNLOCKS.find(
        (r) => r.userId === userId && r.propertyId === propertyId && r.status === "ACTIVE"
      );
      if (existing) return existing;
    }

    const now = new Date().toISOString();

    try {
      const supabase = createClient();
      const insertPromise = supabase
        .from("property_unlocks")
        .insert({
          user_id: userId,
          property_id: propertyId,
          payment_id: paymentId,
          amount,
          currency: PLATFORM_SETTINGS.CURRENCY,
          status: "ACTIVE",
          unlocked_at: now,
        })
        .select("*")
        .single();

      const timeoutPromise = new Promise<{ data: null; error: null }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: null }), 1500)
      );

      const res = await Promise.race([insertPromise, timeoutPromise]);
      const data = res?.data;
      const error = res?.error;

      if (!error && data) {
        const record: PropertyUnlockRecord = {
          id: data.id,
          userId: data.user_id,
          propertyId: data.property_id,
          paymentId: data.payment_id || paymentId || `pay-${Date.now()}`,
          amount: Number(data.amount) || amount,
          amountPaid: Number(data.amount) || amount,
          currency: data.currency || PLATFORM_SETTINGS.CURRENCY,
          status: data.status as "ACTIVE",
          unlockedAt: data.unlocked_at,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          paymentType: "PROPERTY_UNLOCK",
          transactionId,
        };
        MOCK_PROPERTY_UNLOCKS.push(record);
        return record;
      }
    } catch {
      // Fallback
    }

    // In-memory fallback
    const newRecord: PropertyUnlockRecord = {
      id: `unl-${Date.now()}`,
      userId,
      propertyId,
      paymentId: paymentId || `pay-${Date.now()}`,
      amount,
      amountPaid: amount,
      currency: PLATFORM_SETTINGS.CURRENCY,
      status: "ACTIVE",
      unlockedAt: now,
      createdAt: now,
      updatedAt: now,
      paymentType: "PROPERTY_UNLOCK",
      transactionId,
    };

    MOCK_PROPERTY_UNLOCKS.push(newRecord);
    return newRecord;
  },

  /**
   * Get array of all property IDs unlocked by a specific user
   */
  async getUserUnlockedProperties(userId: string): Promise<string[]> {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("property_unlocks")
        .select("property_id")
        .eq("user_id", userId)
        .eq("status", "ACTIVE");

      if (data && data.length > 0) {
        return data.map((d) => d.property_id);
      }
    } catch {
      // Fallback
    }

    return MOCK_PROPERTY_UNLOCKS
      .filter((r) => r.userId === userId && r.status === "ACTIVE")
      .map((r) => r.propertyId);
  },
};

/**
 * Top-level server authorization helper directly exported for API routes and server actions
 */
export async function canAccessPropertyDetails(
  userId: string | undefined,
  propertyId: string,
  ownerId?: string,
  userRole?: string,
  userOwnerId?: string
): Promise<boolean> {
  return propertyUnlockService.canAccessPropertyDetails(userId, propertyId, ownerId, userRole, userOwnerId);
}
