import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/site/AppHeader";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  Search,
  MapPin,
  User,
  SlidersHorizontal,
  Home,
  Heart,
  LogOut,
  X,
  MessageSquare,
  ArrowLeft,
  Mail,
  Phone,
} from "lucide-react";
import { fetchPrimaryRole, type AppRole } from "@/lib/auth-helpers";
import { TeacherProfileTab, LearnerProfileTab } from "@/components/site/ProfileTabs";
import { toast } from "sonner";
import { capitalize } from "@/lib/string-helpers";

type SearchParams = {
  tab?: string;
};

export const Route = createFileRoute("/_authenticated/dashboard")({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      tab: (search.tab as string) || "home",
    };
  },
  component: DashboardPage,
});

/* ---------- Constants for Filters ---------- */
const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Computer Science",
  "Economics",
  "Accountancy",
  "Music",
  "Art",
  "Other",
];
const LEVELS = [
  "Class 1-5",
  "Class 6-8",
  "Class 9-10",
  "Class 11-12",
  "Undergraduate",
  "Postgraduate",
  "Adult learner",
];
const BOARDS = ["CBSE", "ICSE", "State", "IB", "IGCSE", "Other"];
const MODES = [
  { value: "any", label: "Any mode" },
  { value: "online", label: "Online" },
  { value: "offline", label: "In-person" },
  { value: "both", label: "Both" },
];
const SORTS = [
  { value: "rating", label: "Top rated" },
  { value: "experience", label: "Most experienced" },
  { value: "fee_low", label: "Lowest fee" },
];

type FilterState = {
  q: string;
  city: string;
  subject: string;
  level: string;
  board: string;
  mode: string;
  gender: string;
  language: string;
  feeMax: number;
  minRating: number;
  sort: string;
  favouritesOnly: boolean;
};

const DEFAULT_FILTERS: FilterState = {
  q: "",
  city: "",
  subject: "any",
  level: "any",
  board: "any",
  mode: "any",
  gender: "any",
  language: "",
  feeMax: 5000,
  minRating: 0,
  sort: "rating",
  favouritesOnly: false,
};

function DashboardPage() {
  const navigate = useNavigate();
  const { tab = "home" } = Route.useSearch();
  const [role, setRole] = useState<AppRole | null>(null);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savedTutors, setSavedTutors] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const activeTab = tab;

  function setActiveTab(t: string) {
    setSelectedStudent(null); // Reset selected student when changing tabs
    navigate({ to: "/dashboard", search: { tab: t } });
  }

  async function loadSavedTutors(userId: string) {
    try {
      const { data, error } = await supabase
        .from("saved_tutors" as any)
        .select("teacher_id")
        .eq("user_id", userId);
      if (error) {
        console.warn("saved_tutors table not found, using localStorage fallback.");
        const localSaved = localStorage.getItem(`saved_tutors_${userId}`);
        setSavedTutors(localSaved ? JSON.parse(localSaved) : []);
        return;
      }
      const ids = (data ?? []).map((d: any) => d.teacher_id);
      setSavedTutors(ids);
      localStorage.setItem(`saved_tutors_${userId}`, JSON.stringify(ids));
    } catch (e) {
      console.warn("Error loading saved list, using localStorage fallback:", e);
      const localSaved = localStorage.getItem(`saved_tutors_${userId}`);
      setSavedTutors(localSaved ? JSON.parse(localSaved) : []);
    }
  }

  async function toggleSave(teacherId: string, isSaved: boolean) {
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return;

    // Always update local state first
    let updated: string[];
    if (isSaved) {
      updated = savedTutors.filter((id) => id !== teacherId);
      setSavedTutors(updated);
      toast.success("Tutor removed from saved list.");
    } else {
      updated = [...savedTutors, teacherId];
      setSavedTutors(updated);
      toast.success("Tutor saved!");
    }
    localStorage.setItem(`saved_tutors_${u.user.id}`, JSON.stringify(updated));

    // Try database sync
    try {
      if (isSaved) {
        await supabase
          .from("saved_tutors" as any)
          .delete()
          .eq("user_id", u.user.id)
          .eq("teacher_id", teacherId);
      } else {
        await supabase
          .from("saved_tutors" as any)
          .insert({ user_id: u.user.id, teacher_id: teacherId } as any);
      }
    } catch (e) {
      console.warn("Could not sync saved tutor to database:", e);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        if (!u.user) return;
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
        await loadSavedTutors(u.user.id);
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
      {/* Shared Header */}
      <AppHeader fullWidth />

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col md:flex-row animate-in fade-in duration-300">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-white flex flex-col justify-between p-5 shrink-0 md:sticky md:top-16 md:h-[calc(100vh-4rem)]">
          <div className="space-y-1.5">
            <button
              onClick={() => setActiveTab("home")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "home"
                  ? "bg-[#4665FF]/10 text-[#4665FF]"
                  : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
              }`}
            >
              <Home className="h-4 w-4" />
              Home
            </button>
            {role !== "teacher" && (
              <button
                onClick={() => setActiveTab("favourites")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "favourites"
                    ? "bg-[#4665FF]/10 text-[#4665FF]"
                    : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
                }`}
              >
                <Star className={`h-4 w-4 ${activeTab === "favourites" ? "fill-current" : ""}`} />
                Favourite Tutors
              </button>
            )}
            <button
              onClick={() => setActiveTab("requests")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "requests"
                  ? "bg-[#4665FF]/10 text-[#4665FF]"
                  : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Requests
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-red-50 transition-all mt-6 md:mt-auto cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {role === "teacher" ? (
              selectedStudent ? (
                <StudentProfileView
                  student={selectedStudent}
                  onBack={() => setSelectedStudent(null)}
                />
              ) : activeTab === "home" ? (
                <TeacherDashboard me={me} onViewStudentProfile={(s) => setSelectedStudent(s)} />
              ) : activeTab === "requests" ? (
                <TeacherRequestsView />
              ) : activeTab === "profile" ? (
                <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                  <TeacherProfileTab me={me} />
                </div>
              ) : null
            ) : activeTab === "home" ? (
              <LearnerDashboard me={me} savedTutors={savedTutors} onToggleSave={toggleSave} />
            ) : activeTab === "favourites" ? (
              <LearnerSavedTutorsView savedTutors={savedTutors} onToggleSave={toggleSave} />
            ) : activeTab === "requests" ? (
              <LearnerRequestsView />
            ) : activeTab === "profile" ? (
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <LearnerProfileTab me={me} />
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------------- Teacher Home Tab view ---------------- */
interface TeacherDashboardProps {
  me: any;
  onViewStudentProfile: (student: any) => void;
}

function TeacherDashboard({ me, onViewStudentProfile }: TeacherDashboardProps) {
  const [tp, setTp] = useState<any>(null);
  const [contactCount, setContactCount] = useState(0);
  const [acceptedStudents, setAcceptedStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        if (!u.user) return;

        const [tpRes, cRes, reqData] = await Promise.all([
          supabase.from("teacher_profiles").select("*").eq("user_id", u.user.id).maybeSingle(),
          supabase
            .from("contact_events")
            .select("id", { count: "exact", head: true })
            .eq("teacher_id", u.user.id),
          supabase
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
                avatar_url,
                student_profiles:student_profiles(class_grade, subjects_of_interest)
              )
            `,
            )
            .eq("teacher_id", u.user.id)
            .eq("status", "accepted")
            .order("created_at", { ascending: false }),
        ]);

        setTp(tpRes.data);
        setContactCount(cRes.count ?? 0);

        const reqs = (reqData.data as any[]) ?? [];
        const acceptedIds = reqs.map((r) => r.viewer_id);

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

        setAcceptedStudents(
          reqs.map((r) => ({
            ...r,
            phone: phonesMap[r.viewer_id] || null,
          })),
        );
      } catch (err) {
        console.error("Error fetching teacher dashboard:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return <div className="p-10 text-center text-muted-foreground">Loading dashboard stats…</div>;

  const ratingAvg = tp?.rating_avg ? Number(tp.rating_avg).toFixed(1) : "0.0";
  const feeLabel = tp
    ? tp.fee_min === tp.fee_max
      ? `₹${tp.fee_min}/hr`
      : `₹${tp.fee_min}–₹${tp.fee_max}/hr`
    : "-";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A] font-display">
          Welcome Back, {capitalize(me?.full_name)}
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here is a quick overview of your teaching metrics.
        </p>
      </div>

      {/* Metrics Row (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Views / Contact Reveals Card */}
        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <p className="text-sm font-semibold text-[#1A1A1A]">Your Profile Views</p>
          <p className="text-4xl font-bold text-[#1A1A1A] mt-4 font-display">{contactCount}</p>
        </div>

        {/* Ratings Card */}
        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <p className="text-sm font-semibold text-[#1A1A1A]">Your ratings</p>
          <div className="flex items-baseline gap-1 mt-4">
            <p className="text-4xl font-bold text-[#1A1A1A] font-display">{ratingAvg}</p>
            <p className="text-sm text-muted-foreground font-semibold">/5</p>
          </div>
        </div>

        {/* Hourly Rate Card */}
        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
          <p className="text-sm font-semibold text-[#1A1A1A]">Hourly rate</p>
          <p className="text-3xl font-bold text-[#1A1A1A] mt-4 font-display truncate">{feeLabel}</p>
        </div>
      </div>

      {/* My Students Section */}
      <div className="space-y-4 pt-4 border-t border-border/40">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1A1A1A] font-display">
            My Students
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Students who requested your contact details and were accepted.
          </p>
        </div>

        {acceptedStudents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-12 text-center shadow-sm">
            <User className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-semibold text-[#1A1A1A]">No accepted students yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Accept student connection requests to see them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {acceptedStudents.map((r) => {
              const studentName = r.profiles?.full_name
                ? capitalize(r.profiles.full_name)
                : "Student";
              const grade = r.profiles?.student_profiles?.class_grade || "Any Grade";
              const subjects =
                (r.profiles?.student_profiles?.subjects_of_interest ?? [])
                  .map(capitalize)
                  .join(", ") || "Any Subject";

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-border pt-8 pb-5 px-5 text-center flex flex-col justify-between hover:shadow-md hover:border-[#4665FF]/20 transition-all shadow-sm relative group"
                >
                  <div>
                    {/* Student Avatar */}
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 border border-border overflow-hidden shrink-0">
                      {r.profiles?.avatar_url ? (
                        <img
                          src={r.profiles.avatar_url}
                          alt={studentName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#4665FF]/10 text-lg font-bold text-[#4665FF]">
                          {studentName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-[#1A1A1A] line-clamp-1">
                      {studentName}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center justify-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0 text-[#4665FF]" />
                      <span>Grade: {grade}</span>
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50 text-left space-y-2.5">
                    {subjects && (
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                          Subjects
                        </p>
                        <p className="text-xs text-foreground/80 font-medium line-clamp-1 mt-0.5">
                          {subjects}
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                        Contact Details
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-foreground/80 font-medium">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate" title={r.profiles?.email}>
                            {r.profiles?.email}
                          </span>
                        </div>
                        {r.phone && (
                          <div className="flex items-center gap-2 text-xs text-foreground/80 font-medium">
                            <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span>{r.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => onViewStudentProfile(r)}
                    className="w-full mt-5 rounded-md bg-[#4665FF] hover:bg-[#4665FF]/95 text-white font-medium transition-all shadow-sm cursor-pointer text-xs"
                  >
                    View Profile
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Student Profile detail view screen ---------------- */
interface StudentProfileViewProps {
  student: any;
  onBack: () => void;
}

function StudentProfileView({ student, onBack }: StudentProfileViewProps) {
  const studentName = student.profiles?.full_name
    ? capitalize(student.profiles.full_name)
    : "Student";
  const grade = student.profiles?.student_profiles?.class_grade || "Any Grade";
  const subjects =
    (student.profiles?.student_profiles?.subjects_of_interest ?? []).map(capitalize).join(", ") ||
    "Any Subject";

  return (
    <div className="space-y-6">
      {/* Back to Home Button */}
      <div className="flex justify-start">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors duration-200 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
      </div>

      {/* Main Student Profile details layout */}
      <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-border/50 pb-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border border-border overflow-hidden shrink-0">
            {student.profiles?.avatar_url ? (
              <img
                src={student.profiles.avatar_url}
                alt={studentName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#4665FF]/10 text-2xl font-bold text-[#4665FF]">
                {studentName.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <h1 className="text-2xl font-bold text-[#1A1A1A] font-display">{studentName}</h1>
            <p className="text-sm font-semibold text-[#4665FF]">Grade Level: {grade}</p>
            <p className="text-xs text-muted-foreground">Registered Student Member</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left panel: Subjects of Interest */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider text-muted-foreground">
              Subjects of Interest
            </h3>
            <div className="flex flex-wrap gap-2">
              {(student.profiles?.student_profiles?.subjects_of_interest ?? []).map(
                (subj: string, idx: number) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="bg-[#4665FF]/5 text-[#4665FF] border-0 rounded-full px-3 py-1 font-semibold text-xs"
                  >
                    {capitalize(subj)}
                  </Badge>
                ),
              )}
              {(student.profiles?.student_profiles?.subjects_of_interest ?? []).length === 0 && (
                <p className="text-sm text-muted-foreground italic">No subjects specified.</p>
              )}
            </div>
          </div>

          {/* Right panel: Contact & Connection Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wider text-muted-foreground">
              Contact & Connection Details
            </h3>
            <div className="bg-[#F8F9FE] border border-border/50 rounded-2xl p-5 space-y-3.5 text-sm">
              <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
                <span className="font-semibold text-muted-foreground text-xs uppercase flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email Address
                </span>
                <span className="font-medium text-foreground">{student.profiles?.email}</span>
              </div>
              {student.phone && (
                <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
                  <span className="font-semibold text-muted-foreground text-xs uppercase flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    Phone Number
                  </span>
                  <span className="font-medium text-foreground">{student.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Teacher incoming requests tab view ---------------- */
function TeacherRequestsView() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
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
        .eq("teacher_id", u.user.id)
        .order("created_at", { ascending: false });

      const reqs = (data as any[]) ?? [];
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
      console.error("Error loading teacher requests:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(requestId: string, status: "accepted" | "declined") {
    const { error } = await supabase.from("contact_events").update({ status }).eq("id", requestId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Request ${status}.`);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  if (loading)
    return <div className="p-10 text-center text-muted-foreground">Loading contact requests…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A] font-display">
          Contact Requests
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage students requesting to view your contact information.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center shadow-sm">
          <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-semibold text-[#1A1A1A]">No requests received yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Pending student connection requests will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-border overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-[#1A1A1A] py-3.5 pl-6">Student</TableHead>
                <TableHead className="font-semibold text-[#1A1A1A] py-3.5">
                  Date Requested
                </TableHead>
                <TableHead className="font-semibold text-[#1A1A1A] py-3.5">Grade Level</TableHead>
                <TableHead className="font-semibold text-[#1A1A1A] py-3.5">Subjects</TableHead>
                <TableHead className="font-semibold text-[#1A1A1A] py-3.5">
                  Contact Details
                </TableHead>
                <TableHead className="font-semibold text-[#1A1A1A] py-3.5 pr-6 text-right">
                  Status / Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => {
                const studentName = r.profiles?.full_name
                  ? capitalize(r.profiles.full_name)
                  : "A Student";
                const grade = r.profiles?.student_profiles?.class_grade || "Any Grade";
                const subjects =
                  (r.profiles?.student_profiles?.subjects_of_interest ?? [])
                    .map(capitalize)
                    .join(", ") || "Any Subject";

                return (
                  <TableRow key={r.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-bold text-[#1A1A1A] py-4 pl-6">
                      {studentName}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-4">
                      {new Date(r.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-foreground/90 font-medium py-4">{grade}</TableCell>
                    <TableCell
                      className="text-foreground/90 py-4 max-w-[200px] truncate"
                      title={subjects}
                    >
                      {subjects}
                    </TableCell>
                    <TableCell className="py-4">
                      {r.status === "accepted" ? (
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center gap-2 text-foreground/80 font-medium">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">{r.profiles?.email}</span>
                          </div>
                          {r.phone && (
                            <div className="flex items-center gap-2 text-foreground/80 font-medium">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span>{r.phone}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Hidden until accepted
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      {r.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAction(r.id, "accepted")}
                            className="bg-[#4665FF] hover:bg-[#4665FF]/90 text-white font-semibold cursor-pointer h-8 px-3 rounded-md"
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(r.id, "declined")}
                            className="border-border text-[#1A1A1A] hover:bg-slate-100 cursor-pointer h-8 px-3 rounded-md"
                          >
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <Badge
                          className={`capitalize rounded-md font-semibold px-2.5 py-0.5 border-0 ${
                            r.status === "accepted"
                              ? "bg-green-500/10 text-green-600"
                              : "bg-slate-100 text-muted-foreground"
                          }`}
                        >
                          {r.status}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

/* ---------------- Learner/Student outgoing requests tab view ---------------- */
function LearnerRequestsView() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("contact_events")
        .select(
          `
          id, 
          status, 
          created_at, 
          teacher_id, 
          teacher_profiles:teacher_profiles(
            user_id, 
            fee_min, 
            fee_max, 
            profiles:profiles!teacher_profiles_user_id_fkey(full_name, email)
          )
        `,
        )
        .eq("viewer_id", u.user.id)
        .order("created_at", { ascending: false });

      const reqs = (data as any[]) ?? [];
      const acceptedTeacherIds = reqs
        .filter((r) => r.status === "accepted")
        .map((r) => r.teacher_id);

      let phonesMap: Record<string, string> = {};
      if (acceptedTeacherIds.length > 0) {
        const { data: phones } = await supabase
          .from("user_phones")
          .select("user_id, phone")
          .in("user_id", acceptedTeacherIds);
        (phones ?? []).forEach((p) => {
          phonesMap[p.user_id] = p.phone;
        });
      }

      setRequests(reqs.map((r) => ({ ...r, phone: phonesMap[r.teacher_id] || null })));
    } catch (e) {
      console.error("Error loading learner requests:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(requestId: string) {
    const { error } = await supabase
      .from("contact_events")
      .update({ status: "cancelled" })
      .eq("id", requestId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Request cancelled.");
    load();
  }

  useEffect(() => {
    load();
  }, []);

  if (loading)
    return <div className="p-10 text-center text-muted-foreground">Loading sent requests…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A] font-display">
          Contact Requests
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track and manage connection requests sent to tutors.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center shadow-sm">
          <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-semibold text-[#1A1A1A]">No requests sent yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tutors you request connection details from will be listed here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-md border border-border overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold text-[#1A1A1A] py-3.5 pl-6">Tutor</TableHead>
                <TableHead className="font-semibold text-[#1A1A1A] py-3.5">
                  Date Requested
                </TableHead>
                <TableHead className="font-semibold text-[#1A1A1A] py-3.5">Hourly Rate</TableHead>
                <TableHead className="font-semibold text-[#1A1A1A] py-3.5">
                  Contact Details
                </TableHead>
                <TableHead className="font-semibold text-[#1A1A1A] py-3.5 pr-6 text-right">
                  Status / Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => {
                const tutorName = r.teacher_profiles?.profiles?.full_name
                  ? capitalize(r.teacher_profiles.profiles.full_name)
                  : "A Tutor";
                const fee = r.teacher_profiles
                  ? r.teacher_profiles.fee_min === r.teacher_profiles.fee_max
                    ? `₹${r.teacher_profiles.fee_min}/hr`
                    : `₹${r.teacher_profiles.fee_min}–${r.teacher_profiles.fee_max}/hr`
                  : "-";

                return (
                  <TableRow key={r.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-bold text-[#1A1A1A] py-4 pl-6">
                      {tutorName}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-4">
                      {new Date(r.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-foreground/90 font-medium py-4">{fee}</TableCell>
                    <TableCell className="py-4">
                      {r.status === "accepted" ? (
                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center gap-2 text-foreground/80 font-medium">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">{r.teacher_profiles?.profiles?.email}</span>
                          </div>
                          {r.phone && (
                            <div className="flex items-center gap-2 text-foreground/80 font-medium">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span>{r.phone}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Hidden until accepted
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Badge
                          className={`capitalize rounded-full font-semibold px-3 py-1 border-0 ${
                            r.status === "accepted"
                              ? "bg-green-500/10 text-green-600"
                              : r.status === "pending"
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-slate-100 text-muted-foreground"
                          }`}
                        >
                          {r.status}
                        </Badge>
                        {r.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => handleCancel(r.id)}
                            className="bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-md font-semibold cursor-pointer text-xs h-8 px-3"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

/* ---------------- Learner/Student/Parent views ---------------- */
interface LearnerDashboardProps {
  me: any;
  savedTutors: string[];
  onToggleSave: (id: string, isSaved: boolean) => void;
}

function LearnerDashboard({ me, savedTutors, onToggleSave }: LearnerDashboardProps) {
  const [tutors, setTutors] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [loadingTutors, setLoadingTutors] = useState(true);
  const set = <K extends keyof FilterState>(k: K, v: FilterState[K]) =>
    setFilters((p) => ({ ...p, [k]: v }));

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

    return list.filter((r) => {
      const isSaved = savedTutors.includes(r.user_id);
      if (filters.favouritesOnly && !isSaved) return false;
      if (
        filters.q &&
        !`${r.profiles?.full_name ?? ""} ${r.bio ?? ""}`
          .toLowerCase()
          .includes(filters.q.toLowerCase())
      )
        return false;
      if (
        filters.city &&
        !`${r.profiles?.city ?? ""} ${r.profiles?.area ?? ""}`
          .toLowerCase()
          .includes(filters.city.toLowerCase())
      )
        return false;
      if (
        filters.language &&
        !(r.languages ?? []).some((l: string) =>
          l.toLowerCase().includes(filters.language.toLowerCase()),
        )
      )
        return false;
      const subs = r.teacher_subjects ?? [];
      if (filters.subject !== "any" && !subs.some((s: any) => s.subject === filters.subject))
        return false;
      if (filters.level !== "any" && !subs.some((s: any) => s.level === filters.level))
        return false;
      if (filters.board !== "any" && !subs.some((s: any) => s.board === filters.board))
        return false;

      // Filter rating & fee bounds
      if (filters.feeMax < 5000 && r.fee_min > filters.feeMax) return false;
      if (filters.minRating > 0 && (r.rating_avg ?? 0) < filters.minRating) return false;

      return true;
    });
  }, [tutors, filters, savedTutors]);

  const sortedTutors = useMemo(() => {
    let list = [...filteredTutors];
    if (filters.sort === "rating") {
      list.sort((a, b) => (b.rating_avg ?? 0) - (a.rating_avg ?? 0));
    } else if (filters.sort === "experience") {
      list.sort((a, b) => (b.years_experience ?? 0) - (a.years_experience ?? 0));
    } else if (filters.sort === "fee_low") {
      list.sort((a, b) => (a.fee_min ?? 0) - (b.fee_min ?? 0));
    }
    return list;
  }, [filteredTutors, filters.sort]);

  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.q) n++;
    if (filters.city) n++;
    if (filters.subject !== "any") n++;
    if (filters.level !== "any") n++;
    if (filters.board !== "any") n++;
    if (filters.mode !== "any") n++;
    if (filters.gender !== "any") n++;
    if (filters.language) n++;
    if (filters.feeMax < 5000) n++;
    if (filters.minRating > 0) n++;
    if (filters.favouritesOnly) n++;
    return n;
  }, [filters]);

  return (
    <div className="space-y-6">
      {/* Horizontal Filter Card */}
      <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Filter Tutors</h2>
            {activeCount > 0 && (
              <Badge className="bg-primary-soft text-primary border-0">{activeCount}</Badge>
            )}
          </div>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs hover:bg-[#E2E8F0]/50"
              onClick={() => setFilters(DEFAULT_FILTERS)}
            >
              <X className="mr-1 h-3 w-3" /> Clear filters
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          <FilterRow label="Search">
            <Input
              placeholder="Name or keyword"
              value={filters.q}
              onChange={(e) => set("q", e.target.value)}
            />
          </FilterRow>
          <FilterRow label="Location">
            <Input
              placeholder="City or area"
              value={filters.city}
              onChange={(e) => set("city", e.target.value)}
            />
          </FilterRow>
          <FilterRow label="Subject">
            <SelectField
              value={filters.subject}
              onChange={(v) => set("subject", v)}
              options={[
                { value: "any", label: "Any subject" },
                ...SUBJECTS.map((s) => ({ value: s, label: s })),
              ]}
            />
          </FilterRow>
          <FilterRow label="Level">
            <SelectField
              value={filters.level}
              onChange={(v) => set("level", v)}
              options={[
                { value: "any", label: "Any level" },
                ...LEVELS.map((s) => ({ value: s, label: s })),
              ]}
            />
          </FilterRow>
          <FilterRow label="Mode">
            <SelectField value={filters.mode} onChange={(v) => set("mode", v)} options={MODES} />
          </FilterRow>
          <FilterRow label="Language">
            <Input
              placeholder="e.g. English"
              value={filters.language}
              onChange={(e) => set("language", e.target.value)}
            />
          </FilterRow>

          {/* Max Hourly Fee */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Max Hourly Fee
              </span>
              <span className="text-sm font-bold text-[#4665FF] font-display">
                ₹{filters.feeMax}
                {filters.feeMax >= 5000 ? "+" : ""}/hr
              </span>
            </div>
            <Slider
              value={[filters.feeMax]}
              min={100}
              max={5000}
              step={100}
              onValueChange={([v]) => set("feeMax", v)}
            />
            <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
              <span>₹100</span>
              <span>₹5,000+</span>
            </div>
          </div>

          {/* Min Rating */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Min Rating
              </span>
              <span className="text-sm font-bold text-[#4665FF] font-display">
                {filters.minRating === 0 ? "Any" : `${filters.minRating}★ & above`}
              </span>
            </div>
            <div className="flex w-full bg-[#F8F9FE] p-1 rounded-xl border border-border/50">
              {[0, 3, 4, 4.5].map((r) => {
                const isActive = filters.minRating === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => set("minRating", r)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 text-center flex items-center justify-center gap-0.5 cursor-pointer ${
                      isActive
                        ? "bg-[#4665FF] text-white shadow-sm font-bold"
                        : "text-muted-foreground hover:bg-[#E2E8F0]/40 hover:text-foreground"
                    }`}
                  >
                    {r === 0 ? (
                      "Any"
                    ) : (
                      <>
                        <span>{r}</span>
                        <Star
                          className={`h-3 w-3 ${isActive ? "fill-white text-white" : "fill-muted-foreground text-muted-foreground"}`}
                        />
                        <span className="text-[9px] font-normal">+</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          </div>
        </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-medium">
          Showing{" "}
          <span className="font-bold text-[#4665FF] font-display">{sortedTutors.length}</span> tutor
          {sortedTutors.length === 1 ? "" : "s"}
        </p>
      </div>

      {/* Tutor Listings Grid */}
      {loadingTutors ? (
        <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4665FF]"></div>
          <span>Finding tutors...</span>
        </div>
      ) : sortedTutors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-16 text-center shadow-sm">
          <SlidersHorizontal className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#1A1A1A]">No tutors found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try relaxing your search terms or changing the locality filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedTutors.map((tutor) => {
            const isSaved = savedTutors.includes(tutor.user_id);
            return (
              <TutorGridCard
                key={tutor.user_id}
                tutor={tutor}
                isSaved={isSaved}
                onToggleSave={() => onToggleSave(tutor.user_id, isSaved)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function TutorGridCard({
  tutor,
  isSaved,
  onToggleSave,
}: {
  tutor: any;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  const rating = Number(tutor.rating_avg || 0).toFixed(1);
  const subjects = (tutor.teacher_subjects ?? []).map((s: any) => capitalize(s.subject)).join(", ");
  const feeLabel =
    tutor.fee_min === tutor.fee_max
      ? `₹${tutor.fee_min}/hr`
      : `₹${tutor.fee_min}–${tutor.fee_max}/hr`;

  return (
    <div className="bg-white rounded-2xl border border-border pt-8 pb-5 px-5 text-center flex flex-col justify-between hover:shadow-md hover:border-[#4665FF]/20 transition-all shadow-sm relative group">
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
        <h3 className="text-base font-bold text-[#1A1A1A] line-clamp-1">
          {tutor.profiles?.full_name ? capitalize(tutor.profiles.full_name) : "Tutor Profile"}
        </h3>
        <p className="text-xs text-muted-foreground mt-1.5 flex items-center justify-center gap-1">
          <MapPin className="h-3 w-3 shrink-0 text-[#4665FF]" />
          <span className="truncate">
            {tutor.profiles?.area
              ? `${capitalize(tutor.profiles.area)}, ${capitalize(tutor.profiles.city)}`
              : tutor.profiles?.city
                ? capitalize(tutor.profiles.city)
                : "Local"}
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

      <div className="relative mt-5 flex gap-2">
        <Button
          asChild
          className="flex-1 h-10 rounded-md bg-[#4665FF] text-white hover:bg-[#4665FF]/95 font-medium transition-all shadow-sm cursor-pointer"
        >
          <Link to="/tutors/$id" params={{ id: tutor.user_id }}>
            View Profile
          </Link>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleSave}
          className="rounded-md h-10 w-10 hover:bg-slate-100 shrink-0 border border-border cursor-pointer"
        >
          <Heart
            className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"}`}
          />
        </Button>
      </div>
    </div>
  );
}

/* ---------------- Learner Saved Tutors list view ---------------- */
interface LearnerSavedTutorsViewProps {
  savedTutors: string[];
  onToggleSave: (id: string, isSaved: boolean) => void;
}

function LearnerSavedTutorsView({ savedTutors, onToggleSave }: LearnerSavedTutorsViewProps) {
  const [savedList, setSavedList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;

      const { data, error } = await supabase
        .from("saved_tutors" as any)
        .select(
          `
          id, 
          teacher_profiles:teacher_profiles(
            user_id, 
            bio, 
            rating_avg, 
            rating_count, 
            fee_min, 
            fee_max, 
            mode, 
            profiles:profiles!teacher_profiles_user_id_fkey(full_name, city, area, avatar_url),
            teacher_subjects(subject, level, board)
          )
        `,
        )
        .eq("user_id", u.user.id);

      if (error) {
        // Fallback to localStorage list + direct teacher_profiles query
        console.warn("saved_tutors table not found, loading profiles from localStorage fallback.");
        const localSaved = localStorage.getItem(`saved_tutors_${u.user.id}`);
        const savedIds: string[] = localSaved ? JSON.parse(localSaved) : [];

        if (savedIds.length === 0) {
          setSavedList([]);
          return;
        }

        const { data: teachers, error: teachersError } = await supabase
          .from("teacher_profiles")
          .select(
            `
            user_id, 
            bio, 
            rating_avg, 
            rating_count, 
            fee_min, 
            fee_max, 
            mode, 
            profiles:profiles(full_name, city, area, avatar_url),
            teacher_subjects(subject, level, board)
          `,
          )
          .in("user_id", savedIds);

        if (teachersError) throw teachersError;

        setSavedList(
          (teachers ?? []).map((t: any) => ({
            id: t.user_id,
            teacher_profiles: t,
          })),
        );
        return;
      }

      setSavedList(data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading)
    return <div className="p-10 text-center text-muted-foreground">Loading saved list…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#1A1A1A] font-display">
          Saved Tutors
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">Explore tutors you have favourited.</p>
      </div>
      {savedList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center shadow-sm">
          <Star className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-semibold text-[#1A1A1A]">No saved tutors yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Keep track of tutors you are interested in here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {savedList.map((s) => {
            const t = s.teacher_profiles;
            if (!t) return null;
            const isSaved = savedTutors.includes(t.user_id);
            return (
              <TutorGridCard
                key={t.user_id}
                tutor={t}
                isSaved={isSaved}
                onToggleSave={() => {
                  onToggleSave(t.user_id, isSaved);
                  if (isSaved) {
                    setSavedList((prev) =>
                      prev.filter((item) => item.teacher_profiles?.user_id !== t.user_id),
                    );
                  }
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- Shared Filter Form elements ---------------- */
function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full bg-[#F8F9FE]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
