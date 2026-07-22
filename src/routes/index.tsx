import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchPrimaryRole, dashboardPathForRole, type AppRole } from "@/lib/auth-helpers";
import { Brand } from "@/components/site/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Users,
  Sparkles,
  ArrowRight,
  Check,
  MessageCircle,
  User,
  LogOut,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Award,
  Zap,
  ChevronRight,
  CheckCircle2,
  Calculator,
  Atom,
  Dna,
  Code,
  SlidersHorizontal,
} from "lucide-react";
import heroTutor from "@/assets/01.png";
import studentImg from "@/assets/student-1.jpg";
import tutorImg from "@/assets/02.png";
import parentImg from "@/assets/parent-child.jpg";
import logoUrl from "@/assets/tutorconnect-logo.svg";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      const role = await fetchPrimaryRole();
      throw redirect({ to: dashboardPathForRole(role) });
    }
  },
  head: () => ({
    meta: [
      { title: "TutorConnect | Find Trusted Local Tutors by Subject & Location" },
      {
        name: "description",
        content:
          "Discover local tutors for any subject, class, or board. Compare ratings, fees, and availability, and connect with them directly.",
      },
      { property: "og:title", content: "TutorConnect | Find Trusted Local Tutors" },
      {
        property: "og:description",
        content:
          "Discover local tutors for any subject, class, or board. Compare ratings, fees, and availability.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-[#4665FF]/10 selection:text-[#4665FF]">
      <Header />
      <main>
        <Hero />
        <MetricsBanner />
        <TrustBar />
        <FeaturedTutors />
        <BrowseSubjects />
        <ValueProps />
        <HowItWorks />
        <ForTeachers />
        <Testimonials />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);

  useEffect(() => {
    setIsMounted(true);
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      setEmail(data.user?.email ?? null);
      if (data.user) setRole(await fetchPrimaryRole());
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setEmail(s?.user?.email ?? null);
      if (s?.user) setRole(await fetchPrimaryRole());
      else setRole(null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          {!isMounted ? (
            <>
              <Link
                to="/auth"
                search={{ mode: "signin" }}
                className="text-sm font-semibold text-[#4665FF] hover:text-[#4665FF]/85 hover:underline px-3 py-2 transition-all"
              >
                Sign in
              </Link>
              <Button
                size="sm"
                className="bg-[#4665FF] hover:bg-[#4665FF]/90 text-white rounded-md font-semibold shadow-soft"
                asChild
              >
                <Link to="/auth" search={{ mode: "signup" }}>
                  Get started
                </Link>
              </Button>
            </>
          ) : email ? (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-md font-semibold">
                    <User className="mr-2 h-4 w-4" />
                    <span className="hidden max-w-[140px] truncate sm:inline">{email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Signed in as {role ?? "user"}
                  </DropdownMenuLabel>
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
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="sm"
                variant="outline"
                onClick={signOut}
                className="rounded-md font-semibold"
              >
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Link
                to="/auth"
                search={{ mode: "signin" }}
                className="text-sm font-semibold text-[#4665FF] hover:text-[#4665FF]/85 hover:underline px-3 py-2 transition-all"
              >
                Sign in
              </Link>
              <Button
                size="sm"
                className="bg-[#4665FF] hover:bg-[#4665FF]/90 text-white rounded-md font-semibold shadow-soft"
                asChild
              >
                <Link to="/auth" search={{ mode: "signup" }}>
                  Get started
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return <Brand className="h-9" />;
}

/* ---------- Hero ---------- */
function Hero() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);

  // Search state
  const [subjectQuery, setSubjectQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setEmail(data.user?.email ?? null);
      if (data.user) setRole(await fetchPrimaryRole());
    });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/tutors",
      search: {
        query: subjectQuery || undefined,
        location: locationQuery || undefined,
      },
    });
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
      {/* Background Decorative Blurs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-[#4665FF]/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-blue-300/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Heading & Quick Search */}
          <div className="text-center lg:text-left lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#4665FF]/10 px-3.5 py-1.5 text-xs font-semibold text-[#4665FF] border border-[#4665FF]/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Direct Tutor Marketplace — 0% Commission</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground leading-[1.15]">
              Find the right tutor,
              <br />
              <span className="text-[#4665FF]">right around the corner.</span>
            </h1>

            <p className="mx-auto lg:mx-0 max-w-xl text-base text-muted-foreground sm:text-lg leading-relaxed">
              Discover verified local tutors for any subject, class, or board. Compare hourly fees,
              review qualifications, and connect directly with zero middleman costs.
            </p>

            {/* Interactive Search Bar Widget */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-6 p-2.5 bg-white rounded-2xl border border-border shadow-xl space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2 max-w-2xl mx-auto lg:mx-0"
            >
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 focus-within:border-[#4665FF]/50 transition-all">
                <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  type="text"
                  placeholder="Subject (e.g. Maths, Physics)"
                  value={subjectQuery}
                  onChange={(e) => setSubjectQuery(e.target.value)}
                  className="border-0 bg-transparent p-0 h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
                />
              </div>

              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 focus-within:border-[#4665FF]/50 transition-all">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  type="text"
                  placeholder="Location or City"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="border-0 bg-transparent p-0 h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto bg-[#4665FF] hover:bg-[#4665FF]/90 text-white rounded-xl h-11 px-6 font-semibold shadow-soft shrink-0 cursor-pointer"
              >
                <Search className="mr-2 h-4 w-4" />
                Search Tutors
              </Button>
            </form>

            <div className="pt-2 flex flex-wrap justify-center lg:justify-start items-center gap-6 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#4665FF]" />
                100% Free for Parents
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#4665FF]" />
                Direct Contact Details
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#4665FF]" />
                Verified Educators
              </span>
            </div>
          </div>

          {/* Right Column: Hero Visual with Floating Badges */}
          <div className="relative lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Floating Glassmorphic Badge 1 (Top Left) */}
              <div className="absolute -top-4 -left-4 sm:top-6 sm:-left-6 z-20 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-border/80 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500 font-bold shrink-0">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-1 text-sm font-bold text-foreground">
                    <span>4.9 / 5.0</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      (120+ reviews)
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Highest Rated Tutors</p>
                </div>
              </div>

              {/* Main Image Frame */}
              <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
                <img
                  src={heroTutor}
                  alt="Friendly tutor interacting with a student"
                  width={1280}
                  height={1280}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Floating Glassmorphic Badge 2 (Bottom Right) */}
              <div className="absolute -bottom-4 -right-4 sm:bottom-8 sm:-right-6 z-20 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-border/80 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4665FF]/10 text-[#4665FF] font-bold shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Verified Qualifications</p>
                  <p className="text-xs text-muted-foreground">CBSE, ICSE, IB & State</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Metrics Banner ---------- */
function MetricsBanner() {
  const metrics = [
    { value: "5,000+", label: "Verified Tutors" },
    { value: "25,000+", label: "Direct Connections Made" },
    { value: "4.9 ★", label: "Average Student Rating" },
    { value: "100%", label: "Free for Parents" },
  ];

  return (
    <section className="border-y border-border bg-[#4665FF]/5 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {metrics.map((m) => (
            <div key={m.label} className="space-y-1">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#4665FF] tracking-tight">
                {m.value}
              </p>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Trust bar ---------- */
function TrustBar() {
  const items = ["CBSE", "ICSE", "State Board", "IB", "IGCSE", "NEET", "JEE"];
  return (
    <section className="border-b border-border bg-surface py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Boards & exams covered:
          </p>
          {items.map((i) => (
            <span
              key={i}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80"
            >
              {i}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Featured Tutors Section ---------- */
function FeaturedTutors() {
  const sampleTutors = [
    {
      id: "sample-1",
      name: "Dr. Rajesh Kumar",
      title: "Senior Physics & Maths Specialist",
      exp: "12+ yrs experience",
      rate: "₹750 / hr",
      location: "Bengaluru (Online & In-Person)",
      rating: "4.9",
      reviewsCount: "84",
      subjects: ["Physics", "Mathematics", "JEE Prep"],
      avatar: tutorImg,
    },
    {
      id: "sample-2",
      name: "Ananya Sharma",
      title: "Chemistry & CBSE Science Educator",
      exp: "7+ yrs experience",
      rate: "₹600 / hr",
      location: "Delhi (Online)",
      rating: "5.0",
      reviewsCount: "42",
      subjects: ["Chemistry", "CBSE Science", "NEET"],
      avatar: studentImg,
    },
    {
      id: "sample-3",
      name: "David Miller",
      title: "IB & IGCSE English Literature Expert",
      exp: "9+ yrs experience",
      rate: "₹850 / hr",
      location: "Mumbai (In-Person)",
      rating: "4.8",
      reviewsCount: "59",
      subjects: ["English Lit", "IB Board", "IGCSE"],
      avatar: parentImg,
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <Badge className="bg-[#4665FF]/10 text-[#4665FF] border-0 mb-2 font-semibold">
              Top Rated Educators
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              Featured Local & Online Tutors
            </h2>
            <p className="mt-2 text-muted-foreground">
              Connect directly with high-performing, verified tutors ready to help you excel.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="rounded-md border-border font-semibold shrink-0"
          >
            <Link to="/tutors">
              Browse All Tutors
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {sampleTutors.map((tutor) => (
            <div
              key={tutor.id}
              className="group rounded-2xl border border-border bg-card p-6 shadow-card hover:border-[#4665FF]/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={tutor.avatar}
                    alt={tutor.name}
                    className="h-14 w-14 rounded-xl object-cover border border-border shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-foreground text-base group-hover:text-[#4665FF] transition-colors">
                        {tutor.name}
                      </h3>
                      <ShieldCheck className="h-4 w-4 text-[#4665FF] shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{tutor.title}</p>
                    <p className="text-xs font-medium text-[#4665FF] mt-1">{tutor.exp}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{tutor.location}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {tutor.subjects.map((sub) => (
                    <span
                      key={sub}
                      className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border/80 flex items-center justify-between mt-auto">
                <div>
                  <div className="flex items-center gap-1 text-sm font-bold text-foreground">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{tutor.rating}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      ({tutor.reviewsCount})
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-foreground mt-0.5">{tutor.rate}</p>
                </div>

                <Button
                  asChild
                  size="sm"
                  className="bg-[#4665FF] hover:bg-[#4665FF]/90 text-white rounded-md font-semibold"
                >
                  <Link to="/tutors">View Profile</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Browse by Subject Grid ---------- */
function BrowseSubjects() {
  const subjects = [
    {
      title: "Mathematics & Statistics",
      icon: Calculator,
      count: "1,200+ Tutors",
      desc: "Algebra, Calculus, Geometry, Statistics for all school levels.",
    },
    {
      title: "Physics & Chemistry",
      icon: Atom,
      count: "950+ Tutors",
      desc: "Conceptual science tuition, lab practicals, and numericals.",
    },
    {
      title: "Biology & Life Sciences",
      icon: Dna,
      count: "780+ Tutors",
      desc: "Botany, Zoology, Genetics, and medical entrance foundations.",
    },
    {
      title: "English & Languages",
      icon: BookOpen,
      count: "850+ Tutors",
      desc: "Grammar, Literature, Spoken English, and competitive prep.",
    },
    {
      title: "Competitive Exam Prep",
      icon: GraduationCap,
      count: "1,100+ Tutors",
      desc: "Specialized coaching for JEE Main, NEET, and Olympiads.",
    },
    {
      title: "Coding & Computer Science",
      icon: Code,
      count: "640+ Tutors",
      desc: "Python, Java, Web Development, and Computer Applications.",
    },
  ];

  return (
    <section className="py-20 bg-surface border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge className="bg-[#4665FF]/10 text-[#4665FF] border-0 mb-2 font-semibold">
            Explore Categories
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Browse Tutors by Subject
          </h2>
          <p className="mt-2 text-muted-foreground">
            Find expert tutors specialized in your exact subject and exam syllabus.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((sub) => {
            const Icon = sub.icon;
            return (
              <Link
                key={sub.title}
                to="/tutors"
                search={{ query: sub.title.split(" ")[0] }}
                className="group rounded-2xl border border-border bg-card p-6 shadow-card hover:border-[#4665FF]/40 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4665FF]/10 text-[#4665FF] transition-transform group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold text-[#4665FF] bg-[#4665FF]/10 px-2.5 py-1 rounded-full">
                    {sub.count}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-[#4665FF] transition-colors">
                  {sub.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{sub.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#4665FF]">
                  <span>Explore Tutors</span>
                  <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- Value props ---------- */
function ValueProps() {
  const items = [
    {
      icon: User,
      title: "Detailed profiles",
      desc: "Every profile displays qualifications, subject expertise, and experience directly from the tutor so you can choose with confidence.",
    },
    {
      icon: MapPin,
      title: "Nearby or online",
      desc: "Filter by your city, neighborhood, or pick online tutors. Match the format that fits your routine.",
    },
    {
      icon: Sparkles,
      title: "Free to connect",
      desc: "Browse, message, and arrange tuition directly with zero platform fees or hidden commission costs.",
    },
  ];
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Designed for learning that actually <span className="text-[#4665FF]">sticks</span>.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Built around what parents and students told us they needed: clarity, trust, and the
            right tutor without any hassle.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border bg-card p-7 transition-all hover:border-[#4665FF]/30 hover:shadow-soft"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4665FF]/10 text-[#4665FF] transition-transform group-hover:scale-110">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- How it works (Interactive Mode Toggle) ---------- */
function HowItWorks() {
  const [activePersona, setActivePersona] = useState<"learner" | "teacher">("learner");

  const learnerSteps = [
    {
      n: "01",
      title: "Tell us what you need",
      desc: "Search by subject, class or board, location, and your preferred mode (online or in-person).",
    },
    {
      n: "02",
      title: "Compare local tutors",
      desc: "Browse rich profiles with qualifications, hourly rates, teaching modes, and ratings.",
    },
    {
      n: "03",
      title: "Connect directly",
      desc: "Reach out to your chosen tutor directly with zero platform fees or middleman charges.",
    },
  ];

  const teacherSteps = [
    {
      n: "01",
      title: "Create your free profile",
      desc: "Sign up in 2 minutes and list your qualifications, subject expertise, and hourly rates.",
    },
    {
      n: "02",
      title: "Get discovered locally",
      desc: "Appear in search results when students and parents search in your city or subject.",
    },
    {
      n: "03",
      title: "Start teaching & earning",
      desc: "Receive direct contact requests from interested students and set your own terms.",
    },
  ];

  const currentSteps = activePersona === "learner" ? learnerSteps : teacherSteps;

  return (
    <section id="how" className="bg-surface py-20 sm:py-28 border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge className="bg-[#4665FF]/10 text-[#4665FF] border-0 mb-2 font-semibold">
            Simple Process
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How TutorConnect Works</h2>
          <p className="mt-2 text-muted-foreground">
            A seamless journey designed for both students looking for help and tutors seeking
            students.
          </p>

          {/* Persona Toggle */}
          <div className="mt-6 inline-flex p-1 rounded-xl bg-slate-200/80 border border-slate-300">
            <button
              onClick={() => setActivePersona("learner")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activePersona === "learner"
                  ? "bg-white text-[#4665FF] shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              For Students & Parents
            </button>
            <button
              onClick={() => setActivePersona("teacher")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activePersona === "teacher"
                  ? "bg-white text-[#4665FF] shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              For Tutors
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {currentSteps.map((s, i) => (
            <div
              key={s.n}
              className="relative rounded-2xl border border-border bg-card p-7 shadow-card transition-all hover:border-[#4665FF]/30"
            >
              <span className="text-5xl font-extrabold text-[#4665FF]/20 font-display">{s.n}</span>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              {i < currentSteps.length - 1 && (
                <ArrowRight className="absolute right-6 top-7 hidden h-5 w-5 text-[#4665FF]/40 md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- For teachers ---------- */
function ForTeachers() {
  const benefits = [
    "Create a professional profile in minutes with no approvals and no fees",
    "Reach families actively searching in your area",
    "Showcase qualifications, subjects, and availability",
    "Set your own hourly rates and session schedules",
  ];
  return (
    <section id="teachers" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#4665FF] to-[oklch(0.45_0.22_270)] text-primary-foreground">
          <div className="grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:p-16">
            <div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl text-white">
                Grow your tuition practice without any hassle.
              </h2>

              <ul className="mt-6 space-y-3">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-white/90">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-white" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  className="bg-white text-[#4665FF] hover:bg-white/90 rounded-md font-semibold"
                  asChild
                >
                  <Link to="/auth" search={{ mode: "signup", role: "teacher" }}>
                    Become a tutor
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
                <img
                  src={tutorImg}
                  alt="Independent tutor on TutorConnect"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */
function Testimonials() {
  const reviews = [
    {
      quote:
        "Found a brilliant Maths tutor for my son in two days. His grades and confidence have both jumped.",
      name: "Anita S.",
      role: "Parent, Bengaluru",
      img: parentImg,
    },
    {
      quote:
        "I'm a first-year college student and found a great Physics tutor nearby. They are affordable, patient, and explain everything clearly.",
      name: "Karan D.",
      role: "Student, Pune",
      img: studentImg,
    },
    {
      quote:
        "As a tutor, TutorConnect filled my weekday evenings within a month. The profile-first approach really works.",
      name: "Meera R.",
      role: "Tutor, Hyderabad",
      img: tutorImg,
    },
  ];

  return (
    <section className="bg-surface py-20 sm:py-28 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge className="bg-[#4665FF]/10 text-[#4665FF] border-0 mb-2 font-semibold">
            Success Stories
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by families and tutors <span className="text-[#4665FF]">across India</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {reviews.map((r) => (
            <figure
              key={r.name}
              className="flex h-full flex-col rounded-2xl border border-border bg-card p-7 shadow-card"
            >
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/85">
                "{r.quote}"
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <img
                  src={r.img}
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                  className="h-10 w-10 rounded-full object-cover border border-border"
                />
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
function FAQ() {
  const faqs = [
    {
      q: "Is TutorConnect free to use?",
      a: "Yes. Browsing tutors, viewing profiles, and contacting them is completely free for parents and students. Tutors can also list their profiles at no cost.",
    },
    {
      q: "How do I evaluate a tutor?",
      a: "Every tutor profile displays detailed qualifications, educational background, years of teaching experience, fee structures, and specialized subjects so you can make an informed decision.",
    },
    {
      q: "Do you support online and in-person tutoring?",
      a: "Both. Filter by mode of teaching (online, offline, or both) and find a tutor that fits the way you or your child learns best.",
    },
    {
      q: "Can I cover specific boards like CBSE, ICSE or State?",
      a: "Yes. Tutors specify their syllabus/board specialization on their profile, so you can filter by CBSE, ICSE, State boards, IB, IGCSE, and exam prep like NEET and JEE.",
    },
    {
      q: "How do I pay the tutor?",
      a: "Payments happen directly between you and the tutor at the rate listed on their profile. TutorConnect doesn't charge any fees or commissions.",
    },
  ];

  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Common questions</h2>
          <p className="mt-3 text-muted-foreground">
            Everything you need to know before getting started.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-10 space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-2xl border border-border bg-card px-5 shadow-card"
            >
              <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ---------- CTA ---------- */
function CTASection() {
  return (
    <section className="px-4 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-foreground px-8 py-14 text-center text-background sm:px-12 sm:py-20">
          <div className="absolute inset-0 -z-10 opacity-30">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#4665FF] blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-[#4665FF] blur-3xl" />
          </div>
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Start learning with a tutor who actually fits you.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-background/70">
            Join thousands of parents and students using TutorConnect to find the right teacher, in
            their area, at the right price.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="bg-[#4665FF] hover:bg-[#4665FF]/90 text-white rounded-md font-semibold shadow-md"
              asChild
            >
              <Link to="/auth" search={{ mode: "signup" }}>
                Find a tutor
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background rounded-md font-semibold"
              asChild
            >
              <Link to="/auth" search={{ mode: "signup", role: "teacher" }}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Become a tutor
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Helping families and independent tutors connect locally, transparently, and directly.
            </p>
          </div>
          <div className="flex gap-24 sm:gap-36 md:gap-48">
            <FooterCol
              title="Product"
              links={[
                { label: "How it works", href: "#how" },
                { label: "FAQ", href: "#faq" },
                { label: "About", href: "#" },
                { label: "Contact", href: "#" },
              ]}
            />
            <FooterCol
              title="Legal"
              links={[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ]}
            />
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} TutorConnect. All rights reserved.</p>
          <p>Made for learners, everywhere.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-[#4665FF]"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
