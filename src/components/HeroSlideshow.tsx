"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import clsx from "clsx";
import { HERO_SLIDES } from "@/lib/site";
import { ADVISOR_NAME, AGENCY_NAME } from "@/lib/config";

/**
 * Full-bleed hero with cross-fading slides and a slow Ken Burns zoom on each
 * background — a lightweight, self-hosted replication of the agency site's
 * animated video hero (no 14 MB webm to ship). Headings mirror the real site.
 */
export default function HeroSlideshow() {
  const [active, setActive] = useState(0);
  const count = HERO_SLIDES.length;

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % count), 6000);
    return () => clearInterval(id);
  }, [count]);

  const slide = HERO_SLIDES[active];

  return (
    <section className="relative h-[88vh] min-h-[560px] overflow-hidden bg-ink-950 text-white">
      {/* Cross-fading Ken Burns backgrounds */}
      {HERO_SLIDES.map((s, i) => (
        <div
          key={s.image}
          className={clsx(
            "absolute inset-0 transition-opacity duration-1000",
            i === active ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={i !== active}
        >
          <div
            className={clsx(
              "h-full w-full bg-cover bg-center",
              i === active && "animate-kenburns",
            )}
            style={{ backgroundImage: `url(${s.image})` }}
          />
        </div>
      ))}

      {/* Legibility gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/80 via-ink-950/50 to-ink-950/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950/70 to-transparent" />

      {/* Content */}
      <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-4 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-300">
          {AGENCY_NAME} · Gurugram · Dwarka Expressway · Goa
        </p>
        <h1
          key={active /* re-triggers fade on each slide */}
          className="mt-5 max-w-3xl animate-fadeIn text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl"
        >
          {slide.heading}
        </h1>
        <p className="mt-5 max-w-xl animate-fadeIn text-base leading-relaxed text-white/80 sm:text-lg">
          {slide.sub}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/consultant"
            className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold text-ink-950 shadow-panel transition hover:bg-gold-400"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={2} />
            Talk to {ADVISOR_NAME}, our AI consultant
          </Link>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:border-gold-300 hover:text-gold-300"
          >
            Explore all properties
          </Link>
        </div>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {HERO_SLIDES.map((s, i) => (
          <button
            key={s.image}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={clsx(
              "h-1.5 rounded-full transition-all",
              i === active ? "w-8 bg-gold-400" : "w-2.5 bg-white/40 hover:bg-white/70",
            )}
          />
        ))}
      </div>
    </section>
  );
}
