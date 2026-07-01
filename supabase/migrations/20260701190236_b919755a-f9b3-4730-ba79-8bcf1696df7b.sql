
-- Add request/accept/decline flow to contact_events
CREATE TYPE public.contact_request_status AS ENUM ('pending','accepted','declined');

ALTER TABLE public.contact_events
  ADD COLUMN status public.contact_request_status NOT NULL DEFAULT 'pending',
  ADD COLUMN message TEXT NOT NULL DEFAULT '',
  ADD COLUMN decided_at TIMESTAMPTZ,
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- One pending/accepted request per (viewer, teacher). Prevent duplicate open requests.
CREATE UNIQUE INDEX contact_events_unique_open
  ON public.contact_events (viewer_id, teacher_id)
  WHERE status <> 'declined';

-- Restrict INSERT to pending status only (student cannot self-approve)
DROP POLICY IF EXISTS "Authenticated users can log contact events" ON public.contact_events;
CREATE POLICY "Learners can request contact"
  ON public.contact_events FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = viewer_id
    AND status = 'pending'
    AND (public.has_role(auth.uid(),'student') OR public.has_role(auth.uid(),'parent'))
  );

-- Teacher can accept/decline their own incoming requests
CREATE POLICY "Teacher can decide own requests"
  ON public.contact_events FOR UPDATE TO authenticated
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- Viewer can withdraw (delete) pending requests
CREATE POLICY "Viewer can withdraw pending"
  ON public.contact_events FOR DELETE TO authenticated
  USING (auth.uid() = viewer_id AND status = 'pending');

CREATE TRIGGER trg_contact_events_updated
  BEFORE UPDATE ON public.contact_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Tighten review policy: only after an ACCEPTED contact request
DROP POLICY IF EXISTS "Students and parents can submit a review for a teacher they con" ON public.reviews;
CREATE POLICY "Learners can review teachers who accepted contact"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id
    AND (public.has_role(auth.uid(),'student') OR public.has_role(auth.uid(),'parent'))
    AND EXISTS (
      SELECT 1 FROM public.contact_events ce
      WHERE ce.viewer_id = auth.uid()
        AND ce.teacher_id = reviews.teacher_id
        AND ce.status = 'accepted'
    )
  );

-- Create a secured view so learners never read teacher email/phone until accepted.
-- Base profiles table already restricts SELECT via existing policies (teachers publicly viewable by name).
-- We rely on application code to hide email/phone until an accepted request exists,
-- but also add a helper function that returns contact details only when authorized.
CREATE OR REPLACE FUNCTION public.get_teacher_contact(_teacher_id UUID)
RETURNS TABLE(email TEXT, phone TEXT)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  IF auth.uid() = _teacher_id
     OR public.has_role(auth.uid(),'admin')
     OR EXISTS (
       SELECT 1 FROM public.contact_events
       WHERE viewer_id = auth.uid() AND teacher_id = _teacher_id AND status = 'accepted'
     ) THEN
    RETURN QUERY SELECT p.email, p.phone FROM public.profiles p WHERE p.id = _teacher_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.get_teacher_contact(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_teacher_contact(UUID) TO authenticated;
