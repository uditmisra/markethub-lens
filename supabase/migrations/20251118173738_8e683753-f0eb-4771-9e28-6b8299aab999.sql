-- Create storage bucket for evidence attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence-attachments', 'evidence-attachments', true);

-- Create RLS policies for evidence-attachments bucket
CREATE POLICY "Anyone can view evidence attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'evidence-attachments');

CREATE POLICY "Authenticated users can upload evidence attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'evidence-attachments' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own evidence attachments"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'evidence-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own evidence attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'evidence-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add file_url column to evidence table
ALTER TABLE public.evidence
ADD COLUMN file_url TEXT;

-- Add comment
COMMENT ON COLUMN public.evidence.file_url IS 'URL to uploaded file in storage (logo, attachment, etc)';