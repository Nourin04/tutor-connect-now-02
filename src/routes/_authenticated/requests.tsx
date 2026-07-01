import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/site/AppHeader";
import { AppFooter } from "@/components/site/AppFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { fetchPrimaryRole, type AppRole } from "@/lib/auth-helpers";
import { Check, X, Hourglass, MessageCircle, Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/_authenticated/requests")({
  component: RequestsPage,
});

type Req = {
  id: string;
  status: "pending" | "accepted" | "declined";
  message: string;
  created_at: string;
  decided_at: string | null;
  viewer_id: string;
  teacher_id: string;
  viewer?: { full_name: string; email: string; phone: string } | null;
  teacher?: { full_name: string; city: string; area: string } | null;
};

function RequestsPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<AppRole | null>(null);
  const [uid, setUid] = useState<string>("");
  const [incoming, setIncoming] = useState<Req[]>([]);
  const [outgoing, setOutgoing] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);

  async function load(userId: string, r: AppRole) {
    if (r === "teacher") {
      const { data } = await supabase
        .from("contact_events")
        .select("id, status, message, created_at, decided_at, viewer_id, teacher_id, viewer:profiles!contact_events_viewer_id_fkey(full_name, email, phone)")
        .eq("teacher_id", userId)
        .order("created_at", { ascending: false });
      setIncoming((data as any[]) ?? []);
    } else {
      const { data } = await supabase
        .from("contact_events")
        .select("id, status, message, created_at, decided_at, viewer_id, teacher_id, teacher:profiles!contact_events_teacher_id_fkey(full_name, city, area)")
        .eq("viewer_id", userId)
        .order("created_at", { ascending: false });
      setOutgoing((data as any[]) ?? []);
    }
  }

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setUid(u.user.id);
      const r = await fetchPrimaryRole();
      setRole(r);
      if (r === "admin") { navigate({ to: "/admin", replace: true }); return; }
      if (r) await load(u.user.id, r);
      setLoading(false);
    })();
  }, [navigate]);

  async function decide(id: string, status: "accepted" | "declined") {
    const { error } = await supabase
      .from("contact_events")
      .update({ status, decided_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "accepted" ? "Request accepted." : "Request declined.");
    if (role) await load(uid, role);
  }

  async function withdraw(id: string) {
    const { error } = await supabase.from("contact_events").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Request withdrawn.");
    if (role) await load(uid, role);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="mx-auto max-w-5xl p-10 text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">Contact requests</h1>
        <p className="mt-1 text-muted-foreground">
          {role === "teacher"
            ? "Learners who'd like to reach you. Accept to share your email and phone."
            : "Tutors you've reached out to. You'll see their contact details once they accept."}
        </p>

        {role === "teacher" ? (
          <TeacherView incoming={incoming} onDecide={decide} />
        ) : (
          <StudentView outgoing={outgoing} onWithdraw={withdraw} />
        )}
      </main>
      <AppFooter />
    </div>
  );
}

function TeacherView({ incoming, onDecide }: { incoming: Req[]; onDecide: (id: string, s: "accepted" | "declined") => void }) {
  const buckets = {
    pending: incoming.filter((r) => r.status === "pending"),
    accepted: incoming.filter((r) => r.status === "accepted"),
    declined: incoming.filter((r) => r.status === "declined"),
  };
  return (
    <Tabs defaultValue="pending" className="mt-8">
      <TabsList>
        <TabsTrigger value="pending">Pending <Badge className="ml-2 bg-primary-soft text-primary border-0">{buckets.pending.length}</Badge></TabsTrigger>
        <TabsTrigger value="accepted">Accepted ({buckets.accepted.length})</TabsTrigger>
        <TabsTrigger value="declined">Declined ({buckets.declined.length})</TabsTrigger>
      </TabsList>

      {(["pending", "accepted", "declined"] as const).map((k) => (
        <TabsContent key={k} value={k} className="mt-4 space-y-3">
          {buckets[k].length === 0 && <Empty text={`No ${k} requests.`} />}
          {buckets[k].map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{r.viewer?.full_name || "A learner"}</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              {r.message && (
                <p className="mt-3 flex gap-2 rounded-xl border border-border bg-background p-3 text-sm">
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {r.message}
                </p>
              )}
              {r.status === "accepted" && r.viewer && (
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-primary" /> <a href={`mailto:${r.viewer.email}`} className="hover:underline">{r.viewer.email}</a></span>
                  {r.viewer.phone && <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-primary" /> <a href={`tel:${r.viewer.phone}`} className="hover:underline">{r.viewer.phone}</a></span>}
                </div>
              )}
              {r.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => onDecide(r.id, "accepted")}>
                    <Check className="mr-1 h-4 w-4" /> Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDecide(r.id, "declined")}>
                    <X className="mr-1 h-4 w-4" /> Decline
                  </Button>
                </div>
              )}
            </div>
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function StudentView({ outgoing, onWithdraw }: { outgoing: Req[]; onWithdraw: (id: string) => void }) {
  if (outgoing.length === 0) {
    return (
      <div className="mt-8">
        <Empty text="You haven't sent any contact requests yet." />
        <div className="mt-4"><Button asChild><Link to="/tutors">Browse tutors</Link></Button></div>
      </div>
    );
  }
  return (
    <ul className="mt-8 space-y-3">
      {outgoing.map((r) => (
        <li key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link to="/tutors/$id" params={{ id: r.teacher_id }} className="font-semibold hover:text-primary">
                {r.teacher?.full_name || "Tutor"}
              </Link>
              <p className="text-xs text-muted-foreground">
                {[r.teacher?.area, r.teacher?.city].filter(Boolean).join(", ")} · sent {new Date(r.created_at).toLocaleDateString()}
              </p>
            </div>
            <StatusBadge status={r.status} />
          </div>
          {r.message && <p className="mt-3 rounded-xl border border-border bg-background p-3 text-sm">{r.message}</p>}
          <div className="mt-3 flex gap-2">
            <Button asChild size="sm" variant="outline"><Link to="/tutors/$id" params={{ id: r.teacher_id }}>View tutor</Link></Button>
            {r.status === "pending" && (
              <Button size="sm" variant="ghost" onClick={() => onWithdraw(r.id)}>Withdraw</Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function StatusBadge({ status }: { status: Req["status"] }) {
  if (status === "pending") return <Badge className="bg-primary-soft text-primary border-0"><Hourglass className="mr-1 h-3 w-3" /> Pending</Badge>;
  if (status === "accepted") return <Badge className="bg-emerald-100 text-emerald-700 border-0"><Check className="mr-1 h-3 w-3" /> Accepted</Badge>;
  return <Badge variant="secondary"><X className="mr-1 h-3 w-3" /> Declined</Badge>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">{text}</div>;
}
