-- Create enum types for integrations
CREATE TYPE integration_type AS ENUM ('g2', 'capterra');
CREATE TYPE sync_status AS ENUM ('pending', 'running', 'completed', 'failed');

-- Create integrations configuration table
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_type integration_type NOT NULL,
  product_id TEXT NOT NULL,
  config JSONB DEFAULT '{}'::jsonb, -- Store integration-specific config
  is_active BOOLEAN DEFAULT true,
  sync_frequency TEXT DEFAULT 'daily',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_sync_status sync_status,
  last_sync_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(integration_type, product_id)
);

-- Enable RLS on integrations table
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- RLS policies for integrations (admins only)
CREATE POLICY "Admins can view all integrations"
  ON public.integrations
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert integrations"
  ON public.integrations
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update integrations"
  ON public.integrations
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete integrations"
  ON public.integrations
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add integration tracking fields to evidence table
ALTER TABLE public.evidence 
  ADD COLUMN integration_source TEXT,
  ADD COLUMN external_id TEXT,
  ADD COLUMN external_url TEXT,
  ADD COLUMN imported_at TIMESTAMP WITH TIME ZONE;

-- Add unique constraint to prevent duplicate imports
ALTER TABLE public.evidence
  ADD CONSTRAINT unique_external_review UNIQUE(integration_source, external_id);

-- Add trigger for integrations updated_at
CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();