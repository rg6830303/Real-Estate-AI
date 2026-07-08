import { GROQ_BASE_URL, GROQ_MODEL, GROQ_EXTRACT_MODEL } from "./config";

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function apiKey(): string {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it in .env.local (development) or in your Vercel project's Environment Variables.",
    );
  }
  return key;
}

async function post(body: Record<string, unknown>): Promise<Response> {
  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Groq API error ${res.status}: ${detail.slice(0, 400) || res.statusText}`,
    );
  }
  return res;
}

/**
 * Streaming chat completion. Calls `onDelta` for each text fragment and
 * resolves with the full reply text.
 */
export async function groqChatStream(
  messages: GroqMessage[],
  onDelta: (delta: string) => void | Promise<void>,
  opts: { temperature?: number; maxTokens?: number; model?: string } = {},
): Promise<string> {
  const res = await post({
    model: opts.model ?? GROQ_MODEL,
    messages,
    temperature: opts.temperature ?? 0.6,
    max_tokens: opts.maxTokens ?? 700,
    stream: true,
  });

  const reader = res.body?.getReader();
  if (!reader) throw new Error("Groq API returned no response body.");

  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Server-sent events: lines of "data: {...}" terminated by "data: [DONE]"
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        const delta: string = json.choices?.[0]?.delta?.content ?? "";
        if (delta) {
          full += delta;
          await onDelta(delta);
        }
      } catch {
        // Ignore malformed keep-alive fragments.
      }
    }
  }
  return full;
}

/**
 * Non-streaming JSON-mode completion for structured extraction. Returns the
 * parsed object, or null if the model produced unparseable output — callers
 * must treat null as "no update this turn", never as a hard failure.
 */
export async function groqJson<T>(
  messages: GroqMessage[],
  opts: { temperature?: number; maxTokens?: number; model?: string } = {},
): Promise<T | null> {
  const res = await post({
    model: opts.model ?? GROQ_EXTRACT_MODEL,
    messages,
    temperature: opts.temperature ?? 0,
    max_tokens: opts.maxTokens ?? 900,
    response_format: { type: "json_object" },
    stream: false,
  });
  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";
  try {
    return JSON.parse(content) as T;
  } catch {
    // Some models wrap JSON in fences despite json_object mode.
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}
