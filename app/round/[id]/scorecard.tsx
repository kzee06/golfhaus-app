// Scorecard — the traditional card, readable at a glance, with scoring marks
// that don't rely on colour.
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Pad, Muted } from '../../../src/ui';
import { ScoreMark } from '../../../src/components';
import { useApp } from '../../../src/data/AppState';
import { Round, RoundPlayer, holesInRound } from '../../../src/domain/types';
import { fmtToPar, parForHole, totals } from '../../../src/scoring';
import { ChevronLeft } from '../../../src/Icon';
import { fonts, radius, shadow, useTheme } from '../../../src/theme';

const CELL = 42;
const LABEL = 78;

export default function Scorecard() {
  const router = useRouter();
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { rounds } = useApp();
  const round = rounds.find((r) => r.id === id);
  if (!round) return <Screen><Pad><Muted>Round not found.</Muted></Pad></Screen>;

  const order = holesInRound(round);
  const front = order.filter((h) => h <= 9);
  const back = order.filter((h) => h > 9);
  const d = new Date(round.startedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <Screen>
      <Pad style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <ChevronLeft size={20} color={t.text2} /><Text style={{ fontFamily: fonts.body, fontSize: 15, color: t.text2 }}>Back</Text>
        </Pressable>
      </Pad>
      <Pad>
        <Text style={{ fontFamily: fonts.display, fontSize: 28, letterSpacing: -0.8, color: t.text }} numberOfLines={1}>{round.course.name}</Text>
        <Muted style={{ marginTop: 2 }}>{d}{round.course.teeName ? ` · ${round.course.teeName} tees` : ''} · {round.holeCount} holes</Muted>
      </Pad>

      {front.length > 0 && <Block round={round} holes={front} sumLabel="OUT" />}
      {back.length > 0 && <Block round={round} holes={back} sumLabel="IN" />}

      {/* totals */}
      <Pad style={{ marginTop: 16 }}>
        <View style={[{ backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: radius.card, padding: 14 }, shadow.cardSoft]}>
          {round.players.map((p, i) => {
            const tt = totals(round, p);
            return (
              <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 40, borderTopWidth: i ? 1 : 0, borderTopColor: t.border08 }}>
                <Text style={{ flex: 1, fontFamily: fonts.displaySemi, fontSize: 15.5, color: t.text }} numberOfLines={1}>{p.name}</Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 13, color: t.text3, marginRight: 14 }}>{tt.putts !== null ? `${tt.putts} putts` : ''}</Text>
                <Text style={{ fontFamily: fonts.display, fontSize: 20, color: t.text, width: 44, textAlign: 'right' }}>{tt.strokes || '–'}</Text>
                <Text style={{ fontFamily: fonts.displaySemi, fontSize: 15, color: t.text2, width: 44, textAlign: 'right' }}>{tt.holesPlayed ? fmtToPar(tt.toPar) : ''}</Text>
              </View>
            );
          })}
        </View>
        <Muted style={{ marginTop: 10, textAlign: 'center', fontSize: 12.5 }}>○ birdie  ◎ eagle  □ bogey  ▣ double or worse</Muted>
      </Pad>
    </Screen>
  );
}

function Block({ round, holes, sumLabel }: { round: Round; holes: number[]; sumLabel: string }) {
  const t = useTheme();
  const sum = (p: RoundPlayer) => holes.reduce((s, h) => s + (p.scores[h]?.strokes ?? 0), 0);
  const parSum = holes.reduce((s, h) => s + parForHole(round.course, h), 0);
  const Cell = ({ children, w = CELL, strong }: { children: React.ReactNode; w?: number; strong?: boolean }) => (
    <View style={{ width: w, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: strong ? t.fill06 : 'transparent' }}>{children}</View>
  );
  const Txt = ({ v, muted }: { v: string; muted?: boolean }) => <Text style={{ fontFamily: muted ? fonts.body : fonts.displaySemi, fontSize: 14, color: muted ? t.text3 : t.text, fontVariant: ['tabular-nums'] }}>{v}</Text>;

  return (
    <View style={{ marginTop: 16 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
        <View style={[{ backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: radius.card, overflow: 'hidden' }, shadow.cardSoft]}>
          {/* hole numbers */}
          <View style={{ flexDirection: 'row', backgroundColor: t.fill05 }}>
            <Cell w={LABEL}><Txt v="Hole" muted /></Cell>
            {holes.map((h) => <Cell key={h}><Txt v={String(h)} /></Cell>)}
            <Cell strong><Txt v={sumLabel} /></Cell>
          </View>
          {/* par */}
          <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: t.border08 }}>
            <Cell w={LABEL}><Txt v="Par" muted /></Cell>
            {holes.map((h) => <Cell key={h}><Txt v={String(parForHole(round.course, h))} muted /></Cell>)}
            <Cell strong><Txt v={String(parSum)} /></Cell>
          </View>
          {/* players */}
          {round.players.map((p) => (
            <View key={p.id} style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: t.border08 }}>
              <Cell w={LABEL}><Text style={{ fontFamily: fonts.displaySemi, fontSize: 13.5, color: t.text, paddingHorizontal: 8 }} numberOfLines={1}>{p.isMe ? 'You' : p.name}</Text></Cell>
              {holes.map((h) => {
                const s = p.scores[h]?.strokes;
                return <Cell key={h}>{s ? <ScoreMark strokes={s} par={parForHole(round.course, h)} size={32} /> : <Txt v="·" muted />}</Cell>;
              })}
              <Cell strong><Txt v={sum(p) ? String(sum(p)) : '–'} /></Cell>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
