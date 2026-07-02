import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brand } from "@/components/site/Brand";
import { toast } from "sonner";
import { CheckCircle2, Circle, Plus, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding/teacher")({
  component: TeacherOnboarding,
});

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi", "Computer Science", "Economics", "Accountancy", "Music", "Art", "Other"];
const LEVELS = ["Class 1-5", "Class 6-8", "Class 9-10", "Class 11-12", "Undergraduate", "Postgraduate", "Adult learner"];
const BOARDS = ["CBSE", "ICSE", "State", "IB", "IGCSE", "Other"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS = ["Morning (6–10am)", "Late morning (10am–1pm)", "Afternoon (1–5pm)", "Evening (5–9pm)", "Night (9–11pm)"];

function TeacherOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  // Section 1
  const [s1, setS1] = useState({ full_name: "", email: "", phone: "", city: "", area: "", avatar_url: "" });
  // Section 2
  const [s2, setS2] = useState({ highest_degree: "", university: "", years_experience: 0, certifications: [] as string[], other_experience: [] as string[] });
  // Section 3 — subjects rows
  const [subjects, setSubjects] = useState<{ subject: string; level: string; board: string }[]>([
    { subject: "", level: "", board: "" },
  ]);
  // Section 4
  const [s4, setS4] = useState({
    available_days: [] as string[],
    time_slots: [] as string[],
    mode: "both" as "online" | "offline" | "both",
    fee_min: 500,
    fee_max: 1000,
    gender: "" as "" | "male" | "female" | "other" | "prefer_not_to_say",
    languages: [] as string[],
    bio: "",
  });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setUserId(u.user.id);
      const [pRes, phoneRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
        supabase.from("user_phones").select("phone").eq("user_id", u.user.id).maybeSingle(),
      ]);
      const p = pRes.data;
      const ph = phoneRes.data;
      if (p) setS1({
        full_name: p.full_name ?? "",
        email: p.email ?? "",
        phone: ph?.phone ?? "",
        city: p.city ?? "",
        area: p.area ?? "",
        avatar_url: p.avatar_url ?? "",
      });
      const { data: tp } = await supabase.from("teacher_profiles").select("*").eq("user_id", u.user.id).maybeSingle();
      if (tp) {
        setS2({
          highest_degree: tp.highest_degree ?? "",
          university: tp.university ?? "",
          years_experience: tp.years_experience ?? 0,
          certifications: tp.certifications ?? [],
          other_experience: tp.other_experience ?? [],
        });
        setS4({
          available_days: tp.available_days ?? [],
          time_slots: tp.time_slots ?? [],
          mode: tp.mode ?? "both",
          fee_min: tp.fee_min ?? 500,
          fee_max: tp.fee_max ?? 1000,
          gender: (tp.gender ?? "") as any,
          languages: tp.languages ?? [],
          bio: tp.bio ?? "",
        });
        setStep(Math.min(tp.completion_step ?? 0, 3));
      }
      const { data: subs } = await supabase.from("teacher_subjects").select("subject, level, board").eq("teacher_id", u.user.id);
      if (subs && subs.length > 0) setSubjects(subs);
      setLoading(false);
    })();
  }, []);

  async function savePersonal() {
    const { error: pErr } = await supabase.from("profiles").update({
      full_name: s1.full_name,
      city: s1.city,
      area: s1.area,
      avatar_url: s1.avatar_url || null,
    }).eq("id", userId);
    if (pErr) return toast.error(pErr.message);

    const { error: phoneErr } = await supabase.from("user_phones").upsert({
      user_id: userId,
      phone: s1.phone,
    }, { onConflict: "user_id" });
    if (phoneErr) return toast.error(phoneErr.message);

    await ensureTeacherProfile(0);
    toast.success("Personal info saved.");
    setStep(1);
  }

  async function ensureTeacherProfile(completion: number) {
    const { error } = await supabase.from("teacher_profiles").upsert({
      user_id: userId,
      completion_step: completion,
    }, { onConflict: "user_id" });
    if (error) throw error;
  }

  async function saveQualifications() {
    await ensureTeacherProfile(1);
    const { error } = await supabase.from("teacher_profiles").update({
      highest_degree: s2.highest_degree || null,
      university: s2.university || null,
      years_experience: Number(s2.years_experience) || 0,
      certifications: s2.certifications,
      other_experience: s2.other_experience,
      completion_step: 2,
    }).eq("user_id", userId);
    if (error) return toast.error(error.message);
    toast.success("Qualifications saved.");
    setStep(2);
  }

  async function saveSubjects() {
    const cleaned = subjects.filter((s) => s.subject && s.level && s.board);
    if (cleaned.length === 0) return toast.error("Add at least one subject.");
    await ensureTeacherProfile(2);
    await supabase.from("teacher_subjects").delete().eq("teacher_id", userId);
    const { error } = await supabase.from("teacher_subjects").insert(
      cleaned.map((s) => ({ ...s, teacher_id: userId }))
    );
    if (error) return toast.error(error.message);
    await supabase.from("teacher_profiles").update({ completion_step: 3 }).eq("user_id", userId);
    toast.success("Subjects saved.");
    setStep(3);
  }

  async function saveAvailability() {
    if (s4.fee_min > s4.fee_max) return toast.error("Min fee cannot exceed max fee.");
    if (s4.bio.length > 1000) return toast.error("Bio must be under 1000 characters.");
    const { error } = await supabase.from("teacher_profiles").update({
      available_days: s4.available_days,
      time_slots: s4.time_slots,
      mode: s4.mode,
      fee_min: Number(s4.fee_min) || 0,
      fee_max: Number(s4.fee_max) || 0,
      gender: s4.gender || null,
      languages: s4.languages,
      bio: s4.bio,
      is_active: true,
      completion_step: 4,
    }).eq("user_id", userId);
    if (error) return toast.error(error.message);
    toast.success("Your profile is live!");
    navigate({ to: "/dashboard" });
  }

  if (loading) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;

  const SECTIONS = [
    { title: "Personal info", desc: "Name, contact, location" },
    { title: "Qualifications", desc: "Degrees & experience" },
    { title: "Subjects", desc: "What & whom you teach" },
    { title: "Availability", desc: "Days, fees, languages" },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Brand />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">Set up your tutor profile</h1>
        <p className="mt-2 text-muted-foreground">Each section saves separately — finish at your own pace.</p>

        {/* Stepper */}
        <ol className="mt-8 grid gap-2 sm:grid-cols-4">
          {SECTIONS.map((s, i) => {
            const done = step > i;
            const current = step === i;
            return (
              <li key={i}>
                <button
                  onClick={() => setStep(i)}
                  className={`flex w-full items-start gap-2 rounded-xl border p-3 text-left transition-all ${
                    current ? "border-primary bg-primary-soft" : done ? "border-border bg-card" : "border-border bg-card opacity-70"
                  }`}
                >
                  {done ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" /> : <Circle className={`mt-0.5 h-4 w-4 ${current ? "text-primary" : "text-muted-foreground"}`} />}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Section {i + 1}</p>
                    <p className="text-sm font-semibold">{s.title}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>

        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
          {step === 0 && (
            <Section title="Personal info">
              <Grid>
                <Field label="Full name"><Input value={s1.full_name} onChange={(e) => setS1({ ...s1, full_name: e.target.value })} /></Field>
                <Field label="Email"><Input value={s1.email} disabled /></Field>
                <Field label="Mobile"><Input value={s1.phone} onChange={(e) => setS1({ ...s1, phone: e.target.value })} /></Field>
                <Field label="City"><Input value={s1.city} onChange={(e) => setS1({ ...s1, city: e.target.value })} /></Field>
                <Field label="Area / locality"><Input value={s1.area} onChange={(e) => setS1({ ...s1, area: e.target.value })} /></Field>
                <Field label="Profile photo URL (optional)"><Input value={s1.avatar_url} onChange={(e) => setS1({ ...s1, avatar_url: e.target.value })} placeholder="https://…" /></Field>
              </Grid>
              <NextRow onNext={savePersonal} label="Save & continue" />
            </Section>
          )}

          {step === 1 && (
            <Section title="Qualifications">
              <Grid>
                <Field label="Highest degree"><Input value={s2.highest_degree} onChange={(e) => setS2({ ...s2, highest_degree: e.target.value })} placeholder="e.g. M.Sc Physics" /></Field>
                <Field label="University / Institution"><Input value={s2.university} onChange={(e) => setS2({ ...s2, university: e.target.value })} /></Field>
                <Field label="Years of teaching experience"><Input type="number" min={0} value={s2.years_experience} onChange={(e) => setS2({ ...s2, years_experience: Number(e.target.value) })} /></Field>
              </Grid>
              <TagInput label="Certifications" values={s2.certifications} onChange={(v) => setS2({ ...s2, certifications: v })} placeholder="Add a certification and press Enter" />
              <TagInput label="Other related experience" values={s2.other_experience} onChange={(v) => setS2({ ...s2, other_experience: v })} placeholder="e.g. Taught at XYZ School 2018-21" />
              <NextRow onBack={() => setStep(0)} onNext={saveQualifications} label="Save & continue" />
            </Section>
          )}

          {step === 2 && (
            <Section title="Subjects you teach">
              <div className="space-y-3">
                {subjects.map((s, i) => (
                  <div key={i} className="grid items-end gap-3 rounded-xl border border-border bg-background p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                    <SelectRow label="Subject" value={s.subject} onChange={(v) => updateSubject(i, "subject", v)} options={SUBJECTS} />
                    <SelectRow label="Level" value={s.level} onChange={(v) => updateSubject(i, "level", v)} options={LEVELS} />
                    <SelectRow label="Board" value={s.board} onChange={(v) => updateSubject(i, "board", v)} options={BOARDS} />
                    <Button variant="ghost" size="icon" onClick={() => setSubjects(subjects.filter((_, j) => j !== i))} aria-label="Remove">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setSubjects([...subjects, { subject: "", level: "", board: "" }])}>
                  <Plus className="mr-1 h-4 w-4" /> Add subject
                </Button>
              </div>
              <NextRow onBack={() => setStep(1)} onNext={saveSubjects} label="Save & continue" />
            </Section>
          )}

          {step === 3 && (
            <Section title="Availability & fees">
              <Field label="About you (short bio)">
                <Textarea value={s4.bio} onChange={(e) => setS4({ ...s4, bio: e.target.value })} maxLength={1000} rows={4} placeholder="Briefly describe your teaching style…" />
              </Field>
              <ChipPicker label="Available days" options={DAYS} values={s4.available_days} onChange={(v) => setS4({ ...s4, available_days: v })} />
              <ChipPicker label="Time slots" options={SLOTS} values={s4.time_slots} onChange={(v) => setS4({ ...s4, time_slots: v })} />
              <Grid>
                <Field label="Mode of teaching">
                  <Select value={s4.mode} onValueChange={(v) => setS4({ ...s4, mode: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">In-person</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Gender (optional)">
                  <Select value={s4.gender || "none"} onValueChange={(v) => setS4({ ...s4, gender: (v === "none" ? "" : v) as any })}>
                    <SelectTrigger><SelectValue placeholder="Prefer not to say" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Prefer not to say</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Fee min (₹/hr)"><Input type="number" min={0} value={s4.fee_min} onChange={(e) => setS4({ ...s4, fee_min: Number(e.target.value) })} /></Field>
                <Field label="Fee max (₹/hr)"><Input type="number" min={0} value={s4.fee_max} onChange={(e) => setS4({ ...s4, fee_max: Number(e.target.value) })} /></Field>
              </Grid>
              <TagInput label="Languages of instruction" values={s4.languages} onChange={(v) => setS4({ ...s4, languages: v })} placeholder="e.g. English, Hindi, Tamil" />
              <NextRow onBack={() => setStep(2)} onNext={saveAvailability} label="Publish profile" />
            </Section>
          )}
        </section>
      </main>
    </div>
  );

  function updateSubject(i: number, k: "subject" | "level" | "board", v: string) {
    const next = [...subjects];
    next[i] = { ...next[i], [k]: v };
    setSubjects(next);
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="space-y-5"><h2 className="text-xl font-semibold">{title}</h2>{children}</div>;
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-sm">{label}</Label>{children}</div>;
}
function NextRow({ onBack, onNext, label }: { onBack?: () => void; onNext: () => void; label: string }) {
  return (
    <div className="mt-6 flex items-center justify-between">
      {onBack ? <Button variant="outline" onClick={onBack}>Back</Button> : <span />}
      <Button onClick={onNext}>{label}</Button>
    </div>
  );
}
function SelectRow({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <Field label={label}>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
        <SelectContent>{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    </Field>
  );
}
function ChipPicker({ label, options, values, onChange }: { label: string; options: string[]; values: string[]; onChange: (v: string[]) => void }) {
  function toggle(o: string) {
    onChange(values.includes(o) ? values.filter((v) => v !== o) : [...values, o]);
  }
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = values.includes(o);
          return (
            <button key={o} type="button" onClick={() => toggle(o)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary/40"}`}>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
function TagInput({ label, values, onChange, placeholder }: { label: string; values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  return (
    <div className="space-y-2">
      <Label className="text-sm">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {values.map((v, i) => (
          <Badge key={i} variant="secondary" className="bg-primary-soft text-primary border-0 gap-1">
            {v}
            <button onClick={() => onChange(values.filter((_, j) => j !== i))} aria-label="Remove" className="opacity-70 hover:opacity-100">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              e.preventDefault();
              onChange([...values, draft.trim()]);
              setDraft("");
            }
          }}
        />
        <Button type="button" variant="outline" onClick={() => { if (draft.trim()) { onChange([...values, draft.trim()]); setDraft(""); } }}>
          Add
        </Button>
      </div>
    </div>
  );
}
