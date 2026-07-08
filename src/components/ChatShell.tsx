"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import clsx from "clsx";
import { ADVISOR_NAME } from "@/lib/config";
import { openingGreeting } from "@/lib/consultant";
import {
  EMPTY_REQUIREMENTS,
  type ChatStreamEvent,
  type ClientRequirements,
  type PropertyListing,
} from "@/lib/types";
import PropertyCard from "./PropertyCard";
import RequirementsPanel from "./RequirementsPanel";

interface UiMessage {
  role: "user" | "assistant";
  content: string;
  properties?: PropertyListing[];
}

const SUGGESTIONS = [
  "I'm looking to buy a 3 BHK in Gurugram",
  "What should I know before buying my first home?",
  "I want an investment property under ₹1 Cr",
  "Help me decide between ready-to-move and under-construction",
];

export default function ChatShell() {
  const [messages, setMessages] = useState<UiMessage[]>([
    { role: "assistant", content: openingGreeting() },
  ]);
  const [requirements, setRequirements] =
    useState<ClientRequirements>(EMPTY_REQUIREMENTS);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || busy) return;
      setError(null);
      setInput("");
      setBusy(true);

      const history = [...messages, { role: "user" as const, content }];
      // Optimistic user bubble + empty assistant bubble that streams in.
      setMessages([...history, { role: "assistant", content: "" }]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map(({ role, content: c }) => ({ role, content: c })),
            requirements,
          }),
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? `Request failed (${res.status}).`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let assistantText = "";
        let turnProperties: PropertyListing[] = [];

        const applyAssistant = (text2: string, props: PropertyListing[]) =>
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = {
              role: "assistant",
              content: text2,
              properties: props.length ? props : undefined,
            };
            return next;
          });

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            let ev: ChatStreamEvent;
            try {
              ev = JSON.parse(line) as ChatStreamEvent;
            } catch {
              continue;
            }
            if (ev.type === "text") {
              assistantText += ev.delta;
              applyAssistant(assistantText, turnProperties);
            } else if (ev.type === "replace") {
              assistantText = ev.text;
              applyAssistant(assistantText, turnProperties);
            } else if (ev.type === "state") {
              setRequirements(ev.requirements);
              turnProperties = ev.properties;
            } else if (ev.type === "error") {
              throw new Error(ev.message);
            }
          }
        }

        // Attach matched property cards only after the reply has finished
        // streaming, mirroring how the consultant "hands over" a shortlist.
        applyAssistant(
          assistantText || "…",
          turnProperties,
        );
      } catch (err) {
        setMessages((prev) => prev.slice(0, -1));
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong reaching the consultant. Please try again.",
        );
      } finally {
        setBusy(false);
        inputRef.current?.focus();
      }
    },
    [busy, messages, requirements],
  );

  const showSuggestions = messages.length <= 1 && !busy;

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      {/* Chat column */}
      <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-2xl border border-ink-950/10 bg-white shadow-panel">
        <div className="flex items-center gap-3 border-b border-ink-950/10 bg-ink-950 px-4 py-3">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
              {ADVISOR_NAME.charAt(0)}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-ink-950 bg-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{ADVISOR_NAME}</p>
            <p className="text-[11px] text-white/60">
              Senior Property Consultant · online
            </p>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="chat-scroll flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6"
        >
          {messages.map((m, i) => (
            <MessageBubble
              key={i}
              message={m}
              streaming={busy && i === messages.length - 1 && m.role === "assistant"}
            />
          ))}
        </div>

        {error ? (
          <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">
            {error}
          </p>
        ) : null}

        {showSuggestions ? (
          <div className="flex flex-wrap gap-2 border-t border-ink-950/5 px-4 py-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => void send(s)}
                className="rounded-full border border-brand-500/30 bg-brand-50 px-3 py-1.5 text-xs text-brand-700 transition hover:bg-brand-100"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}

        <form
          className="flex items-end gap-2 border-t border-ink-950/10 px-3 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            rows={1}
            placeholder={`Message ${ADVISOR_NAME}…`}
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-ink-950/15 bg-[#f4f6f9] px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:bg-white"
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-950 text-white transition enabled:hover:bg-ink-800 disabled:opacity-40"
            aria-label="Send message"
          >
            <SendHorizontal className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </form>
      </section>

      {/* Requirements column */}
      <div className="hidden min-h-0 lg:block">
        <RequirementsPanel requirements={requirements} />
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  streaming,
}: {
  message: UiMessage;
  streaming: boolean;
}) {
  const isUser = message.role === "user";
  return (
    <div className={clsx("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={clsx("max-w-[85%] space-y-2", !isUser && "w-full sm:max-w-[85%]")}>
        <div
          className={clsx(
            "whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-br-md bg-ink-950 text-white"
              : "rounded-bl-md border border-ink-950/10 bg-[#f8fafb] text-ink-950",
          )}
        >
          {message.content || (streaming ? <TypingDots /> : null)}
        </div>
        {message.properties?.length ? (
          <div className="grid gap-2">
            {message.properties.map((p) => (
              <PropertyCard key={p.id} listing={p} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-ink-950/50"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
