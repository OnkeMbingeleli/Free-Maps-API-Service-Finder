# SERVICE FINDER — PROJECT BLUEPRINT
### LC Studio | "Free Maps API – Service Finder"
**Deadline:** 31 July 2026, presentation 3pm
**Purpose of this doc:** single source of truth. Anyone — dev, QA, SM, or PO — should be able to open this file, find where a thing lives, and know how to fix it.

---

## 1. REPO STRUCTURE (Monorepo, one main GitHub project)

One repo. Two top-level folders. Everything traceable.

```
service-finder/                          <-- MAIN REPO (GitHub org: lcstudio-service-finder)
│
├── README.md                            <-- Entry point. Links to this blueprint.
├── BLUEPRINT.md                         <-- This document, kept in sync
├── .github/
│   ├── workflows/                       <-- CI/CD pipelines (lint, test, build, deploy)
│   │   ├── backend-ci.yml
│   │   ├── frontend-ci.yml
│   │   └── deploy.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── ticket.md
│   └── PULL_REQUEST_TEMPLATE.md
│
├── backend/                              <-- BACKEND SQUAD
│   ├── src/
│   │   ├── api/                          <-- Express route handlers
│   │   ├── auth/                         <-- Firebase/Supabase auth logic
│   │   ├── services/                     <-- business logic (maps, ingestion, forum)
│   │   ├── integrations/                 <-- social media, radio, gov data pullers
│   │   ├── jobs/                         <-- cron jobs / schedulers
│   │   ├── middleware/                   <-- security, rate limiting, validation
│   │   └── config/
│   ├── tests/
│   ├── docs/
│   │   ├── API_REFERENCE.md
│   │   └── DB_SCHEMA.md
│   └── package.json
│
├── frontend/                              <-- FRONTEND SQUAD
│   ├── src/
│   │   ├── components/                    <-- shared UI (map, cards, filters, chat)
│   │   ├── pages/                         <-- screens/routes
│   │   ├── hooks/
│   │   ├── store/                         <-- state management
│   │   ├── offline/                       <-- service worker, sync queue, cache
│   │   ├── styles/
│   │   └── assets/
│   ├── public/
│   │   └── manifest.json                  <-- PWA manifest
│   ├── tests/
│   └── package.json
│
├── shared/                                <-- types, constants shared by both squads
│   └── types/
│
└── docs/
    ├── ONBOARDING.md
    ├── GIT_WORKFLOW.md
    └── SUPABASE_SCHEMA.md
```

**Rule of thumb for "where do I fix this?":**
- Map/markers/UI bug → `frontend/src/components/`
- Login/session bug → `backend/src/auth/` (mirrored contract in `frontend/src/hooks/useAuth`)
- Data not updating from Twitter/Facebook/radio/gov site → `backend/src/integrations/`
- Chat/forum bug → `backend/src/services/forum` + `frontend/src/components/chat`
- App not working with no signal → `frontend/src/offline/`

---

## 2. TEAM STRUCTURE & GIT WORKFLOW

### 2.1 Org chart (per side — Backend AND Frontend each have this same shape)

```
                         PRODUCT OWNER (PO)
                                │
        ┌───────┬───────┬───────┼───────┬───────┬───────┐
       SM1     SM2     SM3     SM4     SM5     SM6        (6 Scrum Masters)
        │       │       │       │       │       │
   7 devs   7 devs   7 devs   7 devs   7 devs   7 devs     (7 devs each)
        │
   2 of those 7 devs are rotated in as QA for that SM's squad
```

- Backend: 6 SMs × 7 devs = 42 devs, with 2 QA pulled per squad (12 QA total) → PO
- Frontend: 6 SMs × 7 devs = 42 devs, with 2 QA pulled per squad (12 QA total) → PO
- Total: 84 devs, 24 acting as QA, 12 SMs, 1–2 PO(s) overseeing both folders

### 2.2 Branch / ticket naming convention

**Format:** `devname/ticket-number/folder`

Examples:
```
thabo/BE-104/backend
lindiwe/FE-088/frontend
sipho/BE-112/backend
```

- `devname` = dev's first name or agreed handle (must match GitHub username so it's traceable)
- `ticket-number` = from the board (e.g. `BE-104` for backend ticket 104, `FE-088` for frontend ticket 88)
- `folder` = `backend` or `frontend` (which top-level folder this ticket touches)

### 2.3 The submission flow ("dev → SM bench → QA → PO")

1. **Dev** picks up ticket, branches as `devname/ticket-number/folder`, works only inside their assigned folder.
2. **Dev pushes to the Scrum Master's bench branch** — NOT straight to `main`. Each SM owns a bench branch:
   `bench/sm1-backend`, `bench/sm2-backend` … `bench/sm1-frontend` … `bench/sm6-frontend`.
3. Dev opens a PR: `devname/ticket-number/folder` → `bench/smX-<folder>`.
4. **SM reviews** (or delegates first pass to senior dev), merges into their bench branch once it's clean.
5. **SM promotes** the bench branch into the folder's staging branch: `staging/backend` or `staging/frontend`.
6. **QA** (the 2 rotated devs for that squad) tests the ticket on `staging/<folder>` and either:
   - ✅ approves → SM merges to `develop/<folder>`
   - ❌ rejects → sends back to the original dev with notes, cycle repeats
7. Once `develop/backend` and `develop/frontend` are both stable, **PO does final review** and merges both into `main` for release.

```
dev branch → SM bench → SM's staging branch → QA sign-off → develop/<folder> → PO review → main
```

This means a dev never has to know the whole repo — they only ever aim at their own SM's bench. The SM is the traffic controller who pushes work into the real backend/frontend structures.

### 2.4 GitHub setup checklist
- Branch protection on `main`, `develop/backend`, `develop/frontend` (PO approval required)
- Branch protection on `staging/*` (QA approval required)
- CODEOWNERS file mapping folders to SMs
- Required status checks: lint, unit tests, build, before any merge
- Squash-merge only, commit message must include ticket number

---

## 3. SUPABASE SCHEMA (mock DB → production DB)

| Table | Key Columns | Notes |
|---|---|---|
| `profiles` | id (uuid, FK auth.users), full_name, phone, role (user/moderator/admin), trust_score, language_pref, created_at | role drives RLS policies |
| `services` | id, name, type (clinic/library/shelter/police/etc.), lat, lng, address, hours_json, contact, verified (bool), source (official/user_submitted), created_by, status (approved/pending/rejected) | core map data |
| `service_suggestions` | id, submitted_by, name, type, lat, lng, notes, status, reviewed_by, reviewed_at | feeds the admin panel |
| `service_reports` | id, service_id, user_id, report_type (closed/wrong_info/hazard/queue_long), description, upvotes, created_at | Waze-style live reporting |
| `hazards` | id, lat, lng, type (flood/road_closure/protest/loadshedding), reported_by, confirmations, expires_at | Waze-style live hazards |
| `forum_threads` | id, service_id (nullable), title, created_by, created_at, pinned (bool) | chat/forum |
| `forum_messages` | id, thread_id, user_id, message, created_at, edited_at, flagged (bool) | realtime via Supabase Realtime |
| `social_feed_items` | id, platform (x/facebook/instagram/radio), external_id, content, media_url, service_type_tag, fetched_at | populated by ingestion jobs |
| `gov_stats_cache` | id, source_url, category, data_json, fetched_at | scraped/synced govt stats |
| `radio_announcements` | id, station, headline, body, audio_url, published_at, ingested_at | from radio integration |
| `notifications` | id, user_id, type, payload_json, read (bool), created_at | push/SMS/WhatsApp queue |
| `admin_actions` | id, admin_id, action_type, target_table, target_id, note, created_at | audit trail |
| `offline_sync_queue` | id, user_id, action_type, payload_json, synced (bool), created_at | actions made offline, replayed on reconnect |

**Row-Level Security (RLS) — non-negotiable:**
- `services`: public read on `approved`; only `admin`/`moderator` can write directly; users write to `service_suggestions` instead.
- `forum_messages`: only authenticated users can insert; only author or moderator can update/delete.
- `admin_actions`: insert/select restricted to `role = admin`.

---

## 4. EXTERNAL DATA INGESTION — ALL SOURCES PULL AUTOMATICALLY

Everything in this section runs on its own schedule with no human needed to press a button. Manual entry exists only as a fallback for the rare moment a source breaks, not as the plan.

### 4.1 Social media pull (backend/src/integrations/social/) — AUTOMATIC
- Official APIs only (avoid scraping — breaks constantly and can breach ToS):
  - **X (Twitter) API v2** — filtered stream / recent search endpoint, **polling automatically every 5–10 min**, tagged by hashtags relevant to public services (#loadshedding, #serviceoutage, station handles).
  - **Facebook/Instagram Graph API** — Page/Business accounts of clinics, municipalities, radio stations; **auto-poll** `/posts` and `/media` endpoints on the same schedule.
  - Results normalized and written straight into `social_feed_items` by the job — no admin touches this.
- Runs as a scheduled job (`backend/src/jobs/socialSync.js`) via cron/GitHub Actions/`pg_cron`, never on-request.

### 4.2 Radio station announcements — AUTOMATIC (scrape/RSS first, manual is the fallback, not the plan)
- **Primary path — automated scrape/RSS job:** `backend/src/jobs/radioSync.js` runs on a schedule (e.g. every 10–15 min) and:
  1. Pulls the station's public RSS/news feed if one exists.
  2. If no RSS, does a scheduled scrape of the station's news/announcements page (`services/scraping/radioParser.ts`), parses new headlines, and writes them straight into `radio_announcements` automatically.
  3. Deduplicates by headline+timestamp so the same announcement isn't ingested twice.
- **If the station provides a webhook or shared feed later**, the job just points at that instead of scraping — same automatic pipeline, better source.
- **Manual admin entry is a fallback only** — it exists in the admin panel purely for the moment the automated job fails (site redesign breaks the scraper, feed goes down) and gets flagged by the monitoring/alerting in §12C so an admin knows to step in temporarily. It is never the primary way announcements get in.

### 4.3 Government stats — AUTOMATIC
- Target: Stats SA, gov.za municipal services pages, provincial health/social development portals.
- **Scheduled job** (`backend/src/jobs/govStatsSync.js`) runs automatically (e.g. every 6 hours) to fetch and diff published stats/pages, writing structured results into `gov_stats_cache` with zero manual step.
- Each source wrapped in its own try/catch so one broken source doesn't take down the whole sync job — a failed source triggers a §12C alert instead of silently going stale, and only then does an admin get a manual-override option as a stopgap.

---

## 5. CHAT FORUM
- Real-time using Supabase Realtime channels, one channel per `forum_threads.id`.
- Thread types: general community, per-service (e.g. "Clinic X queue today"), announcements (admin-pinned, read-only for regular users).
- Moderation: flag button → `flagged = true` → admin queue; auto-hide after N flags pending review.
- Rate-limit posting (e.g. 1 message per 3 seconds) to curb spam — enforce both client-side and in RLS/Edge Function.

---

## 6. "USE ALL FEATURES FROM WAZE" — BUILT ON TOP OF GOOGLE MAPS (as required by the brief)

**Important decision:** the brief names Google Maps API specifically in the milestones and success criteria, so Google Maps stays the one and only map provider. We are not swapping to Mapbox or pulling from an unofficial Waze SDK/API (no such public API exists for third-party apps anyway). Instead, every Waze-style behavior below is built using Google Maps' official APIs plus our own Supabase data layer — same user experience, zero unsupported dependencies.

| Waze feature | How it's built on Google Maps |
|---|---|
| Live hazard/incident reports | Our own `hazards` + `hazard_confirmations` tables, rendered as custom markers (`AdvancedMarkerElement`) on the Google Map |
| Community confirmation ("still there?") | Upvote/confirm button on reports; auto-decay trigger removes stale unconfirmed hazards (see §6A) |
| Turn-by-turn navigation | Google Maps **Directions API**, embedded per service |
| ETA | Google Maps **Distance Matrix API** |
| Re-routing around a reported hazard | Client excludes/detours around unresolved hazard radius using Directions API waypoints |
| Gamification (points, ranks) | Points for verified suggestions/reports, badges, leaderboard tied to `trust_score` — entirely our own layer |
| Voice guidance | Directions steps read aloud via the browser's built-in **Web Speech API** (`speechSynthesis`) — no extra paid API |
| Voice search | Web Speech API (`SpeechRecognition`) — "find nearest clinic" |
| Crowd-sourced map edits | `service_suggestions` table, admin-reviewed |
| Live user count / "people nearby" | Supabase Realtime presence channel, shown in the marker's info window |
| Alerts while en route | Push/SMS alert when approaching a reported hazard near a saved route |

---

## 6A. HAZARD AUTO-DECAY (a real gap — a hazard report needs to expire on its own, not just sit there)

```sql
CREATE TABLE hazard_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hazard_id uuid REFERENCES hazards(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE (hazard_id, user_id)  -- one confirmation per user per hazard
);

CREATE OR REPLACE FUNCTION decay_hazard_trust()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confirmations < 3 AND NEW.created_at < NOW() - INTERVAL '2 hours' THEN
    NEW.status = 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hazard_decay_check
BEFORE UPDATE ON hazards
FOR EACH ROW EXECUTE FUNCTION decay_hazard_trust();
```

---

## 7. OFFLINE-FIRST ARCHITECTURE
- Build as a **PWA** (installable, works with no connection).
- **Service worker** caches: app shell, last-viewed map tiles, last-fetched service list per area.
- **IndexedDB** stores: favourited services, draft forum posts, pending suggestions/reports.
- **Background Sync API**: queues writes (new suggestion, report, chat message) in `offline_sync_queue` locally, auto-replays to Supabase when connection returns.
- **Offline map tiles**: pre-cache a radius around the user's last known location; degrade gracefully to a static list view if map tiles aren't cached.
- Clear UI indicator: "You're offline — showing last saved data from [time]."

**Conflict resolution (what happens when two people submit conflicting offline data):**
```sql
ALTER TABLE offline_sync_queue ADD COLUMN conflict_resolution_strategy TEXT DEFAULT 'last_write_wins';
ALTER TABLE offline_sync_queue ADD COLUMN client_timestamp TIMESTAMPTZ;
```
- **Strategy 1 — last write wins:** if `client_timestamp` is newer than the server record's `updated_at`, the client version wins.
- **Strategy 2 — merge:** for additive fields (e.g. notes), combine rather than overwrite.
- **Strategy 3 — flag for admin review:** if the conflict touches core fields (lat/lng, name), don't auto-resolve — write both versions and set `needs_review = true`, surfaced in the admin panel.

---

## 8. THINKING BEYOND THE BRIEF — LOCAL-CONTEXT ("OUT OF THIS WORLD" FOR REAL CONDITIONS)
Ideas particularly valuable in South African / broader African context, not usually seen in Silicon-Valley-style briefs:

- **Data-saver / low-bandwidth mode**: text-only fallback view, compressed images, tile-lite map mode for users on limited data bundles.
- **USSD/SMS fallback**: for users without smartphones or data, a USSD menu or SMS keyword system to query "nearest clinic" and get a text-back address.
- **WhatsApp bot integration**: hugely popular locally — a WhatsApp Business bot mirrors core search + announcement features for zero-data-app users.
- **Load-shedding awareness**: tag services with generator/backup-power status; factor outage schedules into "is this service likely open now."
- **11 official South African languages** (or at minimum the top 4–5 by region) with easy language toggle, plus icon-first UI for low-literacy users.
- **Community trust score / verified-local badge**: locals who consistently submit accurate info get elevated trust, reducing moderation load.
- **Emergency SOS shortcut**: one-tap access to nearest police/clinic/shelter with auto-shared location to emergency contact.
- **Accessibility-first**: screen reader support, high-contrast mode, large-tap-target mode for older users.

---

## 9. SECURITY
- Auth: Firebase/Supabase Auth with email+password and optional social login; JWT session tokens; refresh-token rotation.
- Roles: `user`, `moderator`, `admin`, enforced via Supabase RLS, never trusted from the client alone.
- Input validation & sanitization on every write endpoint (forum posts, suggestions, reports) to block XSS/injection.
- Rate limiting on auth endpoints and forum posting (backend middleware).
- Admin actions logged to `admin_actions` for full audit trail.
- Secrets (API keys for Maps, social APIs) kept server-side only, never shipped to frontend bundle.
- Optional 2FA for admin/moderator accounts given their elevated write access.

---

## 10. ADMIN / CONTROLLER PANEL
- Review queue for `service_suggestions` (approve/reject/edit before publish).
- Moderation queue for flagged forum messages and reports.
- Manual entry form for radio announcements — **fallback only**, used solely when the automated scrape/RSS job (§4.2) is flagged as failing; not the everyday path.
- Dashboard: active users, pending suggestions, top reported hazards, data-source health (last successful sync time per integration — so a broken social/gov feed is visible immediately, not silently dead).
- Role management (promote/demote users).

---

## 11. FILTERS (frontend)
- By service type (clinic, library, shelter, police, etc.)
- By status (open now / verified / user-submitted pending)
- By distance / "within X km"
- By accessibility (wheelchair access, generator/backup power)
- By language of service (where relevant, e.g. clinic staff languages)
- By recent activity (recently reported issues first)

---

## 12. TOP-SPEC IDEAS TO MAKE THIS STUNNING
- **AI assistant chat** ("Where's the nearest open clinic with short queues right now?") using the same data as the map, answering in plain language.
- **Predictive "likely open" indicator** using historical hours + load-shedding schedule + recent reports, instead of just static operating hours.
- **Live heatmap layer** (Google Maps' built-in `google.maps.visualization.HeatmapLayer`) showing service density and report activity per area — no extra provider needed.
- **AR "look through camera" wayfinding** for the last 200m on mobile.
- **Community leaderboard** with monthly recognition for top verified contributors.
- **Dark mode + full theming**, smooth micro-interactions on map pins via custom `AdvancedMarkerElement` styling.
- **One-tap share** of a service location via WhatsApp/SMS — pre-filled Google Maps link + message, no app download needed on the receiving end.
- **Progressive onboarding** — app is usable anonymously first, account only required to suggest/report/chat, lowering the barrier for first-time users.
- **"Opens in 15 min" live countdown** on service cards, using operating hours + current time.
- **Queue-busyness estimator** — users mark quiet/busy/very busy on check-in, aggregated into a simple bar on the service card, so people stop making a trip for nothing.
- **Service check-in** — "X people here now," a lightweight live-crowd signal built on the same presence channel as the chat.
- **Emergency Mode** — one toggle: map narrows to only hospitals/police/shelters, icons enlarge, location auto-shares to an emergency contact.
- **Long-press "report this"** directly on a pin (closed / moved / wrong hours) — updates instantly for everyone else, true Waze-style crowd power without leaving the map.

---

## 12A. TESTING STRATEGY & QA SIGN-OFF (previously missing — every ticket needs a real "done" definition)

```
backend/tests/
├── unit/           <-- services, utilities (Jest/Vitest)
├── integration/    <-- API endpoints, DB queries (Supertest + test DB)
├── e2e/            <-- full user flows (Playwright/Cypress)
└── load/           <-- k6 scripts, target: 1000 concurrent users

frontend/tests/
├── unit/           <-- components (React Testing Library)
├── integration/    <-- multi-component page interactions
└── e2e/            <-- cross-browser (Playwright)
```

**QA sign-off checklist (attach to every ticket before it can be promoted from staging):**
- [ ] Unit tests pass (>80% coverage on new code)
- [ ] Integration tests pass
- [ ] Manual regression on the affected area
- [ ] Mobile responsive check (iOS + Android viewport)
- [ ] Offline mode verified (DevTools offline toggle)
- [ ] No console errors
- [ ] Lighthouse score >90 (Performance + Accessibility)

---

## 12B. DEPLOYMENT ENVIRONMENTS

| Environment | Example URL | Purpose |
|---|---|---|
| `dev` | `dev.service-finder.lcstudio.co.za` | Devs test individual features |
| `staging` | `staging.service-finder.lcstudio.co.za` | QA + SM integration testing |
| `pre-prod` | `preprod.service-finder.lcstudio.co.za` | PO final sign-off before release |
| `prod` | `service-finder.lcstudio.co.za` | Live |

- **Frontend hosting:** Vercel or Netlify free tier, automatic preview deploy per PR
- **Backend:** Node/Express server (Render.com free/low tier) + Supabase for DB/Auth/Realtime
- **Scheduled jobs:** GitHub Actions scheduled workflows, or Supabase's `pg_cron`, for the social/gov/radio sync jobs (kept as real scheduled jobs, not Edge Functions, since scraping and API polling need a full runtime, not Deno's limited edge environment)

---

## 12C. MONITORING & FEATURE FLAGS

```
backend/src/monitoring/
├── healthCheck.ts      <-- /health endpoint, pinged by uptime monitor
├── metrics.ts          <-- basic request/error metrics
└── alerts/
    ├── slackAlert.ts    <-- notifies SMs if a scraper/integration fails
    └── emailAlert.ts    <-- notifies PO if prod goes down
```

This directly answers "how do we know a social/gov/radio feed silently died" — the Data Source Health panel in the admin dashboard reads from this, and alerts fire before a user ever notices stale data.

```typescript
// frontend/src/config/features.ts
export const FEATURES = {
  AI_ASSISTANT: process.env.REACT_APP_AI_ENABLED === 'true',
  OFFLINE_MODE: true, // always on, core to the brief
  WHATSAPP_SHARE: true,
  EMERGENCY_MODE: true,
  GAMIFICATION: true,
};
```
Feature flags let 84 devs ship incrementally without waiting for every feature to be finished before anything goes live.

---

## 12D. AI ASSISTANT — COST-CONSCIOUS STACK

| Need | Recommendation | Why |
|---|---|---|
| Intent classification ("I have a headache" → clinic) | HuggingFace free-tier Inference API (e.g. a small DistilBERT-class model) | Free/cheap, good enough for a handful of intent buckets |
| Service search | Supabase full-text search (built into Postgres) | Already in the stack, zero extra cost |
| Conversational assistant | Any pay-as-you-go LLM API (OpenAI, or a cheaper aggregator) used sparingly, with the full-text search doing the heavy lifting first | Keeps per-query cost low; LLM is a fallback layer, not the primary search |
| Voice search | Browser's built-in Web Speech API | Free, no API key |

---

## 13. DOCUMENT MAINTENANCE
Whoever touches architecture, schema, or team structure updates this file in the same PR as their change. If it's not documented here, it doesn't count as done.
