# Service Finder - Frontend

React + Vite PWA. Leaflet + OpenStreetMap + Waze deep links, Firestore suggestions.

## Setup
```bash
npm install
cp .env.example .env   # fill in Firebase + backend API values
npm run dev
```

## Structure
- `src/components/map` - Leaflet map and service markers
- `src/hooks` - Firebase auth context
- `src/config` - Firebase and Firestore helpers
- `src/App.jsx` - main service discovery flow
