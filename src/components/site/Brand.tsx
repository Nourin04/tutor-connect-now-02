import { Link } from "@tanstack/react-router";
import logoUrl from "@/assets/tutorconnect-logo.svg";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchPrimaryRole, dashboardPathForRole } from "@/lib/auth-helpers";

export function Brand({ to, className = "h-9" }: { to?: string; className?: string }) {
  const [targetPath, setTargetPath] = useState("/");

  useEffect(() => {
    let mounted = true;
    if (to !== undefined) {
      setTargetPath(to);
      return;
    }

    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      if (data.user) {
        const role = await fetchPrimaryRole();
        setTargetPath(dashboardPathForRole(role));
      } else {
        setTargetPath("/");
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      if (!mounted) return;
      if (s?.user) {
        const role = await fetchPrimaryRole();
        setTargetPath(dashboardPathForRole(role));
      } else {
        setTargetPath("/");
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [to]);

  return (
    <Link to={targetPath} className="flex items-center">
      <img src={logoUrl} alt="TutorConnect" className={`${className} w-auto`} />
    </Link>
  );
}
