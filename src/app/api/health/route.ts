import { NextResponse } from "next/server";
import { GROQ_BASE_URL, GROQ_MODEL } from "@/lib/config";
import { getDb, isMongoConfigured, PROPERTIES_COLLECTION } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Production health check — open /api/health in a browser to verify the
 * deployment end to end: Groq key present and accepted, MongoDB reachable,
 * and how many listings the consultant is serving from where.
 */
export async function GET() {
  const groqKeyConfigured = !!process.env.GROQ_API_KEY;

  let groq: string;
  if (!groqKeyConfigured) {
    groq = "missing GROQ_API_KEY";
  } else {
    try {
      const res = await fetch(`${GROQ_BASE_URL}/models`, {
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      });
      groq = res.ok ? "ok" : `error: HTTP ${res.status} from Groq (check the key)`;
    } catch (err) {
      groq = `error: ${err instanceof Error ? err.message : "unreachable"}`;
    }
  }

  let mongo: string;
  let listingCount = 0;
  if (!isMongoConfigured()) {
    mongo = "not configured (MONGODB_URI missing) — using bundled fallback listings";
  } else {
    try {
      const db = await getDb();
      listingCount = await db
        .collection(PROPERTIES_COLLECTION)
        .countDocuments({ active: true });
      mongo = "ok";
    } catch (err) {
      mongo = `error: ${err instanceof Error ? err.message : "unreachable"}`;
    }
  }

  const healthy = groq === "ok" && (mongo === "ok" ? listingCount > 0 : true);

  return NextResponse.json(
    {
      healthy,
      groqKeyConfigured,
      groqApi: groq,
      chatModel: GROQ_MODEL,
      mongodb: mongo,
      activeListings:
        mongo === "ok"
          ? listingCount
          : "using bundled fallback (20 Gurgaon listings)",
      hint:
        mongo === "ok" && listingCount === 0
          ? "Collection is empty — open /api/seed once to load the Gurgaon dataset."
          : undefined,
    },
    { status: healthy ? 200 : 503 },
  );
}
