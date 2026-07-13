// GolfHaus design tokens — monochrome only (black / white / light grey).
// Emphasis comes from weight, size and contrast, never hue.

export const colors = {
  ink: '#141414', // text, primary buttons, active states, selected fills
  white: '#ffffff', // cards, sheets, on-dark text
  canvas: '#f3f3f3', // app background / screen base
  surface: '#f1f1f1', // secondary fills (feature tiles, chips, coach card)
  onDark: '#ffffff',

  ink55: 'rgba(20,20,20,0.55)', // secondary / body text
  ink50: 'rgba(20,20,20,0.5)', // tertiary text, meta
  ink45: 'rgba(20,20,20,0.45)', // quiet labels
  ink40: 'rgba(20,20,20,0.4)', // faintest text, counts
  ink30: 'rgba(20,20,20,0.3)', // chevrons, disabled glyphs

  border: 'rgba(20,20,20,0.07)', // card hairline border
  border08: 'rgba(20,20,20,0.08)',
  border12: 'rgba(20,20,20,0.12)',
  border18: 'rgba(20,20,20,0.18)', // coach card border

  fill05: 'rgba(20,20,20,0.05)',
  fill06: 'rgba(20,20,20,0.06)',
  fill10: 'rgba(20,20,20,0.1)',

  disabledBg: 'rgba(20,20,20,0.07)',
  disabledText: 'rgba(20,20,20,0.32)',
};

// Font families — loaded via @expo-google-fonts. Keys match the loaded names.
export const fonts = {
  // Schibsted Grotesk — display / headings / buttons / numerals
  display: 'SchibstedGrotesk_700Bold',
  displayExtra: 'SchibstedGrotesk_800ExtraBold',
  displaySemi: 'SchibstedGrotesk_600SemiBold',
  displayMed: 'SchibstedGrotesk_500Medium',
  // Manrope — body / labels / meta
  body: 'Manrope_400Regular',
  bodyMed: 'Manrope_500Medium',
  bodySemi: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
};

export const radius = {
  chip: 8,
  card: 20,
  cardLg: 22,
  sheet: 30,
  pill: 30,
  nav: 33,
};

// Soft, low-opacity shadows via the modern `boxShadow` style (web + native).
// Values mirror the design's CSS shadows, including negative spread.
export const shadow = {
  card: { boxShadow: '0px 8px 26px -16px rgba(20,20,20,0.22)' },
  cardSoft: { boxShadow: '0px 4px 16px -10px rgba(20,20,20,0.18)' },
  button: { boxShadow: '0px 16px 32px -14px rgba(20,20,20,0.55)' },
  nav: { boxShadow: '0px 16px 38px -12px rgba(20,20,20,0.28)' },
};

// Logical screen is 402 wide in the prototype; screen H padding 20–26.
export const SCREEN_PAD = 24;
