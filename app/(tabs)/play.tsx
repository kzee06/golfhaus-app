// Play — start a round, or jump straight back into the live one.
import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Pad, Header, Card, Button, Muted, SectionLabel } from '../../src/ui';
import { useApp, activeRound } from '../../src/data/AppState';
import { leaderboard, fmtToPar } from '../../src/scoring';
import { fonts, useTheme } from '../../src/theme';

export default function Play() {
  const router = useRouter();
  const t = useTheme();
  const { rounds, courses, favourites, recents } = useApp();
  const live = activeRound(rounds);
  const quick = [...recents, ...favourites].filter((id, i, a) => a.indexOf(id) === i).map((id) => courses[id]).filter(Boolean).slice(0, 4);

  return (
    <Screen>
      <Header eyebrow="Tee it up" title="Play" />
      {live ? (
        <Pad>
          <Card style={{ backgroundColor: t.gameplayBg, borderColor: t.gameplayBg }}>
            <Text style={{ fontFamily: fonts.displaySemi, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: t.gameplayFg, opacity: 0.6, marginBottom: 6 }}>In progress</Text>
            <Text style={{ fontFamily: fonts.display, fontSize: 24, color: t.gameplayFg, letterSpacing: -0.5 }} numberOfLines={1}>{live.course.name}</Text>
            <View style={{ marginTop: 12, gap: 6 }}>
              {leaderboard(live).map(({ player, t: tt, rank }) => (
                <View key={player.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontFamily: fonts.display, fontSize: 14, color: t.gameplayFg, opacity: 0.6, width: 18 }}>{tt.holesPlayed ? rank : '–'}</Text>
                  <Text style={{ flex: 1, fontFamily: fonts.bodySemi, fontSize: 15, color: t.gameplayFg }} numberOfLines={1}>{player.name}</Text>
                  <Text style={{ fontFamily: fonts.display, fontSize: 16, color: t.gameplayFg }}>{tt.holesPlayed ? `${tt.strokes} (${fmtToPar(tt.toPar)})` : '—'}</Text>
                </View>
              ))}
            </View>
            <View style={{ marginTop: 16 }}><Button label="Continue round" variant="secondary" onPress={() => router.push(`/round/${live.id}`)} /></View>
          </Card>
        </Pad>
      ) : (
        <Pad>
          <Button label="New round" onPress={() => router.push('/round/new')} />
          <Muted style={{ textAlign: 'center', marginTop: 12 }}>Pick a course, choose tees and players, and you're off — three taps.</Muted>
        </Pad>
      )}

      {quick.length > 0 && (
        <>
          <SectionLabel>Quick start</SectionLabel>
          <Pad style={{ gap: 10 }}>
            {quick.map((c) => (
              <Card key={c.id} soft onPress={() => router.push({ pathname: '/round/new', params: { courseId: c.id } })}>
                <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16.5, color: t.text }} numberOfLines={1}>{c.name}</Text>
                <Muted style={{ marginTop: 2 }}>{c.holes.length} holes{c.city ? ` · ${c.city}` : ''} · Tap to start</Muted>
              </Card>
            ))}
          </Pad>
        </>
      )}
    </Screen>
  );
}
