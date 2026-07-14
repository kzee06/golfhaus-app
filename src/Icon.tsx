import React from 'react';
import Svg, { Path, Circle, Line, Rect, Polyline } from 'react-native-svg';
import { colors } from './theme';

// Lucide/Feather-style line icons, 2px stroke, rounded caps, monochrome.
// Ported verbatim from the prototype ICONS map.
type Part = [string, Record<string, any>];

const ICONS: Record<string, Part[]> = {
  flame: [['path', { d: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z' }]],
  target: [['circle', { cx: 12, cy: 12, r: 9 }], ['circle', { cx: 12, cy: 12, r: 5 }], ['circle', { cx: 12, cy: 12, r: 1.2 }]],
  crosshair: [['circle', { cx: 12, cy: 12, r: 9 }], ['line', { x1: 22, y1: 12, x2: 18, y2: 12 }], ['line', { x1: 6, y1: 12, x2: 2, y2: 12 }], ['line', { x1: 12, y1: 2, x2: 12, y2: 6 }], ['line', { x1: 12, y1: 18, x2: 12, y2: 22 }]],
  flag: [['path', { d: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z' }], ['line', { x1: 4, y1: 22, x2: 4, y2: 15 }]],
  home: [['path', { d: 'M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z' }]],
  mat: [['rect', { x: 2.5, y: 6, width: 19, height: 12, rx: 3 }], ['line', { x1: 12, y1: 6, x2: 12, y2: 18 }], ['circle', { cx: 7, cy: 12, r: 0.9 }]],
  zap: [['path', { d: 'M13 2 3 14h7l-1 8 10-12h-7z' }]],
  sprout: [['path', { d: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z' }], ['path', { d: 'M2 21c0-3 1.85-5.36 5.08-6' }]],
  help: [['circle', { cx: 12, cy: 12, r: 9 }], ['path', { d: 'M9.4 9.2a2.7 2.7 0 0 1 5.2.9c0 1.8-2.6 2.7-2.6 2.7' }], ['line', { x1: 12, y1: 17, x2: 12.01, y2: 17 }]],
  trendDown: [['polyline', { points: '22 17 13.5 8.5 8.5 13.5 2 7' }], ['polyline', { points: '16 17 22 17 22 11' }]],
  trendUp: [['polyline', { points: '22 7 13.5 15.5 8.5 10.5 2 17' }], ['polyline', { points: '16 7 22 7 22 13' }]],
  bell: [['path', { d: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9' }], ['path', { d: 'M10.3 21a1.94 1.94 0 0 0 3.4 0' }]],
  ruler: [['path', { d: 'M21.3 8.7 8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4z' }], ['line', { x1: 14, y1: 5, x2: 16, y2: 7 }], ['line', { x1: 11, y1: 8, x2: 13, y2: 10 }], ['line', { x1: 8, y1: 11, x2: 10, y2: 13 }]],
  clock: [['circle', { cx: 12, cy: 12, r: 9 }], ['path', { d: 'M12 8v4l3 1.5' }]],
  pin: [['path', { d: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z' }], ['circle', { cx: 12, cy: 10, r: 3 }]],
  faceTough: [['circle', { cx: 12, cy: 12, r: 9 }], ['line', { x1: 9, y1: 9.7, x2: 9, y2: 10.5 }], ['line', { x1: 15, y1: 9.7, x2: 15, y2: 10.5 }], ['path', { d: 'M9 16.2c1.5-1.6 4.5-1.6 6 0' }]],
  faceRight: [['circle', { cx: 12, cy: 12, r: 9 }], ['line', { x1: 9, y1: 9.7, x2: 9, y2: 10.5 }], ['line', { x1: 15, y1: 9.7, x2: 15, y2: 10.5 }], ['path', { d: 'M8.8 14.3c1.6 2.1 4.8 2.1 6.4 0' }]],
  faceEasy: [['circle', { cx: 12, cy: 12, r: 9 }], ['line', { x1: 7.3, y1: 10, x2: 10.3, y2: 10 }], ['line', { x1: 13.7, y1: 10, x2: 16.7, y2: 10 }], ['path', { d: 'M8.5 14c1.7 2.3 5.3 2.3 7 0' }]],
  // nav glyphs (filled=false, stroked)
  navHome: [['path', { d: 'M5 21V8l7-5 7 5v13' }], ['path', { d: 'M12 8v5M12 13l4-1.5' }]],
  navYou: [['circle', { cx: 12, cy: 8, r: 4 }], ['path', { d: 'M4 21c0-4 3.6-7 8-7s8 3 8 7' }]],
  // activity-type glyphs (used for cards without photography)
  dumbbell: [['path', { d: 'M6.5 6.5 17.5 17.5' }], ['path', { d: 'M4 8l-1.5 1.5a1.5 1.5 0 0 0 0 2.1L4.4 14' }], ['path', { d: 'M8 4 6.5 5.5a1.5 1.5 0 0 0 0 2.1L8.6 9.7' }], ['path', { d: 'M20 16l1.5-1.5a1.5 1.5 0 0 0 0-2.1L19.6 10' }], ['path', { d: 'M16 20l1.5-1.5a1.5 1.5 0 0 0 0-2.1L15.4 14.3' }]],
  move: [['polyline', { points: '5 9 2 12 5 15' }], ['polyline', { points: '9 5 12 2 15 5' }], ['polyline', { points: '15 19 12 22 9 19' }], ['polyline', { points: '19 9 22 12 19 15' }], ['line', { x1: 2, y1: 12, x2: 22, y2: 12 }], ['line', { x1: 12, y1: 2, x2: 12, y2: 22 }]],
  sun: [['circle', { cx: 12, cy: 12, r: 4 }], ['path', { d: 'M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4' }]],
  heart: [['path', { d: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z' }]],
  wind: [['path', { d: 'M9.6 4.6A2 2 0 1 1 11 8H2' }], ['path', { d: 'M12.6 19.4A2 2 0 1 0 14 16H2' }], ['path', { d: 'M17.7 7.7A2.5 2.5 0 1 1 19.5 12H2' }]],
  // chevrons / play / check / pause used as raw components below
};

const Prim: Record<string, any> = { path: Path, circle: Circle, line: Line, rect: Rect, polyline: Polyline };

export function Icon({ name, size = 20, color = colors.ink, sw = 2 }: { name: string; size?: number; color?: string; sw?: number }) {
  const parts = ICONS[name] || [];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {parts.map(([t, a], i) => {
        const C = Prim[t];
        return <C key={i} {...a} />;
      })}
    </Svg>
  );
}

// Filled solid icons used in a few spots
export function PlayIcon({ size = 18, color = colors.white }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M8 5v14l11-7z" />
    </Svg>
  );
}

export function PauseIcon({ size = 26, color = colors.white }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </Svg>
  );
}

export function CheckIcon({ size = 12, color = colors.white, sw = 3 }: { size?: number; color?: string; sw?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 13l4 4L19 7" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ChevronLeft({ size = 22, color = colors.ink55, sw = 2 }: { size?: number; color?: string; sw?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 5l-7 7 7 7" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ChevronRight({ size = 20, color = colors.ink30, sw = 2 }: { size?: number; color?: string; sw?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 6l6 6-6 6" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ArrowRight({ size = 20, color = colors.white, sw = 2.2 }: { size?: number; color?: string; sw?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Sparkle used in coach cards (filled)
export function Sparkle({ size = 14, color = colors.white }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3c1.5 4 4.5 7 8.5 8.5-4 1.5-7 4.5-8.5 8.5-1.5-4-4.5-7-8.5-8.5C7.5 10 10.5 7 12 3z" fill={color} />
    </Svg>
  );
}

// Nav glyphs
export function NavDrills({ color = colors.ink40 }: { color?: string }) {
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={4} width={18} height={5} rx={1.6} stroke={color} strokeWidth={2} />
      <Rect x={3} y={13} width={18} height={5} rx={1.6} stroke={color} strokeWidth={2} />
      <Circle cx={8} cy={6.5} r={0.6} fill={color} />
      <Circle cx={16} cy={15.5} r={0.6} fill={color} />
    </Svg>
  );
}

export function NavProgress({ color = colors.ink40 }: { color?: string }) {
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3l8 5v8l-8 5-8-5V8z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
      <Path d="M12 3v9l8 4M12 12l-8 4" stroke={color} strokeWidth={1.4} strokeOpacity={0.6} />
    </Svg>
  );
}

// GolfHaus brand mark glyph (flag + tee), used where the raster wordmark isn't.
export function BrandMark({ size = 26, color = colors.ink }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={(size * 30) / 24} viewBox="0 0 24 30" fill="none">
      <Circle cx={12} cy={8.6} r={5.4} stroke={color} strokeWidth={2.7} />
      <Path d="M8.6 14.8 H15.4 L13.3 17.9 H10.7 Z" fill={color} />
      <Rect x={11.3} y={17.5} width={1.4} height={5.4} fill={color} />
      <Path d="M9.7 22.4 H14.3 L13 24.6 H11 Z" fill={color} />
    </Svg>
  );
}
