import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import studentIconUrl from "@/assets/Student Registration [Vectorized].svg";
import teacherIconUrl from "@/assets/Training [Vectorized].svg";
import parentIconUrl from "@/assets/Guardian [Vectorized].svg";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brand } from "@/components/site/Brand";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fetchPrimaryRole, onboardingPathForRole, dashboardPathForRole } from "@/lib/auth-helpers";
import { Eye, EyeOff, User } from "lucide-react";

const searchSchema = z.object({
  mode: fallback(z.enum(["signin", "signup"]), "signin").default("signin"),
  role: fallback(z.enum(["student", "parent", "teacher"]), "student").default("student"),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Sign In / Sign Up | TutorConnect" },
      {
        name: "description",
        content: "Create your TutorConnect account as a student, parent, or teacher.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode, redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup">(mode);
  const [step, setStep] = useState<"form" | "choose-role">("form");
  const [savedFormData, setSavedFormData] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync tab state with mode search param
  useEffect(() => {
    setTab(mode);
    setStep("form"); // Reset step when switching mode
  }, [mode]);

  // Redirect if already signed in
  useEffect(() => {
    if (!isMounted) return;
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        if (redirect) {
          navigate({ to: redirect, replace: true });
        } else {
          const role = await fetchPrimaryRole();
          navigate({ to: dashboardPathForRole(role), replace: true });
        }
      }
    });
  }, [isMounted, navigate, redirect]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-muted-foreground">Loading auth...</div>
      </div>
    );
  }

  const isChooseRole = tab === "signup" && step === "choose-role";

  return (
    <div className="min-h-screen w-full flex bg-white transition-colors duration-300 relative">
      {authLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4665FF]"></div>
          <p className="mt-4 text-sm font-semibold text-[#1A1A1A]">Redirecting...</p>
        </div>
      )}
      {/* Left side: Solid brand blue background — hidden on role selection screen */}
      {!isChooseRole && <div className="hidden md:block md:w-[45%] bg-[#4665FF] shrink-0" />}

      {/* Right side / Full-width on role selection: Center-aligned Auth Form */}
      <div className={`flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 ${isChooseRole ? "w-full" : "md:w-[55%]"}`}>
        <div
          className={`w-full mx-auto ${isChooseRole ? "max-w-[750px]" : "max-w-[400px]"}`}
        >
          {tab === "signin" ? (
            <SignInForm setTab={setTab} setAuthLoading={setAuthLoading} redirect={redirect} />
          ) : step === "choose-role" ? (
            <RoleSelectionScreen
              formData={savedFormData}
              setStep={setStep}
              setTab={setTab}
              setAuthLoading={setAuthLoading}
              redirect={redirect}
            />
          ) : (
            <SignUpForm setTab={setTab} setStep={setStep} setSavedFormData={setSavedFormData} />
          )}
        </div>
      </div>
    </div>
  );
}

function SignInForm({ setTab, setAuthLoading, redirect }: { setTab: (t: "signin" | "signup") => void; setAuthLoading: (l: boolean) => void; redirect?: string }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setErrorMsg(error.message);
      return;
    }
    setAuthLoading(true);
    toast.success("Welcome back!");
    if (redirect) {
      navigate({ to: redirect, replace: true });
    } else {
      const role = await fetchPrimaryRole();
      navigate({ to: dashboardPathForRole(role), replace: true });
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.MouseEvent) {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset email sent! Please check your inbox.");
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1A] font-display">Sign in</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="si-email" className="text-sm font-semibold text-[#1A1A1A]">
            Email address <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="si-email"
            type="email"
            placeholder="you@company.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full h-12 px-4 rounded-xl border border-[#E2E8F0] bg-[#F8F9FE] focus-visible:ring-2 focus-visible:ring-[#4665FF]/10 focus-visible:border-[#4665FF] transition-all placeholder:text-muted-foreground/60"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <Label htmlFor="si-password" className="text-sm font-semibold text-[#1A1A1A]">
            Password <span className="text-rose-500">*</span>
          </Label>
          <div className="relative flex items-center">
            <Input
              id="si-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full h-12 pl-4 pr-12 rounded-xl border border-[#E2E8F0] bg-[#F8F9FE] focus-visible:ring-2 focus-visible:ring-[#4665FF]/10 focus-visible:border-[#4665FF] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errorMsg && <p className="text-xs text-destructive mt-1.5 font-medium text-left">{errorMsg}</p>}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-[#4665FF] hover:bg-[#4665FF]/95 text-white font-medium transition-all shadow-sm !mt-6"
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="text-center">
        <a
          href="#"
          onClick={handleForgotPassword}
          className="text-sm font-medium text-[#4665FF] hover:underline transition-colors"
        >
          Forgot your password?
        </a>
      </div>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-[#E2E8F0]"></div>
        <span className="flex-shrink mx-4 text-xs text-muted-foreground bg-white">or</span>
        <div className="flex-grow border-t border-[#E2E8F0]"></div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full h-12 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#1A1A1A] font-medium flex items-center justify-center gap-2.5 transition-all shadow-sm"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>

      <div className="text-center text-sm text-muted-foreground mt-4">
        New to Tutorconnect?{" "}
        <button
          onClick={() => {
            setTab("signup");
            navigate({
              to: "/auth",
              search: (prev: any) => ({ ...prev, mode: "signup" }),
              replace: true,
            });
          }}
          className="font-semibold text-[#4665FF] hover:underline ml-1"
        >
          Create an account
        </button>
      </div>
    </div>
  );
}

const signupSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(80, "Name must be at most 80 characters")
      .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, hyphens, apostrophes, and spaces"),
    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .max(255, "Email must be at most 255 characters"),
    phone: z
      .string()
      .trim()
      .refine(
        (val) => val === "" || /^\+?[0-9\s-()]{7,20}$/.test(val),
        "Enter a valid phone number (7 to 20 digits, spaces, hyphens, parentheses, optional +)"
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
    confirm: z.string(),
    role: z.enum(["student", "parent", "teacher"]),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });

function SignUpForm({
  setTab,
  setStep,
  setSavedFormData,
}: {
  setTab: (t: "signin" | "signup") => void;
  setStep: (s: "form" | "choose-role") => void;
  setSavedFormData: (d: any) => void;
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignUp() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  }

  function setField<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ ...form, role: "student" });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[String(i.path[0])] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSavedFormData(form);
    setStep("choose-role");
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1A] font-display">
          Create your account
        </h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5 text-left">
          <Label htmlFor="su-name" className="text-sm font-semibold text-[#1A1A1A]">
            Name <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="su-name"
            value={form.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            required
            maxLength={80}
            className="w-full h-12 px-4 rounded-xl border border-[#E2E8F0] bg-white focus-visible:ring-2 focus-visible:ring-[#4665FF]/10 focus-visible:border-[#4665FF] transition-all"
          />
          {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName}</p>}
        </div>

        <div className="space-y-1.5 text-left">
          <Label htmlFor="su-email" className="text-sm font-semibold text-[#1A1A1A]">
            Email address <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="su-email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            required
            maxLength={255}
            autoComplete="email"
            className="w-full h-12 px-4 rounded-xl border border-[#E2E8F0] bg-white focus-visible:ring-2 focus-visible:ring-[#4665FF]/10 focus-visible:border-[#4665FF] transition-all placeholder:text-muted-foreground/60"
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
        </div>

        <div className="space-y-1.5 text-left">
          <Label htmlFor="su-phone" className="text-sm font-semibold text-[#1A1A1A]">
            Phone Number
          </Label>
          <Input
            id="su-phone"
            type="tel"
            placeholder="+91 9876543210"
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            maxLength={20}
            className="w-full h-12 px-4 rounded-xl border border-[#E2E8F0] bg-white focus-visible:ring-2 focus-visible:ring-[#4665FF]/10 focus-visible:border-[#4665FF] transition-all placeholder:text-muted-foreground/60"
          />
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
        </div>
        <div className="space-y-1.5 text-left">
          <Label htmlFor="su-pw" className="text-sm font-semibold text-[#1A1A1A]">
            Password <span className="text-rose-500">*</span>
          </Label>
          <div className="relative flex items-center">
            <Input
              id="su-pw"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
              required
              maxLength={72}
              autoComplete="new-password"
              className="w-full h-12 pl-4 pr-12 rounded-xl border border-[#E2E8F0] bg-white focus-visible:ring-2 focus-visible:ring-[#4665FF]/10 focus-visible:border-[#4665FF] transition-all placeholder:text-muted-foreground/40"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
        </div>

        <div className="space-y-1.5 text-left">
          <Label htmlFor="su-pw2" className="text-sm font-semibold text-[#1A1A1A]">
            Confirm password <span className="text-rose-500">*</span>
          </Label>
          <div className="relative flex items-center">
            <Input
              id="su-pw2"
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirm}
              onChange={(e) => setField("confirm", e.target.value)}
              required
              maxLength={72}
              autoComplete="new-password"
              className="w-full h-12 pl-4 pr-12 rounded-xl border border-[#E2E8F0] bg-white focus-visible:ring-2 focus-visible:ring-[#4665FF]/10 focus-visible:border-[#4665FF] transition-all placeholder:text-muted-foreground/40"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirm && <p className="text-xs text-destructive mt-1">{errors.confirm}</p>}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-[#4665FF] hover:bg-[#4665FF]/95 text-white font-medium transition-all shadow-sm !mt-6"
        >
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-[#E2E8F0]"></div>
        <span className="flex-shrink mx-4 text-xs text-muted-foreground bg-white">or</span>
        <div className="flex-grow border-t border-[#E2E8F0]"></div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignUp}
        disabled={loading}
        className="w-full h-12 rounded-xl border border-[#E2E8F0] bg-white hover:bg-slate-50 text-[#1A1A1A] font-medium flex items-center justify-center gap-2.5 transition-all shadow-sm"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>

      <div className="text-center text-sm text-muted-foreground mt-4">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => {
            setTab("signin");
            navigate({
              to: "/auth",
              search: (prev: any) => ({ ...prev, mode: "signin" }),
              replace: true,
            });
          }}
          className="font-semibold text-[#4665FF] hover:underline ml-1"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}

function RoleSelectionScreen({
  formData,
  setStep,
  setTab,
  setAuthLoading,
  redirect,
}: {
  formData: any;
  setStep: (s: "form" | "choose-role") => void;
  setTab: (t: "signin" | "signup") => void;
  setAuthLoading: (l: boolean) => void;
  redirect?: string;
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleRoleSelect(role: "student" | "parent" | "teacher") {
    if (!formData) {
      toast.error("Form data is missing. Please go back and fill the form again.");
      return;
    }
    try {
      setLoading(role);
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.fullName.trim(),
            phone: formData.phone?.trim() || null,
            role: role,
          },
        },
      });
      if (error) {
        setLoading(null);
        toast.error(error.message);
        return;
      }
      if (data.session) {
        setAuthLoading(true);
        toast.success("Account created and signed in!");
        if (redirect) {
          navigate({ to: redirect, replace: true });
        } else {
          navigate({ to: onboardingPathForRole(role), replace: true });
        }
      } else {
        setLoading(null);
        toast.success("Account created! Please check your email to confirm and log in.", {
          duration: 8000,
        });
        setTab("signin");
        navigate({
          to: "/auth",
          search: (prev: any) => ({ ...prev, mode: "signin", redirect }),
          replace: true,
        });
      }
    } catch (err: any) {
      setLoading(null);
      toast.error(err.message || "An unexpected error occurred during signup.");
    }
  }

  return (
    <div className="w-full space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1A] font-display">
          Please choose your role
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Student Card */}
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => handleRoleSelect("student")}
          className="w-full aspect-square flex flex-col items-center justify-center border-2 border-border hover:border-primary/50 hover:bg-primary-soft/10 rounded-xl p-6 text-center transition-all duration-300 bg-card group hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading === "student" ? (
            <div className="h-16 w-16 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <img src={studentIconUrl} alt="Student" className="h-16 w-16" />
          )}
          <span className="mt-4 text-base font-semibold text-[#1A1A1A] font-display group-hover:text-primary transition-colors duration-300">
            I am Student
          </span>
        </button>

        {/* Parent Card */}
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => handleRoleSelect("parent")}
          className="w-full aspect-square flex flex-col items-center justify-center border-2 border-border hover:border-primary/50 hover:bg-primary-soft/10 rounded-xl p-6 text-center transition-all duration-300 bg-card group hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading === "parent" ? (
            <div className="h-16 w-16 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <img src={parentIconUrl} alt="Parent" className="h-16 w-16" />
          )}
          <span className="mt-4 text-base font-semibold text-[#1A1A1A] font-display group-hover:text-primary transition-colors duration-300">
            I am Parent
          </span>
        </button>

        {/* Teacher Card */}
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => handleRoleSelect("teacher")}
          className="w-full aspect-square flex flex-col items-center justify-center border-2 border-border hover:border-primary/50 hover:bg-primary-soft/10 rounded-xl p-6 text-center transition-all duration-300 bg-card group hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading === "teacher" ? (
            <div className="h-16 w-16 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <img src={teacherIconUrl} alt="Teacher" className="h-16 w-16" />
          )}
          <span className="mt-4 text-base font-semibold text-[#1A1A1A] font-display group-hover:text-primary transition-colors duration-300">
            I am Teacher
          </span>
        </button>
      </div>

      <div className="text-center mt-6">
        <button
          type="button"
          onClick={() => setStep("form")}
          disabled={loading !== null}
          className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to form
        </button>
      </div>
    </div>
  );
}
