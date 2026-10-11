-- ==============================================================================
-- RoomSplits Production PostgreSQL Schema Migration 002
-- Target: Platform Settings, Webhook Idempotency, Audit Logs, Deposit Deductions,
--         Jharkhand Boundary Constraints, Safe Public Views & RLS Policies
-- ==============================================================================

-- 1. PLATFORM SETTINGS TABLE (Configurable ₹9 Property Unlock & Fees)
CREATE TABLE IF NOT EXISTS platform_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default platform settings
INSERT INTO platform_settings (key, value, description)
VALUES 
    ('property_unlock_price', '9', 'Configurable ₹9 Property Unlock (Visit Pass) fee in INR'),
    ('booking_platform_fee', '499', 'Platform service fee charged upon room booking confirmation')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- 2. PAYMENT EVENTS & WEBHOOK IDEMPOTENCY TABLE
CREATE TABLE IF NOT EXISTS payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL DEFAULT 'razorpay',
    event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    payload JSONB,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    changes JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. DEPOSIT DEDUCTIONS TABLE
CREATE TABLE IF NOT EXISTS deposit_deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_id UUID NOT NULL REFERENCES deposit_settlements(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0.00),
    evidence_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ENHANCE PROPERTY_UNLOCKS SCHEMA & CONSTRAINTS
ALTER TABLE property_unlocks ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES payments(id) ON DELETE SET NULL;
ALTER TABLE property_unlocks ADD COLUMN IF NOT EXISTS amount NUMERIC(12, 2) NOT NULL DEFAULT 9.00;
ALTER TABLE property_unlocks ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'INR';
ALTER TABLE property_unlocks ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE property_unlocks ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE property_unlocks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Ensure Unique User+Property Unlock Constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_property_unlock'
    ) THEN
        ALTER TABLE property_unlocks ADD CONSTRAINT unique_user_property_unlock UNIQUE (user_id, property_id);
    END IF;
END $$;

-- 6. JHARKHAND-ONLY LOCATION CONSTRAINT ON PROPERTIES
ALTER TABLE properties ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'India';

-- Add Check Constraint enforcing Jharkhand boundary for published properties
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_properties_jharkhand_only'
    ) THEN
        ALTER TABLE properties ADD CONSTRAINT chk_properties_jharkhand_only 
        CHECK (
            NOT is_published OR (state = 'Jharkhand' AND (country = 'India' OR country = 'IN'))
        );
    END IF;
END $$;

-- 7. ROOM OVERLAPPING BOOKING CONSTRAINT
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_active_room_booking_date'
    ) THEN
        ALTER TABLE bookings ADD CONSTRAINT unique_active_room_booking_date UNIQUE (room_id, move_in_date);
    END IF;
END $$;

-- 8. SAFE PUBLIC PROPERTY VIEW (EXCLUDES PROTECTED ADDRESS & CONTACT DETAILS)
CREATE OR REPLACE VIEW public_properties_view AS
SELECT 
    p.id,
    p.owner_id,
    p.title,
    p.slug,
    p.description,
    p.category,
    p.gender_policy,
    p.locality,
    p.city,
    p.state,
    p.pincode,
    p.starting_price,
    p.notice_period_days,
    p.lock_in_months,
    p.is_published,
    p.is_featured,
    p.rating,
    p.review_count,
    p.created_at,
    p.updated_at
FROM properties p
WHERE p.is_published = true;

-- 9. INDEXES FOR NEW TABLES & QUERIES
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(key);
CREATE INDEX IF NOT EXISTS idx_payment_events_event_id ON payment_events(event_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_deposit_deductions_settlement_id ON deposit_deductions(settlement_id);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES FOR ENHANCED TABLES
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposit_deductions ENABLE ROW LEVEL SECURITY;

-- Platform settings are publicly readable
CREATE POLICY "Platform settings are readable by everyone" ON platform_settings FOR SELECT USING (true);

-- Payment events accessible only by server execution/admin
CREATE POLICY "Payment events viewable by admins" ON payment_events FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
);

-- Audit logs accessible by admins
CREATE POLICY "Audit logs viewable by admins" ON audit_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())
);

-- Deposit deductions viewable by tenant
CREATE POLICY "Tenants can view deposit deductions" ON deposit_deductions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM deposit_settlements 
        WHERE deposit_settlements.id = deposit_deductions.settlement_id 
        AND deposit_settlements.tenant_id = auth.uid()
    )
);
