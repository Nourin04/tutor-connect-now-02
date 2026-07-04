import { Link } from "@tanstack/react-router";

export function Brand({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <div className="flex h-9.5 w-9.5 items-center justify-center rounded-xl bg-[#5357FE] text-white shadow-soft shrink-0">
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 8c.8-.5 1.8-.7 2.8-.5 1.8.3 3 1.8 3 3.5 0 2.2-1.3 4.3-4.8 6.5-.6.4-1.4.4-2 0C7.5 15.3 6.2 13.2 6.2 11c0-1.7 1.2-3.2 3-3.5 1-.2 2 0 2.8.5z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 10.5c.5-.3 1.1-.4 1.7-.3 1.1.2 1.8 1.1 1.8 2.1 0 1.3-.8 2.6-3 4-.3.2-.8.2-1.1 0-2.2-1.4-3-2.7-3-4 0-1 .8-1.9 1.8-2.1.6-.1 1.2 0 1.7.3z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="13" r="1.2" fill="currentColor" />
        </svg>
      </div>
      <span className="text-xl font-bold tracking-tight text-[#5357FE] font-display">TutorConnect</span>
    </Link>
  );
}
