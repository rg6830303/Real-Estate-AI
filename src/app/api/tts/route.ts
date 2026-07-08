import { NextResponse } from "next/server";
import { GROQ_BASE_URL } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Natural, human-sounding text-to-speech via Groq's PlayAI neural TTS (uses the
 * existing GROQ_API_KEY). Returns WAV audio the browser plays for a warm male
 * voice — far more human than the browser's robotic SpeechSynthesis, which the
 * client falls back to only if this is unavailable.
 *
 * NOTE: enable the `playai-tts` model once in the Groq console (accept its
 * terms) or this returns an error and the client uses the browser fallback.
 */
const MAX_CHARS = 1200;

export async function POST(req: Request) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return NextResponse.json({ error: "TTS not configured" }, { status: 503 });

  let text = "";
  try {
    text = String(((await req.json()) as { text?: string }).text ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!text) return NextResponse.json({ error: "No text" }, { status: 400 });

  // Orpheus is Groq's current expressive TTS (playai-tts was decommissioned).
  const model = process.env.GROQ_TTS_MODEL ?? "canopylabs/orpheus-v1-english";
  const voice = process.env.GROQ_TTS_VOICE ?? "troy"; // natural male voice

  try {
    const res = await fetch(`${GROQ_BASE_URL}/audio/speech`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        voice,
        input: text.slice(0, MAX_CHARS),
        response_format: "wav",
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `TTS ${res.status}`, detail: detail.slice(0, 200) },
        { status: 502 },
      );
    }
    const audio = Buffer.from(await res.arrayBuffer());
    return new Response(new Uint8Array(audio), {
      headers: { "Content-Type": "audio/wav", "Cache-Control": "no-store" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "TTS failed" },
      { status: 502 },
    );
  }
}
