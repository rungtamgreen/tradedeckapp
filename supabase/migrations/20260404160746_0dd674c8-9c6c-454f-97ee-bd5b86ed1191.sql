
-- Add a notes column to jobs for general job notes
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS notes text;

-- Create storage bucket for job photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-photos', 'job-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: users can upload to their own folder (user_id prefix)
CREATE POLICY "Users can upload job photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'job-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own job photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'job-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own job photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'job-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Anyone can view public job photos (for sharing)
CREATE POLICY "Public can view job photos"
ON storage.objects FOR SELECT TO anon
USING (bucket_id = 'job-photos');
