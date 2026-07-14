import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Brand } from "@/components/site/Brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Star, Eye, Pencil, Search, MessageCircle, GraduationCap, Home, User, LogOut, SlidersHorizontal, MapPin, LayoutDashboard } from "lucide-react";
import { fetchPrimaryRole, type AppRole, dashboardPathForRole } from "@/lib/auth-helpers";
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
        .select(`
          id, 
          status, 
          created_at, 
          viewer_id, 
          profiles:profiles!contact_events_viewer_id_fkey(
            full_name, 
            email, 
            student_profiles:student_profiles(class_grade, subjects_of_interest)
          )
        `)
        .eq("teacher_id", tId)
        .order("created_at", { ascending: false });

      const reqs = (reqData as any[]) ?? [];

      const acceptedIds = reqs
        .filter((r) => r.status === "accepted")
        .map((r) => r.viewer_id);

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
        }))
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
          supabase.from("contact_events").select("id", { count: "exact", head: true }).eq("teacher_id", u.user.id),
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
  const feeLabel = tp ? (tp.fee_min === tp.fee_max ? `₹${tp.fee_min}/hr` : `₹${tp.fee_min}–₹${tp.fee_max}/hr`) : "-";

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
        <h2 className="text-lg font-bold text-[#1A1A1A] pb-4 border-b border-border/80">Requests</h2>

        <div className="mt-4 divide-y divide-border/50">
          {requests.map((r, index) => {
            const studentName = r.profiles?.full_name ? capitalize(r.profiles.full_name) : "A Student";
            const grade = r.profiles?.student_profiles?.class_grade || "Any Grade";
            const subjects = (r.profiles?.student_profiles?.subjects_of_interest ?? []).map(capitalize).join(", ") || "Any Subject";

            return (
              <div key={r.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 first:pt-0 last:pb-0">
                <div className="flex items-start gap-2.5">
                  <span className="text-[#1A1A1A] font-semibold text-sm mt-0.5">{index + 1}.</span>
                  <div>
                    <h3 className="font-bold text-sm text-[#1A1A1A]">{studentName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{grade} | {subjects}</p>
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
            <p className="py-6 text-center text-sm text-muted-foreground">No requests received yet.</p>
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

function TeacherProfileTab({ me, setActiveTab }: TeacherProfileTabProps) {
  const navigate = useNavigate();
  const [tp, setTp] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [profileSubTab, setProfileSubTab] = useState<"personal" | "qualifications" | "availability">("personal");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setEmail(u.user.email ?? null);
      const [tpRes, sRes] = await Promise.all([
        supabase.from("teacher_profiles").select("*").eq("user_id", u.user.id).maybeSingle(),
        supabase.from("teacher_subjects").select("subject, level, board").eq("teacher_id", u.user.id),
      ]);
      setTp(tpRes.data);
      setSubjects((sRes.data as any[]) ?? []);
    })();
  }, []);

  async function toggleActive(v: boolean) {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("teacher_profiles").update({ is_active: v }).eq("user_id", u.user.id);
    if (error) return toast.error(error.message);
    setTp((p: any) => ({ ...p, is_active: v }));
    toast.success(v ? "Listing reactivated." : "Listing deactivated.");
  }

  const subjectNames = subjects.map((s) => `${capitalize(s.subject)} (${s.level})`).join(", ");

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A] font-display">Profile Details</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setActiveTab("home")}
            className="bg-[#E2E8F0] text-[#1A1A1A] hover:bg-[#CBD5E1] rounded-full px-5 font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={() => navigate({ to: "/onboarding/teacher" })}
            className="bg-[#4665FF] text-white hover:bg-[#4665FF]/90 rounded-full px-5 font-semibold"
          >
            Edit
          </Button>
        </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <ProfileItem label="Full Name" value={capitalize(me?.full_name)} />
              <ProfileItem label="Email Address" value={email} />
              <ProfileItem label="Phone Number" value={me?.phone} />
              <ProfileItem label="Gender" value={tp?.gender ? capitalize(tp.gender) : "-"} className="capitalize" />
              <ProfileItem label="City" value={capitalize(me?.city)} />
              <ProfileItem label="Area" value={capitalize(me?.area)} />
              <ProfileItem label="Biography" value={tp?.bio} className="md:col-span-2 leading-relaxed" />
            </div>
          </div>
        )}

        {profileSubTab === "qualifications" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#1A1A1A] mb-4">Qualifications & Experience</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <ProfileItem label="Years of Experience" value={tp?.years_experience ? `${tp.years_experience} years` : "-"} />
              <ProfileItem
                label="Fee Range"
                value={tp ? (tp.fee_min === tp.fee_max ? `₹${tp.fee_min}/hr` : `₹${tp.fee_min}–₹${tp.fee_max}/hr`) : "-"}
              />
              <ProfileItem label="Subjects Taught" value={subjectNames || "-"} className="md:col-span-2" />
              {(tp?.certifications ?? []).length > 0 && (
                <ProfileItem label="Certifications" value={tp.certifications.map(capitalize).join(", ")} className="md:col-span-2" />
              )}
              {(tp?.other_experience ?? []).length > 0 && (
                <ProfileItem label="Other Related Experience" value={tp.other_experience.map(capitalize).join(", ")} className="md:col-span-2" />
              )}
            </div>
          </div>
        )}

        {profileSubTab === "availability" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A] mb-4">Availability Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <ProfileItem label="Teaching Mode" value={tp?.mode === "both" ? "Online & In-Person" : capitalize(tp?.mode)} />
                <ProfileItem label="Languages of Instruction" value={(tp?.languages ?? []).map(capitalize).join(", ") || "-"} />
                <ProfileItem label="Available Days" value={(tp?.available_days ?? []).map(capitalize).join(", ") || "-"} />
                <ProfileItem label="Time Slots" value={(tp?.time_slots ?? []).join(", ") || "-"} />
                <div className="rounded-xl border border-border bg-slate-50/50 p-4 flex items-center justify-between md:col-span-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Listing Visibility</p>
                    <p className="mt-1 text-sm font-bold text-[#1A1A1A]">
                      {tp?.is_active ? "Visible in search results" : "Hidden from search"}
                    </p>
                  </div>
                  {tp && <Switch checked={!!tp.is_active} onCheckedChange={toggleActive} />}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileItem({ label, value, className }: { label: string; value: string | null | undefined; className?: string }) {
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
          .select("user_id, bio, years_experience, fee_min, fee_max, mode, rating_avg, rating_count, profiles!inner(full_name, city, area, avatar_url), teacher_subjects(subject, level, board)")
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
        const subjects = (t.teacher_subjects ?? []).map((s: any) => s.subject?.toLowerCase()).join(" ");
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
              <Badge variant="secondary" className="bg-[#4665FF]/5 text-[#4665FF] border-0 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                Keyword: "{searchQuery}"
                <button onClick={() => setSearchQuery("")} className="hover:text-red-500 font-bold ml-1">×</button>
              </Badge>
            )}
            {locationQuery && (
              <Badge variant="secondary" className="bg-[#4665FF]/5 text-[#4665FF] border-0 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                Location: {locationQuery}
                <button onClick={() => setLocationQuery("")} className="hover:text-red-500 font-bold ml-1">×</button>
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
          <p className="text-sm text-muted-foreground mt-1">Try relaxing your search terms or changing the locality filter.</p>
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
            <img src={tutor.profiles.avatar_url} alt={tutor.profiles.full_name} className="w-full h-full object-cover" />
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
            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Subjects</p>
            <p className="text-xs text-foreground/80 font-medium line-clamp-1 mt-0.5">{subjects}</p>
          </div>
        )}
        <div className="flex justify-between items-center text-xs">
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Hourly Fee</p>
            <p className="font-semibold text-foreground/90 mt-0.5">{feeLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Rating</p>
            <p className="font-bold text-[#4665FF] flex items-center justify-end gap-0.5 mt-0.5">
              <Star className="h-3.5 w-3.5 fill-current text-[#4665FF]" />
              {rating}
            </p>
          </div>
        </div>
      </div>

      <Button asChild size="sm" className="w-full mt-5 rounded-full bg-[#4665FF] text-white hover:bg-[#4665FF]/95 font-medium transition-all shadow-sm">
        <Link to="/tutors/$id" params={{ id: tutor.user_id }}>View Profile</Link>
      </Button>
    </div>
  );
}

function LearnerProfileTab({ me }: { me: any }) {
  const [sp, setSp] = useState<any>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setEmail(u.user.email ?? null);
      const { data: spRes } = await supabase.from("student_profiles").select("*").eq("user_id", u.user.id).maybeSingle();
      setSp(spRes);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Your Learning Profile</h2>
          <p className="text-sm text-muted-foreground">Manage your grade level and subject interests.</p>
        </div>
        <Button asChild className="bg-[#4665FF] hover:bg-[#4665FF]/90 rounded-full">
          <Link to="/onboarding/learner">
            <Pencil className="mr-2 h-4 w-4" /> Edit Profile
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-[#1A1A1A] mb-4">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <ProfileItem label="Full Name" value={capitalize(me?.full_name)} />
            <ProfileItem label="Email Address" value={email} />
            <ProfileItem label="Phone Number" value={me?.phone} />
            <ProfileItem label="City" value={capitalize(me?.city)} />
            <ProfileItem label="Area" value={capitalize(me?.area)} />
          </div>
        </div>

        {sp && (
          <div className="border-t border-border/80 pt-6">
            <h3 className="text-base font-bold text-[#1A1A1A] mb-4">Learning Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
              <ProfileItem label="Grade / Level" value={sp.class_grade} />
              <ProfileItem label="Mode Preference" value={sp.mode_preference === "both" ? "Online & In-person" : capitalize(sp.mode_preference)} />
            </div>
            {sp.subjects_of_interest && sp.subjects_of_interest.length > 0 && (
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
