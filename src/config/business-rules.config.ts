/**
 * Centralized RoomSplits Business Rules & Platform Settings
 * 
 * Jharkhand-first MVP business logic rules, location constraints,
 * ₹9 Property Unlock fee settings, and authorization boundaries.
 */

export const SUPPORTED_LOCATIONS = {
  COUNTRY: "India",
  COUNTRY_CODE: "IN",
  STATE: "Jharkhand",
  ALLOWED_STATES: ["Jharkhand"] as const,
  SUPPORTED_CITIES: [
    "Ranchi",
    "Hazaribagh",
    "Dhanbad",
    "Jamshedpur",
    "Bokaro",
    "Giridih",
    "Deoghar",
    "Ramgarh",
  ] as const,
};

export const PLATFORM_SETTINGS = {
  PROPERTY_UNLOCK_PRICE: 9,
  CURRENCY: "INR",
  CURRENCY_SYMBOL: "₹",
  UNLOCK_PRICE_LABEL: "₹9 Property Unlock",
  VISIT_PASS_LABEL: "₹9 Visit Pass",
  UNLOCK_BUTTON_TEXT: "Unlock for ₹9",
  LOCKED_LOCATION_LABEL: "🔒 Exact Location & Contact Details Locked",
  UNLOCKED_STATUS_TEXT: "✓ Property Access Pass Active (Unlocked for ₹9)",
  DEFAULT_LOCK_IN_MONTHS: 3,
  BOOKING_PLATFORM_FEE: 499,
} as const;

export type SupportedCity = (typeof SUPPORTED_LOCATIONS.SUPPORTED_CITIES)[number];

/**
 * Validates if a property location belongs to the supported operating region (Jharkhand, India)
 */
export function isLocationInSupportedRegion(location: {
  country?: string;
  state?: string;
  city?: string;
}): { valid: boolean; reason?: string } {
  if (location.country) {
    const countryNormalized = location.country.trim().toLowerCase();
    if (countryNormalized !== "india" && countryNormalized !== "in") {
      return {
        valid: false,
        reason: `RoomSplits currently only operates in India (provided: ${location.country}).`,
      };
    }
  }

  if (location.state) {
    const stateNormalized = location.state.trim().toLowerCase();
    if (stateNormalized !== "jharkhand") {
      return {
        valid: false,
        reason: `RoomSplits currently only operates in Jharkhand, India (provided state: ${location.state}).`,
      };
    }
  }

  if (location.city) {
    const cityNormalized = location.city.trim().toLowerCase();
    const isKnownCity = SUPPORTED_LOCATIONS.SUPPORTED_CITIES.some(
      (c) => c.toLowerCase() === cityNormalized
    );
    if (!isKnownCity && location.state?.trim().toLowerCase() !== "jharkhand") {
      return {
        valid: false,
        reason: `City '${location.city}' is outside supported Jharkhand locations.`,
      };
    }
  }

  return { valid: true };
}

/**
 * Publicly visible property fields before paying ₹9 Property Unlock
 */
export const PUBLIC_PROPERTY_FIELDS = [
  "id",
  "title",
  "slug",
  "description",
  "category",
  "genderPolicy",
  "amenities",
  "images",
  "coverImage",
  "featured",
  "verified",
  "startingPrice",
  "rating",
  "reviewCount",
  "roomOptions",
  "noticePeriodDays",
  "lockInMonths",
  "createdAt",
  "updatedAt",
  "isUnlocked",
  "unlockFee",
] as const;

/**
 * Protected property fields that require a valid ₹9 Property Unlock
 */
export const PROTECTED_PROPERTY_FIELDS = [
  "location.address",
  "location.latitude",
  "location.longitude",
  "ownerContact.phone",
  "ownerContact.whatsapp",
  "ownerContact.visitInstructions",
] as const;
