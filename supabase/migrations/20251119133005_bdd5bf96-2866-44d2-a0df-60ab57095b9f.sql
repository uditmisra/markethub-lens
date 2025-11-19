-- Add review_data column to store structured Q&A pairs from integrations
ALTER TABLE public.evidence
ADD COLUMN review_data JSONB DEFAULT NULL;

-- Add index for better performance when querying review_data
CREATE INDEX idx_evidence_review_data ON public.evidence USING GIN (review_data);

-- Add comment for documentation
COMMENT ON COLUMN public.evidence.review_data IS 'Structured JSON data for reviews containing Q&A pairs like love, hate, problems_solving, etc.';