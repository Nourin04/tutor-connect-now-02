import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchPrimaryRole, dashboardPathForRole, type AppRole } from "@/lib/auth-helpers";
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
  Search,
  MapPin,
  Star,
  ShieldCheck,
  GraduationCap,
  Users,
  Sparkles,
  BookOpen,
  Calculator,
  FlaskConical,
  Globe2,
  Code2,
  Music2,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import heroTutor from "@/assets/hero-tutor.jpg";
import studentImg from "@/assets/student-1.jpg";
import tutorImg from "@/assets/tutor-1.jpg";
import parentImg from "@/assets/parent-child.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TutorConnect — Find trusted local tutors by subject & location" },
      {
        name: "description",
        content:
          "Discover verified local tutors for any subject, class, or board. Compare ratings, fees, and availability — then connect directly.",
      },
      { property: "og:title", content: "TutorConnect — Find trusted local tutors" },
      {
        property: "og:description",
        content:
          "Discover verified local tutors for any subject, class, or board. Compare ratings, fees, and availability.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <ValueProps />
        <HowItWorks />
        <PopularSubjects />
        <FeaturedTutors />
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
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);

  useEffect(() => {
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

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#how" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it works</a>
          <a href="#subjects" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Subjects</a>
          <a href="#tutors" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Tutors</a>
          <a href="#teachers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">For teachers</a>
          <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          {email ? (
            <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft">
              <Link to={dashboardPathForRole(role)}>Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                <Link to="/auth" search={{ mode: "signin" }}>Sign in</Link>
              </Button>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft" asChild>
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
  return (
    <Link to="/" className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <GraduationCap className="h-5 w-5" />
      </div>
      <span className="text-lg font-bold tracking-tight">TutorConnect</span>
    </Link>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-24 sm:px-6 lg:px-8 lg:pt-24 lg:pb-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <Badge className="bg-primary-soft text-primary border-0 px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="mr-1 h-3 w-3" /> Trusted by 10,000+ families
            </Badge>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Find the right tutor,
              <br />
              <span className="text-primary">right around the corner.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg lg:mx-0">
              Discover trusted local tutors by subject, class, and location. Compare ratings,
              fees, and availability — then connect directly. No middlemen.
            </p>

            <div className="mt-8 rounded-2xl border border-border bg-card p-3 shadow-card lg:max-w-lg">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Subject e.g. Maths, Physics"
                    className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                  />
                </div>
                <div className="hidden h-8 w-px bg-border sm:block" />
                <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Your area or city"
                    className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                  />
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
                  Search
                </Button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Free to browse</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Verified reviews</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Online & in-person</span>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
              <img
                src={heroTutor}
                alt="A friendly tutor working with a student"
                width={1280}
                height={1280}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Floating cards */}
            <div className="absolute -left-4 top-8 hidden rounded-2xl border border-border bg-card p-3 shadow-card sm:flex sm:items-center sm:gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Star className="h-5 w-5 fill-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">4.9 / 5</p>
                <p className="text-xs text-muted-foreground">From 2,400+ reviews</p>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-2 hidden rounded-2xl border border-border bg-card p-3 shadow-card sm:block">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <img src={studentImg} alt="" width={32} height={32} className="h-8 w-8 rounded-full border-2 border-card object-cover" />
                  <img src={tutorImg} alt="" width={32} height={32} className="h-8 w-8 rounded-full border-2 border-card object-cover" />
                  <img src={parentImg} alt="" width={32} height={32} className="h-8 w-8 rounded-full border-2 border-card object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none">12K+ tutors</p>
                  <p className="text-xs text-muted-foreground">across India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Trust bar ---------- */
function TrustBar() {
  const items = ["CBSE", "ICSE", "State Board", "IB", "IGCSE", "NEET", "JEE"];
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Boards & exams covered
          </p>
          {items.map((i) => (
            <span key={i} className="text-sm font-semibold text-foreground/70">
              {i}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Value props ---------- */
function ValueProps() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Vetted, reviewed tutors",
      desc: "Every profile shows real ratings, reviews, and qualifications so you can choose with confidence.",
    },
    {
      icon: MapPin,
      title: "Nearby — or online",
      desc: "Filter by your city, neighborhood, or pick online tutors. Match the format that fits your routine.",
    },
    {
      icon: Sparkles,
      title: "Free to connect",
      desc: "Browse, message and arrange tuition directly. No platform fees, no middlemen, no hidden costs.",
    },
  ];
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge className="bg-primary-soft text-primary border-0">Why TutorConnect</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Designed for learning that actually <span className="text-primary">sticks</span>.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Built around what parents and students told us they needed: clarity, trust, and the
            right tutor — without the runaround.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border bg-card p-7 transition-all hover:border-primary/30 hover:shadow-soft"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary transition-transform group-hover:scale-110">
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

/* ---------- How it works ---------- */
function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Tell us what you need",
      desc: "Subject, class or level, location, and your preferred mode — online, offline, or both.",
    },
    {
      n: "02",
      title: "Compare local tutors",
      desc: "Browse profiles with qualifications, fees, availability and reviews from real families.",
    },
    {
      n: "03",
      title: "Connect directly",
      desc: "Reach out to the tutor straight from their profile and start lessons on your schedule.",
    },
  ];
  return (
    <section id="how" className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-end gap-8 lg:grid-cols-2">
          <div>
            <Badge className="bg-primary-soft text-primary border-0">How it works</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              From "I need a tutor" to your first lesson — in minutes.
            </h2>
          </div>
          <p className="text-muted-foreground lg:text-right">
            No accounts to verify, no waiting for callbacks. Find a tutor today, start as soon
            as tomorrow.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="relative rounded-2xl border border-border bg-card p-7 shadow-card"
            >
              <span className="text-5xl font-extrabold text-primary/15">{s.n}</span>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="absolute right-6 top-7 hidden h-5 w-5 text-primary/40 md:block" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 rounded-3xl border border-border bg-card p-6 sm:grid-cols-3 sm:p-10">
          <Stat value="12K+" label="Active tutors" />
          <Stat value="200+" label="Subjects & exams" />
          <Stat value="4.9/5" label="Avg. tutor rating" />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center sm:text-left">
      <p className="text-4xl font-extrabold tracking-tight text-primary">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

/* ---------- Popular subjects ---------- */
function PopularSubjects() {
  const subjects = [
    { icon: Calculator, name: "Mathematics", count: "1,240 tutors" },
    { icon: FlaskConical, name: "Science", count: "980 tutors" },
    { icon: Globe2, name: "Languages", count: "760 tutors" },
    { icon: Code2, name: "Coding & CS", count: "420 tutors" },
    { icon: BookOpen, name: "English & Lit", count: "1,100 tutors" },
    { icon: Music2, name: "Music & Arts", count: "310 tutors" },
  ];
  return (
    <section id="subjects" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge className="bg-primary-soft text-primary border-0">Subjects</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Explore popular <span className="text-primary">subjects</span>
            </h2>
          </div>
          <Button variant="ghost" className="text-primary hover:bg-primary-soft">
            See all subjects <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map(({ icon: Icon, name, count }) => (
            <a
              key={name}
              href="#"
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{name}</p>
                <p className="text-sm text-muted-foreground">{count}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Featured tutors ---------- */
function FeaturedTutors() {
  const tutors = [
    {
      img: tutorImg,
      name: "Arjun Mehta",
      subject: "Physics & Maths • Class 11-12",
      area: "Koramangala, Bengaluru",
      rating: 4.9,
      reviews: 128,
      fee: "₹800/hr",
    },
    {
      img: studentImg,
      name: "Priya Iyer",
      subject: "English & Literature • Class 6-10",
      area: "Indiranagar, Bengaluru",
      rating: 4.8,
      reviews: 96,
      fee: "₹600/hr",
    },
    {
      img: parentImg,
      name: "Rohan Verma",
      subject: "Coding & Computer Science",
      area: "Online",
      rating: 5.0,
      reviews: 72,
      fee: "₹1,000/hr",
    },
  ];
  return (
    <section id="tutors" className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge className="bg-primary-soft text-primary border-0">Featured tutors</Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Meet a few of our <span className="text-primary">top-rated</span> tutors
            </h2>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Browse all tutors
          </Button>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {tutors.map((t) => (
            <article
              key={t.name}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={t.img}
                  alt={t.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute right-3 top-3 rounded-full bg-card/95 px-3 py-1 text-xs font-semibold shadow-card backdrop-blur">
                  {t.fee}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{t.name}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{t.subject}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-sm font-semibold">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    {t.rating}
                    <span className="font-normal text-muted-foreground">({t.reviews})</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {t.area}
                </div>
                <Button
                  variant="outline"
                  className="mt-5 w-full border-primary/30 text-primary hover:bg-primary-soft hover:text-primary"
                >
                  View profile
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- For teachers ---------- */
function ForTeachers() {
  const benefits = [
    "Create a rich profile in minutes — no approvals, no fees",
    "Reach families actively searching in your area",
    "Showcase qualifications, ratings, and availability",
    "Manage everything from one simple dashboard",
  ];
  return (
    <section id="teachers" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.45_0.22_270)] text-primary-foreground">
          <div className="grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:p-16">
            <div>
              <Badge className="border-0 bg-white/15 text-white backdrop-blur">
                For teachers & tutors
              </Badge>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Grow your tuition practice — without the noise.
              </h2>
              <p className="mt-3 text-base text-white/85">
                Join thousands of independent tutors who use TutorConnect to find local students,
                fill their schedule, and build a reputation that lasts.
              </p>
              <ul className="mt-6 space-y-3">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm text-white/90">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-white" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button className="bg-white text-primary hover:bg-white/90" asChild>
                  <Link to="/auth" search={{ mode: "signup", role: "teacher" }}>
                    Become a tutor
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  Learn more
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
              <div className="absolute -left-4 bottom-6 hidden rounded-2xl bg-card p-4 text-foreground shadow-soft sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">+24 inquiries</p>
                    <p className="text-xs text-muted-foreground">this month</p>
                  </div>
                </div>
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
        "I'm a first-year college student and got a great Physics tutor nearby — affordable, patient, and explains everything clearly.",
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
    <section className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge className="bg-primary-soft text-primary border-0">Stories</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by families and tutors <span className="text-primary">across India</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {reviews.map((r) => (
            <figure
              key={r.name}
              className="flex h-full flex-col rounded-2xl border border-border bg-card p-7 shadow-card"
            >
              <div className="flex gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary" />
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
                  className="h-10 w-10 rounded-full object-cover"
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
      a: "Yes — browsing tutors, viewing profiles, and contacting them is completely free for parents and students. Tutors can also list their profiles at no cost during our MVP.",
    },
    {
      q: "How do I know the tutors are trustworthy?",
      a: "Every tutor profile shows qualifications, experience, and verified reviews from real families. You can filter by rating, see past student feedback, and reach out only when you're confident.",
    },
    {
      q: "Do you support online and in-person tutoring?",
      a: "Both. Filter by mode of teaching — online, offline, or both — and find a tutor that fits the way you (or your child) learn best.",
    },
    {
      q: "Can I cover specific boards like CBSE, ICSE or State?",
      a: "Yes. Tutors specify their syllabus/board specialization on their profile, so you can filter by CBSE, ICSE, State boards, IB, IGCSE, and exam prep like NEET and JEE.",
    },
    {
      q: "How do I pay the tutor?",
      a: "Payments happen directly between you and the tutor at the rate listed on their profile. TutorConnect doesn't charge any fees or commissions in the current phase.",
    },
  ];
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <Badge className="bg-primary-soft text-primary border-0">FAQ</Badge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Common questions
          </h2>
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
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-primary blur-3xl" />
          </div>
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Start learning with a tutor who actually fits you.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-background/70">
            Join thousands of parents and students using TutorConnect to find the right teacher,
            in their area, at the right price.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
              <Link to="/tutors">Find a tutor</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background"
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
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Helping families and independent tutors connect — locally, transparently, and
              without the middlemen.
            </p>
          </div>
          <FooterCol title="Product" links={["How it works", "For students", "For parents", "For tutors"]} />
          <FooterCol title="Company" links={["About", "Blog", "Contact", "Careers"]} />
          <FooterCol title="Legal" links={["Privacy Policy", "Terms of Service", "Code of Conduct"]} />
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} TutorConnect. All rights reserved.</p>
          <p>Made for learners, everywhere.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-primary">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
