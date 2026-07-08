import Link from "next/link";
import { Compass, Eye, Gem } from "lucide-react";
import ChatWidget from "@/components/ChatWidget";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { ADVISOR_NAME, AGENCY_NAME } from "@/lib/config";

export const metadata = {
  title: `Mission & Vision | ${AGENCY_NAME}`,
};

export default function MissionVision() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[70vh]">
        <section className="bg-ink-950 text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">
              Mission &amp; Vision
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Excellence, innovation and integrity — in every square foot
            </h1>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Compass,
                title: "Our mission",
                body: "To guide every client to the right property through deep understanding, verified options and honest advice — making the journey from search to possession smooth, transparent and personal.",
              },
              {
                icon: Eye,
                title: "Our vision",
                body: "To be the most trusted real-estate consultancy across Gurugram, Delhi and Goa — the first call families and investors make, and the name they pass on to the people they care about.",
              },
              {
                icon: Gem,
                title: "Our values",
                body: "Trust, integrity and excellence. We uphold the highest ethical standards in the industry, pair human judgement with modern tools, and measure success in relationships, not transactions.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-ink-950/10 bg-white p-7 shadow-card"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink-950 text-gold-400">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-ink-950">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-950/70">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl bg-ink-950 p-8 text-center text-white sm:p-10">
            <h2 className="text-xl font-semibold tracking-tight">
              Innovation in practice
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/70">
              {ADVISOR_NAME}, our AI property consultant, embodies this vision —
              available around the clock to understand your requirements and
              shortlist verified options, with our human team confirming every
              detail before you commit.
            </p>
            <Link
              href="/consultant"
              className="mt-6 inline-block rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
            >
              Experience it — chat with {ADVISOR_NAME}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
      <ChatWidget />
    </>
  );
}
