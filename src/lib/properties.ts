import type { ClientRequirements, Intent, PropertyListing, PropertyType } from "./types";
import { SAMPLE_PROPERTIES } from "./sampleProperties";
import { getDb, isMongoConfigured, PROPERTIES_COLLECTION } from "./mongodb";

/**
 * Inventory access layer, backed by MongoDB Atlas (MONGODB_URI). The bundled
 * Gurgaon dataset is auto-seeded into the collection the first time the app
 * runs against an empty database, so production starts working the moment
 * the env var exists — no manual import step. Without Mongo configured (or
 * if Atlas is unreachable) the same dataset serves as an in-process fallback,
 * so the consultant is never left without inventory.
 */
export async function fetchActiveProperties(): Promise<PropertyListing[]> {
  if (!isMongoConfigured()) return SAMPLE_PROPERTIES;
  try {
    const db = await getDb();
    const col = db.collection(PROPERTIES_COLLECTION);

    if ((await col.estimatedDocumentCount()) === 0) {
      await seedProperties(false);
    }

    const rows = await col.find({ active: true }).limit(500).toArray();
    const mapped = rows
      .map((r) => fromDoc(r as Record<string, unknown>))
      .filter((p): p is PropertyListing => !!p);
    return mapped.length > 0 ? mapped : SAMPLE_PROPERTIES;
  } catch {
    // Never let a database outage take the consultant down.
    return SAMPLE_PROPERTIES;
  }
}

/**
 * Upsert the bundled listings into MongoDB, keyed by their stable string
 * `_id` slug. With `overwrite`, existing rows are refreshed to the bundled
 * values; without it, only missing rows are inserted (agency edits persist).
 * Returns counts for reporting. Used by auto-seed and by /api/seed.
 */
export async function seedProperties(
  overwrite: boolean,
): Promise<{ inserted: number; updated: number; total: number }> {
  const db = await getDb();
  const col = db.collection(PROPERTIES_COLLECTION);
  const seededAt = new Date().toISOString();
  const ops = SAMPLE_PROPERTIES.map((p) => {
    const { id, ...fields } = p;
    const doc = { ...fields, seededAt };
    return {
      updateOne: {
        filter: { _id: id as never },
        update: overwrite ? { $set: doc } : { $setOnInsert: doc },
        upsert: true,
      },
    };
  });
  const res = await col.bulkWrite(ops, { ordered: false });
  const total = await col.countDocuments();
  return {
    inserted: res.upsertedCount,
    updated: res.modifiedCount,
    total,
  };
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

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v : null;
}

/** Map a MongoDB document (flexible shape) into a well-typed listing. */
function fromDoc(doc: Record<string, unknown>): PropertyListing | null {
  const priceCr = Number(doc.priceCr ?? doc.price_cr);
  const title = str(doc.title);
  if (!title || !Number.isFinite(priceCr) || priceCr <= 0) return null;
  const id = String(doc._id ?? doc.id ?? title);
  const possession =
    (doc.possession ?? "") === "Under construction" ? "Under construction" : "Ready to move";
  const rawIntent = Array.isArray(doc.intentFit ?? doc.intent_fit)
    ? ((doc.intentFit ?? doc.intent_fit) as unknown[])
    : [];
  const rawAmenities = Array.isArray(doc.amenities) ? (doc.amenities as unknown[]) : [];
  const propertyType = str(doc.propertyType ?? doc.property_type) ?? "Apartment";
  return {
    id,
    title,
    developer: str(doc.developer),
    city: str(doc.city) ?? "Gurugram",
    locality: str(doc.locality) ?? "",
    propertyType: PROPERTY_TYPES.includes(propertyType as PropertyType)
      ? (propertyType as PropertyType)
      : "Apartment",
    bhk: str(doc.bhk),
    priceCr,
    areaSqft: Number(doc.areaSqft ?? doc.area_sqft) || 0,
    possession,
    possessionDate: str(doc.possessionDate ?? doc.possession_date),
    intentFit: rawIntent.filter((i): i is Intent => INTENTS.includes(i as Intent)),
    amenities: rawAmenities.filter((a): a is string => typeof a === "string"),
    highlights: str(doc.highlights),
    reraId: str(doc.reraId ?? doc.rera_id),
    imageUrl: str(doc.imageUrl ?? doc.image_url),
    active: doc.active !== false,
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
  // Full marks at or comfortably within budget; taper for far-under-budget.
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
