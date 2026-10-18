// Round summary — finish the round, review it, share it, keep it forever.
import React from 'react';
import { Alert, Pressable, Share, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Pad, Button, Card, Muted, SectionLabel, StatTile } from '../../../src/ui';
import { useApp } from '../../../src/data/AppState';
import { fmtToPar, isComplete, leaderboard, totals, RESULT_LABEL, HoleResult } from '../../../src/scoring';
import { ChevronLeft } from '../../../src/Icon';
import { fonts, radius, shadow, useTheme } from '../../../src/theme';

const HIGHLIGHTS: HoleResult[] = ['ace', 'albatross', 'eagle', 'birdie', 'par', 'bogey', 'double', 'triple+'];

export default function Summary() {
  const router = useRouter();
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { rounds, upsertRound, deleteRound } = useApp();
  const round = rounds.find((r) => r.id === id);
  if (!round) return <Screen><Pad><Muted>Round not found.</Muted></Pad></Screen>;

  const me = round.players.find((p) => p.isMe) ?? round.players[0];
  const tt = totals(round, me);
  const done = isComplete(round, me);
  const date = new Date(round.startedAt).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  const lb = leaderboard(round);

  const finish = () => {
    const now = new Date().toISOString();
    upsertRound({ ...round, status: 'complete', completedAt: now, updatedAt: now, revision: round.revision + 1 });
    router.replace('/');
  };

  const share = async () => {
    const lines = [
      `${round.course.name} — ${date}`,
      `${tt.strokes} (${fmtToPar(tt.toPar)}) over ${tt.holesPlayed} holes`,
      [tt.counts.eagle ? `${tt.counts.eagle} eagle` : null, tt.counts.birdie ? `${tt.counts.birdie} birdie${tt.counts.birdie > 1 ? 's' : ''}` : null, tt.counts.par ? `${tt.counts.par} pars` : null].filter(Boolean).join(' · '),
      round.players.length > 1 ? `With ${round.players.filter((p) => !p.isMe).map((p) => p.name).join(', ')}` : null,
      'Tracked with GolfHaus',
    ].filter(Boolean).join('\n');
    try { await Share.share({ message: lines }); } catch { /* user cancelled */ }
  };

  const remove = () => Alert.alert('Delete this round?', 'This can\'t be undone.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: () => { deleteRound(round.id); router.replace('/'); } },
  ]);

  return (
    <Screen>
      <Pad style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <Pressable onPress={() => (round.status === 'active' ? router.back() : router.replace('/'))} hitSlop={10} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <ChevronLeft size={20} color={t.text2} /><Text style={{ fontFamily: fonts.body, fontSize: 15, color: t.text2 }}>{round.status === 'active' ? 'Back to scoring' : 'Home'}</Text>
        </Pressable>
        <Pressable onPress={() => router.push(`/round/${round.id}/scorecard`)} hitSlop={10}><Text style={{ fontFamily: fonts.bodySemi, fontSize: 15, color: t.text }}>Scorecard</Text></Pressable>
      </Pad>

      {/* hero card — the shareable moment */}
      <Pad>
        <View style={[{ backgroundColor: t.gameplayBg, borderRadius: radius.cardLg, padding: 22 }, shadow.card]}>
          <Text style={{ fontFamily: fonts.displaySemi, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: t.gameplayFg, opacity: 0.6 }}>{round.status === 'active' ? 'Round summary' : 'Completed round'}</Text>
          <Text style={{ fontFamily: fonts.display, fontSize: 24, color: t.gameplayFg, letterSpacing: -0.6, marginTop: 6 }} numberOfLines={2}>{round.course.name}</Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 14, color: t.gameplayFg, opacity: 0.7, marginTop: 2 }}>{date}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginTop: 18 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 72, color: t.gameplayFg, letterSpacing: -3, lineHeight: 74 }}>{tt.strokes || '–'}</Text>
            <View style={{ paddingBottom: 12 }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 26, color: t.gameplayFg, letterSpacing: -0.6 }}>{tt.holesPlayed ? fmtToPar(tt.toPar) : ''}</Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 13.5, color: t.gameplayFg, opacity: 0.7 }}>{tt.holesPlayed} of {round.holeCount} holes</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            {HIGHLIGHTS.filter((k) => tt.counts[k] > 0).map((k) => (
              <Text key={k} style={{ fontFamily: fonts.displaySemi, fontSize: 12.5, color: t.gameplayBg, backgroundColor: t.gameplayFg, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 9, overflow: 'hidden' }}>{tt.counts[k]} {RESULT_LABEL[k]}{tt.counts[k] > 1 && k !== 'triple+' ? 's' : ''}</Text>
            ))}
          </View>
        </View>
      </Pad>

      {round.players.length > 1 && (
        <>
          <SectionLabel>Leaderboard</SectionLabel>
          <Pad>
            <Card soft style={{ paddingVertical: 4 }}>
              {lb.map(({ player, t: pt, rank }, i) => (
                <View key={player.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 46, borderTopWidth: i ? 1 : 0, borderTopColor: t.border08 }}>
                  <Text style={{ width: 22, fontFamily: fonts.display, fontSize: 16, color: t.text3 }}>{pt.holesPlayed ? rank : '–'}</Text>
                  <Text style={{ flex: 1, fontFamily: fonts.displaySemi, fontSize: 15.5, color: t.text }} numberOfLines={1}>{player.name}</Text>
                  <Text style={{ fontFamily: fonts.display, fontSize: 17, color: t.text }}>{pt.strokes || '–'}</Text>
                  <Text style={{ width: 40, textAlign: 'right', fontFamily: fonts.displaySemi, fontSize: 14, color: t.text2 }}>{pt.holesPlayed ? fmtToPar(pt.toPar) : ''}</Text>
                </View>
              ))}
            </Card>
          </Pad>
        </>
      )}

      {(tt.putts !== null || round.holeCount === 18) && (
        <>
          <SectionLabel>Stats</SectionLabel>
          <Pad style={{ flexDirection: 'row', gap: 12 }}>
            {round.holeCount === 18 && tt.holesPlayed > 9 && <StatTile label="Front · Back" value={`${tt.front} · ${tt.back}`} />}
            {tt.putts !== null && <StatTile label="Putts" value={String(tt.putts)} unit={`${(tt.putts / Math.max(1, tt.holesPlayed)).toFixed(1)}/hole`} />}
          </Pad>
        </>
      )}

      <Pad style={{ marginTop: 26, gap: 10 }}>
        {round.status === 'active' ? (
          <>
            <Button label={done ? 'Finish & save round' : 'Finish round anyway'} onPress={finish} />
            {!done && <Muted style={{ textAlign: 'center' }}>{round.holeCount - tt.holesPlayed} hole{round.holeCount - tt.holesPlayed === 1 ? '' : 's'} not yet scored.</Muted>}
          </>
        ) : (
          <Button label="Share this round" onPress={share} />
        )}
        {round.status === 'active' && <Button label="Share" variant="secondary" onPress={share} />}
        <Button label="Delete round" variant="ghost" size="md" onPress={remove} />
      </Pad>
    </Screen>
  );
}
