// GolfHaus design tokens — monochrome brand (ink / white / greys) with light and
// dark palettes that share semantic keys, so screens never branch on scheme.
// Gradients are tonal (ink→charcoal, white→grey), never hued. Gameplay text
// targets ≥ 7:1 contrast for sunlight.

import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import type { ThemeMode } from './domain/types';

export type Gradient = [string, string];

export type Palette = {
  canvas: string; card: string; surface: string;
  ink: string; onInk: string; white: string;
  text: string; text2: string; text3: string; text4: string;
  ink55: string; ink50: string; ink45: string; ink40: string; ink30: string;
  border: string; border08: string; border12: string; border18: string;
  fill05: string; fill06: string; fill10: string;
  disabledBg: string; disabledText: string;
  gameplayBg: string; gameplayFg: string;
  // tonal gradients
  wash: Gradient; // faint top-of-screen wash
  heroGradient: Gradient; heroFg: string; heroMuted: string;
  softGradient: Gradient; // light tile gradient
  pillIconGradient: Gradient; pillIconFg: string; // active tab icon circle
};

export const light: Palette = {
  canvas: '#f3f3f3', card: '#ffffff', surface: '#ebebeb',
  ink: '#141414', onInk: '#ffffff', white: '#ffffff',
  text: '#141414', text2: 'rgba(20,20,20,0.62)', text3: 'rgba(20,20,20,0.5)', text4: 'rgba(20,20,20,0.4)',
  ink55: 'rgba(20,20,20,0.55)', ink50: 'rgba(20,20,20,0.5)', ink45: 'rgba(20,20,20,0.45)', ink40: 'rgba(20,20,20,0.4)', ink30: 'rgba(20,20,20,0.3)',
  border: 'rgba(20,20,20,0.07)', border08: 'rgba(20,20,20,0.08)', border12: 'rgba(20,20,20,0.12)', border18: 'rgba(20,20,20,0.18)',
  fill05: 'rgba(20,20,20,0.05)', fill06: 'rgba(20,20,20,0.06)', fill10: 'rgba(20,20,20,0.1)',
  disabledBg: 'rgba(20,20,20,0.07)', disabledText: 'rgba(20,20,20,0.32)',
  gameplayBg: '#141414', gameplayFg: '#ffffff',
  wash: ['#ffffff', '#f3f3f3'],
  heroGradient: ['#1b1b1b', '#454545'], heroFg: '#ffffff', heroMuted: 'rgba(255,255,255,0.68)',
  softGradient: ['#ffffff', '#e9e9e9'],
  pillIconGradient: ['#ffffff', '#c8c8c8'], pillIconFg: '#141414',
};

export const dark: Palette = {
  canvas: '#0c0c0c', card: '#171717', surface: '#1f1f1f',
  ink: '#f5f5f5', onInk: '#141414', white: '#171717',
  text: '#f5f5f5', text2: 'rgba(245,245,245,0.66)', text3: 'rgba(245,245,245,0.54)', text4: 'rgba(245,245,245,0.42)',
  ink55: 'rgba(245,245,245,0.6)', ink50: 'rgba(245,245,245,0.54)', ink45: 'rgba(245,245,245,0.48)', ink40: 'rgba(245,245,245,0.42)', ink30: 'rgba(245,245,245,0.32)',
  border: 'rgba(245,245,245,0.08)', border08: 'rgba(245,245,245,0.09)', border12: 'rgba(245,245,245,0.14)', border18: 'rgba(245,245,245,0.2)',
  fill05: 'rgba(245,245,245,0.06)', fill06: 'rgba(245,245,245,0.08)', fill10: 'rgba(245,245,245,0.12)',
  disabledBg: 'rgba(245,245,245,0.08)', disabledText: 'rgba(245,245,245,0.35)',
  gameplayBg: '#f5f5f5', gameplayFg: '#141414',
  wash: ['#181818', '#0c0c0c'],
  heroGradient: ['#f7f7f7', '#d2d2d2'], heroFg: '#141414', heroMuted: 'rgba(20,20,20,0.62)',
  softGradient: ['#232323', '#151515'],
  pillIconGradient: ['#4a4a4a', '#1a1a1a'], pillIconFg: '#f5f5f5',
};

// Static default (light) for modules that can't use hooks (e.g. icon defaults).
export const colors = light;

// ─── Appearance preference ───────────────────────────────────────────────────
// 'system' follows the device; 'light' / 'dark' force a scheme.
export const ThemeModeContext = createContext<ThemeMode>('system');

export function ThemeProvider({ mode, children }: { mode: ThemeMode; children: React.ReactNode }) {
  return React.createElement(ThemeModeContext.Provider, { value: mode }, children);
}

export function useResolvedScheme(): 'light' | 'dark' {
  const mode = useContext(ThemeModeContext);
  const sys = useColorScheme();
  if (mode === 'system') return sys === 'dark' ? 'dark' : 'light';
  return mode;
}

export const useTheme = (): Palette => (useResolvedScheme() === 'dark' ? dark : light);
export const useIsDark = (): boolean => useResolvedScheme() === 'dark';

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

export const radius = { chip: 8, card: 22, cardLg: 26, sheet: 30, pill: 30, nav: 33 };

export const shadow = {
  card: { boxShadow: '0px 10px 30px -16px rgba(20,20,20,0.24)' },
  cardSoft: { boxShadow: '0px 4px 16px -10px rgba(20,20,20,0.16)' },
  button: { boxShadow: '0px 16px 32px -14px rgba(20,20,20,0.5)' },
  nav: { boxShadow: '0px 18px 40px -14px rgba(20,20,20,0.3)' },
};

export const SCREEN_PAD = 24;
export const TAP = 56;
