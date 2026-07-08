# Real Estate AI Consultant

A production-ready **AI property consultant** for real-estate agency websites. It chats with prospective clients exactly like a senior human consultant — discovering their real requirements (budget, location, configuration, timeline, financing, lifestyle must-haves), advising on trade-offs like a professional, and recommending **only verified listings** from your own inventory. Powered by **Groq** (Llama 3.3 70B) with a **Supabase**-backed property database, deployable to **Vercel** in minutes.

Evolved from the [enquiry-nurturing / LeadPilot](https://github.com/ThestralWarrior/enquiry-nurturing) speed-to-lead project, rebuilt around Groq with a substantially deeper consultant brain.

## What makes the consultant professional

- **Discovery before recommendation.** A structured consulting methodology in the system prompt: listen → acknowledge → discover one theme at a time (intent, purpose, budget & financing, location anchors, configuration, timeline, possession preference, must-haves, family context) → advise → recommend.
- **Real consultant reasoning.** Discusses ready-to-move vs under-construction trade-offs, carpet vs super built-up area, RERA, total cost beyond the sticker price — briefly, and only when it helps.
- **Zero hallucinated properties, by architecture.** A deterministic matcher scores your inventory against the extracted requirement profile; the model is only ever given the matched, verified listings and is instructed it has no other inventory. If nothing matches, it keeps discovering instead of inventing.
- **Live requirement extraction.** Every turn, a fast model (Llama 3.1 8B, JSON mode) re-reads the transcript and maintains a structured `ClientRequirements` profile — shown live in the UI's "Your requirements" panel and scored 0–100 with hot/warm/cold lead temperature for your sales team.
- **Guardrails.** Output-side checks catch persona breaks ("as an AI…"), template junk and off-topic compliance, replacing them with a safe recovery line mid-stream.

## Architecture

```
Browser (ChatShell) ── POST /api/chat (NDJSON stream)
                          │
                          ├─ 1. extractRequirements()   Groq 8B, JSON mode
                          ├─ 2. fetchActiveProperties() Supabase REST → fallback sample data
                          ├─ 3. matchProperties()       deterministic scoring, no model call
                          └─ 4. groqChatStream()        Groq 70B consultant reply, streamed
```

Key files:

| Path | Purpose |
|---|---|
| `src/lib/consultant.ts` | The consultant persona + methodology (system prompt) |
| `src/lib/extract.ts` | Per-turn structured requirement extraction |
| `src/lib/properties.ts` | Supabase inventory access + deterministic matcher |
| `src/lib/guardrails.ts` | Output safety checks |
| `src/app/api/chat/route.ts` | The pipeline endpoint (streaming) |
| `src/components/ChatShell.tsx` | Chat UI with live requirements panel & property cards |
| `supabase/schema.sql` | Full database schema + seed listings |
| `scripts/backtest.mjs` | Automated conversation backtests (live + mock) |

## Quick start (local)

```bash
npm install
cp .env.example .env.local     # then paste your GROQ_API_KEY
npm run dev                    # http://localhost:3000
```

Without Supabase configured, the consultant recommends from bundled sample Delhi NCR listings, so everything works out of the box.

## Deploy to Vercel

1. Push this repo to GitHub (already done if you're reading it there).
2. In [Vercel](https://vercel.com/new), **Import** the repository — Next.js is auto-detected; no build settings needed.
3. Add Environment Variables (Project → Settings → Environment Variables):
   - `GROQ_API_KEY` — **required** (create at https://console.groq.com/keys)
   - `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — once your Supabase project exists
   - Optional branding: `NEXT_PUBLIC_AGENCY_NAME`, `NEXT_PUBLIC_ADVISOR_NAME`, `NEXT_PUBLIC_MARKET_REGION`, `NEXT_PUBLIC_SERVICE_AREAS`
4. Deploy. The chat is served at `/`, the API at `/api/chat`.

> ⚠️ **Never commit API keys.** If a key has ever been shared in chat, email, or a commit, rotate it at console.groq.com first.

## Connect Supabase (real property data)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates `properties`, `leads`, and `messages` tables (RLS enabled, deny-by-default) and seeds sample listings.
3. Add your real inventory to `properties` (Table Editor or SQL `insert`). Columns of note:
   - `price_cr` — asking price in ₹ crore (`0.85` = ₹85 L)
   - `intent_fit` — array of `buy` / `rent` / `invest`
   - `active` — set `false` to pull a listing from circulation instantly
   - `highlights` — the one-line consultant note shown to clients
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` on Vercel and redeploy. The consultant switches from sample data to your live inventory automatically (with sample data remaining as an outage fallback).

## Backtesting the agent

```bash
npm run backtest        # scripted conversations against the REAL Groq API
npm run backtest:mock   # same scenarios, deterministic offline mock (no API spend)
```

Scenarios cover: a first-time buyer being qualified over multiple turns, an investor with a budget cap, a vague prospect (asserting **no premature recommendations**), an off-topic request (asserting the consultant declines in persona), and a guardrail-recovery case. Assertions include: extraction correctness (city/BHK/budget), qualification scoring, every surfaced listing existing in real inventory and respecting the stated budget (+15% max stretch), and no template placeholders or persona breaks in any reply.

## Embedding into a client website

The app is a standalone page, ready to be used as-is on a subdomain (e.g. `advisor.youragency.com`) or embedded:

```html
<iframe
  src="https://your-deployment.vercel.app"
  style="position:fixed;bottom:24px;right:24px;width:420px;height:640px;border:0;border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.24);z-index:9999"
  title="Property consultant chat"
></iframe>
```

All branding is env-driven (`NEXT_PUBLIC_AGENCY_NAME`, advisor name, region, service areas), so one deployment per client is the only change needed.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `GROQ_API_KEY` | ✅ | Groq API key (server-only) |
| `GROQ_MODEL` | — | Consultant model (default `llama-3.3-70b-versatile`) |
| `GROQ_EXTRACT_MODEL` | — | Extraction model (default `llama-3.1-8b-instant`) |
| `NEXT_PUBLIC_SUPABASE_URL` | — | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | — | Server-only key used to read `properties` |
| `NEXT_PUBLIC_AGENCY_NAME` / `NEXT_PUBLIC_ADVISOR_NAME` / `NEXT_PUBLIC_MARKET_REGION` / `NEXT_PUBLIC_SERVICE_AREAS` | — | White-label branding |
