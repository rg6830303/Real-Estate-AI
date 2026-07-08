"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Login failed.");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-ink-900 p-8 shadow-panel"
      >
        <div className="flex justify-center">
          <Logo height={56} href={null} />
        </div>
        <h1 className="mt-6 text-center text-lg font-semibold text-white">Admin Console</h1>
        <p className="mt-1 text-center text-xs text-white/50">
          Manage properties, cities and media
        </p>

        <label className="mt-6 block">
          <span className="mb-1 block text-xs font-medium text-white/60">Password</span>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full rounded-lg border border-white/15 bg-ink-950 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-gold-400"
              placeholder="Enter admin password"
            />
          </div>
        </label>

        {error ? (
          <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>
        ) : null}

        <button
          type="submit"
          disabled={busy || !password}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gold-500 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-gold-400 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Sign in
        </button>
      </form>
    </div>
  );
}
