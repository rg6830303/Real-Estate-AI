"use client";

import { useEffect, useState } from "react";
import { Database, RefreshCw } from "lucide-react";

interface Stats {
  dataSize: number;
  storageSize: number;
  indexSize: number;
  totalSize: number;
  objects: number;
  limitBytes: number;
  limitMB: number;
}

function fmt(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 ? 2 : 1)} ${units[i]}`;
}

export default function DbStats() {
  const [s, setS] = useState<Stats | null>(null);
  const [err, setErr] = useState("");
  const [ts, setTs] = useState<Date | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/admin/db-stats", { cache: "no-store" });
        const d = await res.json();
        if (!res.ok) throw new Error(d?.error ?? "Failed");
        if (alive) {
          setS(d);
          setErr("");
          setTs(new Date());
        }
      } catch (e) {
        if (alive) setErr(e instanceof Error ? e.message : "Failed");
      }
    }
    load();
    const id = setInterval(load, 8000); // realtime-ish refresh
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const pct = s ? Math.min(100, (s.totalSize / s.limitBytes) * 100) : 0;

  return (
    <div className="rounded-2xl border border-ink-950/10 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-ink-950">
          <Database className="h-4 w-4 text-brand-600" strokeWidth={1.75} />
          Database storage
        </p>
        <span className="inline-flex items-center gap-1 text-[11px] text-ink-950/45">
          <RefreshCw className="h-3 w-3" />
          {ts ? `updated ${ts.toLocaleTimeString()}` : "live"}
        </span>
      </div>

      {err ? (
        <p className="mt-3 text-xs text-red-600">{err}</p>
      ) : !s ? (
        <p className="mt-3 text-xs text-ink-950/50">Loading…</p>
      ) : (
        <>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-2xl font-semibold text-ink-950">{fmt(s.totalSize)}</p>
            <p className="text-xs text-ink-950/55">of {fmt(s.limitBytes)} total</p>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-ink-950/10">
            <div
              className={
                "h-full rounded-full transition-all duration-700 " +
                (pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-brand-500")
              }
              style={{ width: `${Math.max(pct, 1)}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-ink-950/45">{pct.toFixed(pct < 1 ? 2 : 1)}% used</p>

          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[
              ["Data", fmt(s.dataSize)],
              ["Indexes", fmt(s.indexSize)],
              ["Documents", s.objects.toLocaleString("en-IN")],
            ].map(([label, val]) => (
              <div key={label} className="rounded-lg bg-cream-100 p-2.5">
                <p className="text-sm font-semibold text-ink-950">{val}</p>
                <p className="text-[10px] uppercase tracking-wide text-ink-950/50">{label}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
