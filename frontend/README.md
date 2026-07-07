# Service Finder — Frontend

React + Vite PWA. Google Maps only (per project brief), offline-first, real-time forum.

## Setup
```bash
npm install
cp .env.example .env   # fill in your Supabase + Google Maps keys
npm run dev
```

## Structure
- `src/components/map` — Google Maps + Waze-style hazard layer
- `src/components/forum` — real-time chat (Supabase Realtime)
- `src/components/admin` — approval/moderation queues
- `src/offline` — service worker + IndexedDB sync queue
- `src/hooks` — useAuth, useOffline
- `src/config` — Supabase client + feature flags

See `/docs/GIT_WORKFLOW.md` in the repo root for ticket/branch conventions.
