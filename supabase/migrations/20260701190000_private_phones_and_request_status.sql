-- 1. Alter public.contact_events to add status column
ALTER TABLE public.contact_events
  ADD COLUMN status TEXT NOT NULL DEFAULT 'pending',
  ADD CONSTRAINT check_contact_events_status CHECK (status IN ('pending', 'accepted', 'declined'));

-- 2. Create the public.user_phones table
CREATE TABLE public.user_phones (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Copy existing phone numbers from profiles to user_phones
INSERT INTO public.user_phones (user_id, phone)
SELECT id, phone FROM public.profiles
ON CONFLICT (user_id) DO UPDATE SET phone = EXCLUDED.phone;

-- 4. Alter public.profiles.phone to be nullable and NULL out existing phones
ALTER TABLE public.profiles ALTER COLUMN phone DROP NOT NULL;
UPDATE public.profiles SET phone = NULL;

-- 5. Update the handle_new_user() trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.app_role;
BEGIN
  -- Insert profile with phone as NULL
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.email, ''),
    NULL
  );

  -- Insert phone into user_phones
  INSERT INTO public.user_phones (user_id, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'phone', '')
  )
  ON CONFLICT (user_id) DO UPDATE SET phone = EXCLUDED.phone;

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

-- 6. Enable RLS on user_phones and add security policies
ALTER TABLE public.user_phones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view authorized phones"
  ON public.user_phones
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
    OR EXISTS (
      SELECT 1 FROM public.contact_events
      WHERE status = 'accepted'
        AND (
          (viewer_id = auth.uid() AND teacher_id = user_id)
          OR
          (viewer_id = user_id AND teacher_id = auth.uid())
        )
    )
  );

CREATE POLICY "Allow users to manage own phone"
  ON public.user_phones
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. Add update policy to public.contact_events for teachers to accept/decline requests
CREATE POLICY "Teachers can update contact requests for their profile"
  ON public.contact_events
  FOR UPDATE
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_phones TO authenticated;
GRANT ALL ON public.user_phones TO service_role;
