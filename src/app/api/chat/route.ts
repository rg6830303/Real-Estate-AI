import { NextResponse } from "next/server";
import { consultantSystemPrompt } from "@/lib/consultant";
import { extractRequirements } from "@/lib/extract";
import { groqChatStream, type GroqMessage } from "@/lib/groq";
import { replyViolates, safeFallbackReply } from "@/lib/guardrails";
import {
  fetchActiveProperties,
  hasEnoughSignal,
  matchProperties,
} from "@/lib/properties";
import {
  EMPTY_REQUIREMENTS,
  type ChatMessage,
  type ChatStreamEvent,
  type ClientRequirements,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGES = 60;
const MAX_MESSAGE_CHARS = 2000;

interface ChatRequestBody {
  messages?: ChatMessage[];
  requirements?: ClientRequirements;
}

function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * The consultant pipeline, per turn:
 *   1. Re-extract the client's requirements from the full transcript (fast model).
 *   2. Deterministically match verified inventory once there's enough signal.
 *   3. Stream the consultant's reply (70B model) with the live requirements
 *      brief and ONLY the matched listings in context — it cannot present
 *      anything else, so recommendations are hallucination-free by design.
 *
 * Response is a newline-delimited JSON event stream (see ChatStreamEvent).
 */
export async function POST(req: Request) {
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const messages: ChatMessage[] = incoming
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({
      role: m.role,
      content: m.content.trim().slice(0, MAX_MESSAGE_CHARS),
    }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return badRequest("messages must end with a user message.");
  }

  const prevRequirements: ClientRequirements = body.requirements
    ? { ...EMPTY_REQUIREMENTS, ...body.requirements }
    : EMPTY_REQUIREMENTS;

  // Steps 1 + inventory fetch run concurrently — they're independent.
  const [requirements, inventory] = await Promise.all([
    extractRequirements(messages, prevRequirements),
    fetchActiveProperties(),
  ]);

  const matched = hasEnoughSignal(requirements)
    ? matchProperties(requirements, inventory)
    : [];

  const groqMessages: GroqMessage[] = [
    { role: "system", content: consultantSystemPrompt(requirements, matched) },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const encoder = new TextEncoder();
  const send = (controller: ReadableStreamDefaultController<Uint8Array>, ev: ChatStreamEvent) =>
    controller.enqueue(encoder.encode(JSON.stringify(ev) + "\n"));

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Ship the structured state first so the UI can update the
      // requirements panel and render property cards while text streams in.
      send(controller, { type: "state", requirements, properties: matched });

      try {
        let streamed = "";
        const full = await groqChatStream(groqMessages, (delta) => {
          streamed += delta;
          send(controller, { type: "text", delta });
        });

        // Output guardrail: if the finished reply broke persona or produced
        // template junk, swap the bubble's text for a safe recovery line.
        if (replyViolates(full) || !streamed.trim()) {
          send(controller, { type: "replace", text: safeFallbackReply() });
        }
        send(controller, { type: "done" });
      } catch (err) {
        send(controller, {
          type: "error",
          message:
            err instanceof Error ? err.message : "The consultant is briefly unavailable.",
        });
        send(controller, { type: "done" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
