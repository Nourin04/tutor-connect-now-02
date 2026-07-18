import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/site/AppHeader";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Star, MapPin, SlidersHorizontal, X, Heart, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/tutors/")({
  head: () => ({
    meta: [
      { title: "Find a Tutor | TutorConnect" },
      { name: "description", content: "Browse local tutors. Filter by subject, level, location, board, fees, mode and more." },
    ],
  }),
  component: TutorsPage,
});

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi", "Computer Science", "Economics", "Accountancy", "Music", "Art"];
const LEVELS = ["Class 1-5", "Class 6-8", "Class 9-10", "Class 11-12", "Undergraduate", "Postgraduate", "Adult learner"];
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

function TutorsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const set = <K extends keyof FilterState>(k: K, v: FilterState[K]) => setFilters((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
    const params = new URLSearchParams(window.location.search);
    const city = params.get("city") || "";
    const subject = params.get("subject") || "";
    if (city) {
      set("city", city);
    }
    if (subject) {
      const match = SUBJECTS.find((s) => s.toLowerCase() === subject.toLowerCase());
      if (match) {
        set("subject", match);
      }
    }
  }, []);

  const query = useQuery({
    queryKey: ["tutors", filters],
    queryFn: async () => {
      let q = supabase
        .from("teacher_profiles")
        .select(
          "user_id, bio, years_experience, fee_min, fee_max, mode, gender, languages, rating_avg, rating_count, profiles!inner(full_name, city, area, avatar_url), teacher_subjects(subject, level, board)"
        )
        .eq("is_active", true);

      if (filters.mode !== "any") q = q.eq("mode", filters.mode as "online" | "offline" | "both");
      if (filters.gender !== "any") q = q.eq("gender", filters.gender as "male" | "female" | "other" | "prefer_not_to_say");
      if (filters.feeMax < 5000) q = q.lte("fee_min", filters.feeMax);
      if (filters.minRating > 0) q = q.gte("rating_avg", filters.minRating);

      // Sorting
      if (filters.sort === "rating") q = q.order("rating_avg", { ascending: false });
      if (filters.sort === "experience") q = q.order("years_experience", { ascending: false });
      if (filters.sort === "fee_low") q = q.order("fee_min", { ascending: true });

      const { data, error } = await q.limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Query for saved/favorited tutors
  const savedQuery = useQuery({
    queryKey: ["savedTutors", currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      const { data, error } = await supabase
        .from("saved_tutors" as any)
        .select("teacher_id")
        .eq("user_id", currentUserId);
      if (error) throw error;
      return (data ?? []).map((d: any) => d.teacher_id);
    },
    enabled: !!currentUserId,
  });

  const toggleSaveMutation = useMutation({
    mutationFn: async ({ teacherId, isSaved }: { teacherId: string; isSaved: boolean }) => {
      if (!currentUserId) {
        toast.error("Please sign in to save tutors.");
        return;
      }
      if (isSaved) {
        const { error } = await supabase
          .from("saved_tutors" as any)
          .delete()
          .eq("user_id", currentUserId)
          .eq("teacher_id", teacherId);
        if (error) throw error;
        toast.success("Tutor removed from saved list.");
      } else {
        const { error } = await supabase
          .from("saved_tutors" as any)
          .insert({ user_id: currentUserId, teacher_id: teacherId } as any);
        if (error) throw error;
        toast.success("Tutor saved!");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedTutors", currentUserId] });
    },
  });

  // Client-side filter for fields that are nested
  const rows = useMemo(() => {
    const list = (query.data ?? []) as any[];
    const savedIds = savedQuery.data ?? [];
    return list.filter((r) => {
      if (filters.favouritesOnly && !savedIds.includes(r.user_id)) return false;
      if (filters.q && !`${r.profiles?.full_name ?? ""} ${r.bio ?? ""}`.toLowerCase().includes(filters.q.toLowerCase()))
        return false;
      if (filters.city && !`${r.profiles?.city ?? ""} ${r.profiles?.area ?? ""}`.toLowerCase().includes(filters.city.toLowerCase()))
        return false;
      if (filters.language && !(r.languages ?? []).some((l: string) => l.toLowerCase().includes(filters.language.toLowerCase())))
        return false;
      const subs = r.teacher_subjects ?? [];
      if (filters.subject !== "any" && !subs.some((s: any) => s.subject === filters.subject)) return false;
      if (filters.level !== "any" && !subs.some((s: any) => s.level === filters.level)) return false;
      if (filters.board !== "any" && !subs.some((s: any) => s.board === filters.board)) return false;
      return true;
    });
  }, [query.data, filters, savedQuery.data]);

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
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="border-b border-border/50 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A] font-display">Discover Expert Tutors</h1>
          <p className="mt-1.5 text-sm text-muted-foreground font-medium">
            Explore trusted local educators tailored to your preferences. Compare profiles, ratings, and rates to find your ideal match.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-start">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
        {/* Filters Top Card */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Filter Tutors</h2>
              {activeCount > 0 && <Badge className="bg-primary-soft text-primary border-0">{activeCount}</Badge>}
            </div>
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs hover:bg-[#E2E8F0]/50" onClick={() => setFilters(DEFAULT_FILTERS)}>
                <X className="mr-1 h-3 w-3" /> Clear filters
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <FilterRow label="Search">
              <Input placeholder="Name or keyword" value={filters.q} onChange={(e) => set("q", e.target.value)} />
            </FilterRow>
            <FilterRow label="Location">
              <Input placeholder="City or area" value={filters.city} onChange={(e) => set("city", e.target.value)} />
            </FilterRow>
            <FilterRow label="Subject">
              <SelectField value={filters.subject} onChange={(v) => set("subject", v)} options={[{ value: "any", label: "Any subject" }, ...SUBJECTS.map((s) => ({ value: s, label: s }))]} />
            </FilterRow>
            <FilterRow label="Level">
              <SelectField value={filters.level} onChange={(v) => set("level", v)} options={[{ value: "any", label: "Any level" }, ...LEVELS.map((s) => ({ value: s, label: s }))]} />
            </FilterRow>
            <FilterRow label="Board">
              <SelectField value={filters.board} onChange={(v) => set("board", v)} options={[{ value: "any", label: "Any board" }, ...BOARDS.map((s) => ({ value: s, label: s }))]} />
            </FilterRow>
            <FilterRow label="Mode">
              <SelectField value={filters.mode} onChange={(v) => set("mode", v)} options={MODES} />
            </FilterRow>
            <FilterRow label="Teacher gender">
              <SelectField value={filters.gender} onChange={(v) => set("gender", v)} options={[
                { value: "any", label: "Any gender" },
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ]} />
            </FilterRow>
            <FilterRow label="Language">
              <Input placeholder="e.g. English" value={filters.language} onChange={(e) => set("language", e.target.value)} />
            </FilterRow>
            
            {/* Max Hourly Fee */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Max Hourly Fee</span>
                <span className="text-sm font-bold text-[#4665FF] font-display">₹{filters.feeMax}{filters.feeMax >= 5000 ? "+" : ""}/hr</span>
              </div>
              <Slider value={[filters.feeMax]} min={100} max={5000} step={100} onValueChange={([v]) => set("feeMax", v)} />
              <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                <span>₹100</span>
                <span>₹5,000+</span>
              </div>
            </div>

            {/* Min Rating */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Min Rating</span>
                <span className="text-sm font-bold text-[#4665FF] font-display">{filters.minRating === 0 ? "Any" : `${filters.minRating}★ & above`}</span>
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
                      {r === 0 ? "Any" : (
                        <>
                          <span>{r}</span>
                          <Star className={`h-3 w-3 ${isActive ? 'fill-white text-white' : 'fill-muted-foreground text-muted-foreground'}`} />
                          <span className="text-[9px] font-normal">+</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Favourites only toggle */}
            {currentUserId && (
              <div className="flex items-center gap-2.5 pt-6 select-none">
                <Checkbox
                  id="favourites-only"
                  checked={filters.favouritesOnly}
                  onCheckedChange={(checked) => set("favouritesOnly", !!checked)}
                />
                <label htmlFor="favourites-only" className="text-sm font-semibold text-foreground cursor-pointer flex items-center gap-1.5">
                  <Heart className={`h-3.5 w-3.5 ${filters.favouritesOnly ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                  Favourites only
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <section className="space-y-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Sort by</p>
            <div className="w-48">
              <SelectField value={filters.sort} onChange={(v) => set("sort", v)} options={SORTS} />
            </div>
          </div>

          {query.isLoading && <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">Loading tutors…</div>}
          {query.error && <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">Failed to load tutors.</div>}
          {!query.isLoading && rows.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
              <p className="font-semibold">No tutors match your filters yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">Try widening location, subject or fee range.</p>
            </div>
          )}

          <ul className="grid gap-4">
            {rows.map((t: any) => {
              const isSaved = (savedQuery.data ?? []).includes(t.user_id);
              const ratingVal = Number(t.rating_avg);
              return (
                <li key={t.user_id} className="relative group">
                  <Link
                    to="/tutors/$id"
                    params={{ id: t.user_id }}
                    className="block rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary-soft text-primary text-xl font-bold">
                        {t.profiles?.avatar_url ? (
                          <img src={t.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          (t.profiles?.full_name ?? "?").slice(0, 1).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 pr-8">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-semibold">{t.profiles?.full_name}</h3>
                            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5" />
                              {[t.profiles?.area, t.profiles?.city].filter(Boolean).join(", ") || "Location not set"} · <span className="font-display font-semibold">{t.years_experience}+</span> yrs exp
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-sm font-semibold">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            {ratingVal > 0 ? (
                              <>
                                <span className="font-display">{ratingVal.toFixed(1)}</span>
                                <span className="font-normal text-muted-foreground font-display">({t.rating_count})</span>
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground font-medium">New tutor</span>
                            )}
                          </div>
                        </div>
                        {t.bio && <p className="mt-2 line-clamp-2 text-sm text-foreground/80 font-normal">{t.bio}</p>}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {(t.teacher_subjects ?? []).slice(0, 5).map((s: any, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-primary-soft text-primary border-0">
                              {s.subject} · {s.level}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{t.mode === "both" ? "Online & in-person" : t.mode}</span>
                          <span className="font-semibold font-display">
                            {t.fee_min === t.fee_max ? `₹${t.fee_min}/hr` : `₹${t.fee_min}–${t.fee_max}/hr`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Save button overlaid */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleSaveMutation.mutate({ teacherId: t.user_id, isSaved });
                    }}
                    className="absolute right-4 top-4 rounded-full h-8 w-8 hover:bg-slate-100 z-10"
                  >
                    <Heart className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"}`} />
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function SelectField({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

void useEffect;

