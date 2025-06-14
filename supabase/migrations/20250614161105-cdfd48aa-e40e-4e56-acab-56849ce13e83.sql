
-- Create membership plans table for each gym
CREATE TABLE public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('daily', 'monthly', '3_month', '6_month', 'yearly')),
  price DECIMAL(10,2) NOT NULL,
  duration_days INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(gym_id, plan_type)
);

-- Enable RLS
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;

-- RLS policies for membership plans
CREATE POLICY "Gym admins can manage their own membership plans"
ON public.membership_plans
FOR ALL
USING (true);

-- Add membership_plan_id to members table
ALTER TABLE public.members 
ADD COLUMN membership_plan_id UUID REFERENCES public.membership_plans(id),
ADD COLUMN membership_start_date DATE,
ADD COLUMN membership_end_date DATE;

-- Update payments table to reference membership plan
ALTER TABLE public.payments 
ADD COLUMN membership_plan_id UUID REFERENCES public.membership_plans(id);

-- Create trigger for updating updated_at
CREATE TRIGGER update_membership_plans_updated_at
    BEFORE UPDATE ON public.membership_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default membership plans for existing gyms
INSERT INTO public.membership_plans (gym_id, plan_name, plan_type, price, duration_days)
SELECT 
  id as gym_id,
  'Daily Pass' as plan_name,
  'daily' as plan_type,
  10.00 as price,
  1 as duration_days
FROM public.gyms
UNION ALL
SELECT 
  id as gym_id,
  'Monthly Membership' as plan_name,
  'monthly' as plan_type,
  50.00 as price,
  30 as duration_days
FROM public.gyms
UNION ALL
SELECT 
  id as gym_id,
  '3-Month Membership' as plan_name,
  '3_month' as plan_type,
  135.00 as price,
  90 as duration_days
FROM public.gyms
UNION ALL
SELECT 
  id as gym_id,
  '6-Month Membership' as plan_name,
  '6_month' as plan_type,
  240.00 as price,
  180 as duration_days
FROM public.gyms
UNION ALL
SELECT 
  id as gym_id,
  'Yearly Membership' as plan_name,
  'yearly' as plan_type,
  400.00 as price,
  365 as duration_days
FROM public.gyms;
