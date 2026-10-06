import { createClient } from "@/lib/supabase/client";
import { Property, PropertySearchParams } from "@/types";
import { propertyUnlockService } from "./property-unlock.service";

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
];/**
 * Server-Side Access Control Sanitization Helper
 * Strictly strips exact address, coordinates, owner phone/whatsapp & visit instructions unless property is unlocked
 */
export function sanitizePropertyForAccess(raw: Property, isUnlocked: boolean): Property {
  if (isUnlocked) {
    return {
      ...raw,
      isUnlocked: true,
      unlockFee: 9,
    };
  }

  // SECURITY RULE: BEFORE PAYMENT, HIDE EXACT ADDRESS, EXACT LAT/LNG, OWNER CONTACT & VISIT INSTRUCTIONS SERVER-SIDE
  return {
    ...raw,
    isUnlocked: false,
    unlockFee: 9,
    location: {
      ...raw.location,
      address: `🔒 Exact Location Locked (${raw.location.locality}, ${raw.location.city})`,
      latitude: undefined,
      longitude: undefined,
    },
    ownerContact: undefined,
    rules: raw.rules.map(() => "🔒 House rule unlocked with ₹9 Property Access Pass"),
  };
}

export interface PropertyService {
  getAllProperties(): Promise<Property[]>;
  getFeaturedProperties(): Promise<Property[]>;
  getRecommendedProperties(): Promise<Property[]>;
  getPropertiesByCity(city: string): Promise<Property[]>;
  searchProperties(params: PropertySearchParams): Promise<{ properties: Property[]; total: number }>;
  getPropertyById(id: string, userId?: string): Promise<Property | null>;
  getPropertyBySlug(slug: string, userId?: string): Promise<Property | null>;
}

export const propertyService: PropertyService = {
  async getAllProperties(): Promise<Property[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("is_published", true);

      if (error || !data || data.length === 0) {
        return SEED_PROPERTIES.map((p) => sanitizePropertyForAccess(p, false));
      }

      return data.map((row) => sanitizePropertyForAccess(mapDbRowToProperty(row), false));
    } catch {
      return SEED_PROPERTIES.map((p) => sanitizePropertyForAccess(p, false));
    }
  },

  async getFeaturedProperties(): Promise<Property[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("is_published", true)
        .eq("is_featured", true)
        .limit(6);

      if (error || !data || data.length === 0) {
        return SEED_PROPERTIES.filter((p) => p.featured).map((p) => sanitizePropertyForAccess(p, false));
      }

      return data.map((row) => sanitizePropertyForAccess(mapDbRowToProperty(row), false));
    } catch {
      return SEED_PROPERTIES.filter((p) => p.featured).map((p) => sanitizePropertyForAccess(p, false));
    }
  },

  async getRecommendedProperties(): Promise<Property[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("is_published", true)
        .gte("rating", 4.8)
        .limit(6);

      if (error || !data || data.length === 0) {
        return SEED_PROPERTIES.sort((a, b) => b.rating - a.rating).map((p) => sanitizePropertyForAccess(p, false));
      }

      return data.map((row) => sanitizePropertyForAccess(mapDbRowToProperty(row), false));
    } catch {
      return SEED_PROPERTIES.sort((a, b) => b.rating - a.rating).map((p) => sanitizePropertyForAccess(p, false));
    }
  },

  async getPropertiesByCity(city: string): Promise<Property[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("is_published", true)
        .ilike("city", `%${city}%`);

      if (error || !data || data.length === 0) {
        return SEED_PROPERTIES.filter((p) => p.location.city.toLowerCase().includes(city.toLowerCase())).map((p) => sanitizePropertyForAccess(p, false));
      }

      return data.map((row) => sanitizePropertyForAccess(mapDbRowToProperty(row), false));
    } catch {
      return SEED_PROPERTIES.filter((p) => p.location.city.toLowerCase().includes(city.toLowerCase())).map((p) => sanitizePropertyForAccess(p, false));
    }
  },

  async searchProperties(params: PropertySearchParams): Promise<{ properties: Property[]; total: number }> {
    let result = [...SEED_PROPERTIES];

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

    const sanitized = result.map((p) => sanitizePropertyForAccess(p, false));
    return { properties: sanitized, total: sanitized.length };
  },

  async getPropertyById(id: string, userId?: string): Promise<Property | null> {
    const raw = SEED_PROPERTIES.find((p) => p.id === id) || SEED_PROPERTIES[0];
    const isUnlocked = await propertyUnlockService.hasUserUnlockedProperty(userId, raw.id);
    return sanitizePropertyForAccess(raw, isUnlocked);
  },

  async getPropertyBySlug(slug: string, userId?: string): Promise<Property | null> {
    const raw = SEED_PROPERTIES.find((p) => p.slug === slug) || SEED_PROPERTIES[0];
    const isUnlocked = await propertyUnlockService.hasUserUnlockedProperty(userId, raw.id);
    return sanitizePropertyForAccess(raw, isUnlocked);
  },
};

// Helper mapper for Supabase Database Rows
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbRowToProperty(row: any): Property {
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
      state: row.state || "",
      pincode: row.pincode || "",
      latitude: row.latitude,
      longitude: row.longitude,
    },
    amenities: row.amenities || ["Wi-Fi", "Food", "Housekeeping"],
    rules: ["Standard PG Rules"],
    images: row.images || ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"],
    coverImage: row.images?.[0] || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    featured: row.is_featured || false,
    startingPrice: Number(row.starting_price) || 8000,
    rating: Number(row.rating) || 4.8,
    reviewCount: row.review_count || 50,
    roomOptions: [],
    noticePeriodDays: row.notice_period_days || 30,
    lockInMonths: row.lock_in_months || 3,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
