import { CONTACT } from "./config";
import { formatPriceCr } from "./format";
import type { ClientRequirements, PropertyListing } from "./types";

/** Human-readable profile the team receives (email / Web3Forms body). */
export function requirementsText(r: ClientRequirements, shortlist: PropertyListing[]): string {
  const lines: string[] = [];
  const add = (label: string, v: string | null | undefined) => {
    if (v) lines.push(`${label}: ${v}`);
  };
  add("Looking to", r.intent !== "unknown" ? r.intent : null);
  add("Purpose", r.purpose);
  add("Budget", r.budgetLabel);
  add("City", r.city);
  if (r.localities.length) add("Preferred areas", r.localities.join(", "));
  add("Configuration", [r.bhk, r.propertyType].filter(Boolean).join(" · ") || null);
  add("Timeline", r.timeline);
  add("Possession", r.possessionPref);
  add("Financing", r.financing);
  if (r.mustHaves.length) add("Must-haves", r.mustHaves.join(", "));
  add("Family", r.familyContext);
  if (shortlist.length) add("Shortlisted", shortlist.map((p) => `${p.title} (${formatPriceCr(p.priceCr)})`).join("; "));
  return lines.join("\n");
}

/** Short, friendly message pre-filled into WhatsApp for the client. */
export function whatsappText(r: ClientRequirements, shortlist: PropertyListing[]): string {
  const bits: string[] = [];
  bits.push(`Hi Radiance Realtors! I'm ${r.name ?? "interested in a property"}.`);
  bits.push("I just spoke with Ashirvad, your AI consultant.");
  const cfg = [r.bhk, r.propertyType].filter(Boolean).join(" ");
  const where = r.localities[0] ?? r.city ?? "Gurugram";
  const want = r.intent !== "unknown" ? r.intent : "buy";
  bits.push(`I'm looking to ${want} ${cfg ? `a ${cfg}` : "a property"} in ${where}${r.budgetLabel ? ` (budget ${r.budgetLabel})` : ""}.`);
  if (shortlist.length) bits.push(`Shortlisted: ${shortlist.map((p) => p.title).join(", ")}.`);
  bits.push("Please share full details and arrange a visit.");
  return bits.join(" ");
}

export function whatsappHref(r: ClientRequirements, shortlist: PropertyListing[]): string {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(whatsappText(r, shortlist))}`;
}

export interface LeadPayload {
  mode: "enquiry" | "visit" | "ai-consultation";
  name: string;
  phone: string;
  email?: string;
  interest?: string;
  date?: string;
  message?: string;
  requirementsText?: string;
  shortlist?: string[];
}

let cachedKey: string | null = null;
async function web3Key(): Promise<string> {
  if (cachedKey !== null) return cachedKey;
  try {
    const r = await fetch("/api/web3-key");
    const d = await r.json();
    cachedKey = typeof d?.key === "string" ? d.key : "";
  } catch {
    cachedKey = "";
  }
  return cachedKey ?? "";
}

function leadBody(p: LeadPayload): string {
  return [
    `Type: ${p.mode}`,
    `Name: ${p.name}`,
    `Phone: ${p.phone}`,
    p.email ? `Email: ${p.email}` : "",
    p.interest ? `Interested in: ${p.interest}` : "",
    p.date ? `Preferred date: ${p.date}` : "",
    p.requirementsText ? `\nRequirements:\n${p.requirementsText}` : "",
    p.shortlist?.length ? `\nShortlisted: ${p.shortlist.join(", ")}` : "",
    p.message ? `\nMessage: ${p.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Submit a lead. Primary path is a direct browser POST to Web3Forms (real
 * Origin/User-Agent → reliable); falls back to the server proxy if needed.
 */
export async function submitLead(p: LeadPayload): Promise<{ delivered: boolean }> {
  const subject =
    p.mode === "ai-consultation"
      ? `New AI-qualified lead — ${p.name || p.phone}`
      : p.mode === "visit"
        ? `Site visit request — ${p.name || p.phone}`
        : `Website enquiry — ${p.name || p.phone}`;

  const key = await web3Key();
  if (key) {
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: key,
          subject,
          from_name: p.name || "Radiance website",
          replyto: p.email || undefined,
          name: p.name,
          phone: p.phone,
          email: p.email ?? "",
          interest: p.interest ?? "",
          preferred_date: p.date ?? "",
          message: leadBody(p),
        }),
      });
      const d = (await res.json().catch(() => null)) as { success?: boolean } | null;
      if (res.ok && d?.success) return { delivered: true };
    } catch {
      /* fall back to server */
    }
  }

  try {
    const res = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    const d = (await res.json().catch(() => null)) as { delivered?: boolean } | null;
    return { delivered: !!d?.delivered };
  } catch {
    return { delivered: false };
  }
}

export function emailHref(r: ClientRequirements, shortlist: PropertyListing[]): string {
  const subject = `Property enquiry${r.name ? ` from ${r.name}` : ""}`;
  const body = `Hi Radiance Realtors,\n\nHere are my details from the Ashirvad consultation:\n\n${requirementsText(
    r,
    shortlist,
  )}\n\nPlease get in touch.\n\n${r.name ?? ""}${r.phone ? `\n${r.phone}` : ""}`;
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
