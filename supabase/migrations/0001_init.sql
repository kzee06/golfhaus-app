-- GolfHaus schema v1 — golfers, courses (PostGIS), rounds, live scoring, social.
-- Applied to the golfhaus project. See docs/ARCHITECTURE.md §3 for the model.
-- Conventions: every table has RLS; helper functions are SECURITY DEFINER so
-- policies never recurse; writes are stamped with updated_at for merge-sync.

create extension if not exists postgis with schema extensions;
create extension if not exists pgcrypto with schema extensions;

-- ─── Golfers ────────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  handle text unique,
  avatar_url text,
  units text not null default 'm' check (units in ('m','yd')),
  home_course_id uuid,
  is_guest boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create a profile row for every new auth user (incl. anonymous guests).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, is_guest)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), coalesce(new.is_anonymous, false))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Courses ────────────────────────────────────────────────────────────────

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location extensions.geography(Point, 4326),
  address text,
  city text,
  country text,
  source text not null default 'manual' check (source in ('osm','manual','provider')),
  external_id text unique,           -- e.g. OSM "way/123"
  verified boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index courses_location_gix on public.courses using gist (location);
create index courses_name_idx on public.courses using gin (to_tsvector('simple', name));

create table public.holes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  number int not null check (number between 1 and 18),
  par int not null default 4 check (par between 3 and 6),
  stroke_index int check (stroke_index between 1 and 18),
  tee extensions.geography(Point, 4326),
  green_front extensions.geography(Point, 4326),
  green_middle extensions.geography(Point, 4326),
  green_back extensions.geography(Point, 4326),
  green_polygon extensions.geography(Polygon, 4326),
  unique (course_id, number)
);

create table public.hazards (
  id uuid primary key default gen_random_uuid(),
  hole_id uuid not null references public.holes(id) on delete cascade,
  kind text not null check (kind in ('bunker','water','oob','tree')),
  point extensions.geography(Point, 4326) not null,
  polygon extensions.geography(Polygon, 4326)
);

create table public.tee_boxes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  name text not null,
  colour text,
  rating numeric(4,1),
  slope int
);

create table public.tee_holes (
  tee_id uuid not null references public.tee_boxes(id) on delete cascade,
  hole_number int not null check (hole_number between 1 and 18),
  distance_m int,
  par int,
  primary key (tee_id, hole_number)
);

create table public.course_reports (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  message text not null,
  created_at timestamptz not null default now()
);

-- ─── Rounds & scoring ───────────────────────────────────────────────────────

create table public.rounds (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  course_snapshot jsonb not null,      -- frozen name/holes/tee at time of play
  hole_count int not null check (hole_count in (9,18)),
  start_hole int not null default 1 check (start_hole in (1,10)),
  status text not null default 'active' check (status in ('active','complete')),
  visibility text not null default 'private' check (visibility in ('public','friends','private')),
  revision int not null default 1,
  created_by uuid not null references public.profiles(id) on delete cascade,
  scorekeeper_id uuid references public.profiles(id) on delete set null,
  invite_code text unique,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);
create index rounds_created_by_idx on public.rounds (created_by, started_at desc);

-- Short, unambiguous invite code (no 0/O/1/I).
create or replace function public.gen_invite_code() returns text
language sql volatile as $$
  select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', (floor(random()*32))::int + 1, 1), '')
  from generate_series(1, 6)
$$;
create or replace function public.rounds_set_invite_code() returns trigger
language plpgsql as $$
begin
  if new.invite_code is null then
    loop
      new.invite_code := public.gen_invite_code();
      exit when not exists (select 1 from public.rounds where invite_code = new.invite_code);
    end loop;
  end if;
  return new;
end $$;
create trigger rounds_invite_code before insert on public.rounds
  for each row execute function public.rounds_set_invite_code();

create table public.round_players (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.rounds(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,   -- null = unlinked guest
  name text not null,
  is_guest boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index round_players_round_idx on public.round_players (round_id);
create unique index round_players_user_uniq on public.round_players (round_id, user_id) where user_id is not null;

create table public.hole_scores (
  round_id uuid not null references public.rounds(id) on delete cascade,
  player_id uuid not null references public.round_players(id) on delete cascade,
  hole int not null check (hole between 1 and 18),
  strokes int not null check (strokes between 1 and 30),
  putts int check (putts between 0 and 15),
  fairway text check (fairway in ('hit','left','right','na')),
  gir boolean,
  penalties int check (penalties between 0 and 10),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  primary key (round_id, player_id, hole)
);

-- Conflict rule: a write must carry an updated_at newer than what's stored,
-- otherwise it's stale (someone else scored this hole since) and is rejected.
-- The client then refetches and shows "updated by X" — nothing silently lost.
create or replace function public.reject_stale_score() returns trigger
language plpgsql as $$
begin
  if new.updated_at <= old.updated_at then
    raise exception 'stale write for hole % (server has newer score)', new.hole
      using errcode = 'P0001', hint = 'refetch';
  end if;
  return new;
end $$;
create trigger hole_scores_stale before update on public.hole_scores
  for each row execute function public.reject_stale_score();

-- ─── Social ─────────────────────────────────────────────────────────────────

create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null unique references public.rounds(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  summary jsonb not null,   -- score, to_par, holes, highlights, partners
  created_at timestamptz not null default now()
);
create index activities_user_idx on public.activities (user_id, created_at desc);

create table public.kudos (
  activity_id uuid not null references public.activities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (activity_id, user_id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

-- ─── Helpers (SECURITY DEFINER so policies don't recurse) ───────────────────

create or replace function public.is_round_member(rid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.rounds r where r.id = rid and (r.created_by = auth.uid() or r.scorekeeper_id = auth.uid())
  ) or exists (
    select 1 from public.round_players p where p.round_id = rid and p.user_id = auth.uid()
  )
$$;

create or replace function public.can_view_round(rid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.rounds r
    where r.id = rid and (
      r.visibility = 'public'
      or public.is_round_member(rid)
      or (r.visibility = 'friends' and exists (
        select 1 from public.follows f where f.follower_id = auth.uid() and f.following_id = r.created_by))
    )
  )
$$;

-- Can the caller write this player's scores? Their own row, or they run the round.
create or replace function public.can_score_player(pid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.round_players p
    join public.rounds r on r.id = p.round_id
    where p.id = pid and r.status = 'active' and (
      p.user_id = auth.uid() or r.created_by = auth.uid() or r.scorekeeper_id = auth.uid()
    )
  )
$$;

-- Join a round by invite code (account or guest). Returns the round id.
create or replace function public.join_round(code text, display_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare rid uuid; uid uuid := auth.uid();
begin
  if uid is null then raise exception 'sign in (or continue as guest) to join'; end if;
  select id into rid from public.rounds where invite_code = upper(code) and status = 'active';
  if rid is null then raise exception 'no active round for code %', code; end if;
  insert into public.round_players (round_id, user_id, name, is_guest, position)
  values (rid, uid, coalesce(nullif(display_name, ''), 'Golfer'),
          coalesce((select is_guest from public.profiles where id = uid), false),
          (select count(*) from public.round_players where round_id = rid))
  on conflict (round_id, user_id) where user_id is not null do nothing;
  return rid;
end $$;

-- Courses near a point, nearest first (metres).
create or replace function public.courses_nearby(lat double precision, lng double precision, radius_m int default 30000, lim int default 40)
returns table (id uuid, name text, city text, country text, source text, verified boolean, distance_m double precision, lat double precision, lng double precision)
language sql stable as $$
  select c.id, c.name, c.city, c.country, c.source, c.verified,
         extensions.st_distance(c.location, extensions.st_setsrid(extensions.st_makepoint(lng, lat), 4326)::extensions.geography) as distance_m,
         extensions.st_y(c.location::extensions.geometry) as lat, extensions.st_x(c.location::extensions.geometry) as lng
  from public.courses c
  where c.location is not null
    and extensions.st_dwithin(c.location, extensions.st_setsrid(extensions.st_makepoint(lng, lat), 4326)::extensions.geography, radius_m)
  order by distance_m
  limit lim
$$;

-- ─── Row-Level Security ─────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.holes enable row level security;
alter table public.hazards enable row level security;
alter table public.tee_boxes enable row level security;
alter table public.tee_holes enable row level security;
alter table public.course_reports enable row level security;
alter table public.rounds enable row level security;
alter table public.round_players enable row level security;
alter table public.hole_scores enable row level security;
alter table public.follows enable row level security;
alter table public.activities enable row level security;
alter table public.kudos enable row level security;
alter table public.comments enable row level security;

-- profiles: anyone signed in can see basic profiles; you edit your own.
create policy profiles_select on public.profiles for select to authenticated using (true);
create policy profiles_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- courses & geometry: public to read; signed-in users may add manual courses and edit their own.
create policy courses_select on public.courses for select to anon, authenticated using (true);
create policy courses_insert on public.courses for insert to authenticated with check (created_by = auth.uid() and source = 'manual');
create policy courses_update on public.courses for update to authenticated using (created_by = auth.uid() and source = 'manual') with check (created_by = auth.uid());
create policy holes_select on public.holes for select to anon, authenticated using (true);
create policy holes_write on public.holes for all to authenticated
  using (exists (select 1 from public.courses c where c.id = course_id and c.created_by = auth.uid() and c.source = 'manual'))
  with check (exists (select 1 from public.courses c where c.id = course_id and c.created_by = auth.uid() and c.source = 'manual'));
create policy hazards_select on public.hazards for select to anon, authenticated using (true);
create policy tee_boxes_select on public.tee_boxes for select to anon, authenticated using (true);
create policy tee_boxes_write on public.tee_boxes for all to authenticated
  using (exists (select 1 from public.courses c where c.id = course_id and c.created_by = auth.uid() and c.source = 'manual'))
  with check (exists (select 1 from public.courses c where c.id = course_id and c.created_by = auth.uid() and c.source = 'manual'));
create policy tee_holes_select on public.tee_holes for select to anon, authenticated using (true);
create policy tee_holes_write on public.tee_holes for all to authenticated
  using (exists (select 1 from public.tee_boxes t join public.courses c on c.id = t.course_id where t.id = tee_id and c.created_by = auth.uid() and c.source = 'manual'))
  with check (exists (select 1 from public.tee_boxes t join public.courses c on c.id = t.course_id where t.id = tee_id and c.created_by = auth.uid() and c.source = 'manual'));
create policy course_reports_insert on public.course_reports for insert to authenticated with check (user_id = auth.uid());

-- rounds: visible to members/public/friends; created and run by you.
create policy rounds_select on public.rounds for select to authenticated using (public.can_view_round(id));
create policy rounds_insert on public.rounds for insert to authenticated with check (created_by = auth.uid());
create policy rounds_update on public.rounds for update to authenticated
  using (created_by = auth.uid() or scorekeeper_id = auth.uid())
  with check (created_by = auth.uid() or scorekeeper_id = auth.uid());
create policy rounds_delete on public.rounds for delete to authenticated using (created_by = auth.uid());

-- round players: see them if you can see the round; the creator/scorekeeper manages the roster
-- (joining by code goes through join_round()).
create policy round_players_select on public.round_players for select to authenticated using (public.can_view_round(round_id));
create policy round_players_insert on public.round_players for insert to authenticated
  with check (exists (select 1 from public.rounds r where r.id = round_id and (r.created_by = auth.uid() or r.scorekeeper_id = auth.uid())));
create policy round_players_update on public.round_players for update to authenticated
  using (user_id = auth.uid() or exists (select 1 from public.rounds r where r.id = round_id and (r.created_by = auth.uid() or r.scorekeeper_id = auth.uid())));
create policy round_players_delete on public.round_players for delete to authenticated
  using (exists (select 1 from public.rounds r where r.id = round_id and r.created_by = auth.uid()));

-- scores: readable with the round; writable for your own row or as the round's scorekeeper/creator.
create policy hole_scores_select on public.hole_scores for select to authenticated using (public.can_view_round(round_id));
create policy hole_scores_insert on public.hole_scores for insert to authenticated with check (public.can_score_player(player_id));
create policy hole_scores_update on public.hole_scores for update to authenticated using (public.can_score_player(player_id)) with check (public.can_score_player(player_id));

-- social
create policy follows_select on public.follows for select to authenticated using (true);
create policy follows_insert on public.follows for insert to authenticated with check (follower_id = auth.uid());
create policy follows_delete on public.follows for delete to authenticated using (follower_id = auth.uid());
create policy activities_select on public.activities for select to authenticated using (public.can_view_round(round_id));
create policy activities_insert on public.activities for insert to authenticated with check (user_id = auth.uid());
create policy activities_delete on public.activities for delete to authenticated using (user_id = auth.uid());
create policy kudos_select on public.kudos for select to authenticated using (exists (select 1 from public.activities a where a.id = activity_id and public.can_view_round(a.round_id)));
create policy kudos_insert on public.kudos for insert to authenticated with check (user_id = auth.uid());
create policy kudos_delete on public.kudos for delete to authenticated using (user_id = auth.uid());
create policy comments_select on public.comments for select to authenticated using (exists (select 1 from public.activities a where a.id = activity_id and public.can_view_round(a.round_id)));
create policy comments_insert on public.comments for insert to authenticated with check (user_id = auth.uid());
create policy comments_delete on public.comments for delete to authenticated using (user_id = auth.uid());

-- ─── Realtime: live leaderboards ────────────────────────────────────────────
alter publication supabase_realtime add table public.hole_scores, public.round_players, public.rounds;

-- keep updated_at honest on profile/course edits
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger courses_touch before update on public.courses for each row execute function public.touch_updated_at();
