import type { PropertyListing } from "./types";
import radianceListings from "@/data/radiance-listings.json";

/**
 * The real Radiance Realtors inventory (src/data/radiance-listings.json),
 * mirrored from radiancerealtors.com. This is the source of truth used to seed
 * MongoDB Atlas, and the in-process fallback if Atlas is briefly unreachable —
 * so the site and AI always work with genuine listings, never placeholder data.
 */
export const REAL_PROPERTIES: PropertyListing[] = (
  radianceListings as Array<Partial<PropertyListing> & { id: string; title: string }>
).map((p) => ({
  gallery: [],
  videoUrl: null,
  ...p,
})) as PropertyListing[];
