-- Add sync metrics columns to integrations table
ALTER TABLE public.integrations
ADD COLUMN last_sync_total integer,
ADD COLUMN last_sync_imported integer,
ADD COLUMN last_sync_skipped integer,
ADD COLUMN last_sync_failed integer;

COMMENT ON COLUMN public.integrations.last_sync_total IS 'Total number of reviews fetched from the external API';
COMMENT ON COLUMN public.integrations.last_sync_imported IS 'Number of reviews successfully imported';
COMMENT ON COLUMN public.integrations.last_sync_skipped IS 'Number of reviews skipped (duplicates)';
COMMENT ON COLUMN public.integrations.last_sync_failed IS 'Number of reviews that failed to import';