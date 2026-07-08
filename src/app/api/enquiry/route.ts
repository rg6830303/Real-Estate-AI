import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lightweight lead-capture endpoint for the contact / site-visit forms.
 * Validates the payload and logs it server-side. Wire this to your CRM,
 * email (e.g. Resend) or a Mongo `leads` collection when ready — the shape is
 * already normalised below.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  if (!name || !phone) {
    return NextResponse.json(
      { error: "Please provide at least your name and phone number." },
      { status: 400 },
    );
  }

  const lead = {
    mode: body.mode === "visit" ? "site-visit" : "enquiry",
    name,
    phone,
    email: String(body.email ?? "").trim() || null,
    interest: String(body.interest ?? "").trim() || null,
    date: String(body.date ?? "").trim() || null,
    message: String(body.message ?? "").trim() || null,
    receivedAt: new Date().toISOString(),
  };

  // Server-side record; replace with CRM/email/DB integration as needed.
  console.log("[radiance:lead]", JSON.stringify(lead));

  return NextResponse.json({ ok: true });
}
