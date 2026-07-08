import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import ChatWidget from "@/components/ChatWidget";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { AGENCY_NAME } from "@/lib/config";
import { BUILDERS } from "@/lib/site";

export const metadata = {
  title: `Builders — ${AGENCY_NAME}`,
  description:
    "Explore properties from India's most trusted developers: DLF, Emaar, M3M, Central Park, Elan, Spaze, Godrej and more.",
};

const BLURBS: Record<string, string> = {
  dlf: "India's largest listed developer — landmark luxury and dependable maintenance across Gurugram.",
  emaar: "Global developer behind world-class residences and business districts.",
  m3m: "Design-led luxury residences and high-street retail across Gurugram's prime corridors.",
  "central-park": "Resort-style townships with hotel-grade services on Sohna Road.",
  elan: "Landmark high-street retail and commercial destinations.",
  spaze: "Commercial and retail spaces along the Dwarka Expressway growth corridor.",
  godrej: "Trusted branded residences with strong build quality and amenities.",
  "central-park-flower-valley": "The expansive Flower Valley township in Sohna — floors, towers and villas.",
};

export default function BuildersPage() {
  return (
    <>
      <SiteHeader />
      <PageHero
        title="Browse Builders"
        crumb="Builders"
        subtitle="We represent India's most trusted developers — explore verified inventory by brand."
        image="/radiance/props/skyvillas.jpg"
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BUILDERS.map((b, i) => (
            <Reveal key={b.slug} delay={(i % 3) * 100}>
              <Link
                href={`/properties?builder=${b.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-ink-950/10 bg-white p-6 shadow-card transition hover:border-gold-500 hover:shadow-panel"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-950 text-gold-400">
                    <Building2 className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <p className="text-lg font-semibold text-ink-950">{b.name}</p>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-950/65">
                  {BLURBS[b.slug] ?? "Verified projects across Gurugram and NCR."}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
                  View properties{" "}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <SiteFooter />
      <ChatWidget />
    </>
  );
}
