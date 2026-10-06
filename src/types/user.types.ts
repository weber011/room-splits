export type UserRole = "tenant" | "owner" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  userId: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredCity?: string;
  preferredGenderPolicy?: "boys" | "girls" | "unisex";
  preferredSharing?: string[];
  foodPreference?: "veg" | "non-veg" | "both";
}
