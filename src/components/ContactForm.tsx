"use client";

import { useState } from "react";
import { CheckCircle2, SendHorizontal } from "lucide-react";

export default function ContactForm() {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState("busy");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setState("done");
      form.reset();
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-xl border border-brand-500/30 bg-brand-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-brand-600" strokeWidth={1.75} />
        <p className="mt-3 text-sm font-semibold text-ink-950">
          Thank you — we've received your details.
        </p>
        <p className="mt-1 text-sm text-ink-950/60">
          Our team will reach out shortly.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-gold-500";

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required placeholder="Your name *" className={field} />
        <input name="phone" required placeholder="Phone number *" className={field} />
      </div>
      <input name="email" type="email" placeholder="Email (optional)" className={field} />
      <textarea
        name="message"
        rows={4}
        placeholder="What are you looking for? Location, budget, configuration…"
        className={field}
      />
      {state === "error" ? (
        <p className="text-xs text-red-600">
          Something went wrong — please try again, or call us directly.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={state === "busy"}
        className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold text-ink-950 transition hover:bg-gold-400 disabled:opacity-50"
      >
        <SendHorizontal className="h-4 w-4" strokeWidth={2} />
        {state === "busy" ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
