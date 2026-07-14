import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brand } from "@/components/site/Brand";
import { Badge } from "@/components/ui/badge";
import { X, User } from "lucide-react";
import { toast } from "sonner";
import { fetchPrimaryRole } from "@/lib/auth-helpers";

export const Route = createFileRoute("/_authenticated/onboarding/learner")({
  component: LearnerOnboarding,
});

const GRADES = ["Class 1-5", "Class 6-8", "Class 9-10", "Class 11-12", "Undergraduate", "Postgraduate", "Adult learner"];
const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi", "Computer Science", "Economics", "Music", "Art"];

function LearnerOnboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<"student" | "parent" | "teacher" | "admin" | null>(null);
  const [profile, setProfile] = useState({ full_name: "", phone: "", city: "", area: "", avatar_url: "" });
  const [sp, setSp] = useState({
    class_grade: "",
    mode_preference: "both" as "online" | "offline" | "both",
    subjects_of_interest: [] as string[],
  });
  const [draft, setDraft] = useState("");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setUserId(u.user.id);
      setRole(await fetchPrimaryRole());
      const [pRes, phoneRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
        supabase.from("user_phones").select("phone").eq("user_id", u.user.id).maybeSingle(),
      ]);
      const p = pRes.data;
      const ph = phoneRes.data;
      if (p) setProfile({
        full_name: p.full_name ?? "",
        phone: ph?.phone ?? "",
        city: p.city ?? "",
        area: p.area ?? "",
        avatar_url: p.avatar_url ?? "",
      });
      const { data: s } = await supabase.from("student_profiles").select("*").eq("user_id", u.user.id).maybeSingle();
      if (s) setSp({
        class_grade: s.class_grade ?? "",
        mode_preference: s.mode_preference ?? "both",
        subjects_of_interest: s.subjects_of_interest ?? [],
      });
      setLoading(false);
    })();
  }, []);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB.");
      return;
    }
    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setProfile((prev) => ({ ...prev, avatar_url: data.publicUrl }));
      toast.success("Profile photo uploaded!");
    } catch (err: any) {
      toast.error("Error uploading: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!profile.full_name.trim()) return toast.error("Full name is required.");
    if (!/^[a-zA-Z\s'-]+$/.test(profile.full_name.trim())) {
      return toast.error("Name can only contain letters, hyphens, apostrophes, and spaces.");
    }
    if (profile.full_name.length > 80) return toast.error("Name must be 80 characters or less.");

    if (!profile.phone.trim()) return toast.error("Mobile number is required.");
    if (!/^\+?[0-9\s-()]{7,20}$/.test(profile.phone.trim())) {
      return toast.error("Enter a valid phone number (7 to 20 digits).");
    }

    if (!profile.city.trim()) return toast.error("City is required.");
    if (profile.city.length > 50) return toast.error("City must be 50 characters or less.");

    if (!profile.area.trim()) return toast.error("Area / locality is required.");
    if (profile.area.length > 80) return toast.error("Area must be 80 characters or less.");

    if (!sp.class_grade) return toast.error("Class / grade is required.");
    if (!sp.mode_preference) return toast.error("Preferred learning mode is required.");
    if (sp.subjects_of_interest.length === 0) return toast.error("Please add at least one subject of interest.");

    setSaving(true);
    const { error: pErr } = await supabase.from("profiles").update({
      full_name: profile.full_name.trim(),
      city: profile.city.trim(),
      area: profile.area.trim(),
      avatar_url: profile.avatar_url || null,
    }).eq("id", userId);
    if (pErr) { setSaving(false); return toast.error(pErr.message); }

    const { error: phoneErr } = await supabase.from("user_phones").upsert({
      user_id: userId,
      phone: profile.phone.trim(),
    }, { onConflict: "user_id" });
    if (phoneErr) { setSaving(false); return toast.error(phoneErr.message); }

    const { error: sErr } = await supabase.from("student_profiles").upsert({
      user_id: userId,
      class_grade: sp.class_grade || null,
      mode_preference: sp.mode_preference,
      subjects_of_interest: sp.subjects_of_interest,
    }, { onConflict: "user_id" });
    
    setSaving(false);
    if (sErr) return toast.error(sErr.message);
    toast.success("Profile saved!");
    navigate({ to: "/dashboard" });
  }

  if (loading) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;

  const intro = role === "parent"
    ? "Tell us about the child you're searching for. We'll use this to surface better matches."
    : "Tell us a little about yourself so we can match the right tutors.";

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8"><Brand /></div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">Set up your profile</h1>
        <p className="mt-2 text-muted-foreground">{intro}</p>

        <section className="mt-6 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={<span>Full name <span className="text-rose-500">*</span></span>}>
              <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} maxLength={80} />
            </Field>
            <Field label={<span>Mobile <span className="text-rose-500">*</span></span>}>
              <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} maxLength={20} />
            </Field>
            <Field label={<span>City <span className="text-rose-500">*</span></span>}>
              <Input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} maxLength={50} />
            </Field>
            <Field label={<span>Area / locality <span className="text-rose-500">*</span></span>}>
              <Input value={profile.area} onChange={(e) => setProfile({ ...profile, area: e.target.value })} maxLength={80} />
            </Field>
            <Field label={role === "parent" ? <span>Child's class / grade <span className="text-rose-500">*</span></span> : <span>Class / grade <span className="text-rose-500">*</span></span>}>
              <Select value={sp.class_grade || undefined} onValueChange={(v) => setSp({ ...sp, class_grade: v })}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label={<span>Preferred mode of learning <span className="text-rose-500">*</span></span>}>
              <Select value={sp.mode_preference} onValueChange={(v) => setSp({ ...sp, mode_preference: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">In-person</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-sm">Profile Photo</Label>
              <div className="flex items-center gap-4 mt-1">
                <div className="h-16 w-16 rounded-full border border-border bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-slate-400" />
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    className="cursor-pointer max-w-xs text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">PNG, JPG, or WEBP up to 2MB</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Subjects / areas of interest <span className="text-rose-500">*</span></Label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => {
                const on = sp.subjects_of_interest.includes(s);
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSp({ ...sp, subjects_of_interest: on ? sp.subjects_of_interest.filter((x) => x !== s) : [...sp.subjects_of_interest, s] })}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/40"}`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {sp.subjects_of_interest.filter((s) => !SUBJECTS.includes(s)).length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {sp.subjects_of_interest.filter((s) => !SUBJECTS.includes(s)).map((s, i) => (
                  <Badge key={i} variant="secondary" className="bg-primary-soft text-primary border-0 gap-1">
                    {s}<button type="button" onClick={() => setSp({ ...sp, subjects_of_interest: sp.subjects_of_interest.filter((x) => x !== s) })}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={50} placeholder="Add another (optional)" />
              <Button type="button" variant="outline" onClick={() => { if (draft.trim()) { setSp({ ...sp, subjects_of_interest: [...sp.subjects_of_interest, draft.trim()] }); setDraft(""); } }}>Add</Button>
            </div>
          </div>

          <div className="pt-2">
            <Button onClick={save} disabled={saving} className="w-full">{saving ? "Saving…" : "Save profile"}</Button>
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-sm">{label}</Label>{children}</div>;
}
