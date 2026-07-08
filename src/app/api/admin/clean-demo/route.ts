import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/adminAuth";
import { isMongoConfigured } from "@/lib/mongodb";
import { purgeLegacySeed } from "@/lib/properties";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Remove the retired demo/sample listings so the DB holds real data only. */
export async function POST() {
  if (!verifySessionToken(cookies().get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!isMongoConfigured()) {
    return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });
  }
  try {
    const removed = await purgeLegacySeed();
    revalidatePath("/");
    revalidatePath("/properties");
    return NextResponse.json({ ok: true, removed });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed." },
      { status: 500 },
    );
  }
}
