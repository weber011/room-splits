import { PropertyUnlockRecord } from "@/types/property.types";

/**
 * Property Unlock (Visit Pass) Service
 * Manages ₹9 Property Unlocks & Access Control for Jharkhand MVP Properties
 */
const MOCK_PROPERTY_UNLOCKS: PropertyUnlockRecord[] = [
  {
    id: "unl-1001",
    userId: "u-101",
    propertyId: "prop-1",
    unlockedAt: "2026-10-02T10:00:00Z",
    amountPaid: 9,
    paymentType: "PROPERTY_UNLOCK",
    status: "ACTIVE",
    transactionId: "tx-9001",
  },
];

export const propertyUnlockService = {
  /**
   * Check if a specific user has unlocked a property
   */
  async hasUserUnlockedProperty(userId: string | undefined, propertyId: string): Promise<boolean> {
    if (!userId) return false;
    return MOCK_PROPERTY_UNLOCKS.some(
      (record) => record.userId === userId && record.propertyId === propertyId && record.status === "ACTIVE"
    );
  },

  /**
   * Unlock property after verified ₹9 payment (Idempotent lock)
   */
  async unlockPropertyForUser(
    userId: string,
    propertyId: string,
    amountPaid: number = 9,
    transactionId?: string
  ): Promise<PropertyUnlockRecord> {
    // IDEMPOTENCY CHECK: If already unlocked, return existing record without duplicate billing
    const existing = MOCK_PROPERTY_UNLOCKS.find(
      (r) => r.userId === userId && r.propertyId === propertyId && r.status === "ACTIVE"
    );
    if (existing) {
      return existing;
    }

    const newRecord: PropertyUnlockRecord = {
      id: `unl-${Date.now()}`,
      userId,
      propertyId,
      unlockedAt: new Date().toISOString(),
      amountPaid,
      paymentType: "PROPERTY_UNLOCK",
      status: "ACTIVE",
      transactionId,
    };

    MOCK_PROPERTY_UNLOCKS.push(newRecord);
    return newRecord;
  },

  /**
   * Get array of all property IDs unlocked by a specific user
   */
  async getUserUnlockedProperties(userId: string): Promise<string[]> {
    return MOCK_PROPERTY_UNLOCKS
      .filter((r) => r.userId === userId && r.status === "ACTIVE")
      .map((r) => r.propertyId);
  },
};
