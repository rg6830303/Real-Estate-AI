"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import clsx from "clsx";
import { ADVISOR_NAME } from "@/lib/config";
import ChatShell from "./ChatShell";

/**
 * Floating chat popup shown on every public page (mounted once in the root
 * layout, so the conversation persists as the visitor navigates). Opens on the
 * "ashirvad:open" event fired by the per-page voice intro. Hidden on the admin
 * console and on the full-screen /consultant page.
 */
export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("ashirvad:open", handler);
    return () => window.removeEventListener("ashirvad:open", handler);
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

      {/* Toggle — highlighted with a pulsing ring so it's impossible to miss */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : `Chat with ${ADVISOR_NAME}`}
        className="group fixed bottom-6 right-4 z-50 flex items-center gap-2 rounded-full bg-gold-500 py-3.5 pl-4 pr-5 text-sm font-bold text-ink-950 shadow-panel transition hover:scale-[1.03] hover:bg-gold-400"
      >
        {!open ? (
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-gold-400/60" />
        ) : null}
        {open ? (
          <X className="h-5 w-5" strokeWidth={2.25} />
        ) : (
          <span className="relative flex h-5 w-5 items-center justify-center">
            <MessageCircle className="h-5 w-5" strokeWidth={2.25} />
            <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-gold-500" />
          </span>
        )}
        {open ? "Close" : `Ask ${ADVISOR_NAME}`}
      </button>
    </>
  );
}
