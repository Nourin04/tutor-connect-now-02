-- Ensure the avatars storage bucket is public in case it was created as private
UPDATE storage.buckets
SET public = true
WHERE id = 'avatars';
