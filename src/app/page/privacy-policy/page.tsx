import ChatWidget from "@/components/ChatWidget";
import PageHero from "@/components/PageHero";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { AGENCY_NAME, CONTACT } from "@/lib/config";

export const metadata = {
  title: `Privacy Policy — ${AGENCY_NAME}`,
};

const SECTIONS: { h: string; p: string }[] = [
  {
    h: "Information we collect",
    p: "When you submit an enquiry, book a site visit, or chat with our AI consultant, we may collect your name, phone number, email and the property preferences you share so we can advise you and follow up.",
  },
  {
    h: "How we use it",
    p: "Your information is used solely to understand your requirements, shortlist suitable properties, arrange site visits and keep you updated. We never sell your data.",
  },
  {
    h: "Conversations with our AI consultant",
    p: "Chats help us tailor recommendations from our verified inventory. We do not use them to make automated decisions that affect you without a human in the loop.",
  },
  {
    h: "Data sharing",
    p: "We may share relevant details with the developer or our internal team strictly to progress your enquiry, and with service providers who help us operate the website.",
  },
  {
    h: "Your choices",
    p: "You can ask us to access, correct or delete your personal information at any time by writing to us.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <SiteHeader />
      <PageHero title="Privacy Policy" crumb="Privacy Policy" image="/radiance/locations/loc1.png" />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-sm leading-relaxed text-ink-950/70">
          {AGENCY_NAME} respects your privacy. This policy explains what we collect and how we use
          it. By using this website you consent to the practices described below.
        </p>
        <div className="mt-8 space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="text-lg font-semibold text-ink-950">{s.h}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-950/70">{s.p}</p>
            </section>
          ))}
          <section>
            <h2 className="text-lg font-semibold text-ink-950">Contact</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-950/70">
              Questions about this policy? Email{" "}
              <a href={`mailto:${CONTACT.email}`} className="font-medium text-brand-700">
                {CONTACT.email}
              </a>{" "}
              or call {CONTACT.phone}.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
      <ChatWidget />
    </>
  );
}
