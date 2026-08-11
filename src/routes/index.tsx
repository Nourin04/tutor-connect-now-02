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
  BookOpen,
  GraduationCap,
  ChevronRight,
  CheckCircle2,
  Calculator,
  Atom,
  Dna,
  Code,
  ChevronDown,
  Menu,
  X,
  Handshake,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Heart,
} from "lucide-react";
import heroTutor from "@/assets/01.png";
import studentImg from "@/assets/student-1.jpg";
import tutorImg from "@/assets/02.png";
import parentImg from "@/assets/parent-child.jpg";
import subjectIllustration from "@/assets/subject-illustration.png";

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
    <div className="min-h-screen bg-white text-[#0f172a] font-sans antialiased selection:bg-[#5357FE]/10 selection:text-[#5357FE]">
      <Header />
      <main>
        <Hero />
        <MetricsBanner />
        <TrustBar />
        <FeaturedTutors />
        <BrowseSubjects />
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

/* ---------- Header ---------- */
function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Brand className="h-8" />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7">
          <Link
            to="/tutors"
            className="text-sm font-semibold text-slate-600 hover:text-[#5357FE] transition-colors duration-150"
          >
            Find Tutors
          </Link>
          {[
            { label: "How it Works", href: "#how" },
            { label: "Subjects", href: "#subjects" },
            { label: "For Tutors", href: "#teachers" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-semibold text-slate-600 hover:text-[#5357FE] transition-colors duration-150"
            >
              {item.label}
            </a>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-[#5357FE] cursor-pointer outline-none transition-colors">
              Resources <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border border-slate-100 shadow-lg min-w-[150px]">
              <DropdownMenuItem className="rounded-lg font-medium cursor-pointer">Blog</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg font-medium cursor-pointer">Guides</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg font-medium cursor-pointer">FAQ</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/auth"
            search={{ mode: "signin" }}
            className="text-sm font-semibold text-slate-700 hover:text-[#5357FE] transition-colors px-2"
          >
            Sign in
          </Link>
          <Button
            className="bg-[#5357FE] hover:bg-[#4245d4] text-white rounded-xl font-semibold px-5 h-10 shadow-none transition-all duration-200 hover:shadow-[0_4px_20px_rgba(83,87,254,0.35)]"
            asChild
          >
            <Link to="/auth" search={{ mode: "signup" }}>
              Get Started
            </Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-5 space-y-4 shadow-lg">
          <nav className="flex flex-col gap-3">
            <Link to="/tutors" className="text-sm font-semibold text-slate-700 py-1" onClick={() => setMobileOpen(false)}>Find Tutors</Link>
            <a href="#how" className="text-sm font-semibold text-slate-700 py-1" onClick={() => setMobileOpen(false)}>How it Works</a>
            <a href="#subjects" className="text-sm font-semibold text-slate-700 py-1" onClick={() => setMobileOpen(false)}>Subjects</a>
            <a href="#teachers" className="text-sm font-semibold text-slate-700 py-1" onClick={() => setMobileOpen(false)}>For Tutors</a>
          </nav>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
            <Link to="/auth" search={{ mode: "signin" }} className="text-sm font-semibold text-slate-700 text-center" onClick={() => setMobileOpen(false)}>Sign in</Link>
            <Button className="bg-[#5357FE] text-white rounded-xl w-full" asChild>
              <Link to="/auth" search={{ mode: "signup" }} onClick={() => setMobileOpen(false)}>Get Started</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  const navigate = useNavigate();
  const [subjectQuery, setSubjectQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/tutors", search: { query: subjectQuery || undefined, location: locationQuery || undefined } });
  };

  return (
    <section className="relative overflow-hidden bg-[#f5f5ff] pt-12 pb-0 lg:pt-20">
      {/* Decorative blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full bg-[#5357FE]/8 blur-3xl" />
        <div className="absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[500px] rounded-full bg-indigo-100/40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-end gap-10 lg:grid-cols-2">
          {/* Left */}
          <div className="pb-12 lg:pb-20 space-y-7 text-center lg:text-left">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#5357FE]/10 border border-[#5357FE]/20 px-4 py-1.5 text-xs font-semibold text-[#5357FE]">
              <Sparkles className="h-3.5 w-3.5" />
              Direct Tutor Marketplace • 0% Commission
            </div>

            {/* Headline */}
            <h1 className="text-[42px] sm:text-5xl lg:text-[56px] font-extrabold leading-[1.08] tracking-tight text-[#0f172a]">
              Find the perfect tutor.
              <br />
              <span>Right when </span>
              <span className="text-[#5357FE]">you need it.</span>
            </h1>

            {/* Subtext */}
            <p className="mx-auto lg:mx-0 max-w-lg text-[17px] text-slate-500 leading-relaxed">
              Connect with verified local and online tutors for any subject, class, or board. Transparent pricing. Direct contact. No hidden fees.
            </p>

            {/* Search Widget */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white rounded-2xl border border-slate-200 shadow-[0_8px_40px_rgba(83,87,254,0.10)] p-2 flex flex-col sm:flex-row gap-2 max-w-[520px] mx-auto lg:mx-0"
            >
              <div className="flex flex-1 items-center gap-2.5 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100 focus-within:border-[#5357FE]/40 focus-within:bg-white transition-all">
                <BookOpen className="h-4 w-4 text-slate-400 shrink-0" />
                <Input
                  type="text"
                  placeholder="Subject (e.g. Maths, Physics)"
                  value={subjectQuery}
                  onChange={(e) => setSubjectQuery(e.target.value)}
                  className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400 text-slate-700 font-medium"
                />
              </div>
              <div className="flex flex-1 items-center gap-2.5 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100 focus-within:border-[#5357FE]/40 focus-within:bg-white transition-all">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                <Input
                  type="text"
                  placeholder="Location or City"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400 text-slate-700 font-medium"
                />
              </div>
              <Button
                type="submit"
                className="shrink-0 bg-[#5357FE] hover:bg-[#4245d4] text-white rounded-xl px-6 py-3 font-semibold transition-all hover:shadow-[0_4px_20px_rgba(83,87,254,0.35)] flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search Tutors
              </Button>
            </form>

            {/* Trust pills */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
              {["100% Free for Parents", "Direct Contact Details", "Verified Educators"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#5357FE]" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — Hero image with floating badges */}
          <div className="relative flex justify-center lg:justify-end items-end">
            {/* Rating badge */}
            <div className="absolute top-6 -left-4 sm:top-8 sm:left-0 lg:-left-8 z-20 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.10)] border border-slate-100 px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="h-9 w-9 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-slate-800">4.9 / 5.0</span>
                  <span className="text-xs text-slate-400">(120+ reviews)</span>
                </div>
                <p className="text-xs text-slate-400 leading-none mt-0.5">Highest Rated Tutors</p>
              </div>
            </div>

            {/* Main image */}
            <div className="relative overflow-hidden rounded-t-[2rem] w-full max-w-md lg:max-w-none">
              <img
                src={heroTutor}
                alt="Tutor helping a student"
                className="w-full object-cover object-top rounded-t-[2rem]"
                style={{ maxHeight: 460 }}
              />
            </div>

            {/* Verified badge */}
            <div className="absolute bottom-8 -right-2 sm:bottom-12 sm:-right-4 lg:-right-8 z-20 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.10)] border border-slate-100 px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
              <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4 text-[#5357FE]" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-tight">Verified Qualifications</p>
                <p className="text-xs text-slate-400 mt-0.5">CBSE, ICSE, IB & State</p>
              </div>
            </div>

            {/* Families badge */}
            <div className="absolute bottom-8 -left-4 sm:bottom-12 sm:left-0 lg:-left-8 z-20 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.10)] border border-slate-100 px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="flex -space-x-2">
                <img className="h-7 w-7 rounded-full ring-2 ring-white object-cover" src={studentImg} alt="" />
                <img className="h-7 w-7 rounded-full ring-2 ring-white object-cover" src={parentImg} alt="" />
                <img className="h-7 w-7 rounded-full ring-2 ring-white object-cover" src={tutorImg} alt="" />
                <div className="h-7 w-7 rounded-full ring-2 ring-white bg-[#5357FE] flex items-center justify-center text-[9px] font-bold text-white shrink-0">+5K</div>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 leading-tight">5,000+ Families</p>
                <p className="text-xs text-slate-400 mt-0.5">Connected Successfully</p>
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
    { icon: Users, value: "5,000+", label: "Verified Tutors", bg: "bg-indigo-50", color: "text-[#5357FE]", fill: false },
    { icon: Handshake, value: "25,000+", label: "Direct Connections", bg: "bg-blue-50", color: "text-blue-500", fill: false },
    { icon: Star, value: "4.9 / 5", label: "Average Student Rating", bg: "bg-amber-50", color: "text-amber-500", fill: true },
    { icon: ShieldCheck, value: "100%", label: "Free for Parents", bg: "bg-emerald-50", color: "text-emerald-500", fill: false },
  ];

  return (
    <section className="bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-slate-100 shadow-[0_4px_30px_rgba(83,87,254,0.06)] bg-white px-6 py-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map(({ icon: Icon, value, label, bg, color, fill }) => (
            <div key={label} className="flex items-center gap-4 px-2 sm:px-4">
              <div className={`h-11 w-11 shrink-0 rounded-full ${bg} ${color} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${fill ? "fill-amber-400 text-amber-400" : ""}`} />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-800 leading-none tracking-tight">{value}</p>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">{label}</p>
              </div>
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
    <section className="bg-white pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Boards & exams covered:
          </p>
          {items.map((i) => (
            <span key={i} className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 hover:border-[#5357FE]/30 hover:text-[#5357FE] transition-colors cursor-default">
              {i}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Featured Tutors ---------- */
function FeaturedTutors() {
  const sampleTutors = [
    { id: "sample-1", name: "Dr. Rajesh Kumar", title: "Senior Physics & Maths Specialist", exp: "12+ years experience", rate: "₹750 / hr", location: "Bengaluru (Online & In-Person)", rating: "4.9", reviewsCount: "84", subjects: ["Physics", "Mathematics", "JEE Prep"], avatar: tutorImg },
    { id: "sample-2", name: "Ananya Sharma", title: "Chemistry & CBSE Science Educator", exp: "7+ years experience", rate: "₹600 / hr", location: "Delhi (Online)", rating: "5.0", reviewsCount: "42", subjects: ["Chemistry", "CBSE Science", "NEET"], avatar: studentImg },
    { id: "sample-3", name: "David Miller", title: "IB & IGCSE English Literature Expert", exp: "9+ years experience", rate: "₹850 / hr", location: "Mumbai (In-Person)", rating: "4.8", reviewsCount: "59", subjects: ["English Lit", "IB Board", "IGCSE"], avatar: parentImg },
  ];

  return (
    <section className="py-20 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-flex items-center text-xs font-bold text-[#5357FE] uppercase tracking-wider mb-2">Top Rated Educators</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Featured <span className="text-[#5357FE]">Local & Online</span> Tutors
            </h2>
            <p className="mt-2 text-slate-500">Handpicked, verified tutors ready to help you excel.</p>
          </div>
          <Link
            to="/tutors"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5357FE] hover:gap-2.5 transition-all shrink-0"
          >
            Browse All Tutors <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {sampleTutors.map((tutor) => (
            <div
              key={tutor.id}
              className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_40px_rgba(83,87,254,0.12)] hover:border-[#5357FE]/20 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3.5">
                  <img src={tutor.avatar} alt={tutor.name} className="h-14 w-14 rounded-xl object-cover border border-slate-100 shrink-0" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-slate-900 text-[15px] group-hover:text-[#5357FE] transition-colors">{tutor.name}</h3>
                      <ShieldCheck className="h-3.5 w-3.5 text-[#5357FE] shrink-0" />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{tutor.title}</p>
                    <p className="text-xs font-semibold text-[#5357FE] mt-1">{tutor.exp}</p>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-red-400 transition-colors shrink-0 mt-0.5">
                  <Heart className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{tutor.location}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {tutor.subjects.map((sub) => (
                  <span key={sub} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-100">{sub}</span>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div>
                  <div className="flex items-center gap-1 text-sm font-bold text-slate-800">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{tutor.rating}</span>
                    <span className="text-xs text-slate-400 font-normal">({tutor.reviewsCount})</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{tutor.rate}</p>
                </div>
                <Button asChild size="sm" className="bg-[#5357FE] hover:bg-[#4245d4] text-white rounded-xl font-semibold px-4 shadow-none hover:shadow-[0_4px_16px_rgba(83,87,254,0.35)] transition-all">
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

/* ---------- Browse by Subject ---------- */
function BrowseSubjects() {
  const subjects = [
    { title: "Mathematics & Statistics", icon: Calculator, count: "1,200+ Tutors", desc: "Algebra, Calculus, Geometry, Statistics for all school levels." },
    { title: "Physics & Chemistry", icon: Atom, count: "950+ Tutors", desc: "Conceptual science tuition, lab practicals, and numericals." },
    { title: "Biology & Life Sciences", icon: Dna, count: "780+ Tutors", desc: "Botany, Zoology, Genetics, and medical entrance foundations." },
    { title: "English & Languages", icon: BookOpen, count: "850+ Tutors", desc: "Grammar, Literature, Spoken English, and competitive prep." },
    { title: "Competitive Exam Prep", icon: GraduationCap, count: "1,100+ Tutors", desc: "Specialized coaching for JEE Main, NEET, and Olympiads." },
    { title: "Coding & Computer Science", icon: Code, count: "640+ Tutors", desc: "Python, Java, Web Development, and Computer Applications." },
  ];

  const stats = [
    { icon: Users, value: "5,000+", label: "Verified Tutors" },
    { icon: Handshake, value: "25,000+", label: "Direct Connections" },
    { icon: Star, value: "4.9 / 5", label: "Average Rating", fill: true },
    { icon: ShieldCheck, value: "100%", label: "Free for Parents" },
  ];

  return (
    <section id="subjects" className="py-20 bg-[#f4f5ff]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Two-column header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-12">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#5357FE]/10 border border-[#5357FE]/20 px-3.5 py-1.5 text-xs font-semibold text-[#5357FE] mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Explore Categories
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-slate-900 tracking-tight leading-tight">
              Browse Tutors{" "}
              <span className="text-[#5357FE]">by Subject</span>
            </h2>
            <p className="mt-4 text-[16px] text-slate-500 leading-relaxed">
              Find expert tutors specialized in your exact subject and exam syllabus.
            </p>
          </div>
          {/* 3D Illustration */}
          <div className="hidden lg:block shrink-0">
            <img
              src={subjectIllustration}
              alt="Educational illustration"
              className="h-52 w-52 object-contain drop-shadow-xl"
            />
          </div>
        </div>

        {/* Subject Cards — horizontal layout */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((sub) => {
            const Icon = sub.icon;
            return (
              <Link
                key={sub.title}
                to="/tutors"
                search={{ query: sub.title.split(" ")[0] }}
                className="group flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(83,87,254,0.11)] hover:border-[#5357FE]/25 transition-all duration-300"
              >
                {/* Icon + Title + Count row */}
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-[#5357FE]/8 text-[#5357FE] flex items-center justify-center group-hover:bg-[#5357FE] group-hover:text-white transition-all duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[14px] font-bold text-slate-900 group-hover:text-[#5357FE] transition-colors leading-tight">{sub.title}</h3>
                      <span className="shrink-0 text-[11px] font-bold text-[#5357FE] bg-[#5357FE]/8 px-2.5 py-0.5 rounded-full">{sub.count}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{sub.desc}</p>
                  </div>
                </div>
                {/* Explore link */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-[#5357FE]">
                  Explore Tutors <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Stats + CTA banner */}
        <div className="mt-8 rounded-3xl bg-gradient-to-r from-[#5357FE] via-[#5f62ff] to-[#7c3aed] px-8 py-8 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute right-48 top-0 h-40 w-40 rounded-full bg-white/5 -translate-y-1/2 pointer-events-none" />
          <div className="absolute right-24 bottom-0 h-24 w-24 rounded-full bg-white/5 translate-y-1/2 pointer-events-none" />

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 flex-1">
            {stats.map(({ icon: Icon, value, label, fill }) => (
              <div key={label} className="flex flex-col items-center sm:items-start gap-1.5">
                <Icon className={`h-6 w-6 text-white/70 ${fill ? "fill-white/70" : ""}`} />
                <p className="text-2xl font-black text-white tracking-tight">{value}</p>
                <p className="text-xs font-medium text-indigo-200">{label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="shrink-0 text-center lg:text-right">
            <p className="text-base font-bold text-white">Can't find what you need?</p>
            <p className="text-sm text-indigo-200 mt-0.5 mb-4">Let us help you find the perfect tutor for your requirements.</p>
            <Button
              className="bg-white text-[#5357FE] hover:bg-white/90 rounded-xl font-bold px-5 h-10 shadow-none transition-all"
              asChild
            >
              <Link to="/tutors">
                Request a Tutor <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- How It Works ---------- */
function HowItWorks() {
  const [activePersona, setActivePersona] = useState<"learner" | "teacher">("learner");

  const learnerSteps = [
    { n: "01", title: "Tell us what you need", desc: "Search by subject, class or board, location, and your preferred mode (online or in-person)." },
    { n: "02", title: "Compare local tutors", desc: "Browse rich profiles with qualifications, hourly rates, teaching modes, and ratings." },
    { n: "03", title: "Connect directly", desc: "Reach out to your chosen tutor directly with zero platform fees or middleman charges." },
  ];

  const teacherSteps = [
    { n: "01", title: "Create your free profile", desc: "Sign up in 2 minutes and list your qualifications, subject expertise, and hourly rates." },
    { n: "02", title: "Get discovered locally", desc: "Appear in search results when students and parents search in your city or subject." },
    { n: "03", title: "Start teaching & earning", desc: "Receive direct contact requests from interested students and set your own terms." },
  ];

  const steps = activePersona === "learner" ? learnerSteps : teacherSteps;

  return (
    <section id="how" className="py-20 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-block text-xs font-bold text-[#5357FE] uppercase tracking-widest mb-3">Simple Process</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">How TutorConnect Works</h2>
          <p className="mt-3 text-slate-500">A seamless journey designed for both students and tutors.</p>

          <div className="mt-6 inline-flex items-center p-1 rounded-xl bg-slate-100 gap-1">
            {(["learner", "teacher"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setActivePersona(p)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activePersona === p ? "bg-white text-[#5357FE] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {p === "learner" ? "For Students & Parents" : "For Tutors"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.n} className="relative rounded-2xl border border-slate-100 bg-[#f8f8ff] p-7 hover:border-[#5357FE]/20 hover:shadow-[0_4px_30px_rgba(83,87,254,0.08)] transition-all duration-300">
              <span className="text-5xl font-black text-[#5357FE]/15 leading-none">{s.n}</span>
              <h3 className="mt-3 text-[17px] font-bold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="absolute right-6 top-8 hidden h-5 w-5 text-[#5357FE]/30 md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- For Teachers ---------- */
function ForTeachers() {
  const benefits = [
    "Create a professional profile in minutes — no approvals",
    "Reach families actively searching in your area",
    "Showcase your qualifications, subjects, and availability",
    "Set your own hourly rates and session schedules",
  ];

  return (
    <section id="teachers" className="py-20 bg-[#f4f5ff]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: Text content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#5357FE]/10 border border-[#5357FE]/20 px-4 py-1.5 text-xs font-semibold text-[#5357FE]">
              <Sparkles className="h-3.5 w-3.5" />
              Empower Your Teaching Journey
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-slate-900 tracking-tight leading-tight">
              Grow your tuition practice{" "}
              <span className="text-[#5357FE]">without any hassle.</span>
            </h2>

            <p className="text-[16px] text-slate-500 leading-relaxed max-w-lg">
              Create a professional profile in minutes and connect with students actively looking for the right tutor.
            </p>

            <ul className="space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-3 text-[15px] text-slate-700">
                  <div className="h-5 w-5 rounded-full bg-[#5357FE]/12 flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3 text-[#5357FE]" />
                  </div>
                  {b}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button className="bg-[#5357FE] hover:bg-[#4245d4] text-white rounded-xl font-bold px-6 h-11 shadow-none hover:shadow-[0_4px_20px_rgba(83,87,254,0.35)] transition-all flex items-center gap-2" asChild>
                <Link to="/auth" search={{ mode: "signup", role: "teacher" }}>
                  <Sparkles className="h-4 w-4" />
                  Become a tutor
                </Link>
              </Button>
              <Link
                to="/tutors"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-[#5357FE] transition-colors"
              >
                Learn more <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right: Photo with floating card */}
          <div className="relative">
            {/* Main photo */}
            <div className="overflow-hidden rounded-3xl shadow-[0_20px_60px_rgba(83,87,254,0.15)] aspect-[4/3]">
              <img
                src={tutorImg}
                alt="Tutor helping a student"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Floating badge — bottom right */}
            <div className="absolute -bottom-4 -right-4 sm:bottom-6 sm:-right-6 z-20 bg-white rounded-2xl shadow-[0_8px_32px_rgba(83,87,254,0.14)] border border-slate-100 px-4 py-3.5 flex items-center gap-3">
              {/* Dashed circle avatar cluster */}
              <div className="relative h-12 w-12 shrink-0">
                <div className="h-12 w-12 rounded-full border-2 border-dashed border-[#5357FE]/40 flex items-center justify-center">
                  <div className="h-9 w-9 rounded-full bg-[#5357FE]/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-[#5357FE]" />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 leading-tight">Thousands of tutors</p>
                <p className="text-xs text-slate-400 mt-0.5">already growing with us</p>
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
    { quote: "Found a brilliant Maths tutor for my son in two days. His grades and confidence have both jumped.", name: "Anita S.", role: "Parent, Bengaluru", img: parentImg, rating: 5 },
    { quote: "I'm a first-year college student and found a great Physics tutor nearby. They are affordable, patient, and explain everything clearly.", name: "Karan D.", role: "Student, Pune", img: studentImg, rating: 5 },
    { quote: "As a tutor, TutorConnect filled my weekday evenings within a month. The profile-first approach really works.", name: "Meera R.", role: "Tutor, Hyderabad", img: tutorImg, rating: 5 },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-100 px-3.5 py-1.5 text-xs font-semibold text-rose-500 mb-4">
            <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
            Success Stories
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Loved by families and tutors{" "}
            <span className="text-[#5357FE]">across India</span>
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((r) => (
            <figure
              key={r.name}
              className="relative flex flex-col rounded-2xl bg-white border border-slate-100 shadow-[0_4px_24px_rgba(83,87,254,0.06)] p-7 hover:shadow-[0_8px_40px_rgba(83,87,254,0.12)] hover:border-[#5357FE]/15 transition-all duration-300"
            >
              {/* Large quotation mark watermark */}
              <span
                aria-hidden="true"
                className="absolute top-5 right-6 text-6xl font-black leading-none text-[#5357FE]/15 select-none"
              >
                ”
              </span>

              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="flex-1 text-[15px] text-slate-700 leading-relaxed">
                "{r.quote}"
              </blockquote>

              {/* Author */}
              <figcaption className="mt-6 flex items-center gap-3 pt-5 border-t border-slate-100">
                <img
                  src={r.img}
                  alt={r.name}
                  width={44}
                  height={44}
                  loading="lazy"
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">{r.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{r.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mt-10">
          {reviews.map((_, i) => (
            <span
              key={i}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === 0 ? "w-7 bg-[#5357FE]" : "w-2.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
function FAQ() {
  const faqs = [
    { q: "Is TutorConnect free to use?", a: "Yes. Browsing tutors, viewing profiles, and contacting them is completely free for parents and students. Tutors can also list their profiles at no cost." },
    { q: "How do I evaluate a tutor?", a: "Every tutor profile displays detailed qualifications, educational background, years of teaching experience, fee structures, and specialized subjects so you can make an informed decision." },
    { q: "Do you support online and in-person tutoring?", a: "Both. Filter by mode of teaching (online, offline, or both) and find a tutor that fits the way you or your child learns best." },
    { q: "Can I cover specific boards like CBSE, ICSE or State?", a: "Yes. Tutors specify their syllabus/board specialization on their profile, so you can filter by CBSE, ICSE, State boards, IB, IGCSE, and exam prep like NEET and JEE." },
    { q: "How do I pay the tutor?", a: "Payments happen directly between you and the tutor at the rate listed on their profile. TutorConnect doesn't charge any fees or commissions." },
  ];

  return (
    <section id="faq" className="py-20 sm:py-28 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold text-[#5357FE] uppercase tracking-widest mb-3">FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Common questions</h2>
          <p className="mt-3 text-slate-500">Everything you need to know before getting started.</p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-2xl border border-slate-100 bg-white px-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] data-[state=open]:border-[#5357FE]/20 data-[state=open]:shadow-[0_4px_24px_rgba(83,87,254,0.08)] transition-all duration-300"
            >
              <AccordionTrigger className="text-left text-[15px] font-bold text-slate-900 hover:no-underline py-5">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-slate-500 pb-5">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ---------- CTA Section ---------- */
function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#f8f8ff]">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5357FE] via-[#6366f1] to-[#7c3aed] px-8 py-16 sm:px-16 sm:py-20 text-center">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />

          <div className="relative">
            <span className="inline-block text-xs font-bold text-indigo-200 uppercase tracking-widest mb-4">Get Started Today</span>
            <h2 className="mx-auto max-w-2xl text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white tracking-tight leading-tight">
              Start learning with a tutor who actually fits you.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[17px] text-indigo-200 leading-relaxed">
              Join thousands of parents and students using TutorConnect to find the right teacher, in their area, at the right price.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-white text-[#5357FE] hover:bg-white/90 rounded-xl font-bold px-8 text-[15px] shadow-[0_4px_20px_rgba(255,255,255,0.3)] transition-all" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>Find a Tutor</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/20 hover:text-white rounded-xl font-semibold px-8 text-[15px] transition-all" asChild>
                <Link to="/auth" search={{ mode: "signup", role: "teacher" }}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Become a Tutor
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="bg-[#0f172a] text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-white/8">
          {/* Brand col */}
          <div className="md:col-span-2 space-y-4">
            <Brand className="h-8 brightness-0 invert" />
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Helping families and independent tutors connect locally, transparently, and directly across India.
            </p>
            <div className="flex gap-3 pt-2">
              {[Twitter, Instagram, Linkedin, Facebook].map((Icon, i) => (
                <a key={i} href="#" className="h-9 w-9 rounded-xl bg-white/8 hover:bg-[#5357FE] flex items-center justify-center transition-all duration-200 group">
                  <Icon className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Product" links={[
            { label: "Find Tutors", href: "/tutors" },
            { label: "How it Works", href: "#how" },
            { label: "Browse Subjects", href: "#subjects" },
            { label: "For Tutors", href: "#teachers" },
          ]} />
          <FooterCol title="Company" links={[
            { label: "About Us", href: "#" },
            { label: "Blog", href: "#" },
            { label: "Careers", href: "#" },
            { label: "Contact", href: "#" },
          ]} />
          <FooterCol title="Legal" links={[
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
            { label: "FAQ", href: "#faq" },
          ]} />
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TutorConnect. All rights reserved.</p>
          <p>Made with ♥ for learners, everywhere.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-white mb-5">{title}</h4>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors duration-150">{link.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
