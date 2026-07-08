/**
 * White-label branding — override per client deployment via Vercel env vars
 * so the same codebase can be wired into any agency website.
 */
export const AGENCY_NAME =
  process.env.NEXT_PUBLIC_AGENCY_NAME ?? "Radiance Realtors";

export const ADVISOR_NAME = process.env.NEXT_PUBLIC_ADVISOR_NAME ?? "Ashirvad";

export const AGENCY_TAGLINE =
  process.env.NEXT_PUBLIC_AGENCY_TAGLINE ??
  "Find Your Dream Home & Smart Investments";

export const MARKET_REGION =
  process.env.NEXT_PUBLIC_MARKET_REGION ?? "Gurugram (Gurgaon)";

/** Localities/corridors the agency serves, comma-separated in env. */
export const SERVICE_AREAS = (
  process.env.NEXT_PUBLIC_SERVICE_AREAS ??
  "Golf Course Road, Golf Course Extension Road, Dwarka Expressway, Sohna Road, Southern Peripheral Road, New Gurugram, Sohna (South Gurugram), Goa"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Public contact details — real Radiance Realtors coordinates, env-overridable. */
export const CONTACT = {
  phone: process.env.NEXT_PUBLIC_PHONE ?? "+91-96 50 50 5010",
  phoneHref: process.env.NEXT_PUBLIC_PHONE_HREF ?? "+919650505010",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "919650505010",
  email: process.env.NEXT_PUBLIC_EMAIL ?? "info@radiancerealtors.com",
  website: process.env.NEXT_PUBLIC_WEBSITE ?? "https://www.radiancerealtors.com",
  facebook: "https://www.facebook.com/Radiancerealtors/",
  instagram: "https://www.instagram.com/radiancerealtors/",
  linkedin: "https://www.linkedin.com/company/radiance-realtors/",
} as const;

/** Main consultant model — Groq's strongest general model by default. */
export const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

/** Fast model used for per-turn structured requirement extraction. */
export const GROQ_EXTRACT_MODEL =
  process.env.GROQ_EXTRACT_MODEL ?? "llama-3.1-8b-instant";

/** Overridable so the backtest suite can point at a local mock server. */
export const GROQ_BASE_URL =
  process.env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1";
