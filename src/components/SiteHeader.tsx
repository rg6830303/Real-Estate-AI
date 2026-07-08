import Link from "next/link";
import BrandLogo from "./BrandLogo";
import { ADVISOR_NAME } from "@/lib/config";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/about-us", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-gold-500/20 bg-ink-950/95 text-white backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/">
          <BrandLogo subtitle="Gurugram · Delhi · Goa" />
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-white/80 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-gold-300"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/consultant"
          className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-950 shadow-card transition hover:bg-gold-400"
        >
          Talk to {ADVISOR_NAME}
        </Link>
      </div>
    </header>
  );
}
