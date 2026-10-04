import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchPrimaryRole, dashboardPathForRole } from "@/lib/auth-helpers";
import { Brand } from "@/components/site/Brand";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, MapPin, Star, ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import heroPhoto from "@/assets/01.png";
import tutorPhoto from "@/assets/02.png";

/* ---------- useInView hook — scroll-triggered animations ---------- */
function useInView(options: IntersectionObserverInit = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12, ...options },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, inView };
}

// Must match the subject names used by the /tutors filters.
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
];

const SUBJECT_ALIASES: Record<string, string> = {
  math: "Mathematics",
  maths: "Mathematics",
  cs: "Computer Science",
  coding: "Computer Science",
  programming: "Computer Science",
  accounts: "Accountancy",
  bio: "Biology",
  chem: "Chemistry",
};

function resolveSubject(text: string) {
  const t = text.trim().toLowerCase();
  if (!t) return undefined;
  return SUBJECTS.find((s) => s.toLowerCase() === t) ?? SUBJECT_ALIASES[t];
}

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
    <div className="min-h-screen bg-[#FBFAF7] text-[#16161D] font-sans antialiased selection:bg-[#5357FE] selection:text-white">
      <Header />
      <main>
        <Hero />
        <Promises />
        <HowItWorks />
        <BrowseSubjects />
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
const NAV = [
  { label: "How it works", href: "#how" },
  { label: "Subjects", href: "#subjects" },
  { label: "For tutors", href: "#teachers" },
  { label: "FAQ", href: "#faq" },
];

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#FBFAF7]/85 backdrop-blur-md border-b border-[#E7E4DC]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Brand className="h-7" />

        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/tutors"
            className="text-sm font-medium text-[#16161D] hover:text-[#5357FE] transition-colors"
          >
            Find tutors
          </Link>
          {NAV.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-[#5B5B66] hover:text-[#16161D] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-5">
          <Link
            to="/auth"
            search={{ mode: "signin" }}
            className="text-sm font-medium text-[#16161D] hover:text-[#5357FE] transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="inline-flex h-10 items-center rounded-full bg-[#16161D] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#5357FE]"
          >
            Get started
          </Link>
        </div>

        <button
          className="md:hidden -mr-2 p-2 text-[#16161D]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-[#E7E4DC] bg-[#FBFAF7] px-4 pb-6 pt-2">
          <nav className="flex flex-col">
            <Link
              to="/tutors"
              className="py-3 text-base font-medium border-b border-[#E7E4DC]"
              onClick={() => setMobileOpen(false)}
            >
              Find tutors
            </Link>
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="py-3 text-base font-medium border-b border-[#E7E4DC]"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              to="/auth"
              search={{ mode: "signin" }}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#16161D] text-sm font-semibold"
              onClick={() => setMobileOpen(false)}
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#16161D] text-sm font-semibold text-white"
              onClick={() => setMobileOpen(false)}
            >
              Get started
            </Link>
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
  const [cityQuery, setCityQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = resolveSubject(subjectQuery);
    navigate({
      to: "/tutors",
      search: {
        subject,
        q: subject ? undefined : subjectQuery.trim() || undefined,
        city: cityQuery.trim() || undefined,
      },
    });
  };

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10 items-start">
          {/* Left */}
          <div className="lg:col-span-7 lg:pt-6">
            <p className="flex items-center gap-3 text-sm font-medium text-[#5B5B66]">
              <span className="h-px w-8 bg-[#16161D]" />
              Tutoring, without the agency
            </p>

            <h1 className="mt-6 font-serif font-normal text-[44px] leading-[1.02] tracking-[-0.03em] sm:text-6xl lg:text-[80px]">
              The right tutor is <em className="italic text-[#5357FE]">probably</em> just down
              the road.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#5B5B66]">
              TutorConnect lists local and online tutors with their real fees, subjects and
              boards. Find someone you like and contact them yourself. No middleman, no
              commission.
            </p>

            <form
              onSubmit={handleSearchSubmit}
              className="mt-10 flex max-w-2xl flex-col rounded-2xl border border-[#16161D] bg-white sm:flex-row sm:items-stretch sm:rounded-full sm:p-1.5"
            >
              <label className="flex flex-1 items-center gap-3 px-5 py-4 sm:py-0">
                <Search className="h-4 w-4 shrink-0 text-[#5B5B66]" />
                <span className="sr-only">Subject</span>
                <input
                  type="text"
                  list="landing-subjects"
                  placeholder="Subject, e.g. Physics"
                  value={subjectQuery}
                  onChange={(e) => setSubjectQuery(e.target.value)}
                  className="w-full bg-transparent text-[15px] outline-none placeholder:text-[#8A8A94]"
                />
                <datalist id="landing-subjects">
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </label>
              <div className="h-px bg-[#E7E4DC] sm:h-auto sm:w-px sm:my-2" />
              <label className="flex flex-1 items-center gap-3 px-5 py-4 sm:py-0">
                <MapPin className="h-4 w-4 shrink-0 text-[#5B5B66]" />
                <span className="sr-only">City</span>
                <input
                  type="text"
                  placeholder="City or area"
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  className="w-full bg-transparent text-[15px] outline-none placeholder:text-[#8A8A94]"
                />
              </label>
              <button
                type="submit"
                className="m-1.5 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#5357FE] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#16161D] sm:m-0 sm:rounded-full"
              >
                Find tutors
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="text-[#8A8A94]">Popular:</span>
              {["Mathematics", "Physics", "Chemistry", "English", "Computer Science"].map((s) => (
                <Link
                  key={s}
                  to="/tutors"
                  search={{ subject: s }}
                  className="text-[#16161D] underline decoration-[#C9C5BA] underline-offset-4 hover:decoration-[#5357FE] hover:text-[#5357FE] transition-colors"
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>

          {/* Right */}
          <figure className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-[28px] bg-[#EDEAE2] aspect-[4/3] sm:aspect-[4/5] max-h-[620px] w-full">
              <img
                src={heroPhoto}
                alt="A tutor explaining a counting exercise to a young student"
                className="h-full w-full object-cover object-[30%_60%]"
              />
            </div>
            <figcaption className="mt-4 flex gap-3 text-sm leading-relaxed text-[#5B5B66]">
              <span className="mt-2.5 h-px w-6 shrink-0 bg-[#16161D]" />
              Every profile shows fees, subjects, boards and teaching mode up front, before you
              send a single message.
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Boards strip */}
      <div className="border-y border-[#E7E4DC]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-5 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A8A94]">
            Tutors for
          </span>
          {["CBSE", "ICSE", "State boards", "IB", "IGCSE", "JEE", "NEET"].map((b) => (
            <span key={b} className="font-serif text-xl text-[#16161D]">
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Promises (honest numbers only) ---------- */
function Promises() {
  const items = [
    { big: "₹0", text: "What parents and students pay TutorConnect. Browsing and contacting tutors is free." },
    { big: "0%", text: "Commission on tutors' fees. You pay the tutor directly, at the rate on their profile." },
    { big: "1:1", text: "You speak to the tutor yourself. No call centre in between, no reassignments." },
  ];

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-px bg-[#E7E4DC] px-0 sm:grid-cols-3">
        {items.map((i) => (
          <div key={i.big} className="bg-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <p className="font-serif text-6xl tracking-[-0.03em] text-[#5357FE]">{i.big}</p>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-[#5B5B66]">{i.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- How It Works ---------- */
function HowItWorks() {
  const [activePersona, setActivePersona] = useState<"learner" | "teacher">("learner");

  const learnerSteps = [
    { title: "Search by what you actually need", desc: "Subject, class, board, city, and whether you want lessons online or at home." },
    { title: "Read the profiles properly", desc: "Qualifications, experience, fees and reviews are all there. Shortlist the ones that fit." },
    { title: "Contact the tutor directly", desc: "Message them, agree on a trial class and timings, and pay them however you both prefer." },
  ];

  const teacherSteps = [
    { title: "Make a free profile", desc: "Add your subjects, classes, boards, fees and when you're available. Takes a few minutes." },
    { title: "Show up in local searches", desc: "Parents and students searching in your city and subject will find your profile." },
    { title: "Teach on your terms", desc: "Families contact you directly. You set the fee and the schedule, and keep all of it." },
  ];

  const steps = activePersona === "learner" ? learnerSteps : teacherSteps;

  return (
    <section id="how" className="scroll-mt-16 py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-4">
          <h2 className="font-serif text-4xl font-normal leading-[1.05] tracking-[-0.02em] sm:text-5xl">
            How it works
          </h2>
          <p className="mt-4 max-w-sm text-[#5B5B66] leading-relaxed">
            Three steps, whichever side of the table you're on.
          </p>

          <div
            role="tablist"
            className="mt-8 inline-flex rounded-full border border-[#16161D] p-1"
          >
            {(["learner", "teacher"] as const).map((p) => (
              <button
                key={p}
                role="tab"
                aria-selected={activePersona === p}
                onClick={() => setActivePersona(p)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  activePersona === p ? "bg-[#16161D] text-white" : "text-[#16161D] hover:bg-[#EDEAE2]"
                }`}
              >
                {p === "learner" ? "Parents & students" : "Tutors"}
              </button>
            ))}
          </div>
        </div>

        <ol className="lg:col-span-8 border-t border-[#16161D]">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="grid grid-cols-[3rem_1fr] gap-4 border-b border-[#E7E4DC] py-8 sm:grid-cols-[5rem_1fr_1.3fr] sm:gap-8"
            >
              <span className="font-serif text-3xl text-[#5357FE] sm:text-4xl">{i + 1}</span>
              <h3 className="text-xl font-semibold tracking-tight">{s.title}</h3>
              <p className="col-start-2 text-[15px] leading-relaxed text-[#5B5B66] sm:col-start-3">
                {s.desc}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- Browse by Subject ---------- */
function BrowseSubjects() {
  const subjects = [
    { name: "Mathematics", topics: "Algebra, geometry, calculus, statistics" },
    { name: "Physics", topics: "Mechanics, electricity, optics, numericals" },
    { name: "Chemistry", topics: "Organic, inorganic, physical, lab prep" },
    { name: "Biology", topics: "Botany, zoology, genetics, NEET foundation" },
    { name: "English", topics: "Grammar, literature, writing, spoken English" },
    { name: "Computer Science", topics: "Python, Java, web basics, board practicals" },
    { name: "Economics", topics: "Micro, macro, Indian economy" },
    { name: "Accountancy", topics: "Journal entries, ledgers, final accounts" },
  ];

  return (
    <section id="subjects" className="scroll-mt-16 bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-xl font-serif text-4xl font-normal leading-[1.05] tracking-[-0.02em] sm:text-5xl">
            Start with a subject
          </h2>
          <Link
            to="/tutors"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#16161D] underline decoration-[#C9C5BA] underline-offset-4 hover:decoration-[#5357FE] hover:text-[#5357FE]"
          >
            All subjects and filters <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ul className="mt-12 grid border-t border-[#16161D] md:grid-cols-2 md:gap-x-12">
          {subjects.map((s) => (
            <li key={s.name} className="border-b border-[#E7E4DC]">
              <Link
                to="/tutors"
                search={{ subject: s.name }}
                className="group flex items-center justify-between gap-6 py-6"
              >
                <div>
                  <p className="font-serif text-2xl tracking-[-0.01em] transition-colors group-hover:text-[#5357FE] sm:text-[28px]">
                    {s.name}
                  </p>
                  <p className="mt-1 text-sm text-[#5B5B66]">{s.topics}</p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E7E4DC] transition-all group-hover:border-[#5357FE] group-hover:bg-[#5357FE] group-hover:text-white">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Featured Tutors (live data) ---------- */
function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function FeaturedTutors() {
  const { ref, inView } = useInView();
  const query = useQuery({
    queryKey: ["landing-featured-tutors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teacher_profiles")
        .select(
          "user_id, years_experience, fee_min, fee_max, mode, rating_avg, rating_count, profiles!inner(full_name, city, area, avatar_url), teacher_subjects(subject)",
        )
        .eq("is_active", true)
        .order("rating_avg", { ascending: false })
        .limit(3);
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  // Nothing to show yet: skip the section rather than fill it with made-up people.
  if (query.isError || (query.isSuccess && query.data.length === 0)) return null;

  const modeLabel: Record<string, string> = {
    online: "Online",
    offline: "In person",
    both: "Online & in person",
  };

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-4xl font-normal leading-[1.05] tracking-[-0.02em] sm:text-5xl">
              A few tutors listed right now
            </h2>
            <p className="mt-4 max-w-lg text-[#5B5B66]">
              Real profiles from the directory, highest rated first.
            </p>
          </div>
          <Link
            to="/tutors"
            className="inline-flex items-center gap-1.5 text-sm font-semibold underline decoration-[#C9C5BA] underline-offset-4 hover:decoration-[#5357FE] hover:text-[#5357FE]"
          >
            See everyone <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div ref={ref} className="mt-12 grid gap-5 md:grid-cols-3 stagger">
          {query.isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[248px] animate-pulse rounded-2xl bg-[#EDEAE2]" />
              ))
            : query.data!.map((t) => {
                const name: string = t.profiles?.full_name ?? "Tutor";
                const place = [t.profiles?.area, t.profiles?.city].filter(Boolean).join(", ");
                const subjects = Array.from(
                  new Set<string>((t.teacher_subjects ?? []).map((s: any) => s.subject)),
                ).slice(0, 3);
                return (
                  <Link
                    key={t.user_id}
                    to="/tutors/$id"
                    params={{ id: t.user_id }}
                    className={`group flex flex-col rounded-2xl border border-[#E7E4DC] bg-white p-6 transition-colors hover:border-[#16161D] anim-fade-up ${inView ? "visible" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      {t.profiles?.avatar_url ? (
                        <img
                          src={t.profiles.avatar_url}
                          alt=""
                          className="h-14 w-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF0FF] font-serif text-xl text-[#5357FE]">
                          {initials(name)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold tracking-tight group-hover:text-[#5357FE]">
                          {name}
                        </h3>
                        {place && (
                          <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-[#5B5B66]">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {place}
                          </p>
                        )}
                      </div>
                    </div>

                    {subjects.length > 0 && (
                      <p className="mt-5 text-[15px] text-[#16161D]">{subjects.join(" · ")}</p>
                    )}
                    <p className="mt-1 text-sm text-[#5B5B66]">
                      {[
                        t.years_experience ? `${t.years_experience} yrs experience` : null,
                        modeLabel[t.mode],
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>

                    <div className="mt-auto flex items-end justify-between pt-6">
                      <div>
                        {t.fee_min != null && (
                          <p className="font-serif text-2xl">
                            ₹{t.fee_min}
                            {t.fee_max && t.fee_max !== t.fee_min ? `–${t.fee_max}` : ""}
                            <span className="font-sans text-sm text-[#5B5B66]"> /hr</span>
                          </p>
                        )}
                      </div>
                      {t.rating_count > 0 && (
                        <p className="flex items-center gap-1 text-sm font-semibold">
                          <Star className="h-4 w-4 fill-[#16161D]" />
                          {Number(t.rating_avg).toFixed(1)}
                          <span className="font-normal text-[#5B5B66]">({t.rating_count})</span>
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
}

/* ---------- For Teachers ---------- */
function ForTeachers() {
  const { ref, inView } = useInView();
  const points = [
    { title: "Free to list", desc: "No sign-up fee, no monthly plan, no lead charges." },
    { title: "Your fee, all of it", desc: "Families pay you directly. We don't take a cut." },
    { title: "Found locally", desc: "Show up when parents in your city search for your subject." },
    { title: "You decide", desc: "Pick your classes, boards, timings and whether you teach online." },
  ];

  return (
    <section id="teachers" className="scroll-mt-16 bg-[#16161D] text-white">
      <div
        ref={ref}
        className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28"
      >
        <div className={`order-2 lg:order-1 anim-fade-up ${inView ? "visible" : ""}`}>
          <div className="overflow-hidden rounded-[28px] aspect-[4/3] lg:aspect-[5/6]">
            <img
              src={tutorPhoto}
              alt="A tutor helping a student with coloured pencils at a desk"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        <div className={`order-1 lg:order-2 anim-fade-up ${inView ? "visible" : ""}`}>
          <p className="text-sm font-medium text-white/60">For tutors</p>
          <h2 className="mt-4 font-serif text-4xl font-normal leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-6xl">
            Fill your evenings with students who <em className="italic text-[#A9ABFF]">chose you</em>.
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/70">
            Put up a proper profile, get found by families nearby, and run your tuition the way
            you already do.
          </p>

          <dl className="mt-10 grid gap-x-10 border-t border-white/15 sm:grid-cols-2">
            {points.map((p) => (
              <div key={p.title} className="border-b border-white/15 py-5">
                <dt className="font-semibold">{p.title}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-white/60">{p.desc}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              to="/auth"
              search={{ mode: "signup", role: "teacher" }}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[#16161D] transition-colors hover:bg-[#A9ABFF]"
            >
              Create your tutor profile <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/tutors"
              className="text-sm font-semibold text-white/80 underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white"
            >
              See how other tutors present themselves
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */
function Testimonials() {
  const [lead, ...rest] = [
    { quote: "Found a brilliant Maths tutor for my son in two days. His grades and confidence have both jumped.", name: "Anita S.", role: "Parent, Bengaluru" },
    { quote: "I'm a first-year college student and found a great Physics tutor nearby. Affordable, patient, and explains everything clearly.", name: "Karan D.", role: "Student, Pune" },
    { quote: "TutorConnect filled my weekday evenings within a month. The profile-first approach really works.", name: "Meera R.", role: "Tutor, Hyderabad" },
  ];

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <figure className="lg:col-span-7">
          <span aria-hidden className="block font-serif text-8xl leading-[0.6] text-[#5357FE]">
            “
          </span>
          <blockquote className="mt-4 font-serif text-3xl leading-[1.2] tracking-[-0.01em] sm:text-4xl lg:text-[44px]">
            {lead.quote}
          </blockquote>
          <figcaption className="mt-8 text-sm">
            <span className="font-semibold">{lead.name}</span>
            <span className="text-[#5B5B66]"> · {lead.role}</span>
          </figcaption>
        </figure>

        <div className="space-y-10 lg:col-span-5 lg:border-l lg:border-[#E7E4DC] lg:pl-12 lg:pt-6">
          {rest.map((r) => (
            <figure key={r.name}>
              <blockquote className="text-lg leading-relaxed text-[#16161D]">“{r.quote}”</blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-semibold">{r.name}</span>
                <span className="text-[#5B5B66]"> · {r.role}</span>
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
    { q: "Is TutorConnect free to use?", a: "Yes. Browsing tutors, viewing profiles, and contacting them is completely free for parents and students. Tutors can also list their profiles at no cost." },
    { q: "How do I evaluate a tutor?", a: "Every tutor profile displays detailed qualifications, educational background, years of teaching experience, fee structures, and specialized subjects so you can make an informed decision." },
    { q: "Do you support online and in-person tutoring?", a: "Both. Filter by mode of teaching (online, offline, or both) and find a tutor that fits the way you or your child learns best." },
    { q: "Can I cover specific boards like CBSE, ICSE or State?", a: "Yes. Tutors specify their syllabus/board specialization on their profile, so you can filter by CBSE, ICSE, State boards, IB, IGCSE, and exam prep like NEET and JEE." },
    { q: "How do I pay the tutor?", a: "Payments happen directly between you and the tutor at the rate listed on their profile. TutorConnect doesn't charge any fees or commissions." },
  ];

  return (
    <section id="faq" className="scroll-mt-16 py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-4">
          <h2 className="font-serif text-4xl font-normal leading-[1.05] tracking-[-0.02em] sm:text-5xl">
            Questions people ask
          </h2>
          <p className="mt-4 max-w-sm text-[#5B5B66] leading-relaxed">
            If yours isn't here, the quickest answer is usually on a tutor's profile.
          </p>
        </div>

        <Accordion type="single" collapsible className="lg:col-span-8 border-t border-[#16161D]">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b border-[#E7E4DC]">
              <AccordionTrigger className="py-6 text-left text-lg font-semibold tracking-tight hover:no-underline hover:text-[#5357FE]">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="max-w-2xl pb-6 text-[15px] leading-relaxed text-[#5B5B66]">
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
    <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
      <div className="mx-auto max-w-7xl rounded-[28px] bg-[#5357FE] px-6 py-16 text-white sm:px-12 lg:px-16 lg:py-20">
        <div className="grid items-end gap-10 lg:grid-cols-12">
          <h2 className="font-serif text-4xl font-normal leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:col-span-8 lg:text-6xl">
            Your first message to a tutor is free. So is your hundredth.
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:flex-col lg:items-end">
            <Link
              to="/tutors"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-[#16161D] transition-colors hover:bg-[#16161D] hover:text-white"
            >
              Find a tutor <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup", role: "teacher" }}
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 px-7 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              I'm a tutor
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="border-t border-[#E7E4DC]">
      <div className="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <Brand className="h-7" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#5B5B66]">
              A directory of local and online tutors across India. Families and tutors connect
              directly. We stay out of the way.
            </p>
          </div>

          <FooterCol
            title="Explore"
            links={[
              { label: "Find tutors", href: "/tutors" },
              { label: "How it works", href: "#how" },
              { label: "Subjects", href: "#subjects" },
              { label: "For tutors", href: "#teachers" },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { label: "Privacy policy", href: "/privacy" },
              { label: "Terms of service", href: "/terms" },
              { label: "FAQ", href: "#faq" },
            ]}
          />
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-[#E7E4DC] pt-6 text-xs text-[#8A8A94] sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} TutorConnect</p>
          <p>Free for families. Free for tutors.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="md:col-span-3">
      <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A8A94]">{title}</h4>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.href} className="text-sm text-[#16161D] hover:text-[#5357FE] transition-colors">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
