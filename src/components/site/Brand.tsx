import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

export function Brand({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <GraduationCap className="h-5 w-5" />
      </div>
      <span className="text-lg font-bold tracking-tight">TutorConnect</span>
    </Link>
  );
}
