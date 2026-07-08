/**
 * White-label branding — override per client deployment via Vercel env vars
 * so the same codebase can be wired into any agency website.
 */
export const AGENCY_NAME =
  process.env.NEXT_PUBLIC_AGENCY_NAME ?? "Horizon Estates";

export const ADVISOR_NAME = process.env.NEXT_PUBLIC_ADVISOR_NAME ?? "Aarav";

export const MARKET_REGION =
  process.env.NEXT_PUBLIC_MARKET_REGION ?? "Gurugram (Gurgaon)";

/** Localities/corridors the agency serves, comma-separated in env. */
export const SERVICE_AREAS = (
  process.env.NEXT_PUBLIC_SERVICE_AREAS ??
  "Golf Course Road, Golf Course Extension Road, Dwarka Expressway, Sohna Road, Southern Peripheral Road, New Gurugram, Sohna (South Gurugram)"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Main consultant model — Groq's strongest general model by default. */
export const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

/** Fast model used for per-turn structured requirement extraction. */
export const GROQ_EXTRACT_MODEL =
  process.env.GROQ_EXTRACT_MODEL ?? "llama-3.1-8b-instant";

/** Overridable so the backtest suite can point at a local mock server. */
export const GROQ_BASE_URL =
  process.env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1";
