-- 1. Alter public.contact_events constraint to support 'cancelled'
ALTER TABLE public.contact_events DROP CONSTRAINT IF EXISTS check_contact_events_status;
ALTER TABLE public.contact_events ADD CONSTRAINT check_contact_events_status CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled'));

-- 2. Create public.saved_tutors table
CREATE TABLE IF NOT EXISTS public.saved_tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teacher_profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, teacher_id)
);

GRANT SELECT, INSERT, DELETE ON public.saved_tutors TO authenticated;
GRANT ALL ON public.saved_tutors TO service_role;
ALTER TABLE public.saved_tutors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saved tutors"
  ON public.saved_tutors
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Create public.notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
GRANT SELECT, INSERT ON public.notifications TO anon;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage their own notifications"
  ON public.notifications
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Update reviews insert policy to require accepted status
DROP POLICY IF EXISTS "Students and parents can submit a review for a teacher they contacted" ON public.reviews;
CREATE POLICY "Students and parents can submit a review for a teacher they contacted"
  ON public.reviews FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id
    AND (public.has_role(auth.uid(), 'student') OR public.has_role(auth.uid(), 'parent'))
    AND EXISTS (
      SELECT 1 FROM public.contact_events
      WHERE viewer_id = auth.uid() AND teacher_id = reviews.teacher_id AND status = 'accepted'
    )
  );

-- 5. Trigger notifications on contact_events insert/update
CREATE OR REPLACE FUNCTION public.notify_contact_event_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_name TEXT;
  v_teacher_name TEXT;
BEGIN
  -- Get names
  SELECT full_name INTO v_student_name FROM public.profiles WHERE id = NEW.viewer_id;
  SELECT full_name INTO v_teacher_name FROM public.profiles WHERE id = NEW.teacher_id;

  -- If it's a new request (INSERT)
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.notifications (user_id, actor_id, title, message)
    VALUES (
      NEW.teacher_id,
      NEW.viewer_id,
      'New contact request',
      COALESCE(v_student_name, 'A student') || ' is interested in tuition.'
    );
  -- If it's an update (UPDATE)
  ELSIF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
    IF (NEW.status = 'accepted') THEN
      INSERT INTO public.notifications (user_id, actor_id, title, message)
      VALUES (
        NEW.viewer_id,
        NEW.teacher_id,
        'Request accepted 🎉',
        COALESCE(v_teacher_name, 'The tutor') || ' accepted your contact request.'
      );
    ELSIF (NEW.status = 'declined') THEN
      INSERT INTO public.notifications (user_id, actor_id, title, message)
      VALUES (
        NEW.viewer_id,
        NEW.teacher_id,
        'Request declined',
        COALESCE(v_teacher_name, 'The tutor') || ' declined your contact request.'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_contact_event ON public.contact_events;
CREATE TRIGGER trg_notify_contact_event
  AFTER INSERT OR UPDATE ON public.contact_events
  FOR EACH ROW EXECUTE FUNCTION public.notify_contact_event_change();
