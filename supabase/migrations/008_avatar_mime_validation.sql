-- Restrict avatar uploads to image types only and enforce 2MB limit
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'],
    file_size_limit = 2097152
WHERE id = 'avatars';
