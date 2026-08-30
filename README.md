# Prequal

**AI lead research & ICP fit scoring for outbound agencies.** Paste a CSV of
company domains (or point an inbound form at the webhook); Prequal researches
each company, scores it 0–10 against a per-client ICP document with a
three-bullet rationale (fit / signal / timing), runs paid enrichment only on
HOT leads, upserts to HubSpot with dedupe, and alerts Slack.

> Personal build. Built on [exa-labs/company-researcher](https://github.com/exa-labs/company-researcher)
> (MIT) — I added batch CSV processing, ICP-based scoring with Claude,
> HubSpot dedupe/upsert, HOT-only enrichment, Slack routing, and the agency
> dashboard. Demo brands and data are fictional.

## Why

Outbound agencies run campaigns for many clients, each with a different ICP.
Enrichment platforms burn credits on every row and gate CRM sync behind
higher tiers; reps ignore black-box scores. Prequal sits **next to** your
Clay/Apollo stack: it scrapes + reasons first (cheap), spends credits only
on leads worth it, explains every score, and never creates a duplicate
opportunity.

## Flow

```
CSV / inbound webhook
  → research (website, LinkedIn, funding, tech stack — Exa)
  → Claude scores vs per-client ICP doc (0–10 + rationale)
  → score ≥ 7 → paid enrichment → HubSpot upsert (dedupe) → Slack #hot-leads
  → 4–6      → human review queue
  → ≤ 3      → CRM log only
```

## Stack

Next.js 15 · Vercel AI SDK + Claude · Exa · HubSpot API · n8n (routing) ·
Postgres (leads table) · Tailwind

## Setup

```bash
npm install
cp .env.example .env.local   # fill keys
npm run dev
```

## Measured (this build, not client claims)

Metrics are collected from this repo's own test runs — see `docs/spec.md`
for the measurement protocol. No client-outcome numbers are claimed.

## License

MIT — see [LICENSE](LICENSE). Original work © Exa Labs; modifications © Oguz Kara.
