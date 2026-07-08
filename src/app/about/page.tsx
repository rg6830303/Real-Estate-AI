import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StatCounter from "@/components/StatCounter";
import { ADVISOR_NAME, AGENCY_NAME } from "@/lib/config";
import { WHY_US } from "@/lib/site";

export const metadata = {
  title: `About Us — ${AGENCY_NAME}`,
  description:
    "At Radiance Realtors we don't just sell properties — we help you find a place to call home. Trust, transparency and lasting relationships across Gurugram, Dwarka Expressway and Goa.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <PageHero
        title="About Radiance Realtors"
        crumb="About"
        subtitle="A legacy of trust in real estate — more than a company, your partner in finding the perfect home."
      />

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2">
        <Reveal className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-panel">
          <Image
            src="/radiance/about.png"
            alt="Radiance Realtors"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </Reveal>
        <Reveal delay={120}>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
            Who we are
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">
            We help you find a place to call home
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink-950/70">
            <p>
              At {AGENCY_NAME}, we don&apos;t just sell properties — we help you find a place to
              call home. With a strong presence across Gurugram, the Dwarka Expressway corridor and
              Goa, we specialise in connecting buyers and investors with premium properties aligned
              to their lifestyle and financial goals.
            </p>
            <p>
              Our dedicated team of experienced professionals offers personalised assistance whether
              you are buying, selling or investing — grounded in trust, transparency and lasting
              relationships rather than one-off transactions.
            </p>
          </div>
          <ul className="mt-5 space-y-2">
            {[
              "Verified inventory from India's top developers",
              "Honest, rate-per-sq-ft value analysis on every option",
              "End-to-end guidance — from first visit to possession",
            ].map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm text-ink-950/80">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" strokeWidth={2} />
                {point}
              </li>
            ))}
          </ul>
          <Link
            href="/consultant"
            className="mt-6 inline-block rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
          >
            Talk to {ADVISOR_NAME}
          </Link>
        </Reveal>
      </section>

      <section className="bg-ink-950 text-white">
        <div className="mx-auto max-w-6xl px-4 pt-12 text-center sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            What numbers say — our milestones
          </h2>
        </div>
        <StatCounter />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
            Our values
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">
            Why choose us
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {WHY_US.map((w, i) => (
            <Reveal key={w.title} delay={i * 100}>
              <div className="h-full rounded-xl border border-ink-950/10 bg-white p-6 shadow-card">
                <p className="text-sm font-semibold text-ink-950">{w.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-950/65">{w.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
