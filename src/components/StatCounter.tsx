"use client";

import { useEffect, useRef, useState } from "react";
import { MILESTONES } from "@/lib/site";

/** Parse "5000+" → { target: 5000, suffix: "+" }. */
function parse(value: string): { target: number; prefix: string; suffix: string } {
  const m = value.match(/^(\D*)([\d,]+)(.*)$/);
  if (!m) return { target: 0, prefix: "", suffix: value };
  return {
    prefix: m[1],
    target: Number(m[2].replace(/,/g, "")),
    suffix: m[3],
  };
}

/**
 * Milestone strip whose numbers count up once, when scrolled into view.
 */
export default function StatCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-12 text-center sm:grid-cols-4 sm:px-6"
    >
      {MILESTONES.map((m) => (
        <Counter key={m.label} value={m.value} label={m.label} run={run} />
      ))}
    </div>
  );
}

function Counter({ value, label, run }: { value: string; label: string; run: boolean }) {
  const { target, prefix, suffix } = parse(value);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!run) return;
    const duration = 1400;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target]);

  return (
    <div>
      <p className="text-3xl font-semibold text-gold-300 sm:text-4xl">
        {prefix}
        {n.toLocaleString("en-IN")}
        {suffix}
      </p>
      <p className="mt-1.5 text-xs uppercase tracking-wider text-white/60">{label}</p>
    </div>
  );
}
