import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/site/AppHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { fetchMyRoles } from "@/lib/auth-helpers";
import { ShieldAlert, Trash2, EyeOff, Eye, Star } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const roles = await fetchMyRoles();
      if (!roles.includes("admin")) {
        toast.error("Admin access required.");
        navigate({ to: "/dashboard", replace: true });
        return;
      }
      setAllowed(true);
    })();
  }, [navigate]);

  if (!allowed) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="p-10 text-center text-muted-foreground">Checking permissions…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
            <p className="text-sm text-muted-foreground">Moderate listings, reviews, and view platform stats.</p>
          </div>
        </div>

        <AdminStats />

        <Tabs defaultValue="tutors" className="mt-8">
          <TabsList>
            <TabsTrigger value="tutors">Tutors</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="tutors" className="mt-4"><TutorsTable /></TabsContent>
          <TabsContent value="users" className="mt-4"><UsersTable /></TabsContent>
          <TabsContent value="reviews" className="mt-4"><ReviewsTable /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function AdminStats() {
  const [stats, setStats] = useState({ users: 0, tutors: 0, active: 0, reviews: 0, contacts: 0 });
  useEffect(() => {
    (async () => {
      const [u, t, a, r, c] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("teacher_profiles").select("user_id", { count: "exact", head: true }),
        supabase.from("teacher_profiles").select("user_id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("reviews").select("id", { count: "exact", head: true }),
        supabase.from("contact_events").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        users: u.count ?? 0,
        tutors: t.count ?? 0,
        active: a.count ?? 0,
        reviews: r.count ?? 0,
        contacts: c.count ?? 0,
      });
    })();
  }, []);

  const cards = [
    { label: "Users", value: stats.users },
    { label: "Tutor listings", value: stats.tutors },
    { label: "Active listings", value: stats.active },
    { label: "Reviews", value: stats.reviews },
    { label: "Contact reveals", value: stats.contacts },
  ];
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.label}</p>
          <p className="mt-1 text-2xl font-bold font-display">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

function TutorsTable() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("teacher_profiles")
      .select("user_id, is_active, rating_avg, rating_count, fee_min, fee_max, profiles!inner(full_name, email, city)")
      .order("rating_avg", { ascending: false })
      .limit(100);
    setRows((data as any[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function toggle(id: string, current: boolean) {
    const { error } = await supabase.from("teacher_profiles").update({ is_active: !current }).eq("user_id", id);
    if (error) return toast.error(error.message);
    toast.success(!current ? "Tutor reactivated." : "Tutor deactivated.");
    load();
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-surface text-xs uppercase text-muted-foreground">
          <tr><Th>Name</Th><Th>Email</Th><Th>City</Th><Th>Rating</Th><Th>Fee</Th><Th>Status</Th><Th></Th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.user_id} className="border-t border-border">
              <Td>{r.profiles?.full_name}</Td>
              <Td className="text-muted-foreground">{r.profiles?.email}</Td>
              <Td>{r.profiles?.city || "-"}</Td>
              <Td><Star className="mr-1 inline h-3 w-3 fill-primary text-primary" />{Number(r.rating_avg).toFixed(1)} ({r.rating_count})</Td>
              <Td>₹{r.fee_min}–{r.fee_max}</Td>
              <Td>{r.is_active ? <Badge className="bg-primary-soft text-primary border-0">Active</Badge> : <Badge variant="secondary">Hidden</Badge>}</Td>
              <Td><Button size="sm" variant="outline" onClick={() => toggle(r.user_id, r.is_active)}>{r.is_active ? <><EyeOff className="mr-1 h-3 w-3" />Deactivate</> : <><Eye className="mr-1 h-3 w-3" />Reactivate</>}</Button></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersTable() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      // 1. Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, city, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (profilesError) {
        console.error("Error loading profiles:", profilesError.message);
        toast.error(`Error loading profiles: ${profilesError.message}`);
        setRows([]);
        return;
      }

      if (!profilesData || profilesData.length === 0) {
        setRows([]);
        return;
      }

      // 2. Fetch roles for these profiles
      const profileIds = profilesData.map((p) => p.id);
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", profileIds);

      if (rolesError) {
        console.error("Error loading user roles:", rolesError.message);
      }

      // 3. Map roles to their respective profiles
      const combined = profilesData.map((profile) => {
        const roles = (rolesData ?? [])
          .filter((r) => r.user_id === profile.id)
          .map((r) => ({ role: r.role }));
        return {
          ...profile,
          user_roles: roles,
        };
      });

      setRows(combined);
    })();
  }, []);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-surface text-xs uppercase text-muted-foreground">
          <tr><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>City</Th><Th>Joined</Th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-border">
              <Td>{r.full_name || "-"}</Td>
              <Td className="text-muted-foreground">{r.email}</Td>
              <Td>{(r.user_roles ?? []).map((x: any) => <Badge key={x.role} variant="secondary" className="mr-1 capitalize">{x.role}</Badge>)}</Td>
              <Td>{r.city || "-"}</Td>
              <Td className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReviewsTable() {
  const [rows, setRows] = useState<any[]>([]);
  async function load() {
    const { data } = await supabase
      .from("reviews")
      .select("id, rating, comment, created_at, teacher_id, teacher_profiles!inner(profiles!inner(full_name)), reviewer:profiles!reviews_reviewer_id_fkey(full_name)")
      .order("created_at", { ascending: false })
      .limit(100);
    setRows((data as any[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Remove this review?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Review removed.");
    load();
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-surface text-xs uppercase text-muted-foreground">
          <tr><Th>Tutor</Th><Th>Reviewer</Th><Th>Rating</Th><Th>Comment</Th><Th>Date</Th><Th></Th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-border align-top">
              <Td>{r.teacher_profiles?.profiles?.full_name}</Td>
              <Td>{r.reviewer?.full_name ?? "-"}</Td>
              <Td>{r.rating} ★</Td>
              <Td className="max-w-md text-muted-foreground">{r.comment || "-"}</Td>
              <Td className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</Td>
              <Td><Button size="sm" variant="outline" onClick={() => remove(r.id)}><Trash2 className="mr-1 h-3 w-3" /> Remove</Button></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) { return <th className="px-4 py-3 text-left font-semibold">{children}</th>; }
function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className ?? ""}`}>{children}</td>;
}
