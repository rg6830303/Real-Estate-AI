"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Volume2, VolumeX, X } from "lucide-react";
import { ADVISOR_NAME } from "@/lib/config";
import { primeVoices, setVoiceEnabled, speak, stopSpeaking, voiceEnabled } from "@/lib/speech";

/** Page-specific spoken intro shown as a caption that leads into the chat. */
function introFor(pathname: string): string {
  if (pathname === "/")
    return `Welcome to Radiance Realtors. I'm ${ADVISOR_NAME}, your personal AI property consultant. Tell me your budget and where you'd like to live, and I'll shortlist the perfect homes for you.`;
  if (pathname === "/properties")
    return `You're browsing our verified properties. Tell me your budget, location and configuration, and I'll narrow these down to your best matches in seconds.`;
  if (pathname.startsWith("/property-detail"))
    return `Interested in this property? I can share current pricing, arrange a site visit, or find similar options that fit your budget. Just ask me.`;
  if (pathname === "/builders")
    return `These are the trusted developers we represent. Tell me which builder or budget you prefer and I'll show you their best available homes.`;
  if (pathname === "/about" || pathname === "/mission-vision")
    return `At Radiance Realtors, we put your needs first. Whenever you're ready, tell me what you're looking for and I'll guide you to the right property.`;
  if (pathname === "/contact")
    return `Would you like the team to reach out? You can drop your details here, or simply chat with me and I'll take everything down for you.`;
  if (pathname === "/blog")
    return `Exploring our market insights? If any project catches your eye, ask me and I'll pull up the details and pricing.`;
  if (pathname === "/career")
    return `Thinking of joining Radiance Realtors? Explore our open roles below — and if you're here for a property instead, just ask me.`;
  return `Hello! I'm ${ADVISOR_NAME}, your AI property consultant. Ask me anything about our properties and I'll help you find the right fit.`;
}

export default function PageVoiceIntro() {
  const pathname = usePathname();
  const [text, setText] = useState("");
  const [show, setShow] = useState(false);
  const [muted, setMuted] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    primeVoices();
    setMuted(!voiceEnabled());
  }, []);

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin") || pathname === "/consultant") {
      setShow(false);
      return;
    }
    // Once per unique page per browser session.
    let seen: string[] = [];
    try {
      seen = JSON.parse(sessionStorage.getItem("ashirvad_seen") ?? "[]");
    } catch {
      seen = [];
    }
    if (seen.includes(pathname)) return;
    seen.push(pathname);
    try {
      sessionStorage.setItem("ashirvad_seen", JSON.stringify(seen));
    } catch {
      /* noop */
    }

    const line = introFor(pathname);
    setText(line);
    setShow(true);
    void speak(line); // may be autoplay-blocked before first interaction; caption still shows

    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShow(false), 15000);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [pathname]);

  if (!show) return null;

  function openChat() {
    stopSpeaking();
    setShow(false);
    window.dispatchEvent(new Event("ashirvad:open"));
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    setVoiceEnabled(!next);
    if (next) stopSpeaking();
    else void speak(text, { force: true });
  }

  return (
    <div className="fixed bottom-24 right-4 z-40 w-[300px] max-w-[calc(100vw-2rem)] animate-riseIn rounded-2xl rounded-br-sm border border-gold-500/30 bg-white p-4 shadow-panel">
      <div className="flex items-start gap-2.5">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-950 text-sm font-semibold text-gold-300">
          {ADVISOR_NAME.charAt(0)}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 animate-pulse rounded-full border-2 border-white bg-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-ink-950">{ADVISOR_NAME}</p>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleMute}
                aria-label={muted ? "Unmute intro" : "Mute intro"}
                className="rounded p-1 text-ink-950/40 transition hover:text-ink-950"
              >
                {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => {
                  stopSpeaking();
                  setShow(false);
                }}
                aria-label="Dismiss"
                className="rounded p-1 text-ink-950/40 transition hover:text-ink-950"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-ink-950/75">{text}</p>
          <button
            onClick={openChat}
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-gold-500 px-3 py-1.5 text-xs font-semibold text-ink-950 transition hover:bg-gold-400"
          >
            <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} />
            Chat with {ADVISOR_NAME}
          </button>
        </div>
      </div>
    </div>
  );
}
