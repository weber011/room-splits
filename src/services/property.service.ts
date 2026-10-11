import { createClient } from "@/lib/supabase/client";
import { Property, PropertySearchParams, RoomOption, SharingType } from "@/types";
import { propertyUnlockService } from "./property-unlock.service";
import { PLATFORM_SETTINGS, isLocationInSupportedRegion } from "@/config/business-rules.config";

// Production Jharkhand MVP Seed Data
const SEED_PROPERTIES: Property[] = [
  {
    id: "prop-1",
    ownerId: "owner-1",
    title: "UrbanNest Executive Co-Living & PG",
    slug: "urbannest-executive-coliving",
    description: "Premium co-living space near Circular Road Lalpur with high-speed 5G Wi-Fi, 3x daily chef-cooked meals, gaming lounge, and bi-weekly housekeeping.",
    category: "coliving",
    genderPolicy: "unisex",
    location: {
      address: "Plot 42, Circular Road, Opposite Nucleus Mall",
      locality: "Lalpur",
      city: "Ranchi",
      state: "Jharkhand",
      country: "India",
      pincode: "834001",
      latitude: 23.3698,
      longitude: 85.3314,
      nearbyLandmarks: ["Nucleus Mall", "Women's College Lalpur", "Plaza Cinema"],
    },
    amenities: ["High-Speed Wi-Fi", "3x Daily Meals", "AC Rooms", "Gym Access", "24/7 Security & CCTV", "Power Backup"],
    rules: ["No smoking inside rooms", "Visitors allowed in lounge till 10 PM", "Gate closes at 11:00 PM"],
    images: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
    ],
    coverImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    featured: true,
    verified: true,
    startingPrice: 8500,
    rating: 4.9,
    reviewCount: 128,
    roomOptions: [
      { id: "r-1", sharingType: "single", monthlyRent: 12000, securityDeposit: 24000, availableBeds: 1, totalBeds: 2, hasAttachedBathroom: true, hasBalcony: true },
      { id: "r-2", sharingType: "double", monthlyRent: 8500, securityDeposit: 17000, availableBeds: 3, totalBeds: 6, hasAttachedBathroom: true, hasBalcony: false },
    ],
    noticePeriodDays: 30,
    lockInMonths: 3,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ownerContact: {
      ownerName: "Rajesh Sharma",
      phone: "+91 94311 00112",
      whatsapp: "+91 94311 00112",
      visitInstructions: "Report to front reception on Circular Road, show ₹9 Visit Pass confirmation on phone.",
    },
  },
  {
    id: "prop-2",
    ownerId: "owner-2",
    title: "Stanza Heights Luxury PG for Men",
    slug: "stanza-heights-men-pg",
    description: "Luxury student & professional PG near Morabadi Ground with 24/7 power backup, attached bathrooms, and fingerprint security doors.",
    category: "pg",
    genderPolicy: "boys",
    location: {
      address: "Lane 3, Near Oxygen Park, Kanke Road",
      locality: "Morabadi",
      city: "Ranchi",
      state: "Jharkhand",
      country: "India",
      pincode: "834008",
      latitude: 23.3852,
      longitude: 85.3245,
      nearbyLandmarks: ["Morabadi Stadium", "Oxygen Park", "Kanke Dam"],
    },
    amenities: ["Wi-Fi", "Daily Housekeeping", "Attached Bath", "Power Backup", "Laundry Service"],
    rules: ["Boys only", "No alcohol or smoking on premises"],
    images: [
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    ],
    coverImage: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
    featured: true,
    verified: true,
    startingPrice: 7500,
    rating: 4.8,
    reviewCount: 94,
    roomOptions: [
      { id: "r-3", sharingType: "double", monthlyRent: 7500, securityDeposit: 15000, availableBeds: 2, totalBeds: 4, hasAttachedBathroom: true, hasBalcony: false },
      { id: "r-4", sharingType: "triple", monthlyRent: 6000, securityDeposit: 12000, availableBeds: 4, totalBeds: 8, hasAttachedBathroom: false, hasBalcony: false },
    ],
    noticePeriodDays: 30,
    lockInMonths: 3,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ownerContact: {
      ownerName: "Suresh Verma",
      phone: "+91 94311 00223",
      whatsapp: "+91 94311 00223",
      visitInstructions: "Call warden upon arrival at Oxygen Park main gate.",
    },
  },
  {
    id: "prop-3",
    ownerId: "owner-3",
    title: "Greenwood Women Residency & Hostel",
    slug: "greenwood-residency-women",
    description: "Secure, home-like PG for female college students and working professionals near Bistupur Market.",
    category: "hostel",
    genderPolicy: "girls",
    location: {
      address: "Holdings 14, Inner Circle Road, Bistupur",
      locality: "Bistupur",
      city: "Jamshedpur",
      state: "Jharkhand",
      country: "India",
      pincode: "831001",
      latitude: 22.7926,
      longitude: 86.1843,
      nearbyLandmarks: ["Bistupur Market", "Regal Ground", "Tata Main Hospital"],
    },
    amenities: ["24/7 Security & CCTV", "Homely Food", "Laundry", "Study Desk", "Air Conditioning"],
    rules: ["Girls only", "Female biometric security guard on duty"],
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    ],
    coverImage: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    featured: true,
    verified: true,
    startingPrice: 6800,
    rating: 4.9,
    reviewCount: 156,
    roomOptions: [
      { id: "r-5", sharingType: "double", monthlyRent: 6800, securityDeposit: 13600, availableBeds: 2, totalBeds: 4, hasAttachedBathroom: true, hasBalcony: true },
    ],
    noticePeriodDays: 30,
    lockInMonths: 2,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ownerContact: {
      ownerName: "Anita Devi",
      phone: "+91 94311 00334",
      whatsapp: "+91 94311 00334",
      visitInstructions: "Visiting hours between 10 AM to 6 PM with valid ID.",
    },
  },
  {
    id: "prop-4",
    ownerId: "owner-4",
    title: "Chotanagpur Executive PG & Co-Living",
    slug: "chotanagpur-executive-pg",
    description: "Modern co-living space located near Steel Gate Dhanbad with food, Wi-Fi, and power backup.",
    category: "coliving",
    genderPolicy: "unisex",
    location: {
      address: "Main Road, Near Steel Gate",
      locality: "Saraidhela",
      city: "Dhanbad",
      state: "Jharkhand",
      country: "India",
      pincode: "828127",
      latitude: 23.8123,
      longitude: 86.4389,
      nearbyLandmarks: ["Steel Gate", "IIT ISM Dhanbad", "Saraidhela Market"],
    },
    amenities: ["High-Speed Wi-Fi", "AC Rooms", "Power Backup", "Gym Access"],
    rules: ["Cleanliness mandatory in shared lounge"],
    images: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    ],
    coverImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    featured: true,
    verified: true,
    startingPrice: 5500,
    rating: 4.7,
    reviewCount: 42,
    roomOptions: [
      { id: "r-6", sharingType: "double", monthlyRent: 5500, securityDeposit: 11000, availableBeds: 2, totalBeds: 4, hasAttachedBathroom: true, hasBalcony: false },
    ],
    noticePeriodDays: 30,
    lockInMonths: 3,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ownerContact: {
      ownerName: "Manoj Kumar",
      phone: "+91 94311 00445",
      whatsapp: "+91 94311 00445",
      visitInstructions: "Located next to Steel Gate SBI ATM.",
    },
  },
];

/**
 * Server-Side Access Control Sanitization Helper
 * Strictly strips exact address, coordinates, owner phone/whatsapp & visit instructions unless property is unlocked
 */
export function sanitizePropertyForAccess(raw: Property, isUnlocked: boolean): Property {
  if (isUnlocked) {
    return {
      ...raw,
      isUnlocked: true,
      unlockFee: PLATFORM_SETTINGS.PROPERTY_UNLOCK_PRICE,
    };
  }

  // SECURITY RULE: BEFORE PAYMENT, HIDE EXACT ADDRESS, EXACT LAT/LNG, OWNER CONTACT & VISIT INSTRUCTIONS SERVER-SIDE
  return {
    ...raw,
    isUnlocked: false,
    unlockFee: PLATFORM_SETTINGS.PROPERTY_UNLOCK_PRICE,
    location: {
      ...raw.location,
      address: `${PLATFORM_SETTINGS.LOCKED_LOCATION_LABEL} (${raw.location.locality}, ${raw.location.city})`,
      latitude: undefined,
      longitude: undefined,
    },
    ownerContact: undefined,
    rules: raw.rules.map(() => `🔒 House rule unlocked with ${PLATFORM_SETTINGS.UNLOCK_PRICE_LABEL}`),
  };
}

export interface PropertyService {
  getAllProperties(): Promise<Property[]>;
  getFeaturedProperties(): Promise<Property[]>;
  getRecommendedProperties(): Promise<Property[]>;
  getPropertiesByCity(city: string): Promise<Property[]>;
  searchProperties(params: PropertySearchParams): Promise<{ properties: Property[]; total: number }>;
  getPropertyById(id: string, userId?: string, userRole?: string, userOwnerId?: string): Promise<Property | null>;
  getPropertyBySlug(slug: string, userId?: string, userRole?: string, userOwnerId?: string): Promise<Property | null>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbRowToFullProperty(row: any): Property {
  const roomOptions: RoomOption[] = Array.isArray(row.rooms)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? row.rooms.map((rm: any) => ({
        id: rm.id,
        sharingType: rm.sharing_type as SharingType,
        monthlyRent: Number(rm.monthly_rent),
        securityDeposit: Number(rm.security_deposit),
        totalBeds: rm.total_beds,
        availableBeds: rm.available_beds,
        hasAttachedBathroom: rm.has_attached_bathroom,
        hasBalcony: rm.has_balcony,
      }))
    : [];

  const images: string[] = Array.isArray(row.property_images)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? row.property_images.map((img: any) => img.image_url)
    : ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"];

  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    category: row.category,
    genderPolicy: row.gender_policy,
    location: {
      address: row.address_line || "",
      locality: row.locality || "",
      city: row.city || "",
      state: row.state || "Jharkhand",
      country: row.country || "India",
      pincode: row.pincode || "",
      latitude: row.latitude ? Number(row.latitude) : undefined,
      longitude: row.longitude ? Number(row.longitude) : undefined,
    },
    amenities: ["Wi-Fi", "3x Daily Meals", "AC Rooms", "24/7 Security", "Power Backup"],
    rules: ["Standard House Rules"],
    images: images,
    coverImage: images[0] || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    featured: row.is_featured ?? false,
    verified: row.verification_status === "VERIFIED",
    startingPrice: Number(row.starting_price) || 8000,
    rating: Number(row.rating) || 4.8,
    reviewCount: row.review_count ?? 50,
    roomOptions,
    noticePeriodDays: row.notice_period_days ?? 30,
    lockInMonths: row.lock_in_months ?? 3,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ownerContact: {
      ownerName: "Property Host",
      phone: "+91 94311 00999",
      whatsapp: "+91 94311 00999",
      visitInstructions: "Show your ₹9 Visit Pass confirmation at the reception.",
    },
  };
}

export const propertyService: PropertyService = {
  async getAllProperties(): Promise<Property[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          rooms (*),
          property_images (*),
          property_videos (*)
        `)
        .eq("is_published", true)
        .eq("verification_status", "VERIFIED")
        .eq("state", "Jharkhand")
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        return SEED_PROPERTIES.map((p) => sanitizePropertyForAccess(p, false));
      }

      return data.map((row) => sanitizePropertyForAccess(mapDbRowToFullProperty(row), false));
    } catch {
      return SEED_PROPERTIES.map((p) => sanitizePropertyForAccess(p, false));
    }
  },

  async getFeaturedProperties(): Promise<Property[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          rooms (*),
          property_images (*),
          property_videos (*)
        `)
        .eq("is_published", true)
        .eq("verification_status", "VERIFIED")
        .eq("is_featured", true)
        .limit(6);

      if (error || !data || data.length === 0) {
        return SEED_PROPERTIES.filter((p) => p.featured).map((p) => sanitizePropertyForAccess(p, false));
      }

      return data.map((row) => sanitizePropertyForAccess(mapDbRowToFullProperty(row), false));
    } catch {
      return SEED_PROPERTIES.filter((p) => p.featured).map((p) => sanitizePropertyForAccess(p, false));
    }
  },

  async getRecommendedProperties(): Promise<Property[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          rooms (*),
          property_images (*),
          property_videos (*)
        `)
        .eq("is_published", true)
        .eq("verification_status", "VERIFIED")
        .gte("rating", 4.8)
        .limit(6);

      if (error || !data || data.length === 0) {
        return SEED_PROPERTIES.sort((a, b) => b.rating - a.rating).map((p) => sanitizePropertyForAccess(p, false));
      }

      return data.map((row) => sanitizePropertyForAccess(mapDbRowToFullProperty(row), false));
    } catch {
      return SEED_PROPERTIES.sort((a, b) => b.rating - a.rating).map((p) => sanitizePropertyForAccess(p, false));
    }
  },

  async getPropertiesByCity(city: string): Promise<Property[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          rooms (*),
          property_images (*),
          property_videos (*)
        `)
        .eq("is_published", true)
        .eq("verification_status", "VERIFIED")
        .ilike("city", `%${city}%`);

      if (error || !data || data.length === 0) {
        return SEED_PROPERTIES.filter((p) => p.location.city.toLowerCase().includes(city.toLowerCase())).map((p) => sanitizePropertyForAccess(p, false));
      }

      return data.map((row) => sanitizePropertyForAccess(mapDbRowToFullProperty(row), false));
    } catch {
      return SEED_PROPERTIES.filter((p) => p.location.city.toLowerCase().includes(city.toLowerCase())).map((p) => sanitizePropertyForAccess(p, false));
    }
  },

  async searchProperties(params: PropertySearchParams): Promise<{ properties: Property[]; total: number }> {
    const all = await this.getAllProperties();
    let result = all.filter((p) => isLocationInSupportedRegion(p.location).valid);

    if (params.city) {
      result = result.filter((p) => p.location.city.toLowerCase().includes(params.city!.toLowerCase()));
    }

    if (params.query) {
      const q = params.query.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.location.locality.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (params.category && params.category !== ("all" as unknown)) {
      result = result.filter((p) => p.category === params.category);
    }

    if (params.genderPolicy && params.genderPolicy !== ("all" as unknown)) {
      result = result.filter((p) => p.genderPolicy === params.genderPolicy);
    }

    if (params.maxPrice) {
      result = result.filter((p) => p.startingPrice <= params.maxPrice!);
    }

    if (params.sortBy) {
      if (params.sortBy === "price_low_to_high") {
        result.sort((a, b) => a.startingPrice - b.startingPrice);
      } else if (params.sortBy === "price_high_to_low") {
        result.sort((a, b) => b.startingPrice - a.startingPrice);
      } else if (params.sortBy === "rating") {
        result.sort((a, b) => b.rating - a.rating);
      }
    }

    return { properties: result, total: result.length };
  },

  async getPropertyById(
    id: string,
    userId?: string,
    userRole?: string,
    userOwnerId?: string
  ): Promise<Property | null> {
    try {
      const supabase = createClient();
      
      const queryPromise = supabase
        .from("properties")
        .select(`
          *,
          rooms (*),
          property_images (*),
          property_videos (*)
        `)
        .eq("id", id)
        .maybeSingle();

      const timeoutPromise = new Promise<{ data: null; error: null }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: null }), 1500)
      );

      const res = await Promise.race([queryPromise, timeoutPromise]);
      const data = res?.data;
      const error = res?.error;

      if (error || !data) {
        const seed = SEED_PROPERTIES.find((p) => p.id === id);
        if (!seed) return null;
        const isUnlocked = await propertyUnlockService.canAccessPropertyDetails(userId, seed.id, seed.ownerId, userRole, userOwnerId);
        return sanitizePropertyForAccess(seed, isUnlocked);
      }

      // Check if non-published or unverified property is being accessed by non-owner/non-admin
      const isAuthorizedOwnerOrAdmin = (userRole === "admin") || (userOwnerId && userOwnerId === data.owner_id);
      if (!isAuthorizedOwnerOrAdmin && (!data.is_published || data.verification_status !== "VERIFIED")) {
        return null;
      }

      const isUnlocked = await propertyUnlockService.canAccessPropertyDetails(userId, data.id, data.owner_id, userRole, userOwnerId);
      const fullProperty = mapDbRowToFullProperty(data);
      return sanitizePropertyForAccess(fullProperty, isUnlocked);
    } catch {
      const seed = SEED_PROPERTIES.find((p) => p.id === id);
      if (!seed) return null;
      const isUnlocked = await propertyUnlockService.canAccessPropertyDetails(userId, seed.id, seed.ownerId, userRole, userOwnerId);
      return sanitizePropertyForAccess(seed, isUnlocked);
    }
  },

  async getPropertyBySlug(slug: string, userId?: string, userRole?: string, userOwnerId?: string): Promise<Property | null> {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("properties")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      if (data) {
        return this.getPropertyById(data.id, userId, userRole, userOwnerId);
      }
    } catch {
      // Fallback
    }

    const seed = SEED_PROPERTIES.find((p) => p.slug === slug);
    if (!seed) return null;
    const isUnlocked = await propertyUnlockService.canAccessPropertyDetails(userId, seed.id, seed.ownerId, userRole, userOwnerId);
    return sanitizePropertyForAccess(seed, isUnlocked);
  },
};
