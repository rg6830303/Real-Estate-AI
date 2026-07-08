import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Leaf,
  MapPin,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import BuilderMarquee from "@/components/BuilderMarquee";
import HeroSlideshow from "@/components/HeroSlideshow";
import PropertyCard from "@/components/PropertyCard";
import Reveal from "@/components/Reveal";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StatCounter from "@/components/StatCounter";
import Testimonials from "@/components/Testimonials";
import { ADVISOR_NAME, AGENCY_NAME } from "@/lib/config";
import { LOCATIONS, WHY_US } from "@/lib/site";
import { fetchActiveProperties } from "@/lib/properties";

/** Refresh featured inventory from MongoDB every 5 minutes. */
export const revalidate = 300;

const WHY_ICONS = [ShieldCheck, Leaf, ScrollText, BadgeCheck];

export default async function Home() {
  const properties = await fetchActiveProperties();
  // One featured card per project, highest-value first, deduped by locality.
  const featured = [...properties]
    .sort((a, b) => b.priceCr - a.priceCr)
    .slice(0, 6);

  return (
    <>
      <SiteHeader />
      <HeroSlideshow />

      {/* Quick search strip */}
      <section className="relative z-10 -mt-8 px-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 rounded-2xl border border-ink-950/10 bg-white p-5 shadow-panel sm:flex-row sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-950">
              Search from your favourite properties
            </p>
            <p className="text-xs text-ink-950/55">
              Filter by type, location and budget — or let {ADVISOR_NAME} shortlist for you.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Residential", "Commercial", "SCO", "Leasing"].map((t) => (
              <Link
                key={t}
                href={`/properties?type=${t.toLowerCase()}`}
                className="rounded-lg border border-ink-950/15 px-3.5 py-2 text-xs font-medium text-ink-950 transition hover:border-gold-500 hover:text-brand-700"
              >
                {t}
              </Link>
            ))}
            <Link
              href="/properties"
              className="rounded-lg bg-ink-950 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-ink-800"
            >
              All properties
            </Link>
          </div>
        </div>
      </section>

      {/* Browse builders */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
            Trusted developers
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">
            Browse builders
          </h2>
        </Reveal>
        <div className="mt-8">
          <BuilderMarquee />
        </div>
      </section>

      {/* Trending properties */}
      <section id="properties" className="border-y border-cream-200 bg-cream-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
                Verified inventory
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">
                Trending properties
              </h2>
              <p className="mt-1 max-w-xl text-sm text-ink-950/60">
                A selection from the same verified database {ADVISOR_NAME}{" "}
                recommends from — ask him for a shortlist that fits you.
              </p>
            </Reveal>
            <Link
              href="/properties"
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-950/15 px-4 py-2 text-sm font-medium text-ink-950 transition hover:border-gold-500 hover:text-brand-700"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 100}>
                <PropertyCard listing={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="bg-ink-950 text-white">
        <div className="mx-auto max-w-6xl px-4 pt-12 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-300">
            What numbers say
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            A legacy of trust in real estate
          </h2>
        </div>
        <StatCounter />
      </section>

      {/* Why choose us */}
      <section id="why-us" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
            The {AGENCY_NAME} way
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">
            Why choose us
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_US.map((w, i) => {
            const Icon = WHY_ICONS[i % WHY_ICONS.length];
            return (
              <Reveal key={w.title} delay={i * 100}>
                <div className="h-full rounded-xl border border-ink-950/10 bg-white p-5 shadow-card">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-950 text-gold-400">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-ink-950">{w.title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-950/65">{w.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Trending locations */}
      <section className="border-y border-cream-200 bg-cream-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
              Where we operate
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-950 sm:text-3xl">
              Trending locations
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {LOCATIONS.map((loc, i) => (
              <Reveal key={loc.slug} delay={i * 120}>
                <Link
                  href={`/properties?location=${loc.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-ink-950/10 bg-ink-950 shadow-card"
                >
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={loc.image}
                      alt={loc.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
                    <div className="absolute bottom-0 p-5">
                      <p className="flex items-center gap-1.5 text-lg font-semibold text-white">
                        <MapPin className="h-4 w-4 text-gold-400" strokeWidth={2} />
                        {loc.name}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-white/70">{loc.blurb}</p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      {/* Ashirvad CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <Reveal>
          <div className="overflow-hidden rounded-2xl bg-ink-950 text-white shadow-panel">
            <div className="grid items-center gap-8 p-8 sm:p-12 md:grid-cols-[1fr_auto]">
              <div>
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold-300">
                  <Building2 className="h-4 w-4" strokeWidth={2} />
                  AI-powered, consultant-minded
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {ADVISOR_NAME} asks the right questions, then recommends.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
                  Purpose, budget, location, configuration, timeline, must-haves —
                  share them in a simple conversation. {ADVISOR_NAME} matches your
                  needs against our verified inventory and tells you honestly which
                  option is the strongest deal, and why.
                </p>
              </div>
              <Link
                href="/consultant"
                className="justify-self-start rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold text-ink-950 transition hover:bg-gold-400 md:justify-self-end"
              >
                Chat with {ADVISOR_NAME} now
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </>
  );
}
