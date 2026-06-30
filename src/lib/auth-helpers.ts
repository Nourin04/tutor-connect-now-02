import { supabase } from "@/integrations/supabase/client";

export type AppRole = "student" | "parent" | "teacher" | "admin";

export async function fetchMyRoles(): Promise<AppRole[]> {
  const { data } = await supabase.from("user_roles").select("role");
  return (data ?? []).map((r) => r.role as AppRole);
}

export async function fetchPrimaryRole(): Promise<AppRole | null> {
  const roles = await fetchMyRoles();
  const order: AppRole[] = ["admin", "teacher", "parent", "student"];
  for (const r of order) if (roles.includes(r)) return r;
  return null;
}

export function dashboardPathForRole(role: AppRole | null): string {
  if (role === "admin") return "/admin";
  return "/dashboard";
}

export function onboardingPathForRole(role: AppRole | null): string {
  if (role === "teacher") return "/onboarding/teacher";
  return "/onboarding/learner";
}
