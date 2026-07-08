import Link from "next/link";
import { Compass, Eye, Target } from "lucide-react";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { ADVISOR_NAME, AGENCY_NAME } from "@/lib/config";

export const metadata = {
  title: `Mission & Vision — ${AGENCY_NAME}`,
};

const BLOCKS = [
  {
    icon: Target,
    title: "Our Mission",
    body: "To simplify real estate for every client — matching them with verified, right-fit properties through honest advice, deep market research and transparent, pressure-free guidance from first conversation to possession.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    body: "To be the most trusted name in NCR and Goa real estate — known not for how much we sell, but for how well we serve, building relationships that last far beyond a single transaction.",
  },
  {
    icon: Compass,
    title: "Our Values",
    body: "Integrity in every dealing, sustainability in every project, and clients-first thinking in every recommendation. We measure success by the confidence with which our clients invest.",
  },
];

export default function MissionVisionPage() {
  return (
    <>
      <SiteHeader />
      <PageHero
        title="Mission & Vision"
        crumb="Mission & Vision"
        subtitle="The principles that guide how we advise, invest and build relationships."
        image="/radiance/locations/loc2.png"
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {BLOCKS.map((b, i) => (
            <Reveal key={b.title} delay={i * 120}>
              <div className="flex h-full flex-col rounded-2xl border border-ink-950/10 bg-white p-6 shadow-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-950 text-gold-400">
                  <b.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-ink-950">{b.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-950/70">{b.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 overflow-hidden rounded-2xl bg-cream-100 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold tracking-tight text-ink-950">
            Experience the {AGENCY_NAME} difference
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-ink-950/65">
            Tell {ADVISOR_NAME}, our AI property consultant, what you&apos;re looking for. He listens
            first, then recommends only verified options that truly fit.
          </p>
          <Link
            href="/consultant"
            className="mt-6 inline-block rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
          >
            Chat with {ADVISOR_NAME}
          </Link>
        </Reveal>
      </section>
      <SiteFooter />
    </>
  );
}
