import type { PropertyListing } from "./types";
import gurgaonListings from "@/data/gurgaon-listings.json";

/**
 * Bundled fallback inventory: the same 20 real Gurgaon listings that are
 * auto-seeded into MongoDB (src/data/gurgaon-listings.json). Used until
 * MONGODB_URI is configured, and as a safety net if Atlas is unreachable —
 * the consultant always has genuine inventory to work from.
 *
 * Prices are indicative July 2026 market levels for these projects; the
 * agency should keep the database rows current as deals move.
 */
export const SAMPLE_PROPERTIES: PropertyListing[] = (
  gurgaonListings as Array<Partial<PropertyListing> & { id: string; title: string }>
).map((p) => ({
  gallery: [],
  videoUrl: null,
  ...p,
})) as PropertyListing[];
