import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/adminAuth";
import { isMongoConfigured } from "@/lib/mongodb";
import { deleteProperty, upsertProperty, type AdminPropertyInput } from "@/lib/properties";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authed(): boolean {
  return verifySessionToken(cookies().get(ADMIN_COOKIE)?.value);
}

function refreshSite() {
  // Public pages use ISR; nudge them so admin edits appear immediately. The AI
  // consultant reads inventory fresh on every request, so it is already live.
  revalidatePath("/");
  revalidatePath("/properties");
}

/** Create or update a property. */
export async function POST(req: Request) {
  if (!authed()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!isMongoConfigured())
    return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });
  try {
    const input = (await req.json()) as AdminPropertyInput;
    const id = await upsertProperty(input);
    refreshSite();
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not save." },
      { status: 400 },
    );
  }
}

/** Delete a property by ?id=… */
export async function DELETE(req: Request) {
  if (!authed()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!isMongoConfigured())
    return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  try {
    const removed = await deleteProperty(id);
    refreshSite();
    return NextResponse.json({ ok: removed });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not delete." },
      { status: 500 },
    );
  }
}
