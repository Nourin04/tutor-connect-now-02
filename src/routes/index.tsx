import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
} from "lucide-react";
import heroTutor from "@/assets/hero-tutor.jpg";
import studentImg from "@/assets/student-1.jpg";
import tutorImg from "@/assets/tutor-1.jpg";
import parentImg from "@/assets/parent-child.jpg";
import logoUrl from "@/assets/tutorconnect-logo.svg";

export const Route = createFileRoute("/")({
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
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      <main>
        <Hero />
        <ValueProps />
        <HowItWorks />
        <ForTeachers />
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
              <Link to="/auth" search={{ mode: "signin" }} className="text-sm font-semibold text-[#4665FF] hover:text-[#4665FF]/85 hover:underline px-3 py-2 transition-all">
                Sign in
              </Link>
              <Button size="sm" className="bg-[#4665FF] hover:bg-[#4665FF]/90 text-white rounded-full font-semibold shadow-soft" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Get started
                </Link>
              </Button>
            </>
          ) : email ? (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full font-semibold">
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
              <Button size="sm" variant="outline" onClick={signOut} className="rounded-full font-semibold">
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Link to="/auth" search={{ mode: "signin" }} className="text-sm font-semibold text-[#4665FF] hover:text-[#4665FF]/85 hover:underline px-3 py-2 transition-all">
                Sign in
              </Link>
              <Button size="sm" className="bg-[#4665FF] hover:bg-[#4665FF]/90 text-white rounded-full font-semibold shadow-soft" asChild>
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
    <Link to="/" className="flex items-center">
      <img src={logoUrl} alt="TutorConnect" className="h-9 w-auto" />
    </Link>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setEmail(data.user?.email ?? null);
      if (data.user) setRole(await fetchPrimaryRole());
    });
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-24 sm:px-6 lg:px-8 lg:pt-24 lg:pb-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Find the right tutor,
              <br />
              <span className="text-primary">right around the corner.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg lg:mx-0">
              Discover local tutors in your area. Compare fees, check availability, and connect with them directly.
            </p>

            <div className="mt-8 flex justify-center lg:justify-start gap-4">
              {email ? (
                <Button asChild size="lg" className="bg-[#4665FF] hover:bg-[#4665FF]/90 text-white rounded-full px-8 shadow-md font-semibold">
                  <Link to={dashboardPathForRole(role)}>
                    Go to Dashboard
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="bg-[#4665FF] hover:bg-[#4665FF]/90 text-white rounded-full px-8 shadow-md font-semibold">
                  <Link to="/auth" search={{ mode: "signup" }}>
                    Get started
                  </Link>
                </Button>
              )}
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
            Designed for learning that actually <span className="text-primary">sticks</span>.
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
      desc: "Subject, class or level, location, and your preferred mode (online, offline, or both).",
    },
    {
      n: "02",
      title: "Compare local tutors",
      desc: "Browse profiles with qualifications, fees, teaching modes, and availability.",
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
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            From finding a tutor to starting your first lesson in minutes.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="relative rounded-2xl border border-border bg-card p-7 shadow-card"
            >
              <span className="text-5xl font-extrabold text-primary/15 font-display">{s.n}</span>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              {i < steps.length - 1 && (
                <ArrowRight className="absolute right-6 top-7 hidden h-5 w-5 text-primary/40 md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center sm:text-left">
      <p className="text-4xl font-extrabold tracking-tight text-primary font-display">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
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
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.45_0.22_270)] text-primary-foreground">
          <div className="grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:p-16">
            <div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
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
                <Button className="bg-white text-[#4665FF] hover:bg-white/90 rounded-full font-semibold" asChild>
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
            <Button size="lg" className="bg-[#4665FF] hover:bg-[#4665FF]/90 text-white rounded-full font-semibold shadow-md" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>Find a tutor</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background rounded-full font-semibold"
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
                { label: "Contact", href: "#" }
              ]} 
            />
            <FooterCol 
              title="Legal" 
              links={[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" }
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
            <a href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
