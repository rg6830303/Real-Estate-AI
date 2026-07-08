import { BadgeCheck, Home, MapPin, Ruler } from "lucide-react";
import type { PropertyListing } from "@/lib/types";
import { formatArea, formatPriceCr } from "@/lib/format";

export default function PropertyCard({ listing }: { listing: PropertyListing }) {
  return (
    <div className="w-full min-w-0 animate-riseIn rounded-xl border border-ink-950/10 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-950">
            {listing.title}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-950/60">
            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            <span className="truncate">
              {listing.locality}
              {listing.city && !listing.locality.includes(listing.city)
                ? `, ${listing.city}`
                : ""}
            </span>
          </p>
        </div>
        <p className="shrink-0 rounded-lg bg-ink-950 px-2.5 py-1 text-sm font-semibold text-gold-300">
          {formatPriceCr(listing.priceCr)}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-950/70">
        <span className="inline-flex items-center gap-1">
          <Home className="h-3.5 w-3.5" strokeWidth={1.75} />
          {listing.bhk ? `${listing.bhk} ` : ""}
          {listing.propertyType}
        </span>
        <span className="inline-flex items-center gap-1">
          <Ruler className="h-3.5 w-3.5" strokeWidth={1.75} />
          {formatArea(listing.areaSqft)}
        </span>
        <span
          className={
            listing.possession === "Ready to move"
              ? "rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand-700"
              : "rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700"
          }
        >
          {listing.possession === "Ready to move"
            ? "Ready to move"
            : `Possession ${listing.possessionDate ?? "TBA"}`}
        </span>
      </div>

      {listing.highlights ? (
        <p className="mt-2.5 border-l-2 border-gold-400 pl-2 text-xs italic leading-relaxed text-ink-950/70">
          {listing.highlights}
        </p>
      ) : null}

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {listing.amenities.slice(0, 4).map((a) => (
          <span
            key={a}
            className="rounded-full border border-ink-950/10 bg-[#f4f6f9] px-2 py-0.5 text-[11px] text-ink-950/65"
          >
            {a}
          </span>
        ))}
        {listing.reraId ? (
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-brand-600">
            <BadgeCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
            RERA verified
          </span>
        ) : null}
      </div>
    </div>
  );
}
