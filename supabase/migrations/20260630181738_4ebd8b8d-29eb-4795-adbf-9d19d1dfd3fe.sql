
-- Trigger functions: revoke public execute (only called by triggers)
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recompute_teacher_rating() FROM PUBLIC, anon, authenticated;

-- RLS helpers: needed by anon + authenticated inside policies
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.get_primary_role(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_primary_role(uuid) TO authenticated;
