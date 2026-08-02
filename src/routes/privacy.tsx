import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/site/AppHeader";
import { AppFooter } from "@/components/site/AppFooter";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | TutorConnect" },
      {
        name: "description",
        content: "How TutorConnect collects, uses, and protects your information.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <article className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
          <Section title="What we collect">
            <ul className="list-disc space-y-1 pl-5">
              <li>Account info you give us: name, email, phone, role.</li>
              <li>
                Profile info you choose to share: location, qualifications, subjects, fees,
                availability, photo, bio.
              </li>
              <li>Activity info: tutors you view, contact-reveal events, reviews you leave.</li>
              <li>
                Basic technical data: IP address, device, and browser info for security and
                reliability.
              </li>
            </ul>
          </Section>
          <Section title="How we use it">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                To operate the marketplace, surface relevant tutors, show reviews, and prevent
                abuse.
              </li>
              <li>To improve search results and matching.</li>
              <li>To send you account, safety, and review-reminder messages.</li>
              <li>To respond to support requests.</li>
            </ul>
          </Section>
          <Section title="What we share">
            <p>
              Your public tutor profile (if you're a tutor) is visible to anyone visiting
              TutorConnect. Contact details are shown to a learner only after they click "Reveal
              contact". We don't sell personal data.
            </p>
          </Section>
          <Section title="Cookies & analytics">
            <p>
              We use a small number of cookies to keep you signed in and understand product usage in
              aggregate.
            </p>
          </Section>
          <Section title="Data retention">
            <p>
              We keep your account data while your account is active. If you delete your account, we
              remove your profile from public view and delete personal data within 30 days, except
              where we're required to retain it for legal reasons.
            </p>
          </Section>
          <Section title="Your rights">
            <p>
              You can view, edit, or delete your profile from your dashboard at any time. For other
              data requests, email hello@tutorconnect.example.
            </p>
          </Section>
          <Section title="Security">
            <p>
              We use industry-standard practices (encryption in transit, row-level access control in
              the database) to protect your data. While no system is completely secure, we encourage
              you to use a strong password and keep it confidential.
            </p>
          </Section>
          <Section title="Children">
            <p>
              Children under 13 should not create accounts directly. Parents can manage learning
              accounts on behalf of their children.
            </p>
          </Section>
          <Section title="Contact">
            <p>Questions? Email hello@tutorconnect.example.</p>
          </Section>
        </article>
      </main>
      <AppFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-2 text-muted-foreground">{children}</div>
    </section>
  );
}
