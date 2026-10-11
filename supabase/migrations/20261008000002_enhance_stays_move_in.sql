-- ==============================================================================
-- RoomSplits Migration: Enhance Stays Schema & Move-In Lifecycle (Prompt 38)
-- Target: Add move_in_date, monthly_rent, security_deposit columns to stays,
--         indexes, unique constraint on booking_id, and owner RLS policy.
-- ==============================================================================

-- 1. Ensure monthly_rent, security_deposit, and move_in_date columns exist in stays table
ALTER TABLE public.stays ADD COLUMN IF NOT EXISTS move_in_date DATE;
ALTER TABLE public.stays ADD COLUMN IF NOT EXISTS monthly_rent NUMERIC(12, 2);
ALTER TABLE public.stays ADD COLUMN IF NOT EXISTS security_deposit NUMERIC(12, 2);

-- Update move_in_date from start_date if null
UPDATE public.stays SET move_in_date = start_date WHERE move_in_date IS NULL AND start_date IS NOT NULL;

-- 2. Add indexes for stay lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_stays_booking_id_unique ON public.stays(booking_id);
CREATE INDEX IF NOT EXISTS idx_stays_tenant_id ON public.stays(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stays_property_id ON public.stays(property_id);
CREATE INDEX IF NOT EXISTS idx_stays_status ON public.stays(status);

-- 3. Ensure RLS Policy for Owners to view stays for their properties
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'stays' AND policyname = 'Owners can view stays for their properties'
    ) THEN
        CREATE POLICY "Owners can view stays for their properties" ON public.stays FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.properties p
                JOIN public.owners o ON o.id = p.owner_id
                WHERE p.id = public.stays.property_id AND o.user_id = auth.uid()
            )
        );
    END IF;
END $$;
