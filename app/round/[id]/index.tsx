// Active round — the heart of GolfHaus. One screen to see the hole, the GPS
// distance to the green, and record every player's score in a couple of taps.
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Pad, Button, Chip, Stepper, Muted, GradientCard } from '../../../src/ui';
import { confirmAction } from '../../../src/ui/dialog';
import { useApp } from '../../../src/data/AppState';
import { Fairway, HoleScore, Round, holesInRound } from '../../../src/domain/types';
import { fmtToPar, leaderboard, nextUnscoredHole, parForHole, stamp, totals } from '../../../src/scoring';
import { distancesToGreen, fmtDistance, nearestHole, unitLabel } from '../../../src/gps/geo';
import { useLocation } from '../../../src/gps/useLocation';
import { ChevronLeft, ChevronRight } from '../../../src/Icon';
import { fonts, radius, shadow, useTheme, TAP } from '../../../src/theme';

export default function ActiveRound() {
  const router = useRouter();
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { rounds, courses, golfer, upsertRound } = useApp();
  const round = rounds.find((r) => r.id === id);
  const course = round ? courses[round.course.courseId] : undefined;
  const me = round?.players.find((p) => p.isMe) ?? round?.players[0];

  const order = useMemo(() => (round ? holesInRound(round) : []), [round]);
  const [hole, setHole] = useState<number>(() => (round && me ? nextUnscoredHole(round, me) : 1));
  const [details, setDetails] = useState(false);

  const { pos, accuracyM, status } = useLocation(true);

  if (!round || !me) {
    return <Screen><Pad><Muted>Round not found.</Muted><Button label="Home" size="md" onPress={() => router.replace('/')} style={{ marginTop: 14 }} /></Pad></Screen>;
  }

  const idx = order.indexOf(hole);
  const par = parForHole(round.course, hole);
  const snap = round.course.holes.find((h) => h.number === hole);
  const geom = course?.holes.find((h) => h.number === hole)?.geometry;
  const dist = pos ? distancesToGreen(pos, geom) : null;
  const gpsHole = pos && course ? nearestHole(pos, course.holes) : null;
  const isLast = idx === order.length - 1;

  const update = (fn: (r: Round) => Round) => {
    const next = fn(round);
    upsertRound({ ...next, updatedAt: new Date().toISOString(), revision: round.revision + 1 });
  };

  const setScore = (playerId: string, patch: Partial<HoleScore>) =>
    update((r) => ({
      ...r,
      players: r.players.map((p) => {
        if (p.id !== playerId) return p;
        const prev = p.scores[hole] ?? { strokes: par, updatedAt: '' };
        return { ...p, scores: { ...p.scores, [hole]: stamp({ ...prev, ...patch, by: me.id }) } };
      }),
    }));

  // Moving on confirms par for anyone not yet scored on this hole — one tap per hole.
  const confirmUnscored = () => {
    const missing = round.players.filter((p) => !p.scores[hole]?.strokes);
    if (missing.length === 0) return;
    update((r) => ({ ...r, players: r.players.map((p) => (p.scores[hole]?.strokes ? p : { ...p, scores: { ...p.scores, [hole]: stamp({ strokes: par, by: me.id }) } })) }));
  };

  const go = (n: number) => { confirmUnscored(); setHole(n); setDetails(false); };
  const next = () => (isLast ? finish() : go(order[idx + 1]));
  const prev = () => { if (idx > 0) go(order[idx - 1]); };
  const finish = () => { confirmUnscored(); router.push(`/round/${round.id}/summary`); };

  const end = () => confirmAction({ title: 'Leave this round?', message: 'Your scores are saved. You can pick it up again from Home.', confirmLabel: 'Leave', onConfirm: () => router.replace('/') });

  const meScore = me.scores[hole];
  const myTotals = totals(round, me);
  const multi = round.players.length > 1;
  const lb = multi ? leaderboard(round) : [];

  return (
    <Screen padBottom={40}>
      {/* top bar */}
      <Pad style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Pressable onPress={end} hitSlop={10} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 40 }}>
          <ChevronLeft size={20} color={t.text2} /><Text style={{ fontFamily: fonts.body, fontSize: 15, color: t.text2 }}>End</Text>
        </Pressable>
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 13, letterSpacing: 0.4, color: t.text3 }} numberOfLines={1}>{round.course.name}</Text>
        <Pressable onPress={() => router.push(`/round/${round.id}/scorecard`)} hitSlop={10} style={{ minHeight: 40, justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 15, color: t.text }}>Scorecard</Text>
        </Pressable>
      </Pad>

      {/* hole header with prev/next */}
      <Pad style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable onPress={prev} disabled={idx === 0} hitSlop={8} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: t.card, borderWidth: 1, borderColor: t.border12, alignItems: 'center', justifyContent: 'center', opacity: idx === 0 ? 0.35 : 1 }}><ChevronLeft size={22} color={t.text} /></Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 34, letterSpacing: -1, color: t.text }}>Hole {hole}</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 15, color: t.text2, marginTop: 2 }}>
            Par {par}{snap?.distanceM ? ` · ${fmtDistance(snap.distanceM, golfer.units)} ${unitLabel(golfer.units)}` : ''}{snap?.strokeIndex ? ` · SI ${snap.strokeIndex}` : ''}
          </Text>
        </View>
        <Pressable onPress={() => (isLast ? finish() : go(order[idx + 1]))} hitSlop={8} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: t.card, borderWidth: 1, borderColor: t.border12, alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={22} color={t.text} /></Pressable>
      </Pad>

      {/* GPS card */}
      <Pad style={{ marginTop: 16 }}>
        <GradientCard style={{ padding: 18 }}>
          {dist ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <Dist label="Front" v={fmtDistance(dist.front, golfer.units)} fg={t.heroFg} />
                <Dist label="Middle" v={fmtDistance(dist.middle, golfer.units)} fg={t.heroFg} big />
                <Dist label="Back" v={fmtDistance(dist.back, golfer.units)} fg={t.heroFg} />
              </View>
              <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: t.heroMuted, marginTop: 10, textAlign: 'center' }}>
                {unitLabel(golfer.units)} to the green · GPS ±{accuracyM ? Math.round(accuracyM) : '–'} m · pin position not known
              </Text>
            </>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 6 }}>
              <Text style={{ fontFamily: fonts.displaySemi, fontSize: 15, color: t.heroFg }}>
                {status === 'denied' ? 'Location access is off' : status === 'requesting' ? 'Finding your position…' : !geom?.green ? 'No GPS data for this hole yet' : 'Waiting for GPS…'}
              </Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 13, color: t.heroMuted, marginTop: 4, textAlign: 'center' }}>
                {status === 'denied' ? 'Enable location in Settings to see distances.' : !geom?.green ? 'Distances appear where the green is mapped. Scoring works regardless.' : 'Distances to the green will appear here.'}
              </Text>
            </View>
          )}
        </GradientCard>
        {gpsHole != null && gpsHole !== hole && (
          <View style={{ marginTop: 10, alignItems: 'center' }}>
            <Chip label={`GPS says you're at hole ${gpsHole}`} sub="Go there" onPress={() => go(gpsHole)} />
          </View>
        )}
      </Pad>

      {/* scoring */}
      <Pad style={{ marginTop: 22 }}>
        {round.players.map((p) => {
          const s = p.scores[hole];
          const v = s?.strokes ?? par;
          const big = !multi;
          return (
            <View key={p.id} style={{ marginBottom: multi ? 14 : 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: big ? 10 : 6 }}>
                <Text style={{ fontFamily: fonts.displaySemi, fontSize: big ? 15 : 15.5, color: t.text2 }}>{p.isMe ? 'Your score' : p.name}</Text>
                {!s?.strokes && <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: t.text4 }}>defaults to par</Text>}
              </View>
              <View style={{ alignItems: big ? 'center' : 'flex-start' }}>
                <Stepper value={v} onChange={(n) => setScore(p.id, { strokes: n })} size={big ? 68 : 50} />
              </View>
            </View>
          );
        })}
      </Pad>

      {/* optional stats for me */}
      <Pad style={{ marginTop: 18 }}>
        <Pressable onPress={() => setDetails((d) => !d)} style={{ minHeight: 40, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14.5, color: t.text3 }}>{details ? 'Hide details' : 'Putts, fairway & more'}</Text>
        </Pressable>
        {details && (
          <View style={{ marginTop: 6, gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: fonts.displaySemi, fontSize: 15, color: t.text }}>Putts</Text>
              <Stepper value={meScore?.putts ?? 2} onChange={(n) => setScore(me.id, { putts: n })} min={0} max={8} size={44} />
            </View>
            {par > 3 && (
              <View>
                <Text style={{ fontFamily: fonts.displaySemi, fontSize: 15, color: t.text, marginBottom: 8 }}>Fairway</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {(['left', 'hit', 'right'] as Fairway[]).map((f) => <Chip key={f} label={f === 'hit' ? 'Hit' : f === 'left' ? 'Missed left' : 'Missed right'} on={meScore?.fairway === f} onPress={() => setScore(me.id, { fairway: f })} />)}
                </View>
              </View>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: fonts.displaySemi, fontSize: 15, color: t.text }}>Green in regulation</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Chip label="Yes" on={meScore?.gir === true} onPress={() => setScore(me.id, { gir: true })} />
                <Chip label="No" on={meScore?.gir === false} onPress={() => setScore(me.id, { gir: false })} />
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: fonts.displaySemi, fontSize: 15, color: t.text }}>Penalties</Text>
              <Stepper value={meScore?.penalties ?? 0} onChange={(n) => setScore(me.id, { penalties: n })} min={0} max={5} size={44} />
            </View>
          </View>
        )}
      </Pad>

      {/* running totals / leaderboard */}
      <Pad style={{ marginTop: 22 }}>
        {multi ? (
          <View style={[{ backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: radius.card, paddingVertical: 6, paddingHorizontal: 14 }, shadow.cardSoft]}>
            {lb.map(({ player, t: tt, rank }, i) => (
              <View key={player.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 40, borderTopWidth: i ? 1 : 0, borderTopColor: t.border08 }}>
                <Text style={{ width: 18, fontFamily: fonts.display, fontSize: 14, color: t.text3 }}>{tt.holesPlayed ? rank : '–'}</Text>
                <Text style={{ flex: 1, fontFamily: fonts.bodySemi, fontSize: 15, color: t.text }} numberOfLines={1}>{player.name}</Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 13, color: t.text3 }}>thru {tt.holesPlayed}</Text>
                <Text style={{ width: 44, textAlign: 'right', fontFamily: fonts.display, fontSize: 16, color: t.text }}>{tt.holesPlayed ? fmtToPar(tt.toPar) : '—'}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 22 }}>
            <Mini label="Thru" v={String(myTotals.holesPlayed)} />
            <Mini label="Strokes" v={String(myTotals.strokes)} />
            <Mini label="To par" v={myTotals.holesPlayed ? fmtToPar(myTotals.toPar) : '—'} />
          </View>
        )}
      </Pad>

      <Pad style={{ marginTop: 24 }}>
        <Button label={isLast ? 'Finish round' : `Next · Hole ${order[idx + 1]}`} onPress={next} />
      </Pad>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 24, paddingTop: 16 }}>
        {order.map((h) => {
          const done = !!me.scores[h]?.strokes;
          const cur = h === hole;
          return (
            <Pressable key={h} onPress={() => go(h)} style={{ width: 36, height: TAP - 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: cur ? t.ink : done ? t.fill10 : t.card, borderWidth: 1, borderColor: cur ? t.ink : t.border12 }}>
              <Text style={{ fontFamily: fonts.displaySemi, fontSize: 13, color: cur ? t.onInk : t.text }}>{h}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

function Dist({ label, v, fg, big }: { label: string; v: string; fg: string; big?: boolean }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontFamily: fonts.display, fontSize: big ? 64 : 34, color: fg, letterSpacing: big ? -2.5 : -1, fontVariant: ['tabular-nums'], lineHeight: big ? 68 : 40 }}>{v}</Text>
      <Text style={{ fontFamily: fonts.displaySemi, fontSize: 11.5, letterSpacing: 0.6, textTransform: 'uppercase', color: fg, opacity: 0.6, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function Mini({ label, v }: { label: string; v: string }) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontFamily: fonts.display, fontSize: 22, color: t.text }}>{v}</Text>
      <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: t.text3 }}>{label}</Text>
    </View>
  );
}
