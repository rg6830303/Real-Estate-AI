import { NextResponse } from "next/server";
import { getDb, isMongoConfigured } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lead capture from the contact form. Stores into the `leads` collection
 * when MongoDB is configured; always accepts gracefully so the client-facing
 * form never errors out on an infrastructure hiccup.
 */
export async function POST(req: Request) {
  let body: { name?: string; phone?: string; email?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = (body.name ?? "").trim().slice(0, 120);
  const phone = (body.phone ?? "").trim().slice(0, 20);
  const email = (body.email ?? "").trim().slice(0, 160);
  const message = (body.message ?? "").trim().slice(0, 2000);

  if (!name || !phone) {
    return NextResponse.json(
      { error: "Please share your name and phone number." },
      { status: 400 },
    );
  }

  if (isMongoConfigured()) {
    try {
      const db = await getDb();
      await db.collection("leads").insertOne({
        name,
        phone,
        email: email || null,
        message: message || null,
        source: "Website contact form",
        createdAt: new Date(),
      });
    } catch {
      // Fall through — the team also receives leads via phone/email, and a
      // storage failure must never surface as a client-facing error.
    }
  }

  return NextResponse.json({ ok: true });
}
