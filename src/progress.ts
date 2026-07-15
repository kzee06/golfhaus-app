// Progress tracking — an append-only log of finished sessions plus pure
// derivations (streak, weekly count, totals, recent list). Kept separate from
// storage and UI so the same records drive Today's streak, the week strip, and
// the Progress screen, and so the logic stays trivially testable.

import { PlanSession } from './plan';

export type Feel = 'tough' | 'right' | 'easy' | null;

// A logged result for a measurable drill (e.g. "7 of 10 putts finished close").
// Self-contained so trends never have to re-resolve the drill's scoring config.
export type ScoreEntry = {
  activityId: string;
  activityTitle: string;
  category: string;
  value: number;
  target: number;
  unit: string;
  better: 'higher' | 'lower';
};

// One finished session. Self-contained so the Progress log never has to
// re-resolve activities from the content library.
export type SessionRecord = {
  id: string;
  date: string; // ISO timestamp of completion
  kind: PlanSession['kind'];
  focus: string;
  activityIds: string[];
  activityTitles: string[];
  activityCount: number;
  totalMin: number;
  feel: Feel;
  scores: ScoreEntry[];
};

export type ProgressState = { sessions: SessionRecord[] };

export const EMPTY_PROGRESS: ProgressState = { sessions: [] };

// Build a record from a played session + the golfer's post-session feel and any
// drill scores they logged.
export function recordFromSession(session: PlanSession, feel: Feel, scores: ScoreEntry[], id: string, iso: string): SessionRecord {
  return {
    id,
    date: iso,
    kind: session.kind,
    focus: session.focus,
    activityIds: session.activities.map((a) => a.id),
    activityTitles: session.activities.map((a) => a.title),
    activityCount: session.activities.length,
    totalMin: session.totalMin,
    feel,
    scores,
  };
}

export function addSession(state: ProgressState, rec: SessionRecord): ProgressState {
  return { sessions: [rec, ...state.sessions] };
}

// ─── date helpers (local time) ──────────────────────────────────────────────

const startOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate());
// Local calendar-day key. Exported so UIs (e.g. Today's week strip) can match a
// given date against practiced days using the exact same rule.
export const dayKey = (d: Date): string => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const addDays = (d: Date, n: number): Date => { const c = new Date(d); c.setDate(c.getDate() + n); return c; };

// Monday-based start of the week containing `d`.
function startOfWeek(d: Date): Date {
  const s = startOfDay(d);
  const dow = s.getDay(); // 0 Sun … 6 Sat
  const back = (dow + 6) % 7; // days since Monday
  return addDays(s, -back);
}

// ─── derivations ─────────────────────────────────────────────────────────────

// Consecutive days ending today (or yesterday, as grace before today's session)
// on which at least one session was completed.
export function computeStreak(sessions: SessionRecord[], today: Date): number {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map((s) => dayKey(new Date(s.date))));
  let cursor = startOfDay(today);
  if (!days.has(dayKey(cursor))) {
    cursor = addDays(cursor, -1);
    if (!days.has(dayKey(cursor))) return 0; // streak already broken
  }
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function sessionsThisWeek(sessions: SessionRecord[], today: Date): number {
  const weekStart = startOfWeek(today).getTime();
  return sessions.filter((s) => new Date(s.date).getTime() >= weekStart).length;
}

// Distinct local day-keys on which a session was completed — drives the dots on
// Today's week strip (exact-date match, so weeks never collide).
export function practicedDayKeys(sessions: SessionRecord[]): string[] {
  return [...new Set(sessions.map((s) => dayKey(new Date(s.date))))];
}

export const totalSessions = (sessions: SessionRecord[]): number => sessions.length;
export const totalMinutes = (sessions: SessionRecord[]): number => sessions.reduce((s, r) => s + r.totalMin, 0);

// Newest first (records are stored newest-first already, but be explicit).
export function recentSessions(sessions: SessionRecord[], n: number): SessionRecord[] {
  return [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, n);
}

// "Today", "Yesterday", or a short date — for the recent list.
export function relativeDay(iso: string, today: Date): string {
  const d = startOfDay(new Date(iso));
  const t = startOfDay(today);
  const diff = Math.round((t.getTime() - d.getTime()) / 86_400_000);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const FEEL_LABEL: Record<Exclude<Feel, null>, string> = {
  tough: 'Tough', right: 'Just right', easy: 'Too easy',
};

// ─── drill scoring ───────────────────────────────────────────────────────────

// A single logged score with the day it was recorded.
export type ScorePoint = { date: string; value: number; target: number; unit: string; better: 'higher' | 'lower' };

// A drill's scores over time, oldest → newest, with a light trend read.
export type SkillTrend = {
  category: string;
  activityTitle: string;
  unit: string;
  target: number;
  better: 'higher' | 'lower';
  points: ScorePoint[];
  latest: number;
  best: number;
  hitTarget: boolean;
  delta: number | null; // latest vs previous attempt (null if only one)
};

const scoresOf = (r: SessionRecord): ScoreEntry[] => r.scores ?? [];

// All logged scores, grouped by drill category, each series oldest → newest.
export function skillTrends(sessions: SessionRecord[]): SkillTrend[] {
  // Attach each score to its session date, then group by category.
  const rows = sessions.flatMap((r) => scoresOf(r).map((s) => ({ ...s, date: r.date })));
  const byCat = new Map<string, typeof rows>();
  for (const row of rows) {
    const arr = byCat.get(row.category) ?? [];
    arr.push(row);
    byCat.set(row.category, arr);
  }

  const trends: SkillTrend[] = [];
  for (const [category, arr] of byCat) {
    const sorted = [...arr].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const points: ScorePoint[] = sorted.map((s) => ({ date: s.date, value: s.value, target: s.target, unit: s.unit, better: s.better }));
    const last = sorted[sorted.length - 1];
    const prev = sorted.length > 1 ? sorted[sorted.length - 2] : null;
    const values = sorted.map((s) => s.value);
    const better = last.better;
    const best = better === 'lower' ? Math.min(...values) : Math.max(...values);
    const hitTarget = better === 'lower' ? last.value <= last.target : last.value >= last.target;
    trends.push({
      category,
      activityTitle: last.activityTitle,
      unit: last.unit,
      target: last.target,
      better,
      points,
      latest: last.value,
      best,
      hitTarget,
      delta: prev ? last.value - prev.value : null,
    });
  }
  // Most recently practised skill first.
  return trends.sort((a, b) => new Date(b.points[b.points.length - 1].date).getTime() - new Date(a.points[a.points.length - 1].date).getTime());
}

export const hasScores = (sessions: SessionRecord[]): boolean => sessions.some((r) => scoresOf(r).length > 0);
