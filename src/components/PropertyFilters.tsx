"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import type { PropertyListing } from "@/lib/types";
import { BUILDERS, LOCATIONS } from "@/lib/site";
import { formatPriceCr } from "@/lib/format";
import PropertyCard from "./PropertyCard";

const TYPES = [
  { label: "All types", value: "" },
  { label: "Residential", value: "residential" },
  { label: "Commercial", value: "commercial" },
  { label: "SCO", value: "sco" },
  { label: "Leasing", value: "leasing" },
];

const RESIDENTIAL = new Set(["Apartment", "Builder Floor", "Villa", "Penthouse", "Plot"]);

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function matchesType(p: PropertyListing, type: string): boolean {
  if (!type) return true;
  if (type === "residential") return RESIDENTIAL.has(p.propertyType);
  if (type === "commercial" || type === "sco" || type === "leasing")
    return p.propertyType === "Commercial";
  return true;
}

function matchesBuilder(p: PropertyListing, builder: string): boolean {
  if (!builder) return true;
  const dev = slug(p.developer ?? "");
  const loc = slug(p.locality);
  if (builder === "central-park-flower-valley")
    return loc.includes("flower-valley") || loc.includes("sohna");
  // Match on the first token of the builder slug (e.g. "elan" ⊂ "elan-group").
  const root = builder.split("-")[0];
  return dev.includes(root) || dev.includes(builder);
}

function matchesLocation(p: PropertyListing, location: string): boolean {
  if (!location) return true;
  const hay = slug(`${p.city} ${p.locality}`);
  if (location === "gurgaon") return hay.includes("gurugram") || hay.includes("gurgaon");
  return hay.includes(location.replace(/-/g, "-")) || hay.includes(location.split("-")[0]);
}

export default function PropertyFilters({ listings }: { listings: PropertyListing[] }) {
  const params = useSearchParams();
  const [type, setType] = useState(params.get("type") ?? "");
  const [builder, setBuilder] = useState(params.get("builder") ?? "");
  const [location, setLocation] = useState(params.get("location") ?? "");
  const [possession, setPossession] = useState("");
  const [maxPrice, setMaxPrice] = useState(25);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings
      .filter(
        (p) =>
          matchesType(p, type) &&
          matchesBuilder(p, builder) &&
          matchesLocation(p, location) &&
          (!possession || p.possession === possession) &&
          p.priceCr <= maxPrice &&
          (!q ||
            p.title.toLowerCase().includes(q) ||
            (p.developer ?? "").toLowerCase().includes(q) ||
            p.locality.toLowerCase().includes(q)),
      )
      .sort((a, b) => b.priceCr - a.priceCr);
  }, [listings, type, builder, location, possession, maxPrice, query]);

  const selectCls =
    "w-full rounded-lg border border-ink-950/15 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500";

  return (
    <>
      {/* Filter bar */}
      <div className="rounded-2xl border border-ink-950/10 bg-white p-4 shadow-card sm:p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-950">
          <SlidersHorizontal className="h-4 w-4 text-brand-600" strokeWidth={1.75} />
          Filter properties
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-950/50">
              Type
            </span>
            <select value={type} onChange={(e) => setType(e.target.value)} className={selectCls}>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-950/50">
              Builder
            </span>
            <select
              value={builder}
              onChange={(e) => setBuilder(e.target.value)}
              className={selectCls}
            >
              <option value="">All builders</option>
              {BUILDERS.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-950/50">
              Location
            </span>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={selectCls}
            >
              <option value="">All locations</option>
              {LOCATIONS.map((l) => (
                <option key={l.slug} value={l.slug}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-950/50">
              Possession
            </span>
            <select
              value={possession}
              onChange={(e) => setPossession(e.target.value)}
              className={selectCls}
            >
              <option value="">Any status</option>
              <option value="Ready to move">Ready to move</option>
              <option value="Under construction">Under construction</option>
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="block">
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink-950/50">
              Max budget: {maxPrice >= 25 ? "No limit" : formatPriceCr(maxPrice)}
            </span>
            <input
              type="range"
              min={0.5}
              max={25}
              step={0.25}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-950/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search project, builder, sector…"
              className="w-full rounded-lg border border-ink-950/15 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-brand-500 sm:w-72"
            />
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-ink-950/60">
        Showing <span className="font-semibold text-ink-950">{filtered.length}</span> of{" "}
        {listings.length} verified properties
      </p>

      {filtered.length > 0 ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard key={p.id} listing={p} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-ink-950/15 bg-white p-10 text-center">
          <p className="text-sm font-medium text-ink-950">No properties match these filters yet.</p>
          <p className="mt-1 text-sm text-ink-950/55">
            Try widening your budget or clearing a filter — or ask our AI consultant for tailored
            options.
          </p>
        </div>
      )}
    </>
  );
}
