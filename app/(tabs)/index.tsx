// Home — personal dashboard: resume a round, quick start, recent rounds, stats.
import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Pad, Header, SectionLabel, Card, Button, StatTile, Empty, Muted } from '../../src/ui';
import { RoundCard } from '../../src/components';
import { useApp, activeRound } from '../../src/data/AppState';
import { careerStats, fmtToPar, totals } from '../../src/scoring';
import { fonts, useTheme } from '../../src/theme';

export default function Home() {
  const router = useRouter();
  const t = useTheme();
  const { golfer, setGolfer, rounds } = useApp();
  const live = activeRound(rounds);
  const stats = careerStats(rounds);
  const recent = rounds.filter((r) => r.status === 'complete').slice(0, 3);
  const [name, setName] = useState('');

  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <Screen>
      <Header eyebrow={golfer.name ? `${greeting}, ${golfer.name.split(' ')[0]}` : greeting} title="GolfHaus" />

      {!golfer.name && (
        <Pad>
          <Card>
            <Text style={{ fontFamily: fonts.display, fontSize: 18, color: t.text, marginBottom: 4 }}>What should we call you?</Text>
            <Muted style={{ marginBottom: 12 }}>Your name appears on scorecards and leaderboards.</Muted>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={t.text4} autoCapitalize="words" style={{ flex: 1, height: 48, borderWidth: 1, borderColor: t.border12, borderRadius: 14, paddingHorizontal: 14, fontFamily: fonts.body, fontSize: 16, color: t.text, backgroundColor: t.card }} />
              <Button label="Save" size="md" disabled={!name.trim()} onPress={() => setGolfer((g) => ({ ...g, name: name.trim(), createdAt: g.createdAt || new Date().toISOString() }))} style={{ height: 48 }} />
            </View>
          </Card>
        </Pad>
      )}

      {live ? (
        <Pad style={{ marginTop: golfer.name ? 0 : 14 }}>
          <Card onPress={() => router.push(`/round/${live.id}`)} style={{ backgroundColor: t.gameplayBg, borderColor: t.gameplayBg }}>
            <Text style={{ fontFamily: fonts.displaySemi, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: t.gameplayFg, opacity: 0.6, marginBottom: 6 }}>Round in progress</Text>
            <Text style={{ fontFamily: fonts.display, fontSize: 22, color: t.gameplayFg, letterSpacing: -0.5 }} numberOfLines={1}>{live.course.name}</Text>
            {(() => { const me = live.players.find((p) => p.isMe) ?? live.players[0]; const tt = me ? totals(live, me) : null; return tt ? (
              <Text style={{ fontFamily: fonts.body, fontSize: 14.5, color: t.gameplayFg, opacity: 0.75, marginTop: 4 }}>{tt.holesPlayed} of {live.holeCount} holes · {tt.strokes} ({fmtToPar(tt.toPar)})</Text>
            ) : null; })()}
            <View style={{ marginTop: 14 }}><Button label="Resume round" variant="secondary" size="md" onPress={() => router.push(`/round/${live.id}`)} /></View>
          </Card>
        </Pad>
      ) : (
        <Pad style={{ marginTop: golfer.name ? 0 : 14 }}>
          <Button label="Start a round" onPress={() => router.push('/round/new')} />
        </Pad>
      )}

      {stats.rounds > 0 && (
        <>
          <SectionLabel>Your game</SectionLabel>
          <Pad style={{ flexDirection: 'row', gap: 12 }}>
            <StatTile label="Rounds" value={String(stats.rounds)} />
            <StatTile label="Avg score (18)" value={stats.avgScore18 != null ? String(stats.avgScore18) : '–'} />
            <StatTile label="Best" value={stats.best ? String(stats.best.strokes) : '–'} unit={stats.best ? fmtToPar(stats.best.toPar) : undefined} />
          </Pad>
        </>
      )}

      <SectionLabel>Recent rounds</SectionLabel>
      {recent.length === 0 ? (
        <Empty title="No rounds yet" body="Start a round and your scores, stats and history build from here." />
      ) : (
        <Pad style={{ gap: 10 }}>
          {recent.map((r) => <RoundCard key={r.id} round={r} onPress={() => router.push(`/round/${r.id}/summary`)} />)}
        </Pad>
      )}
    </Screen>
  );
}
