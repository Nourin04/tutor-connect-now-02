-- Update handle_new_user trigger function to copy phone to user_phones during signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.app_role;
  v_phone TEXT;
BEGIN
  v_phone := COALESCE(NEW.raw_user_meta_data ->> 'phone', '');

  -- Insert profile
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.email, ''),
    v_phone
  );

  -- Insert phone into user_phones if present
  IF v_phone <> '' THEN
    INSERT INTO public.user_phones (user_id, phone)
    VALUES (NEW.id, v_phone)
    ON CONFLICT (user_id) DO UPDATE SET phone = EXCLUDED.phone;
  END IF;

  -- Insert role
  v_role := COALESCE(
    (NEW.raw_user_meta_data ->> 'role')::public.app_role,
    'student'::public.app_role
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;
