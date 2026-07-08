import { groqJson, type GroqMessage } from "./groq";
import { MARKET_REGION } from "./config";
import {
  EMPTY_REQUIREMENTS,
  type ChatMessage,
  type ClientRequirements,
  type Intent,
  type LeadTemperature,
} from "./types";

const EXTRACT_SYSTEM = `You are the requirement-extraction engine behind a real-estate consultancy in ${MARKET_REGION}. Read the consultant↔client conversation and output ONE strict JSON object capturing everything the CLIENT has established so far. Only extract what the client actually said or clearly implied — never guess, never copy the consultant's suggestions as if the client said them. Use null (or [] for arrays) when genuinely unknown.

{
  "intent": "buy"|"rent"|"invest"|"unknown",
  "budgetLabel": string|null,   // human-readable, e.g. "₹1.5 – 2 Cr" or "Up to ₹90 L"
  "budgetMaxCr": number|null,   // ceiling in ₹ crore (90 lakh = 0.9). Convert carefully: 1 crore = 100 lakh.
  "budgetMinCr": number|null,   // floor in ₹ crore if a range was given
  "city": string|null,          // e.g. "Gurugram"
  "localities": string[],       // specific areas mentioned, e.g. ["Sector 65", "Golf Course Extension Road"]
  "propertyType": string|null,  // exactly one of: Apartment, Villa, Builder Floor, Plot, Penthouse, Commercial
  "bhk": string|null,           // e.g. "3 BHK"
  "minAreaSqft": number|null,
  "timeline": string|null,      // exactly one of: Ready to move, 1-3 months, 3-6 months, 6-12 months, Exploring
  "financing": string|null,     // exactly one of: Home loan, Self-funded, Not sure
  "purpose": string|null,       // exactly one of: End use, Investment, Rental income
  "possessionPref": string|null,// exactly one of: Ready to move, Under construction, No preference
  "mustHaves": string[],        // hard requirements, short phrases
  "niceToHaves": string[],
  "familyContext": string|null, // e.g. "family of 4, two school-age kids"
  "notes": string|null,         // one crisp consultant-relevant note, max 20 words
  "score": number,              // 0-100 buying readiness: +25 clear budget, +20 specific location, +15 configuration, +20 near-term timeline, +10 financing clarity, +10 buy/invest intent
  "temperature": "hot"|"warm"|"cold"|"new"  // hot>=75, warm 50-74, cold 25-49, new<25
}

For every enum field output exactly ONE value — never a list of options or "|" characters. Output only the JSON object.`;

/** Transcript rendered for the extractor. */
function transcript(messages: ChatMessage[]): string {
  return messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role === "assistant" ? "Consultant" : "Client"}: ${m.content}`)
    .join("\n");
}

const INTENTS: Intent[] = ["buy", "rent", "invest", "unknown"];
const TEMPS: LeadTemperature[] = ["hot", "warm", "cold", "new"];

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}
function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
function strArr(v: unknown): string[] {
  return Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string" && !!x.trim()).map((x) => x.trim())
    : [];
}

/**
 * Coerce whatever the model returned into a well-typed ClientRequirements —
 * bad fields degrade to "unknown" individually instead of poisoning the rest.
 */
function normalize(raw: Record<string, unknown>): ClientRequirements {
  const intent = INTENTS.includes(raw.intent as Intent) ? (raw.intent as Intent) : "unknown";
  const temperature = TEMPS.includes(raw.temperature as LeadTemperature)
    ? (raw.temperature as LeadTemperature)
    : "new";
  const score = Math.max(0, Math.min(100, num(raw.score) ?? 0));
  return {
    intent,
    budgetLabel: str(raw.budgetLabel),
    budgetMaxCr: num(raw.budgetMaxCr),
    budgetMinCr: num(raw.budgetMinCr),
    city: str(raw.city),
    localities: strArr(raw.localities),
    propertyType: str(raw.propertyType),
    bhk: str(raw.bhk),
    minAreaSqft: num(raw.minAreaSqft),
    timeline: str(raw.timeline),
    financing: str(raw.financing),
    purpose: str(raw.purpose),
    possessionPref: str(raw.possessionPref),
    mustHaves: strArr(raw.mustHaves),
    niceToHaves: strArr(raw.niceToHaves),
    familyContext: str(raw.familyContext),
    notes: str(raw.notes),
    score,
    temperature,
  };
}

/**
 * Merge a fresh extraction over the previous state. The extractor sees the
 * full transcript so its output is authoritative, but if it returns null for
 * something previously known (model wobble), the previous value is kept —
 * requirements only accumulate, they never silently vanish mid-conversation.
 */
function merge(prev: ClientRequirements, next: ClientRequirements): ClientRequirements {
  return {
    intent: next.intent !== "unknown" ? next.intent : prev.intent,
    budgetLabel: next.budgetLabel ?? prev.budgetLabel,
    budgetMaxCr: next.budgetMaxCr ?? prev.budgetMaxCr,
    budgetMinCr: next.budgetMinCr ?? prev.budgetMinCr,
    city: next.city ?? prev.city,
    localities: next.localities.length ? next.localities : prev.localities,
    propertyType: next.propertyType ?? prev.propertyType,
    bhk: next.bhk ?? prev.bhk,
    minAreaSqft: next.minAreaSqft ?? prev.minAreaSqft,
    timeline: next.timeline ?? prev.timeline,
    financing: next.financing ?? prev.financing,
    purpose: next.purpose ?? prev.purpose,
    possessionPref: next.possessionPref ?? prev.possessionPref,
    mustHaves: next.mustHaves.length ? next.mustHaves : prev.mustHaves,
    niceToHaves: next.niceToHaves.length ? next.niceToHaves : prev.niceToHaves,
    familyContext: next.familyContext ?? prev.familyContext,
    notes: next.notes ?? prev.notes,
    score: Math.max(next.score, prev.score),
    temperature: next.score >= prev.score ? next.temperature : prev.temperature,
  };
}

/**
 * Extract the client's requirements from the conversation so far. Failure is
 * non-fatal by design: on any error the previous requirements are returned
 * unchanged so the chat itself never breaks because extraction hiccuped.
 */
export async function extractRequirements(
  messages: ChatMessage[],
  prev: ClientRequirements = EMPTY_REQUIREMENTS,
): Promise<ClientRequirements> {
  const convo = transcript(messages);
  if (!convo.trim()) return prev;

  const groqMessages: GroqMessage[] = [
    { role: "system", content: EXTRACT_SYSTEM },
    {
      role: "user",
      content: `Conversation transcript:\n\n${convo}\n\nReturn the single JSON object now.`,
    },
  ];

  try {
    const raw = await groqJson<Record<string, unknown>>(groqMessages);
    if (!raw) return prev;
    return merge(prev, normalize(raw));
  } catch {
    return prev;
  }
}
