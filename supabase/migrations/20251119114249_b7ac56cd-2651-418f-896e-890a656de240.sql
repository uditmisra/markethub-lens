-- Make created_by nullable to support automated imports from integrations
ALTER TABLE public.evidence 
ALTER COLUMN created_by DROP NOT NULL;

-- Add a comment to document this behavior
COMMENT ON COLUMN public.evidence.created_by IS 'User who created the evidence. NULL for automated imports from integrations.';
