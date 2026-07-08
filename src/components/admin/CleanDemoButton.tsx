"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

export default function CleanDemoButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function run() {
    if (!confirm("Remove all retired demo/sample listings from the database?")) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/clean-demo", { method: "POST" });
      const d = await res.json().catch(() => null);
      if (!res.ok) throw new Error(d?.error ?? "Failed.");
      setMsg(`Removed ${d.removed} demo listing(s).`);
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={run}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-ink-950/15 px-3 py-2 text-sm font-medium text-ink-950 transition hover:border-gold-500 disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Clean demo data
      </button>
      {msg ? <span className="text-xs text-ink-950/60">{msg}</span> : null}
    </div>
  );
}
