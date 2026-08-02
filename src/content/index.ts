// Public content API + presentation helpers. Screens import from here.
export * from './schema';
export * from './library';

import { Activity, ActivityType } from './schema';

// Line-icon name (see src/Icon.tsx) used for an activity type on cards/tiles
// that don't have photography.
export const ACTIVITY_GLYPH: Record<ActivityType, string> = {
  drill: 'flag',
  mobility: 'move',
  strength: 'dumbbell',
  power: 'zap',
  balance: 'move',
  yoga: 'wind',
  stretch: 'sprout',
  warmup: 'sun',
  recovery: 'heart',
};

// A more specific glyph per category, so a tile reads as the actual movement
// (a hip-rotation icon for Hips, a bridge for Glutes) rather than one generic
// icon shared by every activity of a type. Falls back to the type glyph.
export const CATEGORY_GLYPH: Record<string, string> = {
  // golf-body movement
  Hips: 'rotate',
  'Thoracic spine': 'twist',
  Shoulders: 'rotate',
  Ankles: 'legStep',
  Core: 'coreBrace',
  Glutes: 'bridge',
  Legs: 'legStep',
  'Rotational power': 'medball',
  Balance: 'balance',
  Yoga: 'lotus',
  Stretch: 'sprout',
  Warmup: 'sun',
  Recovery: 'heart',
  // golf skill (used only when a drill has no photo)
  Putting: 'target',
  Chipping: 'flag',
  Pitching: 'flag',
  'Bunker play': 'flag',
  Driving: 'zap',
  'Iron play': 'crosshair',
  'Setup & Tempo': 'ruler',
  'Shot shaping': 'move',
};

// The best icon for an activity tile without photography.
export function glyphForActivity(a: Activity): string {
  return CATEGORY_GLYPH[a.category] ?? ACTIVITY_GLYPH[a.type];
}
