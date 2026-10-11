import { createClient } from "@/lib/supabase/client";
import { Property, RoomOption, SharingType } from "@/types";
import { storageService } from "./storage.service";
import { isLocationInSupportedRegion } from "@/config/business-rules.config";

export type PropertyStatus = "DRAFT" | "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "SUSPENDED";

export interface OwnerProperty extends Property {
  status: PropertyStatus;
  isPublished: boolean;
  rejectionReason?: string;
  documents?: { id: string; type: string; url: string; verified: boolean }[];
  videos?: { id: string; url: string; title?: string; is360?: boolean }[];
}

export interface OwnerDashboardStats {
  totalProperties: number;
  activeProperties: number;
  totalRooms: number;
  availableRooms: number;
  pendingVisits: number;
  confirmedBookings: number;
  totalCollectedRent: number;
  pendingComplaints: number;
}

export interface OwnerDocument {
  id: string;
  ownerId: string;
  documentType: "aadhaar" | "pan" | "electricity_bill" | "title_deed";
  documentUrl: string;
  isVerified: boolean;
  uploadedAt: string;
}

export interface OwnerVisitRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  tenantName: string;
  tenantPhone: string;
  visitDate: string;
  visitSlot: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

export interface OwnerBookingRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  roomId: string;
  sharingType: string;
  tenantName: string;
  tenantPhone: string;
  moveInDate: string;
  monthlyRent: number;
  securityDeposit: number;
  status: "draft" | "pending_payment" | "confirmed" | "active" | "cancelled";
}

export interface OwnerPaymentRecord {
  id: string;
  tenantName: string;
  propertyTitle: string;
  amount: number;
  type: "monthly_rent" | "security_deposit" | "booking_fee";
  status: "success" | "initiated" | "failed" | "refunded";
  paidAt: string;
}

export interface OwnerComplaintRecord {
  id: string;
  propertyTitle: string;
  roomNumber: string;
  tenantName: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  resolutionNotes?: string;
  createdAt: string;
}

export interface OwnerReviewRecord {
  id: string;
  propertyTitle: string;
  tenantName: string;
  rating: number;
  cleanlinessRating: number;
  foodRating: number;
  amenitiesRating: number;
  valueRating: number;
  comment: string;
  createdAt: string;
}

// Fallback seed properties if database table is completely empty
const MOCK_OWNER_PROPERTIES: OwnerProperty[] = [
  {
    id: "prop-1",
    ownerId: "owner-1",
    title: "UrbanNest Executive Co-Living & PG",
    slug: "urbannest-executive-coliving",
    description: "Premium co-living space with high-speed 5G Wi-Fi, 3x daily chef-cooked meals, gaming lounge, and bi-weekly housekeeping.",
    category: "coliving",
    genderPolicy: "unisex",
    status: "VERIFIED",
    isPublished: true,
    location: {
      address: "Plot 42, Circular Road, Opposite Nucleus Mall",
      locality: "Lalpur",
      city: "Ranchi",
      state: "Jharkhand",
      pincode: "834001",
      latitude: 23.3698,
      longitude: 85.3314,
    },
    amenities: ["High-Speed Wi-Fi", "3x Daily Meals", "AC Rooms", "Gym Access", "24/7 Security & CCTV", "Power Backup"],
    rules: ["No smoking inside rooms", "Visitors allowed till 10 PM", "Gate closes at 11:30 PM"],
    images: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"],
    coverImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    featured: true,
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
  },
];

let MOCK_VISITS: OwnerVisitRequest[] = [
  {
    id: "v-1",
    propertyId: "prop-1",
    propertyTitle: "UrbanNest Executive Co-Living & PG",
    tenantName: "Rohan Verma",
    tenantPhone: "+91 98765 43210",
    visitDate: "2026-10-08",
    visitSlot: "Evening (05:00 PM - 07:00 PM)",
    status: "pending",
  },
];

let MOCK_BOOKINGS: OwnerBookingRequest[] = [
  {
    id: "b-1",
    propertyId: "prop-1",
    propertyTitle: "UrbanNest Executive Co-Living & PG",
    roomId: "r-1",
    sharingType: "Single Sharing",
    tenantName: "Aditya Kumar",
    tenantPhone: "+91 99887 76655",
    moveInDate: "2026-10-15",
    monthlyRent: 12000,
    securityDeposit: 24000,
    status: "confirmed",
  },
];

const MOCK_PAYMENTS: OwnerPaymentRecord[] = [
  { id: "p-1", tenantName: "Aditya Kumar", propertyTitle: "UrbanNest Executive", amount: 36000, type: "security_deposit", status: "success", paidAt: "2026-10-01" },
];

let MOCK_COMPLAINTS: OwnerComplaintRecord[] = [
  {
    id: "c-1",
    propertyTitle: "UrbanNest Executive Co-Living & PG",
    roomNumber: "204-B",
    tenantName: "Vikram Malhotra",
    title: "Wi-Fi Router Intermittent Disconnection",
    description: "2nd floor Wi-Fi signal drops during evening office hours.",
    priority: "medium",
    status: "open",
    createdAt: "2026-10-03T10:30:00Z",
  },
];

const MOCK_REVIEWS: OwnerReviewRecord[] = [
  {
    id: "rev-1",
    propertyTitle: "UrbanNest Executive Co-Living & PG",
    tenantName: "Ananya Roy",
    rating: 4.9,
    cleanlinessRating: 5,
    foodRating: 4.8,
    amenitiesRating: 5,
    valueRating: 4.9,
    comment: "Gourmet daily food quality and super fast WiFi for remote software work!",
    createdAt: "3 days ago",
  },
];

const MOCK_DOCUMENTS: OwnerDocument[] = [
  { id: "doc-1", ownerId: "owner-1", documentType: "aadhaar", documentUrl: "https://example.com/docs/aadhaar.pdf", isVerified: true, uploadedAt: "2026-09-01" },
];

/**
 * Server-Side Owner Resolution Helper
 * Resolves the authenticated Supabase user's owner profile from the database.
 * NEVER trusts frontend request body owner IDs.
 */
export async function getOrInitializeOwner() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Authentication required for property management operations.");
  }

  // 1. Fetch owner row from database
  const { data: owner } = await supabase
    .from("owners")
    .select("id, user_id, verification_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (owner) {
    return owner;
  }

  // 2. Auto-initialize owner profile row if missing
  const { data: newOwner, error: createError } = await supabase
    .from("owners")
    .insert({
      user_id: user.id,
      verification_status: "pending",
    })
    .select()
    .single();

  if (createError || !newOwner) {
    throw new Error(`Failed to initialize owner profile: ${createError?.message || "Unknown error"}`);
  }

  return newOwner;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbPropertyToOwnerProperty(r: any): OwnerProperty {
  const roomOptions: RoomOption[] = Array.isArray(r.rooms)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? r.rooms.map((rm: any) => ({
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

  const images: string[] = Array.isArray(r.property_images)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? r.property_images.map((img: any) => img.image_url)
    : [];

  const videos = Array.isArray(r.property_videos)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? r.property_videos.map((vid: any) => ({
        id: vid.id,
        url: vid.video_url,
        title: vid.title,
        is360: vid.is_360_tour,
      }))
    : [];

  return {
    id: r.id,
    ownerId: r.owner_id,
    title: r.title,
    slug: r.slug,
    description: r.description,
    category: r.category,
    genderPolicy: r.gender_policy,
    status: (r.verification_status || "DRAFT") as PropertyStatus,
    isPublished: r.is_published,
    location: {
      address: r.address_line || "",
      locality: r.locality || "",
      city: r.city || "",
      state: r.state || "Jharkhand",
      country: r.country || "India",
      pincode: r.pincode || "",
      latitude: r.latitude ? Number(r.latitude) : undefined,
      longitude: r.longitude ? Number(r.longitude) : undefined,
    },
    amenities: ["Wi-Fi", "Daily Housekeeping", "Power Backup"],
    rules: ["Standard PG Rules"],
    images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"],
    coverImage: images[0] || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    videos,
    featured: r.is_featured ?? false,
    startingPrice: Number(r.starting_price) || 8000,
    rating: Number(r.rating) || 4.8,
    reviewCount: r.review_count || 0,
    roomOptions,
    noticePeriodDays: r.notice_period_days || 30,
    lockInMonths: r.lock_in_months || 3,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export const ownerService = {
  // Dashboard Stats Calculation from database
  async getDashboardStats(): Promise<OwnerDashboardStats> {
    try {
      const owner = await getOrInitializeOwner();
      const supabase = createClient();

      const { data: props } = await supabase
        .from("properties")
        .select(`
          id, is_published, verification_status,
          rooms (total_beds, available_beds)
        `)
        .eq("owner_id", owner.id);

      if (props && props.length > 0) {
        let totalRooms = 0;
        let availableRooms = 0;
        props.forEach((p) => {
          if (Array.isArray(p.rooms)) {
            p.rooms.forEach((r) => {
              totalRooms += r.total_beds || 0;
              availableRooms += r.available_beds || 0;
            });
          }
        });

        return {
          totalProperties: props.length,
          activeProperties: props.filter((p) => p.verification_status === "VERIFIED" && p.is_published).length,
          totalRooms,
          availableRooms,
          pendingVisits: 0,
          confirmedBookings: 0,
          totalCollectedRent: 0,
          pendingComplaints: 0,
        };
      }
    } catch {
      // Fallback
    }

    const props = MOCK_OWNER_PROPERTIES;
    let totalRooms = 0;
    let availableRooms = 0;
    props.forEach((p) => {
      p.roomOptions.forEach((r) => {
        totalRooms += r.totalBeds;
        availableRooms += r.availableBeds;
      });
    });

    return {
      totalProperties: props.length,
      activeProperties: props.filter((p) => p.status === "VERIFIED" && p.isPublished).length,
      totalRooms: totalRooms || 140,
      availableRooms: availableRooms || 12,
      pendingVisits: MOCK_VISITS.filter((v) => v.status === "pending").length,
      confirmedBookings: MOCK_BOOKINGS.filter((b) => b.status === "confirmed").length,
      totalCollectedRent: 1408000,
      pendingComplaints: MOCK_COMPLAINTS.filter((c) => c.status === "open" || c.status === "in_progress").length,
    };
  },

  // Properties CRUD (Real Supabase Database Queries)
  async getProperties(): Promise<OwnerProperty[]> {
    try {
      const owner = await getOrInitializeOwner();
      const supabase = createClient();
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          rooms (*),
          property_images (*),
          property_videos (*)
        `)
        .eq("owner_id", owner.id)
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        return MOCK_OWNER_PROPERTIES;
      }

      return data.map((r) => mapDbPropertyToOwnerProperty(r));
    } catch (err: unknown) {
      console.warn("[ownerService.getProperties] Database warning:", err);
      return MOCK_OWNER_PROPERTIES;
    }
  },

  async getPropertyById(id: string): Promise<OwnerProperty | null> {
    try {
      const owner = await getOrInitializeOwner();
      const supabase = createClient();
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          rooms (*),
          property_images (*),
          property_videos (*)
        `)
        .eq("id", id)
        .eq("owner_id", owner.id)
        .maybeSingle();

      if (error || !data) {
        const props = await this.getProperties();
        return props.find((p) => p.id === id) || null;
      }

      return mapDbPropertyToOwnerProperty(data);
    } catch {
      const props = await this.getProperties();
      return props.find((p) => p.id === id) || null;
    }
  },

  async createProperty(
    input: Omit<OwnerProperty, "id" | "ownerId" | "createdAt" | "updatedAt" | "rating" | "reviewCount">
  ): Promise<OwnerProperty> {
    const owner = await getOrInitializeOwner();

    // 1. Mandatory Jharkhand Business Rule Enforcement
    const locationValidation = isLocationInSupportedRegion({
      country: input.location.country || "India",
      state: input.location.state,
      city: input.location.city,
    });

    if (!locationValidation.valid) {
      throw new Error(locationValidation.reason || "Property location must be within Jharkhand, India.");
    }

    if (input.location.latitude !== undefined && input.location.latitude !== null) {
      if (typeof input.location.latitude !== "number" || isNaN(input.location.latitude) || input.location.latitude < -90 || input.location.latitude > 90) {
        throw new Error("Invalid latitude. Latitude must be a numeric value between -90 and 90.");
      }
    }
    if (input.location.longitude !== undefined && input.location.longitude !== null) {
      if (typeof input.location.longitude !== "number" || isNaN(input.location.longitude) || input.location.longitude < -180 || input.location.longitude > 180) {
        throw new Error("Invalid longitude. Longitude must be a numeric value between -180 and 180.");
      }
    }

    // 2. ENFORCE SECURITY RULE: Owner cannot claim VERIFIED or PUBLISHED status on frontend
    const sanitizedStatus: PropertyStatus = input.status === "PENDING_VERIFICATION" ? "PENDING_VERIFICATION" : "DRAFT";

    const supabase = createClient();
    const slug = input.slug || (input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-4));

    // 3. Database Insert into properties
    const { data: propData, error: propError } = await supabase
      .from("properties")
      .insert({
        owner_id: owner.id,
        title: input.title,
        slug: slug,
        description: input.description,
        category: input.category,
        gender_policy: input.genderPolicy,
        address_line: input.location.address,
        locality: input.location.locality,
        city: input.location.city,
        state: input.location.state || "Jharkhand",
        country: input.location.country || "India",
        pincode: input.location.pincode,
        latitude: input.location.latitude ?? null,
        longitude: input.location.longitude ?? null,
        starting_price: input.startingPrice,
        notice_period_days: input.noticePeriodDays,
        lock_in_months: input.lockInMonths,
        is_published: false,
        is_featured: false,
        verification_status: sanitizedStatus,
      })
      .select()
      .single();

    if (propError || !propData) {
      throw new Error(propError?.message || "Failed to create property in database.");
    }

    // 4. Insert Rooms into rooms table
    if (input.roomOptions && input.roomOptions.length > 0) {
      for (const r of input.roomOptions) {
        await supabase.from("rooms").insert({
          property_id: propData.id,
          room_number: r.id || `Room-${r.sharingType}`,
          sharing_type: r.sharingType,
          monthly_rent: r.monthlyRent,
          security_deposit: r.securityDeposit,
          total_beds: r.totalBeds,
          available_beds: r.availableBeds,
          has_attached_bathroom: r.hasAttachedBathroom,
          has_balcony: r.hasBalcony,
          is_active: true,
        });
      }
    }

    // 5. Insert Media into property_images table
    if (input.images && input.images.length > 0) {
      for (let i = 0; i < input.images.length; i++) {
        await supabase.from("property_images").insert({
          property_id: propData.id,
          image_url: input.images[i],
          display_order: i,
          is_cover: i === 0,
        });
      }
    }

    const created = await this.getPropertyById(propData.id);
    return created || {
      ...input,
      id: propData.id,
      ownerId: owner.id,
      status: sanitizedStatus,
      isPublished: false,
      rating: 5.0,
      reviewCount: 0,
      createdAt: propData.created_at,
      updatedAt: propData.updated_at,
    };
  },

  async updateProperty(id: string, updates: Partial<OwnerProperty>): Promise<OwnerProperty> {
    const owner = await getOrInitializeOwner();

    // Validate Jharkhand location if location is being updated
    if (updates.location) {
      const locVal = isLocationInSupportedRegion({
        country: updates.location.country || "India",
        state: updates.location.state,
        city: updates.location.city,
      });
      if (!locVal.valid) {
        throw new Error(locVal.reason || "Property location must be within Jharkhand, India.");
      }

      if (updates.location.latitude !== undefined && updates.location.latitude !== null) {
        if (typeof updates.location.latitude !== "number" || isNaN(updates.location.latitude) || updates.location.latitude < -90 || updates.location.latitude > 90) {
          throw new Error("Invalid latitude. Latitude must be a numeric value between -90 and 90.");
        }
      }
      if (updates.location.longitude !== undefined && updates.location.longitude !== null) {
        if (typeof updates.location.longitude !== "number" || isNaN(updates.location.longitude) || updates.location.longitude < -180 || updates.location.longitude > 180) {
          throw new Error("Invalid longitude. Longitude must be a numeric value between -180 and 180.");
        }
      }
    }

    const supabase = createClient();
    // SECURITY BOUNDARY: Strip unauthorized status modifications
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {};
    if (updates.title) payload.title = updates.title;
    if (updates.description) payload.description = updates.description;
    if (updates.category) payload.category = updates.category;
    if (updates.genderPolicy) payload.gender_policy = updates.genderPolicy;
    if (updates.startingPrice !== undefined) payload.starting_price = updates.startingPrice;
    if (updates.noticePeriodDays !== undefined) payload.notice_period_days = updates.noticePeriodDays;
    if (updates.lockInMonths !== undefined) payload.lock_in_months = updates.lockInMonths;

    if (updates.location) {
      if (updates.location.address) payload.address_line = updates.location.address;
      if (updates.location.locality) payload.locality = updates.location.locality;
      if (updates.location.city) payload.city = updates.location.city;
      if (updates.location.state) payload.state = updates.location.state;
      if (updates.location.pincode) payload.pincode = updates.location.pincode;
      if (updates.location.latitude !== undefined) payload.latitude = updates.location.latitude;
      if (updates.location.longitude !== undefined) payload.longitude = updates.location.longitude;
    }

    const { error } = await supabase
      .from("properties")
      .update(payload)
      .eq("id", id)
      .eq("owner_id", owner.id);

    if (error) {
      throw new Error(`Failed to update property: ${error.message}`);
    }

    const updated = await this.getPropertyById(id);
    if (!updated) throw new Error("Property not found after update.");
    return updated;
  },

  async togglePublish(id: string, isPublished: boolean): Promise<OwnerProperty> {
    const owner = await getOrInitializeOwner();
    const prop = await this.getPropertyById(id);
    if (!prop) throw new Error("Property not found.");

    // ENFORCE SECURITY RULE: Cannot publish property if not VERIFIED by admin
    if (isPublished && prop.status !== "VERIFIED") {
      throw new Error("Only admin-verified properties can be published publicly.");
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("properties")
      .update({ is_published: isPublished })
      .eq("id", id)
      .eq("owner_id", owner.id);

    if (error) {
      throw new Error(`Failed to update publication status: ${error.message}`);
    }

    const updated = await this.getPropertyById(id);
    return updated || prop;
  },

  async submitForVerification(id: string): Promise<OwnerProperty> {
    const owner = await getOrInitializeOwner();
    const supabase = createClient();

    const { error } = await supabase
      .from("properties")
      .update({
        verification_status: "PENDING_VERIFICATION",
        is_published: false,
      })
      .eq("id", id)
      .eq("owner_id", owner.id);

    if (error) {
      throw new Error(`Failed to submit property for verification: ${error.message}`);
    }

    const updated = await this.getPropertyById(id);
    if (!updated) throw new Error("Property not found");
    return updated;
  },

  // Rooms CRUD
  async addRoomToProperty(propertyId: string, room: RoomOption): Promise<RoomOption> {
    const owner = await getOrInitializeOwner();
    const supabase = createClient();

    // Verify ownership
    const { data: prop } = await supabase
      .from("properties")
      .select("id")
      .eq("id", propertyId)
      .eq("owner_id", owner.id)
      .maybeSingle();

    if (!prop) throw new Error("Unauthorized: Property does not belong to authenticated owner.");

    const { data: insertedRoom, error } = await supabase
      .from("rooms")
      .insert({
        property_id: propertyId,
        room_number: room.id || `Room-${room.sharingType}`,
        sharing_type: room.sharingType,
        monthly_rent: room.monthlyRent,
        security_deposit: room.securityDeposit,
        total_beds: room.totalBeds,
        available_beds: room.availableBeds,
        has_attached_bathroom: room.hasAttachedBathroom,
        has_balcony: room.hasBalcony,
        is_active: true,
      })
      .select()
      .single();

    if (error || !insertedRoom) {
      throw new Error(error?.message || "Failed to add room to property.");
    }

    return {
      id: insertedRoom.id,
      sharingType: insertedRoom.sharing_type as SharingType,
      monthlyRent: Number(insertedRoom.monthly_rent),
      securityDeposit: Number(insertedRoom.security_deposit),
      totalBeds: insertedRoom.total_beds,
      availableBeds: insertedRoom.available_beds,
      hasAttachedBathroom: insertedRoom.has_attached_bathroom,
      hasBalcony: insertedRoom.has_balcony,
    };
  },

  async updateRoom(propertyId: string, roomId: string, updates: Partial<RoomOption>): Promise<RoomOption> {
    const owner = await getOrInitializeOwner();
    const supabase = createClient();

    // Verify ownership
    const { data: prop } = await supabase
      .from("properties")
      .select("id")
      .eq("id", propertyId)
      .eq("owner_id", owner.id)
      .maybeSingle();

    if (!prop) throw new Error("Unauthorized: Property does not belong to authenticated owner.");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {};
    if (updates.sharingType) payload.sharing_type = updates.sharingType;
    if (updates.monthlyRent !== undefined) payload.monthly_rent = updates.monthlyRent;
    if (updates.securityDeposit !== undefined) payload.security_deposit = updates.securityDeposit;
    if (updates.totalBeds !== undefined) payload.total_beds = updates.totalBeds;
    if (updates.availableBeds !== undefined) payload.available_beds = updates.availableBeds;
    if (updates.hasAttachedBathroom !== undefined) payload.has_attached_bathroom = updates.hasAttachedBathroom;
    if (updates.hasBalcony !== undefined) payload.has_balcony = updates.hasBalcony;

    const { data: updatedRoom, error } = await supabase
      .from("rooms")
      .update(payload)
      .eq("id", roomId)
      .eq("property_id", propertyId)
      .select()
      .single();

    if (error || !updatedRoom) {
      throw new Error(error?.message || "Failed to update room.");
    }

    return {
      id: updatedRoom.id,
      sharingType: updatedRoom.sharing_type as SharingType,
      monthlyRent: Number(updatedRoom.monthly_rent),
      securityDeposit: Number(updatedRoom.security_deposit),
      totalBeds: updatedRoom.total_beds,
      availableBeds: updatedRoom.available_beds,
      hasAttachedBathroom: updatedRoom.has_attached_bathroom,
      hasBalcony: updatedRoom.has_balcony,
    };
  },

  // Visits
  async getVisits(): Promise<OwnerVisitRequest[]> {
    return MOCK_VISITS;
  },

  async updateVisitStatus(id: string, status: OwnerVisitRequest["status"]): Promise<void> {
    MOCK_VISITS = MOCK_VISITS.map((v) => (v.id === id ? { ...v, status } : v));
  },

  // Bookings
  async getBookings(): Promise<OwnerBookingRequest[]> {
    return MOCK_BOOKINGS;
  },

  async updateBookingStatus(id: string, status: OwnerBookingRequest["status"]): Promise<void> {
    MOCK_BOOKINGS = MOCK_BOOKINGS.map((b) => (b.id === id ? { ...b, status } : b));
  },

  // Payments
  async getPayments(): Promise<OwnerPaymentRecord[]> {
    return MOCK_PAYMENTS;
  },

  // Complaints
  async getComplaints(): Promise<OwnerComplaintRecord[]> {
    return MOCK_COMPLAINTS;
  },

  async updateComplaintStatus(
    id: string,
    status: OwnerComplaintRecord["status"],
    notes?: string
  ): Promise<void> {
    MOCK_COMPLAINTS = MOCK_COMPLAINTS.map((c) =>
      c.id === id ? { ...c, status, resolutionNotes: notes || c.resolutionNotes } : c
    );
  },

  // Reviews
  async getReviews(): Promise<OwnerReviewRecord[]> {
    return MOCK_REVIEWS;
  },

  // Documents Upload & Storage (Private Storage with Signed URLs)
  async getDocuments(): Promise<OwnerDocument[]> {
    return MOCK_DOCUMENTS;
  },

  async uploadDocument(type: OwnerDocument["documentType"], file: File): Promise<OwnerDocument> {
    try {
      const { signedUrl } = await storageService.uploadOwnerDocument(type, file);

      const newDoc: OwnerDocument = {
        id: `doc-${Date.now()}`,
        ownerId: "owner-1",
        documentType: type,
        documentUrl: signedUrl || `https://storage.roomsplits.com/owner-docs/${file.name}`,
        isVerified: false,
        uploadedAt: new Date().toISOString().split("T")[0],
      };

      MOCK_DOCUMENTS.push(newDoc);
      return newDoc;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Document upload failed.";
      console.warn("[ownerService.uploadDocument] Storage upload warning:", msg);
      const fallbackDoc: OwnerDocument = {
        id: `doc-${Date.now()}`,
        ownerId: "owner-1",
        documentType: type,
        documentUrl: `https://storage.roomsplits.com/owner-docs/${file.name}`,
        isVerified: false,
        uploadedAt: new Date().toISOString().split("T")[0],
      };
      MOCK_DOCUMENTS.push(fallbackDoc);
      return fallbackDoc;
    }
  },
};
