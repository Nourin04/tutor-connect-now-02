import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/site/AppHeader";
import { AppFooter } from "@/components/site/AppFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  Languages,
  GraduationCap,
  Briefcase,
  Eye,
} from "lucide-react";
import { fetchMyRoles } from "@/lib/auth-helpers";

export const Route = createFileRoute("/tutors/$id")({
  head: () => ({
    meta: [
      { title: "Tutor profile — TutorConnect" },
      { name: "description", content: "View tutor qualifications, subjects, availability, fees, and reviews." },
    ],
  }),
  component: TutorProfilePage,
});

function TutorProfilePage() {
  const { id } = Route.useParams();
  const [tutor, setTutor] = useState<any | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [me, setMe] = useState<{ id: string; roles: string[] } | null>(null);
  const [requestStatus, setRequestStatus] = useState<"none" | "pending" | "accepted" | "declined">("none");
  const [phone, setPhone] = useState<string | null>(null);
  const [hasContactEvent, setHasContactEvent] = useState(false);
  const [myReview, setMyReview] = useState<any | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const [tRes, rRes, userRes] = await Promise.all([
        supabase
          .from("teacher_profiles")
          .select(
            "user_id, bio, highest_degree, university, years_experience, certifications, other_experience, available_days, time_slots, mode, fee_min, fee_max, gender, languages, rating_avg, rating_count, is_active, profiles!inner(full_name, email, city, area, avatar_url), teacher_subjects(subject, level, board)"
          )
          .eq("user_id", id)
          .maybeSingle(),
        supabase
          .from("reviews")
          .select("id, rating, comment, created_at, reviewer_id, profiles!reviews_reviewer_id_fkey(full_name)")
          .eq("teacher_id", id)
          .order("created_at", { ascending: false }),
        supabase.auth.getUser(),
      ]);
      if (!alive) return;
      if (tRes.error) setError(tRes.error.message);
      setTutor(tRes.data);
      setReviews((rRes.data as any[]) ?? []);
      const user = userRes.data.user;
      if (user) {
        const roles = await fetchMyRoles();
        setMe({ id: user.id, roles });
        const { data: ev } = await supabase
          .from("contact_events")
          .select("id, status")
          .eq("viewer_id", user.id)
          .eq("teacher_id", id)
          .maybeSingle();
        if (ev) {
          setRequestStatus(ev.status as any);
          if (ev.status === "accepted") {
            setHasContactEvent(true);
            const { data: ph } = await supabase
              .from("user_phones")
              .select("phone")
              .eq("user_id", id)
              .maybeSingle();
            if (ph) setPhone(ph.phone);
          }
        }
        const mine = (rRes.data as any[])?.find((r) => r.reviewer_id === user.id);
        if (mine) setMyReview(mine);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  async function revealContact() {
    if (!me) {
      toast.error("Please sign in to see contact details.");
      return;
    }
    const { error } = await supabase.from("contact_events").insert({
      viewer_id: me.id,
      teacher_id: id,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setRequestStatus("pending");
    toast.success("Contact request sent to the tutor.");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="mt-4 h-60 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Tutor not found</h1>
          <p className="mt-2 text-muted-foreground">This profile may have been deactivated.</p>
          <Button asChild className="mt-6"><Link to="/tutors">Back to tutors</Link></Button>
        </div>
      </div>
    );
  }

  const learner = me && (me.roles.includes("student") || me.roles.includes("parent"));

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/tutors" className="text-sm text-muted-foreground hover:text-primary">← Back to all tutors</Link>

        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* Header */}
            <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary-soft text-2xl font-bold text-primary">
                  {tutor.profiles?.avatar_url ? (
                    <img src={tutor.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (tutor.profiles?.full_name ?? "?").slice(0, 1).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h1 className="text-2xl font-bold">{tutor.profiles?.full_name}</h1>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {[tutor.profiles?.area, tutor.profiles?.city].filter(Boolean).join(", ") || "Location not set"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="h-5 w-5 fill-primary text-primary" />
                      <span className="text-lg font-semibold">{Number(tutor.rating_avg).toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({tutor.rating_count} reviews)</span>
                    </div>
                  </div>
                  {tutor.bio && <p className="mt-4 text-sm leading-relaxed text-foreground/90">{tutor.bio}</p>}
                </div>
              </div>
            </section>

            {/* Qualifications */}
            <Section title="Qualifications" icon={GraduationCap}>
              <Row label="Highest degree" value={tutor.highest_degree || "—"} />
              <Row label="University / Institution" value={tutor.university || "—"} />
              <Row label="Years of experience" value={`${tutor.years_experience} year${tutor.years_experience === 1 ? "" : "s"}`} />
              {(tutor.certifications ?? []).length > 0 && (
                <Row label="Certifications" value={tutor.certifications.join(", ")} />
              )}
              {(tutor.other_experience ?? []).length > 0 && (
                <div className="border-t border-border pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Other experience</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {tutor.other_experience.map((e: string, i: number) => <li key={i} className="flex gap-2"><Briefcase className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />{e}</li>)}
                  </ul>
                </div>
              )}
            </Section>

            {/* Subjects */}
            <Section title="Subjects & boards">
              <div className="grid gap-2 sm:grid-cols-2">
                {(tutor.teacher_subjects ?? []).map((s: any, i: number) => (
                  <div key={i} className="rounded-xl border border-border bg-background p-3">
                    <p className="font-semibold">{s.subject}</p>
                    <p className="text-xs text-muted-foreground">{s.level} · {s.board}</p>
                  </div>
                ))}
                {(tutor.teacher_subjects ?? []).length === 0 && <p className="text-sm text-muted-foreground">No subjects listed yet.</p>}
              </div>
            </Section>

            {/* Availability */}
            <Section title="Availability" icon={Clock}>
              <Row label="Days" value={(tutor.available_days ?? []).join(", ") || "—"} />
              <Row label="Time slots" value={(tutor.time_slots ?? []).join(", ") || "—"} />
              <Row label="Mode" value={tutor.mode === "both" ? "Online & in-person" : tutor.mode} />
              <Row label="Languages" value={(tutor.languages ?? []).join(", ") || "—"} icon={Languages} />
            </Section>

            {/* Reviews */}
            <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="text-lg font-semibold">Reviews ({reviews.length})</h2>

              {learner && hasContactEvent && (
                <ReviewForm
                  teacherId={id}
                  existing={myReview}
                  onSaved={(r) => {
                    setMyReview(r);
                    setReviews((prev) => {
                      const others = prev.filter((p) => p.id !== r.id);
                      return [r, ...others];
                    });
                  }}
                />
              )}
              {learner && !hasContactEvent && (
                <p className="mt-4 rounded-xl border border-dashed border-border bg-surface p-4 text-sm text-muted-foreground">
                  Reveal this tutor's contact details first to leave a review.
                </p>
              )}
              {!me && (
                <p className="mt-4 rounded-xl border border-dashed border-border bg-surface p-4 text-sm text-muted-foreground">
                  <Link to="/auth" className="font-semibold text-primary">Sign in</Link> as a student or parent to leave a review.
                </p>
              )}

              <ul className="mt-6 space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="rounded-xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{r.profiles?.full_name ?? "A student"}</p>
                      <div className="flex gap-0.5 text-primary">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-primary" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-foreground/85">{r.comment}</p>}
                    <p className="mt-2 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                  </li>
                ))}
                {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet — be the first!</p>}
              </ul>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Fees</p>
              <p className="mt-1 text-2xl font-bold">
                {tutor.fee_min === tutor.fee_max ? `₹${tutor.fee_min}` : `₹${tutor.fee_min}–${tutor.fee_max}`}
                <span className="text-base font-normal text-muted-foreground"> / hr</span>
              </p>

              <div className="mt-5">
                {!me ? (
                  <Button asChild className="w-full">
                    <Link to="/auth">Sign in to contact</Link>
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2.5 rounded-xl border border-border bg-surface p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        <a className="break-all hover:underline" href={`mailto:${tutor.profiles?.email}`}>
                          {tutor.profiles?.email}
                        </a>
                      </div>
                      {requestStatus === "accepted" && (
                        <div className="flex items-center gap-2 border-t border-border/50 pt-2.5">
                          <Phone className="h-4 w-4 text-primary" />
                          <a className="hover:underline" href={`tel:${phone}`}>
                            {phone || "—"}
                          </a>
                        </div>
                      )}
                    </div>

                    {requestStatus === "none" && (
                      <Button className="w-full" onClick={revealContact}>
                        <Eye className="mr-2 h-4 w-4" /> Request phone number
                      </Button>
                    )}
                    {requestStatus === "pending" && (
                      <Button className="w-full" disabled variant="secondary">
                        Request Pending Approval
                      </Button>
                    )}
                    {requestStatus === "declined" && (
                      <Button className="w-full" disabled variant="destructive">
                        Request Declined
                      </Button>
                    )}
                    {requestStatus === "accepted" && (
                      <div className="rounded-xl bg-green-500/10 p-2 text-center text-xs font-semibold text-green-600 dark:text-green-400">
                        ✓ Request accepted
                      </div>
                    )}
                  </div>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  TutorConnect doesn't charge any fee. Lessons are arranged directly between you and the tutor.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon?: any; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        {title}
      </h2>
      <div className="mt-4 space-y-2">{children}</div>
    </section>
  );
}

function Row({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: any }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/60 py-2 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function ReviewForm({ teacherId, existing, onSaved }: { teacherId: string; existing: any | null; onSaved: (r: any) => void }) {
  const [rating, setRating] = useState(existing?.rating ?? 5);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (rating < 1 || rating > 5) return;
    if (comment.length > 1000) {
      toast.error("Comment is too long (max 1000 characters).");
      return;
    }
    setSaving(true);
    const { data: userRes } = await supabase.auth.getUser();
    const reviewer_id = userRes.user?.id;
    if (!reviewer_id) {
      setSaving(false);
      toast.error("Please sign in to leave a review.");
      return;
    }
    const { data, error } = await supabase
      .from("reviews")
      .upsert(
        { teacher_id: teacherId, reviewer_id, rating, comment: comment.trim() },
        { onConflict: "teacher_id,reviewer_id" }
      )
      .select("id, rating, comment, created_at, reviewer_id, profiles!reviews_reviewer_id_fkey(full_name)")
      .single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(existing ? "Review updated." : "Thanks for your review!");
    onSaved(data);
  }

  return (
    <div className="mt-4 rounded-xl border border-border bg-background p-4">
      <p className="text-sm font-semibold">{existing ? "Update your review" : "Write a review"}</p>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} className="p-0.5">
            <Star className={`h-6 w-6 ${n <= rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />
          </button>
        ))}
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share what worked well (optional)"
        maxLength={1000}
        className="mt-3"
      />
      <Button className="mt-3" disabled={saving} onClick={submit}>
        {saving ? "Saving…" : existing ? "Update review" : "Submit review"}
      </Button>
    </div>
  );
}

// Unused import marker
void Badge;
void useNavigate;
