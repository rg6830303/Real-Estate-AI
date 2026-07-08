"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import clsx from "clsx";
import { submitLead } from "@/lib/lead";
import { speak } from "@/lib/speech";
import { ADVISOR_NAME } from "@/lib/config";

type Mode = "enquiry" | "visit";

export default function ContactForm() {
  const [mode, setMode] = useState<Mode>("enquiry");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [name, setName] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const submittedName = String(fd.get("name") ?? "").trim();
    setName(submittedName);
    setStatus("sending");
    setError("");
    try {
      const { delivered } = await submitLead({
        mode: mode === "visit" ? "visit" : "enquiry",
        name: submittedName,
        phone: String(fd.get("phone") ?? ""),
        email: String(fd.get("email") ?? ""),
        interest: String(fd.get("interest") ?? ""),
        date: String(fd.get("date") ?? ""),
        message: String(fd.get("message") ?? ""),
      });
      if (!delivered) {
        throw new Error(
          "We couldn't send that just now. Please WhatsApp or call us on +91 96 50 50 5010 and we'll respond right away.",
        );
      }
      setStatus("done");
      void speak(
        `Thank you${submittedName ? ", " + submittedName : ""}! Your details are with our team and we'll reach out to you very shortly. This is ${ADVISOR_NAME} from Radiance Realtors.`,
      );
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" strokeWidth={1.5} />
        <p className="mt-3 text-lg font-semibold text-ink-950">
          Thank you{name ? `, ${name}` : ""} — we&apos;ve got it.
        </p>
        <p className="mt-1 text-sm text-ink-950/65">
          Our team will reach out shortly. Meanwhile, feel free to chat with Ashirvad for instant
          shortlisting.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-5 rounded-lg border border-ink-950/15 px-4 py-2 text-sm font-medium text-ink-950 transition hover:border-gold-500"
        >
          Send another
        </button>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500";

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-ink-950/10 bg-white p-6 shadow-card">
      <div className="mb-5 flex rounded-lg bg-cream-100 p-1 text-sm">
        {([
          ["enquiry", "General Enquiry"],
          ["visit", "Book a Site Visit"],
        ] as [Mode, string][]).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={clsx(
              "flex-1 rounded-md px-3 py-2 font-medium transition",
              mode === m ? "bg-ink-950 text-white shadow-sm" : "text-ink-950/60 hover:text-ink-950",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink-950/60">Full name</span>
          <input name="name" required className={inputCls} placeholder="Your name" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink-950/60">Phone</span>
          <input name="phone" required className={inputCls} placeholder="+91…" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink-950/60">Email</span>
          <input name="email" type="email" className={inputCls} placeholder="you@email.com" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink-950/60">Interested in</span>
          <select name="interest" className={inputCls} defaultValue="Residential">
            <option>Residential</option>
            <option>Commercial</option>
            <option>SCO</option>
            <option>Leasing</option>
            <option>Investment advice</option>
          </select>
        </label>
        {mode === "visit" ? (
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-ink-950/60">Preferred date</span>
            <input name="date" type="date" className={inputCls} />
          </label>
        ) : null}
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-ink-950/60">Message</span>
          <textarea
            name="message"
            rows={4}
            className={inputCls}
            placeholder={
              mode === "visit"
                ? "Which project would you like to visit?"
                : "Tell us what you're looking for…"
            }
          />
        </label>
      </div>

      {status === "error" ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold text-ink-950 transition hover:bg-gold-400 disabled:opacity-60"
      >
        {status === "sending" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" strokeWidth={2} />
        )}
        {mode === "visit" ? "Request site visit" : "Send enquiry"}
      </button>
    </form>
  );
}
