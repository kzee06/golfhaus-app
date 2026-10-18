// Shared product components: pill tab bar, score marks, round cards, course rows.

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { fonts, radius, shadow, useTheme } from '../theme';
import { Icon } from '../Icon';
import { ArrowButton } from '../ui';
import { HoleResult, holeResult, fmtToPar, totals } from '../scoring';
import { CourseSummary, Round } from '../domain/types';

// ─── Pill tab bar ────────────────────────────────────────────────────────────
// Floating capsule. The active tab is an ink pill with a gradient icon circle
// and an uppercase label; inactive tabs are quiet uppercase labels.

const TAB_ICON: Record<string, string> = { index: 'navHome', play: 'flag', courses: 'pin', activity: 'heart', profile: 'navYou' };

export function PillTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ position: 'absolute', left: 16, right: 16, bottom: Math.max(insets.bottom, 14) + 8, height: 68, borderRadius: radius.nav, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6 }, shadow.nav]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = String(options.title ?? route.name).toUpperCase();
        const focused = state.index === index;
        const onPress = () => {
          const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !e.defaultPrevented) navigation.navigate(route.name, route.params);
        };
        if (focused) {
          return (
            <Pressable key={route.key} onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 9, height: 52, paddingLeft: 6, paddingRight: 16, borderRadius: 26, backgroundColor: t.ink }}>
              <LinearGradient colors={t.pillIconGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={TAB_ICON[route.name] ?? 'flag'} size={19} color={t.pillIconFg} sw={2} />
              </LinearGradient>
              <Text style={{ fontFamily: fonts.displaySemi, fontSize: 12, letterSpacing: 0.6, color: t.onInk }}>{label}</Text>
            </Pressable>
          );
        }
        return (
          <Pressable key={route.key} onPress={onPress} style={{ flex: 1, height: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 }}>
            <Text style={{ fontFamily: fonts.displaySemi, fontSize: 9.5, letterSpacing: 0.35, color: t.text3 }} numberOfLines={1}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Score marks ─────────────────────────────────────────────────────────────
// Traditional notation, readable without colour: eagle+ double circle,
// birdie circle, par plain, bogey square, double+ double square.
export function ScoreMark({ strokes, par, size = 36, dark }: { strokes: number; par: number; size?: number; dark?: boolean }) {
  const t = useTheme();
  const r: HoleResult = holeResult(strokes, par);
  const fg = dark ? t.gameplayFg : t.text;
  const ring = (radiusPx: number) => ({ position: 'absolute' as const, width: size, height: size, borderRadius: radiusPx, borderWidth: 1.5, borderColor: fg });
  const inner = (radiusPx: number) => ({ position: 'absolute' as const, width: size - 8, height: size - 8, borderRadius: radiusPx, borderWidth: 1.5, borderColor: fg });
  const circle = r === 'birdie' || r === 'eagle' || r === 'albatross' || r === 'ace';
  const dbl = r === 'eagle' || r === 'albatross' || r === 'ace' || r === 'double' || r === 'triple+';
  const square = r === 'bogey' || r === 'double' || r === 'triple+';
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {circle && <View style={ring(size / 2)} />}
      {circle && dbl && <View style={inner((size - 8) / 2)} />}
      {square && <View style={ring(6)} />}
      {square && dbl && <View style={inner(4)} />}
      <Text style={{ fontFamily: fonts.display, fontSize: size * 0.46, color: fg, fontVariant: ['tabular-nums'] }}>{strokes}</Text>
    </View>
  );
}

// ─── Cards & rows ────────────────────────────────────────────────────────────

export function RoundCard({ round, onPress }: { round: Round; onPress: () => void }) {
  const t = useTheme();
  const me = round.players.find((p) => p.isMe) ?? round.players[0];
  const tot = me ? totals(round, me) : null;
  const date = new Date(round.startedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: radius.cardLg, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14, opacity: pressed ? 0.85 : 1 }, shadow.cardSoft]}>
      <LinearGradient colors={t.softGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: fonts.displayMed, fontSize: 26, color: t.text, letterSpacing: -1 }}>{tot ? tot.strokes || '–' : '–'}</Text>
      </LinearGradient>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16.5, color: t.text }} numberOfLines={1}>{round.course.name}</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 13.5, color: t.text3, marginTop: 2 }} numberOfLines={1}>
          {date} · {round.holeCount} holes{round.players.length > 1 ? ` · ${round.players.length} players` : ''}{round.status === 'active' ? ' · In progress' : ''}
        </Text>
        {tot && tot.holesPlayed > 0 && <Text style={{ fontFamily: fonts.displayMed, fontSize: 18, color: t.text, marginTop: 6 }}>{fmtToPar(tot.toPar)}</Text>}
      </View>
      <ArrowButton onPress={onPress} size={42} />
    </Pressable>
  );
}

export function CourseRow({ c, onPress, right, units }: { c: CourseSummary; onPress: () => void; right?: React.ReactNode; units?: 'm' | 'yd' }) {
  const t = useTheme();
  const dist = c.distanceM != null ? (units === 'yd' ? `${(c.distanceM / 1609.344).toFixed(1)} mi` : `${(c.distanceM / 1000).toFixed(1)} km`) : null;
  const sub = [c.city, c.country, dist].filter(Boolean).join(' · ');
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, opacity: pressed ? 0.7 : 1 })}>
      <LinearGradient colors={t.softGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="flag" size={19} color={t.text} />
      </LinearGradient>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16, color: t.text }} numberOfLines={1}>{c.name}</Text>
        {sub ? <Text style={{ fontFamily: fonts.body, fontSize: 13.5, color: t.text3, marginTop: 2 }} numberOfLines={1}>{sub}</Text> : null}
      </View>
      {right ?? <ArrowButton onPress={onPress} size={40} />}
    </Pressable>
  );
}
