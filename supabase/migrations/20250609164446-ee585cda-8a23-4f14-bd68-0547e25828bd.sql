
-- Create super admin roles table
CREATE TABLE public.super_admin_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'super_admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on super_admin_roles
ALTER TABLE public.super_admin_roles ENABLE ROW LEVEL SECURITY;

-- Create policy for super admins to read their own role
CREATE POLICY "Super admins can view their own role" 
  ON public.super_admin_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create security definer function to check super admin role
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.super_admin_roles 
    WHERE super_admin_roles.user_id = is_super_admin.user_id
  );
$$;

-- Add RLS policies to gyms table for super admin access
CREATE POLICY "Super admins can view all gyms" 
  ON public.gyms 
  FOR SELECT 
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can insert gyms" 
  ON public.gyms 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can update all gyms" 
  ON public.gyms 
  FOR UPDATE 
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Super admins can delete all gyms" 
  ON public.gyms 
  FOR DELETE 
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- Enable RLS on gyms table
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
