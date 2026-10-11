-- ==============================================================================
-- RoomSplits Migration: Enhance Payments & Razorpay Integration Schema
-- Target: Extend payment types, statuses, Razorpay order mapping, and indexes
-- ==============================================================================

-- 1. Ensure Enum values or compatibility for Razorpay Payment Types & Statuses
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_type_enum') THEN
        ALTER TYPE payment_type_enum ADD VALUE IF NOT EXISTS 'PROPERTY_UNLOCK';
        ALTER TYPE payment_type_enum ADD VALUE IF NOT EXISTS 'ROOM_BOOKING';
        ALTER TYPE payment_type_enum ADD VALUE IF NOT EXISTS 'SECURITY_DEPOSIT';
        ALTER TYPE payment_type_enum ADD VALUE IF NOT EXISTS 'MONTHLY_RENT';
        ALTER TYPE payment_type_enum ADD VALUE IF NOT EXISTS 'property_unlock';
    END IF;

    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
        ALTER TYPE payment_status_enum ADD VALUE IF NOT EXISTS 'CREATED';
        ALTER TYPE payment_status_enum ADD VALUE IF NOT EXISTS 'ORDER_CREATED';
        ALTER TYPE payment_status_enum ADD VALUE IF NOT EXISTS 'PENDING';
        ALTER TYPE payment_status_enum ADD VALUE IF NOT EXISTS 'AUTHORIZED';
        ALTER TYPE payment_status_enum ADD VALUE IF NOT EXISTS 'CAPTURED';
        ALTER TYPE payment_status_enum ADD VALUE IF NOT EXISTS 'CANCELLED';
    END IF;
END $$;

-- 2. Add missing fields to payments table for complete Razorpay audit trail
ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS related_property_id UUID REFERENCES properties(id) ON DELETE SET NULL;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS related_stay_id UUID REFERENCES stays(id) ON DELETE SET NULL;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Populate user_id from tenant_id for existing payment records if any
UPDATE payments SET user_id = tenant_id WHERE user_id IS NULL AND tenant_id IS NOT NULL;

-- 3. Indexes for fast payment & order lookups
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_related_property_id ON payments(related_property_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- 4. Ensure RLS on payments table allows tenant access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Users can view their own payments'
    ) THEN
        CREATE POLICY "Users can view their own payments" ON payments FOR SELECT 
        USING (auth.uid() = user_id OR auth.uid() = tenant_id);
    END IF;
END $$;
