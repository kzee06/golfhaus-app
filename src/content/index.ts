// Public content API + presentation helpers. Screens import from here.
export * from './schema';
export * from './library';

import { ActivityType } from './schema';

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
