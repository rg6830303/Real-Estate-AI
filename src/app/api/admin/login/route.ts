import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  checkPassword,
  createSessionToken,
  isAdminConfigured,
} from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not set on this deployment. Add it in Vercel → Settings → Environment Variables." },
      { status: 503 },
    );
  }
  const body = (await req.json().catch(() => ({}))) as { password?: string };
  if (!checkPassword(String(body.password ?? ""))) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
}
