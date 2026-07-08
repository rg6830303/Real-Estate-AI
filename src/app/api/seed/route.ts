import { NextResponse } from "next/server";
import { isMongoConfigured } from "@/lib/mongodb";
import { seedProperties } from "@/lib/properties";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Seed/refresh the MongoDB `properties` collection with the bundled Gurgaon
 * dataset. Open it once in a browser after deploying:
 *
 *   GET /api/seed              → insert any missing listings (never touches
 *                                rows you've edited or added)
 *   GET /api/seed?force=1      → also refresh existing seeded rows to the
 *                                bundled values
 *
 * If a SEED_TOKEN env var is set, requests must include ?token=<SEED_TOKEN>.
 * Without SEED_TOKEN the route stays usable but is upsert-only by design —
 * it can never delete or corrupt agency-entered data.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = process.env.SEED_TOKEN;
  if (token && url.searchParams.get("token") !== token) {
    return NextResponse.json({ error: "Invalid or missing token." }, { status: 401 });
  }
  if (!isMongoConfigured()) {
    return NextResponse.json(
      { error: "MONGODB_URI is not configured on this deployment." },
      { status: 503 },
    );
  }
  try {
    const force = url.searchParams.get("force") === "1";
    const result = await seedProperties(force);
    return NextResponse.json({
      ok: true,
      mode: force ? "refresh (force)" : "insert-missing",
      ...result,
      message: `Database now holds ${result.total} listings.`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Seeding failed." },
      { status: 500 },
    );
  }
}

export const POST = GET;
