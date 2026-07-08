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

export function emailHref(r: ClientRequirements, shortlist: PropertyListing[]): string {
  const subject = `Property enquiry${r.name ? ` from ${r.name}` : ""}`;
  const body = `Hi Radiance Realtors,\n\nHere are my details from the Ashirvad consultation:\n\n${requirementsText(
    r,
    shortlist,
  )}\n\nPlease get in touch.\n\n${r.name ?? ""}${r.phone ? `\n${r.phone}` : ""}`;
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
