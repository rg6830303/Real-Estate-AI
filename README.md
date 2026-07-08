# Real Estate AI Consultant

A production-ready **AI property consultant** for real-estate agency websites. It chats with prospective clients exactly like a senior human consultant — discovering their real requirements (budget, location, configuration, timeline, financing, lifestyle must-haves), advising on trade-offs like a professional, and recommending **only verified listings** from your own inventory, with honest deal analysis (₹/sq ft value, ready vs under-construction, developer strength). Powered by **Groq** (Llama 3.3 70B) with a **MongoDB Atlas** property database, deployable to **Vercel** in minutes.

Evolved from the [enquiry-nurturing / LeadPilot](https://github.com/ThestralWarrior/enquiry-nurturing) speed-to-lead project, rebuilt around Groq with a substantially deeper consultant brain.

## What makes the consultant professional

- **Discovery before recommendation.** A structured consulting methodology in the system prompt: listen → acknowledge → discover one theme at a time (intent, purpose, budget & financing, location anchors, configuration, timeline, possession preference, must-haves, family context) → advise → recommend.
- **Real consultant reasoning.** Discusses ready-to-move vs under-construction trade-offs, carpet vs super built-up area, RERA, total cost beyond the sticker price — briefly, and only when it helps.
- **Deal-maker value talk.** Every verified listing carries its ₹/sq ft rate; the consultant compares space-per-rupee across options, weighs possession certainty against pricing, and says plainly which option is the strongest deal for *this* client — using only the listing data it was given.
- **Zero hallucinated properties, by architecture.** A deterministic matcher scores your inventory against the extracted requirement profile; the model is only ever given the matched, verified listings and is instructed it has no other inventory. If nothing matches, it keeps discovering instead of inventing.
- **Live requirement extraction.** Every turn, a fast model (Llama 3.1 8B, JSON mode) re-reads the transcript and maintains a structured `ClientRequirements` profile — shown live in the UI's "Your requirements" panel and scored 0–100 with hot/warm/cold lead temperature for your sales team.
- **Guardrails.** Output-side checks catch persona breaks ("as an AI…"), template junk and off-topic compliance, replacing them with a safe recovery line mid-stream.

## Architecture

```
Browser (ChatShell) ── POST /api/chat (NDJSON stream)
                          │
                          ├─ 1. extractRequirements()   Groq 8B, JSON mode
                          ├─ 2. fetchActiveProperties() MongoDB Atlas → bundled Gurgaon fallback
                          ├─ 3. matchProperties()       deterministic scoring, no model call
                          └─ 4. groqChatStream()        Groq 70B consultant reply, streamed
```

Key files:

| Path | Purpose |
|---|---|
| `src/lib/consultant.ts` | The consultant persona + methodology (system prompt) |
| `src/lib/extract.ts` | Per-turn structured requirement extraction |
| `src/lib/mongodb.ts` | Cached MongoDB Atlas connection |
| `src/lib/properties.ts` | Inventory access, auto-seeding, deterministic matcher |
| `src/data/gurgaon-listings.json` | 20 real Gurgaon projects (dataset + DB seed) |
| `src/app/api/chat/route.ts` | The pipeline endpoint (streaming) |
| `src/app/api/seed/route.ts` | One-click database seeding/refresh |
| `src/app/api/health/route.ts` | Production health check (Groq + Mongo + inventory) |
| `src/components/ChatShell.tsx` | Chat UI with live requirements panel & property cards |
| `scripts/backtest.mjs` | Automated conversation backtests (live + mock) |

## Quick start (local)

```bash
npm install
cp .env.example .env.local     # then paste your GROQ_API_KEY (+ MONGODB_URI if you have it)
npm run dev                    # http://localhost:3000
```

Without MongoDB configured, the consultant serves the bundled 20 real Gurgaon listings from memory, so everything works out of the box.

## Deploy to Vercel

1. Import the repo at [vercel.com/new](https://vercel.com/new) — Next.js is auto-detected.
2. Add Environment Variables (Project → Settings → Environment Variables, **Production** scope):
   - `GROQ_API_KEY` — **required** (create at https://console.groq.com/keys)
   - `MONGODB_URI` — your Atlas connection string (added automatically if you used Vercel's MongoDB Atlas integration)
   - `MONGODB_DB` — optional, defaults to `realestate`
   - Optional branding: `NEXT_PUBLIC_AGENCY_NAME`, `NEXT_PUBLIC_ADVISOR_NAME`, `NEXT_PUBLIC_MARKET_REGION`, `NEXT_PUBLIC_SERVICE_AREAS`
3. Deploy, then verify in one click:
   - **`https://<your-app>.vercel.app/api/health`** → should show `"healthy": true`, `"groqApi": "ok"`, `"mongodb": "ok"` and the active listing count.
   - The database **auto-seeds itself** with the 20 Gurgaon listings on the first chat request if the collection is empty. You can also trigger it explicitly at **`/api/seed`** (or `/api/seed?force=1` to refresh seeded rows).

> ⚠️ **Never commit API keys or connection strings.** If a credential has ever been shared in chat, email, or a commit, rotate it (Groq: console.groq.com; Atlas: Database Access → Edit password).

## The property database (MongoDB Atlas)

Collection: **`properties`** in database **`realestate`** (override with `MONGODB_DB`). Document shape:

```jsonc
{
  "_id": "sobha-city-s108",          // stable slug (string)
  "title": "Sobha City",
  "developer": "Sobha",
  "city": "Gurugram",
  "locality": "Sector 108, Dwarka Expressway",
  "propertyType": "Apartment",        // Apartment | Villa | Builder Floor | Plot | Penthouse | Commercial
  "bhk": "3 BHK",                     // null for Plot / Commercial
  "priceCr": 2.85,                    // asking price in ₹ crore (0.92 = ₹92 L)
  "areaSqft": 2100,
  "possession": "Ready to move",      // or "Under construction"
  "possessionDate": null,              // e.g. "Dec 2028" when under construction
  "intentFit": ["buy", "invest"],     // any of buy | rent | invest
  "amenities": ["Clubhouse", "..."],
  "highlights": "One-line consultant note shown to clients",
  "reraId": null,                      // fill in the official HRERA registration no.
  "imageUrl": "https://…",            // any hosted photo URL
  "active": true                       // set false to pull a listing instantly
}
```

Manage inventory in the Atlas UI (Data Explorer) or any Mongo client — add documents in this shape and the consultant serves them on the next request (60s inventory cache at most). The bundled seed uses **real Gurgaon projects** (Sobha City, Godrej Meridien, ATS Tourmaline, M3M Golf Estate, DLF The Arbour, Signature Global City 92, …) with **indicative July-2026 market pricing** and representative photos — replace prices/photos with your agency's actual mandate data as deals move, and fill in real RERA IDs.

## Backtesting the agent

```bash
npm run backtest        # scripted conversations against the REAL Groq API
npm run backtest:mock   # same scenarios, deterministic offline mock (no API spend)
```

Scenarios cover: a first-time buyer being qualified over multiple turns, an investor with a budget cap, a vague prospect (asserting **no premature recommendations**), an off-topic request (asserting the consultant declines in persona), and a guardrail-recovery case. Assertions include: extraction correctness (city/BHK/budget), qualification scoring, every surfaced listing existing in real inventory and respecting the stated budget (+15% max stretch), and no template placeholders or persona breaks in any reply.

## Embedding into a client website

Use as-is on a subdomain (e.g. `advisor.youragency.com`) or embed:

```html
<iframe
  src="https://your-deployment.vercel.app"
  style="position:fixed;bottom:24px;right:24px;width:420px;height:640px;border:0;border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.24);z-index:9999"
  title="Property consultant chat"
></iframe>
```

All branding is env-driven, so one deployment per client is the only change needed.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `GROQ_API_KEY` | ✅ | Groq API key (server-only) |
| `MONGODB_URI` | recommended | Atlas connection string (server-only) |
| `MONGODB_DB` | — | Database name (default `realestate`) |
| `SEED_TOKEN` | — | If set, `/api/seed` requires `?token=` |
| `GROQ_MODEL` / `GROQ_EXTRACT_MODEL` | — | Model overrides |
| `NEXT_PUBLIC_AGENCY_NAME` / `NEXT_PUBLIC_ADVISOR_NAME` / `NEXT_PUBLIC_MARKET_REGION` / `NEXT_PUBLIC_SERVICE_AREAS` | — | White-label branding |
