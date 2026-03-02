-- ============================================================
-- Workspace config: stores allowed email domain for signup
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workspace_config (
  id   INT PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- singleton
  allowed_domain TEXT NOT NULL
);

INSERT INTO public.workspace_config (id, allowed_domain)
VALUES (1, 'spotdraft.com')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.workspace_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read workspace config"
  ON public.workspace_config FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can update workspace config"
  ON public.workspace_config FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- Server-side domain enforcement: trigger on auth.users
-- ============================================================
CREATE OR REPLACE FUNCTION public.enforce_workspace_domain()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_allowed TEXT;
  v_user_domain TEXT;
BEGIN
  SELECT allowed_domain INTO v_allowed FROM public.workspace_config LIMIT 1;

  -- No restriction configured — allow all
  IF v_allowed IS NULL THEN
    RETURN NEW;
  END IF;

  v_user_domain := lower(split_part(NEW.email, '@', 2));

  IF v_user_domain != lower(v_allowed) THEN
    RAISE EXCEPTION 'Sign-ups are restricted to @% email addresses.', v_allowed;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER enforce_workspace_domain
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.enforce_workspace_domain();

-- ============================================================
-- Shared workspace RLS: all authenticated workspace members
-- can read all evidence (not just their own / published)
-- ============================================================
DROP POLICY IF EXISTS "Anyone authenticated can view published evidence" ON public.evidence;

CREATE POLICY "Workspace members can view all evidence"
  ON public.evidence
  FOR SELECT
  TO authenticated
  USING (true);
