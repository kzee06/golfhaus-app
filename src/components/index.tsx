// Shared product components: score marks, round cards, course rows.

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { fonts, radius, shadow, useTheme } from '../theme';
import { Icon, ChevronRight } from '../Icon';
import { HoleResult, holeResult, fmtToPar, totals } from '../scoring';
import { CourseSummary, Round } from '../domain/types';

// Traditional scorecard notation, readable without colour:
// eagle+ = double circle, birdie = circle, par = plain, bogey = square,
// double+ = double square.
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

export function RoundCard({ round, onPress }: { round: Round; onPress: () => void }) {
  const t = useTheme();
  const me = round.players.find((p) => p.isMe) ?? round.players[0];
  const tot = me ? totals(round, me) : null;
  const d = new Date(round.startedAt);
  const date = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: radius.cardLg, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, opacity: pressed ? 0.85 : 1 }, shadow.cardSoft]}>
      <View style={{ width: 54, height: 54, borderRadius: 16, backgroundColor: t.surface, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 22, color: t.text, letterSpacing: -0.5 }}>{tot ? tot.strokes || '–' : '–'}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16.5, color: t.text }} numberOfLines={1}>{round.course.name}</Text>
        <Text style={{ fontFamily: fonts.body, fontSize: 13.5, color: t.text3, marginTop: 2 }} numberOfLines={1}>
          {date} · {round.holeCount} holes{round.players.length > 1 ? ` · ${round.players.length} players` : ''}{round.status === 'active' ? ' · In progress' : ''}
        </Text>
      </View>
      {tot && tot.holesPlayed > 0 && (
        <Text style={{ fontFamily: fonts.display, fontSize: 18, color: t.text }}>{fmtToPar(tot.toPar)}</Text>
      )}
      <ChevronRight size={20} color={t.ink30} />
    </Pressable>
  );
}

export function CourseRow({ c, onPress, right, units }: { c: CourseSummary; onPress: () => void; right?: React.ReactNode; units?: 'm' | 'yd' }) {
  const t = useTheme();
  const dist = c.distanceM != null ? (units === 'yd' ? `${(c.distanceM / 1609.344).toFixed(1)} mi` : `${(c.distanceM / 1000).toFixed(1)} km`) : null;
  const sub = [c.city, c.country, dist].filter(Boolean).join(' · ');
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13, opacity: pressed ? 0.7 : 1 })}>
      <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: t.surface, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="flag" size={18} color={t.text} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16, color: t.text }} numberOfLines={1}>{c.name}</Text>
        {sub ? <Text style={{ fontFamily: fonts.body, fontSize: 13.5, color: t.text3, marginTop: 2 }} numberOfLines={1}>{sub}</Text> : null}
      </View>
      {right ?? <ChevronRight size={20} color={t.ink30} />}
    </Pressable>
  );
}
