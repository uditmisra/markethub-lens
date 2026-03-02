-- ============================================================
-- Story Request Campaigns
-- ============================================================
CREATE TABLE public.campaigns (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  message     TEXT,  -- custom message shown on submit page
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view campaigns"
  ON public.campaigns FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and reviewers can manage campaigns"
  ON public.campaigns FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'reviewer'))
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'reviewer'));

-- Link evidence submissions to a campaign
ALTER TABLE public.evidence
  ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_evidence_campaign ON public.evidence(campaign_id);

-- ============================================================
-- Proof Analytics Events
-- ============================================================
CREATE TABLE public.proof_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id UUID NOT NULL REFERENCES public.evidence(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL CHECK (event_type IN ('view', 'copy')),
  format      TEXT,   -- pull-quote | email | landing-page | social | case-study
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_proof_events_evidence ON public.proof_events(evidence_id);
CREATE INDEX idx_proof_events_type     ON public.proof_events(event_type);

ALTER TABLE public.proof_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can insert events"
  ON public.proof_events FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Workspace members can view events"
  ON public.proof_events FOR SELECT TO authenticated USING (true);

-- ============================================================
-- Updated_at trigger for campaigns
-- ============================================================
CREATE OR REPLACE TRIGGER handle_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
