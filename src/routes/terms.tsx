import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/site/AppHeader";
import { AppFooter } from "@/components/site/AppFooter";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | TutorConnect" },
      {
        name: "description",
        content: "The rules that apply when you use TutorConnect to find or offer tutoring.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <article className="prose-content mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
          <Section title="1. What TutorConnect is">
            <p>
              TutorConnect is a discovery platform that helps parents and students find independent
              tutors in their area. We don't employ tutors, vet them, or take part in lessons or
              payments. We just help you find each other.
            </p>
          </Section>
          <Section title="2. Accounts">
            <p>
              You must be at least 13 to create an account, and 18+ if you're registering as a
              tutor. Parents can register and manage accounts on behalf of a child. You're
              responsible for keeping your password safe.
            </p>
          </Section>
          <Section title="3. Profile content">
            <p>
              Information you add to your profile (qualifications, bio, reviews) should be truthful.
              We may remove listings or reviews that look fake, misleading, or inappropriate, at our
              discretion.
            </p>
          </Section>
          <Section title="4. Connecting with tutors">
            <p>
              When you reveal a tutor's contact details, we log that action to help ensure quality
              (such as prompting reviews). Lessons, fees, and any agreements are negotiated directly
              between you and the tutor; TutorConnect is not a party to these agreements.
            </p>
          </Section>
          <Section title="5. Reviews">
            <p>
              Reviews must be honest and based on real interactions. Abusive reviews, spam, fake
              reviews, or anything illegal will be removed. Tutors can flag reviews they believe
              break these rules.
            </p>
          </Section>
          <Section title="6. Fees">
            <p>
              TutorConnect is currently free to use for both learners and tutors. We don't take
              commissions on tuition fees in this phase.
            </p>
          </Section>
          <Section title="7. Termination">
            <p>
              You can close your account at any time. We may suspend accounts that violate these
              terms or harm other users.
            </p>
          </Section>
          <Section title="8. Disclaimer">
            <p>
              TutorConnect is provided "as is". We make no warranties regarding specific tutors,
              learning outcomes, or the safety of any interactions. We encourage all users to make
              informed decisions, especially for in-person sessions.
            </p>
          </Section>
          <Section title="9. Changes">
            <p>
              We may update these terms as TutorConnect evolves. Material changes will be
              communicated through the app or by email.
            </p>
          </Section>
          <Section title="10. Contact">
            <p>Questions about these terms? Email us at hello@tutorconnect.example.</p>
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
