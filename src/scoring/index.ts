// Pure scoring maths. No React, no storage — safe to unit test and to reuse on
// a server for leaderboards and activity summaries.

import { CourseSnapshot, HoleScore, Round, RoundPlayer, holesInRound } from '../domain/types';

export type HoleResult = 'ace' | 'albatross' | 'eagle' | 'birdie' | 'par' | 'bogey' | 'double' | 'triple+';

export function holeResult(strokes: number, par: number): HoleResult {
  if (strokes === 1) return 'ace';
  const d = strokes - par;
  if (d <= -3) return 'albatross';
  if (d === -2) return 'eagle';
  if (d === -1) return 'birdie';
  if (d === 0) return 'par';
  if (d === 1) return 'bogey';
  if (d === 2) return 'double';
  return 'triple+';
}

export const RESULT_LABEL: Record<HoleResult, string> = {
  ace: 'Ace', albatross: 'Albatross', eagle: 'Eagle', birdie: 'Birdie', par: 'Par',
  bogey: 'Bogey', double: 'Double bogey', 'triple+': 'Triple+',
};

export const parForHole = (course: CourseSnapshot, hole: number): number =>
  course.holes.find((h) => h.number === hole)?.par ?? 4;

export type Totals = {
  strokes: number;
  par: number; // par of holes actually scored
  toPar: number;
  holesPlayed: number;
  front: number; // strokes on holes 1–9 (played)
  back: number; // strokes on holes 10–18 (played)
  putts: number | null; // null when no putts tracked
  counts: Record<HoleResult, number>;
};

const emptyCounts = (): Record<HoleResult, number> => ({
  ace: 0, albatross: 0, eagle: 0, birdie: 0, par: 0, bogey: 0, double: 0, 'triple+': 0,
});

export function totals(round: Round, player: RoundPlayer): Totals {
  const t: Totals = { strokes: 0, par: 0, toPar: 0, holesPlayed: 0, front: 0, back: 0, putts: null, counts: emptyCounts() };
  let puttsSeen = false;
  let putts = 0;
  for (const h of holesInRound(round)) {
    const s = player.scores[h];
    if (!s || !s.strokes) continue;
    const par = parForHole(round.course, h);
    t.strokes += s.strokes;
    t.par += par;
    t.holesPlayed += 1;
    if (h <= 9) t.front += s.strokes; else t.back += s.strokes;
    t.counts[holeResult(s.strokes, par)] += 1;
    if (typeof s.putts === 'number') { puttsSeen = true; putts += s.putts; }
  }
  t.toPar = t.strokes - t.par;
  t.putts = puttsSeen ? putts : null;
  return t;
}

// "E", "+3", "-2"
export const fmtToPar = (n: number): string => (n === 0 ? 'E' : n > 0 ? `+${n}` : `${n}`);

// Leaderboard: sort by to-par among players who have scored, then by holes played
// (more holes with the same to-par ranks higher), then name.
export function leaderboard(round: Round): { player: RoundPlayer; t: Totals; rank: number }[] {
  const rows = round.players.map((player) => ({ player, t: totals(round, player) }));
  rows.sort((a, b) => {
    if (b.t.holesPlayed === 0 && a.t.holesPlayed === 0) return a.player.name.localeCompare(b.player.name);
    if (a.t.holesPlayed === 0) return 1;
    if (b.t.holesPlayed === 0) return -1;
    if (a.t.toPar !== b.t.toPar) return a.t.toPar - b.t.toPar;
    if (a.t.holesPlayed !== b.t.holesPlayed) return b.t.holesPlayed - a.t.holesPlayed;
    return a.player.name.localeCompare(b.player.name);
  });
  let rank = 0;
  let prevKey = '';
  return rows.map((r, i) => {
    const key = r.t.holesPlayed === 0 ? 'none' : `${r.t.toPar}/${r.t.holesPlayed}`;
    if (key !== prevKey) { rank = i + 1; prevKey = key; }
    return { ...r, rank };
  });
}

// Is every hole in the round scored for this player?
export const isComplete = (round: Round, player: RoundPlayer): boolean =>
  holesInRound(round).every((h) => (player.scores[h]?.strokes ?? 0) > 0);

// Next hole without a score for the "me" player (or the first hole if all done).
export function nextUnscoredHole(round: Round, player: RoundPlayer): number {
  const hs = holesInRound(round);
  return hs.find((h) => !(player.scores[h]?.strokes)) ?? hs[0];
}

// Sensible default when a hole is first scored: par.
export const defaultStrokes = (course: CourseSnapshot, hole: number): number => parForHole(course, hole);

export const stamp = (s: Omit<HoleScore, 'updatedAt'>): HoleScore => ({ ...s, updatedAt: new Date().toISOString() });

// ─── Career stats across completed rounds ────────────────────────────────────

export type CareerStats = {
  rounds: number;
  avgScore18: number | null; // average over completed 18-hole rounds
  best: { strokes: number; toPar: number; course: string; date: string } | null;
  avgPutts: number | null;
  counts: Record<HoleResult, number>;
  mostPlayed: { course: string; rounds: number } | null;
  recent: { date: string; strokes: number; toPar: number; course: string; holes: number }[];
};

export function careerStats(rounds: Round[], meId = 'me'): CareerStats {
  const done = rounds.filter((r) => r.status === 'complete');
  const counts = emptyCounts();
  let best: CareerStats['best'] = null;
  let sum18 = 0, n18 = 0, puttsSum = 0, puttsN = 0;
  const byCourse = new Map<string, number>();
  const recent: CareerStats['recent'] = [];
  for (const r of done) {
    const me = r.players.find((p) => p.isMe) ?? r.players[0];
    if (!me) continue;
    const t = totals(r, me);
    (Object.keys(counts) as HoleResult[]).forEach((k) => { counts[k] += t.counts[k]; });
    if (r.holeCount === 18 && t.holesPlayed === 18) {
      sum18 += t.strokes; n18 += 1;
      if (!best || t.strokes < best.strokes) best = { strokes: t.strokes, toPar: t.toPar, course: r.course.name, date: r.startedAt };
    }
    if (t.putts !== null && t.holesPlayed > 0) { puttsSum += t.putts / t.holesPlayed; puttsN += 1; }
    byCourse.set(r.course.name, (byCourse.get(r.course.name) ?? 0) + 1);
    recent.push({ date: r.startedAt, strokes: t.strokes, toPar: t.toPar, course: r.course.name, holes: t.holesPlayed });
  }
  recent.sort((a, b) => b.date.localeCompare(a.date));
  const mostPlayedEntry = [...byCourse.entries()].sort((a, b) => b[1] - a[1])[0];
  void meId;
  return {
    rounds: done.length,
    avgScore18: n18 ? Math.round((sum18 / n18) * 10) / 10 : null,
    best,
    avgPutts: puttsN ? Math.round((puttsSum / puttsN) * 10) / 10 : null,
    counts,
    mostPlayed: mostPlayedEntry ? { course: mostPlayedEntry[0], rounds: mostPlayedEntry[1] } : null,
    recent: recent.slice(0, 10),
  };
}
