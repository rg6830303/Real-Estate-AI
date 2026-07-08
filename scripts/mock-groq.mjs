// Deterministic mock of the Groq chat-completions API, used by
// `npm run backtest:mock` so the full pipeline (extraction → matching →
// streaming → guardrails → UI protocol) can be verified end-to-end without
// network access or API spend. `npm run backtest` runs the same scenarios
// against the real Groq API.
import http from "node:http";

/** Crude keyword extraction standing in for the extraction model. */
function mockExtract(transcript) {
  // Like the real extractor is instructed to, only read the CLIENT's lines —
  // never treat the consultant's own words as client requirements.
  const t = transcript
    .split("\n")
    .filter((line) => line.startsWith("Client:"))
    .join("\n")
    .toLowerCase();
  const out = {
    intent: /invest/.test(t) ? "invest" : /\brent\b/.test(t) ? "rent" : /\bbuy|purchase|looking for|need a\b/.test(t) ? "buy" : "unknown",
    budgetLabel: null,
    budgetMaxCr: null,
    budgetMinCr: null,
    city: null,
    localities: [],
    propertyType: /villa/.test(t) ? "Villa" : /plot/.test(t) ? "Plot" : /apartment|flat|bhk/.test(t) ? "Apartment" : null,
    bhk: null,
    minAreaSqft: null,
    timeline: /3\s*months|soon|immediately|ready to move in/.test(t) ? "1-3 months" : null,
    financing: /home loan|loan/.test(t) ? "Home loan" : /self[- ]funded|cash/.test(t) ? "Self-funded" : null,
    purpose: /invest/.test(t) ? "Investment" : /family|live|own use/.test(t) ? "End use" : null,
    possessionPref: /ready[- ]to[- ]move/.test(t) ? "Ready to move" : null,
    mustHaves: /metro/.test(t) ? ["near metro"] : [],
    niceToHaves: [],
    familyContext: /family of (\d)/.test(t) ? `family of ${t.match(/family of (\d)/)[1]}` : null,
    notes: null,
    score: 0,
    temperature: "new",
  };

  const bhk = t.match(/(\d)\s*bhk/);
  if (bhk) out.bhk = `${bhk[1]} BHK`;

  if (/gurugram|gurgaon/.test(t)) out.city = "Gurugram";
  else if (/greater noida/.test(t)) out.city = "Greater Noida";
  else if (/noida/.test(t)) out.city = "Noida";
  else if (/dwarka/.test(t)) { out.city = "Delhi"; out.localities = ["Dwarka"]; }
  else if (/mumbai/.test(t)) out.city = "Mumbai";

  const sector = t.match(/sector\s*(\d+)/);
  if (sector) out.localities.push(`Sector ${sector[1]}`);

  const crore = t.match(/(?:under|upto|up to|around|budget[^.]*?)\s*(?:₹\s*)?(\d+(?:\.\d+)?)\s*(cr|crore)/);
  const lakh = t.match(/(\d+)\s*(?:lakh|lac|l\b)/);
  if (crore) {
    out.budgetMaxCr = Number(crore[1]);
    out.budgetLabel = `Up to ₹${crore[1]} Cr`;
  } else if (lakh) {
    out.budgetMaxCr = Number(lakh[1]) / 100;
    out.budgetLabel = `Up to ₹${lakh[1]} L`;
  }

  let score = 0;
  if (out.budgetMaxCr) score += 25;
  if (out.city || out.localities.length) score += 20;
  if (out.bhk || out.propertyType) score += 15;
  if (out.timeline) score += 20;
  if (out.financing) score += 10;
  if (out.intent === "buy" || out.intent === "invest") score += 10;
  out.score = score;
  out.temperature = score >= 75 ? "hot" : score >= 50 ? "warm" : score >= 25 ? "cold" : "new";
  return out;
}

/** Canned consultant-style streaming reply. */
function mockReply(messages) {
  const system = messages.find((m) => m.role === "system")?.content ?? "";
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  if (/TRIGGER_VIOLATION/.test(lastUser)) {
    // Simulates a model that broke persona — exercises the guardrail path.
    return "Sure! ```python\nprint('scraped listings')\n``` Here you go.";
  }
  const hasListings = !system.includes("(none matched yet");
  if (hasListings) {
    // Reference the first verified listing by name, like the real model would.
    const m = system.match(/• ([^—]+) —/);
    const name = m ? m[1].trim() : "the first option";
    return `Based on everything you've shared, I've shortlisted a few verified options for you — ${name} stands out for your needs, and I've noted why each one fits below. Would you like to schedule a visit to see it in person?`;
  }
  return "That's really helpful, thank you for sharing it. To make sure I shortlist only genuinely suitable options, may I ask what budget range you're comfortable with?";
}

export function createMockGroq() {
  return http.createServer(async (req, res) => {
    if (req.method !== "POST" || !req.url?.includes("/chat/completions")) {
      res.writeHead(404).end();
      return;
    }
    let body = "";
    for await (const chunk of req) body += chunk;
    const payload = JSON.parse(body);

    if (payload.response_format?.type === "json_object") {
      const transcript = payload.messages.find((m) => m.role === "user")?.content ?? "";
      const json = JSON.stringify(mockExtract(transcript));
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ choices: [{ message: { role: "assistant", content: json } }] }),
      );
      return;
    }

    const text = mockReply(payload.messages);
    if (payload.stream) {
      res.writeHead(200, { "Content-Type": "text/event-stream" });
      for (const word of text.split(/(\s+)/)) {
        if (!word) continue;
        res.write(
          `data: ${JSON.stringify({ choices: [{ delta: { content: word } }] })}\n\n`,
        );
      }
      res.write("data: [DONE]\n\n");
      res.end();
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ choices: [{ message: { role: "assistant", content: text } }] }));
  });
}

// Standalone: `node scripts/mock-groq.mjs [port]`
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.argv[2]) || 3211;
  createMockGroq().listen(port, () =>
    console.log(`Mock Groq API listening on http://127.0.0.1:${port}`),
  );
}
