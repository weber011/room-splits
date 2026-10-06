export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRoleEnum = "tenant" | "owner" | "admin";
export type GenderPolicyEnum = "boys" | "girls" | "unisex";
export type PropertyCategoryEnum = "pg" | "hostel" | "coliving" | "flat";
export type SharingTypeEnum = "single" | "double" | "triple" | "four_plus";
export type VisitStatusEnum = "pending" | "confirmed" | "completed" | "cancelled";
export type BookingStatusEnum = "draft" | "pending_payment" | "confirmed" | "active" | "cancelled" | "expired";
export type PaymentStatusEnum = "initiated" | "success" | "failed" | "refunded";
export type PaymentTypeEnum = "security_deposit" | "monthly_rent" | "booking_fee" | "maintenance" | "deposit_refund";
export type StayStatusEnum = "active" | "notice_period" | "completed" | "terminated";
export type ComplaintPriorityEnum = "low" | "medium" | "high" | "urgent";
export type ComplaintStatusEnum = "open" | "in_progress" | "resolved" | "closed";
export type CheckoutStatusEnum = "requested" | "inspected" | "approved" | "rejected" | "completed";
export type DepositSettlementStatusEnum = "pending" | "processed" | "disputed" | "completed";
export type DocTypeEnum = "aadhaar" | "pan" | "passport" | "rent_agreement" | "property_deed" | "noc" | "other";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          role: UserRoleEnum;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRoleEnum;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRoleEnum;
          is_verified?: boolean;
          updated_at?: string;
        };
      };
      owners: {
        Row: {
          id: string;
          user_id: string;
          business_name: string | null;
          gstin: string | null;
          bank_account_number: string | null;
          bank_ifsc: string | null;
          verification_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name?: string | null;
          gstin?: string | null;
          bank_account_number?: string | null;
          bank_ifsc?: string | null;
          verification_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          business_name?: string | null;
          gstin?: string | null;
          bank_account_number?: string | null;
          bank_ifsc?: string | null;
          verification_status?: string;
          updated_at?: string;
        };
      };
      owner_documents: {
        Row: {
          id: string;
          owner_id: string;
          document_type: DocTypeEnum;
          document_url: string;
          is_verified: boolean;
          verified_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          document_type: DocTypeEnum;
          document_url: string;
          is_verified?: boolean;
          verified_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          document_type?: DocTypeEnum;
          document_url?: string;
          is_verified?: boolean;
          verified_by?: string | null;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          slug: string;
          description: string;
          category: PropertyCategoryEnum;
          gender_policy: GenderPolicyEnum;
          address_line: string;
          locality: string;
          city: string;
          state: string;
          pincode: string;
          latitude: number | null;
          longitude: number | null;
          starting_price: number;
          notice_period_days: number;
          lock_in_months: number;
          is_published: boolean;
          is_featured: boolean;
          rating: number;
          review_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          slug: string;
          description: string;
          category: PropertyCategoryEnum;
          gender_policy: GenderPolicyEnum;
          address_line: string;
          locality: string;
          city: string;
          state: string;
          pincode: string;
          latitude?: number | null;
          longitude?: number | null;
          starting_price: number;
          notice_period_days?: number;
          lock_in_months?: number;
          is_published?: boolean;
          is_featured?: boolean;
          rating?: number;
          review_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          description?: string;
          category?: PropertyCategoryEnum;
          gender_policy?: GenderPolicyEnum;
          address_line?: string;
          locality?: string;
          city?: string;
          state?: string;
          pincode?: string;
          starting_price?: number;
          is_published?: boolean;
          is_featured?: boolean;
          updated_at?: string;
        };
      };
      property_images: {
        Row: {
          id: string;
          property_id: string;
          image_url: string;
          caption: string | null;
          display_order: number;
          is_cover: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          image_url: string;
          caption?: string | null;
          display_order?: number;
          is_cover?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          image_url?: string;
          caption?: string | null;
          display_order?: number;
          is_cover?: boolean;
          updated_at?: string;
        };
      };
      property_videos: {
        Row: {
          id: string;
          property_id: string;
          video_url: string;
          title: string | null;
          is_360_tour: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          video_url: string;
          title?: string | null;
          is_360_tour?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          video_url?: string;
          title?: string | null;
          is_360_tour?: boolean;
          updated_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          property_id: string;
          room_number: string;
          sharing_type: SharingTypeEnum;
          monthly_rent: number;
          security_deposit: number;
          total_beds: number;
          available_beds: number;
          has_attached_bathroom: boolean;
          has_balcony: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          room_number: string;
          sharing_type: SharingTypeEnum;
          monthly_rent: number;
          security_deposit: number;
          total_beds?: number;
          available_beds?: number;
          has_attached_bathroom?: boolean;
          has_balcony?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          room_number?: string;
          sharing_type?: SharingTypeEnum;
          monthly_rent?: number;
          security_deposit?: number;
          total_beds?: number;
          available_beds?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      amenities: {
        Row: {
          id: string;
          name: string;
          category: string;
          icon_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category?: string;
          icon_name?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          category?: string;
          icon_name?: string | null;
        };
      };
      property_amenities: {
        Row: {
          id: string;
          property_id: string;
          amenity_id: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          amenity_id: string;
        };
        Update: {
          property_id?: string;
          amenity_id?: string;
        };
      };
      visits: {
        Row: {
          id: string;
          property_id: string;
          tenant_id: string;
          visit_date: string;
          visit_slot: string;
          status: VisitStatusEnum;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          tenant_id: string;
          visit_date: string;
          visit_slot: string;
          status?: VisitStatusEnum;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          visit_date?: string;
          visit_slot?: string;
          status?: VisitStatusEnum;
          notes?: string | null;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          property_id: string;
          room_id: string;
          tenant_id: string;
          owner_id: string;
          move_in_date: string;
          sharing_type: SharingTypeEnum;
          monthly_rent: number;
          security_deposit: number;
          total_amount_due: number;
          status: BookingStatusEnum;
          agreement_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          room_id: string;
          tenant_id: string;
          owner_id: string;
          move_in_date: string;
          sharing_type: SharingTypeEnum;
          monthly_rent: number;
          security_deposit: number;
          total_amount_due: number;
          status?: BookingStatusEnum;
          agreement_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: BookingStatusEnum;
          agreement_url?: string | null;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          booking_id: string | null;
          tenant_id: string;
          amount: number;
          currency: string;
          payment_type: PaymentTypeEnum;
          provider: string;
          razorpay_order_id: string | null;
          razorpay_payment_id: string | null;
          status: PaymentStatusEnum;
          invoice_url: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          tenant_id: string;
          amount: number;
          currency?: string;
          payment_type: PaymentTypeEnum;
          provider?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          status?: PaymentStatusEnum;
          invoice_url?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: PaymentStatusEnum;
          razorpay_payment_id?: string | null;
          paid_at?: string | null;
          updated_at?: string;
        };
      };
      stays: {
        Row: {
          id: string;
          booking_id: string;
          property_id: string;
          room_id: string;
          tenant_id: string;
          start_date: string;
          end_date: string | null;
          lock_in_end_date: string;
          notice_given_date: string | null;
          monthly_rent_due_day: number;
          status: StayStatusEnum;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          property_id: string;
          room_id: string;
          tenant_id: string;
          start_date: string;
          end_date?: string | null;
          lock_in_end_date: string;
          notice_given_date?: string | null;
          monthly_rent_due_day?: number;
          status?: StayStatusEnum;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          end_date?: string | null;
          notice_given_date?: string | null;
          status?: StayStatusEnum;
          updated_at?: string;
        };
      };
      rent_payments: {
        Row: {
          id: string;
          stay_id: string;
          payment_id: string | null;
          billing_month: string;
          rent_amount: number;
          utility_charges: number;
          late_fine: number;
          total_due: number;
          due_date: string;
          status: PaymentStatusEnum;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          stay_id: string;
          payment_id?: string | null;
          billing_month: string;
          rent_amount: number;
          utility_charges?: number;
          late_fine?: number;
          total_due: number;
          due_date: string;
          status?: PaymentStatusEnum;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          payment_id?: string | null;
          status?: PaymentStatusEnum;
          paid_at?: string | null;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          stay_id: string | null;
          document_type: DocTypeEnum;
          document_name: string;
          document_url: string;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stay_id?: string | null;
          document_type: DocTypeEnum;
          document_name: string;
          document_url: string;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          document_name?: string;
          document_url?: string;
          is_verified?: boolean;
          updated_at?: string;
        };
      };
      complaints: {
        Row: {
          id: string;
          stay_id: string;
          property_id: string;
          tenant_id: string;
          title: string;
          description: string;
          category: string;
          priority: ComplaintPriorityEnum;
          status: ComplaintStatusEnum;
          resolution_notes: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          stay_id: string;
          property_id: string;
          tenant_id: string;
          title: string;
          description: string;
          category: string;
          priority?: ComplaintPriorityEnum;
          status?: ComplaintStatusEnum;
          resolution_notes?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          priority?: ComplaintPriorityEnum;
          status?: ComplaintStatusEnum;
          resolution_notes?: string | null;
          resolved_at?: string | null;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          property_id: string;
          tenant_id: string;
          stay_id: string | null;
          rating: number;
          cleanliness_rating: number;
          food_rating: number;
          amenities_rating: number;
          value_rating: number;
          comment: string;
          is_verified_resident: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          tenant_id: string;
          stay_id?: string | null;
          rating: number;
          cleanliness_rating?: number;
          food_rating?: number;
          amenities_rating?: number;
          value_rating?: number;
          comment: string;
          is_verified_resident?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          rating?: number;
          comment?: string;
          updated_at?: string;
        };
      };
      saved_properties: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          property_id?: string;
        };
      };
      property_comparisons: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          property_id?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          link_url: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          link_url?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
      checkout_requests: {
        Row: {
          id: string;
          stay_id: string;
          tenant_id: string;
          requested_move_out_date: string;
          reason: string | null;
          status: CheckoutStatusEnum;
          inspection_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          stay_id: string;
          tenant_id: string;
          requested_move_out_date: string;
          reason?: string | null;
          status?: CheckoutStatusEnum;
          inspection_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: CheckoutStatusEnum;
          inspection_notes?: string | null;
          updated_at?: string;
        };
      };
      deposit_settlements: {
        Row: {
          id: string;
          checkout_request_id: string;
          stay_id: string;
          tenant_id: string;
          original_deposit: number;
          deductions_amount: number;
          deduction_reasons: string | null;
          refund_amount: number;
          status: DepositSettlementStatusEnum;
          processed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          checkout_request_id: string;
          stay_id: string;
          tenant_id: string;
          original_deposit: number;
          deductions_amount?: number;
          deduction_reasons?: string | null;
          refund_amount: number;
          status?: DepositSettlementStatusEnum;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          deductions_amount?: number;
          deduction_reasons?: string | null;
          refund_amount?: number;
          status?: DepositSettlementStatusEnum;
          processed_at?: string | null;
          updated_at?: string;
        };
      };
      roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
        };
      };
      permissions: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
        };
      };
      role_permissions: {
        Row: {
          id: string;
          role_id: string;
          permission_id: string;
        };
        Insert: {
          id?: string;
          role_id: string;
          permission_id: string;
        };
        Update: {
          role_id?: string;
          permission_id?: string;
        };
      };
      admin_users: {
        Row: {
          id: string;
          user_id: string;
          role_id: string;
          department: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role_id: string;
          department?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          role_id?: string;
          department?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
