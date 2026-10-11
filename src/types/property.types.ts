export type PropertyCategory = "pg" | "hostel" | "coliving" | "flat";
export type GenderPolicy = "boys" | "girls" | "unisex";
export type SharingType = "single" | "double" | "triple" | "four_plus";

export interface PropertyLocation {
  address: string;
  locality: string;
  city: string;
  state: string;
  country?: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  nearbyLandmarks?: string[];
}

export interface RoomOption {
  id: string;
  sharingType: SharingType;
  monthlyRent: number;
  securityDeposit: number;
  availableBeds: number;
  totalBeds: number;
  hasAttachedBathroom: boolean;
  hasBalcony: boolean;
}

export interface PropertyContactInfo {
  ownerName?: string;
  phone?: string;
  whatsapp?: string;
  visitInstructions?: string;
}

export interface PropertyUnlockRecord {
  id: string;
  userId: string;
  propertyId: string;
  paymentId?: string;
  amount: number;
  amountPaid?: number; // Backward compatibility alias
  currency: string; // "INR"
  status: "ACTIVE" | "EXPIRED" | "REFUNDED";
  unlockedAt: string;
  createdAt: string;
  updatedAt: string;
  paymentType: "PROPERTY_UNLOCK" | "VISIT_PASS";
  transactionId?: string;
}

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  slug: string;
  description: string;
  category: PropertyCategory;
  genderPolicy: GenderPolicy;
  location: PropertyLocation;
  amenities: string[];
  rules: string[];
  images: string[];
  coverImage: string;
  featured: boolean;
  verified?: boolean;
  startingPrice: number;
  rating: number;
  reviewCount: number;
  roomOptions: RoomOption[];
  noticePeriodDays: number;
  lockInMonths: number;
  createdAt: string;
  updatedAt: string;
  // Access Control & Property Unlock (Visit Pass)
  isUnlocked?: boolean;
  unlockFee?: number;
  ownerContact?: PropertyContactInfo;
}
