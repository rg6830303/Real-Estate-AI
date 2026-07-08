import type { PropertyListing } from "./types";

/**
 * Output-side safety net. The 70B Groq model follows the consultant brief far
 * more reliably than a small local model, so these checks are deliberately
 * narrow — they only catch the failure modes that would genuinely embarrass
 * an agency in front of a client.
 */

// An unfilled template placeholder like "[Project Name]" — the single
// strongest signal the model improvised a fake listing template.
const PLACEHOLDER_BRACKET_RE = /\[[A-Za-z][a-zA-Z ]{1,30}\]/;

// Breaking persona ("as an AI language model...").
const AI_DISCLOSURE_RE =
  /\bas an ai\b|\bi(?:'m| am) an ai\b|\blanguage model\b|\bi do not have access to real[- ]time\b/i;

// Complying with an unrelated task instead of staying a consultant.
const OFF_TOPIC_COMPLIANCE_RE =
  /```|\bdef\s+\w+\(|\bimport\s+(?:requests|bs4|scrapy|pandas)\b|\bonce upon a time\b/i;

export function replyViolates(text: string): boolean {
  return (
    PLACEHOLDER_BRACKET_RE.test(text) ||
    AI_DISCLOSURE_RE.test(text) ||
    OFF_TOPIC_COMPLIANCE_RE.test(text)
  );
}

/**
 * Safe fallback when a generated reply trips a guardrail: acknowledges and
 * keeps the discovery moving without repeating whatever the model almost said.
 */
export function safeFallbackReply(): string {
  return "That's helpful to know — thank you for sharing it. To make sure I shortlist the right options for you, could you tell me a little more about the location you'd prefer and the budget range you're comfortable with?";
}

/**
 * Did the reply name a "project-looking" proper noun that isn't in the
 * verified set shown to this client? Used by the backtest suite as a
 * hallucination detector, and available to the route as defense in depth.
 */
const PROJECT_NAME_RE =
  /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Towers?|Heights|Residenc(?:y|es)|Park|Greens|Enclave|Estates?|Gardens|Homes|Apartments|Vista|Court|Villas?|Floors?)\b/g;

export function unverifiedProjectMentions(
  text: string,
  verified: PropertyListing[],
): string[] {
  const matches = text.match(PROJECT_NAME_RE) ?? [];
  const known = verified.map((p) => p.title.toLowerCase());
  return matches.filter((m) => {
    const lower = m.toLowerCase();
    return !known.some((t) => t.includes(lower) || lower.includes(t));
  });
}
