"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Mail, MessageCircle, SendHorizontal, Volume2, VolumeX } from "lucide-react";
import clsx from "clsx";
import { ADVISOR_NAME } from "@/lib/config";
import { openingGreeting } from "@/lib/consultant";
import { emailHref, requirementsText, whatsappHref } from "@/lib/lead";
import { primeVoices, setVoiceEnabled, speak, stopSpeaking, voiceEnabled } from "@/lib/speech";
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
  "I'm looking to buy a home in Gurgaon",
  "I want an investment property",
  "Show me ready-to-move options",
  "Help me buy my first home",
];

/**
 * Contextual quick replies that guide the standard intake — the chips adapt to
 * the next thing the consultant needs to know, so users can tap instead of type.
 */
function nextSuggestions(r: ClientRequirements): string[] {
  if (r.intent === "unknown")
    return ["I want to buy a home", "I'm looking to invest", "I need rental income"];
  if (r.budgetMaxCr == null)
    return ["Under ₹1.5 Cr", "₹1.5–3 Cr", "₹3–6 Cr", "₹6 Cr+"];
  if (!r.city && r.localities.length === 0)
    return ["Gurugram", "Dwarka Expressway", "Sohna Road", "New Delhi"];
  if (!r.bhk && !r.propertyType)
    return ["2 BHK", "3 BHK", "4 BHK", "Commercial"];
  if (!r.timeline) return ["Ready to move", "Within 3 months", "Just exploring"];
  if (!r.possessionPref) return ["Ready to move", "Under construction", "No preference"];
  return [];
}

export default function ChatShell({
  variant = "full",
}: {
  /** "full" = chat + requirements panel; "widget" = compact chat only. */
  variant?: "full" | "widget";
}) {
  const isWidget = variant === "widget";
  const [messages, setMessages] = useState<UiMessage[]>([
    { role: "assistant", content: openingGreeting() },
  ]);
  const [requirements, setRequirements] =
    useState<ClientRequirements>(EMPTY_REQUIREMENTS);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shortlist, setShortlist] = useState<PropertyListing[]>([]);
  const [muted, setMuted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const submittedPhoneRef = useRef<string | null>(null);

  useEffect(() => {
    primeVoices();
    setMuted(!voiceEnabled());
  }, []);

  // When the client shares their phone, auto-submit the captured requirements +
  // shortlist to the team (Web3Forms) exactly once — the AI "fills the form".
  useEffect(() => {
    const phone = requirements.phone;
    if (!phone || submittedPhoneRef.current === phone) return;
    submittedPhoneRef.current = phone;
    void fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "ai-consultation",
        name: requirements.name ?? "",
        phone,
        email: requirements.email ?? "",
        interest: requirements.propertyType ?? "",
        message: "Auto-submitted by Ashirvad after an AI consultation.",
        requirementsText: requirementsText(requirements, shortlist),
        shortlist: shortlist.map((p) => p.title),
      }),
    }).catch(() => {});
  }, [requirements, shortlist]);

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
      stopSpeaking();

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
              if (ev.properties.length) setShortlist(ev.properties);
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
        // Read the reply aloud (each output has audio); muted respects prefs.
        if (assistantText.trim()) speak(assistantText);
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

  const suggestions = messages.length <= 1 ? SUGGESTIONS : nextSuggestions(requirements);
  const showSuggestions = !busy && !requirements.phone && suggestions.length > 0;

  return (
    <div
      className={
        isWidget
          ? "flex h-full min-h-0 flex-1 flex-col"
          : "grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]"
      }
    >
      {/* Chat column */}
      <section
        className={clsx(
          "flex flex-col overflow-hidden border-ink-950/10 bg-white",
          isWidget
            ? "h-full min-h-0 flex-1"
            : "min-h-[70vh] rounded-2xl border shadow-panel",
        )}
      >
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
          <button
            onClick={() => {
              const next = !muted;
              setMuted(next);
              setVoiceEnabled(!next);
              if (next) stopSpeaking();
            }}
            aria-label={muted ? "Unmute voice" : "Mute voice"}
            title={muted ? "Voice off" : "Voice on"}
            className="ml-auto rounded-lg border border-white/15 p-1.5 text-white/70 transition hover:text-gold-300"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
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

        {requirements.phone ? (
          <HandoffCard requirements={requirements} shortlist={shortlist} />
        ) : null}

        {showSuggestions ? (
          <div className="flex flex-wrap gap-2 border-t border-ink-950/5 px-4 py-3">
            {suggestions.map((s) => (
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
      {!isWidget ? (
        <div className="hidden min-h-0 lg:block">
          <RequirementsPanel requirements={requirements} />
        </div>
      ) : null}
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
          {message.content ? (
            <>
              {message.content}
              {streaming ? (
                <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-ink-950/50 align-middle" />
              ) : null}
            </>
          ) : streaming ? (
            <ThinkingIndicator />
          ) : null}
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

function HandoffCard({
  requirements,
  shortlist,
}: {
  requirements: ClientRequirements;
  shortlist: PropertyListing[];
}) {
  return (
    <div className="border-t border-emerald-100 bg-emerald-50/70 px-4 py-3">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-800">
        <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
        {requirements.name ? `Thanks, ${requirements.name}! ` : ""}All your details are noted.
      </p>
      <p className="mt-0.5 text-xs text-emerald-800/80">
        Our team will reach out on WhatsApp and email. You can also connect right now:
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        <a
          href={whatsappHref(requirements, shortlist)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3.5 py-2 text-xs font-semibold text-white transition hover:brightness-105"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={2} />
          Chat on WhatsApp
        </a>
        <a
          href={emailHref(requirements, shortlist)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-ink-950/15 bg-white px-3.5 py-2 text-xs font-semibold text-ink-950 transition hover:border-gold-500"
        >
          <Mail className="h-4 w-4" strokeWidth={1.75} />
          Email my details
        </a>
      </div>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <span className="inline-flex items-center gap-2 py-0.5">
      <span className="inline-flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-brand-500"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
      <span className="bg-gradient-to-r from-ink-950/40 via-ink-950/70 to-ink-950/40 bg-[length:500px_100%] bg-clip-text text-xs font-medium text-transparent animate-shimmer">
        {ADVISOR_NAME} is thinking…
      </span>
    </span>
  );
}
