# Service Finder (Free Maps API — Super App Edition)

Monorepo for the LC Studio Service Finder project. Google Maps API is the
required, single map provider. See `docs/BLUEPRINT.md` for the full architecture,
team structure, Supabase schema, and Git workflow.

## Folders
- `frontend/` — React + Vite PWA (offline-first, Google Maps, chat, admin UI)
- `backend/` — Express + Supabase (auth, integrations, scheduled jobs)
- `docs/` — blueprint, git workflow, onboarding
- `.github/workflows/` — CI pipelines

## Quick start
```bash
# frontend
cd frontend && npm install && cp .env.example .env && npm run dev

# backend
cd backend && npm install && cp .env.example .env && npm run dev
```
