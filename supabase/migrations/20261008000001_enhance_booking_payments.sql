-- ==============================================================================
-- RoomSplits Migration: Enhance Booking Payments Schema (Prompt 37)
-- Target: Add payment_status, razorpay order mapping, platform charges to bookings table,
--         and indexes for fast lookup and RLS policy updates.
-- ==============================================================================

-- 1. Add payment tracking columns to bookings table if not existing
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'UNPAID';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS platform_charges NUMERIC(12, 2) NOT NULL DEFAULT 499.00;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

-- 2. Add indexes for booking payment lookups
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_razorpay_order_id ON public.bookings(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tenant_id ON public.bookings(tenant_id);

-- 3. Ensure payments table has booking_id column & index
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);

-- 4. Ensure RLS Policy for Owners to view payments for their properties
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Owners can view payments for their properties'
    ) THEN
        CREATE POLICY "Owners can view payments for their properties" ON public.payments FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.properties p
                JOIN public.owners o ON o.id = p.owner_id
                WHERE (p.id = public.payments.related_property_id OR p.id = (
                    SELECT property_id FROM public.bookings b WHERE b.id = public.payments.booking_id
                ))
                AND o.user_id = auth.uid()
            )
        );
    END IF;
END $$;
