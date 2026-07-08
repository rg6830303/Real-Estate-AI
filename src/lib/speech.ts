/**
 * Lightweight voice helper built on the browser SpeechSynthesis API — no keys,
 * no cost, works offline. Used for per-page intros and to read out each of
 * Ashirvad's replies. Voice preference persists in localStorage; everything
 * degrades silently where speech synthesis is unavailable or autoplay-blocked.
 */
const KEY = "ashirvad_voice";

export function voiceEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) !== "off";
}

export function setVoiceEnabled(on: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, on ? "on" : "off");
  if (!on) stopSpeaking();
}

let cachedVoice: SpeechSynthesisVoice | null = null;

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  cachedVoice =
    voices.find((v) => /en[-_]IN/i.test(v.lang)) ??
    voices.find((v) => /en[-_]GB/i.test(v.lang)) ??
    voices.find((v) => /^en/i.test(v.lang)) ??
    voices[0];
  return cachedVoice;
}

/** Warm up the voice list (it loads asynchronously in most browsers). */
export function primeVoices(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  pickVoice();
  window.speechSynthesis.onvoiceschanged = () => pickVoice();
}

/** Speak `text` (cancels anything currently speaking). Returns true if started. */
export function speak(text: string, opts: { force?: boolean } = {}): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  if (!opts.force && !voiceEnabled()) return false;
  const clean = text.replace(/[*_`#>|>]+/g, "").replace(/\s+/g, " ").trim();
  if (!clean) return false;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean.slice(0, 700));
    const v = cachedVoice ?? pickVoice();
    if (v) u.voice = v;
    u.rate = 1.02;
    u.pitch = 1.0;
    u.lang = v?.lang ?? "en-IN";
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* noop */
  }
}
