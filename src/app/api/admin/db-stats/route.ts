import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/adminAuth";
import { isMongoConfigured } from "@/lib/mongodb";
import { getDbStorage } from "@/lib/properties";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Live database storage usage for the admin console dashboard. */
export async function GET() {
  if (!verifySessionToken(cookies().get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });
  }
  try {
    const usage = await getDbStorage();
    // Cluster storage cap — set MONGODB_STORAGE_LIMIT_MB for your tier
    // (Atlas M0 free tier is 512 MB).
    const limitMB = Number(process.env.MONGODB_STORAGE_LIMIT_MB) || 512;
    return NextResponse.json({
      ok: true,
      ...usage,
      limitBytes: limitMB * 1024 * 1024,
      limitMB,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to read stats." },
      { status: 500 },
    );
  }
}
