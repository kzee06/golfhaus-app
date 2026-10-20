// Play — the live round front and centre, or a hero to start one.
import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Pad, Header, GradientCard, ArrowButton, Card, Button, Muted, SectionLabel } from '../../src/ui';
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
      <Header eyebrow="Tee it up" title={live ? 'In progress' : 'Play'} />
      <Pad>
        {live ? (
          <GradientCard onPress={() => router.push(`/round/${live.id}`)}>
            <Text style={{ fontFamily: fonts.displaySemi, fontSize: 12, letterSpacing: 0.7, textTransform: 'uppercase', color: t.heroMuted }}>Live round</Text>
            <Text style={{ fontFamily: fonts.displayMed, fontSize: 26, color: t.heroFg, letterSpacing: -0.7, marginTop: 6 }} numberOfLines={1}>{live.course.name}</Text>
            <View style={{ marginTop: 14, gap: 8 }}>
              {leaderboard(live).map(({ player, t: tt, rank }) => (
                <View key={player.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontFamily: fonts.display, fontSize: 14, color: t.heroMuted, width: 18 }}>{tt.holesPlayed ? rank : '–'}</Text>
                  <Text style={{ flex: 1, fontFamily: fonts.bodySemi, fontSize: 15, color: t.heroFg }} numberOfLines={1}>{player.name}</Text>
                  <Text style={{ fontFamily: fonts.displayMed, fontSize: 16, color: t.heroFg }}>{tt.holesPlayed ? `${tt.strokes} (${fmtToPar(tt.toPar)})` : '—'}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
              <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16, color: t.heroFg }}>Continue round</Text>
              <ArrowButton color={t.heroFg} onPress={() => router.push(`/round/${live.id}`)} />
            </View>
          </GradientCard>
        ) : (
          <GradientCard onPress={() => router.push('/round/new')} style={{ minHeight: 220, justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: fonts.displaySemi, fontSize: 12, letterSpacing: 0.7, textTransform: 'uppercase', color: t.heroMuted }}>New round</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginTop: 40 }}>
              <Text style={{ flex: 1, fontFamily: fonts.displayMed, fontSize: 30, lineHeight: 34, letterSpacing: -0.9, color: t.heroFg }}>Course, tees,{'\n'}players — {'\n'}<Text style={{ fontFamily: fonts.display }}>three taps.</Text></Text>
              <ArrowButton color={t.heroFg} onPress={() => router.push('/round/new')} />
            </View>
          </GradientCard>
        )}
      </Pad>

      {quick.length > 0 && (
        <>
          <SectionLabel>Quick start</SectionLabel>
          <Pad style={{ gap: 10 }}>
            {quick.map((c) => (
              <Card key={c.id} soft onPress={() => router.push({ pathname: '/round/new', params: { courseId: c.id } })} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fonts.displaySemi, fontSize: 16.5, color: t.text }} numberOfLines={1}>{c.name}</Text>
                  <Muted style={{ marginTop: 2 }}>{c.holes.length} holes{c.city ? ` · ${c.city}` : ''}</Muted>
                </View>
                <ArrowButton size={42} onPress={() => router.push({ pathname: '/round/new', params: { courseId: c.id } })} />
              </Card>
            ))}
          </Pad>
        </>
      )}
      {!live && quick.length === 0 && (
        <Pad style={{ marginTop: 20 }}><Button label="Find a course" variant="secondary" onPress={() => router.push('/courses')} /></Pad>
      )}
    </Screen>
  );
}
