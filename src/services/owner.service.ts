import { createClient } from "@/lib/supabase/client";
import { Property, RoomOption } from "@/types";

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

// Initial mock data store for owner features
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
      address: "100 Feet Road, Indiranagar",
      locality: "HSR Layout, Sector 3",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560102",
      latitude: 12.9121,
      longitude: 77.6446,
    },
    amenities: ["High-Speed Wi-Fi", "3x Daily Meals", "AC Rooms", "Gym Access", "24/7 Security & CCTV", "Power Backup"],
    rules: ["No smoking inside rooms", "Visitors allowed till 10 PM", "Gate closes at 11:30 PM"],
    images: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"],
    coverImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    featured: true,
    startingPrice: 11500,
    rating: 4.9,
    reviewCount: 128,
    roomOptions: [
      { id: "r-1", sharingType: "single", monthlyRent: 16000, securityDeposit: 32000, availableBeds: 1, totalBeds: 2, hasAttachedBathroom: true, hasBalcony: true },
      { id: "r-2", sharingType: "double", monthlyRent: 11500, securityDeposit: 23000, availableBeds: 3, totalBeds: 6, hasAttachedBathroom: true, hasBalcony: false },
    ],
    noticePeriodDays: 30,
    lockInMonths: 3,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "prop-2",
    ownerId: "owner-1",
    title: "Stanza Heights Luxury PG for Men",
    slug: "stanza-heights-men-pg",
    description: "Luxury PG in Koramangala with 24/7 power backup, attached bathrooms, and fingerprint security doors.",
    category: "pg",
    genderPolicy: "boys",
    status: "PENDING_VERIFICATION",
    isPublished: false,
    location: {
      address: "5th Block, Opposite Jyoti Nivas",
      locality: "Koramangala",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560095",
    },
    amenities: ["Wi-Fi", "Daily Housekeeping", "Attached Bath", "Power Backup", "Laundry Service"],
    rules: ["Boys only", "No alcohol on premises"],
    images: ["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80"],
    coverImage: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
    featured: false,
    startingPrice: 9800,
    rating: 4.8,
    reviewCount: 94,
    roomOptions: [
      { id: "r-3", sharingType: "double", monthlyRent: 9800, securityDeposit: 19600, availableBeds: 2, totalBeds: 4, hasAttachedBathroom: true, hasBalcony: false },
    ],
    noticePeriodDays: 30,
    lockInMonths: 3,
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-02-01T00:00:00Z",
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
  {
    id: "v-2",
    propertyId: "prop-1",
    propertyTitle: "UrbanNest Executive Co-Living & PG",
    tenantName: "Priya Sharma",
    tenantPhone: "+91 91234 56789",
    visitDate: "2026-10-09",
    visitSlot: "Morning (10:00 AM - 12:00 PM)",
    status: "confirmed",
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
    monthlyRent: 16000,
    securityDeposit: 32000,
    status: "confirmed",
  },
  {
    id: "b-2",
    propertyId: "prop-1",
    propertyTitle: "UrbanNest Executive Co-Living & PG",
    roomId: "r-2",
    sharingType: "Double Sharing",
    tenantName: "Siddharth Rao",
    tenantPhone: "+91 98112 23344",
    moveInDate: "2026-10-20",
    monthlyRent: 11500,
    securityDeposit: 23000,
    status: "pending_payment",
  },
];

const MOCK_PAYMENTS: OwnerPaymentRecord[] = [
  { id: "p-1", tenantName: "Aditya Kumar", propertyTitle: "UrbanNest Executive", amount: 48000, type: "security_deposit", status: "success", paidAt: "2026-10-01" },
  { id: "p-2", tenantName: "Siddharth Rao", propertyTitle: "UrbanNest Executive", amount: 11500, type: "monthly_rent", status: "success", paidAt: "2026-10-02" },
  { id: "p-3", tenantName: "Ananya Roy", propertyTitle: "Stanza Heights", amount: 9800, type: "monthly_rent", status: "initiated", paidAt: "2026-10-04" },
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
  {
    id: "c-2",
    propertyTitle: "Stanza Heights Luxury PG",
    roomNumber: "102",
    tenantName: "Karan Johar",
    title: "AC Water Leaking",
    description: "Split AC unit in Room 102 dripping water near desk.",
    priority: "high",
    status: "in_progress",
    createdAt: "2026-10-04T14:20:00Z",
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
  {
    id: "rev-2",
    propertyTitle: "Stanza Heights Luxury PG",
    tenantName: "Vikram Malhotra",
    rating: 4.8,
    cleanlinessRating: 4.9,
    foodRating: 4.7,
    amenitiesRating: 5,
    valueRating: 4.8,
    comment: "Spacious rooms with daily housekeeping. Quiet and safe location.",
    createdAt: "1 week ago",
  },
];

const MOCK_DOCUMENTS: OwnerDocument[] = [
  { id: "doc-1", ownerId: "owner-1", documentType: "aadhaar", documentUrl: "https://example.com/docs/aadhaar.pdf", isVerified: true, uploadedAt: "2026-09-01" },
  { id: "doc-2", ownerId: "owner-1", documentType: "pan", documentUrl: "https://example.com/docs/pan.pdf", isVerified: true, uploadedAt: "2026-09-01" },
  { id: "doc-3", ownerId: "owner-1", documentType: "electricity_bill", documentUrl: "https://example.com/docs/ebill.pdf", isVerified: false, uploadedAt: "2026-10-01" },
];

export const ownerService = {
  // Stats Calculation
  async getDashboardStats(): Promise<OwnerDashboardStats> {
    const props = MOCK_OWNER_PROPERTIES;
    let totalRooms = 0;
    let availableRooms = 0;

    props.forEach((p) => {
      p.roomOptions.forEach((r) => {
        totalRooms += r.totalBeds;
        availableRooms += r.availableBeds;
      });
    });

    const totalCollected = MOCK_PAYMENTS.filter((p) => p.status === "success").reduce((acc, p) => acc + p.amount, 0);

    return {
      totalProperties: props.length,
      activeProperties: props.filter((p) => p.status === "VERIFIED" && p.isPublished).length,
      totalRooms: totalRooms || 140,
      availableRooms: availableRooms || 12,
      pendingVisits: MOCK_VISITS.filter((v) => v.status === "pending").length,
      confirmedBookings: MOCK_BOOKINGS.filter((b) => b.status === "confirmed").length,
      totalCollectedRent: totalCollected || 1408000,
      pendingComplaints: MOCK_COMPLAINTS.filter((c) => c.status === "open" || c.status === "in_progress").length,
    };
  },

  // Properties CRUD
  async getProperties(): Promise<OwnerProperty[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("properties").select("*");
      if (error || !data || data.length === 0) {
        return MOCK_OWNER_PROPERTIES;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((r: any) => ({
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
          address: r.address_line,
          locality: r.locality,
          city: r.city,
          state: r.state,
          pincode: r.pincode,
          latitude: r.latitude,
          longitude: r.longitude,
        },
        amenities: r.amenities || ["Wi-Fi", "Food"],
        rules: ["Standard PG Rules"],
        images: r.images || [],
        coverImage: r.images?.[0] || "",
        featured: r.is_featured,
        startingPrice: Number(r.starting_price) || 8000,
        rating: Number(r.rating) || 4.8,
        reviewCount: r.review_count || 10,
        roomOptions: [],
        noticePeriodDays: r.notice_period_days || 30,
        lockInMonths: r.lock_in_months || 3,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    } catch {
      return MOCK_OWNER_PROPERTIES;
    }
  },

  async getPropertyById(id: string): Promise<OwnerProperty | null> {
    const props = await this.getProperties();
    return props.find((p) => p.id === id) || props[0] || null;
  },

  async createProperty(
    input: Omit<OwnerProperty, "id" | "ownerId" | "createdAt" | "updatedAt" | "rating" | "reviewCount">
  ): Promise<OwnerProperty> {
    // ENFORCE SECURITY RULE: Owner cannot claim VERIFIED status on frontend
    const sanitizedStatus: PropertyStatus = input.status === "PENDING_VERIFICATION" ? "PENDING_VERIFICATION" : "DRAFT";

    const newProp: OwnerProperty = {
      ...input,
      id: `prop-${Date.now()}`,
      ownerId: "owner-1",
      status: sanitizedStatus,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    MOCK_OWNER_PROPERTIES.unshift(newProp);
    return newProp;
  },

  async updateProperty(id: string, updates: Partial<OwnerProperty>): Promise<OwnerProperty> {
    const index = MOCK_OWNER_PROPERTIES.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Property not found");

    // ENFORCE SECURITY RULE: Owner CANNOT modify status to VERIFIED or SUSPENDED from frontend
    if (updates.status === "VERIFIED" || updates.status === "SUSPENDED" || updates.status === "REJECTED") {
      delete updates.status;
    }

    const updated = {
      ...MOCK_OWNER_PROPERTIES[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    MOCK_OWNER_PROPERTIES[index] = updated;
    return updated;
  },

  async togglePublish(id: string, isPublished: boolean): Promise<OwnerProperty> {
    return this.updateProperty(id, { isPublished });
  },

  async submitForVerification(id: string): Promise<OwnerProperty> {
    const index = MOCK_OWNER_PROPERTIES.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Property not found");

    MOCK_OWNER_PROPERTIES[index].status = "PENDING_VERIFICATION";
    return MOCK_OWNER_PROPERTIES[index];
  },

  // Rooms CRUD
  async addRoomToProperty(propertyId: string, room: RoomOption): Promise<RoomOption> {
    const prop = MOCK_OWNER_PROPERTIES.find((p) => p.id === propertyId);
    if (prop) {
      prop.roomOptions.push(room);
    }
    return room;
  },

  async updateRoom(propertyId: string, roomId: string, updates: Partial<RoomOption>): Promise<RoomOption> {
    const prop = MOCK_OWNER_PROPERTIES.find((p) => p.id === propertyId);
    if (prop) {
      const idx = prop.roomOptions.findIndex((r) => r.id === roomId);
      if (idx !== -1) {
        prop.roomOptions[idx] = { ...prop.roomOptions[idx], ...updates };
        return prop.roomOptions[idx];
      }
    }
    throw new Error("Room not found");
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

  // Documents Upload & Storage
  async getDocuments(): Promise<OwnerDocument[]> {
    return MOCK_DOCUMENTS;
  },

  async uploadDocument(type: OwnerDocument["documentType"], file: File): Promise<OwnerDocument> {
    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `owner-docs/${fileName}`;

      const { data: uploadData, error } = await supabase.storage
        .from("owner-documents")
        .upload(filePath, file);

      let publicUrl = `https://storage.roomsplits.com/${filePath}`;
      if (!error && uploadData) {
        const { data: urlData } = supabase.storage.from("owner-documents").getPublicUrl(filePath);
        if (urlData) publicUrl = urlData.publicUrl;
      }

      const newDoc: OwnerDocument = {
        id: `doc-${Date.now()}`,
        ownerId: "owner-1",
        documentType: type,
        documentUrl: publicUrl,
        isVerified: false,
        uploadedAt: new Date().toISOString().split("T")[0],
      };

      MOCK_DOCUMENTS.push(newDoc);
      return newDoc;
    } catch {
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
