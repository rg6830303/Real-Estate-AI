import Link from "next/link";
import clsx from "clsx";
import PropertyCard from "./PropertyCard";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import ChatWidget from "./ChatWidget";
import { ADVISOR_NAME } from "@/lib/config";
import { fetchActiveProperties } from "@/lib/properties";
import type { PropertyListing } from "@/lib/types";

/** Mirrors the live site's /properties/location/* and /properties/type/* filters. */
export const LOCATIONS = [
  { slug: "gurgaon", label: "Gurgaon", match: (p: PropertyListing) => /gurugram|gurgaon/i.test(p.city) },
  { slug: "delhi", label: "Delhi", match: (p: PropertyListing) => /delhi/i.test(p.city) },
  { slug: "goa", label: "Goa", match: (p: PropertyListing) => /goa/i.test(p.city) },
] as const;

export const TYPES = [
  { slug: "apartment", label: "Apartments", match: (p: PropertyListing) => p.propertyType === "Apartment" || p.propertyType === "Penthouse" },
  { slug: "builder-floor", label: "Builder Floors", match: (p: PropertyListing) => p.propertyType === "Builder Floor" },
  { slug: "villa", label: "Villas", match: (p: PropertyListing) => p.propertyType === "Villa" },
  { slug: "plot", label: "Plots", match: (p: PropertyListing) => p.propertyType === "Plot" },
  { slug: "sco", label: "SCO / Commercial", match: (p: PropertyListing) => p.propertyType === "Commercial" },
] as const;

export default async function PropertiesBrowser({
  location,
  type,
}: {
  location?: string;
  type?: string;
}) {
  const all = await fetchActiveProperties();
  const loc = LOCATIONS.find((l) => l.slug === location);
  const typ = TYPES.find((t) => t.slug === type);
  const filtered = all.filter(
    (p) => (!loc || loc.match(p)) && (!typ || typ.match(p)),
  );

  const chip = (active: boolean) =>
    clsx(
      "rounded-full border px-4 py-1.5 text-sm transition",
      active
        ? "border-gold-500 bg-ink-950 font-semibold text-gold-300"
        : "border-ink-950/15 bg-white text-ink-950/70 hover:border-gold-500 hover:text-ink-950",
    );

  return (
    <>
      <SiteHeader />
      <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
          Verified inventory
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-950">
          Properties
          {loc ? ` in ${loc.label}` : ""}
          {typ ? ` — ${typ.label}` : ""}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-950/60">
          Every listing below is verified inventory — the same database{" "}
          {ADVISOR_NAME} recommends from. Prices are indicative; our team
          confirms exact current pricing and availability.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Link href="/properties" className={chip(!loc && !typ)}>
            All
          </Link>
          {LOCATIONS.map((l) => (
            <Link
              key={l.slug}
              href={`/properties/location/${l.slug}`}
              className={chip(loc?.slug === l.slug)}
            >
              {l.label}
            </Link>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-ink-950/15 sm:block" />
          {TYPES.map((t) => (
            <Link
              key={t.slug}
              href={`/properties/type/${t.slug}`}
              className={chip(typ?.slug === t.slug)}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Link
                key={p.id}
                href={`/property-detail/${p.id}`}
                className="block transition hover:-translate-y-0.5"
              >
                <PropertyCard listing={p} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-ink-950/20 bg-white p-10 text-center">
            <p className="text-sm font-medium text-ink-950">
              Our {loc?.label ?? ""} portfolio is curated on request.
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-950/60">
              Tell {ADVISOR_NAME} what you're looking for and our team will
              personally share current options
              {loc ? ` in ${loc.label}` : ""}.
            </p>
            <Link
              href="/consultant"
              className="mt-5 inline-block rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
            >
              Chat with {ADVISOR_NAME}
            </Link>
          </div>
        )}
      </main>
      <SiteFooter />
      <ChatWidget />
    </>
  );
}
