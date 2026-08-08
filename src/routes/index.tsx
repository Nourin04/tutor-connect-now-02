import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchPrimaryRole, dashboardPathForRole, type AppRole } from "@/lib/auth-helpers";
import { Brand } from "@/components/site/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Sparkles,
  ArrowRight,
  Check,
  MessageCircle,
  User,
  Users,
  BookOpen,
  GraduationCap,
  ChevronRight,
  CheckCircle2,
  Calculator,
  Atom,
  Dna,
  Code,
  Clock,
} from "lucide-react";
import heroTutor from "@/assets/01.png";
import studentImg from "@/assets/student-1.jpg";
import tutorImg from "@/assets/02.png";
import parentImg from "@/assets/parent-child.jpg";
import hero3dGroup from "@/assets/hero-3d-group 1.svg";

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
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-2">
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
  return (
    <section className="relative overflow-hidden pt-20 pb-28 lg:pt-32 lg:pb-40 bg-gradient-to-b from-blue-50/50 via-slate-50/30 to-background">
      {/* Background Decorative Radial Glows */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 -top-24 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(70,101,255,0.12)_0%,_rgba(255,255,255,0)_70%)] blur-3xl" />
        <div className="absolute right-10 top-1/4 h-[350px] w-[350px] rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute left-10 top-1/3 h-[300px] w-[300px] rounded-full bg-indigo-100/40 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Centered Headline */}
        <div className="max-w-4xl mx-auto space-y-10">
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl text-slate-900 leading-[1.12]">
            Find the right tutor,
            <br />
            <span className="relative inline-block text-[#4665FF]">
              right around the corner.
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-[#4665FF]/30"
                viewBox="0 0 100 12"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M0,8 Q50,0 100,8"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p
            style={{ fontSize: "16px" }}
            className="mx-auto max-w-3xl text-base text-slate-600 font-normal leading-relaxed"
          >
            Discover verified local tutors for any subject, class, or board. <br className="hidden sm:inline" />
            Compare hourly fees, review qualifications, and connect directly with zero middleman costs.
          </p>
        </div>

        {/* Hero Visual Presentation */}
        <div className="mt-12 sm:mt-16 relative max-w-5xl mx-auto flex justify-center">
          <img
            src={hero3dGroup}
            alt="Diverse group of students and tutors"
            className="w-full h-auto max-h-[520px] object-contain hover:scale-[1.01] transition-transform duration-500"
          />
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
    <section className="py-20 bg-slate-50/50 border-y border-slate-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl text-slate-900">
            Find the perfect tutor for every <span className="text-[#4665FF]">subjects.</span>
          </h2>
          <p className="mt-2 text-slate-600">
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
                className="group rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm hover:border-[#4665FF]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4665FF]/10 text-[#4665FF] transition-transform group-hover:scale-110">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#4665FF] transition-colors">
                    {sub.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{sub.desc}</p>
                </div>
                <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-[#4665FF]">
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
    <section className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight sm:text-4xl text-slate-900">
            Designed for learning that actually <span className="text-[#4665FF]">sticks.</span>
          </h2>
          <p className="mt-3 text-slate-600 max-w-none">
            Built to help students and parents find trusted tutors with clear information and a simple learning experience.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-3xl border border-slate-200/80 bg-white p-8 transition-all duration-300 hover:border-[#4665FF]/30 hover:shadow-xl shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4665FF]/10 text-[#4665FF] transition-transform group-hover:scale-110">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
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
    <section id="how" className="bg-slate-50/50 py-20 sm:py-28 border-y border-slate-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl text-slate-900">
            Start learning in just a few <span className="text-[#4665FF]">steps.</span>
          </h2>
          <p className="mt-2 text-slate-600 max-w-none">
            A seamless journey designed for both students looking for help and tutors seeking students.
          </p>

          {/* Persona Toggle */}
          <div className="mt-6 inline-flex p-1 rounded-xl bg-slate-200/80 border border-slate-300">
            <button
              onClick={() => setActivePersona("learner")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activePersona === "learner"
                  ? "bg-white text-[#4665FF] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              For Students & Parents
            </button>
            <button
              onClick={() => setActivePersona("teacher")}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activePersona === "teacher"
                  ? "bg-white text-[#4665FF] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
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
              className="relative rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:border-[#4665FF]/30 hover:shadow-xl"
            >
              <span className="text-5xl font-extrabold text-[#4665FF]/20 font-display">{s.n}</span>
              <h3 className="mt-3 text-lg font-bold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              {i < currentSteps.length - 1 && (
                <ArrowRight className="absolute right-6 top-8 hidden h-5 w-5 text-[#4665FF]/30 md:block" />
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
  const bentoFeatures = [
    {
      title: "No Platform Fees",
      desc: "Zero approvals, zero listing fees, and 0% commission on your earnings.",
      icon: Sparkles,
    },
    {
      title: "Direct Local Leads",
      desc: "Reach families actively searching for tutors in your city and neighborhood.",
      icon: Users,
    },
    {
      title: "Flexible Teaching",
      desc: "Set your own hourly rates, choose subject specializations, and schedule sessions.",
      icon: GraduationCap,
    },
    {
      title: "Verified Credentials",
      desc: "Build instant trust by showcasing your qualifications, experience, and background.",
      icon: ShieldCheck,
    },
    {
      title: "Direct Communication",
      desc: "Chat directly with interested parents and students without middleman delays.",
      icon: MessageCircle,
    },
    {
      title: "Full Schedule Control",
      desc: "Accept students according to your availability, routine, and preferred teaching mode.",
      icon: Clock,
    },
  ];

  return (
    <section id="teachers" className="py-20 sm:py-28 bg-slate-50/50 border-y border-slate-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Centered Header */}
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl text-slate-900 leading-[1.15] whitespace-nowrap">
            Connect with students looking for the right <span className="text-[#4665FF]">tutor.</span>
          </h2>
          <p
            style={{ fontSize: "16px" }}
            className="mt-4 text-base text-slate-600 leading-relaxed max-w-none mx-auto whitespace-nowrap"
          >
            Reach more students, build your reputation, and spend more time doing what you love.
          </p>
        </div>

        {/* Blue Hero Card Container with Image */}
        <div className="mt-14 overflow-hidden rounded-3xl bg-gradient-to-br from-[#4665FF] via-indigo-600 to-[#2A43D3] text-white shadow-2xl p-8 sm:p-12 lg:p-14 text-left">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            {/* Left Column: 6 Features Grid & Button */}
            <div className="lg:col-span-7 space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                {bentoFeatures.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <div key={feat.title} className="group">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-white border border-white/20 mb-3 transition-transform group-hover:scale-110">
                        <Icon className="h-5.5 w-5.5" />
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {feat.title}
                      </h3>
                      <p className="mt-1.5 text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2">
                <Button
                  size="lg"
                  className="bg-white text-[#4665FF] hover:bg-white/90 rounded-md font-semibold px-8 h-12 shadow-lg"
                  asChild
                >
                  <Link to="/auth" search={{ mode: "signup", role: "teacher" }}>
                    Become a tutor
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Column: High Quality Image Frame */}
            <div className="lg:col-span-5 relative">
              <div className="overflow-hidden rounded-2xl border border-white/20 shadow-2xl max-h-[460px]">
                <img
                  src={tutorImg}
                  alt="Independent tutor on TutorConnect"
                  loading="lazy"
                  className="h-full w-full object-cover object-center hover:scale-105 transition-transform duration-500"
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
    <section className="bg-slate-50/50 py-20 sm:py-28 border-t border-slate-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl text-slate-900">
            Real stories from our <span className="text-[#4665FF]">community.</span>
          </h2>
          <p className="mt-3 text-slate-600">
            From finding the right tutor to achieving learning goals, here's what our users have to say.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {reviews.map((r) => (
            <figure
              key={r.name}
              className="flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-slate-700">
                "{r.quote}"
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <img
                  src={r.img}
                  alt=""
                  width={40}
                  height={40}
                  loading="lazy"
                  className="h-10 w-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">{r.name}</p>
                  <p className="text-xs text-slate-500">{r.role}</p>
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
    <section id="faq" className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl text-slate-900">
            Your questions, <span className="text-[#4665FF]">answered.</span>
          </h2>
          <p className="mt-3 text-slate-600">
            Everything you need to know before getting started.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-12 space-y-4">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-2xl border border-slate-200/80 bg-white px-6 shadow-sm overflow-hidden"
            >
              <AccordionTrigger className="text-left text-base font-bold text-slate-900 hover:no-underline py-5">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-slate-600 pb-5">
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
    <section className="px-4 pb-20 sm:px-6 lg:px-8 bg-background">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 text-center text-white sm:px-16 sm:py-24 shadow-2xl">
          <div className="absolute inset-0 -z-10 opacity-30">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#4665FF] blur-3xl" />
            <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-[#4665FF] blur-3xl" />
          </div>
          <h2 className="font-display mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl text-white">
            Start learning with a tutor who actually fits you.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-300 font-normal">
            Join thousands of parents and students using TutorConnect to find the right teacher, in
            their area, at the right price.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
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
              className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white rounded-md font-semibold"
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
    <footer className="border-t border-slate-200/60 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-slate-500 leading-relaxed">
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
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200/60 pt-6 text-xs text-slate-500 sm:flex-row">
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
      <h4 className="text-sm font-bold text-slate-900">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-sm text-slate-500 transition-colors hover:text-[#4665FF]"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
