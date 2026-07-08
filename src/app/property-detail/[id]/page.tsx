import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Building,
  CalendarClock,
  Home,
  MapPin,
  MessageCircle,
  Ruler,
} from "lucide-react";
import ChatWidget from "@/components/ChatWidget";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { ADVISOR_NAME, AGENCY_NAME } from "@/lib/config";
import { formatArea, formatPriceCr } from "@/lib/format";
import { fetchActiveProperties } from "@/lib/properties";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { id: string } }) {
  const listing = (await fetchActiveProperties()).find((p) => p.id === params.id);
  return {
    title: listing
      ? `${listing.title} — ${listing.locality} | ${AGENCY_NAME}`
      : `Property | ${AGENCY_NAME}`,
  };
}

export default async function PropertyDetail({
  params,
}: {
  params: { id: string };
}) {
  const listing = (await fetchActiveProperties()).find((p) => p.id === params.id);
  if (!listing) notFound();

  const perSqft =
    listing.areaSqft > 0
      ? Math.round((listing.priceCr * 1e7) / listing.areaSqft)
      : null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-8 sm:px-6">
        <Link
          href="/properties"
          className="inline-flex items-center gap-1.5 text-sm text-ink-950/60 transition hover:text-ink-950"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          All properties
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Visual + facts */}
          <div>
            <div className="overflow-hidden rounded-2xl border border-ink-950/10 bg-ink-950/5 shadow-card">
              {listing.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="h-[360px] w-full object-cover"
                />
              ) : (
                <div className="flex h-[360px] items-center justify-center text-ink-950/30">
                  <Building className="h-16 w-16" strokeWidth={1} />
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                {
                  icon: Home,
                  label: "Configuration",
                  value: `${listing.bhk ? listing.bhk + " " : ""}${listing.propertyType}`,
                },
                {
                  icon: Ruler,
                  label: "Area",
                  value: formatArea(listing.areaSqft),
                },
                {
                  icon: CalendarClock,
                  label: "Possession",
                  value:
                    listing.possession === "Ready to move"
                      ? "Ready to move"
                      : listing.possessionDate ?? "Under construction",
                },
                {
                  icon: MapPin,
                  label: "Location",
                  value: listing.locality,
                },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-ink-950/10 bg-white p-4 shadow-card"
                >
                  <Icon className="h-4 w-4 text-brand-600" strokeWidth={1.75} />
                  <p className="mt-2 text-[11px] uppercase tracking-wide text-ink-950/50">
                    {label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-ink-950">{value}</p>
                </div>
              ))}
            </div>

            {listing.amenities.length ? (
              <div className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-ink-950/70">
                  Amenities
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {listing.amenities.map((a) => (
                    <span
                      key={a}
                      className="rounded-full border border-ink-950/10 bg-white px-3 py-1 text-xs text-ink-950/70"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Summary / CTA */}
          <aside className="h-fit rounded-2xl border border-ink-950/10 bg-white p-6 shadow-panel">
            {listing.developer ? (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
                {listing.developer}
              </p>
            ) : null}
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-950">
              {listing.title}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-950/60">
              <MapPin className="h-4 w-4" strokeWidth={1.75} />
              {listing.locality}, {listing.city}
            </p>

            <div className="mt-5 rounded-xl bg-ink-950 p-4 text-white">
              <p className="text-[11px] uppercase tracking-wide text-white/50">
                Indicative price
              </p>
              <p className="mt-1 text-3xl font-semibold text-gold-300">
                {formatPriceCr(listing.priceCr)}
              </p>
              {perSqft ? (
                <p className="mt-1 text-xs text-white/60">
                  ≈ ₹{perSqft.toLocaleString("en-IN")}/sq ft · final pricing
                  confirmed by our team
                </p>
              ) : null}
            </div>

            {listing.highlights ? (
              <p className="mt-5 border-l-2 border-gold-400 pl-3 text-sm italic leading-relaxed text-ink-950/75">
                {listing.highlights}
              </p>
            ) : null}

            {listing.reraId ? (
              <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-brand-600">
                <BadgeCheck className="h-4 w-4" strokeWidth={1.75} />
                RERA: {listing.reraId}
              </p>
            ) : null}

            <Link
              href="/consultant"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gold-500 px-5 py-3 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={2} />
              Ask {ADVISOR_NAME} about this property
            </Link>
            <Link
              href="/contact"
              className="mt-3 flex w-full items-center justify-center rounded-lg border border-ink-950/15 px-5 py-3 text-sm font-medium text-ink-950 transition hover:border-gold-500"
            >
              Request a site visit
            </Link>
          </aside>
        </div>
      </main>
      <SiteFooter />
      <ChatWidget />
    </>
  );
}
