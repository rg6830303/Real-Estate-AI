import { ArrowUpRight, Briefcase, Heart, TrendingUp, Users } from "lucide-react";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { AGENCY_NAME, CONTACT } from "@/lib/config";

export const metadata = {
  title: `Careers — ${AGENCY_NAME}`,
  description: "Build your career with Radiance Realtors — join a team that puts clients and integrity first.",
};

const ROLES = [
  {
    title: "Sales Consultant",
    type: "Full-time · Gurugram",
    body: "Guide buyers and investors through verified inventory with honesty and market expertise.",
  },
  {
    title: "Investment Advisor",
    type: "Full-time · Gurugram",
    body: "Build rate-per-sq-ft and yield analyses that help clients invest with confidence.",
  },
  {
    title: "Digital Marketing Executive",
    type: "Full-time · Gurugram",
    body: "Tell the Radiance story across channels and generate high-intent leads.",
  },
];

const PERKS = [
  { Icon: TrendingUp, title: "Uncapped growth", body: "Competitive incentives and a fast track for high performers." },
  { Icon: Users, title: "Great team", body: "Learn from seasoned NCR real-estate professionals." },
  { Icon: Heart, title: "Clients first", body: "Sell with integrity — never pressure, never fake urgency." },
];

export default function CareerPage() {
  return (
    <>
      <SiteHeader />
      <PageHero
        title="Careers at Radiance"
        crumb="Careers"
        subtitle="Join a team that measures success by how well we serve — not just how much we sell."
        image="/radiance/props/belgravia.jpg"
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {PERKS.map((p, i) => (
            <Reveal key={p.title} delay={i * 100}>
              <div className="h-full rounded-2xl border border-ink-950/10 bg-white p-6 shadow-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-950 text-gold-400">
                  <p.Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <p className="mt-3 text-sm font-semibold text-ink-950">{p.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-950/65">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <h2 className="mt-14 text-2xl font-semibold tracking-tight text-ink-950">Open positions</h2>
        <div className="mt-6 space-y-4">
          {ROLES.map((r, i) => (
            <Reveal key={r.title} delay={i * 80}>
              <div className="flex flex-col gap-4 rounded-2xl border border-ink-950/10 bg-white p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cream-100 text-brand-700">
                    <Briefcase className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-ink-950">{r.title}</p>
                    <p className="text-xs text-ink-950/50">{r.type}</p>
                    <p className="mt-1 text-sm text-ink-950/65">{r.body}</p>
                  </div>
                </div>
                <a
                  href={`mailto:${CONTACT.email}?subject=Application: ${encodeURIComponent(r.title)}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
                >
                  Apply <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
