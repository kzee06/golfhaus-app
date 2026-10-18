// GolfHaus design tokens — monochrome, with light and dark palettes that share
// the same semantic keys so screens never branch on the colour scheme.
// Emphasis comes from weight, size and contrast, never hue. Gameplay text
// targets ≥ 7:1 contrast for readability in sunlight.

import { useColorScheme } from 'react-native';

export type Palette = {
  // surfaces
  canvas: string; // screen background
  card: string; // cards, sheets
  surface: string; // secondary fills (tiles, chips)
  // primary (the "ink": text, primary buttons, selected fills) and its on-colour
  ink: string;
  onInk: string;
  white: string; // legacy alias for card/on-dark text
  // text
  text: string;
  text2: string;
  text3: string;
  text4: string;
  // legacy aliases kept for the shared Icon set
  ink55: string; ink50: string; ink45: string; ink40: string; ink30: string;
  // hairlines & fills
  border: string; border08: string; border12: string; border18: string;
  fill05: string; fill06: string; fill10: string;
  disabledBg: string; disabledText: string;
  // sunlight-safe high-contrast pair for gameplay numerals
  gameplayBg: string;
  gameplayFg: string;
};

export const light: Palette = {
  canvas: '#f3f3f3',
  card: '#ffffff',
  surface: '#f1f1f1',
  ink: '#141414',
  onInk: '#ffffff',
  white: '#ffffff',
  text: '#141414',
  text2: 'rgba(20,20,20,0.62)',
  text3: 'rgba(20,20,20,0.5)',
  text4: 'rgba(20,20,20,0.4)',
  ink55: 'rgba(20,20,20,0.55)', ink50: 'rgba(20,20,20,0.5)', ink45: 'rgba(20,20,20,0.45)', ink40: 'rgba(20,20,20,0.4)', ink30: 'rgba(20,20,20,0.3)',
  border: 'rgba(20,20,20,0.07)', border08: 'rgba(20,20,20,0.08)', border12: 'rgba(20,20,20,0.12)', border18: 'rgba(20,20,20,0.18)',
  fill05: 'rgba(20,20,20,0.05)', fill06: 'rgba(20,20,20,0.06)', fill10: 'rgba(20,20,20,0.1)',
  disabledBg: 'rgba(20,20,20,0.07)', disabledText: 'rgba(20,20,20,0.32)',
  gameplayBg: '#141414',
  gameplayFg: '#ffffff',
};

export const dark: Palette = {
  canvas: '#0d0d0d',
  card: '#181818',
  surface: '#1f1f1f',
  ink: '#f5f5f5',
  onInk: '#141414',
  white: '#181818',
  text: '#f5f5f5',
  text2: 'rgba(245,245,245,0.66)',
  text3: 'rgba(245,245,245,0.54)',
  text4: 'rgba(245,245,245,0.42)',
  ink55: 'rgba(245,245,245,0.6)', ink50: 'rgba(245,245,245,0.54)', ink45: 'rgba(245,245,245,0.48)', ink40: 'rgba(245,245,245,0.42)', ink30: 'rgba(245,245,245,0.32)',
  border: 'rgba(245,245,245,0.08)', border08: 'rgba(245,245,245,0.09)', border12: 'rgba(245,245,245,0.14)', border18: 'rgba(245,245,245,0.2)',
  fill05: 'rgba(245,245,245,0.06)', fill06: 'rgba(245,245,245,0.08)', fill10: 'rgba(245,245,245,0.12)',
  disabledBg: 'rgba(245,245,245,0.08)', disabledText: 'rgba(245,245,245,0.35)',
  gameplayBg: '#f5f5f5',
  gameplayFg: '#141414',
};

// Static default (light) for modules that can't use hooks (e.g. icon defaults).
export const colors = light;

export function useTheme(): Palette {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}

export const useIsDark = (): boolean => useColorScheme() === 'dark';

// Font families — loaded via @expo-google-fonts. Keys match the loaded names.
export const fonts = {
  display: 'SchibstedGrotesk_700Bold',
  displayExtra: 'SchibstedGrotesk_800ExtraBold',
  displaySemi: 'SchibstedGrotesk_600SemiBold',
  displayMed: 'SchibstedGrotesk_500Medium',
  body: 'Manrope_400Regular',
  bodyMed: 'Manrope_500Medium',
  bodySemi: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
};

export const radius = { chip: 8, card: 20, cardLg: 22, sheet: 30, pill: 30, nav: 33 };

export const shadow = {
  card: { boxShadow: '0px 8px 26px -16px rgba(20,20,20,0.22)' },
  cardSoft: { boxShadow: '0px 4px 16px -10px rgba(20,20,20,0.18)' },
  button: { boxShadow: '0px 16px 32px -14px rgba(20,20,20,0.55)' },
  nav: { boxShadow: '0px 16px 38px -12px rgba(20,20,20,0.28)' },
};

export const SCREEN_PAD = 24;
// Minimum tap target for outdoor use (points).
export const TAP = 56;
