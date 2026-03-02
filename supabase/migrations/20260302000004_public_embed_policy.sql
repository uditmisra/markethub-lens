-- Allow anonymous (unauthenticated) access to published evidence
-- Required for the public /embed widget and /testimonials pages to work
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'evidence' AND policyname = 'Public can view published evidence'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Public can view published evidence"
        ON public.evidence
        FOR SELECT
        TO anon
        USING (status = 'published')
    $policy$;
  END IF;
END $$;
