import Link from "next/link";
import { ChevronRight } from "lucide-react";

/** Compact inner-page banner with breadcrumb, over a subtle image + gradient. */
export default function PageHero({
  title,
  subtitle,
  crumb,
  image = "/radiance/locations/loc3.png",
}: {
  title: string;
  subtitle?: string;
  crumb?: string;
  image?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-ink-950 text-white">
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center opacity-25"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 to-ink-950" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <nav className="flex items-center gap-1 text-xs text-white/60">
          <Link href="/" className="transition hover:text-gold-300">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gold-300">{crumb ?? title}</span>
        </nav>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
