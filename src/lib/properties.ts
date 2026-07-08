import type { ClientRequirements, Intent, PropertyListing, PropertyType } from "./types";
import { REAL_PROPERTIES } from "./realProperties";
import { getDb, isMongoConfigured, PROPERTIES_COLLECTION } from "./mongodb";

/**
 * Inventory access layer, backed by MongoDB Atlas (MONGODB_URI). The bundled
 * Gurgaon dataset is auto-seeded into the collection the first time the app
 * runs against an empty database, so production starts working the moment
 * the env var exists — no manual import step. Without Mongo configured (or
 * if Atlas is unreachable) the same dataset serves as an in-process fallback,
 * so the consultant is never left without inventory.
 */
// Ensures the retired demo rows are cleared once per serverless instance, so a
// database that was seeded with the old sample data self-cleans on redeploy —
// no manual step required.
let legacyPurgedThisInstance = false;

export async function fetchActiveProperties(): Promise<PropertyListing[]> {
  if (!isMongoConfigured()) return REAL_PROPERTIES;
  try {
    const db = await getDb();
    const col = db.collection(PROPERTIES_COLLECTION);

    if (!legacyPurgedThisInstance) {
      legacyPurgedThisInstance = true;
      await col.deleteMany({ _id: { $in: LEGACY_SEED_IDS as never[] } });
    }

    if ((await col.estimatedDocumentCount()) === 0) {
      await seedProperties(false);
    }

    const rows = await col.find({ active: true }).limit(500).toArray();
    const mapped = rows
      .map((r) => fromDoc(r as Record<string, unknown>))
      .filter((p): p is PropertyListing => !!p);
    return mapped.length > 0 ? mapped : REAL_PROPERTIES;
  } catch {
    // Never let a database outage take the consultant down.
    return REAL_PROPERTIES;
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
): Promise<{ inserted: number; updated: number; removed: number; total: number }> {
  const db = await getDb();
  const col = db.collection(PROPERTIES_COLLECTION);
  // Always remove the retired demo/sample rows so the DB holds real data only.
  const removed = (await col.deleteMany({ _id: { $in: LEGACY_SEED_IDS as never[] } }))
    .deletedCount;
  const seededAt = new Date().toISOString();
  const ops = REAL_PROPERTIES.map((p) => {
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
    removed,
    total,
  };
}

/**
 * Stable `_id`s of the earlier placeholder Gurgaon dataset (Sobha City, Godrej
 * Meridien, …). These are deleted on every seed and by the admin "Clean demo
 * data" action so no fake inventory can linger in the client's database.
 */
export const LEGACY_SEED_IDS: string[] = [
  "sobha-city-s108",
  "godrej-meridien-s106",
  "ats-tourmaline-s109",
  "m3m-golf-estate-s65",
  "m3m-heights-s65",
  "emaar-emerald-hills-s65",
  "emaar-urban-ascent-s112",
  "dlf-the-arbour-s63",
  "tulip-violet-s69",
  "signature-global-city92",
  "signature-global-park-sohna",
  "smart-world-orchard-s61",
  "whiteland-the-aspen-s76",
  "bestech-park-view-grand-spa-s81",
  "vatika-gurgaon21-s83",
  "pioneer-park-s61",
  "central-park-resorts-s48",
  "dlf-new-town-heights-s90",
  "godrej-aria-s79",
  "adani-samsara-vilasa-s63",
];

/** Delete any retired demo rows. Returns how many were removed. */
export async function purgeLegacySeed(): Promise<number> {
  const db = await getDb();
  const col = db.collection(PROPERTIES_COLLECTION);
  const res = await col.deleteMany({ _id: { $in: LEGACY_SEED_IDS as never[] } });
  return res.deletedCount;
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
  const rawGallery = Array.isArray(doc.gallery) ? (doc.gallery as unknown[]) : [];
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
    gallery: rawGallery.filter((g): g is string => typeof g === "string" && !!g.trim()),
    videoUrl: str(doc.videoUrl ?? doc.video_url),
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

/**
 * Enough discovered to attempt a shortlist at all? The consultant runs a
 * standard discovery first, so we only surface matches once we know the
 * location, a budget ceiling, AND a configuration/type — mirroring when a
 * human consultant would actually start shortlisting.
 */
export function hasEnoughSignal(r: ClientRequirements): boolean {
  const hasLocation = !!r.city || r.localities.length > 0;
  const hasBudget = r.budgetMaxCr != null && r.budgetMaxCr > 0;
  const hasConfig = !!r.bhk || !!r.propertyType;
  return hasLocation && hasBudget && hasConfig;
}

// ---------------------------------------------------------------------------
// Admin CRUD — used only by the password-protected admin console. These read
// and write the same `properties` collection the site and AI consultant use,
// so every change is reflected everywhere on the next request (realtime).
// ---------------------------------------------------------------------------

export interface AdminPropertyInput {
  id?: string | null;
  title: string;
  developer?: string | null;
  city: string;
  locality: string;
  propertyType: string;
  bhk?: string | null;
  priceCr: number;
  areaSqft?: number;
  possession?: string;
  possessionDate?: string | null;
  intentFit?: string[];
  amenities?: string[];
  highlights?: string | null;
  reraId?: string | null;
  imageUrl?: string | null;
  gallery?: string[];
  videoUrl?: string | null;
  active?: boolean;
}

function slugId(title: string, city: string): string {
  const base = `${title}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `listing-${Date.now()}`;
}

/** Every listing (active + inactive), sorted by city then title. */
export async function listAllProperties(): Promise<PropertyListing[]> {
  const db = await getDb();
  const rows = await db.collection(PROPERTIES_COLLECTION).find({}).limit(2000).toArray();
  return rows
    .map((r) => fromDoc(r as Record<string, unknown>))
    .filter((p): p is PropertyListing => !!p)
    .sort((a, b) => a.city.localeCompare(b.city) || a.title.localeCompare(b.title));
}

export async function getProperty(id: string): Promise<PropertyListing | null> {
  const db = await getDb();
  const row = await db.collection(PROPERTIES_COLLECTION).findOne({ _id: id as never });
  return row ? fromDoc(row as Record<string, unknown>) : null;
}

/** Distinct city names present in the database. */
export async function distinctCities(): Promise<string[]> {
  const db = await getDb();
  const cities = (await db.collection(PROPERTIES_COLLECTION).distinct("city")) as unknown[];
  return cities.filter((c): c is string => typeof c === "string" && !!c.trim()).sort();
}

/** Create or update a listing. Returns the stored id. */
export async function upsertProperty(input: AdminPropertyInput): Promise<string> {
  const title = (input.title ?? "").trim();
  const city = (input.city ?? "").trim();
  const priceCr = Number(input.priceCr);
  if (!title) throw new Error("Title is required.");
  if (!city) throw new Error("City is required.");
  if (!Number.isFinite(priceCr) || priceCr <= 0)
    throw new Error("A valid price (₹ Cr) is required.");

  const db = await getDb();
  const col = db.collection(PROPERTIES_COLLECTION);

  let id = (input.id ?? "").trim();
  if (!id) {
    id = slugId(title, city);
    // Avoid clobbering an existing listing when creating a new one.
    if (await col.findOne({ _id: id as never }))
      id = `${id}-${Date.now().toString(36).slice(-4)}`;
  }

  const propType = PROPERTY_TYPES.includes(input.propertyType as PropertyType)
    ? input.propertyType
    : "Apartment";

  const doc = {
    title,
    developer: (input.developer ?? "").trim() || null,
    city,
    locality: (input.locality ?? "").trim(),
    propertyType: propType,
    bhk: (input.bhk ?? "").trim() || null,
    priceCr,
    areaSqft: Number(input.areaSqft) || 0,
    possession:
      input.possession === "Under construction" ? "Under construction" : "Ready to move",
    possessionDate: (input.possessionDate ?? "").trim() || null,
    intentFit: (input.intentFit ?? []).filter((i) => INTENTS.includes(i as Intent)),
    amenities: (input.amenities ?? []).map((a) => a.trim()).filter(Boolean),
    highlights: (input.highlights ?? "").trim() || null,
    reraId: (input.reraId ?? "").trim() || null,
    imageUrl: (input.imageUrl ?? "").trim() || null,
    gallery: (input.gallery ?? []).map((g) => g.trim()).filter(Boolean),
    videoUrl: (input.videoUrl ?? "").trim() || null,
    active: input.active !== false,
    updatedAt: new Date().toISOString(),
  };

  await col.updateOne({ _id: id as never }, { $set: doc }, { upsert: true });
  return id;
}

export async function deleteProperty(id: string): Promise<boolean> {
  const db = await getDb();
  const res = await db.collection(PROPERTIES_COLLECTION).deleteOne({ _id: id as never });
  return res.deletedCount > 0;
}
