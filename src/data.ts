// Shared static assets and onboarding copy.
//
// The drill catalog that used to live here (Drill type, drills/library, plus the
// prototype's sample chart and onboarding data) was replaced by the Activity
// content model in src/content — see ACTIVITIES there. Only the bits still
// referenced by the UI remain.
import { ImageSourcePropType } from 'react-native';

export const ASSETS = {
  hero: require('../assets/drills/golf-hero.webp') as ImageSourcePropType,
  wordmarkDark: require('../assets/drills/golfhaus-dark.png') as ImageSourcePropType,
  wordmarkWhite: require('../assets/drills/golfhaus-white.png') as ImageSourcePropType,
};

// Shown while the plan is being generated at the end of onboarding.
export const buildLines = [
  'Reading your goal and level…',
  'Finding where you’ll save the most shots…',
  'Setting drills you can actually do…',
];
