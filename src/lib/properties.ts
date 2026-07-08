import type { ClientRequirements, Intent, PropertyListing, PropertyType } from "./types";
import { SAMPLE_PROPERTIES } from "./sampleProperties";

/**
 * Inventory access layer. When Supabase env vars are configured (production),
 * listings come live from the `properties` table via Supabase's REST API —
 * no extra SDK dependency needed. Without them (local dev, demos, backtests)
 * it falls back to the bundled sample inventory so the app always works.
 */
export async function fetchActiveProperties(): Promise<PropertyListing[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return SAMPLE_PROPERTIES;

  try {
    const res = await fetch(
      `${url}/rest/v1/properties?active=eq.true&select=*&limit=500`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        // Listings change rarely relative to chat traffic; a short cache
        // keeps per-message latency down without going stale.
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) throw new Error(`Supabase ${res.status}`);
    const rows = (await res.json()) as SupabasePropertyRow[];
    const mapped = rows.map(fromRow).filter((p): p is PropertyListing => !!p);
    return mapped.length > 0 ? mapped : SAMPLE_PROPERTIES;
  } catch {
    // Never let an inventory outage take the consultant down.
    return SAMPLE_PROPERTIES;
  }
}

/** Row shape of the `properties` table in supabase/schema.sql. */
interface SupabasePropertyRow {
  id: string;
  title: string;
  city: string;
  locality: string;
  property_type: string;
  bhk: string | null;
  price_cr: number | string;
  area_sqft: number;
  possession: string;
  possession_date: string | null;
  intent_fit: string[] | null;
  amenities: string[] | null;
  highlights: string | null;
  rera_id: string | null;
  image_url: string | null;
  active: boolean;
}

const PROPERTY_TYPES: PropertyType[] = [
  "Apartment",
  "Villa",
  "Builder Floor",
  "Plot",
  "Penthouse",
  "Commercial",
];
const INTENTS: Intent[] = ["buy", "rent", "invest"];

function fromRow(row: SupabasePropertyRow): PropertyListing | null {
  const priceCr = Number(row.price_cr);
  if (!row.id || !row.title || !Number.isFinite(priceCr)) return null;
  return {
    id: row.id,
    title: row.title,
    city: row.city ?? "",
    locality: row.locality ?? "",
    propertyType: PROPERTY_TYPES.includes(row.property_type as PropertyType)
      ? (row.property_type as PropertyType)
      : "Apartment",
    bhk: row.bhk,
    priceCr,
    areaSqft: Number(row.area_sqft) || 0,
    possession:
      row.possession === "Under construction" ? "Under construction" : "Ready to move",
    possessionDate: row.possession_date,
    intentFit: (row.intent_fit ?? []).filter((i): i is Intent =>
      INTENTS.includes(i as Intent),
    ),
    amenities: row.amenities ?? [],
    highlights: row.highlights,
    reraId: row.rera_id,
    imageUrl: row.image_url,
    active: row.active,
  };
}

// ---------------------------------------------------------------------------
// Deterministic matching — plain arithmetic, no model call, so a recommended
// listing can never be hallucinated and always genuinely fits the profile.
// ---------------------------------------------------------------------------

const STOPWORDS = new Set(["sector", "the", "in", "at", "near", "ncr", "road", "extension"]);

// Buyers overwhelmingly type the colloquial pre-rename city names.
const SYNONYMS: Record<string, string> = {
  gurgaon: "gurugram",
  ggn: "gurugram",
};

export function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t && !STOPWORDS.has(t))
    .map((t) => SYNONYMS[t] ?? t);
}

function locationScore(r: ClientRequirements, p: PropertyListing): number {
  const queryText = [r.city ?? "", ...r.localities].join(" ");
  const qTokens = new Set(tokens(queryText));
  if (qTokens.size === 0) return 0;
  const target = new Set([...tokens(p.locality), ...tokens(p.city)]);
  let hits = 0;
  for (const t of qTokens) if (target.has(t)) hits++;
  if (hits === 0) return 0;
  return Math.min(40, Math.round((hits / qTokens.size) * 40));
}

function bhkScore(r: ClientRequirements, p: PropertyListing): number {
  if (!r.bhk || !p.bhk) return 0;
  const q = Number(r.bhk.match(/\d+/)?.[0]);
  const l = Number(p.bhk.match(/\d+/)?.[0]);
  if (!q || !l) return 0;
  if (q === l) return 25;
  if (Math.abs(q - l) === 1) return 10;
  return 0;
}

function budgetScore(r: ClientRequirements, p: PropertyListing): number {
  if (r.budgetMaxCr == null || r.budgetMaxCr <= 0) return 0;
  const ratio = p.priceCr / r.budgetMaxCr;
  // Full marks at or comfortably within budget (up to 15% stretch, which a
  // consultant would legitimately still show); taper for far-under-budget.
  if (ratio > 1.15 || ratio < 0.4) return 0;
  return ratio >= 0.7 ? 20 : 10;
}

function typeScore(r: ClientRequirements, p: PropertyListing): number {
  if (!r.propertyType) return 0;
  return r.propertyType.toLowerCase() === p.propertyType.toLowerCase() ? 10 : 0;
}

function intentScore(r: ClientRequirements, p: PropertyListing): number {
  if (r.intent === "unknown" || p.intentFit.length === 0) return 0;
  return p.intentFit.includes(r.intent) ? 5 : 0;
}

function possessionScore(r: ClientRequirements, p: PropertyListing): number {
  if (!r.possessionPref || r.possessionPref === "No preference") return 0;
  return r.possessionPref === p.possession ? 5 : 0;
}

export interface ScoredListing {
  listing: PropertyListing;
  score: number;
}

/**
 * Score every active listing against the client profile; return the top
 * matches. The minimum-score threshold means a barely-known client never gets
 * a shaky "match" — no results until there is real signal (location + budget
 * or configuration), exactly when a human consultant would start shortlisting.
 */
export function matchProperties(
  requirements: ClientRequirements,
  inventory: PropertyListing[],
  limit = 3,
): PropertyListing[] {
  const MIN_SCORE = 45;
  // Hard budget ceiling: a consultant may show up to ~15% above stated
  // budget, never more — regardless of how well everything else fits.
  const maxPrice =
    requirements.budgetMaxCr != null && requirements.budgetMaxCr > 0
      ? requirements.budgetMaxCr * 1.15
      : Infinity;
  return inventory
    .filter((p) => p.active && p.priceCr <= maxPrice)
    .map((listing) => ({
      listing,
      score:
        locationScore(requirements, listing) +
        bhkScore(requirements, listing) +
        budgetScore(requirements, listing) +
        typeScore(requirements, listing) +
        intentScore(requirements, listing) +
        possessionScore(requirements, listing),
    }))
    .filter((s) => s.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.listing);
}

/** Enough discovered to attempt a shortlist at all? */
export function hasEnoughSignal(r: ClientRequirements): boolean {
  const hasLocation = !!r.city || r.localities.length > 0;
  return hasLocation && (!!r.bhk || r.budgetMaxCr != null);
}
