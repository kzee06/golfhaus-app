// GolfHaus content model — the single, UI-agnostic source of truth for every
// trainable unit in the app: golf skill drills, strength, mobility, power,
// balance, yoga, stretching, warmups, and recovery.
//
// This layer is deliberately kept separate from screens and components so
// content can grow (and eventually move to a CMS/DB) without touching UI code.
// Screens read Activities through helpers in ./library; they never hardcode
// content. Every field maps to the product spec's "drill and exercise data
// structure" (39 fields).

import { ImageSourcePropType } from 'react-native';

// ─── Taxonomy (closed vocabularies) ─────────────────────────────────────────

// The kind of activity. "Skill" drills improve golf technique; the rest are
// the golf-body pillars. Multi-activity sessions/workouts are a separate model
// (see planned Session type) that composes these units in order.
export const ACTIVITY_TYPES = [
  'drill', // golf skill drill
  'mobility',
  'strength',
  'power',
  'balance',
  'yoga',
  'stretch',
  'warmup',
  'recovery',
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_TYPE_LABEL: Record<ActivityType, string> = {
  drill: 'Golf Drill',
  mobility: 'Mobility',
  strength: 'Strength',
  power: 'Power',
  balance: 'Balance',
  yoga: 'Yoga',
  stretch: 'Stretch',
  warmup: 'Warmup',
  recovery: 'Recovery',
};

// The pillar groups the type belongs to — used for high-level browsing.
export const PILLAR_OF: Record<ActivityType, 'Skill' | 'Fitness' | 'Recovery'> = {
  drill: 'Skill',
  mobility: 'Fitness',
  strength: 'Fitness',
  power: 'Fitness',
  balance: 'Fitness',
  yoga: 'Recovery',
  stretch: 'Recovery',
  warmup: 'Fitness',
  recovery: 'Recovery',
};

// Golf improvement goals (onboarding + recommendation targets).
export const GOALS = [
  'break100', 'break90', 'break80', 'striking', 'straighter', 'reduceSlice',
  'reduceHook', 'driverConsistency', 'ironContact', 'wedgeDistance', 'chipping',
  'bunker', 'putting', 'swingSpeed', 'distance', 'courseMgmt', 'confidence',
  'tournament', 'returnToGolf', 'generalFitness',
] as const;
export type GoalKey = (typeof GOALS)[number];

export const GOAL_LABEL: Record<GoalKey, string> = {
  break100: 'Break 100',
  break90: 'Break 90',
  break80: 'Break 80',
  striking: 'Improve ball striking',
  straighter: 'Hit it straighter',
  reduceSlice: 'Reduce slicing',
  reduceHook: 'Reduce hooking',
  driverConsistency: 'Driver consistency',
  ironContact: 'Improve iron contact',
  wedgeDistance: 'Wedge distance control',
  chipping: 'Improve chipping',
  bunker: 'Improve bunker play',
  putting: 'Improve putting',
  swingSpeed: 'Increase swing speed',
  distance: 'Increase distance',
  courseMgmt: 'Course management',
  confidence: 'Build confidence',
  tournament: 'Prepare for a tournament',
  returnToGolf: 'Return to golf after a break',
  generalFitness: 'General golf fitness',
};

// Equipment (onboarding + activity requirements).
export const EQUIPMENT = [
  'clubs', 'balls', 'puttingMat', 'alignmentSticks', 'net', 'impactBag',
  'bands', 'dumbbells', 'kettlebells', 'cable', 'barbell', 'medBall',
  'stabilityBall', 'foamRoller', 'yogaMat', 'fullGym', 'none',
] as const;
export type EquipmentKey = (typeof EQUIPMENT)[number];

export const EQUIPMENT_LABEL: Record<EquipmentKey, string> = {
  clubs: 'Golf clubs',
  balls: 'Golf balls',
  puttingMat: 'Putting mat',
  alignmentSticks: 'Alignment sticks',
  net: 'Practice net',
  impactBag: 'Impact bag',
  bands: 'Resistance bands',
  dumbbells: 'Dumbbells',
  kettlebells: 'Kettlebells',
  cable: 'Cable machine',
  barbell: 'Barbell',
  medBall: 'Medicine ball',
  stabilityBall: 'Stability ball',
  foamRoller: 'Foam roller',
  yogaMat: 'Yoga mat',
  fullGym: 'Full gym',
  none: 'No equipment',
};

// Training locations.
export const LOCATIONS = ['home', 'range', 'green', 'course', 'gym', 'office', 'hotel', 'outdoor'] as const;
export type LocationKey = (typeof LOCATIONS)[number];

export const LOCATION_LABEL: Record<LocationKey, string> = {
  home: 'Home',
  range: 'Driving range',
  green: 'Practice green',
  course: 'Golf course',
  gym: 'Gym',
  office: 'Office',
  hotel: 'Hotel room',
  outdoor: 'Outdoor space',
};

// Body areas (physical profile + filtering).
export const BODY_AREAS = [
  'hips', 'tSpine', 'shoulders', 'ankles', 'hamstrings', 'glutes', 'lowerBack',
  'wrists', 'neck', 'core', 'legs', 'upperBack', 'fullBody',
] as const;
export type BodyAreaKey = (typeof BODY_AREAS)[number];

export const BODY_AREA_LABEL: Record<BodyAreaKey, string> = {
  hips: 'Hips',
  tSpine: 'Thoracic spine',
  shoulders: 'Shoulders',
  ankles: 'Ankles',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  lowerBack: 'Lower back',
  wrists: 'Wrists',
  neck: 'Neck',
  core: 'Core',
  legs: 'Legs',
  upperBack: 'Upper back',
  fullBody: 'Full body',
};

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'all';
// Physical difficulty 1 (very gentle) … 5 (demanding). Recovery/mobility skew low.
export type PhysDifficulty = 1 | 2 | 3 | 4 | 5;

// Movements a user can exclude for safety (physical profile).
export const MOVEMENT_EXCLUSIONS = [
  'jumping', 'kneeling', 'floor', 'heavyLifting', 'rotational', 'overhead', 'wristLoading', 'lowerBackLoading',
] as const;
export type MovementExclusion = (typeof MOVEMENT_EXCLUSIONS)[number];

// Optional scoring for measurable drills (putting gate, landing zone, …).
export type Scoring = {
  unit: string; // e.g. "of 10", "points", "metres"
  target: number; // success target
  better: 'higher' | 'lower';
  prompt: string; // logged question, e.g. "How many finished close?"
};

// ─── The Activity ───────────────────────────────────────────────────────────

export type Activity = {
  id: string; // 1
  title: string; // 2
  summary: string; // 3 short description
  type: ActivityType; // 4
  category: string; // 5 main category (e.g. "Putting", "Hips", "Core")
  subcategory?: string; // 6
  goals: GoalKey[]; // 7 golf goals served
  problem: string; // 8 problem addressed ("what it improves")
  skillLevel: SkillLevel; // 9
  physDifficulty: PhysDifficulty; // 10
  locations: LocationKey[]; // 11 recommended locations
  equipmentRequired: EquipmentKey[]; // 12
  equipmentOptional?: EquipmentKey[]; // 13
  durationMin: number; // 14
  reps?: number | string; // 15
  sets?: number; // 16
  restSec?: number; // 17
  setup: string; // 18
  steps: string[]; // 19 step-by-step
  cues: string[]; // 20 ≤3 coaching cues
  feel: string; // 21 what the golfer should feel
  mistakes: string[]; // 22 common mistakes
  safety?: string; // 23 safety notes
  easier?: string; // 24 regression
  harder?: string; // 25 progression
  bodyAreas: BodyAreaKey[]; // 28 body areas involved
  golfSkills?: string[]; // 29
  videoUrl?: string; // 30
  thumbnail?: ImageSourcePropType; // 31 (falls back to a category glyph tile)
  completionCriteria?: string; // 33
  scoring?: Scoring; // 34 optional scoring method
  tags: string[]; // 35
  premium: boolean; // 36
  author?: string; // 37
  createdAt: string; // 38
  updatedAt: string; // 39
  frequency?: string; // recommended frequency
};

// Convenience: does an activity fit the given equipment set? ("none" always fits.)
export function fitsEquipment(a: Activity, owned: EquipmentKey[]): boolean {
  if (a.equipmentRequired.length === 0 || a.equipmentRequired.includes('none')) return true;
  if (owned.includes('fullGym')) {
    const gymCovered: EquipmentKey[] = ['dumbbells', 'kettlebells', 'cable', 'barbell', 'medBall', 'stabilityBall'];
    return a.equipmentRequired.every((e) => owned.includes(e) || gymCovered.includes(e));
  }
  return a.equipmentRequired.every((e) => owned.includes(e));
}

export const isNoEquipment = (a: Activity): boolean =>
  a.equipmentRequired.length === 0 || (a.equipmentRequired.length === 1 && a.equipmentRequired[0] === 'none');
