import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/site/AppHeader";
import { AppFooter } from "@/components/site/AppFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Star, Inbox, Pencil, Search, MessageCircle, GraduationCap, Hourglass } from "lucide-react";
import { fetchPrimaryRole, type AppRole, dashboardPathForRole } from "@/lib/auth-helpers";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<AppRole | null>(null);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const r = await fetchPrimaryRole();
      setRole(r);
      if (r === "admin") {
        navigate({ to: "/admin", replace: true });
        return;
      }
      const { data: p } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      setMe(p);
      setLoading(false);
    })();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="mx-auto max-w-5xl p-10 text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-3xl font-bold tracking-tight">{me?.full_name || "Your dashboard"}</h1>
          <Badge className="mt-2 bg-primary-soft text-primary border-0 capitalize">{role}</Badge>
        </div>

        {role === "teacher" ? <TeacherDashboard /> : <LearnerDashboard />}
      </main>
      <AppFooter />
    </div>
  );
}

function TeacherDashboard() {
  const [tp, setTp] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setUserId(u.user.id);
      const [tpRes, rRes, pRes, aRes, sRes] = await Promise.all([
        supabase.from("teacher_profiles").select("*").eq("user_id", u.user.id).maybeSingle(),
        supabase.from("reviews").select("id, rating, comment, created_at, profiles!reviews_reviewer_id_fkey(full_name)").eq("teacher_id", u.user.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("contact_events").select("id", { count: "exact", head: true }).eq("teacher_id", u.user.id).eq("status", "pending"),
        supabase.from("contact_events").select("id", { count: "exact", head: true }).eq("teacher_id", u.user.id).eq("status", "accepted"),
        supabase.from("teacher_subjects").select("subject, level, board").eq("teacher_id", u.user.id),
      ]);
      setTp(tpRes.data);
      setReviews((rRes.data as any[]) ?? []);
      setPendingCount(pRes.count ?? 0);
      setAcceptedCount(aRes.count ?? 0);
      setSubjects((sRes.data as any[]) ?? []);
    })();
  }, []);

  async function toggleActive(v: boolean) {
    if (!userId) return;
    const { error } = await supabase.from("teacher_profiles").update({ is_active: v }).eq("user_id", userId);
    if (error) return toast.error(error.message);
    setTp((p: any) => ({ ...p, is_active: v }));
    toast.success(v ? "Listing reactivated." : "Listing deactivated.");
  }

  const incomplete = !tp || (tp.completion_step ?? 0) < 4;

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {incomplete && (
          <div className="rounded-2xl border border-primary/30 bg-primary-soft p-5">
            <h3 className="font-semibold">Finish your profile</h3>
            <p className="mt-1 text-sm text-foreground/80">Complete all 4 sections to start appearing in tutor search results.</p>
            <Button asChild className="mt-3"><Link to="/onboarding/teacher">Continue setup</Link></Button>
          </div>
        )}

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your profile</h2>
            <Button variant="outline" size="sm" asChild><Link to="/onboarding/teacher"><Pencil className="mr-1 h-4 w-4" /> Edit</Link></Button>
          </div>
          {tp ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Stat label="Rating" value={`${Number(tp.rating_avg).toFixed(1)} ★`} sub={`${tp.rating_count} reviews`} />
              <Stat label="Experience" value={`${tp.years_experience} years`} />
              <Stat label="Fee range" value={tp.fee_min === tp.fee_max ? `₹${tp.fee_min}/hr` : `₹${tp.fee_min}–${tp.fee_max}/hr`} />
              <Stat label="Mode" value={tp.mode === "both" ? "Online & in-person" : tp.mode} />
              {subjects.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subjects</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {subjects.map((s, i) => <Badge key={i} variant="secondary" className="bg-primary-soft text-primary border-0">{s.subject} · {s.level}</Badge>)}
                  </div>
                </div>
              )}
            </div>
          ) : <p className="mt-2 text-sm text-muted-foreground">Profile not set up yet.</p>}

          {tp && (
            <div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-background p-3">
              <div>
                <p className="text-sm font-semibold">Listing visibility</p>
                <p className="text-xs text-muted-foreground">{tp.is_active ? "Visible in search results" : "Hidden from search"}</p>
              </div>
              <Switch checked={!!tp.is_active} onCheckedChange={toggleActive} />
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold">Latest reviews</h2>
          <ul className="mt-3 space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{r.profiles?.full_name ?? "A student"}</p>
                  <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />)}</div>
                </div>
                {r.comment && <p className="mt-1 text-sm text-foreground/80">{r.comment}</p>}
              </li>
            ))}
            {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
          </ul>
        </section>
      </div>

      <aside className="space-y-4">
        {pendingCount > 0 && (
          <div className="rounded-2xl border border-primary/30 bg-primary-soft p-5">
            <div className="flex items-center gap-3">
              <Hourglass className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-foreground/80">Pending contact requests</p>
              </div>
            </div>
            <Button asChild size="sm" className="mt-3 w-full"><Link to="/requests">Review requests</Link></Button>
          </div>
        )}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center gap-3">
            <Inbox className="h-5 w-5 text-primary" />
            <div>
              <p className="text-2xl font-bold">{acceptedCount}</p>
              <p className="text-xs text-muted-foreground">Accepted connections</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="mt-3 w-full"><Link to="/requests">Open inbox</Link></Button>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-semibold">Tips</h3>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>• Add a clear bio to help parents trust you faster.</li>
            <li>• Keep your availability up to date.</li>
            <li>• Ask happy students to leave a review.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function LearnerDashboard() {
  const [sp, setSp] = useState<any>(null);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [dueReviews, setDueReviews] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const [spRes, evRes] = await Promise.all([
        supabase.from("student_profiles").select("*").eq("user_id", u.user.id).maybeSingle(),
        supabase
          .from("contact_events")
          .select("id, status, created_at, teacher_id, teacher:profiles!contact_events_teacher_id_fkey(full_name, city, area)")
          .eq("viewer_id", u.user.id)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);
      setSp(spRes.data);

      const events = (evRes.data as any[]) ?? [];
      setRecentRequests(events.slice(0, 5));

      // Reviews due: accepted requests older than 3 days with no review yet
      const olderThan = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const candidates = events.filter((e) => e.status === "accepted" && new Date(e.created_at) < olderThan);
      const teacherIds = [...new Set(candidates.map((e) => e.teacher_id))];
      if (teacherIds.length > 0) {
        const { data: mine } = await supabase.from("reviews").select("teacher_id").eq("reviewer_id", u.user.id).in("teacher_id", teacherIds);
        const reviewed = new Set((mine ?? []).map((r) => r.teacher_id));
        setDueReviews(candidates.filter((c) => !reviewed.has(c.teacher_id)));
      }
    })();
  }, []);

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your learning profile</h2>
            <Button variant="outline" size="sm" asChild><Link to="/onboarding/learner"><Pencil className="mr-1 h-4 w-4" /> Edit</Link></Button>
          </div>
          {sp ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Stat label="Grade / level" value={sp.class_grade || "—"} />
              <Stat label="Mode" value={sp.mode_preference === "both" ? "Online & in-person" : sp.mode_preference} />
              <Stat label="Subjects" value={(sp.subjects_of_interest ?? []).length || "—"} />
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Add a few details to get better matches. <Link to="/onboarding/learner" className="font-semibold text-primary">Complete profile</Link></p>
          )}
        </section>

        {dueReviews.length > 0 && (
          <section className="rounded-2xl border border-primary/30 bg-primary-soft p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold"><MessageCircle className="h-4 w-4 text-primary" /> Share a review</h2>
            <p className="mt-1 text-sm">It's been a few days since you reached out to these tutors. Help other families by sharing what worked.</p>
            <ul className="mt-3 space-y-2">
              {dueReviews.map((d) => (
                <li key={d.teacher_id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                  <div>
                    <p className="font-semibold">{d.teacher_profiles?.profiles?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{[d.teacher_profiles?.profiles?.area, d.teacher_profiles?.profiles?.city].filter(Boolean).join(", ")}</p>
                  </div>
                  <Button asChild size="sm"><Link to="/tutors/$id" params={{ id: d.teacher_id }}>Review</Link></Button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold">Recently viewed tutors</h2>
          {recentTutors.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">You haven't viewed any tutor contacts yet. <Link to="/tutors" className="font-semibold text-primary">Browse tutors</Link></p>
          ) : (
            <ul className="mt-3 space-y-2">
              {recentTutors.map((t, i) => (
                <li key={i} className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                  <div>
                    <p className="font-semibold">{t.teacher_profiles?.profiles?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{[t.teacher_profiles?.profiles?.area, t.teacher_profiles?.profiles?.city].filter(Boolean).join(", ")}</p>
                  </div>
                  <Button asChild variant="outline" size="sm"><Link to="/tutors/$id" params={{ id: t.teacher_id }}>View</Link></Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="space-y-4">
        <Button asChild className="w-full"><Link to="/tutors"><Search className="mr-2 h-4 w-4" /> Find tutors</Link></Button>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h3 className="mt-2 font-semibold">Tips</h3>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>• Filter by your locality first — closer often means more reliable.</li>
            <li>• Read recent reviews before reaching out.</li>
            <li>• Discuss expectations on the first call.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// Quiet unused warning
void dashboardPathForRole;
