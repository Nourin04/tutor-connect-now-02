import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { Brand } from "./Brand";
import { User, LayoutDashboard, Search } from "lucide-react";
import {
  fetchPrimaryRole,
  type AppRole,
  dashboardPathForRole,
} from "@/lib/auth-helpers";
import { capitalize } from "@/lib/string-helpers";

export function AppHeader() {
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  async function loadProfile(uid: string) {
    const { data: p } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", uid)
      .maybeSingle();
    if (p) {
      setFullName(p.full_name ?? null);
      setAvatarUrl(p.avatar_url ?? null);
    }
  }

  useEffect(() => {
    setIsMounted(true);
    let mounted = true;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      setEmail(data.user?.email ?? null);
      if (data.user) {
        setRole(await fetchPrimaryRole());
        loadProfile(data.user.id);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setEmail(s?.user?.email ?? null);
      if (s?.user) {
        setRole(await fetchPrimaryRole());
        loadProfile(s.user.id);
      } else {
        setRole(null);
        setFullName(null);
        setAvatarUrl(null);
      }
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
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Brand />
        <div className="flex items-center gap-2">
          {!isMounted ? (
            <>
              <Link to="/auth" search={{ mode: "signin" }} className="text-sm font-semibold text-[#4665FF] hover:text-[#4665FF]/85 hover:underline px-3 py-2 transition-all">
                Sign in
              </Link>
              <Button size="sm" asChild className="bg-[#4665FF] hover:bg-[#4665FF]/90 text-white rounded-full font-semibold shadow-soft">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Get started
                </Link>
              </Button>
            </>
          ) : email ? (
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-border hover:bg-muted relative overflow-hidden shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={fullName ?? "Profile"} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#4665FF]/10 text-xs font-bold text-[#4665FF]">
                        {fullName ? capitalize(fullName).slice(0, 1) : <User className="h-4 w-4" />}
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 p-2">
                  <div className="px-2 py-1.5 flex flex-col">
                    <span className="text-sm font-bold text-[#1A1A1A]">
                      {fullName ? capitalize(fullName) : "User Profile"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">{email}</span>
                    {role === "admin" && (
                      <span className="text-[10px] text-primary/80 font-semibold uppercase tracking-wider mt-1">
                        Role: {role}
                      </span>
                    )}
                  </div>
                  {role === "admin" && (
                    <>
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
                    </>
                  )}
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
              <Button size="sm" asChild className="bg-[#4665FF] hover:bg-[#4665FF]/90 text-white rounded-full font-semibold shadow-soft">
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

