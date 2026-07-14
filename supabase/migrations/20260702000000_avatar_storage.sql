-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the avatars bucket
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar files
CREATE POLICY "Allow owner upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to update their own avatar files
CREATE POLICY "Allow owner update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to delete their own avatar files
CREATE POLICY "Allow owner delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
