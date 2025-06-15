
-- Insert default membership plans for gyms that don't have plans yet
INSERT INTO public.membership_plans (gym_id, plan_name, plan_type, price, duration_days)
SELECT 
  g.id as gym_id,
  'Daily Pass' as plan_name,
  'daily' as plan_type,
  10.00 as price,
  1 as duration_days
FROM public.gyms g
WHERE NOT EXISTS (
  SELECT 1 FROM public.membership_plans mp 
  WHERE mp.gym_id = g.id AND mp.plan_type = 'daily'
)
UNION ALL
SELECT 
  g.id as gym_id,
  'Monthly Membership' as plan_name,
  'monthly' as plan_type,
  50.00 as price,
  30 as duration_days
FROM public.gyms g
WHERE NOT EXISTS (
  SELECT 1 FROM public.membership_plans mp 
  WHERE mp.gym_id = g.id AND mp.plan_type = 'monthly'
)
UNION ALL
SELECT 
  g.id as gym_id,
  '3-Month Membership' as plan_name,
  '3_month' as plan_type,
  135.00 as price,
  90 as duration_days
FROM public.gyms g
WHERE NOT EXISTS (
  SELECT 1 FROM public.membership_plans mp 
  WHERE mp.gym_id = g.id AND mp.plan_type = '3_month'
)
UNION ALL
SELECT 
  g.id as gym_id,
  '6-Month Membership' as plan_name,
  '6_month' as plan_type,
  240.00 as price,
  180 as duration_days
FROM public.gyms g
WHERE NOT EXISTS (
  SELECT 1 FROM public.membership_plans mp 
  WHERE mp.gym_id = g.id AND mp.plan_type = '6_month'
)
UNION ALL
SELECT 
  g.id as gym_id,
  'Yearly Membership' as plan_name,
  'yearly' as plan_type,
  400.00 as price,
  365 as duration_days
FROM public.gyms g
WHERE NOT EXISTS (
  SELECT 1 FROM public.membership_plans mp 
  WHERE mp.gym_id = g.id AND mp.plan_type = 'yearly'
);

-- Create a trigger function to automatically create default membership plans for new gyms
CREATE OR REPLACE FUNCTION public.create_default_membership_plans()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default membership plans for the new gym
  INSERT INTO public.membership_plans (gym_id, plan_name, plan_type, price, duration_days) VALUES
    (NEW.id, 'Daily Pass', 'daily', 10.00, 1),
    (NEW.id, 'Monthly Membership', 'monthly', 50.00, 30),
    (NEW.id, '3-Month Membership', '3_month', 135.00, 90),
    (NEW.id, '6-Month Membership', '6_month', 240.00, 180),
    (NEW.id, 'Yearly Membership', 'yearly', 400.00, 365);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to run after gym insertion
CREATE TRIGGER create_membership_plans_on_gym_creation
  AFTER INSERT ON public.gyms
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_membership_plans();
