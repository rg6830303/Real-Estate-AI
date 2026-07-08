import { getDb } from "./mongodb";

/**
 * Lead / contact-form submissions stored in MongoDB ("leads" collection) so the
 * admin console has a complete, reliable history of every fill-up — independent
 * of Web3Forms email delivery.
 */
export const LEADS_COLLECTION = "leads";

export interface LeadRecord {
  mode: string;
  name: string;
  phone: string;
  email: string | null;
  interest: string | null;
  date: string | null;
  message: string | null;
  requirements: string | null;
  shortlist: string[];
  createdAt: string; // ISO timestamp
}

export async function recordLead(input: Partial<LeadRecord>): Promise<void> {
  const db = await getDb();
  const s = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const doc: LeadRecord = {
    mode: s(input.mode) ?? "enquiry",
    name: s(input.name) ?? "",
    phone: s(input.phone) ?? "",
    email: s(input.email),
    interest: s(input.interest),
    date: s(input.date),
    message: s(input.message),
    requirements: s(input.requirements),
    shortlist: Array.isArray(input.shortlist)
      ? input.shortlist.filter((x): x is string => typeof x === "string")
      : [],
    createdAt: new Date().toISOString(),
  };
  await db.collection(LEADS_COLLECTION).insertOne(doc);
}

export async function listLeads(limit = 500): Promise<LeadRecord[]> {
  const db = await getDb();
  const rows = await db
    .collection(LEADS_COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
  return rows.map((r) => {
    const doc = r as unknown as LeadRecord;
    return {
      mode: doc.mode ?? "enquiry",
      name: doc.name ?? "",
      phone: doc.phone ?? "",
      email: doc.email ?? null,
      interest: doc.interest ?? null,
      date: doc.date ?? null,
      message: doc.message ?? null,
      requirements: doc.requirements ?? null,
      shortlist: Array.isArray(doc.shortlist) ? doc.shortlist : [],
      createdAt: doc.createdAt ?? new Date(0).toISOString(),
    };
  });
}

export async function countLeads(): Promise<number> {
  const db = await getDb();
  return db.collection(LEADS_COLLECTION).countDocuments();
}
