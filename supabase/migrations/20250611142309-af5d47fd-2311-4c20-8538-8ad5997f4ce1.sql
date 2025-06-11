
-- Add username and password fields to gyms table for gym admin login
ALTER TABLE public.gyms 
ADD COLUMN username TEXT UNIQUE,
ADD COLUMN password_hash TEXT,
ADD COLUMN admin_email TEXT,
ADD COLUMN admin_name TEXT;

-- Add username and password fields to members table for member login
ALTER TABLE public.members 
ADD COLUMN username TEXT UNIQUE,
ADD COLUMN password_hash TEXT;

-- Create a function to hash passwords (simple version - in production use proper bcrypt)
CREATE OR REPLACE FUNCTION public.hash_password(password TEXT)
RETURNS TEXT
LANGUAGE SQL
AS $$
  SELECT encode(digest(password || 'gym_salt_2024', 'sha256'), 'hex');
$$;

-- Create authentication function for gym admins
CREATE OR REPLACE FUNCTION public.authenticate_gym_admin(input_username TEXT, input_password TEXT)
RETURNS TABLE(gym_id UUID, gym_name TEXT, is_authenticated BOOLEAN)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    g.id,
    g.name,
    (g.password_hash = public.hash_password(input_password)) as is_authenticated
  FROM public.gyms g
  WHERE g.username = input_username
  LIMIT 1;
$$;

-- Create authentication function for members
CREATE OR REPLACE FUNCTION public.authenticate_member(input_username TEXT, input_password TEXT)
RETURNS TABLE(member_id UUID, member_name TEXT, gym_id UUID, is_authenticated BOOLEAN)
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    m.id,
    m.name,
    m.gym_id,
    (m.password_hash = public.hash_password(input_password)) as is_authenticated
  FROM public.members m
  WHERE m.username = input_username
  LIMIT 1;
$$;

-- Create function for member check-in with gym QR code
CREATE OR REPLACE FUNCTION public.member_checkin_with_qr(member_id UUID, gym_qr_code TEXT)
RETURNS TABLE(success BOOLEAN, message TEXT, gym_name TEXT)
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  target_gym_id UUID;
  member_gym_id UUID;
  existing_checkin_id UUID;
  gym_name_result TEXT;
BEGIN
  -- Find gym by QR code
  SELECT id, name INTO target_gym_id, gym_name_result
  FROM public.gyms 
  WHERE gym_qr_code = member_checkin_with_qr.gym_qr_code;
  
  IF target_gym_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Invalid gym QR code', ''::TEXT;
    RETURN;
  END IF;
  
  -- Get member's gym
  SELECT gym_id INTO member_gym_id
  FROM public.members 
  WHERE id = member_checkin_with_qr.member_id;
  
  -- Check if member belongs to this gym
  IF member_gym_id != target_gym_id THEN
    RETURN QUERY SELECT FALSE, 'You are not a member of this gym', gym_name_result;
    RETURN;
  END IF;
  
  -- Check if already checked in today
  SELECT id INTO existing_checkin_id
  FROM public.attendance
  WHERE member_id = member_checkin_with_qr.member_id 
    AND date = CURRENT_DATE 
    AND check_out IS NULL;
  
  IF existing_checkin_id IS NOT NULL THEN
    -- Check out
    UPDATE public.attendance 
    SET check_out = CURRENT_TIME,
        duration = EXTRACT(EPOCH FROM (CURRENT_TIME - check_in))/60
    WHERE id = existing_checkin_id;
    
    RETURN QUERY SELECT TRUE, 'Successfully checked out', gym_name_result;
  ELSE
    -- Check in
    INSERT INTO public.attendance (member_id, gym_id, date, check_in)
    VALUES (member_checkin_with_qr.member_id, target_gym_id, CURRENT_DATE, CURRENT_TIME);
    
    RETURN QUERY SELECT TRUE, 'Successfully checked in', gym_name_result;
  END IF;
END;
$$;
