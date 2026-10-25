// Cloud sync for rounds. Local storage stays the source of truth on device;
// this module pushes local changes up and merges server rounds down.
//
// Push order matters for row-level security: the round is written as active
// first, then players, then scores (scores can only be written while a round is
// active), and finally the round's real status. A score write whose timestamp
// is not newer than the server's is rejected by the database ("stale"); during
// sync that just means the server already has it, so it's treated as success.

import { HoleScore, Round, RoundPlayer, uuid } from '../domain/types';
import { requireSupabase } from './supabase';
import type { HoleScoreRow, RoundPlayerRow, RoundRow } from './db.types';

// What a successful push changed locally: ids assigned and the synced stamp.
export type PushResult = {
  roundId: string; // local id
  remoteId: string;
  playerRemoteIds: Record<string, string>; // local player id -> remote id
  syncedAt: string; // the round.updatedAt value that was pushed
};

const isStale = (e: any) => /stale/i.test(e?.message ?? '') || e?.code === 'P0001';

export async function pushRound(round: Round, userId: string): Promise<PushResult> {
  const db = requireSupabase();
  const remoteId = round.remoteId ?? uuid();
  const since = round.syncedAt ?? '';

  // 1) round, as active so scores can be written
  const base = {
    id: remoteId,
    course_id: null,
    course_snapshot: round.course,
    hole_count: round.holeCount,
    start_hole: round.startHole,
    status: 'active' as const,
    visibility: round.visibility,
    revision: round.revision,
    created_by: userId,
    scorekeeper_id: userId,
    started_at: round.startedAt,
    completed_at: null,
    updated_at: round.updatedAt,
  };
  const r1 = await db.from('rounds').upsert(base, { onConflict: 'id' });
  if (r1.error) throw r1.error;

  // 2) players
  const playerRemoteIds: Record<string, string> = {};
  const players = round.players.map((p, i) => {
    const id = p.remoteId ?? uuid();
    playerRemoteIds[p.id] = id;
    return { id, round_id: remoteId, user_id: p.isMe ? userId : null, name: p.name, is_guest: !p.isMe, position: i };
  });
  const r2 = await db.from('round_players').upsert(players, { onConflict: 'id' });
  if (r2.error) throw r2.error;

  // 3) scores changed since the last confirmed sync
  const rows: Partial<HoleScoreRow>[] = [];
  for (const p of round.players) {
    for (const [hole, s] of Object.entries(p.scores)) {
      if (!s?.strokes || (since && s.updatedAt <= since)) continue;
      rows.push({
        round_id: remoteId,
        player_id: playerRemoteIds[p.id],
        hole: Number(hole),
        strokes: s.strokes,
        putts: s.putts ?? null,
        fairway: s.fairway ?? null,
        gir: s.gir ?? null,
        penalties: s.penalties ?? null,
        updated_at: s.updatedAt || round.updatedAt,
        updated_by: userId,
      });
    }
  }
  if (rows.length) {
    const r3 = await db.from('hole_scores').upsert(rows, { onConflict: 'round_id,player_id,hole' });
    if (r3.error) {
      // One stale row fails the whole batch; retry row by row and ignore stale.
      for (const row of rows) {
        const r = await db.from('hole_scores').upsert(row, { onConflict: 'round_id,player_id,hole' });
        if (r.error && !isStale(r.error)) throw r.error;
      }
    }
  }

  // 4) real status
  if (round.status === 'complete') {
    const r4 = await db.from('rounds').update({ status: 'complete', completed_at: round.completedAt ?? round.updatedAt }).eq('id', remoteId);
    if (r4.error) throw r4.error;
  }

  return { roundId: round.id, remoteId, playerRemoteIds, syncedAt: round.updatedAt };
}

export async function deleteRemoteRound(remoteId: string): Promise<void> {
  const db = requireSupabase();
  const r = await db.from('rounds').delete().eq('id', remoteId);
  if (r.error) throw r.error;
}

type RemoteRound = RoundRow & { round_players: RoundPlayerRow[]; hole_scores: HoleScoreRow[] };

// Rounds this golfer created, as local Round objects.
export async function pullMyRounds(userId: string): Promise<Round[]> {
  const db = requireSupabase();
  const { data, error } = await db
    .from('rounds')
    .select('*, round_players!round_players_round_id_fkey(*), hole_scores!hole_scores_round_id_fkey(*)')
    .eq('created_by', userId)
    .order('started_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as RemoteRound[]).map((rr) => toLocalRound(rr, userId));
}

function toLocalRound(rr: RemoteRound, userId: string): Round {
  const players: RoundPlayer[] = [...rr.round_players]
    .sort((a, b) => a.position - b.position)
    .map((p) => ({
      id: p.user_id === userId ? 'me' : p.id,
      remoteId: p.id,
      name: p.name,
      isMe: p.user_id === userId,
      userId: p.user_id,
      scores: {},
    }));
  const byRemote = new Map(players.map((p) => [p.remoteId!, p]));
  for (const s of rr.hole_scores) {
    const p = byRemote.get(s.player_id);
    if (p) p.scores[s.hole] = fromRow(s);
  }
  return {
    id: rr.id,
    remoteId: rr.id,
    course: rr.course_snapshot as Round['course'],
    holeCount: rr.hole_count,
    startHole: rr.start_hole,
    startedAt: rr.started_at,
    completedAt: rr.completed_at ?? undefined,
    status: rr.status,
    visibility: rr.visibility,
    revision: rr.revision,
    players,
    scorekeeperId: 'me',
    updatedAt: rr.updated_at,
    syncedAt: rr.updated_at,
  };
}

// Merge a server round into the local copy: per hole, the newer score wins.
// If the local copy still has anything newer, it keeps its updatedAt so the
// next push sends it; otherwise it's marked synced.
export function mergeRound(local: Round, remote: Round): Round {
  let localNewer = local.updatedAt > remote.updatedAt;
  const players = local.players.map((lp) => {
    const rp = remote.players.find((p) => p.remoteId && p.remoteId === lp.remoteId);
    if (!rp) return lp;
    const scores = { ...lp.scores };
    for (const [h, rs] of Object.entries(rp.scores)) {
      const ls = scores[Number(h)];
      if (!ls || rs.updatedAt > ls.updatedAt) scores[Number(h)] = rs;
      else if (ls.updatedAt > rs.updatedAt) localNewer = true;
    }
    return { ...lp, scores };
  });
  const status = local.status === 'complete' || remote.status === 'complete' ? 'complete' : 'active';
  const merged: Round = { ...local, players, status, completedAt: local.completedAt ?? remote.completedAt, remoteId: remote.remoteId };
  if (!localNewer) {
    merged.updatedAt = remote.updatedAt > local.updatedAt ? remote.updatedAt : local.updatedAt;
    merged.syncedAt = merged.updatedAt;
  }
  return merged;
}

const fromRow = (s: HoleScoreRow): HoleScore => ({
  strokes: s.strokes,
  putts: s.putts ?? undefined,
  fairway: s.fairway ?? undefined,
  gir: s.gir ?? undefined,
  penalties: s.penalties ?? undefined,
  updatedAt: s.updated_at,
});