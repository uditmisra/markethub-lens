-- Add new columns to evidence table for richer review data
ALTER TABLE public.evidence
ADD COLUMN IF NOT EXISTS company_size text,
ADD COLUMN IF NOT EXISTS industry text,
ADD COLUMN IF NOT EXISTS rating numeric,
ADD COLUMN IF NOT EXISTS review_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS reviewer_avatar text;

-- Add comments for documentation
COMMENT ON COLUMN public.evidence.company_size IS 'Size of the reviewer company (e.g., Small Business, Mid-Market, Enterprise)';
COMMENT ON COLUMN public.evidence.industry IS 'Industry of the reviewer company';
COMMENT ON COLUMN public.evidence.rating IS 'Star rating (1-5) for reviews';
COMMENT ON COLUMN public.evidence.review_date IS 'Original date when the review was written';
COMMENT ON COLUMN public.evidence.reviewer_avatar IS 'URL to reviewer avatar image';