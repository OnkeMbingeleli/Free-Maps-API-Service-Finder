# Service Finder — Backend

Express + Supabase. All external data (social media, radio, gov stats) is
pulled **automatically** on a schedule — see `src/jobs/scheduler.js`. No
manual data entry is part of the normal workflow; the admin panel's manual
radio-entry form is a fallback only, used when the automated job is flagged
as failing (see `src/monitoring/alerts`).

## Setup
```bash
npm install
cp .env.example .env   # fill in Supabase, Google Maps, Twitter/Facebook, radio, Slack keys
npm run dev
```

## Database
Run `db/schema.sql` in the Supabase SQL editor before starting the server —
it creates every table plus RLS policies and the hazard auto-decay trigger.

## Structure
- `src/routes` + `src/controllers` — REST API (services, forum, admin)
- `src/middleware` — auth, rate limiting, error handling
- `src/services` — Google Maps wrapper, offline-sync conflict resolution
- `src/integrations` — the three AUTOMATIC ingestion jobs (social/radio/gov)
- `src/jobs/scheduler.js` — cron schedule wiring it all together
- `src/monitoring` — health check, metrics, Slack/email alerts on failure
- `db/schema.sql` — full Supabase schema + RLS + triggers

See `/docs/BLUEPRINT.md` in the repo root for the full architecture and git workflow.
