
-- =========================================================================
-- ENUMS
-- =========================================================================
CREATE TYPE public.app_role AS ENUM ('student', 'parent', 'teacher', 'admin');
CREATE TYPE public.teaching_mode AS ENUM ('online', 'offline', 'both');
CREATE TYPE public.gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- =========================================================================
-- updated_at trigger helper
-- =========================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================================
-- PROFILES
-- =========================================================================
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL DEFAULT '',
  email        TEXT NOT NULL DEFAULT '',
  phone        TEXT NOT NULL DEFAULT '',
  avatar_url   TEXT,
  city         TEXT,
  area         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT ON public.profiles TO anon;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================================
-- USER ROLES + has_role helper (security definer to avoid RLS recursion)
-- =========================================================================
CREATE TABLE public.user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_primary_role(_user_id UUID)
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
  ORDER BY CASE role
    WHEN 'admin' THEN 1
    WHEN 'teacher' THEN 2
    WHEN 'parent' THEN 3
    WHEN 'student' THEN 4
  END LIMIT 1;
$$;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage any profile"
  ON public.profiles FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- user_roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- TEACHER PROFILES
-- =========================================================================
CREATE TABLE public.teacher_profiles (
  user_id          UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  bio              TEXT NOT NULL DEFAULT '',
  highest_degree   TEXT,
  university       TEXT,
  years_experience INTEGER NOT NULL DEFAULT 0,
  certifications   TEXT[] NOT NULL DEFAULT '{}',
  other_experience TEXT[] NOT NULL DEFAULT '{}',
  available_days   TEXT[] NOT NULL DEFAULT '{}',
  time_slots       TEXT[] NOT NULL DEFAULT '{}',
  mode             public.teaching_mode NOT NULL DEFAULT 'both',
  fee_min          INTEGER NOT NULL DEFAULT 0,
  fee_max          INTEGER NOT NULL DEFAULT 0,
  gender           public.gender_type,
  languages        TEXT[] NOT NULL DEFAULT '{}',
  rating_avg       NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count     INTEGER NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  completion_step  INTEGER NOT NULL DEFAULT 0, -- highest section completed (0-4)
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_profiles TO authenticated;
GRANT SELECT ON public.teacher_profiles TO anon;
GRANT ALL ON public.teacher_profiles TO service_role;

ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_teacher_profiles_updated BEFORE UPDATE ON public.teacher_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Active teacher profiles are viewable by everyone"
  ON public.teacher_profiles FOR SELECT
  USING (is_active = true OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can insert their own profile"
  ON public.teacher_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Teachers can update their own profile"
  ON public.teacher_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage any teacher profile"
  ON public.teacher_profiles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- TEACHER SUBJECTS
-- =========================================================================
CREATE TABLE public.teacher_subjects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.teacher_profiles(user_id) ON DELETE CASCADE,
  subject    TEXT NOT NULL,
  level      TEXT NOT NULL, -- e.g. "Class 9-10", "Class 11-12", "Undergraduate"
  board      TEXT NOT NULL, -- "CBSE" | "ICSE" | "State" | "IB" | "IGCSE" | "Other"
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_teacher_subjects_teacher ON public.teacher_subjects(teacher_id);
CREATE INDEX idx_teacher_subjects_subject ON public.teacher_subjects(subject);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_subjects TO authenticated;
GRANT SELECT ON public.teacher_subjects TO anon;
GRANT ALL ON public.teacher_subjects TO service_role;

ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teacher subjects are viewable by everyone"
  ON public.teacher_subjects FOR SELECT USING (true);

CREATE POLICY "Teachers manage their own subjects"
  ON public.teacher_subjects FOR ALL
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Admins can manage any teacher subject"
  ON public.teacher_subjects FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- STUDENT PROFILES (used for both 'student' and 'parent' roles)
-- =========================================================================
CREATE TABLE public.student_profiles (
  user_id              UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_grade          TEXT,
  mode_preference      public.teaching_mode NOT NULL DEFAULT 'both',
  subjects_of_interest TEXT[] NOT NULL DEFAULT '{}',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_profiles TO authenticated;
GRANT ALL ON public.student_profiles TO service_role;

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_student_profiles_updated BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Users can view their own student profile"
  ON public.student_profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own student profile"
  ON public.student_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own student profile"
  ON public.student_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage any student profile"
  ON public.student_profiles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- CONTACT EVENTS
-- =========================================================================
CREATE TABLE public.contact_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.teacher_profiles(user_id) ON DELETE CASCADE,
  viewer_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contact_events_teacher ON public.contact_events(teacher_id);
CREATE INDEX idx_contact_events_viewer ON public.contact_events(viewer_id);

GRANT SELECT, INSERT ON public.contact_events TO authenticated;
GRANT ALL ON public.contact_events TO service_role;

ALTER TABLE public.contact_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Viewer can see own contact events"
  ON public.contact_events FOR SELECT USING (auth.uid() = viewer_id);

CREATE POLICY "Teacher can see contact events on their profile"
  ON public.contact_events FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Admins can view all contact events"
  ON public.contact_events FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can log contact events"
  ON public.contact_events FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- =========================================================================
-- REVIEWS
-- =========================================================================
CREATE TABLE public.reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  UUID NOT NULL REFERENCES public.teacher_profiles(user_id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL,
  comment     TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, reviewer_id),
  CHECK (rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_reviews_teacher ON public.reviews(teacher_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_reviews_updated BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Students and parents can submit a review for a teacher they contacted"
  ON public.reviews FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id
    AND (public.has_role(auth.uid(), 'student') OR public.has_role(auth.uid(), 'parent'))
    AND EXISTS (
      SELECT 1 FROM public.contact_events
      WHERE viewer_id = auth.uid() AND teacher_id = reviews.teacher_id
    )
  );

CREATE POLICY "Reviewers can update their own review"
  ON public.reviews FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Reviewers can delete their own review"
  ON public.reviews FOR DELETE USING (auth.uid() = reviewer_id);

CREATE POLICY "Admins can manage any review"
  ON public.reviews FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================================
-- Recompute teacher rating after review change
-- =========================================================================
CREATE OR REPLACE FUNCTION public.recompute_teacher_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  t_id UUID;
BEGIN
  t_id := COALESCE(NEW.teacher_id, OLD.teacher_id);
  UPDATE public.teacher_profiles
  SET rating_avg = COALESCE((SELECT ROUND(AVG(rating)::numeric, 2) FROM public.reviews WHERE teacher_id = t_id), 0),
      rating_count = (SELECT COUNT(*) FROM public.reviews WHERE teacher_id = t_id)
  WHERE user_id = t_id;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_reviews_recompute_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.recompute_teacher_rating();

-- =========================================================================
-- Auto-create profile + role on signup
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', '')
  );

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

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
