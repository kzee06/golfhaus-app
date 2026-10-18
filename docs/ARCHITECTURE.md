# GolfHaus v2 — Audit, Architecture & Data Model

**Status:** proposed (v2 rebuild branch) · **Date:** 2026-10-18

GolfHaus is being rebuilt from a golf-training app into a golf **GPS, scorecard and
social** platform: 18Birdies' utility + Strava's sharing + Apple's simplicity.
The scorecard is the product; GPS makes it useful; friends make it social;
sharing makes it memorable.

---

## 1. Audit of the existing app

| Area | Finding | Decision |
|---|---|---|
| Stack | Expo SDK 54, RN 0.81, React 19, TypeScript, EAS configured, web + Expo Go working | **Keep** |
| Navigation | Hand-rolled `phase → tab → overlay` state machine in one `App.tsx` | **Replace** with expo-router (file routes, deep links for invites/shares) |
| Design system | `theme.ts` tokens, Schibsted Grotesk + Manrope, SVG icon set, monochrome Apple-HIG look | **Keep & extend** (dark mode, outdoor contrast, score semantics) |
| Persistence | Local-first AsyncStorage with versioned keys | **Keep the pattern**, generalise to repositories + a sync boundary |
| Content model (`src/content`, 600 LOC) | Drill/exercise catalogue | **Remove** — not part of the product |
| Plan engine, session player, progress, weekly plan, coach | All drills-specific (~1,500 LOC) | **Remove** |
| Claude coach (`fetch` → Messages API) | Working, demo fallback | **Retire for now**; the pattern can return for a P2 AI caddie |
| Auth / backend | None (fully local) | **Add** — required for multiplayer, social, shareable links |
| Assets | Wordmark, hero, drill photos | Keep wordmark/hero; drop drill photos |

Net: ~4,400 LOC, of which ~3,800 is drills product code. We keep the base, the
design DNA and the local-first discipline; everything product-specific is rebuilt.

---

## 2. Architecture

### Client
- **Expo (SDK 54) + expo-router.** File-based routes give us deep links
  (`golfhaus://round/<id>`, `https://…/r/<id>`) for invites and external sharing
  for free, typed routes, and web + iOS + Android from one codebase.
- **Local-first.** Every round is written to the device first (AsyncStorage now;
  SQLite when volume warrants) and synced opportunistically. Scoring never waits
  on the network. A round has a `revision` counter and per-hole `updatedAt` so
  sync is a merge, not an overwrite.
- **Pure domain core.** `scoring/`, `gps/` and `courses/` are dependency-free
  TypeScript (no React, no storage) so they're unit-testable and reusable on a
  server.

### Backend (Phase 2+) — recommendation: **Supabase**
One managed Postgres gives us everything the spec needs without a custom server:
- **PostGIS** — efficient geospatial queries (courses near me, holes within a
  course, distances).
- **Realtime** — live leaderboards: every score write broadcasts to the round's
  channel.
- **Auth + Row-Level Security** — accounts, guests (anonymous sign-in), and
  per-row permissions (only round members can write scores; privacy on rounds).
- **Storage** — course imagery, shareable round cards.
- **Edge Functions** — course-data import jobs, share-card rendering, OG pages
  for links that open without the app.
Alternative considered: Firebase (weaker geospatial), custom Node + Postgres
(more to run). Supabase is the pragmatic choice. *Needs: a Supabase project
(free tier is fine to start).*

### Course data — no fabricated geometry
GPS distances are only shown when derived from real geospatial data.
- **Launch source: OpenStreetMap via the Overpass API.** OSM has a proper golf
  schema (`leisure=golf_course`, `golf=hole` with `par`/`ref`, `golf=green`,
  `golf=tee`, `golf=bunker`, `golf=water_hazard`, `golf=fairway`). Coverage is
  good for course outlines/names in Australia, partial for hole geometry. Free,
  licensed ODbL (attribution required).
- **Derived green points.** Middle = centroid of the green polygon; front/back =
  polygon vertices nearest/farthest from the tee along the hole. Clearly labelled
  as *green* distances; *pin* distance only when a pin location is known.
- **Manual courses.** Any course can be created by hand (par, stroke index,
  distances) so the scorecard always works. Marked `source: 'manual'`,
  `verified: false`.
- **Verified vs community.** Each course carries `source` and `verified`; users
  can report incorrect data. A commercial provider (e.g. iGolf, GolfBert) is the
  upgrade path for complete hole mapping — evaluate once usage justifies licensing.
- **Caching.** Fetched courses are cached on-device for play without signal.

### Navigation / IA
| Tab | Purpose |
|---|---|
| Home | Dashboard: resume round, recent rounds, quick start |
| Play | Start a round; during a round this is the gameplay UI (GPS · score · leaderboard) |
| Courses | Search, nearby, favourites, recents |
| Activity | Friends' rounds, kudos, achievements (Phase 3) |
| Profile | Stats, history, clubs, settings |
During an active round the app opens a dedicated **round stack** (hole view,
scorecard, leaderboard, summary) — one screen to score, never a menu dive.

---

## 3. Data model

```
Golfer        id, name, handle, avatarUrl, homeCourseId?, units ('m'|'yd'),
              clubs: ClubDistance[] (club, avgM, source: 'manual'|'tracked')

Course        id, name, location {lat,lng}, address?, city?, country,
              source 'osm'|'manual'|'provider', externalId?, verified,
              holes: Hole[], tees: TeeBox[], updatedAt
Hole          number, par, strokeIndex?, geometry?: HoleGeometry
TeeBox        id, name, colour?, rating?, slope?, holes: {hole, par?, distanceM?}[]
HoleGeometry  tee?, green? {front, middle, back, polygon?}, hazards?: Hazard[]
Hazard        kind 'bunker'|'water'|'oob'|'tree', point|polygon, carryM? (derived)

Round         id, courseId, courseSnapshot (name, holes, tee), holes 9|18,
              startHole, startedAt, completedAt?, status 'active'|'complete',
              visibility 'public'|'friends'|'private', revision,
              players: RoundPlayer[], scorekeeperId?
RoundPlayer   id, name, userId?|null (guest), isMe,
              scores: { [hole]: HoleScore }
HoleScore     strokes, putts?, fairway? 'hit'|'left'|'right'|'na', gir?,
              penalties?, updatedAt, by (playerId that wrote it)

Activity      id, roundId, golferId, summary (score, toPar, highlights),
              kudos: userId[], comments: Comment[]
Follow        followerId, followingId
```
Conflict handling for multiplayer: a score write carries the hole's `updatedAt`
it last saw; the server rejects stale writes (last-writer-wins per hole with
visible "updated by X" so nothing silently disappears).

---

## 4. Design system
- Keep the tokens, type scale and icon language; add **dark mode** (automatic)
  and an **outdoor** contrast target (all gameplay text ≥ 7:1).
- Score semantics use **shape + weight**, not just colour: eagle ◎, birdie ○,
  par plain, bogey □, double ▣ — readable in sun and colour-blind safe.
- Gameplay controls: ≥ 56pt tap targets, one-thumb reach, haptics on score.

---

## 5. Roadmap (P0 first)
| Phase | Scope | Priority |
|---|---|---|
| **1** (this branch) | New foundation, design system, domain core, **scorecard** (setup → live scoring → scorecard → summary → history), **courses** (OSM search/nearby, favourites, manual), Home + Profile stats, GPS engine + hole distances where geometry exists | P0 |
| 2 | Supabase: auth, cloud sync, **multiplayer rounds** with live leaderboard, invite links/QR, guests, conflict handling | P0 |
| 3 | Activity feed, follows, kudos, comments, share cards, public round pages | P1 |
| 4 | Club recommendations & hole strategy from club distances + GPS | P1 |
| 5 | Deeper stats, handicap, AI caddie | P2 |
