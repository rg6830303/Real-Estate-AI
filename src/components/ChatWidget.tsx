"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { ADVISOR_NAME } from "@/lib/config";
import ChatShell from "./ChatShell";

/**
 * Floating chat bubble for the marketing site — opens the Ashirvad
 * consultant in a compact panel, mirroring how the widget will sit on the
 * client's production website.
 */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open ? (
        <div className="fixed bottom-24 right-4 z-50 flex h-[600px] max-h-[calc(100vh-8rem)] w-[400px] max-w-[calc(100vw-2rem)] animate-riseIn flex-col overflow-hidden rounded-2xl border border-ink-950/15 bg-white shadow-panel">
          <ChatShell variant="widget" />
        </div>
      ) : null}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : `Chat with ${ADVISOR_NAME}`}
        className="fixed bottom-6 right-4 z-50 flex items-center gap-2 rounded-full bg-gold-500 py-3 pl-4 pr-5 text-sm font-semibold text-ink-950 shadow-panel transition hover:bg-gold-400"
      >
        {open ? (
          <X className="h-5 w-5" strokeWidth={2} />
        ) : (
          <MessageCircle className="h-5 w-5" strokeWidth={2} />
        )}
        {open ? "Close" : `Ask ${ADVISOR_NAME}`}
      </button>
    </>
  );
}
