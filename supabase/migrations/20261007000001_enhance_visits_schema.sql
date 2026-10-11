-- Enhance visits table with owner feedback, alternate slots, and RLS update policies

ALTER TABLE public.visits
  ADD COLUMN IF NOT EXISTS alternate_date DATE,
  ADD COLUMN IF NOT EXISTS alternate_slot TEXT,
  ADD COLUMN IF NOT EXISTS owner_notes TEXT,
  ADD COLUMN IF NOT EXISTS owner_proposed_date DATE,
  ADD COLUMN IF NOT EXISTS owner_proposed_slot TEXT;

-- Update RLS policies for tenant & owner updates
DROP POLICY IF EXISTS "Tenants can update their own visits" ON public.visits;
CREATE POLICY "Tenants can update their own visits" ON public.visits
  FOR UPDATE USING (auth.uid() = tenant_id);

DROP POLICY IF EXISTS "Owners can update visit requests for their properties" ON public.visits;
CREATE POLICY "Owners can update visit requests for their properties" ON public.visits
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM properties
      JOIN owners ON owners.id = properties.owner_id
      WHERE properties.id = visits.property_id AND owners.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage all visits" ON public.visits;
CREATE POLICY "Admins can manage all visits" ON public.visits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
