import Link from "next/link";
import { Award, Handshake, ShieldCheck, Users } from "lucide-react";
import ChatWidget from "@/components/ChatWidget";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { ADVISOR_NAME, AGENCY_NAME } from "@/lib/config";

export const metadata = {
  title: `About Us | ${AGENCY_NAME} — Your Trusted Real Estate Partner`,
};

export default function AboutUs() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh]">
        <section className="bg-ink-950 text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">
              About {AGENCY_NAME}
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Your trusted real estate partner in Gurugram, Delhi &amp; Goa
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
              {AGENCY_NAME} was founded by Mr. Sandeep Arora with a simple
              conviction: buying property should feel guided, transparent and
              personal — never rushed or transactional. Today we advise
              families and investors across premium residences, luxury floors
              and commercial assets, building relationships that outlast any
              single deal.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                title: "Integrity first",
                body: "Verified inventory, honest trade-offs and clear paperwork — the same standard on every transaction.",
              },
              {
                icon: Users,
                title: "Personalised service",
                body: "We understand your requirement deeply before showing a single option, so every visit counts.",
              },
              {
                icon: Award,
                title: "Market expertise",
                body: "Deep, current knowledge of Gurugram's corridors — from Golf Course Extension to Dwarka Expressway.",
              },
              {
                icon: Handshake,
                title: "Relationships that last",
                body: "Most of our clients come from referrals — the truest measure of trust in this business.",
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
                <p className="mt-1.5 text-xs leading-relaxed text-ink-950/65">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 overflow-hidden rounded-2xl bg-cream-100 p-8 sm:p-10">
            <h2 className="text-xl font-semibold tracking-tight text-ink-950">
              Leadership
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-950/70">
              Under the leadership of founder{" "}
              <strong className="text-ink-950">Mr. Sandeep Arora</strong>,{" "}
              {AGENCY_NAME} has grown into one of Gurugram's most trusted names
              in the premium residential floors segment — while expanding into
              Delhi and Goa. His philosophy shapes how we work: listen
              carefully, advise honestly, and stand beside the client from the
              first conversation to possession day.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/mission-vission"
                className="rounded-lg border border-ink-950/15 px-5 py-2.5 text-sm font-medium text-ink-950 transition hover:border-gold-500"
              >
                Our mission &amp; vision
              </Link>
              <Link
                href="/consultant"
                className="rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
              >
                Chat with {ADVISOR_NAME}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <ChatWidget />
    </>
  );
}
