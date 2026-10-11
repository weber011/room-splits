-- ==============================================================================
-- RoomSplits Supabase Storage Buckets & RLS Security Migration
-- Target: 6 Logical Buckets (2 Public, 4 Private) with Strict Access Control
-- ==============================================================================

-- 1. INITIALIZE STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('property-images', 'property-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('property-videos', 'property-videos', true, 52428800, ARRAY['video/mp4', 'video/webm']),
  ('owner-documents', 'owner-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('stay-documents', 'stay-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('complaint-attachments', 'complaint-attachments', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. STORAGE RLS POLICIES FOR PUBLIC DISCOVERY MEDIA

-- Property Images (Public Read, Owner/Admin Write)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read for Property Images') THEN
        CREATE POLICY "Public Read for Property Images" ON storage.objects 
            FOR SELECT USING (bucket_id = 'property-images');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owners Can Upload Property Images') THEN
        CREATE POLICY "Owners Can Upload Property Images" ON storage.objects 
            FOR INSERT WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owners Can Delete Property Images') THEN
        CREATE POLICY "Owners Can Delete Property Images" ON storage.objects 
            FOR DELETE USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- Property Videos (Public Read, Owner/Admin Write)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read for Property Videos') THEN
        CREATE POLICY "Public Read for Property Videos" ON storage.objects 
            FOR SELECT USING (bucket_id = 'property-videos');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owners Can Upload Property Videos') THEN
        CREATE POLICY "Owners Can Upload Property Videos" ON storage.objects 
            FOR INSERT WITH CHECK (bucket_id = 'property-videos' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- 3. STORAGE RLS POLICIES FOR PRIVATE DOCUMENTS (NO PUBLIC ACCESS)

-- Owner Documents (Strictly Private)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owners Can Read Own Documents') THEN
        CREATE POLICY "Owners Can Read Own Documents" ON storage.objects 
            FOR SELECT USING (bucket_id = 'owner-documents' AND auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Owners Can Upload Own Documents') THEN
        CREATE POLICY "Owners Can Upload Own Documents" ON storage.objects 
            FOR INSERT WITH CHECK (bucket_id = 'owner-documents' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- Stay Documents (Strictly Private)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authorized Users Can Read Stay Documents') THEN
        CREATE POLICY "Authorized Users Can Read Stay Documents" ON storage.objects 
            FOR SELECT USING (bucket_id = 'stay-documents' AND auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authorized Users Can Upload Stay Documents') THEN
        CREATE POLICY "Authorized Users Can Upload Stay Documents" ON storage.objects 
            FOR INSERT WITH CHECK (bucket_id = 'stay-documents' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- Complaint Attachments (Strictly Private)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authorized Users Can Read Complaint Attachments') THEN
        CREATE POLICY "Authorized Users Can Read Complaint Attachments" ON storage.objects 
            FOR SELECT USING (bucket_id = 'complaint-attachments' AND auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authorized Users Can Upload Complaint Attachments') THEN
        CREATE POLICY "Authorized Users Can Upload Complaint Attachments" ON storage.objects 
            FOR INSERT WITH CHECK (bucket_id = 'complaint-attachments' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- Avatars (Public Read, Authenticated Write)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Read for Avatars') THEN
        CREATE POLICY "Public Read for Avatars" ON storage.objects 
            FOR SELECT USING (bucket_id = 'avatars');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users Can Upload Avatars') THEN
        CREATE POLICY "Users Can Upload Avatars" ON storage.objects 
            FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
    END IF;
END $$;
