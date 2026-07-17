import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Brand } from "@/components/site/Brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Star, Eye, Pencil, Search, MessageCircle, GraduationCap, Home, User, LogOut, SlidersHorizontal, MapPin, LayoutDashboard, Plus, X } from "lucide-react";
import { fetchPrimaryRole, type AppRole, dashboardPathForRole } from "@/lib/auth-helpers";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { capitalize } from "@/lib/string-helpers";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<AppRole | null>(null);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"home" | "profile">("home");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        if (!u.user) return;
        setEmail(u.user.email ?? null);
        const r = await fetchPrimaryRole();
        setRole(r);
        if (r === "admin") {
          navigate({ to: "/admin", replace: true });
          return;
        }
        
        const [pRes, phoneRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
          supabase.from("user_phones").select("phone").eq("user_id", u.user.id).maybeSingle(),
        ]);
        const profileData = pRes.data;
        if (profileData) {
          profileData.phone = phoneRes.data?.phone ?? "";
        }
        setMe(profileData);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-muted-foreground flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span>Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] transition-colors duration-300">
      {/* Top Header */}
      <header className="h-16 w-full border-b border-border bg-white flex items-center justify-between px-6 z-40 shrink-0">
        <div className="flex items-center">
          <Brand className="h-8" />
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-primary/10 text-primary border-0 capitalize">{role}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-border hover:bg-muted relative overflow-hidden shrink-0">
                {me?.avatar_url ? (
                  <img src={me.avatar_url} alt={me.full_name ?? "Profile"} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#4665FF]/10 text-xs font-bold text-[#4665FF]">
                    {me?.full_name ? capitalize(me.full_name).slice(0, 1) : <User className="h-4 w-4" />}
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-2">
              <div className="px-2 py-1.5 flex flex-col">
                <span className="text-sm font-bold text-[#1A1A1A]">
                  {me?.full_name ? capitalize(me.full_name) : "User Profile"}
                </span>
                <span className="text-xs text-muted-foreground truncate">{email}</span>
                {role !== "student" && role !== "parent" && (
                  <span className="text-[10px] text-primary/80 font-semibold uppercase tracking-wider mt-1">
                    Role: {role ?? "user"}
                  </span>
                )}
              </div>
              {role !== "student" && role !== "parent" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={dashboardPathForRole(role)}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/tutors">
                      <Search className="mr-2 h-4 w-4" />
                      Find tutors
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-white flex flex-col justify-between p-5 shrink-0">
          <div className="space-y-1.5">
            <button
              onClick={() => setActiveTab("home")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "home"
                  ? "bg-[#4665FF]/10 text-[#4665FF]"
                  : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
              }`}
            >
              <Home className="h-4 w-4" />
              Home
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === "profile"
                  ? "bg-[#4665FF]/10 text-[#4665FF]"
                  : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
              }`}
            >
              <User className="h-4 w-4" />
              Profile
            </button>
          </div>

          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-red-50 transition-all mt-6 md:mt-auto"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {role === "teacher" ? (
            activeTab === "home" ? (
              <TeacherDashboard me={me} setActiveTab={setActiveTab} />
            ) : (
              <TeacherProfileTab me={me} setActiveTab={setActiveTab} />
            )
          ) : activeTab === "home" ? (
            <LearnerDashboard me={me} />
          ) : (
            <LearnerProfileTab me={me} />
          )}
        </main>
      </div>
    </div>
  );
}

/* ---------------- Teacher views ---------------- */
interface TeacherDashboardProps {
  me: any;
  setActiveTab: (tab: "home" | "profile") => void;
}

function TeacherDashboard({ me, setActiveTab }: TeacherDashboardProps) {
  const [tp, setTp] = useState<any>(null);
  const [contactCount, setContactCount] = useState(0);
  const [userId, setUserId] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadRequests(tId: string) {
    try {
      const { data: reqData } = await supabase
        .from("contact_events")
        .select(
          `
          id, 
          status, 
          created_at, 
          viewer_id, 
          profiles:profiles!contact_events_viewer_id_fkey(
            full_name, 
            email, 
            student_profiles:student_profiles(class_grade, subjects_of_interest)
          )
        `,
        )
        .eq("teacher_id", tId)
        .order("created_at", { ascending: false });

      const reqs = (reqData as any[]) ?? [];

      const acceptedIds = reqs.filter((r) => r.status === "accepted").map((r) => r.viewer_id);

      let phonesMap: Record<string, string> = {};
      if (acceptedIds.length > 0) {
        const { data: phones } = await supabase
          .from("user_phones")
          .select("user_id, phone")
          .in("user_id", acceptedIds);
        (phones ?? []).forEach((p) => {
          phonesMap[p.user_id] = p.phone;
        });
      }

      setRequests(
        reqs.map((r) => ({
          ...r,
          phone: phonesMap[r.viewer_id] || null,
        })),
      );
    } catch (err) {
      console.error("Error loading requests:", err);
    }
  }

  async function handleRequest(requestId: string, nextStatus: "accepted" | "declined") {
    const { error } = await supabase
      .from("contact_events")
      .update({ status: nextStatus })
      .eq("id", requestId);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(`Request ${nextStatus}.`);
    if (userId) {
      loadRequests(userId);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        if (!u.user) return;
        setUserId(u.user.id);
        const [tpRes, cRes] = await Promise.all([
          supabase.from("teacher_profiles").select("*").eq("user_id", u.user.id).maybeSingle(),
          supabase
            .from("contact_events")
            .select("id", { count: "exact", head: true })
            .eq("teacher_id", u.user.id),
        ]);
        setTp(tpRes.data);
        setContactCount(cRes.count ?? 0);
        await loadRequests(u.user.id);
      } catch (err) {
        console.error("Error fetching teacher dashboard:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const ratingAvg = tp?.rating_avg ? Number(tp.rating_avg).toFixed(1) : "0.0";
  const feeLabel = tp
    ? tp.fee_min === tp.fee_max
      ? `₹${tp.fee_min}/hr`
      : `₹${tp.fee_min}–₹${tp.fee_max}/hr`
    : "-";

  return (
    <div className="space-y-6">
      {/* Metrics Row (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Views / Contact Reveals Card */}
        <div className="bg-white rounded-2xl border-2 border-border/80 p-6 flex flex-col justify-between shadow-sm">
          <p className="text-sm font-semibold text-[#1A1A1A]">Your Profile Views</p>
          <p className="text-4xl font-bold text-[#1A1A1A] mt-4 font-display">{contactCount}</p>
        </div>

        {/* Ratings Card */}
        <div className="bg-white rounded-2xl border-2 border-border/80 p-6 flex flex-col justify-between shadow-sm">
          <p className="text-sm font-semibold text-[#1A1A1A]">Your ratings</p>
          <div className="flex items-baseline gap-1 mt-4">
            <p className="text-4xl font-bold text-[#1A1A1A] font-display">{ratingAvg}</p>
            <p className="text-sm text-muted-foreground font-semibold">/5</p>
          </div>
        </div>

        {/* Other Metric / Hourly Rate Card */}
        <div className="bg-white rounded-2xl border-2 border-border/80 p-6 flex flex-col justify-between shadow-sm">
          <p className="text-sm font-semibold text-[#1A1A1A]">Hourly rate</p>
          <p className="text-3xl font-bold text-[#1A1A1A] mt-4 font-display truncate">{feeLabel}</p>
        </div>
      </div>

      {/* Requests Section */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#1A1A1A] pb-4 border-b border-border/80">
          Requests
        </h2>

        <div className="mt-4 divide-y divide-border/50">
          {requests.map((r, index) => {
            const studentName = r.profiles?.full_name ? capitalize(r.profiles.full_name) : "A Student";
            const grade = r.profiles?.student_profiles?.class_grade || "Any Grade";
            const subjects = (r.profiles?.student_profiles?.subjects_of_interest ?? []).map(capitalize).join(", ") || "Any Subject";

            return (
              <div
                key={r.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-[#1A1A1A] font-semibold text-sm mt-0.5">{index + 1}.</span>
                  <div>
                    <h3 className="font-bold text-sm text-[#1A1A1A]">{studentName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {grade} | {subjects}
                    </p>
                    {r.phone && r.status === "accepted" && (
                      <p className="text-xs font-semibold text-[#4665FF] mt-1">Phone: {r.phone}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Requested on {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {r.status === "pending" ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleRequest(r.id, "accepted")}
                        className="bg-[#E2E8F0] text-[#1A1A1A] hover:bg-[#CBD5E1] rounded-full px-5 font-semibold"
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRequest(r.id, "declined")}
                        className="bg-[#E2E8F0] text-[#1A1A1A] hover:bg-[#CBD5E1] rounded-full px-5 font-semibold"
                      >
                        Decline
                      </Button>
                    </>
                  ) : (
                    <Badge
                      variant={r.status === "accepted" ? "secondary" : "outline"}
                      className={`capitalize rounded-full font-semibold px-3 py-1 ${
                        r.status === "accepted"
                          ? "bg-green-500/10 text-green-600 border-0"
                          : "text-muted-foreground bg-slate-100/50 border-0"
                      }`}
                    >
                      {r.status}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}

          {requests.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No requests received yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface TeacherProfileTabProps {
  me: any;
  setActiveTab: (tab: "home" | "profile") => void;
}

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English",
  "Hindi", "Computer Science", "Economics", "Accountancy", "Music",
  "Art", "Other",
];
const LEVELS = [
  "Class 1-5", "Class 6-8", "Class 9-10", "Class 11-12",
  "Undergraduate", "Postgraduate", "Adult learner",
];
const BOARDS = ["CBSE", "ICSE", "State", "IB", "IGCSE", "Other"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS = [
  "Morning (6–10am)",
  "Late morning (10am–1pm)",
  "Afternoon (1–5pm)",
  "Evening (5–9pm)",
  "Night (9–11pm)",
];

function TeacherProfileTab({ me, setActiveTab }: TeacherProfileTabProps) {
  const navigate = useNavigate();
  const [tp, setTp] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [profileSubTab, setProfileSubTab] = useState<
    "personal" | "qualifications" | "availability"
  >("personal");
  const [email, setEmail] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Draft States
  const [personalDraft, setPersonalDraft] = useState({
    full_name: "",
    phone: "",
    city: "",
    area: "",
    gender: "" as "" | "male" | "female" | "other" | "prefer_not_to_say",
    bio: "",
  });

  const [qualificationsDraft, setQualificationsDraft] = useState({
    highest_degree: "",
    university: "",
    years_experience: 0,
    fee_min: 500,
    fee_max: 1000,
    certifications: [] as string[],
    other_experience: [] as string[],
  });

  const [subjectsDraft, setSubjectsDraft] = useState<{ subject: string; level: string; board: string }[]>([]);

  const [availabilityDraft, setAvailabilityDraft] = useState({
    mode: "both" as "online" | "offline" | "both",
    languages: [] as string[],
    available_days: [] as string[],
    time_slots: [] as string[],
  });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setEmail(u.user.email ?? null);
      const [tpRes, sRes] = await Promise.all([
        supabase.from("teacher_profiles").select("*").eq("user_id", u.user.id).maybeSingle(),
        supabase
          .from("teacher_subjects")
          .select("subject, level, board")
          .eq("teacher_id", u.user.id),
      ]);
      setTp(tpRes.data);
      setSubjects((sRes.data as any[]) ?? []);
    })();
  }, []);

  async function toggleActive(v: boolean) {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase
      .from("teacher_profiles")
      .update({ is_active: v })
      .eq("user_id", u.user.id);
    if (error) return toast.error(error.message);
    setTp((p: any) => ({ ...p, is_active: v }));
    toast.success(v ? "Listing reactivated." : "Listing deactivated.");
  }

  function enterEdit() {
    setPersonalDraft({
      full_name: me?.full_name ?? "",
      phone: me?.phone ?? "",
      city: me?.city ?? "",
      area: me?.area ?? "",
      gender: tp?.gender ?? "",
      bio: tp?.bio ?? "",
    });
    setQualificationsDraft({
      highest_degree: tp?.highest_degree ?? "",
      university: tp?.university ?? "",
      years_experience: tp?.years_experience ?? 0,
      fee_min: tp?.fee_min ?? 500,
      fee_max: tp?.fee_max ?? 1000,
      certifications: tp?.certifications ?? [],
      other_experience: tp?.other_experience ?? [],
    });
    setSubjectsDraft(subjects.map(s => ({ subject: s.subject, level: s.level, board: s.board })));
    setAvailabilityDraft({
      mode: tp?.mode ?? "both",
      languages: tp?.languages ?? [],
      available_days: tp?.available_days ?? [],
      time_slots: tp?.time_slots ?? [],
    });
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
  }

  async function handleSave() {
    // Validations
    if (!personalDraft.full_name.trim()) return toast.error("Full name is required.");
    if (!/^[a-zA-Z\s'-]+$/.test(personalDraft.full_name.trim())) {
      return toast.error("Name can only contain letters, hyphens, apostrophes, and spaces.");
    }
    if (personalDraft.full_name.length > 80) return toast.error("Name must be 80 characters or less.");

    if (!personalDraft.phone.trim()) return toast.error("Mobile number is required.");
    if (!/^\+?[0-9\s-()]{7,20}$/.test(personalDraft.phone.trim())) {
      return toast.error("Enter a valid phone number (7 to 20 digits).");
    }

    if (!personalDraft.city.trim()) return toast.error("City is required.");
    if (personalDraft.city.length > 50) return toast.error("City must be 50 characters or less.");

    if (!personalDraft.area.trim()) return toast.error("Area / locality is required.");
    if (personalDraft.area.length > 80) return toast.error("Area must be 80 characters or less.");

    if (personalDraft.bio.trim() && personalDraft.bio.trim().length < 10) {
      return toast.error("About you (bio) must be at least 10 characters.");
    }
    if (personalDraft.bio.length > 1000) return toast.error("Bio must be under 1000 characters.");

    if (!qualificationsDraft.highest_degree.trim()) return toast.error("Highest degree is required.");
    if (qualificationsDraft.highest_degree.length > 100) return toast.error("Highest degree must be 100 characters or less.");
    if (!qualificationsDraft.university.trim()) return toast.error("University / Institution is required.");
    if (qualificationsDraft.university.length > 100) return toast.error("University must be 100 characters or less.");
    if (qualificationsDraft.years_experience === undefined || qualificationsDraft.years_experience < 0 || qualificationsDraft.years_experience > 60) {
      return toast.error("Please enter a valid number of years of experience (0 to 60).");
    }

    const cleanedSubs = subjectsDraft.filter((s) => s.subject.trim() && s.level && s.board);
    if (cleanedSubs.length === 0) return toast.error("Please add at least one subject with level and board details.");

    if (qualificationsDraft.fee_min === undefined || qualificationsDraft.fee_min < 0 || qualificationsDraft.fee_min > 100000) return toast.error("Please enter a valid minimum fee.");
    if (qualificationsDraft.fee_max === undefined || qualificationsDraft.fee_max < 0 || qualificationsDraft.fee_max > 100000) return toast.error("Please enter a valid maximum fee.");
    if (Number(qualificationsDraft.fee_min) > Number(qualificationsDraft.fee_max)) return toast.error("Minimum fee cannot exceed maximum fee.");
    if (availabilityDraft.available_days.length === 0) return toast.error("Please select at least one available day.");
    if (availabilityDraft.time_slots.length === 0) return toast.error("Please select at least one time slot.");
    if (availabilityDraft.languages.length === 0) return toast.error("Please add at least one language of instruction.");

    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setSaving(false); return; }

    // Update profile
    const { error: pErr } = await supabase.from("profiles").update({
      full_name: personalDraft.full_name.trim(),
      city: personalDraft.city.trim(),
      area: personalDraft.area.trim(),
    }).eq("id", u.user.id);
    if (pErr) { setSaving(false); return toast.error(pErr.message); }

    // Update phone number
    const { error: phoneErr } = await supabase.from("user_phones").upsert({
      user_id: u.user.id,
      phone: personalDraft.phone.trim(),
    }, { onConflict: "user_id" });
    if (phoneErr) { setSaving(false); return toast.error(phoneErr.message); }

    // Update teacher profile
    const { error: tpErr } = await supabase.from("teacher_profiles").update({
      highest_degree: qualificationsDraft.highest_degree.trim() || null,
      university: qualificationsDraft.university.trim() || null,
      years_experience: Number(qualificationsDraft.years_experience) || 0,
      certifications: qualificationsDraft.certifications,
      other_experience: qualificationsDraft.other_experience,
      available_days: availabilityDraft.available_days,
      time_slots: availabilityDraft.time_slots,
      mode: availabilityDraft.mode,
      fee_min: Number(qualificationsDraft.fee_min) || 0,
      fee_max: Number(qualificationsDraft.fee_max) || 0,
      gender: personalDraft.gender || null,
      languages: availabilityDraft.languages,
      bio: personalDraft.bio.trim(),
    }).eq("user_id", u.user.id);
    if (tpErr) { setSaving(false); return toast.error(tpErr.message); }

    // Save subjects
    await supabase.from("teacher_subjects").delete().eq("teacher_id", u.user.id);
    const { error: sErr } = await supabase.from("teacher_subjects").insert(
      cleanedSubs.map((s) => ({
        teacher_id: u.user.id,
        subject: s.subject.trim(),
        level: s.level,
        board: s.board,
      }))
    );
    if (sErr) { setSaving(false); return toast.error(sErr.message); }

    // Update local state
    me.full_name = personalDraft.full_name.trim();
    me.phone = personalDraft.phone.trim();
    me.city = personalDraft.city.trim();
    me.area = personalDraft.area.trim();

    setTp((prev: any) => ({
      ...prev,
      gender: personalDraft.gender,
      bio: personalDraft.bio.trim(),
      highest_degree: qualificationsDraft.highest_degree.trim(),
      university: qualificationsDraft.university.trim(),
      years_experience: Number(qualificationsDraft.years_experience),
      certifications: qualificationsDraft.certifications,
      other_experience: qualificationsDraft.other_experience,
      available_days: availabilityDraft.available_days,
      time_slots: availabilityDraft.time_slots,
      mode: availabilityDraft.mode,
      fee_min: Number(qualificationsDraft.fee_min),
      fee_max: Number(qualificationsDraft.fee_max),
      languages: availabilityDraft.languages,
    }));
    setSubjects(cleanedSubs);

    setSaving(false);
    toast.success("Profile saved!");
    setIsEditing(false);
  }

  const subjectNames = subjects.map((s) => `${capitalize(s.subject)} (${s.level})`).join(", ");

  const inputCls = "w-full h-11 px-3 rounded-xl border border-[#E2E8F0] bg-[#F8F9FE] text-sm font-medium text-[#1A1A1A] focus-visible:ring-2 focus-visible:ring-[#4665FF]/10 focus-visible:border-[#4665FF] transition-all";
  const labelCls = "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 block";

  // Inner components
  function InnerTagInput({
    label,
    values,
    onChange,
    placeholder,
  }: {
    label: string;
    values: string[];
    onChange: (v: string[]) => void;
    placeholder?: string;
  }) {
    const [draftVal, setDraftVal] = useState("");
    return (
      <div className="space-y-2 col-span-1 md:col-span-2 mt-2">
        <label className={labelCls}>{label}</label>
        <div className="flex flex-wrap gap-2">
          {values.map((v, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="bg-[#4665FF]/10 text-[#4665FF] border-0 gap-1 pr-1"
            >
              {capitalize(v)}
              <button
                type="button"
                onClick={() => onChange(values.filter((_, j) => j !== i))}
                className="ml-0.5 rounded-full hover:bg-[#4665FF]/20 p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={draftVal}
            onChange={(e) => setDraftVal(e.target.value)}
            placeholder={placeholder}
            className="flex-1 h-11 px-3 rounded-xl border border-[#E2E8F0] bg-white text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && draftVal.trim()) {
                e.preventDefault();
                onChange([...values, draftVal.trim()]);
                setDraftVal("");
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl"
            onClick={() => {
              if (draftVal.trim()) {
                onChange([...values, draftVal.trim()]);
                setDraftVal("");
              }
            }}
          >
            Add
          </Button>
        </div>
      </div>
    );
  }

  function InnerChipPicker({
    label,
    options,
    values,
    onChange,
  }: {
    label: string;
    options: string[];
    values: string[];
    onChange: (v: string[]) => void;
  }) {
    function toggle(o: string) {
      onChange(values.includes(o) ? values.filter((v) => v !== o) : [...values, o]);
    }
    return (
      <div className="space-y-2 col-span-1 md:col-span-2 mt-2">
        <label className={labelCls}>{label}</label>
        <div className="flex flex-wrap gap-2">
          {options.map((o) => {
            const on = values.includes(o);
            return (
              <button
                key={o}
                type="button"
                onClick={() => toggle(o)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  on
                    ? "border-[#4665FF] bg-[#4665FF] text-white"
                    : "border-border bg-white hover:border-[#4665FF]/40 text-muted-foreground"
                }`}
              >
                {o}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A] font-display">
            {isEditing ? "Edit Your Profile" : "Profile Details"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? "Update your qualifications, subjects, and availability."
              : "Manage your teaching preferences and qualifications."}
          </p>
        </div>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-full border-border text-[#1A1A1A] hover:bg-slate-100"
              onClick={cancelEdit}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#4665FF] hover:bg-[#4665FF]/90 rounded-full"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Profile"}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setActiveTab("home")}
              className="bg-[#E2E8F0] text-[#1A1A1A] hover:bg-[#CBD5E1] rounded-full px-5 font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={enterEdit}
              className="bg-[#4665FF] text-white hover:bg-[#4665FF]/90 rounded-full px-5 font-semibold"
            >
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      <hr className="border-border/80" />

      {/* Tab Selectors */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        <button
          onClick={() => setProfileSubTab("personal")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl border shrink-0 transition-all ${
            profileSubTab === "personal"
              ? "bg-[#E2E8F0] text-[#1A1A1A] border-[#CBD5E1]"
              : "bg-white text-muted-foreground border-border hover:bg-slate-50"
          }`}
        >
          Personal Information
        </button>
        <button
          onClick={() => setProfileSubTab("qualifications")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl border shrink-0 transition-all ${
            profileSubTab === "qualifications"
              ? "bg-[#E2E8F0] text-[#1A1A1A] border-[#CBD5E1]"
              : "bg-white text-muted-foreground border-border hover:bg-slate-50"
          }`}
        >
          Qualifications
        </button>
        <button
          onClick={() => setProfileSubTab("availability")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl border shrink-0 transition-all ${
            profileSubTab === "availability"
              ? "bg-[#E2E8F0] text-[#1A1A1A] border-[#CBD5E1]"
              : "bg-white text-muted-foreground border-border hover:bg-slate-50"
          }`}
        >
          Availability
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
        {profileSubTab === "personal" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#1A1A1A] mb-4">Personal Details</h3>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <Input className={inputCls} value={personalDraft.full_name} onChange={e => setPersonalDraft(p => ({ ...p, full_name: e.target.value }))} maxLength={80} />
                </div>
                <div>
                  <label className={labelCls}>Email Address</label>
                  <Input className={`${inputCls} opacity-60 cursor-not-allowed`} value={email ?? ""} disabled />
                </div>
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <Input className={inputCls} value={personalDraft.phone} onChange={e => setPersonalDraft(p => ({ ...p, phone: e.target.value }))} maxLength={20} />
                </div>
                <div>
                  <label className={labelCls}>Gender</label>
                  <Select value={personalDraft.gender} onValueChange={v => setPersonalDraft(p => ({ ...p, gender: v as any }))}>
                    <SelectTrigger className={inputCls}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  <Input className={inputCls} value={personalDraft.city} onChange={e => setPersonalDraft(p => ({ ...p, city: e.target.value }))} maxLength={50} />
                </div>
                <div>
                  <label className={labelCls}>Area</label>
                  <Input className={inputCls} value={personalDraft.area} onChange={e => setPersonalDraft(p => ({ ...p, area: e.target.value }))} maxLength={80} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls}>Biography</label>
                  <Textarea className="w-full min-h-[120px] rounded-xl border border-[#E2E8F0] bg-[#F8F9FE] p-3 text-sm" value={personalDraft.bio} onChange={e => setPersonalDraft(p => ({ ...p, bio: e.target.value }))} maxLength={1000} placeholder="Describe your experience, teaching style, and qualifications..." />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <ProfileItem label="Full Name" value={capitalize(me?.full_name)} />
                <ProfileItem label="Email Address" value={email} />
                <ProfileItem label="Phone Number" value={me?.phone} />
                <ProfileItem label="Gender" value={tp?.gender ? capitalize(tp.gender) : "-"} className="capitalize" />
                <ProfileItem label="City" value={capitalize(me?.city)} />
                <ProfileItem label="Area" value={capitalize(me?.area)} />
                <ProfileItem label="Biography" value={tp?.bio} className="md:col-span-2 leading-relaxed" />
              </div>
            )}
          </div>
        )}

        {profileSubTab === "qualifications" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#1A1A1A] mb-4">Qualifications & Experience</h3>
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className={labelCls}>Years of Experience</label>
                  <Input type="number" min={0} max={60} className={inputCls} value={qualificationsDraft.years_experience} onChange={e => setQualificationsDraft(p => ({ ...p, years_experience: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className={labelCls}>Highest Degree</label>
                  <Input className={inputCls} value={qualificationsDraft.highest_degree} onChange={e => setQualificationsDraft(p => ({ ...p, highest_degree: e.target.value }))} maxLength={100} />
                </div>
                <div>
                  <label className={labelCls}>University / Institution</label>
                  <Input className={inputCls} value={qualificationsDraft.university} onChange={e => setQualificationsDraft(p => ({ ...p, university: e.target.value }))} maxLength={100} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Min Fee (₹/hr)</label>
                    <Input type="number" min={0} className={inputCls} value={qualificationsDraft.fee_min} onChange={e => setQualificationsDraft(p => ({ ...p, fee_min: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Max Fee (₹/hr)</label>
                    <Input type="number" min={0} className={inputCls} value={qualificationsDraft.fee_max} onChange={e => setQualificationsDraft(p => ({ ...p, fee_max: Number(e.target.value) }))} />
                  </div>
                </div>

                <div className="space-y-3 col-span-1 md:col-span-2 mt-2">
                  <label className={labelCls}>Subjects Taught</label>
                  <div className="space-y-3">
                    {subjectsDraft.map((s, i) => {
                      const isOtherSelected = s.subject === "Other" || (!SUBJECTS.includes(s.subject) && s.subject !== "");
                      return (
                        <div key={i} className="grid items-end gap-3 rounded-xl border border-border bg-slate-50/30 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Subject</Label>
                            <div className="space-y-2">
                              <Select
                                value={SUBJECTS.includes(s.subject) ? s.subject : s.subject === "" ? "" : "Other"}
                                onValueChange={(v) => {
                                  const copy = [...subjectsDraft];
                                  copy[i] = { ...copy[i], subject: v === "Other" ? "" : v };
                                  setSubjectsDraft(copy);
                                }}
                              >
                                <SelectTrigger className="h-10 bg-white">
                                  <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {SUBJECTS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              {isOtherSelected && (
                                <Input
                                  placeholder="Type custom subject name..."
                                  value={s.subject}
                                  onChange={(e) => {
                                    const copy = [...subjectsDraft];
                                    copy[i] = { ...copy[i], subject: e.target.value };
                                    setSubjectsDraft(copy);
                                  }}
                                  maxLength={50}
                                  className="h-10 text-sm bg-white"
                                />
                              )}
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Level</Label>
                            <Select
                              value={s.level}
                              onValueChange={(v) => {
                                const copy = [...subjectsDraft];
                                copy[i] = { ...copy[i], level: v };
                                setSubjectsDraft(copy);
                              }}
                            >
                              <SelectTrigger className="h-10 bg-white">
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                {LEVELS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Board</Label>
                            <Select
                              value={s.board}
                              onValueChange={(v) => {
                                const copy = [...subjectsDraft];
                                copy[i] = { ...copy[i], board: v };
                                setSubjectsDraft(copy);
                              }}
                            >
                              <SelectTrigger className="h-10 bg-white">
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                {BOARDS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSubjectsDraft(subjectsDraft.filter((_, j) => j !== i))}
                            className="h-10 w-10 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSubjectsDraft([...subjectsDraft, { subject: "", level: "", board: "" }])}
                      className="w-full border-dashed border-2 hover:bg-slate-50"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Subject Row
                    </Button>
                  </div>
                </div>

                <InnerTagInput label="Certifications" values={qualificationsDraft.certifications} onChange={v => setQualificationsDraft(p => ({ ...p, certifications: v }))} placeholder="Add a certification and press Enter" />
                <InnerTagInput label="Other Related Experience" values={qualificationsDraft.other_experience} onChange={v => setQualificationsDraft(p => ({ ...p, other_experience: v }))} placeholder="Add an experience and press Enter" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <ProfileItem
                  label="Years of Experience"
                  value={tp?.years_experience ? `${tp.years_experience} years` : "-"}
                />
                <ProfileItem
                  label="Fee Range"
                  value={
                    tp
                      ? tp.fee_min === tp.fee_max
                        ? `₹${tp.fee_min}/hr`
                        : `₹${tp.fee_min}–₹${tp.fee_max}/hr`
                      : "-"
                  }
                />
                <ProfileItem
                  label="Subjects Taught"
                  value={subjectNames || "-"}
                  className="md:col-span-2"
                />
                {(tp?.certifications ?? []).length > 0 && (
                  <ProfileItem label="Certifications" value={tp.certifications.map(capitalize).join(", ")} className="md:col-span-2" />
                )}
                {(tp?.other_experience ?? []).length > 0 && (
                  <ProfileItem label="Other Related Experience" value={tp.other_experience.map(capitalize).join(", ")} className="md:col-span-2" />
                )}
              </div>
            )}
          </div>
        )}

        {profileSubTab === "availability" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A] mb-4">Availability Parameters</h3>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className={labelCls}>Teaching Mode</label>
                    <Select value={availabilityDraft.mode} onValueChange={v => setAvailabilityDraft(p => ({ ...p, mode: v as any }))}>
                      <SelectTrigger className={inputCls}>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">In-person</SelectItem>
                        <SelectItem value="both">Online &amp; In-person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <InnerTagInput label="Languages of Instruction" values={availabilityDraft.languages} onChange={v => setAvailabilityDraft(p => ({ ...p, languages: v }))} placeholder="e.g. English, Malayalam" />
                  <InnerChipPicker label="Available Days" options={DAYS} values={availabilityDraft.available_days} onChange={v => setAvailabilityDraft(p => ({ ...p, available_days: v }))} />
                  <InnerChipPicker label="Time Slots" options={SLOTS} values={availabilityDraft.time_slots} onChange={v => setAvailabilityDraft(p => ({ ...p, time_slots: v }))} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <ProfileItem label="Teaching Mode" value={tp?.mode === "both" ? "Online & In-Person" : capitalize(tp?.mode)} />
                  <ProfileItem label="Languages of Instruction" value={(tp?.languages ?? []).map(capitalize).join(", ") || "-"} />
                  <ProfileItem label="Available Days" value={(tp?.available_days ?? []).map(capitalize).join(", ") || "-"} />
                  <ProfileItem label="Time Slots" value={(tp?.time_slots ?? []).join(", ") || "-"} />
                  <div className="rounded-xl border border-border bg-slate-50/50 p-4 flex items-center justify-between md:col-span-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Listing Visibility
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#1A1A1A]">
                        {tp?.is_active ? "Visible in search results" : "Hidden from search"}
                      </p>
                    </div>
                    {tp && <Switch checked={!!tp.is_active} onCheckedChange={toggleActive} />}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string | null | undefined;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-border bg-slate-50/50 p-4 ${className || ""}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-sm font-bold text-[#1A1A1A]">{value || "-"}</p>
    </div>
  );
}

/* ---------------- Learner/Student/Parent views ---------------- */
function LearnerDashboard({ me }: { me: any }) {
  const [tutors, setTutors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [sortFilter, setSortFilter] = useState("rating");
  const [loadingTutors, setLoadingTutors] = useState(true);

  // Load tutors on load
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("teacher_profiles")
          .select(
            "user_id, bio, years_experience, fee_min, fee_max, mode, rating_avg, rating_count, profiles!inner(full_name, city, area, avatar_url), teacher_subjects(subject, level, board)",
          )
          .eq("is_active", true);
        if (error) throw error;
        setTutors(data ?? []);
      } catch (err) {
        console.error("Error loading tutors:", err);
      } finally {
        setLoadingTutors(false);
      }
    })();
  }, []);

  const filteredTutors = useMemo(() => {
    let list = [...tutors];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) => {
        const fullName = t.profiles?.full_name?.toLowerCase() ?? "";
        const bio = t.bio?.toLowerCase() ?? "";
        const subjects = (t.teacher_subjects ?? [])
          .map((s: any) => s.subject?.toLowerCase())
          .join(" ");
        return fullName.includes(q) || bio.includes(q) || subjects.includes(q);
      });
    }

    if (locationQuery) {
      const loc = locationQuery.toLowerCase();
      list = list.filter((t) => {
        const city = t.profiles?.city?.toLowerCase() ?? "";
        const area = t.profiles?.area?.toLowerCase() ?? "";
        return city.includes(loc) || area.includes(loc);
      });
    }

    if (sortFilter === "rating") {
      list.sort((a, b) => (b.rating_avg ?? 0) - (a.rating_avg ?? 0));
    } else if (sortFilter === "experience") {
      list.sort((a, b) => (b.years_experience ?? 0) - (a.years_experience ?? 0));
    } else if (sortFilter === "fee_low") {
      list.sort((a, b) => (a.fee_min ?? 0) - (b.fee_min ?? 0));
    }

    return list;
  }, [tutors, searchQuery, locationQuery, sortFilter]);

  return (
    <div className="space-y-6">
      {/* Search & Sort Panel */}
      <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          {/* Search Inputs */}
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tutors by name, keywords, subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-full border border-border bg-[#F8F9FE] focus-visible:ring-2 focus-visible:ring-[#4665FF]/10 focus-visible:border-[#4665FF] transition-all"
              />
            </div>
            <div className="relative w-44 sm:w-60">
              <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="City or Locality"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-full border border-border bg-[#F8F9FE] focus-visible:ring-2 focus-visible:ring-[#4665FF]/10 focus-visible:border-[#4665FF] transition-all"
              />
            </div>
          </div>

          {/* Sort Selection */}
          <div className="w-full md:w-56">
            <Select value={sortFilter} onValueChange={setSortFilter}>
              <SelectTrigger className="w-full h-11 rounded-full border border-border bg-[#F8F9FE] focus:ring-[#4665FF]/10 focus:border-[#4665FF]">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Top rated</SelectItem>
                <SelectItem value="experience">Most experienced</SelectItem>
                <SelectItem value="fee_low">Lowest fee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Applied Filters bar */}
        {(locationQuery || searchQuery) && (
          <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground border-t border-slate-100">
            <span className="font-semibold">Applied Filters :</span>
            {searchQuery && (
              <Badge
                variant="secondary"
                className="bg-[#4665FF]/5 text-[#4665FF] border-0 rounded-full px-2.5 py-0.5 flex items-center gap-1"
              >
                Keyword: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery("")}
                  className="hover:text-red-500 font-bold ml-1"
                >
                  ×
                </button>
              </Badge>
            )}
            {locationQuery && (
              <Badge
                variant="secondary"
                className="bg-[#4665FF]/5 text-[#4665FF] border-0 rounded-full px-2.5 py-0.5 flex items-center gap-1"
              >
                Location: {locationQuery}
                <button
                  onClick={() => setLocationQuery("")}
                  className="hover:text-red-500 font-bold ml-1"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Tutor Listings Grid */}
      {loadingTutors ? (
        <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4665FF]"></div>
          <span>Finding tutors...</span>
        </div>
      ) : filteredTutors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-16 text-center shadow-sm">
          <SlidersHorizontal className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#1A1A1A]">No tutors found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try relaxing your search terms or changing the locality filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredTutors.map((tutor) => (
            <TutorGridCard key={tutor.user_id} tutor={tutor} />
          ))}
        </div>
      )}
    </div>
  );
}

function TutorGridCard({ tutor }: { tutor: any }) {
  const rating = Number(tutor.rating_avg || 0).toFixed(1);
  const subjects = (tutor.teacher_subjects ?? []).map((s: any) => capitalize(s.subject)).join(", ");
  const feeLabel = tutor.fee_min === tutor.fee_max ? `₹${tutor.fee_min}/hr` : `₹${tutor.fee_min}–${tutor.fee_max}/hr`;

  return (
    <div className="bg-white rounded-2xl border border-border p-5 text-center flex flex-col justify-between hover:shadow-md hover:border-[#4665FF]/20 transition-all shadow-sm">
      <div>
        <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-4 border border-border overflow-hidden shrink-0">
          {tutor.profiles?.avatar_url ? (
            <img
              src={tutor.profiles.avatar_url}
              alt={tutor.profiles.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="h-10 w-10 text-slate-400" />
          )}
        </div>
        <h3 className="text-base font-bold text-[#1A1A1A] line-clamp-1">{tutor.profiles?.full_name ? capitalize(tutor.profiles.full_name) : "Tutor Profile"}</h3>
        <p className="text-xs text-muted-foreground mt-1.5 flex items-center justify-center gap-1">
          <MapPin className="h-3 w-3 shrink-0 text-[#4665FF]" />
          <span className="truncate">
            {tutor.profiles?.area ? `${capitalize(tutor.profiles.area)}, ${capitalize(tutor.profiles.city)}` : tutor.profiles?.city ? capitalize(tutor.profiles.city) : "Local"}
          </span>
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-border/50 text-left space-y-2.5">
        {subjects && (
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Subjects
            </p>
            <p className="text-xs text-foreground/80 font-medium line-clamp-1 mt-0.5">{subjects}</p>
          </div>
        )}
        <div className="flex justify-between items-center text-xs">
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Hourly Fee
            </p>
            <p className="font-semibold text-foreground/90 mt-0.5">{feeLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Rating
            </p>
            <p className="font-bold text-[#4665FF] flex items-center justify-end gap-0.5 mt-0.5">
              <Star className="h-3.5 w-3.5 fill-current text-[#4665FF]" />
              {rating}
            </p>
          </div>
        </div>
      </div>

      <Button
        asChild
        size="sm"
        className="w-full mt-5 rounded-full bg-[#4665FF] text-white hover:bg-[#4665FF]/95 font-medium transition-all shadow-sm"
      >
        <Link to="/tutors/$id" params={{ id: tutor.user_id }}>
          View Profile
        </Link>
      </Button>
    </div>
  );
}

function LearnerProfileTab({ me }: { me: any }) {
  const [sp, setSp] = useState<any>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable field state
  const [draft, setDraft] = useState({
    full_name: "",
    phone: "",
    city: "",
    area: "",
  });
  const [spDraft, setSpDraft] = useState({
    class_grade: "",
    mode_preference: "both" as "online" | "offline" | "both",
    subjects_of_interest: [] as string[],
  });
  const [subjectInput, setSubjectInput] = useState("");

  const GRADES = [
    "Class 1-5", "Class 6-8", "Class 9-10", "Class 11-12",
    "Undergraduate", "Postgraduate", "Adult learner",
  ];
  const SUBJECTS = [
    "Mathematics", "Physics", "Chemistry", "Biology", "English",
    "Hindi", "Computer Science", "Economics", "Music", "Art",
  ];

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setEmail(u.user.email ?? null);
      setUserId(u.user.id);
      const { data: spRes } = await supabase.from("student_profiles").select("*").eq("user_id", u.user.id).maybeSingle();
      setSp(spRes);
      if (spRes) {
        setSpDraft({
          class_grade: spRes.class_grade ?? "",
          mode_preference: spRes.mode_preference ?? "both",
          subjects_of_interest: spRes.subjects_of_interest ?? [],
        });
      }
    })();
  }, []);

  // Sync draft from me prop when entering edit mode
  function enterEdit() {
    setDraft({
      full_name: me?.full_name ?? "",
      phone: me?.phone ?? "",
      city: me?.city ?? "",
      area: me?.area ?? "",
    });
    if (sp) {
      setSpDraft({
        class_grade: sp.class_grade ?? "",
        mode_preference: sp.mode_preference ?? "both",
        subjects_of_interest: sp.subjects_of_interest ?? [],
      });
    }
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
  }

  function addSubject(sub: string) {
    const trimmed = sub.trim();
    if (!trimmed) return;
    if (spDraft.subjects_of_interest.map(s => s.toLowerCase()).includes(trimmed.toLowerCase())) return;
    setSpDraft(prev => ({ ...prev, subjects_of_interest: [...prev.subjects_of_interest, trimmed] }));
    setSubjectInput("");
  }

  function removeSubject(sub: string) {
    setSpDraft(prev => ({ ...prev, subjects_of_interest: prev.subjects_of_interest.filter(s => s !== sub) }));
  }

  async function handleSave() {
    if (!draft.full_name.trim()) return toast.error("Full name is required.");
    if (!/^[a-zA-Z\s'-]+$/.test(draft.full_name.trim())) return toast.error("Name can only contain letters, hyphens, apostrophes, and spaces.");
    if (draft.full_name.length > 80) return toast.error("Name must be 80 characters or less.");
    if (!draft.city.trim()) return toast.error("City is required.");
    if (!spDraft.class_grade) return toast.error("Grade / level is required.");
    if (spDraft.subjects_of_interest.length === 0) return toast.error("Please add at least one subject of interest.");

    setSaving(true);
    const { error: pErr } = await supabase.from("profiles").update({
      full_name: draft.full_name.trim(),
      city: draft.city.trim(),
      area: draft.area.trim(),
    }).eq("id", userId);
    if (pErr) { setSaving(false); return toast.error(pErr.message); }

    if (draft.phone.trim()) {
      const { error: phoneErr } = await supabase.from("user_phones").upsert({
        user_id: userId,
        phone: draft.phone.trim(),
      }, { onConflict: "user_id" });
      if (phoneErr) { setSaving(false); return toast.error(phoneErr.message); }
    }

    const { error: sErr } = await supabase.from("student_profiles").upsert({
      user_id: userId,
      class_grade: spDraft.class_grade || null,
      mode_preference: spDraft.mode_preference,
      subjects_of_interest: spDraft.subjects_of_interest,
    }, { onConflict: "user_id" });
    if (sErr) { setSaving(false); return toast.error(sErr.message); }

    // Update local state to reflect saved changes
    setSp((prev: any) => ({ ...prev, ...spDraft }));
    me.full_name = draft.full_name.trim();
    me.phone = draft.phone.trim();
    me.city = draft.city.trim();
    me.area = draft.area.trim();

    setSaving(false);
    toast.success("Profile saved!");
    setIsEditing(false);
  }

  const inputCls = "w-full h-11 px-3 rounded-xl border border-[#E2E8F0] bg-[#F8F9FE] text-sm font-medium text-[#1A1A1A] focus-visible:ring-2 focus-visible:ring-[#4665FF]/10 focus-visible:border-[#4665FF] transition-all";
  const labelCls = "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1 block";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
            {isEditing ? "Edit Your Profile" : "Your Learning Profile"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? "Update your personal details and learning preferences."
              : "Manage your grade level and subject interests."}
          </p>
        </div>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-full border-border text-[#1A1A1A] hover:bg-slate-100"
              onClick={cancelEdit}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#4665FF] hover:bg-[#4665FF]/90 rounded-full"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Profile"}
            </Button>
          </div>
        ) : (
          <Button
            className="bg-[#4665FF] hover:bg-[#4665FF]/90 rounded-full"
            onClick={enterEdit}
          >
            <Pencil className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
        {/* Personal Details */}
        <div>
          <h3 className="text-base font-bold text-[#1A1A1A] mb-4">Personal Details</h3>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Full Name</label>
                <Input className={inputCls} value={draft.full_name} onChange={e => setDraft(p => ({ ...p, full_name: e.target.value }))} maxLength={80} />
              </div>
              <div>
                <label className={labelCls}>Email Address</label>
                <Input className={`${inputCls} opacity-60 cursor-not-allowed`} value={email ?? ""} disabled />
              </div>
              <div>
                <label className={labelCls}>Phone Number</label>
                <Input className={inputCls} value={draft.phone} onChange={e => setDraft(p => ({ ...p, phone: e.target.value }))} maxLength={20} placeholder="+91 9876543210" />
              </div>
              <div>
                <label className={labelCls}>City</label>
                <Input className={inputCls} value={draft.city} onChange={e => setDraft(p => ({ ...p, city: e.target.value }))} maxLength={50} />
              </div>
              <div>
                <label className={labelCls}>Area</label>
                <Input className={inputCls} value={draft.area} onChange={e => setDraft(p => ({ ...p, area: e.target.value }))} maxLength={80} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <ProfileItem label="Full Name" value={capitalize(me?.full_name)} />
              <ProfileItem label="Email Address" value={email} />
              <ProfileItem label="Phone Number" value={me?.phone} />
              <ProfileItem label="City" value={capitalize(me?.city)} />
              <ProfileItem label="Area" value={capitalize(me?.area)} />
            </div>
          )}
        </div>

        {/* Learning Preferences */}
        {(sp || isEditing) && (
          <div className="border-t border-border/80 pt-6">
            <h3 className="text-base font-bold text-[#1A1A1A] mb-4">Learning Preferences</h3>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Grade / Level</label>
                    <Select value={spDraft.class_grade} onValueChange={v => setSpDraft(p => ({ ...p, class_grade: v }))}>
                      <SelectTrigger className={inputCls}>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className={labelCls}>Mode Preference</label>
                    <Select value={spDraft.mode_preference} onValueChange={v => setSpDraft(p => ({ ...p, mode_preference: v as any }))}>
                      <SelectTrigger className={inputCls}>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">In-person</SelectItem>
                        <SelectItem value="both">Online &amp; In-person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Subjects of Interest</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {spDraft.subjects_of_interest.map((sub, i) => (
                      <Badge key={i} variant="secondary" className="bg-[#4665FF]/10 text-[#4665FF] border-0 pr-1 flex items-center gap-1">
                        {capitalize(sub)}
                        <button type="button" onClick={() => removeSubject(sub)} className="ml-0.5 rounded-full hover:bg-[#4665FF]/20 p-0.5 transition-colors">
                          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none"><path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Select value={subjectInput} onValueChange={v => { addSubject(v); setSubjectInput(""); }}>
                    <SelectTrigger className={inputCls}>
                      <SelectValue placeholder="Add a subject…" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.filter(s => !spDraft.subjects_of_interest.map(x => x.toLowerCase()).includes(s.toLowerCase())).map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <ProfileItem label="Grade / Level" value={sp?.class_grade} />
                  <ProfileItem label="Mode Preference" value={sp?.mode_preference === "both" ? "Online & In-person" : capitalize(sp?.mode_preference)} />
                </div>
                {sp?.subjects_of_interest && sp.subjects_of_interest.length > 0 && (
                  <div className="rounded-xl border border-border bg-slate-50/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subjects of Interest</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {sp.subjects_of_interest.map((sub: string, i: number) => (
                        <Badge key={i} variant="secondary" className="bg-[#4665FF]/10 text-[#4665FF] border-0">
                          {capitalize(sub)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


/* ---------------- Shared components ---------------- */
function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-slate-50/50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold font-display text-[#1A1A1A]">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// Quiet unused warning
void dashboardPathForRole;
