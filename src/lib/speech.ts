/**
 * Voice helper for Ashirvad. Primary path is natural neural TTS (/api/tts,
 * Groq PlayAI — a warm male voice). If that's unavailable it falls back to the
 * browser SpeechSynthesis voice, preferring a male English voice. Preference
 * persists in localStorage; everything degrades silently.
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

let currentAudio: HTMLAudioElement | null = null;
let cachedVoice: SpeechSynthesisVoice | null = null;
let ttsAvailable = true; // flips false after a server-TTS failure to avoid retries

const MALE_HINT =
  /(david|mark|guy|ryan|george|daniel|fred|thomas|arthur|male|liam|william|brian|eric|christopher|paul|alex)/i;

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  cachedVoice =
    voices.find((v) => MALE_HINT.test(v.name) && /^en/i.test(v.lang)) ??
    voices.find((v) => MALE_HINT.test(v.name)) ??
    voices.find((v) => /en[-_]IN/i.test(v.lang)) ??
    voices.find((v) => /^en/i.test(v.lang)) ??
    voices[0];
  return cachedVoice;
}

export function primeVoices(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  pickVoice();
  window.speechSynthesis.onvoiceschanged = () => pickVoice();
}

function normalize(text: string): string {
  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_`#>|]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function synthSpeak(clean: string): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean.slice(0, 700));
    const v = cachedVoice ?? pickVoice();
    if (v) u.voice = v;
    u.rate = 1.0;
    u.pitch = 0.95; // slightly lower = more natural male tone
    u.lang = v?.lang ?? "en-IN";
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking(): void {
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
  } catch {
    /* noop */
  }
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* noop */
  }
}

/** Speak `text` — neural voice if available, else browser fallback. */
export async function speak(text: string, opts: { force?: boolean } = {}): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!opts.force && !voiceEnabled()) return false;
  const clean = normalize(text);
  if (!clean) return false;
  stopSpeaking();

  if (ttsAvailable) {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: clean.slice(0, 1200) }),
      });
      if (res.ok) {
        const url = URL.createObjectURL(await res.blob());
        const audio = new Audio(url);
        currentAudio = audio;
        audio.onended = () => {
          URL.revokeObjectURL(url);
          if (currentAudio === audio) currentAudio = null;
        };
        try {
          await audio.play();
        } catch {
          /* autoplay blocked before first gesture — caption still shows */
        }
        return true;
      }
      ttsAvailable = false; // model unavailable (e.g. terms not accepted) → stop retrying
    } catch {
      /* network error — fall through to browser voice */
    }
  }
  return synthSpeak(clean);
}
