// Home — airy greeting, a big numeral, quick-action chips, a photographic hero
// to start or resume a round, and recent rounds.
import React, { useState } from 'react';
import { Image, ScrollView, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Screen, Pad, Header, SectionLabel, Card, Button, BigStat, GradientCard, ArrowButton, Chip, Empty, Muted } from '../../src/ui';
import { RoundCard } from '../../src/components';
import { useApp, activeRound } from '../../src/data/AppState';
import { careerStats, fmtToPar, totals } from '../../src/scoring';
import { fonts, useTheme } from '../../src/theme';

const HERO = require('../../assets/drills/golf-hero.webp');

export default function Home() {
  const router = useRouter();
  const t = useTheme();
  const { golfer, setGolfer, rounds } = useApp();
  const live = activeRound(rounds);
  const stats = careerStats(rounds);
  const recent = rounds.filter((r) => r.status === 'complete').slice(0, 3);
  const [name, setName] = useState('');
  const liveMe = live ? (live.players.find((p) => p.isMe) ?? live.players[0]) : null;
  const liveT = live && liveMe ? totals(live, liveMe) : null;

  return (
    <Screen>
      <Header eyebrow={golfer.name ? `Hello ${golfer.name.split(' ')[0]}` : 'Hello'} title={live ? 'Round in progress' : 'Ready to play'} />

      {!golfer.name && (
        <Pad style={{ marginBottom: 20 }}>
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

      {/* big numeral */}
      {live && liveT ? (
        <BigStat value={String(liveT.holesPlayed)} label={`of ${live.holeCount} holes played`} sub={liveT.holesPlayed ? `${liveT.strokes} strokes · ${fmtToPar(liveT.toPar)}` : 'No scores yet'} />
      ) : (
        <BigStat value={String(stats.rounds)} label={stats.rounds === 1 ? 'Round played' : 'Rounds played'} sub={stats.best ? `Best ${stats.best.strokes} (${fmtToPar(stats.best.toPar)})` : 'Your history starts with the first round'} />
      )}

      {/* quick actions */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 24, paddingTop: 22 }}>
        <Chip label={live ? 'Resume round' : 'New round'} onPress={() => router.push(live ? `/round/${live.id}` : '/round/new')} />
        <Chip label="Find a course" onPress={() => router.push('/courses')} />
        <Chip label="Your stats" onPress={() => router.push('/profile')} />
      </ScrollView>

      {/* hero */}
      <Pad style={{ marginTop: 22 }}>
        <GradientCard onPress={() => router.push(live ? `/round/${live.id}` : '/round/new')} style={{ minHeight: 300, padding: 0 }}>
          <Image source={HERO} resizeMode="cover" style={{ position: 'absolute', top: 0, right: -20, width: '85%', height: '100%', opacity: 0.55 }} />
          <LinearGradient colors={[t.heroGradient[0] + '00', t.heroGradient[0]]} start={{ x: 0.5, y: 0.1 }} end={{ x: 0.5, y: 0.95 }} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
          <LinearGradient colors={[t.heroGradient[0], t.heroGradient[0] + '00']} start={{ x: 0, y: 0.5 }} end={{ x: 0.9, y: 0.5 }} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '70%' }} />
          <View style={{ padding: 22, flex: 1, justifyContent: 'space-between', minHeight: 300 }}>
            <View>
              <Text style={{ fontFamily: fonts.displaySemi, fontSize: 15, color: t.heroFg }}>{live ? live.course.name : 'Pick a course'}</Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 13, color: t.heroMuted, marginTop: 2 }}>{live ? `${live.holeCount} holes · ${live.players.length} ${live.players.length === 1 ? 'player' : 'players'}` : 'GPS distances · live leaderboard · one-tap scoring'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
              <Text style={{ flex: 1, fontFamily: fonts.displayMed, fontSize: 30, lineHeight: 34, letterSpacing: -0.9, color: t.heroFg }}>
                {live ? 'Back to the\ncourse.' : 'Tee it up,\nkeep score,'}{'\n'}<Text style={{ fontFamily: fonts.display }}>{live ? 'Resume round.' : 'share the round.'}</Text>
              </Text>
              <ArrowButton color={t.heroFg} onPress={() => router.push(live ? `/round/${live.id}` : '/round/new')} />
            </View>
          </View>
        </GradientCard>
      </Pad>

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
