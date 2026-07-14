// Adaptive plan engine. A pure function that turns the golfer's profile into a
// recommended daily session — an ordered set of activities (warmup → skill →
// golf-body → optional cooldown) with a plain-English "why". Deterministic per
// day (a seed rotates the picks) so sessions vary without repeating.
//
// It is intentionally simple and explainable: filter to what the golfer can
// actually do, weight toward their weakest area and goals, respect time,
// equipment, location, and any movements they excluded.

import {
  Activity, ACTIVITIES, LocationKey, EquipmentKey, GoalKey, LOCATION_LABEL,
  fitsEquipment, MovementExclusion,
} from './content';
import { Profile } from './profile';

export type PlanSession = {
  kind: 'balanced' | 'quick' | 'body';
  focus: string;
  why: string;
  totalMin: number;
  location: LocationKey | null;
  activities: Activity[];
};

// weakest-area key → library skill categories that address it
const AREA_SKILLS: Record<string, string[]> = {
  driving: ['Driving'],
  irons: ['Iron play'],
  wedges: ['Pitching', 'Chipping'],
  chipping: ['Chipping'],
  putting: ['Putting'],
  bunkers: ['Bunker play'],
  course: ['Shot shaping', 'Iron play'],
  mental: ['Setup & Tempo'],
};

// goal → skill categories it points at (secondary weighting)
const GOAL_SKILLS: Partial<Record<GoalKey, string[]>> = {
  putting: ['Putting'], chipping: ['Chipping'], wedgeDistance: ['Pitching'],
  bunker: ['Bunker play'], straighter: ['Setup & Tempo', 'Driving'],
  reduceSlice: ['Driving', 'Setup & Tempo'], reduceHook: ['Driving'],
  driverConsistency: ['Driving'], distance: ['Driving'], swingSpeed: ['Driving'],
  ironContact: ['Iron play'], striking: ['Iron play'], courseMgmt: ['Shot shaping'],
  break100: ['Chipping', 'Putting'], break90: ['Chipping', 'Putting'], break80: ['Putting', 'Iron play'],
};

const FOCUS_LABEL: Record<string, string> = {
  Driving: 'Better driving', 'Iron play': 'Cleaner iron contact', Pitching: 'Wedge control',
  Chipping: 'Tighter chipping', Putting: 'Sharper putting', 'Bunker play': 'Bunker confidence',
  'Shot shaping': 'Shot control', 'Setup & Tempo': 'Solid fundamentals',
};

const levelRank = { beginner: 0, intermediate: 1, advanced: 2, all: 0 } as const;

function levelOk(a: Activity, level: Profile['level']): boolean {
  if (a.skillLevel === 'all') return true;
  const cap = level ? levelRank[level] : 1;
  return levelRank[a.skillLevel] <= cap;
}

// Conservative safety filter — errs toward excluding when a movement was opted out.
function conflicts(a: Activity, ex: MovementExclusion[]): boolean {
  if (ex.length === 0) return false;
  const text = (a.setup + ' ' + a.steps.join(' ')).toLowerCase();
  for (const e of ex) {
    if (e === 'jumping' && a.type === 'power') return true;
    if (e === 'rotational' && a.type === 'power') return true;
    if (e === 'heavyLifting' && (a.type === 'power' || a.equipmentRequired.includes('barbell'))) return true;
    if (e === 'lowerBackLoading' && a.type === 'power') return true;
    if (e === 'floor' && /\bfloor\b|lie on|lying/.test(text)) return true;
    if (e === 'kneeling' && /kneel/.test(text)) return true;
    if (e === 'overhead' && /overhead/.test(text)) return true;
    if (e === 'wristLoading' && /wrist|plank|push-?up/.test(text)) return true;
  }
  return false;
}

function canDo(a: Activity, equip: EquipmentKey[], locs: LocationKey[], ex: MovementExclusion[]): boolean {
  if (!fitsEquipment(a, equip)) return false;
  if (locs.length && !a.locations.some((l) => locs.includes(l))) return false;
  if (conflicts(a, ex)) return false;
  return true;
}

// Deterministic rotate-pick: choose an item by seed, skipping already-used ones.
function pick(list: Activity[], seed: number, used: Set<string>): Activity | undefined {
  const pool = list.filter((a) => !used.has(a.id));
  if (!pool.length) return undefined;
  return pool[seed % pool.length];
}

function powerAllowed(p: Profile): boolean {
  return p.workoutDifficulty === 'challenging'
    && (p.activityLevel === 'active' || p.activityLevel === 'veryActive')
    && p.ageRange !== '55-69' && p.ageRange !== '70plus';
}

function focusSkillsFor(p: Profile): string[] {
  const out: string[] = [];
  if (p.weakestArea && AREA_SKILLS[p.weakestArea]) out.push(...AREA_SKILLS[p.weakestArea]);
  for (const g of p.goals) if (GOAL_SKILLS[g]) out.push(...(GOAL_SKILLS[g] as string[]));
  return [...new Set(out)];
}

export function buildSession(p: Profile, kind: PlanSession['kind'], seed: number): PlanSession {
  const equip = p.equipment.length ? p.equipment : (['clubs', 'balls'] as EquipmentKey[]);
  const locs = p.locations;
  const ex = p.exclusions;
  const avail = ACTIVITIES.filter((a) => canDo(a, equip, locs, ex));
  const byType = (t: Activity['type']) => avail.filter((a) => a.type === t);

  const used = new Set<string>();
  const acts: Activity[] = [];
  const budget = kind === 'quick' ? 12 : kind === 'body' ? 20 : 24;
  let spent = 0;
  const add = (a?: Activity) => { if (a && spent + a.durationMin <= budget + 4) { acts.push(a); used.add(a.id); spent += a.durationMin; return true; } return false; };

  // 1) Warmup / mobility — prefer a tight area the golfer flagged.
  const tightMob = byType('mobility').filter((a) => a.bodyAreas.some((b) => p.tightAreas.includes(b)));
  add(pick(tightMob, seed, used) || pick(byType('warmup'), seed, used) || pick(byType('mobility'), seed, used));

  const focusSkills = focusSkillsFor(p);

  if (kind === 'body') {
    // Golf-body day: mobility + strength/power + a stretch.
    add(pick(byType('mobility'), seed + 1, used));
    const strengthPool = [...byType('strength'), ...(powerAllowed(p) ? byType('power') : [])].filter((a) => levelOk(a, p.level));
    add(pick(strengthPool, seed, used));
    add(pick([...byType('stretch'), ...byType('yoga'), ...byType('recovery')], seed, used));
  } else {
    // Skill-led day.
    const skillPool = byType('drill').filter((a) => levelOk(a, p.level));
    const focused = skillPool.filter((a) => focusSkills.includes(a.category));
    add(pick(focused.length ? focused : skillPool, seed, used));
    if (kind === 'balanced') {
      // a second skill drill from a secondary focus if there's room
      add(pick(focused.length ? focused : skillPool, seed + 2, used));
      // a golf-body supporter (goal-aware)
      const wantsPower = p.goals.some((g) => g === 'distance' || g === 'swingSpeed');
      const bodyPool = wantsPower
        ? [...byType('strength'), ...(powerAllowed(p) ? byType('power') : [])]
        : [...byType('mobility'), ...byType('strength')];
      add(pick(bodyPool.filter((a) => levelOk(a, p.level)), seed, used));
      // optional cooldown if room
      if (spent < budget - 4) add(pick([...byType('stretch'), ...byType('recovery')], seed, used));
    }
  }

  const total = acts.reduce((s, a) => s + a.durationMin, 0);
  const primarySkill = focusSkills[0] && FOCUS_LABEL[focusSkills[0]] ? focusSkills[0] : null;
  const focus = kind === 'body' ? 'Your golf body' : primarySkill ? FOCUS_LABEL[primarySkill] : 'Sharpen your game';

  // Where: the most-relevant location the golfer can use.
  const locCounts = new Map<LocationKey, number>();
  acts.forEach((a) => a.locations.forEach((l) => { if (!locs.length || locs.includes(l)) locCounts.set(l, (locCounts.get(l) || 0) + 1); }));
  const location = [...locCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? locs[0] ?? null;

  const why = composeWhy(kind, acts, focus, p);

  return { kind, focus, why, totalMin: total, location, activities: acts };
}

function composeWhy(kind: PlanSession['kind'], acts: Activity[], focus: string, p: Profile): string {
  if (!acts.length) return 'A short, balanced session to keep you moving toward your goals.';
  if (kind === 'body') {
    return `A golf-body day — mobility, strength and recovery to build a swing that holds up and lasts. ${acts[0].golfBenefit}`;
  }
  const skill = acts.find((a) => a.type === 'drill');
  const body = acts.find((a) => a.type !== 'drill' && a.type !== 'warmup');
  const skillPart = skill ? `${skill.golfBenefit.toLowerCase().replace(/\.$/, '')}` : 'sharpen your game';
  const bodyPart = body ? ` It also works your golf body so your swing has more to give.` : '';
  return `Today is about ${focus.toLowerCase()} — the fastest way to ${skillPart}.${bodyPart}`;
}

// Public helpers: today's session and its shorter / golf-body alternatives.
export function todaysSession(p: Profile, seed: number): PlanSession {
  return buildSession(p, 'balanced', seed);
}
export function shorterSession(p: Profile, seed: number): PlanSession {
  return buildSession(p, 'quick', seed);
}
export function bodySession(p: Profile, seed: number): PlanSession {
  return buildSession(p, 'body', seed);
}

export const locationLabel = (l: LocationKey | null): string => (l ? LOCATION_LABEL[l] : 'Anywhere');
