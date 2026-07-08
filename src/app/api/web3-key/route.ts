import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Exposes the Web3Forms access key to the browser so the contact form and the
 * AI consultant can submit directly to Web3Forms (its canonical, most reliable
 * path — a real browser Origin/User-Agent avoids the Cloudflare 403 that blocks
 * serverless calls). Web3Forms access keys are public by design (they sit in
 * client HTML in every Web3Forms integration), so this is expected usage.
 */
export async function GET() {
  const key = (process.env.WEB3_API || process.env.NEXT_PUBLIC_WEB3_API || "").trim();
  return NextResponse.json({ key });
}
