-- Create tags table for flexible proof tagging
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('use_case', 'persona', 'competitor', 'campaign', 'sentiment')),
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(name, category)
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view tags"
  ON public.tags FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and reviewers can manage tags"
  ON public.tags FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'reviewer'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'reviewer'));

-- Junction table: evidence <-> tags (many-to-many)
CREATE TABLE public.evidence_tags (
  evidence_id UUID NOT NULL REFERENCES public.evidence(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (evidence_id, tag_id)
);

ALTER TABLE public.evidence_tags ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view evidence_tags (evidence RLS controls what evidence they can see)
CREATE POLICY "Authenticated users can view evidence_tags"
  ON public.evidence_tags FOR SELECT TO authenticated USING (true);

-- Public can view tags for published evidence
CREATE POLICY "Public can view evidence tags for published evidence"
  ON public.evidence_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.evidence
      WHERE id = evidence_id AND status = 'published'
    )
  );

CREATE POLICY "Admins and reviewers can manage evidence_tags"
  ON public.evidence_tags FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'reviewer'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'reviewer'));

-- Seed default tags
INSERT INTO public.tags (name, category) VALUES
  -- Use cases
  ('Contract Management', 'use_case'),
  ('Document Automation', 'use_case'),
  ('E-Signatures', 'use_case'),
  ('Compliance & Security', 'use_case'),
  ('Workflow Automation', 'use_case'),
  ('Template Management', 'use_case'),
  ('Team Collaboration', 'use_case'),
  -- Personas
  ('Legal Team', 'persona'),
  ('Operations', 'persona'),
  ('Sales Team', 'persona'),
  ('Finance', 'persona'),
  ('IT Admin', 'persona'),
  ('C-Suite', 'persona'),
  ('HR', 'persona'),
  -- Sentiments
  ('ROI Story', 'sentiment'),
  ('Ease of Use', 'sentiment'),
  ('Customer Support', 'sentiment'),
  ('Fast Implementation', 'sentiment'),
  ('Switching Story', 'sentiment'),
  ('Feature Praise', 'sentiment');
