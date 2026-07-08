import { NextResponse, type NextRequest } from "next/server";

/**
 * Host-based routing: the admin domain (radianceadmin.vercel.app) serves the
 * admin console, while every other domain serves the public client site — all
 * from a single Vercel project/deployment.
 *
 * On the admin host, any non-/admin page path is rewritten under /admin so that
 * the bare domain opens the console. API routes, Next internals and static
 * files are excluded by the matcher below.
 */
const ADMIN_HOST_PREFIX = "radianceadmin.";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const isAdminHost = host.startsWith(ADMIN_HOST_PREFIX);
  if (!isAdminHost) return NextResponse.next();

  const url = req.nextUrl.clone();
  if (!url.pathname.startsWith("/admin")) {
    url.pathname = url.pathname === "/" ? "/admin" : `/admin${url.pathname}`;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  // Match page routes only: skip api, Next internals and any file with an
  // extension (static assets like /radiance/logo.png).
  matcher: ["/((?!api|_next|.*\\.).*)"],
};
