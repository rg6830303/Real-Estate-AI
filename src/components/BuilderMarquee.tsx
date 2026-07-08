import Link from "next/link";
import { BUILDERS } from "@/lib/site";

/**
 * Continuously scrolling strip of developer brands (CSS marquee, no JS).
 * The track is duplicated so the loop is seamless; each brand links to its
 * filtered listings.
 */
export default function BuilderMarquee() {
  const row = [...BUILDERS, ...BUILDERS];
  return (
    <div className="marquee-mask overflow-hidden">
      <div className="flex w-max animate-marquee gap-4">
        {row.map((b, i) => (
          <Link
            key={`${b.slug}-${i}`}
            href={`/properties?builder=${b.slug}`}
            className="flex h-16 min-w-[180px] items-center justify-center rounded-xl border border-ink-950/10 bg-white px-8 text-lg font-semibold tracking-wide text-ink-950/80 shadow-card transition hover:border-gold-500 hover:text-brand-700"
          >
            {b.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
