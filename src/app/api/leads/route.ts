import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/adminAuth";
import { isMongoConfigured } from "@/lib/mongodb";
import { listLeads, recordLead } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Record a submission (called by the contact form + AI). Public, minimal. */
export async function POST(req: Request) {
  if (!isMongoConfigured()) return NextResponse.json({ ok: false });
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  if (!name && !phone) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    await recordLead({
      mode: String(body.mode ?? "enquiry"),
      name,
      phone,
      email: body.email as string | undefined,
      interest: body.interest as string | undefined,
      date: body.date as string | undefined,
      message: body.message as string | undefined,
      requirements: body.requirementsText as string | undefined,
      shortlist: Array.isArray(body.shortlist) ? (body.shortlist as string[]) : [],
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

/** List submissions (admin only). */
export async function GET() {
  if (!verifySessionToken(cookies().get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });
  }
  try {
    const leads = await listLeads();
    return NextResponse.json({ ok: true, leads });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed." },
      { status: 500 },
    );
  }
}
