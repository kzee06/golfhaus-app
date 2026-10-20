# Supabase (backend)

Project: **golfhaus** · region Oceania (Sydney) · ref `qehlheubdoheglackkxh`

## Migrations
`migrations/` is the source of truth for the schema. Files are numbered and
applied in order.

- `0001_init.sql` — applied 2026-10-20 via the dashboard SQL Editor.
- `0002_rounds_select_owner.sql` — applied 2026-10-20. Lets a round's creator
  read back the row they just inserted (`.insert().select()`); without it RLS
  returned 403 because `can_view_round()` can't see a row inserted in the same
  statement.

**Applying a new migration today:** paste the file into the SQL Editor
(Database → SQL Editor) and run it. The editor asks to confirm "destructive"
statements such as `drop … if exists`; that's expected for idempotent scripts.

**Switching to the CLI later:** `supabase link --project-ref qehlheubdoheglackkxh`
then `supabase db push`. Because 0001–0002 were applied by hand, first mark
them as applied so the CLI doesn't re-run them:
`supabase migration repair --status applied 0001 0002`.

## Settings that live outside SQL
- Extensions: `postgis` enabled (schema `extensions`).
- Auth → Sign In / Providers: **Allow anonymous sign-ins** = on (guests joining rounds).
  Turn on captcha before public launch.
- API: the app uses the **publishable** key (`EXPO_PUBLIC_SUPABASE_ANON_KEY`).
  Row-Level Security protects every table; the secret key is never shipped.

## Security model (see 0001_init.sql)
- Courses and hole geometry are public to read; signed-in users can add manual
  courses and edit only their own.
- Rounds are visible to members, or publicly / to followers by `visibility`.
- Scores are writable by the player themselves or the round's creator /
  scorekeeper. A `BEFORE UPDATE` trigger rejects stale writes (older
  `updated_at`) so simultaneous edits never silently overwrite each other.
- `join_round(code, name)` lets an account or guest join by invite code.
- Realtime is enabled on `rounds`, `round_players`, `hole_scores` for live
  leaderboards.

## Smoke test
`python3 -I supabase/tests/rls_smoke.py` runs 17 live checks with the public key
only — guest sign-in, creating and joining rounds, who may score whom, the
stale-write rule, privacy from strangers, and no scoring after completion.
Each run leaves a few anonymous users behind (Authentication → Users).
