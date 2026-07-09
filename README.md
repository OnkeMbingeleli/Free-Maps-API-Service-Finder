# Service Finder (Free Maps API — Service Finder)

Monorepo for the LC Studio Service Finder project. The frontend uses Leaflet,
OpenStreetMap, Nominatim search, and Waze deep links, with Firestore for service
suggestions. See `docs/BLUEPRINT.md` for the full architecture and workflow.

## Folders
- `frontend/` — React + Vite PWA (Leaflet map, search/filter, Firestore suggestions)
- `backend/` — Express API (approved services, suggestion review, scheduled jobs)
- `docs/` — blueprint, git workflow, onboarding
- `.github/workflows/` — CI pipelines

## Quick start
```bash
# frontend
cd frontend && npm install && cp .env.example .env && npm run dev

# backend
cd backend && npm install && cp .env.example .env && npm run dev
```
