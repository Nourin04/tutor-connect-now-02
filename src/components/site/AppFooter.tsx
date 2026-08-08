import { Link } from "@tanstack/react-router";
import { Brand } from "./Brand";

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <Brand />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Helping families and independent tutors connect locally and transparently.
            </p>
          </div>
          <div className="flex gap-24 sm:gap-36 md:gap-48">
            <FooterCol title="Product">
              <a href="/#how" className="footer-link">
                How it works
              </a>
              <a href="/#faq" className="footer-link">
                FAQ
              </a>
              <a href="#" className="footer-link">
                About
              </a>
              <a href="#" className="footer-link">
                Contact
              </a>
            </FooterCol>
            <FooterCol title="Legal">
              <Link to="/privacy" className="footer-link">
                Privacy Policy
              </Link>
              <Link to="/terms" className="footer-link">
                Terms of Service
              </Link>
            </FooterCol>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} TutorConnect. All rights reserved.</p>
          <p>Made for learners, everywhere.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-4 space-y-2.5 [&_.footer-link]:text-sm [&_.footer-link]:text-muted-foreground [&_.footer-link]:transition-colors hover:[&_.footer-link]:text-primary">
        {Array.isArray(children) ? (
          children.map((c, i) => <li key={i}>{c}</li>)
        ) : (
          <li>{children}</li>
        )}
      </ul>
    </div>
  );
}
