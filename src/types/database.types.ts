export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          department: string | null
          id: string
          role_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          id?: string
          role_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          id?: string
          role_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      amenities: {
        Row: {
          category: string
          created_at: string
          icon_name: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string
          created_at?: string
          icon_name?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          icon_name?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          changes: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          changes?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          agreement_url: string | null
          created_at: string
          id: string
          monthly_rent: number
          move_in_date: string
          move_out_date: string
          owner_id: string
          payment_status: string
          platform_charges: number
          property_id: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          room_id: string
          security_deposit: number
          sharing_type: Database["public"]["Enums"]["sharing_type_enum"]
          status: Database["public"]["Enums"]["booking_status_enum"]
          tenant_id: string
          total_amount_due: number
          updated_at: string
        }
        Insert: {
          agreement_url?: string | null
          created_at?: string
          id?: string
          monthly_rent: number
          move_in_date: string
          move_out_date: string
          owner_id: string
          payment_status?: string
          platform_charges?: number
          property_id: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          room_id: string
          security_deposit: number
          sharing_type: Database["public"]["Enums"]["sharing_type_enum"]
          status?: Database["public"]["Enums"]["booking_status_enum"]
          tenant_id: string
          total_amount_due: number
          updated_at?: string
        }
        Update: {
          agreement_url?: string | null
          created_at?: string
          id?: string
          monthly_rent?: number
          move_in_date?: string
          move_out_date?: string
          owner_id?: string
          payment_status?: string
          platform_charges?: number
          property_id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          room_id?: string
          security_deposit?: number
          sharing_type?: Database["public"]["Enums"]["sharing_type_enum"]
          status?: Database["public"]["Enums"]["booking_status_enum"]
          tenant_id?: string
          total_amount_due?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_requests: {
        Row: {
          created_at: string
          id: string
          inspection_notes: string | null
          reason: string | null
          requested_move_out_date: string
          status: Database["public"]["Enums"]["checkout_status_enum"]
          stay_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          inspection_notes?: string | null
          reason?: string | null
          requested_move_out_date: string
          status?: Database["public"]["Enums"]["checkout_status_enum"]
          stay_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          inspection_notes?: string | null
          reason?: string | null
          requested_move_out_date?: string
          status?: Database["public"]["Enums"]["checkout_status_enum"]
          stay_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkout_requests_stay_id_fkey"
            columns: ["stay_id"]
            isOneToOne: true
            referencedRelation: "stays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkout_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          priority: Database["public"]["Enums"]["complaint_priority_enum"]
          property_id: string
          resolution_notes: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["complaint_status_enum"]
          stay_id: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          priority?: Database["public"]["Enums"]["complaint_priority_enum"]
          property_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["complaint_status_enum"]
          stay_id: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          priority?: Database["public"]["Enums"]["complaint_priority_enum"]
          property_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["complaint_status_enum"]
          stay_id?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_stay_id_fkey"
            columns: ["stay_id"]
            isOneToOne: false
            referencedRelation: "stays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      deposit_deductions: {
        Row: {
          amount: number
          created_at: string
          evidence_url: string | null
          id: string
          reason: string
          settlement_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          evidence_url?: string | null
          id?: string
          reason: string
          settlement_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          evidence_url?: string | null
          id?: string
          reason?: string
          settlement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposit_deductions_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "deposit_settlements"
            referencedColumns: ["id"]
          },
        ]
      }
      deposit_settlements: {
        Row: {
          checkout_request_id: string
          created_at: string
          deduction_reasons: string | null
          deductions_amount: number
          id: string
          original_deposit: number
          processed_at: string | null
          refund_amount: number
          status: Database["public"]["Enums"]["deposit_settlement_status_enum"]
          stay_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          checkout_request_id: string
          created_at?: string
          deduction_reasons?: string | null
          deductions_amount?: number
          id?: string
          original_deposit: number
          processed_at?: string | null
          refund_amount: number
          status?: Database["public"]["Enums"]["deposit_settlement_status_enum"]
          stay_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          checkout_request_id?: string
          created_at?: string
          deduction_reasons?: string | null
          deductions_amount?: number
          id?: string
          original_deposit?: number
          processed_at?: string | null
          refund_amount?: number
          status?: Database["public"]["Enums"]["deposit_settlement_status_enum"]
          stay_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposit_settlements_checkout_request_id_fkey"
            columns: ["checkout_request_id"]
            isOneToOne: true
            referencedRelation: "checkout_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposit_settlements_stay_id_fkey"
            columns: ["stay_id"]
            isOneToOne: false
            referencedRelation: "stays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deposit_settlements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: Database["public"]["Enums"]["doc_type_enum"]
          document_url: string
          id: string
          is_verified: boolean
          stay_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type: Database["public"]["Enums"]["doc_type_enum"]
          document_url: string
          id?: string
          is_verified?: boolean
          stay_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: Database["public"]["Enums"]["doc_type_enum"]
          document_url?: string
          id?: string
          is_verified?: boolean
          stay_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_stay_id_fkey"
            columns: ["stay_id"]
            isOneToOne: false
            referencedRelation: "stays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link_url: string | null
          message: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          message: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          message?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_documents: {
        Row: {
          created_at: string
          document_type: Database["public"]["Enums"]["doc_type_enum"]
          document_url: string
          id: string
          is_verified: boolean
          owner_id: string
          updated_at: string
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          document_type: Database["public"]["Enums"]["doc_type_enum"]
          document_url: string
          id?: string
          is_verified?: boolean
          owner_id: string
          updated_at?: string
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          document_type?: Database["public"]["Enums"]["doc_type_enum"]
          document_url?: string
          id?: string
          is_verified?: boolean
          owner_id?: string
          updated_at?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "owner_documents_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "owner_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      owners: {
        Row: {
          bank_account_number: string | null
          bank_ifsc: string | null
          business_name: string | null
          created_at: string
          gstin: string | null
          id: string
          updated_at: string
          user_id: string
          verification_status: string
        }
        Insert: {
          bank_account_number?: string | null
          bank_ifsc?: string | null
          business_name?: string | null
          created_at?: string
          gstin?: string | null
          id?: string
          updated_at?: string
          user_id: string
          verification_status?: string
        }
        Update: {
          bank_account_number?: string | null
          bank_ifsc?: string | null
          business_name?: string | null
          created_at?: string
          gstin?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "owners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          created_at: string
          event_id: string
          event_type: string
          id: string
          payload: Json | null
          processed_at: string | null
          provider: string
        }
        Insert: {
          created_at?: string
          event_id: string
          event_type: string
          id?: string
          payload?: Json | null
          processed_at?: string | null
          provider?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json | null
          processed_at?: string | null
          provider?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          currency: string
          id: string
          invoice_url: string | null
          metadata: Json | null
          paid_at: string | null
          payment_type: Database["public"]["Enums"]["payment_type_enum"]
          provider: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          related_property_id: string | null
          related_stay_id: string | null
          status: Database["public"]["Enums"]["payment_status_enum"]
          tenant_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          invoice_url?: string | null
          metadata?: Json | null
          paid_at?: string | null
          payment_type: Database["public"]["Enums"]["payment_type_enum"]
          provider?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          related_property_id?: string | null
          related_stay_id?: string | null
          status?: Database["public"]["Enums"]["payment_status_enum"]
          tenant_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          invoice_url?: string | null
          metadata?: Json | null
          paid_at?: string | null
          payment_type?: Database["public"]["Enums"]["payment_type_enum"]
          provider?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          related_property_id?: string | null
          related_stay_id?: string | null
          status?: Database["public"]["Enums"]["payment_status_enum"]
          tenant_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_related_property_id_fkey"
            columns: ["related_property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_related_property_id_fkey"
            columns: ["related_property_id"]
            isOneToOne: false
            referencedRelation: "public_properties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_related_stay_id_fkey"
            columns: ["related_stay_id"]
            isOneToOne: false
            referencedRelation: "stays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address_line: string
          category: Database["public"]["Enums"]["property_category_enum"]
          city: string
          country: string
          created_at: string
          description: string
          gender_policy: Database["public"]["Enums"]["gender_policy_enum"]
          id: string
          is_featured: boolean
          is_published: boolean
          latitude: number | null
          locality: string
          lock_in_months: number
          longitude: number | null
          notice_period_days: number
          owner_id: string
          pincode: string
          rating: number
          review_count: number
          slug: string
          starting_price: number
          state: string
          title: string
          updated_at: string
          verification_status: string
        }
        Insert: {
          address_line: string
          category: Database["public"]["Enums"]["property_category_enum"]
          city: string
          country?: string
          created_at?: string
          description: string
          gender_policy: Database["public"]["Enums"]["gender_policy_enum"]
          id?: string
          is_featured?: boolean
          is_published?: boolean
          latitude?: number | null
          locality: string
          lock_in_months?: number
          longitude?: number | null
          notice_period_days?: number
          owner_id: string
          pincode: string
          rating?: number
          review_count?: number
          slug: string
          starting_price?: number
          state: string
          title: string
          updated_at?: string
          verification_status?: string
        }
        Update: {
          address_line?: string
          category?: Database["public"]["Enums"]["property_category_enum"]
          city?: string
          country?: string
          created_at?: string
          description?: string
          gender_policy?: Database["public"]["Enums"]["gender_policy_enum"]
          id?: string
          is_featured?: boolean
          is_published?: boolean
          latitude?: number | null
          locality?: string
          lock_in_months?: number
          longitude?: number | null
          notice_period_days?: number
          owner_id?: string
          pincode?: string
          rating?: number
          review_count?: number
          slug?: string
          starting_price?: number
          state?: string
          title?: string
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
      property_amenities: {
        Row: {
          amenity_id: string
          id: string
          property_id: string
        }
        Insert: {
          amenity_id: string
          id?: string
          property_id: string
        }
        Update: {
          amenity_id?: string
          id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_amenities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_amenities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties_view"
            referencedColumns: ["id"]
          },
        ]
      }
      property_comparisons: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_comparisons_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_comparisons_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_comparisons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_cover: boolean
          property_id: string
          updated_at: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_cover?: boolean
          property_id: string
          updated_at?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_cover?: boolean
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties_view"
            referencedColumns: ["id"]
          },
        ]
      }
      property_unlocks: {
        Row: {
          amount: number
          amount_paid: number
          created_at: string
          currency: string
          id: string
          payment_id: string | null
          payment_type: Database["public"]["Enums"]["payment_type_enum"]
          property_id: string
          status: string
          unlocked_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          amount_paid?: number
          created_at?: string
          currency?: string
          id?: string
          payment_id?: string | null
          payment_type?: Database["public"]["Enums"]["payment_type_enum"]
          property_id: string
          status?: string
          unlocked_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          amount_paid?: number
          created_at?: string
          currency?: string
          id?: string
          payment_id?: string | null
          payment_type?: Database["public"]["Enums"]["payment_type_enum"]
          property_id?: string
          status?: string
          unlocked_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_unlocks_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_unlocks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_unlocks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_unlocks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      property_videos: {
        Row: {
          created_at: string
          id: string
          is_360_tour: boolean
          property_id: string
          title: string | null
          updated_at: string
          video_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_360_tour?: boolean
          property_id: string
          title?: string | null
          updated_at?: string
          video_url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_360_tour?: boolean
          property_id?: string
          title?: string | null
          updated_at?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_videos_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_videos_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties_view"
            referencedColumns: ["id"]
          },
        ]
      }
      rent_payments: {
        Row: {
          billing_month: string
          created_at: string
          due_date: string
          id: string
          late_fine: number
          paid_at: string | null
          payment_id: string | null
          period_end: string | null
          period_start: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          rent_amount: number
          status: Database["public"]["Enums"]["payment_status_enum"]
          stay_id: string
          tenant_id: string | null
          total_due: number
          updated_at: string
          utility_charges: number
        }
        Insert: {
          billing_month: string
          created_at?: string
          due_date: string
          id?: string
          late_fine?: number
          paid_at?: string | null
          payment_id?: string | null
          period_end?: string | null
          period_start?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          rent_amount: number
          status?: Database["public"]["Enums"]["payment_status_enum"]
          stay_id: string
          tenant_id?: string | null
          total_due: number
          updated_at?: string
          utility_charges?: number
        }
        Update: {
          billing_month?: string
          created_at?: string
          due_date?: string
          id?: string
          late_fine?: number
          paid_at?: string | null
          payment_id?: string | null
          period_end?: string | null
          period_start?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          rent_amount?: number
          status?: Database["public"]["Enums"]["payment_status_enum"]
          stay_id?: string
          tenant_id?: string | null
          total_due?: number
          updated_at?: string
          utility_charges?: number
        }
        Relationships: [
          {
            foreignKeyName: "rent_payments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rent_payments_stay_id_fkey"
            columns: ["stay_id"]
            isOneToOne: false
            referencedRelation: "stays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rent_payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          amenities_rating: number
          cleanliness_rating: number
          comment: string
          created_at: string
          food_rating: number
          id: string
          is_verified_resident: boolean
          property_id: string
          rating: number
          stay_id: string | null
          tenant_id: string
          updated_at: string
          value_rating: number
        }
        Insert: {
          amenities_rating?: number
          cleanliness_rating?: number
          comment: string
          created_at?: string
          food_rating?: number
          id?: string
          is_verified_resident?: boolean
          property_id: string
          rating: number
          stay_id?: string | null
          tenant_id: string
          updated_at?: string
          value_rating?: number
        }
        Update: {
          amenities_rating?: number
          cleanliness_rating?: number
          comment?: string
          created_at?: string
          food_rating?: number
          id?: string
          is_verified_resident?: boolean
          property_id?: string
          rating?: number
          stay_id?: string | null
          tenant_id?: string
          updated_at?: string
          value_rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_stay_id_fkey"
            columns: ["stay_id"]
            isOneToOne: false
            referencedRelation: "stays"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          available_beds: number
          created_at: string
          has_attached_bathroom: boolean
          has_balcony: boolean
          id: string
          is_active: boolean
          monthly_rent: number
          property_id: string
          room_number: string
          security_deposit: number
          sharing_type: Database["public"]["Enums"]["sharing_type_enum"]
          total_beds: number
          updated_at: string
        }
        Insert: {
          available_beds?: number
          created_at?: string
          has_attached_bathroom?: boolean
          has_balcony?: boolean
          id?: string
          is_active?: boolean
          monthly_rent: number
          property_id: string
          room_number: string
          security_deposit: number
          sharing_type: Database["public"]["Enums"]["sharing_type_enum"]
          total_beds?: number
          updated_at?: string
        }
        Update: {
          available_beds?: number
          created_at?: string
          has_attached_bathroom?: boolean
          has_balcony?: boolean
          id?: string
          is_active?: boolean
          monthly_rent?: number
          property_id?: string
          room_number?: string
          security_deposit?: number
          sharing_type?: Database["public"]["Enums"]["sharing_type_enum"]
          total_beds?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties_view"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_properties: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_properties_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_properties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stays: {
        Row: {
          booking_id: string
          created_at: string
          end_date: string | null
          id: string
          lock_in_end_date: string
          monthly_rent: number | null
          monthly_rent_due_day: number
          move_in_date: string | null
          notice_given_date: string | null
          property_id: string
          room_id: string
          security_deposit: number | null
          start_date: string
          status: Database["public"]["Enums"]["stay_status_enum"]
          tenant_id: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          lock_in_end_date: string
          monthly_rent?: number | null
          monthly_rent_due_day?: number
          move_in_date?: string | null
          notice_given_date?: string | null
          property_id: string
          room_id: string
          security_deposit?: number | null
          start_date: string
          status?: Database["public"]["Enums"]["stay_status_enum"]
          tenant_id: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          lock_in_end_date?: string
          monthly_rent?: number | null
          monthly_rent_due_day?: number
          move_in_date?: string | null
          notice_given_date?: string | null
          property_id?: string
          room_id?: string
          security_deposit?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["stay_status_enum"]
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stays_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stays_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stays_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stays_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stays_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_verified: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role_enum"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_verified?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_verified?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string
        }
        Relationships: []
      }
      visits: {
        Row: {
          alternate_date: string | null
          alternate_slot: string | null
          created_at: string
          id: string
          notes: string | null
          owner_notes: string | null
          owner_proposed_date: string | null
          owner_proposed_slot: string | null
          property_id: string
          status: Database["public"]["Enums"]["visit_status_enum"]
          tenant_id: string
          updated_at: string
          visit_date: string
          visit_slot: string
        }
        Insert: {
          alternate_date?: string | null
          alternate_slot?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          owner_notes?: string | null
          owner_proposed_date?: string | null
          owner_proposed_slot?: string | null
          property_id: string
          status?: Database["public"]["Enums"]["visit_status_enum"]
          tenant_id: string
          updated_at?: string
          visit_date: string
          visit_slot: string
        }
        Update: {
          alternate_date?: string | null
          alternate_slot?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          owner_notes?: string | null
          owner_proposed_date?: string | null
          owner_proposed_slot?: string | null
          property_id?: string
          status?: Database["public"]["Enums"]["visit_status_enum"]
          tenant_id?: string
          updated_at?: string
          visit_date?: string
          visit_slot?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "public_properties_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_properties_view: {
        Row: {
          category: Database["public"]["Enums"]["property_category_enum"] | null
          city: string | null
          created_at: string | null
          description: string | null
          gender_policy:
            | Database["public"]["Enums"]["gender_policy_enum"]
            | null
          id: string | null
          is_featured: boolean | null
          is_published: boolean | null
          locality: string | null
          lock_in_months: number | null
          notice_period_days: number | null
          owner_id: string | null
          pincode: string | null
          rating: number | null
          review_count: number | null
          slug: string | null
          starting_price: number | null
          state: string | null
          title: string | null
          updated_at: string | null
          verification_status: string | null
        }
        Insert: {
          category?:
            | Database["public"]["Enums"]["property_category_enum"]
            | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          gender_policy?:
            | Database["public"]["Enums"]["gender_policy_enum"]
            | null
          id?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          locality?: string | null
          lock_in_months?: number | null
          notice_period_days?: number | null
          owner_id?: string | null
          pincode?: string | null
          rating?: number | null
          review_count?: number | null
          slug?: string | null
          starting_price?: number | null
          state?: string | null
          title?: string | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Update: {
          category?:
            | Database["public"]["Enums"]["property_category_enum"]
            | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          gender_policy?:
            | Database["public"]["Enums"]["gender_policy_enum"]
            | null
          id?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          locality?: string | null
          lock_in_months?: number | null
          notice_period_days?: number | null
          owner_id?: string | null
          pincode?: string | null
          rating?: number | null
          review_count?: number | null
          slug?: string | null
          starting_price?: number | null
          state?: string | null
          title?: string | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_status_enum:
        | "draft"
        | "pending_payment"
        | "confirmed"
        | "active"
        | "cancelled"
        | "expired"
      checkout_status_enum:
        | "requested"
        | "inspected"
        | "approved"
        | "rejected"
        | "completed"
      complaint_priority_enum: "low" | "medium" | "high" | "urgent"
      complaint_status_enum: "open" | "in_progress" | "resolved" | "closed"
      deposit_settlement_status_enum:
        | "pending"
        | "processed"
        | "disputed"
        | "completed"
      doc_type_enum:
        | "aadhaar"
        | "pan"
        | "passport"
        | "rent_agreement"
        | "property_deed"
        | "noc"
        | "other"
      gender_policy_enum: "boys" | "girls" | "unisex"
      payment_status_enum:
        | "initiated"
        | "success"
        | "failed"
        | "refunded"
        | "CREATED"
        | "ORDER_CREATED"
        | "PENDING"
        | "AUTHORIZED"
        | "CAPTURED"
        | "CANCELLED"
      payment_type_enum:
        | "security_deposit"
        | "monthly_rent"
        | "booking_fee"
        | "maintenance"
        | "deposit_refund"
        | "PROPERTY_UNLOCK"
        | "ROOM_BOOKING"
        | "SECURITY_DEPOSIT"
        | "MONTHLY_RENT"
        | "property_unlock"
      property_category_enum: "pg" | "hostel" | "coliving" | "flat"
      sharing_type_enum: "single" | "double" | "triple" | "four_plus"
      stay_status_enum: "active" | "notice_period" | "completed" | "terminated"
      user_role_enum: "tenant" | "owner" | "admin"
      visit_status_enum: "pending" | "confirmed" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_status_enum: [
        "draft",
        "pending_payment",
        "confirmed",
        "active",
        "cancelled",
        "expired",
      ],
      checkout_status_enum: [
        "requested",
        "inspected",
        "approved",
        "rejected",
        "completed",
      ],
      complaint_priority_enum: ["low", "medium", "high", "urgent"],
      complaint_status_enum: ["open", "in_progress", "resolved", "closed"],
      deposit_settlement_status_enum: [
        "pending",
        "processed",
        "disputed",
        "completed",
      ],
      doc_type_enum: [
        "aadhaar",
        "pan",
        "passport",
        "rent_agreement",
        "property_deed",
        "noc",
        "other",
      ],
      gender_policy_enum: ["boys", "girls", "unisex"],
      payment_status_enum: [
        "initiated",
        "success",
        "failed",
        "refunded",
        "CREATED",
        "ORDER_CREATED",
        "PENDING",
        "AUTHORIZED",
        "CAPTURED",
        "CANCELLED",
      ],
      payment_type_enum: [
        "security_deposit",
        "monthly_rent",
        "booking_fee",
        "maintenance",
        "deposit_refund",
        "PROPERTY_UNLOCK",
        "ROOM_BOOKING",
        "SECURITY_DEPOSIT",
        "MONTHLY_RENT",
        "property_unlock",
      ],
      property_category_enum: ["pg", "hostel", "coliving", "flat"],
      sharing_type_enum: ["single", "double", "triple", "four_plus"],
      stay_status_enum: ["active", "notice_period", "completed", "terminated"],
      user_role_enum: ["tenant", "owner", "admin"],
      visit_status_enum: ["pending", "confirmed", "completed", "cancelled"],
    },
  },
} as const
