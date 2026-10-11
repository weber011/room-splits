-- ==============================================================================
-- RoomSplits Migration: Enhance Rent Payments Schema & Protection (Prompt 39)
-- Target: Extend rent_payments with period dates, razorpay order mapping,
--         unique billing constraint, and RLS policies for tenant & owner access.
-- ==============================================================================

-- 1. Extend rent_payments table columns if not exists
ALTER TABLE public.rent_payments ADD COLUMN IF NOT EXISTS period_start DATE;
ALTER TABLE public.rent_payments ADD COLUMN IF NOT EXISTS period_end DATE;
ALTER TABLE public.rent_payments ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE public.rent_payments ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE public.rent_payments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- Populate period_start from billing_month where null
UPDATE public.rent_payments SET period_start = billing_month WHERE period_start IS NULL AND billing_month IS NOT NULL;

-- Populate tenant_id from stays table where null
UPDATE public.rent_payments SET tenant_id = s.tenant_id 
FROM public.stays s 
WHERE public.rent_payments.stay_id = s.id AND public.rent_payments.tenant_id IS NULL;

-- 2. Database-level Idempotency Constraint: Unique rent payment per stay + billing_month
CREATE UNIQUE INDEX IF NOT EXISTS idx_rent_payments_stay_billing_month ON public.rent_payments(stay_id, billing_month);

-- 3. Additional Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_rent_payments_stay_id ON public.rent_payments(stay_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_tenant_id ON public.rent_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_razorpay_order_id ON public.rent_payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_status ON public.rent_payments(status);

-- 4. Enable Row-Level Security (RLS) on rent_payments
ALTER TABLE public.rent_payments ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policy: Tenants can view their own rent payments
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'rent_payments' AND policyname = 'Tenants can view their rent payments'
    ) THEN
        CREATE POLICY "Tenants can view their rent payments" ON public.rent_payments FOR SELECT 
        USING (
            tenant_id = auth.uid() 
            OR EXISTS (SELECT 1 FROM public.stays s WHERE s.id = public.rent_payments.stay_id AND s.tenant_id = auth.uid())
        );
    END IF;
END $$;

-- 6. RLS Policy: Owners can view rent payments for stays in their properties
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'rent_payments' AND policyname = 'Owners can view rent payments for their properties'
    ) THEN
        CREATE POLICY "Owners can view rent payments for their properties" ON public.rent_payments FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.stays s
                JOIN public.properties p ON p.id = s.property_id
                JOIN public.owners o ON o.id = p.owner_id
                WHERE s.id = public.rent_payments.stay_id AND o.user_id = auth.uid()
            )
        );
    END IF;
END $$;
