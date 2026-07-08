import Link from "next/link";
import { Building2 } from "lucide-react";
import { AGENCY_NAME } from "@/lib/config";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-gold-500/20 bg-ink-950/95 text-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold-500/40 bg-ink-900 text-gold-400">
            <Building2 className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-base font-semibold tracking-wide">
              {AGENCY_NAME.toUpperCase()}
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold-300/80">
              Gurugram · Delhi · Goa
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-white/80 md:flex">
          <Link href="/" className="transition hover:text-gold-300">
            Home
          </Link>
          <Link href="/#properties" className="transition hover:text-gold-300">
            Properties
          </Link>
          <Link href="/#why-us" className="transition hover:text-gold-300">
            Why Us
          </Link>
          <Link href="/#contact" className="transition hover:text-gold-300">
            Contact
          </Link>
        </nav>

        <Link
          href="/consultant"
          className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-950 shadow-card transition hover:bg-gold-400"
        >
          Talk to Ashirvad
        </Link>
      </div>
    </header>
  );
}
