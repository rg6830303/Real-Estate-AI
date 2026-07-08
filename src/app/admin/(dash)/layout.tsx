import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ExternalLink, Inbox, LayoutDashboard, Plus } from "lucide-react";
import Logo from "@/components/Logo";
import LogoutButton from "@/components/admin/LogoutButton";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Console — Radiance Realtors" };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!verifySessionToken(cookies().get(ADMIN_COOKIE)?.value)) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="sticky top-0 z-40 border-b border-gold-500/20 bg-ink-950 text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo height={38} href="/admin" />
            <span className="hidden rounded-full border border-gold-500/40 px-2.5 py-0.5 text-[11px] font-medium text-gold-300 sm:inline">
              Admin Console
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-white/80 transition hover:text-gold-300"
            >
              <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} /> Dashboard
            </Link>
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-white/80 transition hover:text-gold-300"
            >
              <Inbox className="h-4 w-4" strokeWidth={1.75} /> Form
            </Link>
            <Link
              href="/admin/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gold-500 px-3 py-1.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400"
            >
              <Plus className="h-4 w-4" strokeWidth={2} /> Add property
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-white/70 transition hover:text-gold-300 sm:inline-flex"
            >
              <ExternalLink className="h-4 w-4" strokeWidth={1.75} /> Site
            </a>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
