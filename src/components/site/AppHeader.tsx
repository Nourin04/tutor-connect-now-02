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
import { User, Bell, Check, LogOut } from "lucide-react";
import { fetchPrimaryRole, type AppRole, dashboardPathForRole } from "@/lib/auth-helpers";
import { capitalize } from "@/lib/string-helpers";
import { toast } from "sonner";

export function AppHeader({ fullWidth = false }: { fullWidth?: boolean }) {
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [me, setMe] = useState<any>(null);

  // Notification States
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  async function loadProfile(uid: string) {
    const [{ data: p }, { data: phoneData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_phones").select("phone").eq("user_id", uid).maybeSingle(),
    ]);
    if (p) {
      setFullName(p.full_name ?? null);
      setAvatarUrl(p.avatar_url ?? null);
      const meData = { ...p, phone: phoneData?.phone ?? "" };
      setMe(meData);
    }
  }

  async function loadNotifications(uid: string) {
    try {
      const { data, error } = await supabase
        .from("notifications" as any)
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      setNotifications(data ?? []);
      setUnreadCount(data?.filter((n: any) => !n.is_read).length ?? 0);
    } catch (e) {
      console.warn("Notifications table may not exist yet:", e);
    }
  }

  async function markAllNotificationsAsRead() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    try {
      const { error } = await supabase
        .from("notifications" as any)
        .update({ is_read: true } as any)
        .eq("user_id", u.user.id);
      if (error) throw error;
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("All notifications marked as read.");
    } catch (e) {
      console.error(e);
    }
  }

  async function markNotificationAsRead(id: string) {
    try {
      const { error } = await supabase
        .from("notifications" as any)
        .update({ is_read: true } as any)
        .eq("id", id);
      if (error) throw error;
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    setIsMounted(true);
    let mounted = true;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      setEmail(data.user?.email ?? null);
      if (data.user) {
        const r = await fetchPrimaryRole();
        setRole(r);
        loadProfile(data.user.id);
        loadNotifications(data.user.id);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setEmail(s?.user?.email ?? null);
      if (s?.user) {
        const r = await fetchPrimaryRole();
        setRole(r);
        loadProfile(s.user.id);
        loadNotifications(s.user.id);
      } else {
        setRole(null);
        setFullName(null);
        setAvatarUrl(null);
        setMe(null);
        setNotifications([]);
        setUnreadCount(0);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Sign out error:", e);
    }
    window.location.href = "/";
  }

  const totalUnread = unreadCount;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-lg">
        <div
          className={`mx-auto flex h-16 items-center justify-between ${
            fullWidth ? "max-w-none w-full px-5" : "max-w-7xl px-4 sm:px-6 lg:px-8"
          }`}
        >
          <div className="flex items-center gap-6">
            <Brand />
          </div>
          <div className="flex items-center gap-3">
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
                  asChild
                  className="bg-[#4665FF] hover:bg-[#4665FF]/90 text-white rounded-md font-semibold shadow-soft"
                >
                  <Link to="/auth" search={{ mode: "signup" }}>
                    Get started
                  </Link>
                </Button>
              </>
            ) : email ? (
              <div className="flex items-center gap-4">
                {/* Notifications Bell */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-md border border-border hover:bg-muted relative shrink-0"
                    >
                      <Bell className="h-4 w-4" />
                      {totalUnread > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground animate-pulse">
                          {totalUnread > 9 ? "9+" : totalUnread}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-96 p-0 max-h-[500px] overflow-y-auto"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                      <span className="text-sm font-bold text-[#1A1A1A]">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-xs text-[#4665FF] hover:underline font-semibold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notifications List */}
                    <div className="divide-y divide-border/40">
                      {notifications.length === 0 ? (
                        <div className="py-10 text-center text-xs text-muted-foreground">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`px-4 py-3 text-xs transition-colors flex items-start gap-2.5 ${!n.is_read ? "bg-primary-soft/20 font-medium" : "text-muted-foreground"}`}
                          >
                            <div className="flex-1">
                              <p className="font-bold text-[#1A1A1A]">{n.title}</p>
                              <p className="mt-0.5 text-foreground/80">{n.message}</p>
                              <p className="mt-1 text-[10px] text-muted-foreground">
                                {new Date(n.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            {!n.is_read && (
                              <button
                                onClick={() => markNotificationAsRead(n.id)}
                                className="h-5 w-5 rounded-full border border-border flex items-center justify-center hover:bg-muted shrink-0"
                                title="Mark as read"
                              >
                                <Check className="h-3 w-3 text-[#4665FF]" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile Avatar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-9 w-9 rounded-full border border-border relative overflow-hidden shrink-0 cursor-pointer hover:ring-2 hover:ring-[#4665FF]/40 transition-all">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={fullName ?? "Profile"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#4665FF]/10 text-xs font-bold text-[#4665FF]">
                          {fullName ? (
                            capitalize(fullName).slice(0, 1)
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-xs text-muted-foreground truncate">
                      {email} ({role ?? "user"})
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={dashboardPathForRole(role)}>
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={signOut}
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                  asChild
                  className="bg-[#4665FF] hover:bg-[#4665FF]/90 text-white rounded-md font-semibold shadow-soft"
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
    </>
  );
}
