-- Add verification_status to properties table for owner/admin property verification workflow
ALTER TABLE properties ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'DRAFT';

-- Drop and recreate public_properties_view to add verification_status cleanly
DROP VIEW IF EXISTS public_properties_view CASCADE;

CREATE VIEW public_properties_view AS
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
    p.verification_status,
    p.created_at,
    p.updated_at
FROM properties p
WHERE p.is_published = true AND (p.verification_status = 'VERIFIED' OR p.verification_status IS NULL);
