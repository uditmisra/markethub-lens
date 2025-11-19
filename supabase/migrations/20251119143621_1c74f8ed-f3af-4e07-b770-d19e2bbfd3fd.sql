-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Anyone authenticated can view published evidence" ON public.evidence;

-- Create new policy allowing public access to published reviews
CREATE POLICY "Public can view published evidence"
ON public.evidence
FOR SELECT
USING (
  status = 'published'::evidence_status 
  OR (auth.uid() IS NOT NULL AND (
    created_by = auth.uid() 
    OR has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'reviewer'::app_role)
  ))
);