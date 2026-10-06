-- ==============================================================================
-- RoomSplits Production PostgreSQL Schema Migration for Supabase
-- Target: 26 Normalized Relational Tables, Custom Enums, RLS Policies & Triggers
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. CUSTOM ENUM TYPES
-- ------------------------------------------------------------------------------
CREATE TYPE user_role_enum AS ENUM ('tenant', 'owner', 'admin');
CREATE TYPE gender_policy_enum AS ENUM ('boys', 'girls', 'unisex');
CREATE TYPE property_category_enum AS ENUM ('pg', 'hostel', 'coliving', 'flat');
CREATE TYPE sharing_type_enum AS ENUM ('single', 'double', 'triple', 'four_plus');
CREATE TYPE visit_status_enum AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE booking_status_enum AS ENUM ('draft', 'pending_payment', 'confirmed', 'active', 'cancelled', 'expired');
CREATE TYPE payment_status_enum AS ENUM ('initiated', 'success', 'failed', 'refunded');
CREATE TYPE payment_type_enum AS ENUM ('security_deposit', 'monthly_rent', 'booking_fee', 'maintenance', 'deposit_refund');
CREATE TYPE stay_status_enum AS ENUM ('active', 'notice_period', 'completed', 'terminated');
CREATE TYPE complaint_priority_enum AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE complaint_status_enum AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE checkout_status_enum AS ENUM ('requested', 'inspected', 'approved', 'rejected', 'completed');
CREATE TYPE deposit_settlement_status_enum AS ENUM ('pending', 'processed', 'disputed', 'completed');
CREATE TYPE doc_type_enum AS ENUM ('aadhaar', 'pan', 'passport', 'rent_agreement', 'property_deed', 'noc', 'other');

-- ------------------------------------------------------------------------------
-- 2. UPDATED_AT TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 3. TABLES DEFINITION
-- ------------------------------------------------------------------------------

-- Table 1: users (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role user_role_enum NOT NULL DEFAULT 'tenant',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 2: owners
CREATE TABLE owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT,
    gstin TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 3: owner_documents
CREATE TABLE owner_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
    document_type doc_type_enum NOT NULL,
    document_url TEXT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 4: properties
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category property_category_enum NOT NULL,
    gender_policy gender_policy_enum NOT NULL,
    address_line TEXT NOT NULL,
    locality TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    starting_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    notice_period_days INT NOT NULL DEFAULT 30,
    lock_in_months INT NOT NULL DEFAULT 3,
    is_published BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
    review_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 5: property_images
CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_cover BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 6: property_videos
CREATE TABLE property_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    title TEXT,
    is_360_tour BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 7: rooms
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_number TEXT NOT NULL,
    sharing_type sharing_type_enum NOT NULL,
    monthly_rent NUMERIC(12, 2) NOT NULL,
    security_deposit NUMERIC(12, 2) NOT NULL,
    total_beds INT NOT NULL DEFAULT 1,
    available_beds INT NOT NULL DEFAULT 1,
    has_attached_bathroom BOOLEAN NOT NULL DEFAULT false,
    has_balcony BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 8: amenities
CREATE TABLE amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'general',
    icon_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 9: property_amenities
CREATE TABLE property_amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    CONSTRAINT unique_property_amenity UNIQUE (property_id, amenity_id)
);

-- Table 10: visits
CREATE TABLE visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    visit_slot TEXT NOT NULL,
    status visit_status_enum NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 11: bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE RESTRICT,
    move_in_date DATE NOT NULL,
    sharing_type sharing_type_enum NOT NULL,
    monthly_rent NUMERIC(12, 2) NOT NULL,
    security_deposit NUMERIC(12, 2) NOT NULL,
    total_amount_due NUMERIC(12, 2) NOT NULL,
    status booking_status_enum NOT NULL DEFAULT 'draft',
    agreement_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 12: payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    payment_type payment_type_enum NOT NULL,
    provider TEXT NOT NULL DEFAULT 'razorpay',
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    status payment_status_enum NOT NULL DEFAULT 'initiated',
    invoice_url TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 13: stays
CREATE TABLE stays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE RESTRICT,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    lock_in_end_date DATE NOT NULL,
    notice_given_date DATE,
    monthly_rent_due_day INT NOT NULL DEFAULT 5,
    status stay_status_enum NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 14: rent_payments
CREATE TABLE rent_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stay_id UUID NOT NULL REFERENCES stays(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    billing_month DATE NOT NULL,
    rent_amount NUMERIC(12, 2) NOT NULL,
    utility_charges NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    late_fine NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_due NUMERIC(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    status payment_status_enum NOT NULL DEFAULT 'initiated',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 15: documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stay_id UUID REFERENCES stays(id) ON DELETE SET NULL,
    document_type doc_type_enum NOT NULL,
    document_name TEXT NOT NULL,
    document_url TEXT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 16: complaints
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stay_id UUID NOT NULL REFERENCES stays(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    priority complaint_priority_enum NOT NULL DEFAULT 'medium',
    status complaint_status_enum NOT NULL DEFAULT 'open',
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 17: reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stay_id UUID REFERENCES stays(id) ON DELETE SET NULL,
    rating NUMERIC(3, 2) NOT NULL,
    cleanliness_rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    food_rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    amenities_rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    value_rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    comment TEXT NOT NULL,
    is_verified_resident BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_property_tenant_review UNIQUE (property_id, tenant_id)
);

-- Table 18: saved_properties
CREATE TABLE saved_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_saved_property UNIQUE (user_id, property_id)
);

-- Table 19: property_comparisons
CREATE TABLE property_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_compared_property UNIQUE (user_id, property_id)
);

-- Table 20: notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 21: checkout_requests
CREATE TABLE checkout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stay_id UUID NOT NULL UNIQUE REFERENCES stays(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_move_out_date DATE NOT NULL,
    reason TEXT,
    status checkout_status_enum NOT NULL DEFAULT 'requested',
    inspection_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 22: deposit_settlements
CREATE TABLE deposit_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkout_request_id UUID NOT NULL UNIQUE REFERENCES checkout_requests(id) ON DELETE CASCADE,
    stay_id UUID NOT NULL REFERENCES stays(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_deposit NUMERIC(12, 2) NOT NULL,
    deductions_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    deduction_reasons TEXT,
    refund_amount NUMERIC(12, 2) NOT NULL,
    status deposit_settlement_status_enum NOT NULL DEFAULT 'pending',
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 23: roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 24: permissions
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 25: role_permissions
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    CONSTRAINT unique_role_permission UNIQUE (role_id, permission_id)
);

-- Table 26: admin_users
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    department TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. INDEXES FOR PERFORMANCE & SEARCH
-- ------------------------------------------------------------------------------
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_owners_user_id ON owners(user_id);
CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_properties_city_locality ON properties(city, locality);
CREATE INDEX idx_properties_category_gender ON properties(category, gender_policy);
CREATE INDEX idx_properties_starting_price ON properties(starting_price);
CREATE INDEX idx_rooms_property_id ON rooms(property_id);
CREATE INDEX idx_rooms_sharing_type ON rooms(sharing_type);
CREATE INDEX idx_visits_tenant_id ON visits(tenant_id);
CREATE INDEX idx_visits_property_id ON visits(property_id);
CREATE INDEX idx_bookings_tenant_id ON bookings(tenant_id);
CREATE INDEX idx_bookings_owner_id ON bookings(owner_id);
CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_stays_tenant_id ON stays(tenant_id);
CREATE INDEX idx_stays_property_id ON stays(property_id);
CREATE INDEX idx_rent_payments_stay_id ON rent_payments(stay_id);
CREATE INDEX idx_complaints_tenant_id ON complaints(tenant_id);
CREATE INDEX idx_complaints_property_id ON complaints(property_id);
CREATE INDEX idx_reviews_property_id ON reviews(property_id);
CREATE INDEX idx_saved_properties_user_id ON saved_properties(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- ------------------------------------------------------------------------------
-- 5. ATTACH UPDATED_AT TRIGGERS
-- ------------------------------------------------------------------------------
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_owners_updated_at BEFORE UPDATE ON owners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_owner_documents_updated_at BEFORE UPDATE ON owner_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_property_images_updated_at BEFORE UPDATE ON property_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_property_videos_updated_at BEFORE UPDATE ON property_videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_visits_updated_at BEFORE UPDATE ON visits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_stays_updated_at BEFORE UPDATE ON stays FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_rent_payments_updated_at BEFORE UPDATE ON rent_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_complaints_updated_at BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_checkout_requests_updated_at BEFORE UPDATE ON checkout_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_deposit_settlements_updated_at BEFORE UPDATE ON deposit_settlements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stays ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public read access policies for published catalog
CREATE POLICY "Public properties are viewable by everyone" ON properties FOR SELECT USING (is_published = true);
CREATE POLICY "Property images are viewable by everyone" ON property_images FOR SELECT USING (true);
CREATE POLICY "Property videos are viewable by everyone" ON property_videos FOR SELECT USING (true);
CREATE POLICY "Active rooms are viewable by everyone" ON rooms FOR SELECT USING (is_active = true);
CREATE POLICY "Amenities are viewable by everyone" ON amenities FOR SELECT USING (true);
CREATE POLICY "Property amenities are viewable by everyone" ON property_amenities FOR SELECT USING (true);
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);

-- User profile privacy policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Owner management policies
CREATE POLICY "Owners can view their owner profile" ON owners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners can update their owner profile" ON owners FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners can insert their owner profile" ON owners FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can manage their properties" ON properties FOR ALL USING (
    EXISTS (SELECT 1 FROM owners WHERE owners.id = properties.owner_id AND owners.user_id = auth.uid())
);
CREATE POLICY "Owners can insert properties" ON properties FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM owners WHERE owners.id = properties.owner_id AND owners.user_id = auth.uid())
);

CREATE POLICY "Owners can manage property rooms" ON rooms FOR ALL USING (
    EXISTS (SELECT 1 FROM properties JOIN owners ON owners.id = properties.owner_id WHERE properties.id = rooms.property_id AND owners.user_id = auth.uid())
);

-- Tenant visits & bookings policies
CREATE POLICY "Tenants can view their visits" ON visits FOR SELECT USING (auth.uid() = tenant_id);
CREATE POLICY "Tenants can insert visit requests" ON visits FOR INSERT WITH CHECK (auth.uid() = tenant_id);
CREATE POLICY "Owners can view visit requests for their properties" ON visits FOR SELECT USING (
    EXISTS (SELECT 1 FROM properties JOIN owners ON owners.id = properties.owner_id WHERE properties.id = visits.property_id AND owners.user_id = auth.uid())
);

CREATE POLICY "Tenants can view their bookings" ON bookings FOR SELECT USING (auth.uid() = tenant_id);
CREATE POLICY "Tenants can insert bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = tenant_id);
CREATE POLICY "Owners can view bookings for their properties" ON bookings FOR SELECT USING (
    EXISTS (SELECT 1 FROM owners WHERE owners.id = bookings.owner_id AND owners.user_id = auth.uid())
);

-- Payments & Stays privacy policies
CREATE POLICY "Tenants can view their payments" ON payments FOR SELECT USING (auth.uid() = tenant_id);
CREATE POLICY "Tenants can view their active stays" ON stays FOR SELECT USING (auth.uid() = tenant_id);
CREATE POLICY "Tenants can view their rent payments" ON rent_payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM stays WHERE stays.id = rent_payments.stay_id AND stays.tenant_id = auth.uid())
);

-- Private documents policies (never public)
CREATE POLICY "Users can manage their private documents" ON documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Owners can view their owner verification documents" ON owner_documents FOR SELECT USING (
    EXISTS (SELECT 1 FROM owners WHERE owners.id = owner_documents.owner_id AND owners.user_id = auth.uid())
);

-- Complaints & Reviews user policies
CREATE POLICY "Tenants can manage their complaints" ON complaints FOR ALL USING (auth.uid() = tenant_id);
CREATE POLICY "Owners can view complaints for their properties" ON complaints FOR SELECT USING (
    EXISTS (SELECT 1 FROM properties JOIN owners ON owners.id = properties.owner_id WHERE properties.id = complaints.property_id AND owners.user_id = auth.uid())
);

CREATE POLICY "Users can manage their saved properties" ON saved_properties FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- Deposit settlements & checkout policies
CREATE POLICY "Tenants can view their checkout requests" ON checkout_requests FOR SELECT USING (auth.uid() = tenant_id);
CREATE POLICY "Tenants can view their deposit settlements" ON deposit_settlements FOR SELECT USING (auth.uid() = tenant_id);
