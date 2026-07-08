import Link from "next/link";
import {
  Award,
  BadgeCheck,
  Handshake,
  KeyRound,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import ChatWidget from "@/components/ChatWidget";
import PropertyCard from "@/components/PropertyCard";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { ADVISOR_NAME, AGENCY_NAME, AGENCY_TAGLINE } from "@/lib/config";
import { fetchActiveProperties } from "@/lib/properties";

/** Refresh featured inventory from MongoDB every 5 minutes. */
export const revalidate = 300;

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=70";

export default async function Home() {
  const properties = await fetchActiveProperties();
  const featured = [...properties]
    .sort((a, b) => b.priceCr - a.priceCr)
    .filter((p, i, arr) => i === 0 || arr[i - 1].locality !== p.locality)
    .slice(0, 6);

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/40 to-ink-950" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">
            Gurugram · Delhi · Goa
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {AGENCY_TAGLINE}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70">
            {AGENCY_NAME} brings you premium residences and high-conviction
            investments, guided end to end with trust, integrity and
            excellence. Tell {ADVISOR_NAME}, our AI property consultant, what
            you're looking for — get a shortlist that actually fits.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/consultant"
              className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold text-ink-950 shadow-panel transition hover:bg-gold-400"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={2} />
              Start with {ADVISOR_NAME}
            </Link>
            <Link
              href="/#properties"
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-6 py-3 text-sm font-medium text-white transition hover:border-gold-300 hover:text-gold-300"
            >
              Browse featured properties
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip — PLACEHOLDER figures: replace with the agency's real,
          verifiable numbers before public launch. */}
      <section className="border-b border-gold-500/20 bg-ink-900 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 text-center sm:grid-cols-4 sm:px-6">
          {[
            ["15+", "Years in NCR real estate"],
            ["500+", "Families settled"],
            ["₹1,000 Cr+", "Transactions guided"],
            ["3", "Markets served"],
          ].map(([num, label]) => (
            <div key={label}>
              <p className="text-2xl font-semibold text-gold-300">{num}</p>
              <p className="mt-1 text-xs text-white/60">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured properties — live from the same database Ashirvad uses */}
      <section id="properties" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
              Verified inventory
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink-950">
              Featured properties in Gurugram
            </h2>
            <p className="mt-1 text-sm text-ink-950/60">
              A selection from the same verified database that {ADVISOR_NAME}{" "}
              recommends from — ask him for the full picture.
            </p>
          </div>
          <Link
            href="/consultant"
            className="rounded-lg border border-ink-950/15 px-4 py-2 text-sm font-medium text-ink-950 transition hover:border-gold-500 hover:text-brand-700"
          >
            Get a personal shortlist →
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <PropertyCard key={p.id} listing={p} />
          ))}
        </div>
      </section>

      {/* Why us */}
      <section id="why-us" className="border-y border-cream-200 bg-cream-100">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
            The {AGENCY_NAME} way
          </p>
          <h2 className="mt-2 text-center text-2xl font-semibold tracking-tight text-ink-950">
            Relationships first, transactions second
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Handshake,
                title: "Trust & transparency",
                body: "Every recommendation is verified inventory with honest trade-offs — never pressure, never fake urgency.",
              },
              {
                icon: Award,
                title: "Luxury floors specialists",
                body: "Deep expertise in Gurugram's premium residential floors and gated communities.",
              },
              {
                icon: TrendingUp,
                title: "Investment clarity",
                body: "Rate-per-sq-ft value analysis, rental-demand insight and corridor growth context on every option.",
              },
              {
                icon: KeyRound,
                title: "End-to-end guidance",
                body: "From first conversation to keys in hand — site visits, negotiation, paperwork and possession.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl border border-ink-950/10 bg-white p-5 shadow-card"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-950 text-gold-400">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <p className="mt-3 text-sm font-semibold text-ink-950">{title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-950/65">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ashirvad CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="overflow-hidden rounded-2xl bg-ink-950 text-white shadow-panel">
          <div className="grid items-center gap-8 p-8 sm:p-12 md:grid-cols-[1fr_auto]">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold-300">
                <BadgeCheck className="h-4 w-4" strokeWidth={2} />
                AI-powered, consultant-minded
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                {ADVISOR_NAME} listens first, recommends second.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
                Budget, location, configuration, timeline, must-haves — share
                them in a simple conversation. {ADVISOR_NAME} matches your
                needs against our verified Gurugram inventory and tells you
                honestly which option is the strongest deal, and why.
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
      </section>

      <SiteFooter />
      <ChatWidget />
    </>
  );
}
