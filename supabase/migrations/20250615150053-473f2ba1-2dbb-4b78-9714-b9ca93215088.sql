
--
-- Drops the old authentication functions for gym admins and members.
--
DROP FUNCTION IF EXISTS public.authenticate_gym_admin(text, text);
DROP FUNCTION IF EXISTS public.authenticate_member(text, text);

--
-- Creates a new unified authentication function `authenticate_user`.
-- This function checks if the provided credentials belong to a gym admin or a member.
--
CREATE OR REPLACE FUNCTION public.authenticate_user(p_username text, p_password text)
RETURNS TABLE(
  user_type text,
  user_id uuid,
  user_name text,
  gym_id uuid,
  gym_name text,
  is_authenticated boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rec record;
BEGIN
  -- First, attempt to authenticate as a gym admin.
  FOR rec IN 
    SELECT 
      'gym_admin' AS type, 
      g.id AS u_id, 
      g.admin_name AS u_name, 
      g.id AS g_id, 
      g.name AS g_name, 
      (g.password_hash = public.hash_password(p_password)) AS authenticated 
    FROM public.gyms g 
    WHERE g.username = p_username 
  LOOP
    user_type := rec.type;
    user_id := rec.u_id;
    user_name := rec.u_name;
    gym_id := rec.g_id;
    gym_name := rec.g_name;
    is_authenticated := rec.authenticated;
    RETURN NEXT;
    RETURN;
  END LOOP;

  -- If not a gym admin, attempt to authenticate as a member.
  FOR rec IN 
    SELECT 
      'member' AS type, 
      m.id AS u_id, 
      m.name AS u_name, 
      m.gym_id AS g_id, 
      (SELECT g.name FROM public.gyms g WHERE g.id = m.gym_id) AS g_name, 
      (m.password_hash = public.hash_password(p_password)) AS authenticated 
    FROM public.members m 
    WHERE m.username = p_username 
  LOOP
    user_type := rec.type;
    user_id := rec.u_id;
    user_name := rec.u_name;
    gym_id := rec.g_id;
    gym_name := rec.g_name;
    is_authenticated := rec.authenticated;
    RETURN NEXT;
    RETURN;
  END LOOP;

  RETURN;
END;
$$;
