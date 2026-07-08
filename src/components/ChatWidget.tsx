"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import clsx from "clsx";
import { ADVISOR_NAME } from "@/lib/config";
import ChatShell from "./ChatShell";

/**
 * Floating chat popup shown on every public page (mounted once in the root
 * layout, so the conversation persists as the visitor navigates). Hidden on the
 * admin console and on the full-screen /consultant page.
 */
export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [nudge, setNudge] = useState(false);

  // A one-time gentle nudge so visitors notice Ashirvad.
  useEffect(() => {
    const t = setTimeout(() => setNudge(true), 3500);
    return () => clearTimeout(t);
  }, []);

  if (pathname?.startsWith("/admin") || pathname === "/consultant") return null;

  return (
    <>
      {/* Popup panel */}
      <div
        className={clsx(
          "fixed bottom-24 right-4 z-50 flex h-[600px] max-h-[calc(100vh-8rem)] w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-ink-950/15 bg-white shadow-panel transition-all duration-300",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
        )}
        aria-hidden={!open}
      >
        <ChatShell variant="widget" />
      </div>

      {/* Peek bubble */}
      {!open && nudge ? (
        <button
          onClick={() => {
            setOpen(true);
            setNudge(false);
          }}
          className="fixed bottom-[5.5rem] right-4 z-40 max-w-[240px] animate-riseIn rounded-2xl rounded-br-sm border border-ink-950/10 bg-white px-3.5 py-2.5 text-left text-xs text-ink-950/80 shadow-panel"
        >
          <span className="font-semibold text-ink-950">{ADVISOR_NAME}:</span> Looking for a
          property? I can shortlist the perfect fit in a minute. 👋
        </button>
      ) : null}

      {/* Toggle */}
      <button
        onClick={() => {
          setOpen((v) => !v);
          setNudge(false);
        }}
        aria-label={open ? "Close chat" : `Chat with ${ADVISOR_NAME}`}
        className="fixed bottom-6 right-4 z-50 flex items-center gap-2 rounded-full bg-gold-500 py-3 pl-4 pr-5 text-sm font-semibold text-ink-950 shadow-panel transition hover:bg-gold-400"
      >
        {open ? (
          <X className="h-5 w-5" strokeWidth={2} />
        ) : (
          <span className="relative flex h-5 w-5 items-center justify-center">
            <MessageCircle className="h-5 w-5" strokeWidth={2} />
            {!open ? (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-gold-500" />
            ) : null}
          </span>
        )}
        {open ? "Close" : `Ask ${ADVISOR_NAME}`}
      </button>
    </>
  );
}
