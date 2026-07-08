import { Link } from "@tanstack/react-router";
import logoUrl from "@/assets/tutorconnect-logo.svg";

export function Brand({ to = "/", className = "h-9" }: { to?: string; className?: string }) {
  return (
    <Link to={to} className="flex items-center">
      <img src={logoUrl} alt="TutorConnect" className={`${className} w-auto`} />
    </Link>
  );
}
