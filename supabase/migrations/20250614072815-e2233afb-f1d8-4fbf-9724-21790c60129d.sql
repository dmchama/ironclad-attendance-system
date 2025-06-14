
-- Fix the ambiguous column reference in member_checkin_with_qr function
CREATE OR REPLACE FUNCTION public.member_checkin_with_qr(member_id uuid, gym_qr_code text)
 RETURNS TABLE(success boolean, message text, gym_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  target_gym_id UUID;
  member_gym_id UUID;
  existing_checkin_id UUID;
  gym_name_result TEXT;
BEGIN
  -- Find gym by QR code (explicitly qualify the column)
  SELECT g.id, g.name INTO target_gym_id, gym_name_result
  FROM public.gyms g
  WHERE g.gym_qr_code = member_checkin_with_qr.gym_qr_code;
  
  IF target_gym_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Invalid gym QR code', ''::TEXT;
    RETURN;
  END IF;
  
  -- Get member's gym
  SELECT m.gym_id INTO member_gym_id
  FROM public.members m
  WHERE m.id = member_checkin_with_qr.member_id;
  
  -- Check if member belongs to this gym
  IF member_gym_id != target_gym_id THEN
    RETURN QUERY SELECT FALSE, 'You are not a member of this gym', gym_name_result;
    RETURN;
  END IF;
  
  -- Check if already checked in today
  SELECT a.id INTO existing_checkin_id
  FROM public.attendance a
  WHERE a.member_id = member_checkin_with_qr.member_id 
    AND a.date = CURRENT_DATE 
    AND a.check_out IS NULL;
  
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
$function$
