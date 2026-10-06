-- ==============================================================================
-- RoomSplits Property Access Control & ₹9 Property Unlocks Migration
-- Target: property_unlocks Table & RLS Security Policies
-- ==============================================================================

-- 1. Create property_unlocks table
CREATE TABLE IF NOT EXISTS property_unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 9.00,
    payment_type payment_type_enum NOT NULL DEFAULT 'booking_fee',
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_property_unlock UNIQUE (user_id, property_id)
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_unlocks_user ON property_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_property_unlocks_property ON property_unlocks(property_id);

-- 3. Row Level Security (RLS)
ALTER TABLE property_unlocks ENABLE ROW LEVEL SECURITY;

-- Users can view their own unlocked properties
CREATE POLICY "Users can view their unlocked properties" ON property_unlocks 
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert unlock record upon verified payment
CREATE POLICY "Users can insert property unlock record" ON property_unlocks 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
