import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Brand } from "@/components/site/Brand";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  fetchPrimaryRole,
  onboardingPathForRole,
  dashboardPathForRole,
} from "@/lib/auth-helpers";
import { GraduationCap, User, Users } from "lucide-react";

const searchSchema = z.object({
  mode: fallback(z.enum(["signin", "signup"]), "signin").default("signin"),
  role: fallback(z.enum(["student", "parent", "teacher"]), "student").default("student"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Sign in or sign up — TutorConnect" },
      { name: "description", content: "Create your TutorConnect account as a student, parent, or teacher." },
    ],
  }),
  component: AuthPage,
});

const ROLES = [
  { value: "student", label: "Student", icon: User, desc: "I'm looking for a tutor for myself" },
  { value: "parent", label: "Parent", icon: Users, desc: "I'm looking for a tutor for my child" },
  { value: "teacher", label: "Teacher", icon: GraduationCap, desc: "I want to offer tutoring" },
] as const;

function AuthPage() {
  const { mode, role: initialRole } = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">(mode);

  // Sync tab state with mode search param
  useEffect(() => {
    setTab(mode);
  }, [mode]);

  // Redirect if already signed in
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const role = await fetchPrimaryRole();
        navigate({ to: dashboardPathForRole(role), replace: true });
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Brand />
        </div>
      </header>
      <main className="mx-auto flex max-w-md flex-col px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to TutorConnect</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Find the right tutor — or start tutoring — in minutes.
        </p>

        <Tabs
          value={tab}
          onValueChange={(v) => {
            const nextMode = v as "signin" | "signup";
            setTab(nextMode);
            navigate({
              search: (prev) => ({ ...prev, mode: nextMode }),
              replace: true,
            });
          }}
          className="mt-8"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="mt-6">
            <SignInForm />
          </TabsContent>
          <TabsContent value="signup" className="mt-6">
            <SignUpForm initialRole={initialRole} />
          </TabsContent>
        </Tabs>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link to="/terms" className="underline hover:text-primary">Terms</Link> and{" "}
          <Link to="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
        </p>
      </main>
    </div>
  );
}

function SignInForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    const role = await fetchPrimaryRole();
    navigate({ to: dashboardPathForRole(role), replace: true });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="space-y-1.5">
        <Label htmlFor="si-email">Email</Label>
        <Input id="si-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="si-password">Password</Label>
        <Input id="si-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(80),
    email: z.string().trim().email("Invalid email").max(255),
    phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
    password: z.string().min(8, "At least 8 characters").max(72),
    confirm: z.string(),
    role: z.enum(["student", "parent", "teacher"]),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });

function SignUpForm({ initialRole }: { initialRole: "student" | "parent" | "teacher" }) {
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "parent" | "teacher">(initialRole);
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function setField<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ ...form, role });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[String(i.path[0])] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: parsed.data.fullName,
          phone: parsed.data.phone,
          role: parsed.data.role,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created!");
    navigate({ to: onboardingPathForRole(role), replace: true });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card">
      <div>
        <Label className="text-sm">I am a…</Label>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {ROLES.map((r) => {
            const active = role === r.value;
            const Icon = r.icon;
            return (
              <button
                type="button"
                key={r.value}
                onClick={() => setRole(r.value)}
                className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                  active
                    ? "border-primary bg-primary-soft ring-2 ring-primary/30"
                    : "border-border bg-background hover:border-primary/40"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span className="mt-1.5 text-sm font-semibold">{r.label}</span>
                <span className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{r.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Field label="Full name" id="su-name" error={errors.fullName}>
        <Input id="su-name" value={form.fullName} onChange={(e) => setField("fullName", e.target.value)} required />
      </Field>
      <Field label="Email" id="su-email" error={errors.email}>
        <Input id="su-email" type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} required autoComplete="email" />
      </Field>
      <Field label="Mobile number" id="su-phone" error={errors.phone}>
        <Input id="su-phone" type="tel" value={form.phone} onChange={(e) => setField("phone", e.target.value)} required />
      </Field>
      <Field label="Password" id="su-pw" error={errors.password}>
        <Input id="su-pw" type="password" value={form.password} onChange={(e) => setField("password", e.target.value)} required autoComplete="new-password" />
      </Field>
      <Field label="Confirm password" id="su-pw2" error={errors.confirm}>
        <Input id="su-pw2" type="password" value={form.confirm} onChange={(e) => setField("confirm", e.target.value)} required autoComplete="new-password" />
      </Field>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}

function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
