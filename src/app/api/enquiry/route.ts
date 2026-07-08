import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lead capture for the contact / site-visit forms AND the AI consultant's
 * auto-fill. Submits to Web3Forms (WEB3_API access key) so the agency receives
 * the lead by email; falls back to a server log if the key is unset. The AI
 * sends `mode: "ai-consultation"` with the captured requirements + shortlist.
 */
const WEB3_ENDPOINT = "https://api.web3forms.com/submit";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const s = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = s(body.name);
  const phone = s(body.phone);
  if (!name && !phone) {
    return NextResponse.json(
      { error: "Please provide at least your name and phone number." },
      { status: 400 },
    );
  }

  const mode = body.mode === "visit" ? "site-visit" : body.mode === "ai-consultation" ? "ai-consultation" : "enquiry";

  const lead: Record<string, string> = {
    mode,
    name,
    phone,
    email: s(body.email),
    interest: s(body.interest),
    preferred_date: s(body.date),
    message: s(body.message),
    shortlist: Array.isArray(body.shortlist) ? (body.shortlist as unknown[]).map(String).join(", ") : s(body.shortlist),
    requirements: s(body.requirementsText),
    received_at: new Date().toISOString(),
  };

  const accessKey = (process.env.WEB3_API || process.env.NEXT_PUBLIC_WEB3_API || "").trim();
  if (!accessKey) {
    console.log("[radiance:lead] (WEB3_API unset)", JSON.stringify(lead));
    return NextResponse.json({ ok: true, delivered: false, reason: "WEB3_API env var not set" });
  }

  try {
    const subject =
      mode === "ai-consultation"
        ? `New AI-qualified lead — ${name || phone}`
        : mode === "site-visit"
          ? `Site visit request — ${name || phone}`
          : `Website enquiry — ${name || phone}`;

    const res = await fetch(WEB3_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject,
        from_name: name || "Radiance website",
        replyto: lead.email || undefined,
        // A readable body for the notification email:
        message: buildEmailBody(lead),
        ...lead,
      }),
      signal: AbortSignal.timeout(12000),
    });
    const data = (await res.json().catch(() => null)) as
      | { success?: boolean; message?: string }
      | null;
    if (!res.ok || !data?.success) {
      const reason = `web3forms ${res.status}: ${data?.message ?? "no success"}`;
      console.log("[radiance:lead] " + reason, JSON.stringify(lead));
      return NextResponse.json({ ok: true, delivered: false, reason });
    }
    return NextResponse.json({ ok: true, delivered: true });
  } catch (err) {
    const reason = err instanceof Error ? err.message : "network error";
    console.log("[radiance:lead] web3forms error", reason);
    return NextResponse.json({ ok: true, delivered: false, reason });
  }
}

function buildEmailBody(lead: Record<string, string>): string {
  const lines = [
    `Type: ${lead.mode}`,
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    lead.email ? `Email: ${lead.email}` : "",
    lead.interest ? `Interested in: ${lead.interest}` : "",
    lead.preferred_date ? `Preferred date: ${lead.preferred_date}` : "",
    lead.requirements ? `\nRequirements:\n${lead.requirements}` : "",
    lead.shortlist ? `\nShortlisted: ${lead.shortlist}` : "",
    lead.message ? `\nMessage: ${lead.message}` : "",
    `\nReceived: ${lead.received_at}`,
  ].filter(Boolean);
  return lines.join("\n");
}
