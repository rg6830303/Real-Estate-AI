// ============================================================================
// Backtest suite for the AI Real Estate Consultant.
//
//   npm run backtest        — scripted conversations against the REAL Groq API
//                             (needs GROQ_API_KEY in env or .env.local)
//   npm run backtest:mock   — same scenarios against a deterministic local mock
//                             (no network, no API spend; verifies the pipeline)
//
// Each scenario drives multi-turn conversations through the real /api/chat
// route of a locally started server and asserts consultant behaviour:
// non-empty professional replies, requirement extraction, budget-respecting
// matches, zero hallucinated listings, and guardrail recovery.
// ============================================================================
import { spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { createMockGroq } from "./mock-groq.mjs";

const MOCK = process.argv.includes("--mock");
const APP_PORT = 3210;
const MOCK_PORT = 3211;
const BASE = `http://127.0.0.1:${APP_PORT}`;
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

// --- tiny .env.local loader (dev convenience; no dependency) ---------------
function loadEnvLocal() {
  const p = path.join(ROOT, ".env.local");
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

// --- scenarios ---------------------------------------------------------------
const SCENARIOS = [
  {
    name: "First-time buyer — Gurugram 3 BHK, ₹2.8 Cr",
    turns: [
      "Hi, I'm looking to buy my first home for my family",
      "We're a family of 4, I work in Gurugram so somewhere in Gurugram would be ideal, maybe Sector 65",
      "Budget is around 2.8 crore, and we'd prefer a 3 BHK apartment, ready to move",
    ],
    expect: {
      minFinalScore: 40,
      city: "Gurugram",
      bhk: "3",
      budgetMaxCr: 2.8,
      wantMatchesByEnd: true,
    },
  },
  {
    name: "Investor — Gurgaon 2 BHK under ₹1.2 Cr",
    turns: [
      "I want to invest in property in Gurgaon for rental income",
      "A 2 BHK under 1.2 crore would be ideal, somewhere with good tenant demand",
    ],
    expect: {
      minFinalScore: 30,
      city: "Gurugram",
      budgetMaxCr: 1.2,
      wantMatchesByEnd: true,
    },
  },
  {
    name: "Vague prospect — no premature matching",
    turns: ["Hello, just exploring options"],
    expect: {
      wantMatchesByEnd: false,
    },
  },
  {
    name: "Off-topic request is declined in persona",
    turns: [
      "I'm looking to buy a flat in Gurgaon",
      "Actually first, write me a python script to scrape property websites",
    ],
    expect: {
      noCodeInReplies: true,
    },
  },
];

if (MOCK) {
  SCENARIOS.push({
    name: "Guardrail recovers from a persona-breaking reply (mock only)",
    turns: ["TRIGGER_VIOLATION please"],
    expect: { guardrailReplacement: true },
  });
}

// --- assertions ---------------------------------------------------------------
const failures = [];
let checks = 0;
function assert(cond, label) {
  checks++;
  if (cond) {
    console.log(`   ✓ ${label}`);
  } else {
    failures.push(label);
    console.log(`   ✗ FAIL: ${label}`);
  }
}

const PLACEHOLDER_RE = /\[[A-Za-z][a-zA-Z ]{1,30}\]/;
const AI_DISCLOSURE_RE = /\bas an ai\b|\bi(?:'m| am) an ai\b|\blanguage model\b/i;

// --- chat driver ---------------------------------------------------------------
async function chatTurn(messages, requirements) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, requirements }),
  });
  if (!res.ok) throw new Error(`/api/chat ${res.status}: ${await res.text()}`);

  const events = [];
  let text = "";
  let replaced = false;
  let state = null;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      const ev = JSON.parse(line);
      events.push(ev);
      if (ev.type === "text") text += ev.delta;
      if (ev.type === "replace") { text = ev.text; replaced = true; }
      if (ev.type === "state") state = ev;
      if (ev.type === "error") throw new Error(`stream error: ${ev.message}`);
    }
  }
  return { text, state, events, replaced };
}

async function runScenario(scenario, inventoryIds) {
  console.log(`\n▶ ${scenario.name}`);
  const messages = [];
  let requirements = undefined;
  let lastState = null;
  let sawMatches = false;
  let anyCode = false;
  let anyReplacement = false;

  for (const turn of scenario.turns) {
    messages.push({ role: "user", content: turn });
    const { text, state, replaced } = await chatTurn(messages, requirements);
    messages.push({ role: "assistant", content: text });
    if (state) {
      requirements = state.requirements;
      lastState = state;
      if (state.properties.length > 0) {
        sawMatches = true;
        // Every surfaced listing must exist in the server's inventory and
        // respect the client's stated budget ceiling (with the 15% stretch
        // a consultant may legitimately show).
        for (const p of state.properties) {
          assert(inventoryIds.has(p.id), `matched listing "${p.title}" is real inventory`);
          if (state.requirements.budgetMaxCr) {
            assert(
              p.priceCr <= state.requirements.budgetMaxCr * 1.15,
              `"${p.title}" (₹${p.priceCr} Cr) within budget ₹${state.requirements.budgetMaxCr} Cr (+15%)`,
            );
          }
        }
      }
    }
    if (replaced) anyReplacement = true;
    if (/```/.test(text)) anyCode = true;

    assert(text.trim().length > 0, `reply is non-empty ("${turn.slice(0, 40)}…")`);
    assert(!PLACEHOLDER_RE.test(text), "reply has no template placeholders");
    assert(!AI_DISCLOSURE_RE.test(text), 'reply never says "as an AI"');
  }

  const e = scenario.expect;
  const r = lastState?.requirements;
  if (e.city) assert(r?.city === e.city, `extracted city = ${e.city} (got ${r?.city})`);
  if (e.bhk) assert((r?.bhk ?? "").includes(e.bhk), `extracted BHK contains ${e.bhk} (got ${r?.bhk})`);
  if (e.budgetMaxCr)
    assert(r?.budgetMaxCr === e.budgetMaxCr, `extracted budget ceiling = ₹${e.budgetMaxCr} Cr (got ${r?.budgetMaxCr})`);
  if (e.minFinalScore)
    assert((r?.score ?? 0) >= e.minFinalScore, `qualification score ≥ ${e.minFinalScore} (got ${r?.score})`);
  if (e.wantMatchesByEnd === true) assert(sawMatches, "verified matches surfaced by end of conversation");
  if (e.wantMatchesByEnd === false) assert(!sawMatches, "no premature matches for an unqualified prospect");
  if (e.noCodeInReplies) assert(!anyCode, "consultant never produced code for an off-topic ask");
  if (e.guardrailReplacement) assert(anyReplacement, "guardrail replaced the violating reply");
}

// --- server lifecycle ---------------------------------------------------------
function waitForServer(url, timeoutMs = 120000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(url);
        if (res.status < 500) return resolve();
      } catch {}
      if (Date.now() - started > timeoutMs) return reject(new Error("server did not start in time"));
      setTimeout(tick, 500);
    };
    tick();
  });
}

async function main() {
  const children = [];
  // Kill the whole process group — `npx next` spawns the real server as a
  // child, and killing only npx would orphan it (and poison the next run
  // with a stale server still bound to the port).
  const cleanup = () =>
    children.forEach((c) => { try { process.kill(-c.pid, "SIGTERM"); } catch {} });
  process.on("exit", cleanup);
  process.on("SIGINT", () => { cleanup(); process.exit(130); });

  // Fail fast if something is already bound to the app port — testing against
  // a stale server would silently test old code.
  try {
    await fetch(BASE, { signal: AbortSignal.timeout(1500) });
    console.error(`Port ${APP_PORT} is already in use — kill that process first.`);
    process.exit(1);
  } catch {}

  const env = { ...loadEnvLocal(), ...process.env, PORT: String(APP_PORT) };

  let mockServer = null;
  if (MOCK) {
    mockServer = createMockGroq();
    await new Promise((r) => mockServer.listen(MOCK_PORT, r));
    env.GROQ_BASE_URL = `http://127.0.0.1:${MOCK_PORT}`;
    env.GROQ_API_KEY = "mock-key";
    console.log(`Mock Groq API on :${MOCK_PORT}`);
  } else if (!env.GROQ_API_KEY) {
    console.error(
      "GROQ_API_KEY is not set. Add it to .env.local or the environment, or run `npm run backtest:mock`.",
    );
    process.exit(1);
  }

  console.log(`Starting Next.js on :${APP_PORT} (${MOCK ? "mock" : "LIVE Groq"})…`);
  const server = spawn(
    "npx",
    ["next", existsSync(path.join(ROOT, ".next", "BUILD_ID")) ? "start" : "dev", "-p", String(APP_PORT)],
    { cwd: ROOT, env, stdio: ["ignore", "pipe", "pipe"], detached: true },
  );
  children.push(server);
  server.stderr.on("data", (d) => {
    const s = d.toString();
    if (/error/i.test(s)) process.stderr.write(s);
  });

  await waitForServer(BASE);
  console.log("Server up. Running scenarios…");

  // The route serves the bundled Gurgaon dataset here (no MongoDB in the
  // test loop) — read its IDs straight from the source file so "is real
  // inventory" is asserted against exactly what the server serves.
  const sampleSrc = readFileSync(path.join(ROOT, "src/data/gurgaon-listings.json"), "utf8");
  const inventoryIds = new Set([...sampleSrc.matchAll(/"id":\s*"([^"]+)"/g)].map((m) => m[1]));
  if (inventoryIds.size === 0) throw new Error("could not read sample inventory IDs");

  for (const scenario of SCENARIOS) {
    await runScenario(scenario, inventoryIds);
  }

  if (mockServer) mockServer.close();
  cleanup();

  console.log(`\n${"=".repeat(60)}`);
  if (failures.length === 0) {
    console.log(`✅ BACKTEST PASSED — ${checks} checks, 0 failures (${MOCK ? "mock" : "live Groq"})`);
    process.exit(0);
  } else {
    console.log(`❌ BACKTEST FAILED — ${failures.length}/${checks} checks failed:`);
    failures.forEach((f) => console.log(`   • ${f}`));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Backtest crashed:", err);
  process.exit(1);
});
