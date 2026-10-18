// UI primitives for GolfHaus v2 — themed, outdoor-friendly, deliberately few.
// Visual language: soft tonal gradients, airy headings, pill chips, circular
// arrow CTAs, big numerals. Monochrome only — emphasis by weight and tone.

import React from 'react';
import { Pressable, ScrollView, Text, TextProps, View, ViewProps, ViewStyle, StyleProp, TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { fonts, radius, shadow, useTheme, TAP, SCREEN_PAD } from '../theme';

// ─── Layout ──────────────────────────────────────────────────────────────────

export function Screen({ children, scroll = true, padBottom = 130, style }: { children: React.ReactNode; scroll?: boolean; padBottom?: number; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const top = Math.max(insets.top, 20) + 16;
  return (
    <View style={{ flex: 1, backgroundColor: t.canvas }}>
      <LinearGradient colors={t.wash} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 320 }} />
      {scroll ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={[{ paddingTop: top, paddingBottom: padBottom }, style]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, paddingTop: top }, style]}>{children}</View>
      )}
    </View>
  );
}

export const Pad = ({ children, style }: ViewProps) => <View style={[{ paddingHorizontal: SCREEN_PAD }, style]}>{children}</View>;

// Airy two-line heading: a light greeting line and a bold title.
export function Header({ eyebrow, title, right }: { eyebrow?: string; title: string; right?: React.ReactNode }) {
  const t = useTheme();
  return (
    <Pad style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={{ fontFamily: fonts.body, fontSize: 16, color: t.text2, marginBottom: 2 }}>{eyebrow}</Text> : null}
        <Text style={{ fontFamily: fonts.displayMed, fontSize: 30, letterSpacing: -0.8, color: t.text }}>{title}</Text>
      </View>
      {right}
    </Pad>
  );
}

// ─── Text ────────────────────────────────────────────────────────────────────

type TP = TextProps & { style?: StyleProp<TextStyle> };
export const H2 = ({ style, ...p }: TP) => { const t = useTheme(); return <Text {...p} style={[{ fontFamily: fonts.display, fontSize: 20, letterSpacing: -0.4, color: t.text }, style]} />; };
export const Body = ({ style, ...p }: TP) => { const t = useTheme(); return <Text {...p} style={[{ fontFamily: fonts.body, fontSize: 15.5, lineHeight: 22, color: t.text }, style]} />; };
export const Muted = ({ style, ...p }: TP) => { const t = useTheme(); return <Text {...p} style={[{ fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: t.text3 }, style]} />; };
export const Label = ({ style, ...p }: TP) => { const t = useTheme(); return <Text {...p} style={[{ fontFamily: fonts.displaySemi, fontSize: 12.5, letterSpacing: 0.7, textTransform: 'uppercase', color: t.text3 }, style]} />; };

export function SectionLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <Pad style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 28, paddingBottom: 12 }}>
      <Label>{children}</Label>
      {right}
    </Pad>
  );
}

// Big numeral with a stacked label — "20 · Min Upper Body Activities".
export function BigStat({ value, label, sub }: { value: string; label: string; sub?: string }) {
  const t = useTheme();
  return (
    <Pad style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      <Text style={{ fontFamily: fonts.displayMed, fontSize: 76, letterSpacing: -4, lineHeight: 80, color: t.text, fontVariant: ['tabular-nums'] }}>{value}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.bodyMed, fontSize: 18, lineHeight: 24, color: t.text }}>{label}</Text>
        {sub ? <Text style={{ fontFamily: fonts.body, fontSize: 14, color: t.text3, marginTop: 2 }}>{sub}</Text> : null}
      </View>
    </Pad>
  );
}

// ─── Surfaces ────────────────────────────────────────────────────────────────

export function Card({ children, style, onPress, soft }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; soft?: boolean }) {
  const t = useTheme();
  const base: ViewStyle = { backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: radius.cardLg, padding: 18 };
  const sh = soft ? shadow.cardSoft : shadow.card;
  if (onPress) return <Pressable onPress={onPress} style={({ pressed }) => [base, sh, { opacity: pressed ? 0.85 : 1 }, style]}>{children}</Pressable>;
  return <View style={[base, sh, style]}>{children}</View>;
}

// Tonal gradient hero card. `soft` = light tile (ink text); default = ink hero.
export function GradientCard({ children, style, onPress, soft }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; soft?: boolean }) {
  const t = useTheme();
  const inner = (
    <LinearGradient colors={soft ? t.softGradient : t.heroGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[{ borderRadius: radius.cardLg, padding: 20, overflow: 'hidden' }, style]}>
      {children}
    </LinearGradient>
  );
  if (onPress) return <Pressable onPress={onPress} style={({ pressed }) => [shadow.card, { borderRadius: radius.cardLg, opacity: pressed ? 0.9 : 1 }]}>{inner}</Pressable>;
  return <View style={[shadow.card, { borderRadius: radius.cardLg }]}>{inner}</View>;
}

export function Row({ title, subtitle, right, onPress, left }: { title: string; subtitle?: string; right?: React.ReactNode; left?: React.ReactNode; onPress?: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: TAP, paddingVertical: 12, opacity: pressed ? 0.7 : 1 })}>
      {left}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16, color: t.text }} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={{ fontFamily: fonts.body, fontSize: 13.5, color: t.text3, marginTop: 2 }} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right}
    </Pressable>
  );
}

export const Divider = () => { const t = useTheme(); return <View style={{ height: 1, backgroundColor: t.border08 }} />; };

// ─── Controls ────────────────────────────────────────────────────────────────

export function Button({ label, onPress, variant = 'primary', disabled, style, size = 'lg' }: { label: string; onPress?: () => void; variant?: 'primary' | 'secondary' | 'ghost'; disabled?: boolean; style?: StyleProp<ViewStyle>; size?: 'lg' | 'md' }) {
  const t = useTheme();
  const h = size === 'lg' ? 58 : 46;
  const bg = disabled ? t.disabledBg : variant === 'primary' ? t.ink : variant === 'secondary' ? t.card : 'transparent';
  const fg = disabled ? t.disabledText : variant === 'primary' ? t.onInk : t.text;
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [{ height: h, borderRadius: radius.pill, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22, borderWidth: variant === 'secondary' ? 1 : 0, borderColor: t.border12, opacity: pressed ? 0.85 : 1 }, variant === 'primary' && !disabled ? shadow.button : variant === 'secondary' ? shadow.cardSoft : null, style]}>
      <Text style={{ fontFamily: fonts.displaySemi, fontSize: size === 'lg' ? 17 : 15, color: fg }}>{label}</Text>
    </Pressable>
  );
}

// Circular ↗ call-to-action, outlined on heroes or filled on light surfaces.
export function ArrowButton({ onPress, color, size = 50, filled }: { onPress?: () => void; color?: string; size?: number; filled?: boolean }) {
  const t = useTheme();
  const c = color ?? t.text;
  const r = size / 2;
  return (
    <Pressable onPress={onPress} hitSlop={8} style={({ pressed }) => ({ width: size, height: size, borderRadius: r, borderWidth: filled ? 0 : 1.5, borderColor: c, backgroundColor: filled ? t.ink : 'transparent', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
      <Svg width={size * 0.42} height={size * 0.42} viewBox="0 0 24 24" fill="none">
        <Path d="M7 17L17 7M9 7h8v8" stroke={filled ? t.onInk : c} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Pressable>
  );
}

// Pill chip — white with soft shadow; ink when selected.
export function Chip({ label, on, onPress, sub }: { label: string; on?: boolean; onPress?: () => void; sub?: string }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 7, height: 48, paddingHorizontal: 20, borderRadius: 24, backgroundColor: on ? t.ink : t.card, borderWidth: 1, borderColor: on ? t.ink : t.border, opacity: pressed ? 0.8 : 1 }, on ? null : shadow.cardSoft]}>
      <Text style={{ fontFamily: fonts.displayMed, fontSize: 15, color: on ? t.onInk : t.text }}>{label}</Text>
      {sub ? <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: on ? t.heroMuted : t.text4 }}>{sub}</Text> : null}
    </Pressable>
  );
}

// Big thumb-friendly stepper for scoring outdoors.
export function Stepper({ value, onChange, min = 1, max = 20, size = 64 }: { value: number; onChange: (v: number) => void; min?: number; max?: number; size?: number }) {
  const t = useTheme();
  const Btn = ({ glyph, onPress, disabled }: { glyph: string; onPress: () => void; disabled: boolean }) => (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={8} style={({ pressed }) => [{ width: size, height: size, borderRadius: size / 2, backgroundColor: disabled ? t.disabledBg : t.card, borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 }, disabled ? null : shadow.cardSoft]}>
      <Text style={{ fontFamily: fonts.display, fontSize: size * 0.5, color: disabled ? t.disabledText : t.text, lineHeight: size * 0.56 }}>{glyph}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
      <Btn glyph="−" onPress={() => onChange(Math.max(min, value - 1))} disabled={value <= min} />
      <Text style={{ fontFamily: fonts.displayMed, fontSize: size * 1.15, color: t.text, minWidth: size * 1.4, textAlign: 'center', letterSpacing: -2, fontVariant: ['tabular-nums'] }}>{value}</Text>
      <Btn glyph="+" onPress={() => onChange(Math.min(max, value + 1))} disabled={value >= max} />
    </View>
  );
}

export function StatTile({ label, value, unit, style }: { label: string; value: string; unit?: string; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View style={[{ flex: 1, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: radius.card, padding: 16 }, shadow.cardSoft, style]}>
      <Text style={{ fontFamily: fonts.body, fontSize: 13, color: t.text3, marginBottom: 6 }} numberOfLines={1}>{label}</Text>
      <Text style={{ fontFamily: fonts.displayMed, fontSize: 28, color: t.text, letterSpacing: -0.8 }}>
        {value}{unit ? <Text style={{ fontFamily: fonts.bodyMed, fontSize: 14, color: t.text3 }}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

export function Empty({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  const t = useTheme();
  return (
    <Pad>
      <View style={[{ backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: radius.cardLg, padding: 26, alignItems: 'center' }, shadow.cardSoft]}>
        <Text style={{ fontFamily: fonts.display, fontSize: 19, color: t.text, marginBottom: 6, textAlign: 'center', letterSpacing: -0.4 }}>{title}</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 14.5, lineHeight: 21, color: t.text2, textAlign: 'center', maxWidth: 290, marginBottom: action ? 18 : 0 }}>{body}</Text>
        {action}
      </View>
    </Pad>
  );
}
