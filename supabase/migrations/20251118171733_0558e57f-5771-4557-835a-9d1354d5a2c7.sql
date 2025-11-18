-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'reviewer', 'submitter');

-- Create enum for evidence types
CREATE TYPE public.evidence_type AS ENUM ('testimonial', 'case-study', 'review', 'quote', 'video');

-- Create enum for evidence status
CREATE TYPE public.evidence_status AS ENUM ('pending', 'approved', 'published', 'archived');

-- Create enum for product types
CREATE TYPE public.product_type AS ENUM ('platform', 'analytics', 'integration', 'api', 'other');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- User roles policies (only admins can manage roles)
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create evidence table
CREATE TABLE public.evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  job_title TEXT,
  evidence_type evidence_type NOT NULL,
  product product_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  results TEXT,
  use_cases TEXT,
  status evidence_status NOT NULL DEFAULT 'pending',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on evidence
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;

-- Evidence policies
CREATE POLICY "Anyone authenticated can view published evidence"
  ON public.evidence
  FOR SELECT
  TO authenticated
  USING (
    status = 'published' 
    OR created_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'reviewer')
  );

CREATE POLICY "Authenticated users can create evidence"
  ON public.evidence
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own evidence or admins/reviewers can update any"
  ON public.evidence
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'reviewer')
  );

CREATE POLICY "Admins can delete evidence"
  ON public.evidence
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  
  -- Assign default 'submitter' role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'submitter');
  
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_evidence
  BEFORE UPDATE ON public.evidence
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();