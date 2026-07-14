// The user's golf + physical profile — the input to every recommendation.
// Persisted locally (see src/store.ts). Onboarding is data-driven from the
// STEPS config below so questions can be added/removed without touching the
// onboarding UI.

import {
  GoalKey, EquipmentKey, LocationKey, BodyAreaKey, MovementExclusion,
  GOAL_LABEL, EQUIPMENT_LABEL, LOCATION_LABEL, BODY_AREA_LABEL, MOVEMENT_EXCLUSIONS,
} from './content';

export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Hand = 'right' | 'left';
export type WorkoutDifficulty = 'gentle' | 'moderate' | 'challenging';

export type Profile = {
  name: string;
  // Golf
  level: Level | null;
  goals: GoalKey[];
  handicapRange: string | null;
  handicap: string; // optional exact number
  practiceFreq: string | null;
  dominantHand: Hand | null;
  weakestArea: string | null;
  // Physical
  ageRange: string | null;
  activityLevel: string | null;
  workoutDifficulty: WorkoutDifficulty | null;
  tightAreas: BodyAreaKey[];
  exclusions: MovementExclusion[];
  // Logistics
  equipment: EquipmentKey[];
  locations: LocationKey[];
  // Meta
  onboardedAt: string | null;
};

export const EMPTY_PROFILE: Profile = {
  name: 'KC',
  level: null, goals: [], handicapRange: null, handicap: '',
  practiceFreq: null, dominantHand: null, weakestArea: null,
  ageRange: null, activityLevel: null, workoutDifficulty: null,
  tightAreas: [], exclusions: [],
  equipment: [], locations: [],
  onboardedAt: null,
};

export const isOnboarded = (p: Profile): boolean => !!p.onboardedAt;

// ─── Onboarding step configuration ──────────────────────────────────────────

export type StepOption = { key: string; label: string; desc?: string };

// Which profile fields the data-driven steps write to (single or multi select).
type SingleField = 'level' | 'handicapRange' | 'practiceFreq' | 'dominantHand' | 'weakestArea' | 'ageRange' | 'activityLevel' | 'workoutDifficulty';
type MultiField = 'goals' | 'tightAreas' | 'exclusions' | 'equipment' | 'locations';

export type StepConfig =
  | { mode: 'single'; field: SingleField; kicker: string; title: string; subtitle: string; options: StepOption[]; columns?: 1 | 2 }
  | { mode: 'multi'; field: MultiField; kicker: string; title: string; subtitle: string; options: StepOption[]; optional?: boolean; maxSelect?: number; columns?: 1 | 2 };

const opt = <T extends string>(pairs: [T, string, string?][]): StepOption[] => pairs.map(([key, label, desc]) => ({ key, label, desc }));
const fromLabels = <K extends string>(keys: readonly K[], labels: Record<K, string>): StepOption[] => keys.map((k) => ({ key: k, label: labels[k] }));

const GOAL_KEYS: GoalKey[] = ['break100', 'break90', 'break80', 'striking', 'straighter', 'reduceSlice', 'driverConsistency', 'ironContact', 'wedgeDistance', 'chipping', 'bunker', 'putting', 'swingSpeed', 'distance', 'courseMgmt', 'confidence', 'tournament', 'returnToGolf', 'generalFitness'];
const TIGHT_KEYS: BodyAreaKey[] = ['hips', 'lowerBack', 'tSpine', 'shoulders', 'hamstrings', 'neck', 'wrists', 'ankles'];
const EQUIP_KEYS: EquipmentKey[] = ['none', 'clubs', 'balls', 'puttingMat', 'alignmentSticks', 'net', 'impactBag', 'bands', 'dumbbells', 'kettlebells', 'medBall', 'stabilityBall', 'foamRoller', 'yogaMat', 'fullGym'];
const LOCATION_KEYS: LocationKey[] = ['home', 'range', 'green', 'course', 'gym', 'office', 'hotel', 'outdoor'];

export const STEPS: StepConfig[] = [
  {
    mode: 'single', field: 'level', kicker: 'First up', title: 'How’s your golf right now?', subtitle: 'No wrong answer — it just helps us pitch things right.',
    options: opt<Level>([
      ['beginner', 'Beginner', 'New to golf or still finding my feet.'],
      ['intermediate', 'Intermediate', 'I can get round — now I want to get better.'],
      ['advanced', 'Advanced', 'Low handicap, playing competitively.'],
    ]),
  },
  {
    mode: 'multi', field: 'goals', kicker: 'Your goals', title: 'What do you want to work on?', subtitle: 'Pick up to three. We’ll build everything around them.',
    maxSelect: 3, columns: 1, options: fromLabels(GOAL_KEYS, GOAL_LABEL),
  },
  {
    mode: 'single', field: 'handicapRange', kicker: 'Your game', title: 'Where’s your scoring at?', subtitle: 'A rough idea is plenty.',
    options: opt([
      ['new', 'Just starting', 'Still learning to get round.'],
      ['28plus', '100+ / 28+ handicap', ''],
      ['19-27', '90s / 19–27 handicap', ''],
      ['10-18', '80s / 10–18 handicap', ''],
      ['under10', 'Under 80 / single figures', ''],
      ['unsure', 'Not sure', ''],
    ]),
  },
  {
    mode: 'single', field: 'weakestArea', kicker: 'Your game', title: 'Where do you lose the most shots?', subtitle: 'We’ll weight your plan toward it.',
    columns: 2, options: opt([
      ['driving', 'Driving', ''], ['irons', 'Irons', ''], ['wedges', 'Wedges', ''], ['chipping', 'Chipping', ''],
      ['putting', 'Putting', ''], ['bunkers', 'Bunkers', ''], ['course', 'Course play', ''], ['mental', 'Mental game', ''],
    ]),
  },
  {
    mode: 'single', field: 'practiceFreq', kicker: 'Your routine', title: 'How often can you practise?', subtitle: 'This sets the pace of your plan.',
    options: opt([
      ['rarely', 'Rarely', 'A few times a month.'],
      ['occasionally', 'Occasionally', 'About once a week.'],
      ['weekly', 'A few times a week', ''],
      ['mostDays', 'Most days', 'I want to train often.'],
    ]),
  },
  {
    mode: 'single', field: 'dominantHand', kicker: 'Your setup', title: 'Which way do you swing?', subtitle: '',
    columns: 2, options: opt<Hand>([['right', 'Right-handed', ''], ['left', 'Left-handed', '']]),
  },
  {
    mode: 'single', field: 'ageRange', kicker: 'About you', title: 'Which age range are you in?', subtitle: 'Helps us keep training appropriate.',
    columns: 2, options: opt([
      ['under25', 'Under 25', ''], ['25-39', '25–39', ''], ['40-54', '40–54', ''], ['55-69', '55–69', ''], ['70plus', '70+', ''],
    ]),
  },
  {
    mode: 'single', field: 'activityLevel', kicker: 'About you', title: 'How active are you day to day?', subtitle: '',
    options: opt([
      ['sedentary', 'Mostly sedentary', 'Little regular exercise.'],
      ['light', 'Lightly active', 'The odd walk or workout.'],
      ['active', 'Active', 'Exercise a few times a week.'],
      ['veryActive', 'Very active', 'Training most days.'],
    ]),
  },
  {
    mode: 'single', field: 'workoutDifficulty', kicker: 'Your training', title: 'How hard should workouts feel?', subtitle: 'You can change this any time.',
    options: opt<WorkoutDifficulty>([
      ['gentle', 'Gentle', 'Ease me in.'],
      ['moderate', 'Moderate', 'A solid, balanced challenge.'],
      ['challenging', 'Challenging', 'Push me.'],
    ]),
  },
  {
    mode: 'multi', field: 'tightAreas', kicker: 'Your body', title: 'Anywhere feeling tight?', subtitle: 'Optional — we’ll add mobility where you need it.',
    optional: true, columns: 2, options: fromLabels(TIGHT_KEYS, BODY_AREA_LABEL),
  },
  {
    mode: 'multi', field: 'exclusions', kicker: 'Your body', title: 'Anything we should avoid?', subtitle: 'Optional. We’ll swap in safe alternatives. This isn’t medical advice — see a professional for pain.',
    optional: true, columns: 1, options: opt<MovementExclusion>([
      ['jumping', 'Jumping', ''], ['kneeling', 'Kneeling', ''], ['floor', 'Floor exercises', ''], ['heavyLifting', 'Heavy lifting', ''],
      ['rotational', 'Rotational movements', ''], ['overhead', 'Overhead exercises', ''], ['wristLoading', 'Wrist loading', ''], ['lowerBackLoading', 'Lower-back loading', ''],
    ]),
  },
  {
    mode: 'multi', field: 'equipment', kicker: 'Your kit', title: 'What have you got?', subtitle: 'Tick everything. We’ll only set what you can actually do.',
    optional: true, columns: 2, options: fromLabels(EQUIP_KEYS, EQUIPMENT_LABEL),
  },
  {
    mode: 'multi', field: 'locations', kicker: 'Where you train', title: 'Where can you get to?', subtitle: 'Pick everywhere that applies.',
    columns: 2, options: fromLabels(LOCATION_KEYS, LOCATION_LABEL),
  },
];

// ─── Label lookups for display (Profile screen, Coach) ──────────────────────

export const LEVEL_LABEL: Record<Level, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
export const goalLabel = (k: GoalKey) => GOAL_LABEL[k];
export const equipmentLabel = (k: EquipmentKey) => EQUIPMENT_LABEL[k];
export const locationLabel = (k: LocationKey) => LOCATION_LABEL[k];
export const bodyAreaLabel = (k: BodyAreaKey) => BODY_AREA_LABEL[k];

// Find the display label for a single-select value from its step options.
export function optionLabel(field: StepConfig['field'], key: string | null): string {
  if (!key) return '—';
  const step = STEPS.find((s) => s.field === field);
  return step?.options.find((o) => o.key === key)?.label ?? key;
}
