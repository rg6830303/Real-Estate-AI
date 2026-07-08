export type Role = "user" | "assistant" | "system";

export type Intent = "buy" | "rent" | "invest" | "unknown";

export type LeadTemperature = "hot" | "warm" | "cold" | "new";

export interface ChatMessage {
  role: Role;
  content: string;
  /** Present when this turn surfaced matched inventory to the client. */
  propertyIds?: string[];
}

/**
 * The consultant's live understanding of the client, refreshed every turn by
 * the extraction model. `null` = genuinely not yet known. This object is the
 * single source of truth for what has been discovered so far — it drives
 * property matching, the requirements panel in the UI, and the consultant's
 * own awareness of what still needs to be asked.
 */
export interface ClientRequirements {
  intent: Intent;
  budgetLabel: string | null; // human-readable, e.g. "₹1.5 – 2 Cr"
  budgetMaxCr: number | null; // numeric ceiling in ₹ crore
  budgetMinCr: number | null; // numeric floor in ₹ crore, if a range was given
  city: string | null; // e.g. "Gurugram"
  localities: string[]; // preferred areas, e.g. ["Sector 65", "Golf Course Ext Rd"]
  propertyType: string | null; // Apartment | Villa | Builder Floor | Plot | Commercial
  bhk: string | null; // e.g. "3 BHK"
  minAreaSqft: number | null;
  timeline: string | null; // Ready to move | 1-3 months | 3-6 months | 6-12 months | Exploring
  financing: string | null; // Home loan | Self-funded | Not sure
  purpose: string | null; // End use | Investment | Rental income
  possessionPref: string | null; // Ready to move | Under construction | No preference
  mustHaves: string[]; // e.g. ["gated community", "near metro", "school nearby"]
  niceToHaves: string[];
  familyContext: string | null; // e.g. "family of 4, two school-age kids, elderly parents"
  notes: string | null; // any other consultant-relevant detail
  score: number; // 0-100 qualification / readiness score
  temperature: LeadTemperature;
}

export const EMPTY_REQUIREMENTS: ClientRequirements = {
  intent: "unknown",
  budgetLabel: null,
  budgetMaxCr: null,
  budgetMinCr: null,
  city: null,
  localities: [],
  propertyType: null,
  bhk: null,
  minAreaSqft: null,
  timeline: null,
  financing: null,
  purpose: null,
  possessionPref: null,
  mustHaves: [],
  niceToHaves: [],
  familyContext: null,
  notes: null,
  score: 0,
  temperature: "new",
};

export type PropertyType =
  | "Apartment"
  | "Villa"
  | "Builder Floor"
  | "Plot"
  | "Penthouse"
  | "Commercial";

export interface PropertyListing {
  id: string;
  title: string;
  developer: string | null;
  city: string;
  locality: string;
  propertyType: PropertyType;
  bhk: string | null; // null for Plot / Commercial
  priceCr: number; // price in ₹ crore
  areaSqft: number;
  possession: "Ready to move" | "Under construction";
  possessionDate: string | null; // e.g. "Dec 2026" when under construction
  intentFit: Intent[];
  amenities: string[];
  highlights: string | null; // one-line consultant note on why this stands out
  reraId: string | null;
  imageUrl: string | null;
  active: boolean;
}

/** Events streamed from /api/chat as newline-delimited JSON. */
export type ChatStreamEvent =
  | { type: "text"; delta: string }
  | {
      type: "state";
      requirements: ClientRequirements;
      properties: PropertyListing[];
    }
  /** Discard all streamed text for this turn and show `text` instead. */
  | { type: "replace"; text: string }
  | { type: "error"; message: string }
  | { type: "done" };
